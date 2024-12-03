import { Container, Text, Anchor, Stack, Center, Title, Group } from '@mantine/core';
import { IconBrandAndroid, IconApple } from '@tabler/icons-react';

export default function AppStatisticsLinks() {
  return (
    <Center style={{ height: '100vh' }}>
      <Container size="sm" p="lg" style={{ textAlign: 'center' }}>
        <Stack spacing="md" align="center">
          <Title order={2}>Estadísticas de la App</Title>
          <Text>
            Para ver las estadísticas de la app, por favor seleccione su plataforma:
          </Text>
          <Group spacing="xl">
            <Anchor
              href="https://play.google.com/console/u/1/developers/5756729651370207928/app/4972985781024468330/tracks/production"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Stack spacing={4} align="center">
                <IconBrandAndroid size={40} />
                <Text>Android</Text>
              </Stack>
            </Anchor>
            <Anchor
              href="https://appstoreconnect.apple.com/analytics/app/d30/6736631927/overview?iaemeasure=totalDownloads"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Stack spacing={4} align="center">
                <IconApple size={40} />
                <Text>iOS</Text>
              </Stack>
            </Anchor>
          </Group>
        </Stack>
      </Container>
    </Center>
  );
}
