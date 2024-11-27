import React from "react";
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
} from "@mantine/core";
import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { INotificationTemplate } from "../../interfaces";
import { useNotification, useUpdate } from "@refinedev/core";
import { IconSend } from "@tabler/icons-react";

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
        cell: ({ getValue }) => (
          <ActionButtons recordId={getValue() as string} isSent={false} />
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
  );
};

// Componente para los botones de acción
const ActionButtons: React.FC<{ recordId: string; isSent: boolean }> = ({
  recordId,
  isSent,
}) => {
  const { open } = useNotification();
  const { mutate } = useUpdate();

  const handleSendNotification = async () => {
    try {
      await mutate({
        resource: "notifications/send-from-template",
        id: recordId,
        values: {}, // No es necesario enviar payload adicional
      });

      open?.({
        type: "success",
        message: "Notification sent successfully",
      });
    } catch (error) {
      open?.({
        type: "error",
        message: "Error sending notification",
        description: error.message,
      });
    }
  };

  return (
    <Group spacing="xs" noWrap>
      <ShowButton hideText recordItemId={recordId} />
      <EditButton hideText recordItemId={recordId} />
      {!isSent && (
        <ActionIcon variant="default" onClick={handleSendNotification}>
          <IconSend />
        </ActionIcon>
      )}
      <DeleteButton hideText recordItemId={recordId} />
    </Group>
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
