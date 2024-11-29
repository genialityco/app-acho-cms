import React from "react";
import { useTable } from "@refinedev/react-table";
import { List, EditButton, DeleteButton, ShowButton } from "@refinedev/mantine";
import {
  Box,
  Group,
  Table,
  Pagination,
  ScrollArea,
  Switch,
  Text,
} from "@mantine/core";
import type { ISurvey } from "../../interfaces";

export const SurveyList: React.FC = () => {
  const columns = React.useMemo(
    () => [
      {
        id: "title",
        header: "Título",
        accessorKey: "title",
      },
      {
        id: "isPublished",
        header: "Publicado",
        accessorKey: "isPublished",
        cell: ({ getValue }) => (
          <Switch checked={getValue() as boolean} readOnly />
        ),
      },
      {
        id: "isOpen",
        header: "Abierta",
        accessorKey: "isOpen",
        cell: ({ getValue }) => (
          <Switch checked={getValue() as boolean} readOnly />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ getValue }) => (
          <Group spacing="xs">
            <EditButton recordItemId={getValue() as string} />
            <DeleteButton recordItemId={getValue() as string} />
          </Group>
        ),
      },
    ],
    []
  );

  const {
    getHeaderGroups,
    getRowModel,
    refineCore: { current, setCurrent, pageCount },
  } = useTable<ISurvey>({ columns });

  return (
    <List>
      <ScrollArea>
        <Table striped highlightOnHover>
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>{header.column.columnDef.header}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{cell.column.columnDef.cell(cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
      <Pagination
        position="right"
        value={current}
        onChange={setCurrent}
        total={pageCount}
      />
    </List>
  );
};
