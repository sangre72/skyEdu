import { useEffect, useState } from 'react';
import type { Menu } from '@/types/menu';
import { api } from '@/lib';

/**
 * 메뉴 타입별로 메뉴 목록을 가져오는 훅
 */
export function useMenus(menuType: 'user' | 'admin' | 'header_utility' | 'footer_utility') {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setIsLoading(true);
        const response = await api.getMenus({ menu_type: menuType });
        // sort_order로 정렬
        const sorted = response.items.sort((a, b) => a.sort_order - b.sort_order);
        setMenus(sorted);
      } catch (err) {
        console.error('Failed to load menus:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menus');
      } finally {
        setIsLoading(false);
      }
    };

    loadMenus();
  }, [menuType]);

  return { menus, isLoading, error };
}

/**
 * 메인 메뉴 (depth=0)만 가져오는 훅
 */
export function useMainMenus(menuType: 'user' | 'admin') {
  const { menus, isLoading, error } = useMenus(menuType);
  const mainMenus = menus.filter((menu) => menu.depth === 0);
  return { menus: mainMenus, isLoading, error };
}

/**
 * 헤더 유틸리티 메뉴 (로그인/로그아웃 등)
 */
export function useHeaderUtilityMenus() {
  return useMenus('header_utility');
}

/**
 * 푸터 유틸리티 메뉴
 */
export function useFooterUtilityMenus() {
  return useMenus('footer_utility');
}
