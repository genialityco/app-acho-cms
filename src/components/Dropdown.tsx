import { Select } from "@mantine/core";
import type { Column } from "@tanstack/react-table";

const DropdownFilter = ({ column, options }: { column: Column<any, any>; options: string[] }) => {
     return (
       <Select style={{minWidth:'200px'}}
         placeholder="Filter by..."
         data={options?.map((option: string) => ({ value: option === 'Todos' ? '' : option, label: option })) ?? []}
         value={(column.getFilterValue() as string) || ""}
         onChange={(value) => {
           column.setFilterValue(value || undefined)}}
         clearable
       />
     );
   };


export default DropdownFilter