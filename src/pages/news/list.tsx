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
  Image,
  Text,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconEye,
  IconEyeOff,
  IconCopy, // ✅ duplicar
} from "@tabler/icons-react";

import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { INews } from "../../interfaces";
import { useApiUrl, useInvalidate } from "@refinedev/core";

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
    [],
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

  // ✅ Publicar / despublicar (ya lo tenías)
  const onToggle = async () => {
    try {
      const res = await fetch(`${apiUrl}/news/public/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      await invalidate({ resource: "news", invalidates: ["list", "many"] });
    } catch (e: any) {
      console.error(e);
    }
  };

  // ✅ DUPLICAR / CREAR COPIA
  const onDuplicate = async () => {
    try {
      // 1) Traer original
      const getRes = await fetch(`${apiUrl}/news/${recordId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!getRes.ok) {
        const text = await getRes.text().catch(() => "");
        throw new Error(text || `HTTP ${getRes.status}`);
      }

      const original = await getRes.json();

      // Si tu API responde { data: {...} }, usa .data
      const item = original?.data ?? original;

      // 2) Armar payload NUEVO (solo campos del create/edit)
      const payload = {
        title: item?.title ? `${item.title} (copia)` : "Copia",
        content: item?.content ?? "",
        organizationId: item?.organizationId ?? "66f1d236ee78a23c67fada2a",
        featuredImage: item?.featuredImage ?? "",
        scheduledAt: item?.scheduledAt ?? null,
        publishedAt: item?.publishedAt ?? null,
        documents: Array.isArray(item?.documents) ? item.documents : [],

        // opcional: que la copia arranque privada
        isPublic: false,
      };

      // 3) Crear nuevo registro
      const postRes = await fetch(`${apiUrl}/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!postRes.ok) {
        const text = await postRes.text().catch(() => "");
        throw new Error(text || `HTTP ${postRes.status}`);
      }

      // 4) refrescar la lista
      await invalidate({ resource: "news", invalidates: ["list", "many"] });
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <Group spacing="xs" noWrap>
      {/* ✅ Duplicar */}
      <Tooltip label="Duplicar">
        <ActionIcon variant="light" aria-label="Duplicar" onClick={onDuplicate}>
          <IconCopy size={18} />
        </ActionIcon>
      </Tooltip>

      {/* Público / no público */}
      <Tooltip label={isPublic ? "Pública" : "No pública"}>
        <ActionIcon
          variant="light"
          color={isPublic ? "green" : "gray"}
          aria-label={isPublic ? "Pública" : "No pública"}
          onClick={onToggle}
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
