import { useShow, useOne } from "@refinedev/core";
import { Show, MarkdownField } from "@refinedev/mantine";

import { Title, Text } from "@mantine/core";

import type { INews } from "../../interfaces";
import { EntityFieldRenderer } from "../../components/showView/showView";

export const NewsShow: React.FC = () => {
  const { query: queryResult } = useShow<INews>();
  const { data, isLoading } = queryResult;
  const record = data?.data;
  console.log("event record", record);
  // const { data: categoryData } = useOne<ICategory>({
  //   resource: "categories",
  //   id: record?.category.id || "",
  //   queryOptions: {
  //     enabled: !!record?.category.id,
  //   },
  // });

  return (
    <Show isLoading={isLoading}>
      <EntityFieldRenderer data={record || {}}></EntityFieldRenderer>
    </Show>
  );
};
