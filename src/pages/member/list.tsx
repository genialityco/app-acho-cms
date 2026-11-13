import React from "react";
import { useTable } from "@refinedev/react-table";
import {
  type ColumnDef,
  flexRender,
  HeaderGroup,
  RowModel,
} from "@tanstack/react-table";
import { List, ShowButton, EditButton, DeleteButton } from "@refinedev/mantine";
import { Box, Group, ScrollArea, Table, Pagination, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { IMember } from "../../interfaces";
import DropdownFilter from "../../components/Dropdown";
import { ResetPasswordButton } from "./ResetPasswordButton";

// Columna oculta que lleva la busqueda general: el backend convierte "a|b|c" en un $or
const SEARCH_COLUMN_ID =
  "properties.fullName|properties.idNumber|properties.email|properties.phone";

export const MemberList: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);

  const columns = React.useMemo<ColumnDef<IMember>[]>(
    () => [
      {
        id: SEARCH_COLUMN_ID,
        accessorFn: () => "",
        header: "",
        enableSorting: false,
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "properties.fullName",
        header: "Full Name",
        accessorKey: "properties.fullName",
        enableColumnFilter: false,
      },
      {
        id: "properties.idNumber",
        header: "ID Number",
        accessorKey: "properties.idNumber",
        enableColumnFilter: false,
      },
      {
        id: "properties.email",
        header: "Email",
        accessorKey: "properties.email",
        enableColumnFilter: false,
      },
      {
        id: "properties.specialty",
        header: "Specialty",
        accessorKey: "properties.specialty",
        meta: {
          filterOperator: "contains",

          filterElement: {
            component: DropdownFilter,
            meta: {
              options: ["Psicología", "Epidemiología", "Hematología", "Oncología", "Otro",],
            },
            // Options to display in the dropdown
          },
        },
      },
      {
        id: "properties.phone",
        header: "Phone",
        accessorKey: "properties.phone",
        enableColumnFilter: false,
      },
      {
        id: "memberActive",
        header: "Active Member",
        accessorKey: "memberActive",
        cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
        enableColumnFilter: false,
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => <ActionButtons record={row.original} />,
      },
    ],
    []
  );

  const {
    getHeaderGroups,
    getRowModel,
    getColumn,
    refineCore: { setCurrent, current, pageCount },
  } = useTable<IMember>({
    columns,
    initialState: {
      pagination: { pageSize: 10 }, // Asegúrate de que el tamaño sea razonable
      columnVisibility: { [SEARCH_COLUMN_ID]: false },
    },
  });

  React.useEffect(() => {
    const value = debouncedSearch.trim();
    getColumn(SEARCH_COLUMN_ID)?.setFilterValue(value || undefined);
  }, [debouncedSearch]);

  return (
    <ScrollArea>
      <List>
        <TextInput
          placeholder="Buscar por nombre, documento, correo o celular"
          icon={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          mb="md"
          maw={480}
          autoComplete="off"
        />
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
const ActionButtons: React.FC<{ record: IMember }> = ({ record }) => (
  <Group spacing="xs" noWrap>
    <ShowButton hideText recordItemId={record._id} />
    <EditButton hideText recordItemId={record._id} />
    <ResetPasswordButton
      hideText
      memberId={record._id}
      fullName={record.properties?.fullName}
      idNumber={record.properties?.idNumber}
    />
    <DeleteButton hideText recordItemId={record._id} />
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
