'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Link,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Refresh as RefreshIcon,
  FolderOpen as FolderOpenIcon,
  FileCopy as FileCopyIcon,
} from '@mui/icons-material';
import { Tree, NodeModel, DragLayerMonitorProps } from '@minoru/react-dnd-treeview';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { api } from '@/lib/api';
import MenuTreeItem from '@/components/admin/menus/MenuTreeItem';
import type { Menu, MenuFormData, MenuTreeNode } from '@/types';

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<MenuTreeNode[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<Menu | MenuTreeNode | null>(null);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    node: MenuTreeNode | null;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState<MenuFormData>({
    menu_type: 'admin',
    parent_id: null,
    menu_name: '',
    menu_code: '',
    description: '',
    icon: '',
    link_type: 'url',
    link_url: '',
    external_url: '',
    permission_type: 'admin',
    is_visible: true,
    is_expandable: true,
    default_expanded: false,
  });

  const [menuTypeFilter, setMenuTypeFilter] = useState<string>('user');
  const [openIds, setOpenIds] = useState<(string | number)[]>([]);
  const [treeData, setTreeData] = useState<NodeModel<MenuTreeNode>[]>([]);

  useEffect(() => {
    loadMenus();
  }, [menuTypeFilter]);

  // Convert menus to NodeModel format for @minoru/react-dnd-treeview
  useEffect(() => {
    const convertToNodeModel = (menuList: MenuTreeNode[]): NodeModel<MenuTreeNode>[] => {
      const result: NodeModel<MenuTreeNode>[] = [];
      const flattenMenus = (items: MenuTreeNode[]) => {
        items.forEach((menu) => {
          result.push({
            id: menu.id,
            parent: menu.parent_id ?? 0,
            text: menu.menu_name,
            droppable: true,
            data: menu,
          });
          if (menu.children && menu.children.length > 0) {
            flattenMenus(menu.children);
          }
        });
      };
      flattenMenus(menuList);
      return result;
    };

    setTreeData(convertToNodeModel(menus));
    // Set all nodes open by default
    const allIds = menus.map((menu) => {
      const ids: (string | number)[] = [menu.id];
      const addChildIds = (children: MenuTreeNode[]) => {
        children.forEach((child) => {
          ids.push(child.id);
          if (child.children) addChildIds(child.children);
        });
      };
      if (menu.children) addChildIds(menu.children);
      return ids;
    }).flat();
    setOpenIds(allIds);
  }, [menus]);

  const loadMenus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getMenusTree({ menu_type: menuTypeFilter });
      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '메뉴 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMenu = async (menu: MenuTreeNode | Menu) => {
    try {
      const fullMenu = await api.getMenu(menu.id);
      setSelectedMenu(fullMenu);
      setIsEditing(false);
      setFormData({
        menu_type: fullMenu.menu_type,
        parent_id: fullMenu.parent_id,
        menu_name: fullMenu.menu_name,
        menu_code: fullMenu.menu_code,
        description: fullMenu.description || '',
        icon: fullMenu.icon || '',
        link_type: fullMenu.link_type,
        link_url: fullMenu.link_url || '',
        external_url: fullMenu.external_url || '',
        permission_type: fullMenu.permission_type,
        is_visible: fullMenu.is_visible,
        is_expandable: fullMenu.is_expandable,
        default_expanded: fullMenu.default_expanded,
      });
    } catch (error) {
      console.error("Failed to fetch menu details", error);
    }
  };

  const handleNewMenu = () => {
    setSelectedMenu(null);
    setIsEditing(true);
    setFormData({
      menu_type: menuTypeFilter as any,
      parent_id: null,
      menu_name: '',
      menu_code: '',
      description: '',
      icon: '',
      link_type: 'url',
      link_url: '',
      external_url: '',
      permission_type: 'admin',
      is_visible: true,
      is_expandable: true,
      default_expanded: false,
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (selectedMenu) {
        await api.updateMenu(selectedMenu.id, formData);
        setSuccess('메뉴가 수정되었습니다.');
      } else {
        await api.createMenu(formData);
        setSuccess('메뉴가 생성되었습니다.');
      }

      setIsEditing(false);
      await loadMenus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!menuToDelete) return;

    try {
      setIsLoading(true);
      setError(null);
      await api.deleteMenu(menuToDelete.id);
      setSuccess('메뉴가 삭제되었습니다.');
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
      setSelectedMenu(null);
      await loadMenus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteDialog = (menu: Menu | MenuTreeNode) => {
    setMenuToDelete(menu);
    setDeleteDialogOpen(true);
    handleCloseContextMenu();
  };

  const handleContextMenu = (event: React.MouseEvent, node: MenuTreeNode) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            node,
          }
        : null
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleAddSubmenu = () => {
    if (!contextMenu?.node) return;

    setSelectedMenu(null);
    setIsEditing(true);
    setFormData({
      ...formData,
      parent_id: contextMenu.node.id,
      menu_name: '',
      menu_code: '',
    });
    handleCloseContextMenu();
  };

  const handleEditFromContext = () => {
    if (!contextMenu?.node) return;
    handleSelectMenu(contextMenu.node);
    setIsEditing(true);
    handleCloseContextMenu();
  };

  const handleDeleteFromContext = () => {
    if (!contextMenu?.node) return;
    handleOpenDeleteDialog(contextMenu.node);
  };

  const handleDuplicateMenu = () => {
    if (!contextMenu?.node) return;
    setSelectedMenu(null);
    setIsEditing(true);
    setFormData({
      menu_type: contextMenu.node.menu_type,
      parent_id: contextMenu.node.parent_id,
      menu_name: `${contextMenu.node.menu_name} (복사)`,
      menu_code: `${contextMenu.node.menu_code}_copy`,
      description: '',
      icon: contextMenu.node.icon || '',
      link_type: 'url',
      link_url: contextMenu.node.link_url || '',
      external_url: '',
      permission_type: 'admin',
      is_visible: true,
      is_expandable: true,
      default_expanded: false,
    });
    handleCloseContextMenu();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedMenu && !isEditing) {
        e.preventDefault();
        handleOpenDeleteDialog(selectedMenu);
      }
      if (e.key === 'F2' && selectedMenu && !isEditing) {
        e.preventDefault();
        setIsEditing(true);
      }
      if (e.key === 'Escape' && isEditing) {
        e.preventDefault();
        setIsEditing(false);
        if (selectedMenu) {
          handleSelectMenu(selectedMenu);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMenu, isEditing]);

  // Handle drag and drop with @minoru/react-dnd-treeview
  const handleDrop = (
    newTree: NodeModel<MenuTreeNode>[],
    options: {
      dragSourceId?: string | number;
      dropTargetId: string | number;
      destinationIndex?: number;
      relativeIndex?: number;
    }
  ) => {
    const { dragSourceId, dropTargetId, destinationIndex = 0 } = options;

    if (!dragSourceId) return;

    const draggedNode = treeData.find((node) => node.id === dragSourceId);
    if (!draggedNode?.data) return;

    const newParentId = dropTargetId === 0 ? null : String(dropTargetId);

    console.log('Moving menu:', {
      id: dragSourceId,
      name: draggedNode.data.menu_name,
      newParentId,
      destinationIndex,
    });

    // Use async IIFE to handle promise
    (async () => {
      try {
        await api.moveMenu(String(dragSourceId), {
          parent_id: newParentId,
          sort_order: destinationIndex,
        });

        await loadMenus();
        setSuccess('메뉴 순서가 변경되었습니다.');
      } catch (err) {
        console.error('Error moving menu:', err);
        setError(err instanceof Error ? err.message : '순서 변경 중 오류가 발생했습니다.');
      }
    })();
  };

  // Prevent circular references in drag and drop
  const canDrop = (
    tree: NodeModel<MenuTreeNode>[],
    options: {
      dragSource?: NodeModel<MenuTreeNode>;
      dropTargetId: string | number;
      dragSourceId?: string | number;
      destinationIndex?: number;
      relativeIndex?: number;
    }
  ) => {
    const { dragSource, dropTargetId } = options;

    if (dragSource?.id === dropTargetId) return false;

    const isDescendant = (parentId: number | string, childId: number | string): boolean => {
      const children = tree.filter((node) => node.parent === parentId);
      for (const child of children) {
        if (child.id === childId) return true;
        if (isDescendant(child.id, childId)) return true;
      }
      return false;
    };

    if (dragSource && isDescendant(dragSource.id, dropTargetId)) return false;
    return true;
  };

  // Render node for @minoru/react-dnd-treeview
  const renderNode = (
    node: NodeModel<MenuTreeNode>,
    { depth, isOpen, onToggle }: { depth: number; isOpen: boolean; onToggle: () => void }
  ) => {
    const menu = node.data!;
    const hasChildren = treeData.some((n) => n.parent === node.id);
    const isSelected = selectedMenu?.id === menu.id;
    const childCount = treeData.filter((n) => n.parent === node.id).length;

    const handleAdd = (menuId: string) => {
      setSelectedMenu(null);
      setIsEditing(true);
      setFormData({
        ...formData,
        parent_id: menuId,
        menu_name: '',
        menu_code: '',
      });
    };

    const handleDelete = (menuId: string) => {
      const menuToDelete = treeData.find((n) => n.id === menuId)?.data;
      if (menuToDelete) {
        handleOpenDeleteDialog(menuToDelete);
      }
    };

    return (
      <MenuTreeItem
        node={node}
        depth={depth}
        isOpen={isOpen}
        hasChildren={hasChildren}
        childCount={childCount}
        isSelected={isSelected}
        onToggle={onToggle}
        onSelect={handleSelectMenu}
        onAddSubmenu={handleAdd}
        onDelete={handleDelete}
      />
    );
  };

  // Drag preview
  const dragPreviewRender = (monitorProps: DragLayerMonitorProps<MenuTreeNode>) => (
    <Box
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        p: 0.75,
        bgcolor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: 1,
        boxShadow: 2,
      })}
    >
      <FolderOpenIcon sx={(theme) => ({ fontSize: 16, color: theme.palette.warning.main, mr: 0.75 })} />
      <Typography variant="body2" sx={{ fontSize: 13 }}>
        {monitorProps.item.text}
      </Typography>
    </Box>
  );

  // Placeholder render
  const placeholderRender = (node: NodeModel<MenuTreeNode>, { depth }: { depth: number }) => (
    <Box
      sx={(theme) => ({
        ml: `${depth * 20 + 4}px`,
        height: 2,
        bgcolor: theme.palette.primary.main,
        borderRadius: 1,
        my: 0.25,
      })}
    />
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/admin" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            관리자
          </Link>
          <Typography color="text.primary">메뉴 관리</Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight="bold">
          메뉴 관리
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Windows Explorer 스타일 메뉴 관리 (드래그&드롭, 우클릭, Delete, F2 지원)
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mx: 3, mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mx: 3, mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Main Content - Explorer Style */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', px: 3, pb: 3, gap: 2 }}>
        {/* Left: Explorer Tree */}
        <Paper
          sx={{
            width: '40%',
            minWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          {/* Explorer Toolbar */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="subtitle2" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FolderOpenIcon fontSize="small" />
              EXPLORER
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={menuTypeFilter}
                  onChange={(e) => setMenuTypeFilter(e.target.value)}
                  variant="standard"
                  disableUnderline
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="admin">관리자</MenuItem>
                  <MenuItem value="user">사용자</MenuItem>
                  <MenuItem value="header_utility">헤더 유틸리티</MenuItem>
                  <MenuItem value="footer_utility">푸터 유틸리티</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="새 메뉴">
                <IconButton size="small" onClick={handleNewMenu}>
                  <CreateNewFolderIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="새로고침">
                <IconButton size="small" onClick={loadMenus}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Explorer Tree Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              bgcolor: 'background.paper',
              '&::-webkit-scrollbar': {
                width: 10,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'grey.100',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'grey.400',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'grey.500',
                },
              },
            }}
          >
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {!isLoading && menus.length === 0 && (
              <Box sx={{ py: 5, textAlign: 'center', px: 2 }}>
                <Typography color="text.secondary" variant="body2">
                  등록된 메뉴가 없습니다.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleNewMenu}
                  size="small"
                  sx={{ mt: 2 }}
                >
                  첫 메뉴 만들기
                </Button>
              </Box>
            )}

            {!isLoading && menus.length > 0 && (
              <DndProvider backend={HTML5Backend}>
                <Tree
                  tree={treeData}
                  rootId={0}
                  onDrop={handleDrop}
                  render={renderNode}
                  dragPreviewRender={dragPreviewRender}
                  placeholderRender={placeholderRender}
                  sort={false}
                  insertDroppableFirst={false}
                  canDrop={canDrop}
                  dropTargetOffset={10}
                  initialOpen={openIds}
                  onChangeOpen={(newOpenIds) => setOpenIds(newOpenIds)}
                  classes={{
                    root: 'menu-tree-root',
                    draggingSource: 'menu-tree-dragging',
                    dropTarget: 'menu-tree-drop-target',
                  }}
                />
              </DndProvider>
            )}
          </Box>
        </Paper>

        {/* Right: Properties Panel */}
        <Paper
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          {/* Properties Toolbar */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="subtitle2" fontWeight="600">
              {selectedMenu && !isEditing ? 'PROPERTIES' : selectedMenu ? 'EDIT MENU' : 'NEW MENU'}
            </Typography>
            {selectedMenu && !isEditing && (
              <Stack direction="row" spacing={1}>
                <Tooltip title="수정 (F2)">
                  <IconButton size="small" onClick={() => setIsEditing(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="삭제 (Delete)">
                  <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(selectedMenu)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Box>

          {/* Properties Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 3,
              '&::-webkit-scrollbar': {
                width: 10,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'grey.100',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'grey.400',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'grey.500',
                },
              },
            }}
          >
            {!selectedMenu && !isEditing ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  좌측에서 메뉴를 선택하거나 새 메뉴를 만들어주세요.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {/* Basic Info Section */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 2, display: 'block' }}>
                    기본 정보
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="메뉴 이름"
                      value={formData.menu_name}
                      onChange={(e) => setFormData({ ...formData, menu_name: e.target.value })}
                      disabled={!isEditing}
                      required
                      fullWidth
                      size="small"
                    />

                    <TextField
                      label="메뉴 코드"
                      value={formData.menu_code}
                      onChange={(e) => setFormData({ ...formData, menu_code: e.target.value })}
                      disabled={!isEditing}
                      required
                      fullWidth
                      size="small"
                      helperText="고유한 코드 (영문, 숫자, 언더스코어)"
                    />

                    <TextField
                      label="설명"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={!isEditing}
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                    />

                    <TextField
                      label="아이콘"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      disabled={!isEditing}
                      fullWidth
                      size="small"
                      helperText="MUI 아이콘 이름 (예: Settings, Group)"
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* Link Settings Section */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 2, display: 'block' }}>
                    링크 설정
                  </Typography>
                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>링크 타입</InputLabel>
                      <Select
                        value={formData.link_type}
                        onChange={(e) =>
                          setFormData({ ...formData, link_type: e.target.value as any })
                        }
                        disabled={!isEditing}
                        label="링크 타입"
                      >
                        <MenuItem value="url">URL</MenuItem>
                        <MenuItem value="new_window">새 창</MenuItem>
                        <MenuItem value="modal">모달</MenuItem>
                        <MenuItem value="external">외부 링크</MenuItem>
                        <MenuItem value="none">없음</MenuItem>
                      </Select>
                    </FormControl>

                    {formData.link_type === 'url' && (
                      <TextField
                        label="링크 URL"
                        value={formData.link_url}
                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                        disabled={!isEditing}
                        fullWidth
                        size="small"
                        placeholder="/admin/users"
                      />
                    )}

                    {formData.link_type === 'external' && (
                      <TextField
                        label="외부 링크 URL"
                        value={formData.external_url}
                        onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                        disabled={!isEditing}
                        fullWidth
                        size="small"
                        placeholder="https://example.com"
                      />
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Permission Section */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 2, display: 'block' }}>
                    권한 설정
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>권한 타입</InputLabel>
                    <Select
                      value={formData.permission_type}
                      onChange={(e) =>
                        setFormData({ ...formData, permission_type: e.target.value as any })
                      }
                      disabled={!isEditing}
                      label="권한 타입"
                    >
                      <MenuItem value="public">전체 공개</MenuItem>
                      <MenuItem value="member">회원</MenuItem>
                      <MenuItem value="admin">관리자</MenuItem>
                      <MenuItem value="roles">역할별</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Divider />

                {/* Display Options Section */}
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 2, display: 'block' }}>
                    표시 옵션
                  </Typography>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_visible}
                          onChange={(e) =>
                            setFormData({ ...formData, is_visible: e.target.checked })
                          }
                          disabled={!isEditing}
                          size="small"
                        />
                      }
                      label="표시"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_expandable}
                          onChange={(e) =>
                            setFormData({ ...formData, is_expandable: e.target.checked })
                          }
                          disabled={!isEditing}
                          size="small"
                        />
                      }
                      label="확장 가능"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.default_expanded}
                          onChange={(e) =>
                            setFormData({ ...formData, default_expanded: e.target.checked })
                          }
                          disabled={!isEditing}
                          size="small"
                        />
                      }
                      label="기본 확장"
                    />
                  </Stack>
                </Box>

                {/* Metadata Section (Read-only) */}
                {selectedMenu && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 2, display: 'block' }}>
                        메타데이터
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">ID:</Typography>
                          <Typography variant="caption">{selectedMenu.id}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Depth:</Typography>
                          <Typography variant="caption">{selectedMenu.depth}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Order:</Typography>
                          <Typography variant="caption">{selectedMenu.sort_order}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Created:</Typography>
                          <Typography variant="caption">{new Date(selectedMenu.created_at).toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">Updated:</Typography>
                          <Typography variant="caption">{new Date(selectedMenu.updated_at).toLocaleString()}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </>
                )}
              </Stack>
            )}
          </Box>

          {/* Action Buttons */}
          {(selectedMenu || isEditing) && (
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50',
              }}
            >
              {isEditing ? (
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setIsEditing(false);
                      if (selectedMenu) {
                        handleSelectMenu(selectedMenu);
                      } else {
                        setFormData({
                          menu_type: menuTypeFilter as any,
                          parent_id: null,
                          menu_name: '',
                          menu_code: '',
                          description: '',
                          icon: '',
                          link_type: 'url',
                          link_url: '',
                          external_url: '',
                          permission_type: 'admin',
                          is_visible: true,
                          is_expandable: true,
                          default_expanded: false,
                        });
                      }
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={!formData.menu_name || !formData.menu_code}
                  >
                    저장
                  </Button>
                </Stack>
              ) : (
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    수정 (F2)
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenDeleteDialog(selectedMenu!)}
                  >
                    삭제 (Del)
                  </Button>
                </Stack>
              )}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Context Menu */}
      <MuiMenu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleEditFromContext}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>수정</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddSubmenu}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>하위 메뉴 추가</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateMenu}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>복제</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteFromContext} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>삭제</ListItemText>
        </MenuItem>
      </MuiMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>메뉴 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &quot;{menuToDelete?.menu_name}&quot; 메뉴를 삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
