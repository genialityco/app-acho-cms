import { useShow, useOne } from "@refinedev/core";
import { Show, MarkdownField } from "@refinedev/mantine";

import { Title, Text } from "@mantine/core";

import type { IMember } from "../../interfaces";
import { EntityFieldRenderer } from "../../components/showView/showView";
import { ResetPasswordButton } from "./ResetPasswordButton";

export const MemberShow: React.FC = () => {
  const { query: queryResult } = useShow<IMember>();
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
    <Show
      isLoading={isLoading}
      headerButtons={({ defaultButtons }) => (
        <>
          {record && (
            <ResetPasswordButton
              memberId={record._id}
              fullName={record.properties?.fullName}
              idNumber={record.properties?.idNumber}
            />
          )}
          {defaultButtons}
        </>
      )}
    >
      <EntityFieldRenderer data={record || {}}></EntityFieldRenderer>
    </Show>
  );
};
