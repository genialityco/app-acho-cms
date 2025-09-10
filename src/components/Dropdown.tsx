import { Select } from "@mantine/core";



  const DropdownFilter = ({ column, options }) => {
     return (
       <Select style={{minWidth:'200px'}}
         placeholder="Filter by..."
         data={options?.map((option: string) => ({ value: (option=='Todos')?undefined:option, label: option })) ?? []}
         value={column.getFilterValue() || ""}
         onChange={(value) => {
           column.setFilterValue(value || undefined)}}
         clearable
       />
     );
   };


export default DropdownFilter