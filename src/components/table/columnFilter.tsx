import React, { useState, useEffect } from "react";
import { TextInput, Menu, ActionIcon, Stack, Group } from "@mantine/core";
import { IconFilter, IconX, IconCheck } from "@tabler/icons-react";

import type { ColumnButtonProps } from "../../interfaces";

export const ColumnFilter: React.FC<ColumnButtonProps> = ({ column }) => {
  // eslint-disable-next-line
  const [state, setState] = useState(null as null | { value: any });

  if (!column.getCanFilter()) {
    return null;
  }

  useEffect(() => {
    setState({
      value: column.getFilterValue(),
    });
  }, []);

  const open = () =>
    setState({
      value: column.getFilterValue(),
    });

  const close = () => setState(null);

  // eslint-disable-next-line
  const change = (value: any) => {
    setState({ value });
    column.setFilterValue(value);
  }
    


  const clear = () => {
    column.setFilterValue(undefined);
    close();
  };

  const save = () => {
    if (!state) return;
    column.setFilterValue(state.value);
    close();
  };

  const renderFilterElement = () => {
    // eslint-disable-next-line
    const filterElement = (column.columnDef?.meta as any)?.filterElement;
    const FilterComponent = filterElement?.component;
    const filterMeta = filterElement?.meta ?? {};

    if (!FilterComponent ) {
      return <TextInput autoComplete="off" value={state?.value} onChange={(e) => change(e.target.value)} />;
    }

    return <FilterComponent column={column} value={state?.value} onChange={change} {...filterMeta} />;
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