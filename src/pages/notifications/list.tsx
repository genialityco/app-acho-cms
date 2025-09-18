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
} from "@mantine/core";
import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { INotificationTemplate } from "../../interfaces";
import { useNotification, useCreate, useList } from "@refinedev/core";
import { IconSend, IconUser } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";

// Error Boundary Component
const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({
  children,
  fallback,
}) => {
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
          />
        ),
      },
    ],
    []
  );

  // Configuración de la tabla
  const {
    getHeaderGroups,
    getRowModel,
    refineCore: { setCurrent, pageCount, current },
  } = useTable<INotificationTemplate>({ columns });

  return (
    <ErrorBoundary fallback={<Text color="red">Error loading notification templates. Please refresh the page.</Text>}>
      <ScrollArea>
        <List>
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

// Componente para los botones de acción
const ActionButtons: React.FC<{
  recordId: string;
  isSent: boolean;
  title: string;
  body: string;
}> = ({ recordId, isSent, title, body }) => {
  const { open } = useNotification();
  const { mutate: createNotification } = useCreate();
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);

  // Fetch members based on search
  const { data: membersData, refetch, isLoading, isError } = useList<{
    _id: string;
    properties: { email: string };
    userId: { expoPushToken: string };
  }>({
    resource: "members/search",
    queryOptions: { enabled: false },
    filters: debouncedSearch ? [
      {
        field: "properties.email",
        operator: "contains",
        value: debouncedSearch,
      },
    ] : [],
    pagination: {
      pageSize: 50,
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
      .filter(member => member.properties?.email && member.userId?.expoPushToken)
      .map((member) => ({
        value: member.properties.email,
        label: member.properties.email,
      }));
  }, [membersData?.data]);

  const handleSendNotification = async () => {
    try {
      await mutate({
        resource: "notifications/send-from-template",
        id: recordId,
        values: {},
      });

      open?.({
        type: "success",
        message: "Notification sent successfully",
      });
    } catch (error: any) {
      console.error("Send notification error:", error);
      open?.({
        type: "error",
        message: "Error sending notification",
        description: error.message || "An error occurred",
      });
    }
  };

  const handleSendIndividualNotification = async () => {
    if (selectedEmails.length === 0) {
      open?.({
        type: "error",
        message: "At least one recipient is required",
      });
      return;
    }

    try {
      // Find members corresponding to selected emails
      const selectedMembers = membersData?.data?.filter(member =>
        selectedEmails.includes(member.properties.email) && member.userId?.expoPushToken
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
          expoPushToken: member.userId.expoPushToken,
          title: title || "Notification",
          body: body || "You have a new notification",
          data: { userId: member.userId?._id || null },
          iconUrl: "",
        };
        
        console.log("Sending to:", member.properties.email, "Payload:", payload);
        
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
    }
  };

  const closeModal = () => {
    setModalOpened(false);
    setSelectedEmails([]);
    setSearchValue("");
  };

  return (
    <ErrorBoundary fallback={<Text color="red">Error in actions. Please try again.</Text>}>
      <Group spacing="xs" noWrap>
        <ShowButton hideText recordItemId={recordId} />
        <EditButton hideText recordItemId={recordId} />
        {!isSent && (
          <ActionIcon
            variant="default"
            onClick={handleSendNotification}
            title="Send Notification to All"
          >
            <IconSend />
          </ActionIcon>
        )}
        <ActionIcon
          variant="default"
          onClick={() => setModalOpened(true)}
          title="Send Individual Notification"
        >
          <IconUser />
        </ActionIcon>
        <DeleteButton hideText recordItemId={recordId} />
      </Group>

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
          rightSection={isLoading ? <Loader size="xs" /> : null}
          error={isError ? "Error loading members" : null}
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
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={handleSendIndividualNotification}
            disabled={selectedEmails.length === 0 || isLoading}
          >
            Send to {selectedEmails.length} recipient(s)
          </Button>
        </Group>
      </Modal>
    </ErrorBoundary>
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
                    header.getContext()
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

function mutate(arg0: { resource: string; id: string; values: {}; }) {
  throw new Error("Function not implemented.");
}
