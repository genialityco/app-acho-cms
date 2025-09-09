import React, { useState, useEffect } from "react";
import { TextInput, Menu, ActionIcon, Stack, Group } from "@mantine/core";
import { IconFilter, IconX, IconCheck } from "@tabler/icons-react";
import type { ColumnButtonProps } from "../../interfaces";

export const ColumnFilter: React.FC<ColumnButtonProps> = ({ column }) => {
  // eslint-disable-next-line
  // Solución: Inicializamos el estado directamente con el valor del filtro de la columna
  // o con una cadena vacía ('') si no hay valor. Esto garantiza que el input siempre
  // sea un componente controlado.
  const [value, setValue] = useState(
    (column.getFilterValue() as string) ?? ""
  );

  if (!column.getCanFilter()) {
    return null;
  }
  
  // Usamos useEffect para sincronizar el estado local si el filtro de la columna
  // cambia por alguna acción externa.
  useEffect(() => {
    setValue((column.getFilterValue() as string) ?? "");
  }, [column.getFilterValue()]);
  
  // eslint-disable-next-line
  const change = (newValue: any) => {
    setValue(newValue);
    column.setFilterValue(newValue);
  };
  
  const clear = () => {
    column.setFilterValue(undefined);
    setValue(""); // Aseguramos que el estado local también se limpie
  };
  const save = () => {
    column.setFilterValue(value);
  };
  
  const renderFilterElement = () => {
    // eslint-disable-next-line
    const filterElement = (column.columnDef?.meta as any)?.filterElement;
    const FilterComponent = filterElement?.component;
    const filterMeta = filterElement?.meta ?? {};

    if (!FilterComponent ) {
      // Usamos el estado 'value' directamente
      return <TextInput autoComplete="off" value={value} onChange={(e) => change(e.target.value)} />;
    }

    return <FilterComponent column={column} value={value} onChange={change} {...filterMeta} />;
  };

  return (
    <>
      {renderFilterElement()}
      {/*<Menu
      opened={!!state}
      position="bottom"
      withArrow
      transition="scale-y"
      shadow="xl"
      onClose={close}
      width="256px"
      withinPortal
    >
      <Menu.Target>
        <ActionIcon
          size="xs"
          onClick={open}
          variant={column.getIsFiltered() ? "light" : "transparent"}
          color={column.getIsFiltered() ? "primary" : "gray"}
        >
          <IconFilter size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {!!state && (
          <Stack p="xs" spacing="xs">
            {renderFilterElement()}
            <Group position="right" spacing={6} noWrap>
              <ActionIcon
                size="md"
                color="gray"
                variant="outline"
                onClick={clear}
              >
                <IconX size={18} />
              </ActionIcon>
              <ActionIcon
                size="md"
                onClick={save}
                color="primary"
                variant="outline"
              >
                <IconCheck size={18} />
              </ActionIcon>
            </Group>
          </Stack>
        )}
      </Menu.Dropdown>
    </Menu> */}
    </>
  );
};