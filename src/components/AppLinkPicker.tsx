import React, { useEffect, useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button, Group, Modal, Select, Stack, Text, TextInput } from "@mantine/core";

/**
 * Enlaces que la app móvil sabe abrir (ver app-acho/utils/appLinks.ts):
 *  - achoapp://evento/<eventId>
 *  - achoapp://noticia/<newsId>
 *  - achoapp://seccion/<nombre>
 *  - https://...  (se abre fuera de la app)
 */
const ORGANIZATION_ID = "66f1d236ee78a23c67fada2a";

type TargetType = "evento" | "seccion" | "noticia" | "web";

const TARGET_OPTIONS: { value: TargetType; label: string }[] = [
  { value: "evento", label: "Evento" },
  { value: "seccion", label: "Sección de la app" },
  { value: "noticia", label: "Otra noticia" },
  { value: "web", label: "Enlace web (fuera de la app)" },
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

const parseLink = (url?: string | null): { type: TargetType; value: string } => {
  const match = (url || "").trim().match(/^achoapp:\/\/([^/?#]+)\/?([^?#]*)/i);
  if (match) {
    const type = match[1].toLowerCase() as TargetType;
    if (type === "evento" || type === "seccion" || type === "noticia") {
      return { type, value: decodeURIComponent(match[2] || "") };
    }
  }
  if (url && /^https?:\/\//i.test(url.trim())) return { type: "web", value: url.trim() };
  return { type: "evento", value: "" };
};

const buildLink = (type: TargetType, value: string): string => {
  const v = value.trim();
  if (!v) return "";
  if (type === "web") return v;
  return `achoapp://${type}/${encodeURIComponent(v)}`;
};

type AppLinkFieldsProps = {
  value?: string | null;
  onChange: (url: string) => void;
};

/** Selector de destino: devuelve la URL armada ("" si está incompleto). */
export const AppLinkFields: React.FC<AppLinkFieldsProps> = ({ value, onChange }) => {
  const initial = useMemo(() => parseLink(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [type, setType] = useState<TargetType>(initial.type);
  const [target, setTarget] = useState<string>(initial.value);

  // Si el valor llega después (edición cargada desde la API), sincronizar
  useEffect(() => {
    if (!value || value === buildLink(type, target)) return;
    const parsed = parseLink(value);
    setType(parsed.type);
    setTarget(parsed.value);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: eventsData, isLoading: loadingEvents } = useList({
    resource: "events",
    pagination: { current: 1, pageSize: 500, mode: "server" },
    filters: [{ field: "organizationId", operator: "eq", value: ORGANIZATION_ID }],
    sorters: [{ field: "startDate", order: "desc" }],
    queryOptions: { enabled: type === "evento" },
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

  const update = (nextType: TargetType, nextTarget: string) => {
    setType(nextType);
    setTarget(nextTarget);
    onChange(buildLink(nextType, nextTarget));
  };

  return (
    <Stack spacing="xs">
      <Select
        label="Destino"
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

      {type === "seccion" && (
        <Select
          label="Sección"
          data={APP_SECTIONS}
          value={target || null}
          onChange={(v) => update("seccion", v || "")}
        />
      )}

      {type === "noticia" && (
        <TextInput
          label="ID de la noticia"
          description="Es el último segmento de la URL al editar la noticia"
          value={target}
          onChange={(e) => update("noticia", e.currentTarget.value)}
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
