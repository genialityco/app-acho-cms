import { ActionIcon } from "@mantine/core";
import {
  IconChevronDown,
  IconSelector,
  IconChevronUp,
} from "@tabler/icons-react";

import type { ColumnButtonProps } from "../../interfaces";

export const ColumnSorter: React.FC<ColumnButtonProps> = ({ column }) => {
  if (!column.getCanSort()) {
    return null;
  }

  const sorted = column.getIsSorted();

  return (
    <ActionIcon
    size="xs"
    onClick={column.getToggleSortingHandler()}
    variant={sorted ? "light" : "transparent"}
    color={sorted ? "primary" : "gray"}
  >
    {!sorted && <IconSelector size={18} />}
    {sorted === "asc" && <IconChevronUp size={18} />}
    {sorted === "desc" && <IconChevronDown size={18} />}
  </ActionIcon>
  );
};
