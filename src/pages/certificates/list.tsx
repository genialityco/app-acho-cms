import React, { useEffect, useState } from "react";
import { List } from "@refinedev/mantine";
import {
  Alert,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { IconExternalLink, IconAlertCircle } from "@tabler/icons-react";
import dayjs from "dayjs";
import { API_URL } from "../../components/dataProvider/customGenRestDataProvider";

// Organización ACHO (misma que usa el panel externo de certificados)
const ORGANIZATION_ID = "66f1d236ee78a23c67fada2a";

interface CertificateStat {
  eventId: string;
  eventName: string;
  startDate: string;
  attendeesCount: number; // total de registros del evento
  certifiedHoursCount: number; // registros con certificationHours > 0
  downloadersCount: number; // personas que descargaron al menos una vez
  totalDownloads: number; // descargas totales
}

interface EventAttendee {
  fullName: string;
  email: string;
  idNumber: string;
  certificationHours: string;
  certificateDownloads: number;
}

export const CertificatesList: React.FC = () => {
  const [stats, setStats] = useState<CertificateStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detalle de usuarios de un evento (modal)
  const [selectedEvent, setSelectedEvent] = useState<CertificateStat | null>(
    null
  );
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeesError, setAttendeesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_URL}/attendees/certificate-stats?organizationId=${ORGANIZATION_ID}`
        );
        const json = await response.json();
        setStats(json.data?.items ?? []);
      } catch (e) {
        console.error("Error al cargar estadísticas de certificados:", e);
        setError("No se pudieron cargar las estadísticas de certificados.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const openEventDetail = async (event: CertificateStat) => {
    setSelectedEvent(event);
    setAttendees([]);
    setAttendeesError(null);
    setAttendeesLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/attendees/certificate-stats/${event.eventId}/attendees`
      );
      const json = await response.json();
      setAttendees(json.data?.items ?? []);
    } catch (e) {
      console.error("Error al cargar usuarios del evento:", e);
      setAttendeesError("No se pudieron cargar los usuarios del evento.");
    } finally {
      setAttendeesLoading(false);
    }
  };

  const handleRedirect = () => {
    window.open(
      `https://gen-certificados.netlify.app/dashboard/organization/${ORGANIZATION_ID}/events`,
      "_blank"
    );
  };

  const totalDownloadsAll = stats.reduce(
    (acc, s) => acc + (s.totalDownloads ?? 0),
    0
  );

  return (
    <List
      title="Certificados"
      headerButtons={
        <Button
          variant="light"
          leftIcon={<IconExternalLink size={16} />}
          onClick={handleRedirect}
        >
          Panel de certificados
        </Button>
      }
    >
      <Stack spacing="md">
        <Group position="apart">
          <Text size="sm" color="dimmed">
            Eventos con certificados y sus descargas. Haz clic en un evento para
            ver sus usuarios.
          </Text>
          {!loading && !error && (
            <Badge size="lg" variant="filled">
              {totalDownloadsAll} descargas totales
            </Badge>
          )}
        </Group>

        {loading && (
          <Center style={{ height: "40vh" }}>
            <Loader />
          </Center>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
          >
            {error}
          </Alert>
        )}

        {!loading && !error && stats.length === 0 && (
          <Center style={{ height: "30vh" }}>
            <Text color="dimmed">No hay eventos con certificados todavía.</Text>
          </Center>
        )}

        {!loading && !error && stats.length > 0 && (
          <Table striped highlightOnHover withBorder verticalSpacing="sm">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th style={{ textAlign: "right" }}>Usuarios que asistieron</th>
                <th style={{ textAlign: "right" }}>Con horas certificadas</th>
                <th style={{ textAlign: "right" }}>Personas que descargaron</th>
                <th style={{ textAlign: "right" }}>Descargas totales</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr
                  key={s.eventId}
                  onClick={() => openEventDetail(s)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{s.eventName ?? "—"}</td>
                  <td>
                    {s.startDate ? dayjs(s.startDate).format("DD/MM/YYYY") : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>{s.attendeesCount ?? 0}</td>
                  <td style={{ textAlign: "right" }}>
                    {s.certifiedHoursCount ?? 0}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {s.downloadersCount ?? 0}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Badge variant="light">{s.totalDownloads ?? 0}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Stack>

      <Modal
        opened={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.eventName ?? "Usuarios del evento"}
        size="xl"
      >
        {attendeesLoading && (
          <Center style={{ height: "30vh" }}>
            <Loader />
          </Center>
        )}

        {attendeesError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
          >
            {attendeesError}
          </Alert>
        )}

        {!attendeesLoading && !attendeesError && attendees.length === 0 && (
          <Text color="dimmed">Este evento no tiene usuarios registrados.</Text>
        )}

        {!attendeesLoading && !attendeesError && attendees.length > 0 && (
          <Stack spacing="sm">
            <Text size="sm" color="dimmed">
              {attendees.length} usuarios
            </Text>
            <Table striped highlightOnHover withBorder verticalSpacing="xs">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Correo</th>
                  <th style={{ textAlign: "right" }}>Horas certificadas</th>
                  <th style={{ textAlign: "right" }}>Descargas</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a, i) => (
                  <tr key={a.email ?? i}>
                    <td>{a.fullName ?? "—"}</td>
                    <td>{a.idNumber ?? "—"}</td>
                    <td>{a.email ?? "—"}</td>
                    <td style={{ textAlign: "right" }}>
                      {a.certificationHours ?? "0"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {a.certificateDownloads ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Stack>
        )}
      </Modal>
    </List>
  );
};
