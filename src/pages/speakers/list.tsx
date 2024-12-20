import React, { ReactNode } from "react";
import { useTable } from "@refinedev/react-table";
import { type ColumnDef, flexRender } from "@tanstack/react-table";
import { type GetManyResponse, useMany } from "@refinedev/core";
import { List, ShowButton, EditButton, DeleteButton, DateField } from "@refinedev/mantine";

import { Box, Group, ScrollArea, Select, Table, Pagination } from "@mantine/core";

import { ColumnFilter, ColumnSorter } from "../../components/table";
import type { FilterElementProps, ICategory, ISpeaker } from "../../interfaces";
/*  export interface ISpeaker {
  _id: number;
  names: string;
  description: string;
  location: string;
  eventId: { _id: number };
  imageUrl:string
}
      }*/
export const SpeakerList: React.FC = () => {
  const columns = React.useMemo<ColumnDef<ISpeaker>[]>(
    () => [
      // {
      //   id: "id",
      //   header: "ID",
      //   accessorKey: "_id",
      // },
      {
        id: "names",
        header: "Nombre",
        accessorKey: "names",
        meta: {
          
          style:{minWidth:'200px'},
          filterOperator: "contains",
        },
      },      
      {
        id: "description",
        header: "Description",
        accessorKey: "description",
        meta: {
          style:{minWidth:'300px'},
          filterOperator: "contains",
        },
      },
      {
        id: "location",
        header: "Location",
        accessorKey: "location",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "isInternational",
        header: "isInternational",
        accessorKey: "isInternational",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "eventId",
        header: "EventId",
        accessorKey: "eventId",
        meta: {
          filterOperator: "contains",
        },
      },
      {
        id: "imageUrl",
        header: "Image",
        accessorKey: "imageUrl",
        meta: {
          style:{maxWidth:'150px',overflow:'hidden'},
        },
        cell: (row) => {
          return (
              <img style={{width:"80px"}} src={row.getValue()} />
          );
        },

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
      <List title={'Speakers'+' Total:'+tableData?.total}>
      <Pagination position="left" total={pageCount} value={current} onChange={setCurrent} />
        <Table highlightOnHover>
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} style={header.column?.columnDef?.meta?.style?header.column?.columnDef?.meta?.style:{}} width={(header.column?.columnDef?.meta?.width?header.column?.columnDef?.meta?.width:'')}>
                    {console.log('header.column',header.column?.columnDef?.meta)}
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
                    return <td style={cell.column?.columnDef?.meta?.style?cell.column?.columnDef?.meta?.style:{}} key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
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
