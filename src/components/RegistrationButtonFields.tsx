import React from "react";
import { Box, Paper, Select, Stack, Switch, Text, TextInput } from "@mantine/core";
import { AppLinkFields } from "./AppLinkPicker";

/**
 * Configuración del botón de inscripción que se ve en el detalle del evento
 * de la app (ver app-acho/components/event/EventDetail.tsx).
 *  - register: inscribe al usuario en el evento (queda en "inscritos")
 *  - link: abre un enlace externo o una pantalla de la app
 */
export type RegistrationButtonConfig = {
  enabled: boolean;
  text: string;
  action: "register" | "link";
  url: string;
};

export const DEFAULT_REGISTRATION_BUTTON: RegistrationButtonConfig = {
  enabled: true,
  text: "",
  action: "register",
  url: "",
};

export const toRegistrationButton = (value: any): RegistrationButtonConfig => ({
  ...DEFAULT_REGISTRATION_BUTTON,
  ...(value || {}),
});

type Props = {
  value: RegistrationButtonConfig;
  onChange: (value: RegistrationButtonConfig) => void;
};

export const RegistrationButtonFields: React.FC<Props> = ({ value, onChange }) => {
  const set = (patch: Partial<RegistrationButtonConfig>) => onChange({ ...value, ...patch });

  return (
    <Box mt="md">
      <Text weight={500} size="sm" color="gray.700" mb="xs">
        Botón de inscripción (app)
      </Text>
      <Paper p="md" withBorder>
        <Stack spacing="sm">
          <Switch
            label="Mostrar el botón en el detalle del evento"
            checked={value.enabled}
            onChange={(e) => set({ enabled: e.currentTarget.checked })}
          />

          {value.enabled && (
            <>
              <Select
                label="Al tocar el botón"
                data={[
                  {
                    value: "register",
                    label: "Inscribir al usuario en el evento (aparece en inscritos)",
                  },
                  { value: "link", label: "Abrir un enlace (externo o de la app)" },
                ]}
                value={value.action}
                onChange={(v) => set({ action: (v as RegistrationButtonConfig["action"]) || "register" })}
              />

              <TextInput
                label="Texto del botón"
                placeholder={value.action === "register" ? "Inscribirme" : "Más información"}
                description={
                  value.action === "register"
                    ? "Si se deja vacío se usa \"Inscribirme\". Una vez inscrito, el usuario ve \"Cancelar\"."
                    : undefined
                }
                value={value.text}
                onChange={(e) => set({ text: e.currentTarget.value })}
              />

              {value.action === "link" && (
                <AppLinkFields
                  label="Llevar a"
                  value={value.url}
                  onChange={(url) => set({ url })}
                />
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};
