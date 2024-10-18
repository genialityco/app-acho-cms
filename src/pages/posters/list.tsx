import React from "react";
import { useTable } from "@refinedev/react-table";
import { type ColumnDef, flexRender } from "@tanstack/react-table";
import { type GetManyResponse, useMany } from "@refinedev/core";
import { List, ShowButton, EditButton, DeleteButton, DateField } from "@refinedev/mantine";

import { Box, Group, ScrollArea, Select, Table, Pagination } from "@mantine/core";

import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { FilterElementProps, ICategory, IPoster } from "../../interfaces";
/*        "_id": "670ed4f0dd7cd216bbe00091",
        "title": "Quantum Physics Insights",
        "category": "Science",
        "topic": "Quantum Physics",
        "institution": "MIT",
        "authors": [
          "John Doe",
          "Jane Smith"
        ],
        "votes": 11,
        "urlPdf": "https://firebasestorage.googleapis.com/v0/b/global-auth-49737.appspot.com/o/b69ffc15-fabc-483b-aba7-1c24c9cd62f4.pdf?alt=media&token=eff69385-cd8e-437e-a81e-f1921fb008fb",
        "eventId": "66f1e0b57c2e2fbdefa21271",
        "createdAt": "2024-10-15T20:47:44.515Z",
        "updatedAt": "2024-10-16T14:06:33.348Z",
        "__v": 1,
        "voters": [
          "670848c20ebe6b389db58f4e"
        ]
      }*/
export const PosterList: React.FC = () => {
  const columns = React.useMemo<ColumnDef<IPoster>[]>(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "_id",
      },
      {
        id: "title",
        header: "Title",
        accessorKey: "title",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "category",
        header: "Category",
        accessorKey: "category",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "topic",
        header: "Topic",
        accessorKey: "topic",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "authors",
        header: "Authors",
        accessorKey: "authors",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "urlPdf",
        header: "Documento",
        accessorKey: "urlPdf",
      },      

      // {
      //   id: "status",
      //   header: "Status",
      //   accessorKey: "status",
      //   meta: {
      //     filterElement: function render(props: FilterElementProps) {
      //       return (
      //         <Select
      //           defaultValue="published"
      //           data={[
      //             { label: "Published", value: "published" },
      //             { label: "Draft", value: "draft" },
      //             { label: "Rejected", value: "rejected" },
      //           ]}
      //           {...props}
      //         />
      //       );
      //     },
      //     filterOperator: "eq",
      //   },
      // },
      // {
      //   id: "category.id",
      //   header: "Category",
      //   enableColumnFilter: false,
      //   accessorKey: "category.id",
      //   cell: function render({ getValue, table }) {
      //     const meta = table.options.meta as {
      //       categoriesData: GetManyResponse<ICategory>;
      //     };
      //     const category = meta.categoriesData?.data.find(
      //       (item) => item.id === getValue(),
      //     );
      //     return category?.title ?? "Loading...";
      //   },
      // },
      {
        id: "startDate",
        header: "start Date",
        accessorKey: "startDate",
        cell: function render({ getValue }) {
          return <DateField value={getValue() as string} format="LLL" />;
        },
        enableColumnFilter: false,
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "_id",
        enableColumnFilter: false,
        enableSorting: false,
        cell: function render({ getValue }) {
          return (
            <Group spacing="xs" noWrap>
              <ShowButton hideText recordItemId={getValue() as number} />
              <EditButton hideText recordItemId={getValue() as number} />
              <DeleteButton hideText recordItemId={getValue() as number} />
            </Group>
          );
        },
      },
    ],
    []
  );

  const {
    getHeaderGroups,
    getRowModel,
    setOptions,
    refineCore: {
      setCurrent,
      pageCount,
      current,
      tableQuery: { data: tableData },
    },
  } = useTable({
    columns,
  });

  //const categoryIds = tableData?.data?.map((item) => item.category.id) ?? [];
  // const { data: categoriesData } = useMany<ICategory>({
  //   resource: "categories",
  //   ids: categoryIds,
  //   queryOptions: {
  //     enabled: categoryIds.length > 0,
  //   },
  // });

  setOptions((prev) => ({
    ...prev,
    meta: {
      ...prev.meta,
      //categoriesData,
    },
  }));

  return (
    <ScrollArea>
      <List>
        <Table highlightOnHover>
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id}>
                      {!header.isPlaceholder && (
                        <Group spacing="xs" noWrap>
                          <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                          <Group spacing="xs" noWrap>
                            <ColumnSorter column={header.column} />
                            <ColumnFilter column={header.column} />
                          </Group>
                        </Group>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
        <br />
        <Pagination position="right" total={pageCount} page={current} onChange={setCurrent} />
      </List>
    </ScrollArea>
  );
};
