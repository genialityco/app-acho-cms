import React, { useState } from "react";
import { useNotification } from "@refinedev/core";
import { ActionIcon, Button, Group, Modal, Stack, Text, Tooltip } from "@mantine/core";
import { IconKey } from "@tabler/icons-react";
import { API_URL } from "../../components/dataProvider/customGenRestDataProvider";

// Restablece en Firebase la contraseña del miembro a su número de documento
export const ResetPasswordButton: React.FC<{
  memberId: string;
  fullName?: string;
  idNumber?: string;
  hideText?: boolean;
}> = ({ memberId, fullName, idNumber, hideText }) => {
  const { open } = useNotification();
  const [confirmOpened, setConfirmOpened] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(
        `${API_URL}/members/${memberId}/reset-password`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || response.statusText);
      open?.({
        type: "success",
        message: "Contraseña restablecida",
        description: `Ingresa con ${data.data.email} y la contraseña ${data.data.idNumber}`,
      });
      setConfirmOpened(false);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      open?.({
        type: "error",
        message: "No se pudo restablecer la contraseña",
        description: error.message || "Ocurrió un error",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      {hideText ? (
        <Tooltip label="Restablecer contraseña al documento">
          <ActionIcon variant="default" onClick={() => setConfirmOpened(true)}>
            <IconKey size={18} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Button
          variant="default"
          leftIcon={<IconKey size={16} />}
          onClick={() => setConfirmOpened(true)}
        >
          Restablecer contraseña
        </Button>
      )}

      <Modal
        opened={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        title="Restablecer contraseña"
        centered
        size="sm"
      >
        <Stack spacing="md">
          <Text size="sm">
            La contraseña de acceso de <b>{fullName || "este miembro"}</b> pasará
            a ser su número de documento
            {idNumber ? (
              <>
                : <b>{idNumber}</b>
              </>
            ) : (
              "."
            )}
          </Text>
          <Text size="xs" color="dimmed">
            Se cerrarán las sesiones abiertas en la app.
          </Text>
          <Group position="right" spacing="sm" mt="md">
            <Button
              variant="outline"
              onClick={() => setConfirmOpened(false)}
              disabled={isResetting}
            >
              Cancelar
            </Button>
            <Button onClick={handleReset} loading={isResetting}>
              Restablecer
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
