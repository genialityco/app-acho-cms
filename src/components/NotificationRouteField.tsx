import React, { useEffect, useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Code, Select, Stack, Text, TextInput } from "@mantine/core";

/**
 * Destino al abrir una notificación en la app.
 *
 * La app hace `router.push(data.route)` al tocar la push o el botón "Ver"
 * (ver app-acho/app/(app)/_layout.tsx), así que aquí se arma la ruta de
 * expo-router tal cual la usa la app internamente.
 */
const ORGANIZATION_ID = "66f1d236ee78a23c67fada2a";

type TargetType =
  | "none"
  | "noticia"
  | "evento"
  | "agenda"
  | "memorias"
  | "memoria"
  | "seccion"
  | "custom";

const TARGET_OPTIONS: { value: TargetType; label: string }[] = [
  { value: "none", label: "Sin redirección" },
  { value: "noticia", label: "Una noticia" },
  { value: "evento", label: "Detalle de un evento" },
  { value: "agenda", label: "Agenda de un evento" },
  { value: "memorias", label: "Memorias de un evento" },
  { value: "memoria", label: "Una memoria específica" },
  { value: "seccion", label: "Sección de la app" },
  { value: "custom", label: "Ruta personalizada" },
];

const SECTION_ROUTES: { value: string; label: string }[] = [
  { value: "/(tabs)/home", label: "Novedades" },
  { value: "/(tabs)/(index)", label: "Próximos eventos" },
  { value: "/(tabs)/eventosbefore", label: "Eventos anteriores" },
  { value: "/(tabs)/achoinfo", label: "ACHO (información)" },
  { value: "/(tabs)/menu", label: "Mi perfil" },
  { value: "/(tabs)/menu/components/myevents", label: "Mis eventos" },
  { value: "/(tabs)/menu/components/mycertificates", label: "Mis certificados" },
  { value: "/(tabs)/menu/components/support", label: "Soporte" },
];

type Selection = {
  type: TargetType;
  newsId: string;
  eventId: string;
  highlightId: string;
  section: string;
  custom: string;
};

const EMPTY: Selection = {
  type: "none",
  newsId: "",
  eventId: "",
  highlightId: "",
  section: "",
  custom: "",
};

const isPastEvent = (event?: any): boolean => {
  const end = event?.endDate || event?.startDate;
  return !!end && new Date(end) < new Date();
};

const param = (route: string, key: string) =>
  new URLSearchParams(route.split("?")[1] || "").get(key) || "";

/** Reconstruye la selección a partir de una ruta guardada. */
const parseRoute = (route?: string | null): Selection => {
  const r = (route || "").trim();
  if (!r) return EMPTY;
  const path = r.split("?")[0];

  if (path.endsWith("/home/components/novelty"))
    return { ...EMPTY, type: "noticia", newsId: param(r, "newId") };
  if (path.endsWith("/components/eventdetail") || path.endsWith("/components/eventdetailb"))
    return { ...EMPTY, type: "evento", eventId: param(r, "eventId") };
  if (path.endsWith("/components/program"))
    return { ...EMPTY, type: "agenda", eventId: param(r, "eventId") };
  if (path.endsWith("/eventosbefore/Memorias"))
    return { ...EMPTY, type: "memorias", eventId: param(r, "eventId") };
  if (path.endsWith("/eventosbefore/HighlightDetail"))
    return { ...EMPTY, type: "memoria", highlightId: param(r, "id") };
  if (SECTION_ROUTES.some((s) => s.value === r))
    return { ...EMPTY, type: "seccion", section: r };
  return { ...EMPTY, type: "custom", custom: r };
};

/** Arma la ruta ("" si la selección está incompleta). */
const buildRoute = (sel: Selection, event?: any): string => {
  switch (sel.type) {
    case "noticia":
      return sel.newsId ? `/home/components/novelty?newId=${sel.newsId}` : "";
    case "evento":
      if (!sel.eventId) return "";
      return isPastEvent(event)
        ? `/(tabs)/eventosbefore/components/eventdetailb?eventId=${sel.eventId}`
        : `/(tabs)/(index)/components/eventdetail?eventId=${sel.eventId}`;
    case "agenda":
      if (!sel.eventId) return "";
      return isPastEvent(event)
        ? `/(tabs)/eventosbefore/components/program?eventId=${sel.eventId}`
        : `/(tabs)/(index)/components/program?eventId=${sel.eventId}`;
    case "memorias":
      return sel.eventId ? `/(tabs)/eventosbefore/Memorias?eventId=${sel.eventId}` : "";
    case "memoria":
      return sel.highlightId ? `/(tabs)/eventosbefore/HighlightDetail?id=${sel.highlightId}` : "";
    case "seccion":
      return sel.section;
    case "custom":
      return sel.custom.trim();
    default:
      return "";
  }
};

type NotificationRouteFieldProps = {
  /** Objeto `data` de la notificación; se conservan las demás claves. */
  value?: Record<string, any> | null;
  onChange: (data: Record<string, any>) => void;
};

export const NotificationRouteField: React.FC<NotificationRouteFieldProps> = ({
  value,
  onChange,
}) => {
  const savedRoute: string = value?.route || "";
  const [sel, setSel] = useState<Selection>(() => parseRoute(savedRoute));
  const [highlightEventId, setHighlightEventId] = useState("");

  const needsEvents = ["evento", "agenda", "memorias", "memoria"].includes(sel.type);

  const { data: eventsData, isLoading: loadingEvents } = useList({
    resource: "events",
    pagination: { current: 1, pageSize: 500, mode: "server" },
    filters: [{ field: "organizationId", operator: "eq", value: ORGANIZATION_ID }],
    sorters: [{ field: "startDate", order: "desc" }],
    queryOptions: { enabled: needsEvents },
  });

  const { data: newsData, isLoading: loadingNews } = useList({
    resource: "news",
    pagination: { current: 1, pageSize: 500, mode: "server" },
    sorters: [{ field: "createdAt", order: "desc" }],
    queryOptions: { enabled: sel.type === "noticia" },
  });

  const { data: highlightsData, isLoading: loadingHighlights } = useList({
    resource: "highlights",
    pagination: { current: 1, pageSize: 500, mode: "server" },
    filters: highlightEventId
      ? [{ field: "eventId", operator: "eq", value: highlightEventId }]
      : [],
    queryOptions: { enabled: sel.type === "memoria" },
  });

  const events = eventsData?.data ?? [];
  const selectedEvent = events.find((e: any) => e._id === sel.eventId);

  // Si la ruta llega después (edición cargada desde la API), sincronizar
  useEffect(() => {
    if (savedRoute === buildRoute(sel, selectedEvent)) return;
    setSel(parseRoute(savedRoute));
  }, [savedRoute]); // eslint-disable-line react-hooks/exhaustive-deps

  const eventOptions = useMemo(
    () =>
      events.map((e: any) => ({
        value: e._id,
        label: `${e.name}${
          e.startDate ? ` — ${new Date(e.startDate).toLocaleDateString("es-CO")}` : ""
        }${isPastEvent(e) ? " (anterior)" : ""}`,
      })),
    [events],
  );

  const newsOptions = useMemo(
    () =>
      (newsData?.data ?? []).map((n: any) => ({
        value: n._id,
        label: `${n.title || "(sin título)"}${
          n.createdAt ? ` — ${new Date(n.createdAt).toLocaleDateString("es-CO")}` : ""
        }`,
      })),
    [newsData],
  );

  const highlightOptions = useMemo(
    () =>
      (highlightsData?.data ?? []).map((h: any) => ({
        value: h._id,
        label: h.name || h._id,
      })),
    [highlightsData],
  );

  const update = (patch: Partial<Selection>) => {
    const next = { ...sel, ...patch };
    setSel(next);
    const event = events.find((e: any) => e._id === next.eventId);
    const route = buildRoute(next, event);
    const { route: _old, ...rest } = value || {};
    onChange(route ? { ...rest, route } : rest);
  };

  const currentRoute = buildRoute(sel, selectedEvent);

  return (
    <Stack spacing="xs">
      <Select
        label="Al abrir la notificación, llevar a"
        data={TARGET_OPTIONS}
        value={sel.type}
        onChange={(v) => update({ ...EMPTY, type: (v as TargetType) || "none" })}
      />

      {sel.type === "noticia" && (
        <Select
          label="Noticia"
          placeholder={loadingNews ? "Cargando noticias..." : "Busca la noticia"}
          data={newsOptions}
          value={sel.newsId || null}
          onChange={(v) => update({ newsId: v || "" })}
          searchable
          nothingFound="Sin resultados"
          maxDropdownHeight={300}
        />
      )}

      {(sel.type === "evento" || sel.type === "agenda" || sel.type === "memorias") && (
        <Select
          label="Evento"
          placeholder={loadingEvents ? "Cargando eventos..." : "Busca el evento"}
          data={eventOptions}
          value={sel.eventId || null}
          onChange={(v) => update({ eventId: v || "" })}
          searchable
          nothingFound="Sin resultados"
          maxDropdownHeight={300}
        />
      )}

      {sel.type === "memoria" && (
        <>
          <Select
            label="Evento (para filtrar las memorias)"
            placeholder={loadingEvents ? "Cargando eventos..." : "Todos los eventos"}
            data={eventOptions}
            value={highlightEventId || null}
            onChange={(v) => {
              setHighlightEventId(v || "");
              update({ highlightId: "" });
            }}
            searchable
            clearable
            nothingFound="Sin resultados"
            maxDropdownHeight={300}
          />
          <Select
            label="Memoria"
            placeholder={loadingHighlights ? "Cargando memorias..." : "Busca la memoria"}
            data={highlightOptions}
            value={sel.highlightId || null}
            onChange={(v) => update({ highlightId: v || "" })}
            searchable
            nothingFound="Sin resultados"
            maxDropdownHeight={300}
          />
        </>
      )}

      {sel.type === "seccion" && (
        <Select
          label="Sección"
          data={SECTION_ROUTES}
          value={sel.section || null}
          onChange={(v) => update({ section: v || "" })}
        />
      )}

      {sel.type === "custom" && (
        <TextInput
          label="Ruta"
          placeholder="/home/components/novelty?newId=..."
          description="Ruta de expo-router dentro de la app"
          value={sel.custom}
          onChange={(e) => update({ custom: e.currentTarget.value })}
        />
      )}

      {sel.type !== "none" && (
        <Text size="xs" color="dimmed">
          Ruta: {currentRoute ? <Code>{currentRoute}</Code> : "selecciona un destino"}
        </Text>
      )}
    </Stack>
  );
};
