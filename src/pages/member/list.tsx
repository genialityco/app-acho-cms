import React from "react";
import { useTable } from "@refinedev/react-table";
import {
  type ColumnDef,
  flexRender,
  HeaderGroup,
  RowModel,
} from "@tanstack/react-table";
import { List, ShowButton, EditButton, DeleteButton } from "@refinedev/mantine";
import { Box, Group, ScrollArea, Table, Pagination } from "@mantine/core";
import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { IMember } from "../../interfaces";

export const MemberList: React.FC = () => {
  const columns = React.useMemo<ColumnDef<IMember>[]>(
    () => [
      {
        id: "properties.fullName",
        header: "Full Name",
        accessorKey: "properties.fullName",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "properties.email",
        header: "Email",
        accessorKey: "properties.email",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "properties.specialty",
        header: "Specialty",
        accessorKey: "properties.specialty",
      },
      {
        id: "properties.phone",
        header: "Phone",
        accessorKey: "properties.phone",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "memberActive",
        header: "Active Member",
        accessorKey: "memberActive",
        cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "_id",
        cell: ({ getValue }) => (
          <ActionButtons recordId={getValue() as string} />
        ),
      },
    ],
    []
  );

  const {
    getHeaderGroups,
    getRowModel,
    refineCore: { setCurrent, current, pageCount },
  } = useTable<IMember>({
    columns,
    initialState: {
      pagination: { pageSize: 10 }, // Asegúrate de que el tamaño sea razonable
    },
  });

  return (
    <ScrollArea>
      <List>
        <Table highlightOnHover verticalSpacing="sm" striped>
          <TableHeader getHeaderGroups={getHeaderGroups} />
          <TableBody getRowModel={getRowModel} />
        </Table>
        <Pagination
          position="right"
          total={pageCount || 1}
          value={current || 1}
          onChange={setCurrent}
          mt="md"
        />
      </List>
    </ScrollArea>
  );
};

// Componente para los botones de acción
const ActionButtons: React.FC<{ recordId: string }> = ({ recordId }) => (
  <Group spacing="xs" noWrap>
    <ShowButton hideText recordItemId={recordId} />
    <EditButton hideText recordItemId={recordId} />
    <DeleteButton hideText recordItemId={recordId} />
  </Group>
);

// Componente para el encabezado de la tabla
const TableHeader: React.FC<{
  getHeaderGroups: () => HeaderGroup<IMember>[];
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
const TableBody: React.FC<{ getRowModel: () => RowModel<IMember> }> = ({
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
