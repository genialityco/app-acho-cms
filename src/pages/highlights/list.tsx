import React from "react";
import { useTable } from "@refinedev/react-table";
import {
  type ColumnDef,
  flexRender,
  HeaderGroup,
  RowModel,
} from "@tanstack/react-table";
import { List, EditButton, DeleteButton, CreateButton, ShowButton } from "@refinedev/mantine";
import {
  Box,
  Group,
  ScrollArea,
  Table,
  Pagination,
  Center,
  Stack,
  Text,
} from "@mantine/core";
import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { IHighlight } from "../../interfaces";

export const HighlightList: React.FC = () => {
  const columns = React.useMemo<ColumnDef<IHighlight>[]>(() => [
    {
      id: "name",
      header: "Nombre",
      accessorKey: "name",
      meta: {
        filterOperator: "contains",
      },
    },
    {
      id: "description",
      header: "Descripción",
      accessorKey: "description",
      meta: {
        filterOperator: "contains",
      },
    },
    {
      id: "vimeoUrl",
      header: "Video",
      accessorKey: "vimeoUrl",
      cell: ({ getValue }) => (
        <a
          href={getValue() as string}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver Video
        </a>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      accessorKey: "_id",
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ getValue }) => (
        <Group spacing="xs" noWrap>
          <ShowButton hideText recordItemId={getValue() as string} />
          <EditButton hideText recordItemId={getValue() as string} />
          <DeleteButton hideText recordItemId={getValue() as string} />

        </Group>
      ),
    },
  ], []);

  const {
    getHeaderGroups,
    getRowModel,
    refineCore: { setCurrent, pageCount, current },
  } = useTable<IHighlight>({ columns });

  // Verificar si no hay datos
  // if (!data?.length) {
  //   return (
  //     <List>
  //       <Center style={{ height: "80vh" }}>
  //         <Stack align="center" spacing="lg">
  //           <Text size="xl" weight={700}>
  //             No hay highlights disponibles
  //           </Text>
  //           <CreateButton size="md">Crear Highlight</CreateButton>
  //         </Stack>
  //       </Center>
  //     </List>
  //   );
  // }

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

// Componente para el encabezado de la tabla
const TableHeader: React.FC<{
  getHeaderGroups: () => HeaderGroup<IHighlight>[];
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
  getRowModel: () => RowModel<IHighlight>;
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
