// ContextMenu.tsx
import React from "react";
import { Menu, MenuItem, type PaperProps } from "@mui/material";

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  paperProps?: PaperProps; // Для кастомной стилизации
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  anchorPosition,
  onClose,
  paperProps,
}) => {
  return (
    <Menu
      open={Boolean(anchorPosition)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ?? undefined}
      PaperProps={{
        sx: { borderRadius: 2, minWidth: 150, boxShadow: 3 },
        ...paperProps,
      }}
    >
      {items.map((item, idx) => (
        <MenuItem
          key={idx}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ContextMenu;
