'use client';

import { useState } from 'react';
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
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
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
  NewReleases,
  Percent,
  Person,
  Schedule,
  Star,
} from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import UISizeControl from '@/components/common/UISizeControl';
import { useSettingsStore } from '@/stores/settingsStore';

// 프로모션 타입
interface Promotion {
  id: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
  isActive: boolean;
  targetType: 'all' | 'new_customer' | 'returning' | 'specific_service';
  specificService?: string;
  startDate: string;
  endDate: string;
  maxUsage?: number;
  usageCount: number;
  createdAt: string;
}

// 임시 프로모션 데이터
const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    type: 'percent',
    value: 20,
    description: '신규 동행인 20% 할인',
    isActive: true,
    targetType: 'all',
    startDate: '2024-12-01',
    endDate: '2025-03-01',
    maxUsage: 50,
    usageCount: 12,
    createdAt: '2024-12-01',
  },
  {
    id: '2',
    type: 'percent',
    value: 10,
    description: '첫 이용 고객 10% 할인',
    isActive: true,
    targetType: 'new_customer',
    startDate: '2024-12-15',
    endDate: '2025-06-30',
    usageCount: 5,
    createdAt: '2024-12-15',
  },
  {
    id: '3',
    type: 'fixed',
    value: 5000,
    description: '재방문 고객 5,000원 할인',
    isActive: false,
    targetType: 'returning',
    startDate: '2024-11-01',
    endDate: '2024-12-31',
    usageCount: 8,
    createdAt: '2024-11-01',
  },
];

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

  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // 새 프로모션 폼 상태
  const [formData, setFormData] = useState({
    type: 'percent' as 'percent' | 'fixed',
    value: 10,
    description: '',
    targetType: 'all' as 'all' | 'new_customer' | 'returning' | 'specific_service',
    specificService: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
    maxUsage: 0,
  });

  // 다이얼로그 열기
  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        type: promotion.type,
        value: promotion.value,
        description: promotion.description,
        targetType: promotion.targetType,
        specificService: promotion.specificService || '',
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        maxUsage: promotion.maxUsage || 0,
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        type: 'percent',
        value: 10,
        description: '',
        targetType: 'all',
        specificService: '',
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
  const handleSavePromotion = () => {
    if (editingPromotion) {
      // 수정
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === editingPromotion.id
            ? {
                ...p,
                ...formData,
              }
            : p
        )
      );
    } else {
      // 새로 생성
      const newPromotion: Promotion = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        usageCount: 0,
        createdAt: format(new Date(), 'yyyy-MM-dd'),
      };
      setPromotions((prev) => [newPromotion, ...prev]);
    }

    handleCloseDialog();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // 프로모션 활성화/비활성화 토글
  const handleToggleActive = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // 프로모션 삭제
  const handleDeletePromotion = (id: string) => {
    if (window.confirm('정말 이 프로모션을 삭제하시겠습니까?')) {
      setPromotions((prev) => prev.filter((p) => p.id !== id));
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
                          {promotion.type === 'percent' ? (
                            <Chip
                              icon={<Percent sx={{ fontSize: 16 }} />}
                              label={`${promotion.value}% 할인`}
                              color="primary"
                              sx={{ fontSize: `${0.9 * scale}rem`, fontWeight: 600 }}
                            />
                          ) : (
                            <Chip
                              icon={<LocalOffer sx={{ fontSize: 16 }} />}
                              label={`${promotion.value.toLocaleString()}원 할인`}
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
                        {promotion.description}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                            {TARGET_TYPES.find((t) => t.code === promotion.targetType)?.name}
                            {promotion.specificService && ` (${SERVICE_TYPES.find((s) => s.code === promotion.specificService)?.name})`}
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
                            사용 횟수: {promotion.usageCount}회
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
            {/* 할인 유형 */}
            <FormControl>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: `${0.95 * scale}rem` }}>
                할인 유형
              </Typography>
              <RadioGroup
                row
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percent' | 'fixed' })}
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
              label={formData.type === 'percent' ? '할인율 (%)' : '할인 금액 (원)'}
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {formData.type === 'percent' ? '%' : '원'}
                  </InputAdornment>
                ),
              }}
              inputProps={{
                min: 1,
                max: formData.type === 'percent' ? 100 : 100000,
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: `${1 * scale}rem` } }}
            />

            {/* 프로모션 설명 */}
            <TextField
              label="프로모션 설명"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="예: 신규 동행인 20% 할인"
              helperText="고객에게 표시되는 프로모션 설명입니다."
              sx={{ '& .MuiInputBase-input': { fontSize: `${1 * scale}rem` } }}
            />

            {/* 적용 대상 */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: `${0.95 * scale}rem` }}>적용 대상</InputLabel>
              <Select
                value={formData.targetType}
                label="적용 대상"
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value as typeof formData.targetType })}
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
                  value={formData.specificService}
                  label="서비스 유형"
                  onChange={(e) => setFormData({ ...formData, specificService: e.target.value })}
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
          <Button onClick={handleCloseDialog} sx={{ fontSize: `${0.95 * scale}rem` }}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePromotion}
            disabled={!formData.description || formData.value <= 0}
            sx={{ fontSize: `${0.95 * scale}rem` }}
          >
            {editingPromotion ? '수정하기' : '추가하기'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
