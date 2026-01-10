'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Refresh, Save, Info } from '@mui/icons-material';
import type {
  SystemSetting,
  FeatureCategory,
  FEATURE_CATEGORY_LABELS,
} from '@/types';
import { api } from '@/lib';

const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  auth: '인증/회원',
  reservation: '예약',
  payment: '결제',
  manager: '매니저',
  promotion: '프로모션',
  review: '리뷰',
  board: '게시판',
  notification: '알림',
  system: '시스템',
};

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [modifiedSettings, setModifiedSettings] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSettings();
  }, [selectedCategory]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await api.get<SystemSetting[]>('/admin/settings', { params });
      setSettings(response);
      setModifiedSettings(new Set());
    } catch (err: any) {
      setError(err.message || '설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (setting: SystemSetting) => {
    if (setting.isReadonly) return;

    try {
      const newValue = !setting.isEnabled;
      await api.patch(`/admin/settings/${setting.key}/toggle`, {
        isEnabled: newValue,
      });

      setSettings((prev) =>
        prev.map((s) =>
          s.id === setting.id ? { ...s, isEnabled: newValue } : s
        )
      );
      setSuccess(`${setting.name} 설정이 ${newValue ? '활성화' : '비활성화'}되었습니다.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || '설정 변경에 실패했습니다.');
    }
  };

  const handleValueChange = (settingId: number, value: any) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === settingId ? { ...s, value } : s))
    );
    setModifiedSettings((prev) => new Set(prev).add(settingId));
  };

  const handleSaveAll = async () => {
    if (modifiedSettings.size === 0) return;

    try {
      setSaving(true);
      setError(null);

      const settingsToUpdate = settings
        .filter((s) => modifiedSettings.has(s.id))
        .reduce((acc, s) => {
          acc[s.key] = s.value;
          return acc;
        }, {} as Record<string, any>);

      await api.post('/admin/settings/bulk-update', {
        settings: settingsToUpdate,
      });

      setSuccess('설정이 저장되었습니다.');
      setModifiedSettings(new Set());
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || '설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    if (!confirm('기본 설정을 초기화하시겠습니까?')) return;

    try {
      setLoading(true);
      await api.post('/admin/settings/initialize');
      setSuccess('기본 설정이 초기화되었습니다.');
      await loadSettings();
    } catch (err: any) {
      setError(err.message || '초기화에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const categories: Array<FeatureCategory | 'all'> = [
    'all',
    'system',
    'auth',
    'reservation',
    'payment',
    'manager',
    'promotion',
    'review',
    'board',
    'notification',
  ];

  const getCategoryLabel = (category: FeatureCategory | 'all') =>
    category === 'all' ? '전체' : CATEGORY_LABELS[category];

  const filteredSettings =
    selectedCategory === 'all'
      ? settings
      : settings.filter((s) => s.category === selectedCategory);

  const groupedSettings = filteredSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<FeatureCategory, SystemSetting[]>);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              시스템 관리
            </Typography>
            <Typography variant="body2" color="text.secondary">
              시스템 기능을 켜고 끌 수 있는 컨트롤 패널입니다.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadSettings}
              disabled={loading}
            >
              새로고침
            </Button>
            <Button variant="outlined" onClick={handleInitialize}>
              초기화
            </Button>
            {modifiedSettings.size > 0 && (
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveAll}
                disabled={saving}
              >
                저장 ({modifiedSettings.size})
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, value) => setSelectedCategory(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab
              key={cat}
              label={getCategoryLabel(cat)}
              value={cat}
            />
          ))}
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <Card key={category}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {CATEGORY_LABELS[category as FeatureCategory]}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {categorySettings.map((setting) => (
                    <Box
                      key={setting.id}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'background.default',
                        opacity: setting.isReadonly ? 0.7 : 1,
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {setting.name}
                            </Typography>
                            {setting.isReadonly && (
                              <Chip label="읽기 전용" size="small" color="default" />
                            )}
                            {modifiedSettings.has(setting.id) && (
                              <Chip label="수정됨" size="small" color="warning" />
                            )}
                          </Stack>
                          {setting.description && (
                            <Typography variant="body2" color="text.secondary">
                              {setting.description}
                            </Typography>
                          )}
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            키: {setting.key}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={setting.isEnabled}
                              onChange={() => handleToggle(setting)}
                              disabled={setting.isReadonly}
                              color={setting.isEnabled ? 'success' : 'default'}
                            />
                          }
                          label={setting.isEnabled ? 'ON' : 'OFF'}
                          labelPlacement="start"
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}

          {filteredSettings.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                설정이 없습니다.
              </Typography>
            </Paper>
          )}
        </Stack>
      )}
    </Box>
  );
}
