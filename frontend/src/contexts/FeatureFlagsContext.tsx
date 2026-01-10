'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { SystemSetting } from '@/types';
import { api } from '@/lib';

interface FeatureFlagsContextType {
  settings: Record<string, SystemSetting>;
  isLoading: boolean;
  isFeatureEnabled: (key: string) => boolean;
  refresh: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, SystemSetting>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await api.getSystemSettings();
      const settingsMap: Record<string, SystemSetting> = {};
      data.forEach((setting) => {
        settingsMap[setting.key] = setting;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // 5분마다 자동 갱신
    const interval = setInterval(loadSettings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isFeatureEnabled = (key: string): boolean => {
    const setting = settings[key];
    if (!setting) return true; // 설정이 없으면 기본적으로 활성화
    // snake_case 사용
    return (setting as any).is_enabled ?? true;
  };

  const refresh = async () => {
    setIsLoading(true);
    await loadSettings();
  };

  return (
    <FeatureFlagsContext.Provider value={{ settings, isLoading, isFeatureEnabled, refresh }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}
