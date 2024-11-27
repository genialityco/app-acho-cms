import React from "react";
import { List } from "@refinedev/mantine";
import { Button, Center, Text, Stack } from "@mantine/core";

export const CertificatesList: React.FC = () => {
  const handleRedirect = () => {
    window.open(
      "https://gen-certificados.netlify.app/dashboard/organization/66f1d236ee78a23c67fada2a/events",
      "_blank"
    );
  };

  return (
    <List>
      <Center style={{ height: "80vh" }}>
        <Stack align="center" spacing="lg">
          <Text size="xl" weight={700}>
            Bienvenido a Certificados
          </Text>
          <Text size="sm" color="dimmed">
            Haz clic en el botón de abajo para ir al panel de certificados.
          </Text>
          <Button onClick={handleRedirect} size="md">
            Ir a Certificados
          </Button>
        </Stack>
      </Center>
    </List>
  );
};
