import React from "react";
import { useTable } from "@refinedev/react-table";
import { type ColumnDef, flexRender } from "@tanstack/react-table";
import { type GetManyResponse, useMany } from "@refinedev/core";
import { List, ShowButton, EditButton, DeleteButton, DateField } from "@refinedev/mantine";

import { Box, Group, ScrollArea, Select, Table, Pagination } from "@mantine/core";

import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { FilterElementProps, ICategory, IPoster } from "../../interfaces";

export const PosterList: React.FC = () => {
  // 1. Custom Dropdown Filter Component
  const DropdownFilter = ({ column, options }) => {
    return (
      <Select style={{minWidth:'200px'}}
        placeholder="Filter by..."
        data={options?.map((option) => ({ value: (option=='Todos')?undefined:option, label: option })) ?? []}
        value={column.getFilterValue() || ""}
        onChange={(value) => {
          console.log("filtroo",value)
          column.setFilterValue(value || undefined)}}
        clearable
      />
    );
  };

  const columns = React.useMemo<ColumnDef<IPoster>[]>(
    () => [
      // {
      //   id: "id",
      //   header: "ID",
      //   accessorKey: "_id",
      // },
      {
        id: "votes",
        header: "Votes",
        accessorKey: "votes",
        meta: {
          width: "7%",
        },
      },
      {
        id: "title",
        header: "Title",
        accessorKey: "title",
        meta: {
          filterOperator: "contains",
          width: "25%",
          style: { minWidth: "250px" },
        },
      },
      {
        id: "category",
        header: "Category",
        accessorKey: "category",
        meta: {
          filterOperator: "contains",

          filterElement: {
            component: DropdownFilter,
            meta: {
              options: ["Todos","Hematología", "Oncología"],
            },
            // Options to display in the dropdown
          },
        },
      },
      {
        id: "topic",
        header: "Topic",
        accessorKey: "topic",
        meta: {
          filterOperator: "contains",
          width: "7%",
          filterElement: {
            component: DropdownFilter,
            meta: {
              options: ["Todos","Categoría especial", "Estudios Descriptivos","Reporte de Casos","Estudios Analíticos"],
            },
            // Options to display in the dropdown
          },
        },
      },
      {
        id: "authors",
        header: "Authors",
        accessorKey: "authors",
        meta: {
          filterOperator: "contains",
          width: "20%",
          style: { minWidth: "200px" },
        },
      },
      {
        id: "urlPdf",
        header: "Documento",
        accessorKey: "urlPdf",
        style: { whiteSpace: "unset", overflow: "wrap" },
        meta: {
          width: "10%",
          style: { maxWidth: "200px", overflow: "hidden" },
        },
        cell: (row) => {
          return (
            <a target="_blank" href={row.getValue()}>
              {" "}
              LINK{" "}
            </a>
          );
        },
      },
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
    getPageCount,
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
    <>
    {console.log('tableData',tableData)}
    </>
      <List title={"Posters" + " Total:" + tableData?.total}>
        <Pagination position="left" total={pageCount} value={current} onChange={setCurrent} />
        <Table highlightOnHover style={{ width: "100%", tableLayout: "auto" }}>
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      style={header.column?.columnDef?.meta?.style ? header.column?.columnDef?.meta?.style : {}}
                      width={header.column?.columnDef?.meta?.width ? header.column?.columnDef?.meta?.width : ""}
                    >
                      {!header.isPlaceholder && (
                        <>
                        <Group spacing="xs" noWrap>
                          <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                          <ColumnSorter column={header.column} />
                          </Group>
                          <Group spacing="xs" noWrap>
                          <ColumnFilter column={header.column} />
                          </Group> 
                        </>
                    
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
                    return (
                      <td
                        style={cell.column?.columnDef?.meta?.style ? cell.column?.columnDef?.meta?.style : {}}
                        key={cell.id}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
        <br />

        <Pagination position="left" total={pageCount} value={current} onChange={setCurrent} />
      </List>
    </ScrollArea>
  );
};
