import React from "react";
import { useMenu, useNavigation } from "@refinedev/core";
import { Navbar, NavLink, Group } from "@mantine/core";
import { IconCertificate } from "@tabler/icons-react";

export const CustomMenu: React.FC = () => {
  const { menuItems } = useMenu();
  const { push } = useNavigation();

  return (
    <Navbar>
      {menuItems.map((item) => {
        // Verifica si el recurso tiene una URL externa
        const externalUrl = item?.meta?.url;

        return (
          <NavLink
            key={item.key}
            label={item.label}
            icon={item.icon}
            onClick={() => {
              if (externalUrl) {
                // Redirección externa
                window.open(externalUrl, "_blank");
              } else if (item.route) {
                // Navegación interna
                push(item.route);
              }
            }}
          />
        );
      })}
    </Navbar>
  );
};
