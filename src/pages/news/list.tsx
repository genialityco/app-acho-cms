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
import {
  Box,
  Group,
  ScrollArea,
  Table,
  Pagination,
  Image,
  Text,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react"; // si no lo tienes: npm i @tabler/icons-react

import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { INews } from "../../interfaces";
import { useApiUrl, useInvalidate } from "@refinedev/core";
import { customGenRestDataProvider } from "../../components/dataProvider/customGenRestDataProvider";

export const NewsList: React.FC = () => {
  // Definición de columnas
  const columns = React.useMemo<ColumnDef<INews>[]>(
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
        id: "featuredImage",
        header: "Featured Image",
        accessorKey: "featuredImage",
        cell: ({ getValue }) => (
          <Image
            src={getValue() as string}
            alt="Featured"
            width={100}
            height={60}
            fit="contain"
          />
        ),
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
            isPublic={Boolean((row.original as INews).isPublic)}
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
  } = useTable<INews>({ columns });

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
const ActionButtons: React.FC<{ recordId: string; isPublic?: boolean }> = ({
  recordId,
  isPublic,
}) => {
  const invalidate = useInvalidate();
  const apiUrl = useApiUrl();

  const onToggle = async () => {
    try {
      const res = await fetch(`${apiUrl}/news/public/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // ⚠️ si tu API usa cookies/sesión, agrega:
        // credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }
      // Si la actualización fue exitosa
      // puedes mostrar un mensaje de éxito aquí
      console.log("Noticia actualizada con éxito");

      // refresca la lista
      await invalidate({ resource: "news", invalidates: ["list", "many"] });

      // feedback (opcional)
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <Group spacing="xs" noWrap>
      <Tooltip label={isPublic ? "Pública" : "No pública"}>
        <ActionIcon
          variant="light"
          color={isPublic ? "green" : "gray"}
          aria-label={isPublic ? "Pública" : "No pública"}
          onClick={onToggle} // ✅ aquí llamas /news/public/:id
        >
          {isPublic ? <IconEye size={18} /> : <IconEyeOff size={18} />}
        </ActionIcon>
      </Tooltip>
      <ShowButton hideText recordItemId={recordId} />
      <EditButton hideText recordItemId={recordId} />
      <DeleteButton hideText recordItemId={recordId} />
    </Group>
  );
};

// Componente para el encabezado de la tabla
const TableHeader: React.FC<{
  getHeaderGroups: () => HeaderGroup<INews>[];
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
const TableBody: React.FC<{ getRowModel: () => RowModel<INews> }> = ({
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
