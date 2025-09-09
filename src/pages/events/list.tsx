import React from "react";
import { useTable } from "@refinedev/react-table";
import {
  type ColumnDef,
  flexRender,
  HeaderGroup,
  RowModel,
} from "@tanstack/react-table";
import {
  List,
  ShowButton,
  EditButton,
  DeleteButton,
  DateField,
} from "@refinedev/mantine";
import { Box, Group, ScrollArea, Table, Pagination } from "@mantine/core";
import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { IEvent } from "../../interfaces";

export const EventList: React.FC = () => {
  // Definición de columnas
  const columns = React.useMemo<ColumnDef<IEvent>[]>(
    () => [
      {
        id: "_id",
        header: "ID",
        accessorKey: "_id",
        meta: {
          filterOperator: "eq",
        },
      },
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "startDate",
        header: "Start Date",
        accessorKey: "startDate",
        cell: ({ getValue }) => (
          <DateField value={getValue() as string} format="LLL" />
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
          <ActionButtons recordId={getValue() as string} />
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
  } = useTable<IEvent>({ columns });

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
const ActionButtons: React.FC<{ recordId: string }> = ({ recordId }) => {
  return (
    <Group spacing="xs" noWrap>
      <ShowButton hideText recordItemId={recordId} />
      <EditButton hideText recordItemId={recordId} />
      <DeleteButton hideText recordItemId={recordId} />
    </Group>
  );
};

// Componente para el encabezado de la tabla
const TableHeader: React.FC<{
  getHeaderGroups: () => HeaderGroup<IEvent>[];
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
const TableBody: React.FC<{ getRowModel: () => RowModel<IEvent> }> = ({
  getRowModel,
}) => (
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
