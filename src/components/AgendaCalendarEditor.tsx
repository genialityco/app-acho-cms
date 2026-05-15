import React, { useState, useMemo } from "react";
import {
  Tabs,
  Stack,
  Group,
  Text,
  Button,
  Modal,
  TextInput,
  Select,
  MultiSelect,
  Box,
  Divider,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import dayjs from "dayjs";

// ─── Calendar grid constants ─────────────────────────────────────────────────
const HOUR_PX = 64;   // pixels per hour
const START_HOUR = 7;
const END_HOUR = 19;
const TOTAL_HOURS = END_HOUR - START_HOUR; // 12
const TIME_COL_W = 56; // px width of the left time-label column

// ─── Types ───────────────────────────────────────────────────────────────────
type EventType = "WEBINAR" | "SEMINARIO" | "CONGRESO" | "SIMPOSIO" | "CURSO" | "OTRO";

const EVENT_TYPE_OPTIONS = [
  { value: "WEBINAR", label: "Webinar" },
  { value: "SEMINARIO", label: "Seminario" },
  { value: "CONGRESO", label: "Congreso" },
  { value: "SIMPOSIO", label: "Simposio" },
  { value: "CURSO", label: "Curso" },
  { value: "OTRO", label: "Otro" },
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTH_NAMES_FULL = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DAY_NAMES_FULL = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function formatShort(d: dayjs.Dayjs) {
  return `${DAY_NAMES[d.day()]} ${d.date()}/${MONTH_NAMES[d.month()]}`;
}
function formatFull(d: dayjs.Dayjs) {
  return `${DAY_NAMES_FULL[d.day()]}, ${d.date()} de ${MONTH_NAMES_FULL[d.month()]} de ${d.year()}`;
}

interface SubSession {
  title: string;
  startDateTime: string;
  endDateTime: string;
  speakers: any[];
  room: string;
  moduleId: string | null;
}

interface Session {
  title: string;
  type: EventType;
  startDateTime: string;
  endDateTime: string;
  speakers: any[];
  room: string;
  moduleId: string | null;
  subSessions: SubSession[];
}

interface SubFormState {
  title: string;
  startTime: string;
  endTime: string;
  room: string;
  moduleId: string | null;
  speakerIds: string[];
}

interface SessionFormState {
  title: string;
  type: EventType;
  startTime: string;
  endTime: string;
  room: string;
  moduleId: string | null;
  speakerIds: string[];
  subSessions: SubFormState[];
}

export interface AgendaCalendarEditorProps {
  eventStartDate: Date | null;
  eventEndDate: Date | null;
  sessions: Session[];
  onChange: (sessions: Session[]) => void;
  speakerOptions: { value: string; label: string }[];
  moduleOptions: { value: string; label: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, "0"); }
function padTime(h: number, m: number) { return `${pad(h)}:${pad(m)}`; }
function timeToMin(t: string): number { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

function getDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cur = dayjs(start).startOf("day");
  const last = dayjs(end).startOf("day");
  while (!cur.isAfter(last)) {
    days.push(cur.toDate());
    cur = cur.add(1, "day");
  }
  return days;
}

function speakerIdsFromSession(speakers: any[]): string[] {
  return (speakers || []).map((s) => (typeof s === "string" ? s : s?._id)).filter(Boolean);
}

/** Assign non-overlapping column indices to sessions (greedy, like Google Calendar). */
function layoutSessions(items: Array<{ session: Session; idx: number }>) {
  if (items.length === 0) return [];
  const sorted = [...items].sort(
    (a, b) => dayjs(a.session.startDateTime).valueOf() - dayjs(b.session.startDateTime).valueOf()
  );
  const colEnds: number[] = [];
  const withCols = sorted.map((item) => {
    const start = dayjs(item.session.startDateTime).valueOf();
    const end = dayjs(item.session.endDateTime).valueOf();
    let col = colEnds.findIndex((e) => e <= start);
    if (col === -1) col = colEnds.length;
    colEnds[col] = end;
    return { ...item, col };
  });
  return withCols.map((item) => ({ ...item, totalCols: colEnds.length }));
}

/** Minutes from midnight for a dayjs value */
function toMin(d: dayjs.Dayjs) { return d.hour() * 60 + d.minute(); }

/** Top offset in pixels for a given minute-from-midnight */
function minuteToTop(min: number) { return (min - START_HOUR * 60) * HOUR_PX / 60; }

// ─── Form conversion helpers ──────────────────────────────────────────────────
function sessionToForm(s: Session): SessionFormState {
  return {
    title: s.title || "",
    type: s.type || "OTRO",
    startTime: dayjs(s.startDateTime).format("HH:mm"),
    endTime: dayjs(s.endDateTime).format("HH:mm"),
    room: s.room || "",
    moduleId: s.moduleId || null,
    speakerIds: speakerIdsFromSession(s.speakers),
    subSessions: (s.subSessions || []).map((sub) => ({
      title: sub.title || "",
      startTime: dayjs(sub.startDateTime).format("HH:mm"),
      endTime: dayjs(sub.endDateTime).format("HH:mm"),
      room: sub.room || "",
      moduleId: sub.moduleId || null,
      speakerIds: speakerIdsFromSession(sub.speakers),
    })),
  };
}

function formToSession(form: SessionFormState, day: Date): Session {
  const dayStr = dayjs(day).format("YYYY-MM-DD");
  const [sh, sm] = form.startTime.split(":").map(Number);
  const [eh, em] = form.endTime.split(":").map(Number);
  return {
    title: form.title,
    type: form.type,
    startDateTime: dayjs(dayStr).hour(sh).minute(sm).second(0).millisecond(0).toISOString(),
    endDateTime: dayjs(dayStr).hour(eh).minute(em).second(0).millisecond(0).toISOString(),
    speakers: form.speakerIds.map((id) => ({ _id: id })),
    room: form.room,
    moduleId: form.moduleId,
    subSessions: form.subSessions.map((sub) => {
      const [ssh, ssm] = sub.startTime.split(":").map(Number);
      const [seh, sem] = sub.endTime.split(":").map(Number);
      return {
        title: sub.title,
        startDateTime: dayjs(dayStr).hour(ssh).minute(ssm).second(0).millisecond(0).toISOString(),
        endDateTime: dayjs(dayStr).hour(seh).minute(sem).second(0).millisecond(0).toISOString(),
        speakers: sub.speakerIds.map((id) => ({ _id: id })),
        room: sub.room,
        moduleId: sub.moduleId,
      };
    }),
  };
}

const EMPTY_FORM: SessionFormState = {
  title: "", type: "OTRO", startTime: "08:00", endTime: "09:00",
  room: "", moduleId: null, speakerIds: [], subSessions: [],
};
const EMPTY_SUB: SubFormState = {
  title: "", startTime: "08:00", endTime: "09:00",
  room: "", moduleId: null, speakerIds: [],
};

// ─── Component ────────────────────────────────────────────────────────────────
export const AgendaCalendarEditor: React.FC<AgendaCalendarEditorProps> = ({
  eventStartDate,
  eventEndDate,
  sessions,
  onChange,
  speakerOptions,
  moduleOptions,
}) => {
  const [activeTab, setActiveTab] = useState<string | null>("0");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<SessionFormState>(EMPTY_FORM);
  const [slotDay, setSlotDay] = useState<Date | null>(null);

  // Days = event date range + any day that already has sessions
  const days = useMemo(() => {
    const daySet = new Set<string>();
    if (eventStartDate && eventEndDate) {
      getDays(eventStartDate, eventEndDate).forEach((d) =>
        daySet.add(dayjs(d).format("YYYY-MM-DD"))
      );
    }
    sessions.forEach((s) => {
      if (s.startDateTime) daySet.add(dayjs(s.startDateTime).format("YYYY-MM-DD"));
    });
    return Array.from(daySet).sort().map((str) => dayjs(str).toDate());
  }, [eventStartDate, eventEndDate, sessions]);

  const sessionsByDay = useMemo(() => {
    const map: Record<string, Array<{ session: Session; idx: number }>> = {};
    sessions.forEach((s, i) => {
      const key = dayjs(s.startDateTime).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push({ session: s, idx: i });
    });
    return map;
  }, [sessions]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openAdd = (day: Date, hour: number, minute: number) => {
    const nextMin = minute + 30;
    const endH = nextMin >= 60 ? hour + 1 : hour;
    const endM = nextMin >= 60 ? 0 : nextMin;
    setSlotDay(day);
    setEditingIndex(null);
    setForm({ ...EMPTY_FORM, startTime: padTime(hour, minute), endTime: endH > 19 ? "19:00" : padTime(endH, endM) });
    setModalOpen(true);
  };

  const openEdit = (globalIdx: number) => {
    const s = sessions[globalIdx];
    setSlotDay(dayjs(s.startDateTime).toDate());
    setEditingIndex(globalIdx);
    setForm(sessionToForm(s));
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!slotDay || !form.title.trim()) return;
    const parentStart = timeToMin(form.startTime);
    const parentEnd   = timeToMin(form.endTime);
    const hasSubError = form.subSessions.some(
      (sub) => timeToMin(sub.startTime) < parentStart || timeToMin(sub.endTime) > parentEnd
    );
    if (hasSubError) return;
    const built = formToSession(form, slotDay);
    const updated = [...sessions];
    if (editingIndex !== null) updated[editingIndex] = built;
    else updated.push(built);
    onChange(updated);
    setModalOpen(false);
  };

  const handleDelete = (globalIdx: number) => onChange(sessions.filter((_, i) => i !== globalIdx));

  const addSub = () => setForm((f) => {
    const startMin = timeToMin(f.startTime);
    const parentEndMin = timeToMin(f.endTime);
    const defaultEndMin = Math.min(startMin + 60, parentEndMin);
    return {
      ...f,
      subSessions: [
        ...f.subSessions,
        { ...EMPTY_SUB, startTime: f.startTime, endTime: padTime(Math.floor(defaultEndMin / 60), defaultEndMin % 60) },
      ],
    };
  });
  const removeSub = (si: number) => setForm((f) => ({ ...f, subSessions: f.subSessions.filter((_, i) => i !== si) }));
  const updateSub = (si: number, patch: Partial<SubFormState>) =>
    setForm((f) => { const subs = [...f.subSessions]; subs[si] = { ...subs[si], ...patch }; return { ...f, subSessions: subs }; });

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!eventStartDate && !eventEndDate && sessions.length === 0) {
    return (
      <Box mt="md" p="md" sx={{ border: "1px dashed #ced4da", borderRadius: 8, textAlign: "center" }}>
        <Text color="dimmed" size="sm">Selecciona un evento para gestionar las sesiones del calendario.</Text>
      </Box>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box mt="lg">
      <Text weight={700} size="md" mb="xs">Sesiones por día</Text>

      {days.length === 0 ? (
        <Text color="dimmed" size="sm">El evento seleccionado no tiene fechas configuradas.</Text>
      ) : (
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List style={{ flexWrap: "wrap" }}>
            {days.map((day, i) => {
              const count = (sessionsByDay[dayjs(day).format("YYYY-MM-DD")] || []).length;
              return (
                <Tabs.Tab key={i} value={String(i)}>
                  {formatShort(dayjs(day))}
                  {count > 0 && (
                    <span style={{ marginLeft: 6, backgroundColor: "#228be6", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>
                      {count}
                    </span>
                  )}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>

          {days.map((day, dayIdx) => {
            const dayKey = dayjs(day).format("YYYY-MM-DD");
            const daySessions = sessionsByDay[dayKey] || [];
            const laidOut = layoutSessions(daySessions);

            return (
              <Tabs.Panel key={dayIdx} value={String(dayIdx)} pt="sm">
                <Text color="dimmed" size="xs" mb="sm">{formatFull(dayjs(day))}</Text>

                {/* ── Calendar grid ── */}
                <div style={{ position: "relative", border: "1px solid #dee2e6", borderRadius: 8, overflow: "hidden", height: TOTAL_HOURS * HOUR_PX }}>

                  {/* Hour / half-hour background rows (clickable to add session) */}
                  {Array.from({ length: TOTAL_HOURS * 2 + 1 }, (_, i) => {
                    const h = START_HOUR + Math.floor(i / 2);
                    const m = (i % 2) * 30;
                    const top = i * (HOUR_PX / 2);
                    const isHour = i % 2 === 0;
                    const isLast = i === TOTAL_HOURS * 2;

                    return (
                      <div
                        key={i}
                        onClick={isLast ? undefined : () => openAdd(day, h, m)}
                        title={isLast ? undefined : `Agregar sesión a las ${padTime(h, m)}`}
                        style={{
                          position: "absolute",
                          top,
                          left: 0,
                          right: 0,
                          height: isLast ? 0 : HOUR_PX / 2,
                          borderTop: `1px solid ${isHour ? "#dee2e6" : "#f3f4f6"}`,
                          display: "flex",
                          cursor: isLast ? "default" : "pointer",
                          zIndex: 0,
                          boxSizing: "border-box",
                        }}
                      >
                        {/* Time label */}
                        <div style={{
                          width: TIME_COL_W,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "flex-end",
                          paddingRight: 8,
                          paddingTop: isHour ? 3 : 0,
                          color: "#9ca3af",
                          fontSize: 11,
                          userSelect: "none",
                          backgroundColor: isHour ? "#f9fafb" : "transparent",
                          boxSizing: "border-box",
                        }}>
                          {isHour && h <= END_HOUR ? padTime(h, 0) : ""}
                        </div>
                        {/* Clickable zone */}
                        <div style={{ flex: 1, borderLeft: "2px solid #dee2e6", backgroundColor: isHour ? "#f9fafb" : "transparent" }} />
                      </div>
                    );
                  })}

                  {/* Session blocks (absolutely positioned over the grid) */}
                  {laidOut.map(({ session, idx, col, totalCols }) => {
                    const start = dayjs(session.startDateTime);
                    const end = dayjs(session.endDateTime);
                    const startM = toMin(start);
                    const endM = toMin(end);
                    const top = minuteToTop(startM);
                    const height = Math.max((endM - startM) * HOUR_PX / 60, HOUR_PX / 2);
                    const colFrac = 1 / totalCols;
                    const gutter = 4;

                    // CSS calc() expressions for responsive width/left
                    const availExpr = `(100% - ${TIME_COL_W + gutter * 2}px)`;
                    const colWidthExpr = `calc(${availExpr} * ${colFrac} - ${gutter}px)`;
                    const colLeftExpr = `calc(${TIME_COL_W + gutter}px + ${availExpr} * ${col * colFrac})`;

                    return (
                      <div
                        key={idx}
                        style={{
                          position: "absolute",
                          top: top + 1,
                          left: colLeftExpr,
                          width: colWidthExpr,
                          height: height - 2,
                          zIndex: 2,
                          boxSizing: "border-box",
                        }}
                      >
                        <div style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#3b82f6",
                          color: "#fff",
                          borderRadius: 5,
                          padding: "5px 8px",
                          overflow: "hidden",
                          boxSizing: "border-box",
                          border: "1px solid #2563eb",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}>
                          {/* Session header */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
                            <div style={{ flex: 1, overflow: "hidden", cursor: "pointer" }} onClick={() => openEdit(idx)}>
                              <div style={{ fontWeight: 700, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {session.title}
                              </div>
                              {height >= 36 && (
                                <div style={{ fontSize: 10, opacity: 0.9, whiteSpace: "nowrap" }}>
                                  {start.format("HH:mm")} – {end.format("HH:mm")}
                                  {session.type ? ` · ${session.type}` : ""}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "1px 5px", borderRadius: 3, flexShrink: 0 }}
                            >×</button>
                          </div>

                          {/* Subsessions (only if block is tall enough) */}
                          {height >= 56 && (session.subSessions || []).map((sub, si) => {
                            const ss = dayjs(sub.startDateTime);
                            const se = dayjs(sub.endDateTime);
                            return (
                              <div key={si} style={{
                                padding: "2px 6px",
                                backgroundColor: "rgba(255,255,255,0.18)",
                                borderLeft: "3px solid rgba(255,255,255,0.55)",
                                borderRadius: "0 3px 3px 0",
                                fontSize: 10,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                <strong>{ss.format("HH:mm")}–{se.format("HH:mm")}</strong> · {sub.title}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tabs.Panel>
            );
          })}
        </Tabs>
      )}

      {/* ── Add / Edit Session Modal ── */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndex !== null ? "Editar sesión" : "Nueva sesión"}
        size="lg"
      >
        <Stack spacing="sm">
          {slotDay && (
            <Text size="sm" color="dimmed">
              Día: <strong>{formatFull(dayjs(slotDay))}</strong>
            </Text>
          )}

          <TextInput
            label="Título"
            placeholder="Ej: Apertura, Conferencia magistral, Mesa redonda..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <Select
            label="Tipo de sesión"
            data={EVENT_TYPE_OPTIONS}
            value={form.type}
            onChange={(v) => setForm({ ...form, type: (v as EventType) || "OTRO" })}
          />

          <Group grow>
            <TimeInput
              label="Hora de inicio"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <TimeInput
              label="Hora de fin"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </Group>

          <TextInput
            label="Sala / Ubicación"
            placeholder="Ej: Auditorio principal, Sala A..."
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
          />

          <Select
            label="Módulo"
            placeholder="Sin módulo"
            data={moduleOptions}
            value={form.moduleId}
            onChange={(v) => setForm({ ...form, moduleId: v })}
            clearable
            searchable
          />

          {speakerOptions.length > 0 && (
            <MultiSelect
              label="Ponentes"
              placeholder="Selecciona ponentes..."
              data={speakerOptions}
              value={form.speakerIds}
              onChange={(v) => setForm({ ...form, speakerIds: v })}
              searchable
              clearable
            />
          )}

          {/* Subsessions */}
          <Divider mt="xs" label="Subsesiones" labelPosition="center" />

          {form.subSessions.map((sub, si) => {
            const parentStart = timeToMin(form.startTime);
            const parentEnd   = timeToMin(form.endTime);
            const startError  = timeToMin(sub.startTime) < parentStart ? `Mínimo ${form.startTime}` : undefined;
            const endError    = timeToMin(sub.endTime)   > parentEnd   ? `Máximo ${form.endTime}`   : undefined;
            const hasError    = !!(startError || endError);
            return (
              <Box key={si} p="sm" sx={{ border: `1px solid ${hasError ? "#fa5252" : "#dee2e6"}`, borderRadius: 6, backgroundColor: "#f9fafb" }}>
                <Stack spacing="xs">
                  <Group position="apart">
                    <Text size="sm" weight={600}>Subsesión {si + 1}</Text>
                    <Button size="xs" variant="subtle" color="red" compact onClick={() => removeSub(si)}>Eliminar</Button>
                  </Group>

                  <TextInput size="sm" label="Título" placeholder="Título de la subsesión" value={sub.title} onChange={(e) => updateSub(si, { title: e.target.value })} />

                  <Group grow>
                    <TimeInput size="sm" label="Inicio" value={sub.startTime} error={startError} onChange={(e) => updateSub(si, { startTime: e.target.value })} />
                    <TimeInput size="sm" label="Fin" value={sub.endTime} error={endError} onChange={(e) => updateSub(si, { endTime: e.target.value })} />
                  </Group>

                  {hasError && (
                    <Text size="xs" color="red">La subsesión debe estar entre {form.startTime} y {form.endTime}.</Text>
                  )}

                  <TextInput size="sm" label="Sala" placeholder="Sala de la subsesión" value={sub.room} onChange={(e) => updateSub(si, { room: e.target.value })} />

                  <Select size="sm" label="Módulo" placeholder="Sin módulo" data={moduleOptions} value={sub.moduleId} onChange={(v) => updateSub(si, { moduleId: v })} clearable searchable />

                  {speakerOptions.length > 0 && (
                    <MultiSelect size="sm" label="Ponentes" placeholder="Selecciona ponentes..." data={speakerOptions} value={sub.speakerIds} onChange={(v) => updateSub(si, { speakerIds: v })} searchable clearable />
                  )}
                </Stack>
              </Box>
            );
          })}

          <Button variant="light" size="sm" onClick={addSub}>+ Agregar subsesión</Button>

          <Divider />

          <Group position="right">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || form.subSessions.some(
                (sub) => timeToMin(sub.startTime) < timeToMin(form.startTime) || timeToMin(sub.endTime) > timeToMin(form.endTime)
              )}
            >
              {editingIndex !== null ? "Guardar cambios" : "Agregar sesión"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};
