'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, addMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Campaign,
  Delete,
  Edit,
  LocalOffer,
  Percent,
  Person,
  Schedule,
  Star,
} from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import UISizeControl from '@/components/common/UISizeControl';
import { useSettingsStore } from '@/stores/settingsStore';
import { api } from '@/lib/api';
import type { Promotion, DiscountType, DiscountTarget } from '@/types';

const SERVICE_TYPES = [
  { code: 'full_care', name: '풀케어 (PRO)' },
  { code: 'hospital_care', name: '병원케어 (BASIC)' },
  { code: 'special_care', name: '특화케어 (SPECIAL)' },
];

const TARGET_TYPES = [
  { code: 'all', name: '전체 고객', description: '모든 고객에게 적용' },
  { code: 'new_customer', name: '신규 고객', description: '첫 이용 고객에게만 적용' },
  { code: 'returning', name: '재방문 고객', description: '2회 이상 이용 고객에게 적용' },
  { code: 'specific_service', name: '특정 서비스', description: '특정 서비스 이용 시에만 적용' },
];

export default function PromotionsSettingsPage() {
  const router = useRouter();
  const scale = useSettingsStore((state) => state.getScale());

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 새 프로모션 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    discountType: 'percent' as DiscountType,
    discountValue: 10,
    description: '',
    targetType: 'all' as DiscountTarget,
    targetServiceType: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
    maxUsage: 0,
  });

  // 프로모션 목록 조회
  const fetchPromotions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getMyPromotions();
      setPromotions(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로모션을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // 다이얼로그 열기
  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        name: promotion.name,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        description: promotion.description || '',
        targetType: promotion.targetType,
        targetServiceType: promotion.targetServiceType || '',
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        maxUsage: promotion.maxUsage || 0,
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        name: '',
        discountType: 'percent',
        discountValue: 10,
        description: '',
        targetType: 'all',
        targetServiceType: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
        maxUsage: 0,
      });
    }
    setIsDialogOpen(true);
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPromotion(null);
  };

  // 프로모션 저장
  const handleSavePromotion = async () => {
    try {
      setIsSaving(true);

      const requestData = {
        name: formData.name,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        targetType: formData.targetType,
        targetServiceType: formData.targetType === 'specific_service' ? formData.targetServiceType : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxUsage: formData.maxUsage > 0 ? formData.maxUsage : undefined,
      };

      if (editingPromotion) {
        await api.updatePromotion(editingPromotion.id, requestData);
      } else {
        await api.createPromotion(requestData);
      }

      handleCloseDialog();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchPromotions();
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로모션 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 프로모션 활성화/비활성화 토글
  const handleToggleActive = async (id: string) => {
    try {
      await api.togglePromotionActive(id);
      await fetchPromotions();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    }
  };

  // 프로모션 삭제
  const handleDeletePromotion = async (id: string) => {
    if (window.confirm('정말 이 프로모션을 삭제하시겠습니까?')) {
      try {
        await api.deletePromotion(id);
        await fetchPromotions();
      } catch (err) {
        setError(err instanceof Error ? err.message : '프로모션 삭제에 실패했습니다.');
      }
    }
  };

  // 날짜 표시
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'yyyy.MM.dd', { locale: ko });
  };

  // 프로모션 상태
  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (!promotion.isActive) return { label: '비활성', color: 'default' as const };
    if (now < start) return { label: '예정', color: 'info' as const };
    if (now > end) return { label: '종료', color: 'default' as const };
    return { label: '진행중', color: 'success' as const };
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
              sx={{ fontSize: `${0.95 * scale}rem` }}
            >
              뒤로가기
            </Button>
          </Box>
          <UISizeControl />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1, fontSize: `${1.5 * scale}rem` }}>
            🎉 할인/프로모션 설정
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
            고객에게 제공할 할인 및 프로모션을 설정하세요. 신규 동행인 할인, 첫 이용 할인 등을 설정할 수 있어요.
          </Typography>
        </Box>

        {/* 성공 알림 */}
        {showSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            프로모션이 저장되었습니다! 고객 목록에서 프로모션이 표시됩니다.
          </Alert>
        )}

        {/* 에러 알림 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 프로모션 추가 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ fontSize: `${1 * scale}rem` }}
          >
            새 프로모션 추가
          </Button>
        </Box>

        {/* 프로모션 목록 */}
        {promotions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Campaign sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontSize: `${1.2 * scale}rem` }}>
              등록된 프로모션이 없어요
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, fontSize: `${0.95 * scale}rem` }}>
              새 프로모션을 추가하여 더 많은 고객을 유치해보세요!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ fontSize: `${1 * scale}rem` }}
            >
              첫 프로모션 만들기
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {promotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              return (
                <Grid item xs={12} md={6} key={promotion.id}>
                  <Card
                    sx={{
                      opacity: promotion.isActive ? 1 : 0.7,
                      border: promotion.isActive ? '2px solid' : '1px solid',
                      borderColor: promotion.isActive ? 'primary.main' : 'divider',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {promotion.discountType === 'percent' ? (
                            <Chip
                              icon={<Percent sx={{ fontSize: 16 }} />}
                              label={`${promotion.discountValue}% 할인`}
                              color="primary"
                              sx={{ fontSize: `${0.9 * scale}rem`, fontWeight: 600 }}
                            />
                          ) : (
                            <Chip
                              icon={<LocalOffer sx={{ fontSize: 16 }} />}
                              label={`${promotion.discountValue.toLocaleString()}원 할인`}
                              color="secondary"
                              sx={{ fontSize: `${0.9 * scale}rem`, fontWeight: 600 }}
                            />
                          )}
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            sx={{ fontSize: `${0.8 * scale}rem` }}
                          />
                        </Box>
                        <Switch
                          checked={promotion.isActive}
                          onChange={() => handleToggleActive(promotion.id)}
                          size="small"
                        />
                      </Box>

                      <Typography fontWeight={600} sx={{ mb: 1, fontSize: `${1.1 * scale}rem` }}>
                        {promotion.name}
                      </Typography>
                      {promotion.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: `${0.9 * scale}rem` }}>
                          {promotion.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                            {TARGET_TYPES.find((t) => t.code === promotion.targetType)?.name}
                            {promotion.targetServiceType && ` (${SERVICE_TYPES.find((s) => s.code === promotion.targetServiceType)?.name})`}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                            {formatDate(promotion.startDate)} ~ {formatDate(promotion.endDate)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                            사용 횟수: {promotion.usedCount}회
                            {promotion.maxUsage && promotion.maxUsage > 0 && ` / ${promotion.maxUsage}회`}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleOpenDialog(promotion)}
                          sx={{ fontSize: `${0.85 * scale}rem` }}
                        >
                          수정
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeletePromotion(promotion.id)}
                          sx={{ fontSize: `${0.85 * scale}rem` }}
                        >
                          삭제
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* 안내 */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#F0FDF4' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, fontSize: `${1 * scale}rem` }}>
            💡 프로모션 활용 팁
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem`, lineHeight: 1.8 }}>
            • 신규 동행인이라면 <strong>20% 할인</strong> 프로모션으로 첫 고객을 유치해보세요.
            <br />
            • <strong>첫 이용 할인</strong>은 새로운 고객을 확보하는 데 효과적이에요.
            <br />
            • <strong>재방문 할인</strong>을 설정하면 고객 충성도를 높일 수 있어요.
            <br />
            • 프로모션 기간과 최대 사용 횟수를 설정하여 비용을 관리하세요.
          </Typography>
        </Paper>
      </Container>

      {/* 프로모션 추가/수정 다이얼로그 */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontSize: `${1.2 * scale}rem`, fontWeight: 600 }}>
          {editingPromotion ? '프로모션 수정' : '새 프로모션 추가'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* 프로모션 이름 */}
            <TextField
              label="프로모션 이름"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 신규 동행인 20% 할인"
              helperText="고객에게 표시되는 프로모션 제목입니다."
              sx={{ '& .MuiInputBase-input': { fontSize: `${1 * scale}rem` } }}
            />

            {/* 할인 유형 */}
            <FormControl>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: `${0.95 * scale}rem` }}>
                할인 유형
              </Typography>
              <RadioGroup
                row
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
              >
                <FormControlLabel
                  value="percent"
                  control={<Radio />}
                  label={<Typography sx={{ fontSize: `${0.95 * scale}rem` }}>% 할인</Typography>}
                />
                <FormControlLabel
                  value="fixed"
                  control={<Radio />}
                  label={<Typography sx={{ fontSize: `${0.95 * scale}rem` }}>원 할인</Typography>}
                />
              </RadioGroup>
            </FormControl>

            {/* 할인 금액/비율 */}
            <TextField
              label={formData.discountType === 'percent' ? '할인율 (%)' : '할인 금액 (원)'}
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {formData.discountType === 'percent' ? '%' : '원'}
                  </InputAdornment>
                ),
              }}
              inputProps={{
                min: 1,
                max: formData.discountType === 'percent' ? 100 : 100000,
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: `${1 * scale}rem` } }}
            />

            {/* 프로모션 설명 (선택) */}
            <TextField
              label="상세 설명 (선택)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="예: 12월 한정 특별 할인"
              multiline
              rows={2}
              sx={{ '& .MuiInputBase-input': { fontSize: `${1 * scale}rem` } }}
            />

            {/* 적용 대상 */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: `${0.95 * scale}rem` }}>적용 대상</InputLabel>
              <Select
                value={formData.targetType}
                label="적용 대상"
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value as DiscountTarget })}
                sx={{ fontSize: `${1 * scale}rem` }}
              >
                {TARGET_TYPES.map((target) => (
                  <MenuItem key={target.code} value={target.code} sx={{ fontSize: `${0.95 * scale}rem` }}>
                    <Box>
                      <Typography>{target.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {target.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 특정 서비스 선택 */}
            {formData.targetType === 'specific_service' && (
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: `${0.95 * scale}rem` }}>서비스 유형</InputLabel>
                <Select
                  value={formData.targetServiceType}
                  label="서비스 유형"
                  onChange={(e) => setFormData({ ...formData, targetServiceType: e.target.value })}
                  sx={{ fontSize: `${1 * scale}rem` }}
                >
                  {SERVICE_TYPES.map((service) => (
                    <MenuItem key={service.code} value={service.code} sx={{ fontSize: `${0.95 * scale}rem` }}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* 기간 설정 */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="시작일"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{ '& .MuiInputBase-input': { fontSize: `${1 * scale}rem` } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="종료일"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{ '& .MuiInputBase-input': { fontSize: `${1 * scale}rem` } }}
                />
              </Grid>
            </Grid>

            {/* 최대 사용 횟수 */}
            <TextField
              label="최대 사용 횟수 (0 = 무제한)"
              type="number"
              value={formData.maxUsage}
              onChange={(e) => setFormData({ ...formData, maxUsage: Number(e.target.value) })}
              inputProps={{ min: 0 }}
              helperText="이 프로모션을 적용할 수 있는 최대 예약 수입니다."
              sx={{ '& .MuiInputBase-input': { fontSize: `${1 * scale}rem` } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ fontSize: `${0.95 * scale}rem` }} disabled={isSaving}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePromotion}
            disabled={!formData.name || formData.discountValue <= 0 || isSaving}
            sx={{ fontSize: `${0.95 * scale}rem` }}
          >
            {isSaving ? <CircularProgress size={20} /> : (editingPromotion ? '수정하기' : '추가하기')}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
