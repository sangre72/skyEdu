/**
 * Menu Tree Item Component for react-dnd-treeview
 * Windows Explorer 스타일 디자인
 */

import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { NodeModel } from '@minoru/react-dnd-treeview';
import { MenuTreeNode } from '@/types';

interface MenuTreeItemProps {
  node: NodeModel<MenuTreeNode>;
  depth: number;
  isOpen: boolean;
  hasChildren: boolean;
  childCount: number;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: (menu: MenuTreeNode) => void;
  onAddSubmenu: (parentId: string) => void;
  onDelete: (menuId: string) => void;
}

export default function MenuTreeItem({
  node,
  depth,
  isOpen,
  hasChildren,
  childCount,
  isSelected,
  onToggle,
  onSelect,
  onAddSubmenu,
  onDelete,
}: MenuTreeItemProps) {
  const menu = node.data!;

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(menu);
  }, [onSelect, menu]);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddSubmenu(menu.id);
  }, [onAddSubmenu, menu.id]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(menu.id);
  }, [onDelete, menu.id]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) onToggle();
  }, [hasChildren, onToggle]);

  return (
    <Box
      onClick={handleSelect}
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        height: 32,
        cursor: 'pointer',
        userSelect: 'none',
        bgcolor: isSelected ? theme.palette.action.selected : 'transparent',
        border: isSelected
          ? `1px solid ${theme.palette.primary.light}`
          : '1px solid transparent',
        borderRadius: 0.5,
        '&:hover': {
          bgcolor: isSelected
            ? theme.palette.action.selected
            : theme.palette.action.hover,
          border: isSelected
            ? `1px solid ${theme.palette.primary.light}`
            : `1px solid ${theme.palette.divider}`,
          '& .menu-actions': {
            opacity: 1,
          },
        },
        pl: `${depth * 20 + 4}px`,
        pr: 0.5,
        position: 'relative',
      })}
    >
      {/* 트리 가이드 라인 */}
      {depth > 0 && (
        <Box
          sx={(theme) => ({
            position: 'absolute',
            left: `${(depth - 1) * 20 + 14}px`,
            top: 0,
            bottom: 0,
            width: 1,
            bgcolor: theme.palette.divider,
          })}
        />
      )}

      {/* 펼침/접힘 화살표 */}
      <Box
        onClick={handleToggle}
        sx={(theme) => ({
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 0.5,
          cursor: hasChildren ? 'pointer' : 'default',
          color: theme.palette.text.secondary,
          '&:hover': hasChildren ? { color: theme.palette.text.primary } : {},
        })}
      >
        {hasChildren && (
          isOpen ? (
            <ExpandMore sx={{ fontSize: 16 }} />
          ) : (
            <ExpandLess sx={{ fontSize: 16, transform: 'rotate(-90deg)' }} />
          )
        )}
      </Box>

      {/* 폴더/파일 아이콘 */}
      <Box sx={{ mr: 0.75, display: 'flex', alignItems: 'center' }}>
        {hasChildren ? (
          isOpen ? (
            <FolderOpenIcon sx={(theme) => ({ fontSize: 18, color: theme.palette.warning.main })} />
          ) : (
            <FolderIcon sx={(theme) => ({ fontSize: 18, color: theme.palette.warning.main })} />
          )
        ) : (
          <FileIcon sx={(theme) => ({ fontSize: 18, color: theme.palette.info.light })} />
        )}
      </Box>

      {/* 메뉴명 */}
      <Typography
        variant="body2"
        sx={(theme) => ({
          flex: 1,
          fontSize: 13,
          fontWeight: isSelected ? 500 : 400,
          color: theme.palette.text.primary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        })}
      >
        {menu.menu_name}
      </Typography>

      {/* 뱃지: 하위 메뉴 개수 */}
      {hasChildren && (
        <Typography
          variant="caption"
          sx={(theme) => ({ ml: 0.5, color: theme.palette.text.disabled, fontSize: 11 })}
        >
          ({childCount})
        </Typography>
      )}

      {/* 상태 칩 */}
      {!menu.is_visible && (
        <Chip
          label="숨김"
          size="small"
          sx={{
            height: 18,
            fontSize: '0.625rem',
            bgcolor: 'grey.300',
            color: 'grey.700',
            ml: 0.5,
          }}
        />
      )}
      {!menu.is_active && (
        <Chip
          label="비활성"
          size="small"
          color="error"
          sx={{
            height: 18,
            fontSize: '0.625rem',
            ml: 0.5,
          }}
        />
      )}

      {/* 액션 버튼 */}
      <Box
        className="menu-actions"
        sx={{
          display: 'flex',
          gap: 0.25,
          opacity: 0,
          transition: 'opacity 0.2s',
          ml: 0.5,
        }}
      >
        <Tooltip title="하위 메뉴 추가" placement="top">
          <IconButton size="small" onClick={handleAdd} sx={{ width: 20, height: 20, p: 0 }}>
            <AddIcon sx={{ fontSize: 14, color: 'success.main' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="메뉴 삭제" placement="top">
          <IconButton size="small" onClick={handleDelete} sx={{ width: 20, height: 20, p: 0 }}>
            <DeleteOutlineIcon sx={{ fontSize: 14, color: 'error.main' }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
