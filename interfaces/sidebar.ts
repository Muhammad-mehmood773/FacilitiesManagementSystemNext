export interface MenuItem {
  label: string;
  link: string;
  icon: string;
  titleIcon?: string;
  subMenu?: string[];
  isSubMenuVisible?: boolean;
  isActive?: boolean;
}

export interface SidebarProps {
  roleId: string;
}
