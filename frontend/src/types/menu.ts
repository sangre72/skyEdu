/**
 * 메뉴 관리 시스템 타입 정의
 */

export type MenuType = 'site' | 'user' | 'admin' | 'header_utility' | 'footer_utility' | 'quick_menu';
export type LinkType = 'url' | 'new_window' | 'modal' | 'external' | 'none';
export type PermissionType = 'public' | 'member' | 'groups' | 'users' | 'roles' | 'admin';

export interface Menu {
  id: string;
  menu_type: MenuType;
  parent_id: string | null;
  depth: number;
  sort_order: number;
  path: string;
  menu_name: string;
  menu_code: string;
  description?: string;
  icon?: string;
  link_type: LinkType;
  link_url?: string;
  external_url?: string;
  permission_type: PermissionType;
  feature_key?: string;
  is_visible: boolean;
  is_expandable: boolean;
  default_expanded: boolean;
  parent_name?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface MenuTreeNode {
  id: string;
  menu_name: string;
  menu_code: string;
  menu_type: MenuType;
  parent_id: string | null;
  depth: number;
  sort_order: number;
  icon?: string;
  link_url?: string;
  feature_key?: string;
  is_visible: boolean;
  is_active: boolean;
  children: MenuTreeNode[];
}

export interface MenuFormData {
  menu_type: MenuType;
  parent_id?: string | null;
  menu_name: string;
  menu_code: string;
  description?: string;
  icon?: string;
  link_type: LinkType;
  link_url?: string;
  external_url?: string;
  permission_type: PermissionType;
  feature_key?: string;
  is_visible?: boolean;
  is_expandable?: boolean;
  default_expanded?: boolean;
}

export interface MenuListResponse {
  items: Menu[];
  total: number;
}

export interface MenuMoveRequest {
  parent_id: string | null;
  sort_order: number;
}

export interface MenuReorderRequest {
  ordered_ids: string[];
}
