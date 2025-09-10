import { useShow, useOne } from "@refinedev/core";
import { Show, MarkdownField } from "@refinedev/mantine";

import { Title, Text } from "@mantine/core";

import type { ICategory, IPoster } from "../../interfaces";
import { EntityFieldRenderer } from "../../components/showView/showView";

export const PosterShow: React.FC = () => {
  const { query: queryResult } = useShow<IPoster>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

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
