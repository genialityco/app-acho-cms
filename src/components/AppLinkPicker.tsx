import React, { useEffect, useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button, Group, Modal, Select, Stack, Text, TextInput } from "@mantine/core";

/**
 * Enlaces que la app móvil sabe abrir (ver app-acho/utils/appLinks.ts):
 *  - achoapp://evento/<eventId>[?seccion=<pestaña>]
 *  - achoapp://memoria/<highlightId>
 *  - achoapp://noticia/<newsId>
 *  - achoapp://seccion/<nombre>
 *  - https://...  (se abre fuera de la app)
 */
const ORGANIZATION_ID = "66f1d236ee78a23c67fada2a";

type TargetType = "evento" | "memoria" | "seccion" | "noticia" | "web";

const TARGET_OPTIONS: { value: TargetType; label: string }[] = [
  { value: "evento", label: "Evento" },
  { value: "memoria", label: "Memoria (video destacado)" },
  { value: "seccion", label: "Sección de la app" },
  { value: "noticia", label: "Noticia" },
  { value: "web", label: "Enlace web (fuera de la app)" },
];

/**
 * Pestañas del detalle del evento. La clave coincide con event.eventSections
 * (salvo "memorias", que siempre está disponible).
 */
export const EVENT_TABS = [
  { value: "agenda", label: "Agenda" },
  { value: "speakers", label: "Conferencistas" },
  { value: "posters", label: "Posters" },
  { value: "certificate", label: "Certificados" },
  { value: "documents", label: "Documentos" },
  { value: "ubication", label: "Ubicación" },
  { value: "memorias", label: "Memorias del evento" },
];

export const APP_SECTIONS = [
  { value: "novedades", label: "Novedades" },
  { value: "proximos", label: "Próximos eventos" },
  { value: "anteriores", label: "Eventos anteriores" },
  { value: "acho", label: "ACHO (información)" },
  { value: "perfil", label: "Mi perfil" },
  { value: "mis-eventos", label: "Mis eventos" },
  { value: "mis-certificados", label: "Mis certificados" },
  { value: "soporte", label: "Soporte" },
];

type ParsedLink = { type: TargetType; value: string; tab: string };

const parseLink = (url?: string | null): ParsedLink => {
  const match = (url || "")
    .trim()
    .match(/^achoapp:\/\/([^/?#]+)\/?([^?#]*)(?:\?([^#]*))?/i);
  if (match) {
    const type = match[1].toLowerCase() as TargetType;
    if (type !== "web" && TARGET_OPTIONS.some((o) => o.value === type)) {
      const tab = new URLSearchParams(match[3] || "").get("seccion") || "";
      return { type, value: decodeURIComponent(match[2] || ""), tab };
    }
  }
  if (url && /^https?:\/\//i.test(url.trim()))
    return { type: "web", value: url.trim(), tab: "" };
  return { type: "evento", value: "", tab: "" };
};

const buildLink = (type: TargetType, value: string, tab = ""): string => {
  const v = value.trim();
  if (!v) return "";
  if (type === "web") return v;
  const base = `achoapp://${type}/${encodeURIComponent(v)}`;
  return type === "evento" && tab ? `${base}?seccion=${encodeURIComponent(tab)}` : base;
};

type AppLinkFieldsProps = {
  value?: string | null;
  onChange: (url: string) => void;
  /** Etiqueta del primer selector (por defecto "Destino"). */
  label?: string;
};

/** Selector de destino: devuelve la URL armada ("" si está incompleto). */
export const AppLinkFields: React.FC<AppLinkFieldsProps> = ({
  value,
  onChange,
  label = "Destino",
}) => {
  const initial = useMemo(() => parseLink(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [type, setType] = useState<TargetType>(initial.type);
  const [target, setTarget] = useState<string>(initial.value);
  const [tab, setTab] = useState<string>(initial.tab);

  // Si el valor llega después (edición cargada desde la API), sincronizar
  useEffect(() => {
    if (!value || value === buildLink(type, target, tab)) return;
    const parsed = parseLink(value);
    setType(parsed.type);
    setTarget(parsed.value);
    setTab(parsed.tab);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: eventsData, isLoading: loadingEvents } = useList({
    resource: "events",
    pagination: { current: 1, pageSize: 500, mode: "server" },
    filters: [{ field: "organizationId", operator: "eq", value: ORGANIZATION_ID }],
    sorters: [{ field: "startDate", order: "desc" }],
    queryOptions: { enabled: type === "evento" },
  });

  const { data: highlightsData, isLoading: loadingHighlights } = useList({
    resource: "highlights",
    pagination: { current: 1, pageSize: 500, mode: "server" },
    filters: [{ field: "organizationId", operator: "eq", value: ORGANIZATION_ID }],
    sorters: [{ field: "createdAt", order: "desc" }],
    queryOptions: { enabled: type === "memoria" },
  });

  const { data: newsData, isLoading: loadingNews } = useList({
    resource: "news",
    pagination: { current: 1, pageSize: 500, mode: "server" },
    filters: [{ field: "organizationId", operator: "eq", value: ORGANIZATION_ID }],
    sorters: [{ field: "createdAt", order: "desc" }],
    queryOptions: { enabled: type === "noticia" },
  });

  const eventOptions = useMemo(
    () =>
      (eventsData?.data ?? []).map((e: any) => ({
        value: e._id,
        label: `${e.name}${
          e.startDate ? ` — ${new Date(e.startDate).toLocaleDateString("es-CO")}` : ""
        }`,
      })),
    [eventsData],
  );

  // Solo se ofrecen las pestañas que el evento tiene habilitadas
  const tabOptions = useMemo(() => {
    const event: any = (eventsData?.data ?? []).find((e: any) => e._id === target);
    const sections = event?.eventSections;
    return [
      { value: "", label: "Detalle del evento" },
      ...EVENT_TABS.filter(
        (t) => t.value === "memorias" || !sections || Boolean(sections[t.value]),
      ),
    ];
  }, [eventsData, target]);

  const highlightOptions = useMemo(
    () =>
      (highlightsData?.data ?? []).map((h: any) => ({
        value: h._id,
        label: `${h.name}${h.eventId?.name ? ` — ${h.eventId.name}` : ""}`,
      })),
    [highlightsData],
  );

  const newsOptions = useMemo(() => {
    const options = (newsData?.data ?? []).map((n: any) => ({
      value: n._id as string,
      label: `${n.title}${
        n.createdAt ? ` — ${new Date(n.createdAt).toLocaleDateString("es-CO")}` : ""
      }`,
    }));
    // Mantener visible un ID guardado que no esté en el listado
    if (type === "noticia" && target && !options.some((o) => o.value === target)) {
      options.unshift({ value: target, label: target });
    }
    return options;
  }, [newsData, target, type]);

  const update = (nextType: TargetType, nextTarget: string, nextTab = "") => {
    setType(nextType);
    setTarget(nextTarget);
    setTab(nextTab);
    onChange(buildLink(nextType, nextTarget, nextTab));
  };

  return (
    <Stack spacing="xs">
      <Select
        label={label}
        data={TARGET_OPTIONS}
        value={type}
        onChange={(v) => update((v as TargetType) || "evento", "")}
      />

      {type === "evento" && (
        <Select
          label="Evento"
          placeholder={loadingEvents ? "Cargando eventos..." : "Busca el evento"}
          data={eventOptions}
          value={target || null}
          onChange={(v) => update("evento", v || "")}
          searchable
          nothingFound="Sin resultados"
          maxDropdownHeight={300}
        />
      )}

      {type === "evento" && target && (
        <Select
          label="Abrir en"
          description="Lleva al usuario directamente a una pestaña del evento"
          data={tabOptions}
          value={tab}
          onChange={(v) => update("evento", target, v || "")}
        />
      )}

      {type === "memoria" && (
        <Select
          label="Memoria"
          placeholder={loadingHighlights ? "Cargando memorias..." : "Busca la memoria"}
          data={highlightOptions}
          value={target || null}
          onChange={(v) => update("memoria", v || "")}
          searchable
          nothingFound="Sin resultados"
          maxDropdownHeight={300}
        />
      )}

      {type === "seccion" && (
        <Select
          label="Sección"
          data={APP_SECTIONS}
          value={target || null}
          onChange={(v) => update("seccion", v || "")}
        />
      )}

      {type === "noticia" && (
        <Select
          label="Noticia"
          placeholder={loadingNews ? "Cargando noticias..." : "Busca la noticia"}
          data={newsOptions}
          value={target || null}
          onChange={(v) => update("noticia", v || "")}
          searchable
          nothingFound="Sin resultados"
          maxDropdownHeight={300}
        />
      )}

      {type === "web" && (
        <TextInput
          label="URL"
          placeholder="https://..."
          value={target}
          onChange={(e) => update("web", e.currentTarget.value)}
        />
      )}
    </Stack>
  );
};

type AppLinkModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: (url: string, label: string) => void;
};

/** Modal para enlazar texto o una imagen del contenido a una pantalla de la app. */
export const AppLinkModal: React.FC<AppLinkModalProps> = ({ opened, onClose, onConfirm }) => {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (opened) {
      setUrl("");
      setLabel("");
    }
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Enlace a la app" size="lg">
      <Stack spacing="sm">
        <Text size="sm" c="dimmed">
          Selecciona en el contenido el texto o la imagen (haz clic sobre ella) antes de
          abrir este cuadro. Si no hay nada seleccionado se insertará el texto de abajo.
        </Text>

        {opened && <AppLinkFields value={url} onChange={setUrl} />}

        <TextInput
          label="Texto del enlace (solo si no hay selección)"
          placeholder="Ej: Ver el evento"
          value={label}
          onChange={(e) => setLabel(e.currentTarget.value)}
        />

        <Group position="right">
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!url} onClick={() => onConfirm(url, label)}>
            Aplicar enlace
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

type NewsRedirectFieldProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
};

/** Qué pasa al tocar la noticia en el listado de la app. */
export const NewsRedirectField: React.FC<NewsRedirectFieldProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<"detail" | "redirect">(value ? "redirect" : "detail");

  useEffect(() => {
    if (value) setMode("redirect");
  }, [value]);

  return (
    <Stack spacing="xs">
      <Select
        label="Al tocar la noticia en el listado de la app"
        data={[
          { value: "detail", label: "Abrir la noticia (por defecto)" },
          { value: "redirect", label: "Llevar directamente a otra pantalla" },
        ]}
        value={mode}
        onChange={(v) => {
          const next = (v as "detail" | "redirect") || "detail";
          setMode(next);
          if (next === "detail") onChange(null);
        }}
      />

      {mode === "redirect" && (
        <AppLinkFields value={value} onChange={(url) => onChange(url || null)} />
      )}
    </Stack>
  );
};
