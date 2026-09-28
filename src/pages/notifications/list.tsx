import React, { useState, useEffect } from "react";
import { useTable } from "@refinedev/react-table";
import {
  type ColumnDef,
  flexRender,
  HeaderGroup,
  RowModel,
} from "@tanstack/react-table";
import { List, ShowButton, EditButton, DeleteButton } from "@refinedev/mantine";
import {
  Box,
  Group,
  ScrollArea,
  Table,
  Pagination,
  ActionIcon,
  Modal,
  MultiSelect,
  Button,
  Text,
  Loader,
  Stack,
  Textarea,
  Alert,
  Badge,
  FileButton,
} from "@mantine/core";
import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { INotificationTemplate } from "../../interfaces";
import {
  useNotification,
  useCreate,
  useList,
  useUpdate,
  useInvalidate,
} from "@refinedev/core";
import {
  IconSend,
  IconUser,
  IconAlertTriangle,
  IconTrash,
  IconBell,
  IconListCheck,
} from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { API_URL } from "../../components/dataProvider/customGenRestDataProvider";

// Error Boundary Component
const ErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Uncaught error:", error);
      setHasError(true);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) return <>{fallback}</>;
  return <>{children}</>;
};

export const NotificationTemplateList: React.FC = () => {
  // Definición de columnas
  const columns = React.useMemo<ColumnDef<INotificationTemplate>[]>(
    () => [
      {
        id: "title",
        header: "Title",
        accessorKey: "title",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "isSent",
        header: "Sent",
        accessorKey: "isSent",
        cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
        enableColumnFilter: false,
      },
      {
        id: "totalSent",
        header: "Total Sent",
        accessorKey: "totalSent",
        enableColumnFilter: false,
      },
      {
        id: "createdAt",
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ getValue }) => (
          <span>{new Date(getValue() as string).toLocaleString()}</span>
        ),
        enableColumnFilter: false,
      },
      {
        id: "scheduledAt",
        header: "Scheduled At",
        accessorKey: "scheduledAt",
        cell: ({ getValue }) => (
          <span>{new Date(getValue() as string).toLocaleString()}</span>
        ),
        enableColumnFilter: false,
      },
      {
        id: "recipientEmails",
        header: "Destinatarios",
        accessorKey: "recipientEmails",
        cell: ({ getValue }) => {
          const list = (getValue() as string[] | undefined) || [];
          return list.length ? (
            <Badge color="blue">Lista ({list.length})</Badge>
          ) : (
            <Badge color="gray">Todos</Badge>
          );
        },
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ getValue, row }) => (
          <ActionButtons
            recordId={getValue() as string}
            isSent={false}
            title={row.original.title}
            body={row.original.body}
            template={row.original}
          />
        ),
      },
    ],
    [],
  );

  // Configuración de la tabla
  const {
    getHeaderGroups,
    getRowModel,
    refineCore: { setCurrent, pageCount, current },
  } = useTable<INotificationTemplate>({ columns });

  return (
    <ErrorBoundary
      fallback={
        <Text color="red">
          Error loading notification templates. Please refresh the page.
        </Text>
      }
    >
      <ScrollArea>
        <List
          headerButtons={({ defaultButtons }) => (
            <>
              <VisibleNotificationsControl />
              {defaultButtons}
            </>
          )}
        >
          <Table highlightOnHover verticalSpacing="sm" striped>
            <TableHeader getHeaderGroups={getHeaderGroups} />
            <TableBody getRowModel={getRowModel} />
          </Table>
          <Pagination
            position="right"
            total={pageCount}
            value={current}
            onChange={setCurrent}
            mt="md"
          />
        </List>
      </ScrollArea>
    </ErrorBoundary>
  );
};

// Control de notificaciones visibles: muestra el conteo y permite vaciarlas
const VisibleNotificationsControl: React.FC = () => {
  const { open } = useNotification();
  const [isClearing, setIsClearing] = useState(false);
  const [confirmOpened, setConfirmOpened] = useState(false);

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const response = await fetch(`${API_URL}/notifications/clear-visible`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(response.statusText);
      open?.({
        type: "success",
        message: "Notificaciones vaciadas",
        description: "Ya no se mostrarán en la app.",
      });
      setConfirmOpened(false);
    } catch (error: any) {
      console.error("Error clearing visible notifications:", error);
      open?.({
        type: "error",
        message: "Error al vaciar las notificaciones",
        description: error.message || "Ocurrió un error",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Group spacing="xs" noWrap>
        <Button
          color="red"
          variant="outline"
          leftIcon={<IconTrash size={16} />}
          onClick={() => setConfirmOpened(true)}
        >
          Vaciar
        </Button>
      </Group>

      <Modal
        opened={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        title="Vaciar notificaciones"
        centered
        size="sm"
      >
        <Stack spacing="md">
          <Group spacing="xs">
            <IconAlertTriangle size={20} color="orange" />
            <Text weight={500}>Confirmar acción</Text>
          </Group>
          <Text size="xs" color="red">
            Esta acción no se puede deshacer.
          </Text>
          <Group position="right" spacing="sm" mt="md">
            <Button
              variant="outline"
              onClick={() => setConfirmOpened(false)}
              disabled={isClearing}
            >
              Cancelar
            </Button>
            <Button color="red" onClick={handleClear} loading={isClearing}>
              {isClearing ? "Vaciando..." : "Vaciar"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

// Componente para los botones de acción
const ActionButtons: React.FC<{
  recordId: string;
  isSent: boolean;
  title: string;
  body: string;
  template: INotificationTemplate;
}> = ({ recordId, isSent, title, body, template }) => {
  const { open } = useNotification();
  const { mutate: createNotification } = useCreate();
  const { mutate } = useUpdate();
  const [modalOpened, setModalOpened] = useState(false);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [listModalOpened, setListModalOpened] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch members based on search
  const {
    data: membersData,
    refetch,
    isLoading: isFetching,
    isError,
  } = useList<{
    _id: string;
    properties: { email: string };
    user: { expoPushToken: string; _id: string } | null;
  }>({
    resource: "members/searchByEmail",
    queryOptions: { enabled: false },
    filters: debouncedSearch
      ? [
          {
            field: "properties.email",
            operator: "contains",
            value: debouncedSearch,
          },
        ]
      : [],
    pagination: {
      pageSize: 10,
    },
  });

  // Refetch when debounced search changes
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.length >= 2) {
      console.log("Refetching with search:", debouncedSearch);
      refetch().catch((error) => {
        console.error("Search error:", error);
        open?.({
          type: "error",
          message: "Error searching members",
          description: error.message || "An error occurred",
        });
      });
    }
  }, [debouncedSearch, refetch, open]);

  // Transform members data to MultiSelect format
  const memberOptions = React.useMemo(() => {
    if (!membersData?.data) return [];
    return membersData.data
      .filter(
        (member) => member.properties?.email && member.user?.expoPushToken,
      )
      .map((member) => ({
        value: member.properties.email,
        label: member.properties.email,
      }));
  }, [membersData?.data]);

  const handleConfirmSendNotification = async () => {
    setIsLoading(true);
    try {
      await mutate({
        resource: "notifications/send-from-template",
        id: recordId,
        values: {},
      });

      open?.({
        type: "success",
        message: "Notification sent successfully",
        description: "The notification has been sent to all recipients",
      });
      setConfirmModalOpened(false);
    } catch (error: any) {
      console.error("Send notification error:", error);
      open?.({
        type: "error",
        message: "Error sending notification",
        description: error.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = () => {
    setConfirmModalOpened(true);
  };

  const handleSendIndividualNotification = async () => {
    if (selectedEmails.length === 0) {
      open?.({
        type: "error",
        message: "At least one recipient is required",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Find members corresponding to selected emails
      const selectedMembers =
        membersData?.data?.filter(
          (member) =>
            selectedEmails.includes(member.properties.email) &&
            member.user?.expoPushToken,
        ) || [];

      if (selectedMembers.length === 0) {
        open?.({
          type: "error",
          message: "No valid recipients with expoPushToken found",
        });
        return;
      }

      // Send notification for each selected member
      for (const member of selectedMembers) {
        const payload = {
          expoPushToken: member.user?.expoPushToken,
          title: title || "Notification",
          body: body || "You have a new notification",
          data: { userId: member.user?._id || null, recordId: recordId },
          iconUrl: "",
        };

        console.log(
          "Sending to:",
          member.properties.email,
          "Payload:",
          payload,
        );

        await createNotification({
          resource: "notifications/send",
          values: payload,
        });
      }

      open?.({
        type: "success",
        message: `Individual notification sent successfully to ${selectedEmails.length} recipient(s)`,
      });
      closeModal();
    } catch (error: any) {
      console.error("Send individual notification error:", error);
      open?.({
        type: "error",
        message: "Error sending individual notification",
        description: error.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpened(false);
    setSelectedEmails([]);
    setSearchValue("");
  };

  const closeConfirmModal = () => {
    setConfirmModalOpened(false);
  };

  return (
    <ErrorBoundary
      fallback={<Text color="red">Error in actions. Please try again.</Text>}
    >
      <Group spacing="xs" noWrap>
        <ShowButton hideText recordItemId={recordId} />
        <EditButton hideText recordItemId={recordId} />
        {!isSent && (
          <ActionIcon
            variant="default"
            onClick={handleSendNotification}
            title="Send Notification to All"
            disabled={isLoading}
          >
            <IconSend />
          </ActionIcon>
        )}
        <ActionIcon
          variant="default"
          onClick={() => setModalOpened(true)}
          title="Send Individual Notification"
          disabled={isLoading}
        >
          <IconUser />
        </ActionIcon>
        <ActionIcon
          variant="default"
          onClick={() => setListModalOpened(true)}
          title="Lista de destinatarios del envío programado"
          disabled={isLoading}
        >
          <IconListCheck />
        </ActionIcon>
        <DeleteButton hideText recordItemId={recordId} />
      </Group>

      <SendToListModal
        opened={listModalOpened}
        onClose={() => setListModalOpened(false)}
        template={template}
      />

      {/* Modal de confirmación para envío masivo */}
      <Modal
        opened={confirmModalOpened}
        onClose={closeConfirmModal}
        title="Confirm Send Notification"
        centered
        size="sm"
      >
        <Stack spacing="md">
          <Group spacing="xs">
            <IconAlertTriangle size={20} color="orange" />
            <Text weight={500}>Confirm Action</Text>
          </Group>

          <Text size="sm" color="dimmed">
            Are you sure you want to send this notification to all recipients?
          </Text>

          <Box
            p="sm"
            style={{ backgroundColor: "#f8f9fa", borderRadius: "4px" }}
          >
            <Text size="sm" weight={500} mb="xs">
              Notification Details:
            </Text>
            <Text size="sm">
              <strong>Title:</strong> {title}
            </Text>
            <Text size="sm" style={{ wordBreak: "break-word" }}>
              <strong>Body:</strong> {body}
            </Text>
          </Box>

          <Text size="xs" color="red">
            This action cannot be undone.
          </Text>

          <Group position="right" spacing="sm" mt="md">
            <Button
              variant="outline"
              onClick={closeConfirmModal}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleConfirmSendNotification}
              loading={isLoading}
            >
              {isLoading ? "Sending..." : "Send Notification"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal para notificaciones individuales */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="Send Individual Notification"
        centered
        size="md"
      >
        <MultiSelect
          label="Recipient Emails"
          placeholder="Type to search member emails (min 2 characters)"
          description="Search and select multiple email addresses"
          data={memberOptions}
          value={selectedEmails}
          onChange={setSelectedEmails}
          searchable
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          clearable
          mb="md"
          maxSelectedValues={100}
          nothingFound={
            debouncedSearch && debouncedSearch.length >= 2
              ? "No members found with that email"
              : "Type at least 2 characters to search"
          }
          dropdownPosition="bottom"
          withinPortal
          rightSection={isFetching ? <Loader size="xs" /> : null}
          error={isError ? "Error loading members" : null}
          disabled={isLoading}
        />
        {selectedEmails.length > 0 && (
          <Text size="sm" color="dimmed" mb="md">
            {selectedEmails.length} recipient(s) selected
          </Text>
        )}
        {isError && (
          <Text color="red" size="sm" mb="md">
            Failed to load members. Please try again.
          </Text>
        )}
        <Group position="right" spacing="sm">
          <Button variant="outline" onClick={closeModal} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSendIndividualNotification}
            disabled={selectedEmails.length === 0 || isLoading}
            loading={isLoading}
          >
            {isLoading
              ? "Sending..."
              : `Send to ${selectedEmails.length} recipient(s)`}
          </Button>
        </Group>
      </Modal>
    </ErrorBoundary>
  );
};

// Extrae los correos de un texto pegado o de un archivo (una columna, CSV, separados por coma o salto de línea)
const parseEmails = (text: string): string[] =>
  Array.from(
    new Set(
      (text.match(/[^\s,;<>"']+@[^\s,;<>"']+\.[^\s,;<>"']+/g) || []).map((e) =>
        e.trim().toLowerCase(),
      ),
    ),
  );

type ListPreview = {
  totalEmails: number;
  withApp: string[];
  withoutApp: string[];
  invalid: string[];
  sharedToken: string[];
};

type ListResult = {
  sent: number;
  failed: { email: string; message: string }[];
  withoutApp: string[];
};

// Lista de destinatarios del template: pegar/cargar -> revisar -> enviar ahora,
// o guardar para que el cron la envíe a la hora programada.
const SendToListModal: React.FC<{
  opened: boolean;
  onClose: () => void;
  template: INotificationTemplate;
}> = ({ opened, onClose, template }) => {
  const { open } = useNotification();
  const invalidate = useInvalidate();
  const savedList = template.recipientEmails || [];
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ListPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [result, setResult] = useState<ListResult | null>(null);

  useEffect(() => {
    if (opened) {
      setText(savedList.join("\n"));
      setPreview(null);
      setConfirmSend(false);
      setResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const emails = React.useMemo(() => parseEmails(text), [text]);
  const scheduledAt = template.scheduledAt
    ? new Date(template.scheduledAt)
    : null;

  const handleClose = () => {
    if (!loading) onClose();
  };

  const request = async (
    method: "POST" | "PUT",
    path: string,
    list: string[],
  ) => {
    const response = await fetch(
      `${API_URL}/notifications/${path}/${template._id}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: list }),
      },
    );
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json?.message || response.statusText);
    return json;
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      setPreview(await request("POST", "preview-list", emails));
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error al revisar la lista",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const save = async (list: string[]) => {
    setLoading(true);
    try {
      const res = await request("PUT", "recipients", list);
      invalidate({ resource: "notification-templates", invalidates: ["list"] });
      open?.({
        type: "success",
        message: list.length
          ? `Lista guardada: ${res.withApp.length} recibirán la notificación`
          : "Lista quitada: el template se enviará a todos",
      });
      onClose();
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error al guardar la lista",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async () => {
    setLoading(true);
    try {
      const res: ListResult = await request("POST", "send-to-list", emails);
      setResult(res);
      setConfirmSend(false);
      invalidate({ resource: "notification-templates", invalidates: ["list"] });
      open?.({
        type: "success",
        message: `Notificación enviada a ${res.sent} usuario(s)`,
      });
    } catch (error: any) {
      open?.({
        type: "error",
        message: "Error al enviar",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setText(await file.text());
    setPreview(null);
  };

  const EmailGroup: React.FC<{
    label: string;
    color: string;
    items: string[];
  }> = ({ label, color, items }) =>
    items.length ? (
      <Box>
        <Group spacing="xs" mb={4}>
          <Badge color={color}>{items.length}</Badge>
          <Text size="sm" weight={500}>
            {label}
          </Text>
        </Group>
        <Box style={{ maxHeight: 120, overflowY: "auto" }}>
          <Text size="xs" color="dimmed" style={{ wordBreak: "break-all" }}>
            {items.join(", ")}
          </Text>
        </Box>
      </Box>
    ) : null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Lista de destinatarios"
      centered
      size="lg"
    >
      <Stack spacing="md">
        <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
          <Text size="sm">
            <strong>Título:</strong> {template.title}
          </Text>
          <Text size="sm" style={{ wordBreak: "break-word" }}>
            <strong>Mensaje:</strong> {template.body}
          </Text>
          <Text size="sm">
            <strong>Envío programado:</strong>{" "}
            {scheduledAt ? scheduledAt.toLocaleString() : "sin programar"}
          </Text>
          <Text size="sm">
            <strong>Destinatarios actuales:</strong>{" "}
            {savedList.length
              ? `lista de ${savedList.length} correo(s)`
              : "todos los usuarios"}
          </Text>
        </Box>

        {result ? (
          <Stack spacing="sm">
            <Alert color="green">Enviadas correctamente: {result.sent}</Alert>
            <EmailGroup
              label="Fallaron"
              color="red"
              items={result.failed.map((f) => `${f.email} (${f.message})`)}
            />
            <EmailGroup
              label="No tienen la app instalada"
              color="gray"
              items={result.withoutApp}
            />
            <Group position="right">
              <Button onClick={onClose}>Cerrar</Button>
            </Group>
          </Stack>
        ) : (
          <>
            {template.isSent && (
              <Alert color="gray">
                Este template ya fue enviado: el envío programado ya no aplica,
                pero puedes usar "Enviar ahora".
              </Alert>
            )}

            <Textarea
              label="Correos"
              description="Pega los correos (uno por línea, o separados por coma) o carga un archivo .txt / .csv"
              minRows={6}
              maxRows={12}
              autosize
              value={text}
              onChange={(e) => {
                setText(e.currentTarget.value);
                setPreview(null);
              }}
              disabled={loading}
            />
            <Group position="apart">
              <FileButton
                onChange={handleFile}
                accept=".txt,.csv,text/plain,text/csv"
              >
                {(props) => (
                  <Button
                    variant="subtle"
                    size="xs"
                    {...props}
                    disabled={loading}
                  >
                    Cargar archivo
                  </Button>
                )}
              </FileButton>
              <Text size="sm" color="dimmed">
                {emails.length} correo(s) detectado(s)
              </Text>
            </Group>

            {preview && (
              <Stack spacing="sm">
                <EmailGroup
                  label="Recibirán la notificación (tienen la app)"
                  color="green"
                  items={preview.withApp}
                />
                <EmailGroup
                  label="No tienen la app instalada"
                  color="gray"
                  items={preview.withoutApp}
                />
                <EmailGroup
                  label="Comparten dispositivo con otro correo de la lista (se envía una vez)"
                  color="blue"
                  items={preview.sharedToken}
                />
                <EmailGroup
                  label="Correos inválidos (no se guardan)"
                  color="red"
                  items={preview.invalid}
                />
                <Alert color="blue">
                  <strong>Enviar ahora:</strong> la envía de inmediato a estos{" "}
                  {preview.withApp.length} usuario(s).
                  <br />
                  <strong>Guardar para envío programado:</strong> el envío
                  {scheduledAt
                    ? ` del ${scheduledAt.toLocaleString()}`
                    : ""}{" "}
                  irá solo a esta lista, no a todos. La app se revisa de nuevo
                  al momento del envío.
                </Alert>
                {!template.isSent && !scheduledAt && (
                  <Alert color="orange" icon={<IconAlertTriangle size={16} />}>
                    El template no tiene fecha programada: para usar el envío
                    programado, edítalo y asigna una.
                  </Alert>
                )}
              </Stack>
            )}

            <Group position="apart">
              <Box>
                {savedList.length > 0 && (
                  <Button
                    color="red"
                    variant="subtle"
                    onClick={() => save([])}
                    disabled={loading}
                  >
                    Quitar lista (enviar a todos)
                  </Button>
                )}
              </Box>
              <Group spacing="sm">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                {!preview ? (
                  <Button
                    onClick={handlePreview}
                    loading={loading}
                    disabled={emails.length === 0}
                  >
                    Revisar lista
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="light"
                      onClick={() => save(emails)}
                      loading={loading && !confirmSend}
                      disabled={
                        preview.withApp.length === 0 ||
                        template.isSent ||
                        loading
                      }
                    >
                      Guardar para envío programado
                    </Button>
                    <Button
                      leftIcon={<IconSend size={16} />}
                      onClick={() => setConfirmSend(true)}
                      disabled={preview.withApp.length === 0 || loading}
                    >
                      Enviar ahora
                    </Button>
                  </>
                )}
              </Group>
            </Group>

            {confirmSend && preview && (
              <Alert
                color="orange"
                icon={<IconAlertTriangle size={16} />}
                title="Confirmar envío inmediato"
              >
                <Text size="sm" mb="sm">
                  Se enviará ahora a {preview.withApp.length} usuario(s). Esta
                  acción no se puede deshacer.
                </Text>
                <Group position="right" spacing="sm">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setConfirmSend(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="xs"
                    color="orange"
                    onClick={handleSendNow}
                    loading={loading}
                  >
                    Sí, enviar ahora
                  </Button>
                </Group>
              </Alert>
            )}
          </>
        )}
      </Stack>
    </Modal>
  );
};

// Componente para el encabezado de la tabla
const TableHeader: React.FC<{
  getHeaderGroups: () => HeaderGroup<INotificationTemplate>[];
}> = ({ getHeaderGroups }) => (
  <thead>
    {getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th key={header.id}>
            {!header.isPlaceholder && (
              <Group spacing="xs" noWrap>
                <Box>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Box>
                <Group spacing="xs" noWrap>
                  <ColumnSorter column={header.column} />
                  <ColumnFilter column={header.column} />
                </Group>
              </Group>
            )}
          </th>
        ))}
      </tr>
    ))}
  </thead>
);

// Componente para el cuerpo de la tabla
const TableBody: React.FC<{
  getRowModel: () => RowModel<INotificationTemplate>;
}> = ({ getRowModel }) => (
  <tbody>
    {getRowModel().rows.map((row) => (
      <tr key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);
