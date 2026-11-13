import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Group,
  Loader,
  Modal,
  Paper,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconAlertCircle,
  IconApple,
  IconBrandAndroid,
  IconCalendar,
  IconInfoCircle,
  IconRefresh,
} from "@tabler/icons-react";
import "dayjs/locale/es";
import { API_URL } from "../../components/dataProvider/customGenRestDataProvider";

type DayStat = { day: string; active: number; newUsers: number; returning: number; opens: number };
type Stats = {
  from: string;
  to: string;
  returningGapDays: number;
  trackingSince: string | null;
  totals: { uniqueUsers: number; newUsers: number; returning: number };
  days: DayStat[];
};
type Realtime = {
  available: boolean;
  error?: string;
  activeUsers: number;
  byPlatform: { platform: string; activeUsers: number }[];
  byMinute: { minutesAgo: number; activeUsers: number }[];
  fetchedAt: string;
};

const COLORS = { other: "#4d93d0", newUsers: "#2f9e44", returning: "#f08c00" };
const REALTIME_REFRESH_MS = 60_000; // GA4 se cachea 60 s en el backend
const STATS_REFRESH_MS = 30_000;
const PLATFORM_LABEL: Record<string, string> = { ANDROID: "Android", IOS: "iOS", WEB: "Web" };

const bogotaToday = () => new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
// Fechas locales (sin zona horaria) para el selector: "YYYY-MM-DD" <-> Date
const parseDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const pad = (n: number) => String(n).padStart(2, "0");
const toDayStr = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatLongDay = (day: string) =>
  parseDay(day).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const formatDay = (day: string) => {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
};
const fmt = (n: number) => n.toLocaleString("es-CO");
// Activos que ya venian usando la app: ni nuevos ni regresaron tras inactividad
const recurring = (d: DayStat) => Math.max(0, d.active - d.newUsers - d.returning);

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data as T;
}

export default function AppStatistics() {
  const todayStr = bogotaToday();
  // Estadisticas de hoy + primer dia con datos (antes de eso no hay registros)
  const [base, setBase] = useState<Stats | null>(null);
  // Rango elegido en el filtro; vacio = desde el primer dia con datos hasta hoy
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [realtime, setRealtime] = useState<Realtime | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  // Cada cambio de `tick` recarga los datos en segundo plano (sin cargador ni perder la pagina)
  const [tick, setTick] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      // No consultar mientras la pestaña esta oculta; al volver se actualiza enseguida
      if (document.visibilityState === "visible") setTick((t) => t + 1);
    }, STATS_REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && setTick((t) => t + 1);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    getJson<Stats>(`/app-activity/stats?from=${todayStr}&to=${todayStr}`)
      .then(setBase)
      .catch(() => setStatsError("No se pudieron cargar las estadísticas"));
  }, [todayStr, tick]);

  const trackingSince = base?.trackingSince ?? null;
  const firstDay = trackingSince && trackingSince < todayStr ? trackingSince : todayStr;
  const hasRange = !!(range[0] && range[1]);
  const from = hasRange ? toDayStr(range[0] as Date) : firstDay;
  const to = hasRange ? toDayStr(range[1] as Date) : todayStr;
  const ready = !!base;

  // Cambio de rango: carga con cargador y vuelve a la primera pagina
  useEffect(() => {
    if (!ready) return;
    setStats(null);
    setStatsError(null);
    setPage(1);
    getJson<Stats>(`/app-activity/stats?from=${from}&to=${to}`)
      .then((s) => {
        setStats(s);
        setUpdatedAt(new Date());
      })
      .catch(() => setStatsError("No se pudieron cargar las estadísticas"));
  }, [ready, from, to]);

  // Actualizacion periodica: reemplaza los datos sin tocar la vista
  useEffect(() => {
    if (!ready || tick === 0) return;
    let cancelled = false;
    setRefreshing(true);
    getJson<Stats>(`/app-activity/stats?from=${from}&to=${to}`)
      .then((s) => {
        if (cancelled) return;
        setStats(s);
        setStatsError(null);
        setUpdatedAt(new Date());
      })
      .catch(() => {}) // si falla una actualizacion, se conservan los datos que ya se ven
      .finally(() => !cancelled && setRefreshing(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getJson<Realtime>("/app-activity/realtime")
        .then((r) => !cancelled && setRealtime(r))
        .catch(() => !cancelled && setRealtime(null));
    load();
    const id = setInterval(load, REALTIME_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Nunca mostrar dias anteriores al primer registro (serian ceros que no son reales)
  const days = useMemo(() => (stats?.days ?? []).filter((d) => d.day >= firstDay), [stats, firstDay]);
  const rows = useMemo(() => [...days].reverse(), [days]); // el mas reciente primero
  const size = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  // Si una actualizacion deja menos paginas, no quedarse en una pagina vacia
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * size, currentPage * size);
  const todayActive = base?.days[base.days.length - 1]?.active ?? 0;

  return (
    <Stack spacing="lg" p="md">
      <MetricsHelpModal
        opened={helpOpen}
        onClose={() => setHelpOpen(false)}
        gapDays={stats?.returningGapDays ?? 90}
      />
      <Group position="apart" align="flex-end">
        <div>
          <Title order={2}>Estadísticas de la App</Title>
          <Group spacing={4} mt={4}>
            <Text size="xs" color="dimmed">
              {updatedAt
                ? `Actualizado a las ${updatedAt.toLocaleTimeString("es-CO")} · se actualiza solo cada ${STATS_REFRESH_MS / 1000} s`
                : "Cargando…"}
            </Text>
            <ActionIcon
              size="xs"
              variant="subtle"
              color="gray"
              loading={refreshing}
              disabled={!ready}
              onClick={() => setTick((t) => t + 1)}
              aria-label="Actualizar ahora"
              title="Actualizar ahora"
            >
              <IconRefresh size={14} />
            </ActionIcon>
          </Group>
        </div>
        <DatePickerInput
          type="range"
          label="Filtrar por fechas"
          locale="es"
          valueFormat="DD/MM/YYYY"
          value={range}
          onChange={setRange}
          minDate={parseDay(firstDay)}
          maxDate={parseDay(todayStr)}
          clearable
          allowSingleDateInRange
          icon={<IconCalendar size={16} />}
          w={280}
          disabled={!base}
        />
      </Group>

      <RealtimeCard realtime={realtime} />

      {statsError && (
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          {statsError}
        </Alert>
      )}
      {!stats && !statsError && <Loader />}

      {stats && (
        <>
          <Text size="sm" color="dimmed">
            {trackingSince
              ? `Los datos se registran desde el ${formatLongDay(trackingSince)}; antes no hay información, por eso el filtro no deja elegir fechas anteriores.`
              : "Aún no hay accesos registrados; los datos empiezan a contarse desde hoy."}{" "}
            Mostrando del {formatLongDay(from)} al {formatLongDay(to)}.
          </Text>

          <SimpleGrid cols={4} breakpoints={[{ maxWidth: "md", cols: 2 }, { maxWidth: "xs", cols: 1 }]}>
            <StatCard label="Activos hoy" value={todayActive} />
            <StatCard
              label={hasRange ? "Personas distintas (en el rango)" : "Personas distintas (total)"}
              value={stats.totals.uniqueUsers}
              color={COLORS.other}
            />
            <StatCard label="Nuevos" value={stats.totals.newUsers} color={COLORS.newUsers} />
            <StatCard
              label="Regresaron tras inactividad"
              value={stats.totals.returning}
              color={COLORS.returning}
            />
          </SimpleGrid>

          <Paper withBorder radius="md" p="md">
            <Group position="apart" mb="sm">
              <Text weight={600}>Usuarios activos por día</Text>
              <Group spacing="md">
                <Legend color={COLORS.other} label="Recurrentes" />
                <Legend color={COLORS.newUsers} label="Nuevos" />
                <Legend color={COLORS.returning} label="Regresaron tras inactividad" />
              </Group>
            </Group>
            <DailyChart days={days} />
          </Paper>

          <Paper withBorder radius="md" p="md">
            <Group spacing={4} mb="sm">
              <Text weight={600}>Detalle por día</Text>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={() => setHelpOpen(true)}
                aria-label="¿Qué significa cada columna?"
                title="¿Qué significa cada columna?"
              >
                <IconInfoCircle size={16} />
              </ActionIcon>
            </Group>
            <Table striped highlightOnHover fontSize="sm">
              <thead>
                <tr>
                  <th>Día</th>
                  <th style={{ textAlign: "right" }}>Activos</th>
                  <th style={{ textAlign: "right" }}>Recurrentes</th>
                  <th style={{ textAlign: "right" }}>Nuevos</th>
                  <th style={{ textAlign: "right" }}>Regresaron tras inactividad</th>
                  <th style={{ textAlign: "right" }}>Aperturas</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((d) => (
                  <tr key={d.day}>
                    <td>
                      {formatLongDay(d.day)}
                      {d.day === todayStr && (
                        <Badge size="xs" ml={6} variant="light">
                          Hoy
                        </Badge>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>{fmt(d.active)}</td>
                    <td style={{ textAlign: "right" }}>{fmt(recurring(d))}</td>
                    <td style={{ textAlign: "right" }}>{fmt(d.newUsers)}</td>
                    <td style={{ textAlign: "right" }}>{fmt(d.returning)}</td>
                    <td style={{ textAlign: "right" }}>{fmt(d.opens)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Group position="apart" mt="md">
              <Group spacing="xs">
                <Text size="sm" color="dimmed">
                  Filas por página
                </Text>
                <Select
                  value={pageSize}
                  onChange={(v) => {
                    setPageSize(v ?? "10");
                    setPage(1);
                  }}
                  data={["5", "10", "30", "50"]}
                  size="xs"
                  w={70}
                />
              </Group>
              {totalPages > 1 && <Pagination total={totalPages} value={currentPage} onChange={setPage} size="sm" />}
            </Group>
          </Paper>
        </>
      )}

      <Paper withBorder radius="md" p="md">
        <Text weight={600} mb="xs">
          Descargas e instalaciones (consolas de las tiendas)
        </Text>
        <Group spacing="xl">
          <Anchor
            href="https://play.google.com/console/u/1/developers/5756729651370207928/app/4972985781024468330/tracks/production"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Group spacing={6}>
              <IconBrandAndroid size={20} /> Google Play
            </Group>
          </Anchor>
          <Anchor
            href="https://appstoreconnect.apple.com/analytics/app/d30/6736631927/overview?iaemeasure=totalDownloads"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Group spacing={6}>
              <IconApple size={20} /> App Store
            </Group>
          </Anchor>
        </Group>
      </Paper>
    </Stack>
  );
}

function MetricsHelpModal({
  opened,
  onClose,
  gapDays,
}: {
  opened: boolean;
  onClose: () => void;
  gapDays: number;
}) {
  const items = [
    {
      color: "#212529",
      title: "Activos",
      text: "Personas distintas que abrieron la app ese día con su sesión iniciada. Cada persona cuenta una sola vez por día, aunque la abra varias veces. Activos = Recurrentes + Nuevos + Regresaron tras inactividad.",
    },
    {
      color: COLORS.other,
      title: "Recurrentes",
      text: `Activos que ya venían usando la app: no es su primera vez y su acceso anterior fue hace menos de ${gapDays} días.`,
    },
    {
      color: COLORS.newUsers,
      title: "Nuevos",
      text: "Personas que abrieron la app por primera vez ese día: no tenían ningún acceso registrado antes (por ejemplo, alguien que acaba de crear su cuenta).",
    },
    {
      color: COLORS.returning,
      title: "Regresaron tras inactividad",
      text: `Personas que volvieron a abrir la app después de ${gapDays} días o más (unos 3 meses) sin entrar. Sirve para ver cuántos usuarios "dormidos" se recuperan, por ejemplo después de enviar una notificación o anunciar un evento.`,
    },
    {
      color: "#868e96",
      title: "Aperturas",
      text: "Total de veces que se abrió la app ese día, sumando a todas las personas. Si una persona la abre 3 veces, suma 1 en Activos y 3 en Aperturas.",
    },
  ];

  return (
    <Modal opened={opened} onClose={onClose} title={<Text weight={700}>¿Qué significa cada dato?</Text>} size="lg">
      <Stack spacing="md">
        {items.map((item) => (
          <Group key={item.title} spacing="sm" noWrap align="flex-start">
            <div
              style={{ width: 12, height: 12, borderRadius: 3, background: item.color, marginTop: 5, flexShrink: 0 }}
            />
            <div>
              <Text weight={600}>{item.title}</Text>
              <Text size="sm" color="dimmed">
                {item.text}
              </Text>
            </div>
          </Group>
        ))}
        <Text size="sm" color="dimmed">
          Los días se cuentan en hora de Colombia. Se registra una apertura cuando la app arranca: al
          abrirla después de cerrarla por completo, después de reiniciar el celular o cuando el sistema
          la había cerrado por estar mucho tiempo sin usarse. Si la persona solo sale a otra app o a la
          pantalla de inicio y vuelve enseguida, la app sigue abierta en segundo plano y no se cuenta
          como una apertura nueva.
        </Text>
      </Stack>
    </Modal>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Paper withBorder radius="md" p="md">
      <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
        {label}
      </Text>
      <Text size={28} weight={700} style={{ color }}>
        {fmt(value)}
      </Text>
    </Paper>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Group spacing={6}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      <Text size="xs">{label}</Text>
    </Group>
  );
}

function RealtimeCard({ realtime }: { realtime: Realtime | null }) {
  return (
    <Paper withBorder radius="md" p="md">
      <Group position="apart" align="flex-start">
        <div>
          <Group spacing="xs">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: realtime?.available ? "#2f9e44" : "#adb5bd",
              }}
            />
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Activos ahora (últimos 30 min)
            </Text>
          </Group>
          {!realtime ? (
            <Loader size="sm" mt="xs" />
          ) : realtime.available ? (
            <>
              <Text size={36} weight={700}>
                {fmt(realtime.activeUsers)}
              </Text>
              <Group spacing="xs">
                {realtime.byPlatform.map((p) => (
                  <Badge key={p.platform} variant="light">
                    {PLATFORM_LABEL[p.platform.toUpperCase()] ?? p.platform}: {fmt(p.activeUsers)}
                  </Badge>
                ))}
              </Group>
            </>
          ) : (
            <Text size="sm" color="dimmed" mt="xs">
              No disponible: {realtime.error}
            </Text>
          )}
        </div>
        {realtime?.available && <MinuteChart byMinute={realtime.byMinute} />}
      </Group>
      <Text size="xs" color="dimmed" mt="xs">
        Fuente: Google Analytics (Firebase) de la app. Se actualiza cada minuto.
      </Text>
    </Paper>
  );
}

/** Barras por minuto, de hace 29 min (izquierda) a ahora (derecha). */
function MinuteChart({ byMinute }: { byMinute: Realtime["byMinute"] }) {
  const points = [...byMinute].sort((a, b) => b.minutesAgo - a.minutesAgo);
  const max = Math.max(1, ...points.map((p) => p.activeUsers));
  const W = 240;
  const H = 60;
  const bw = W / points.length;
  return (
    <svg width={W} height={H} role="img" aria-label="Usuarios activos por minuto">
      {points.map((p, i) => {
        const h = (p.activeUsers / max) * (H - 4);
        return (
          <rect key={p.minutesAgo} x={i * bw + 1} y={H - h} width={bw - 2} height={h} fill="#4d93d0" rx={1}>
            <title>
              {p.minutesAgo === 0 ? "Este minuto" : `Hace ${p.minutesAgo} min`}: {p.activeUsers}
            </title>
          </rect>
        );
      })}
    </svg>
  );
}

/** Barras apiladas por día: recurrentes + nuevos + volvieron tras 90+ días = activos. */
function DailyChart({ days }: { days: DayStat[] }) {
  const max = useMemo(() => Math.max(1, ...days.map((d) => d.active)), [days]);
  const H = 220;
  const PAD_BOTTOM = 22;
  const PAD_LEFT = 36;
  const W = Math.max(600, days.length * 18);
  const plotH = H - PAD_BOTTOM - 8;
  // Ancho maximo por dia: con pocos dias (al inicio) las barras no se estiran
  const bw = Math.min(56, (W - PAD_LEFT) / Math.max(1, days.length));
  const labelEvery = Math.ceil(days.length / 15);
  const ticks = [0, Math.round(max / 2), max];

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 480 }} role="img" aria-label="Usuarios activos por día">
        {ticks.map((t) => {
          const y = 8 + plotH - (t / max) * plotH;
          return (
            <g key={t}>
              <line x1={PAD_LEFT} x2={W} y1={y} y2={y} stroke="#e9ecef" />
              <text x={PAD_LEFT - 6} y={y + 4} fontSize={10} textAnchor="end" fill="#868e96">
                {t}
              </text>
            </g>
          );
        })}
        {days.map((d, i) => {
          const x = PAD_LEFT + i * bw + bw * 0.15;
          const w = bw * 0.7;
          const other = recurring(d);
          const segs = [
            { v: other, c: COLORS.other },
            { v: d.newUsers, c: COLORS.newUsers },
            { v: d.returning, c: COLORS.returning },
          ];
          let y = 8 + plotH;
          return (
            <g key={d.day}>
              <title>
                {`${d.day}\nActivos: ${d.active}\nRecurrentes: ${other}\nNuevos: ${d.newUsers}\nRegresaron tras inactividad: ${d.returning}\nAperturas: ${d.opens}`}
              </title>
              <rect x={PAD_LEFT + i * bw} y={8} width={bw} height={plotH} fill="transparent" />
              {segs.map((s, k) => {
                const h = (s.v / max) * plotH;
                y -= h;
                return h > 0 ? <rect key={k} x={x} y={y} width={w} height={h} fill={s.c} /> : null;
              })}
              {i % labelEvery === 0 && (
                <text x={x + w / 2} y={H - 6} fontSize={10} textAnchor="middle" fill="#868e96">
                  {formatDay(d.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
