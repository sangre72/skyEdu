'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Add, Close, Delete, Save } from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import UISizeControl from '@/components/common/UISizeControl';
import { useSettingsStore } from '@/stores/settingsStore';
import { api } from '@/lib/api';
import type { ManagerSchedule } from '@/types';
import type { CalendarEvent, SlotInfo } from '@/components/schedule/ScheduleCalendar';

// 캘린더 컴포넌트를 dynamic import (SSR 비활성화)
const ScheduleCalendar = dynamic(
  () => import('@/components/schedule/ScheduleCalendar'),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 500,
          bgcolor: '#f5f5f5',
          borderRadius: 2,
        }}
      >
        <CircularProgress />
      </Box>
    ),
  }
);

// 시간 옵션 생성
const generateTimeOptions = () => {
  const options = [];
  for (let h = 7; h <= 22; h++) {
    options.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 22) {
      options.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// 요일 정보
const WEEKDAYS = [
  { code: 0, name: '일요일', short: '일' },
  { code: 1, name: '월요일', short: '월' },
  { code: 2, name: '화요일', short: '화' },
  { code: 3, name: '수요일', short: '수' },
  { code: 4, name: '목요일', short: '목' },
  { code: 5, name: '금요일', short: '금' },
  { code: 6, name: '토요일', short: '토' },
];

export default function CompanionSchedulePage() {
  const router = useRouter();
  const scale = useSettingsStore((state) => state.getScale());
  const today = useMemo(() => new Date(), []);

  // 이벤트 데이터
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // 스케줄 ID 맵 (이벤트 ID -> 스케줄 ID)
  const [scheduleIdMap, setScheduleIdMap] = useState<Map<string, string>>(new Map());

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);

  // 새 이벤트 편집 상태
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndTime, setEditEndTime] = useState('18:00');
  const [editDate, setEditDate] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // 스케줄 데이터를 CalendarEvent로 변환
  const convertScheduleToEvent = useCallback((schedule: ManagerSchedule): CalendarEvent => {
    const [year, month, day] = schedule.date.split('-').map(Number);
    const [startHour, startMin] = schedule.start_time.split(':').map(Number);
    const [endHour, endMin] = schedule.end_time.split(':').map(Number);

    const start = new Date(year, month - 1, day, startHour, startMin);
    const end = new Date(year, month - 1, day, endHour, endMin);

    return {
      id: `schedule-${schedule.id}`,
      title: schedule.is_available ? '가능 시간' : '휴무',
      start,
      end,
      type: schedule.is_available ? 'available' : 'unavailable',
    };
  }, []);

  // 스케줄 로드
  const loadSchedules = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      // 현재 월 ±1개월 범위 조회
      const startDate = format(startOfMonth(addMonths(currentMonth, -1)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(addMonths(currentMonth, 1)), 'yyyy-MM-dd');

      const schedules = await api.getMySchedules({ startDate, endDate });

      // 스케줄을 이벤트로 변환
      const scheduleEvents = schedules.map(convertScheduleToEvent);

      // ID 맵 업데이트
      const newMap = new Map<string, string>();
      schedules.forEach((schedule) => {
        newMap.set(`schedule-${schedule.id}`, schedule.id);
      });
      setScheduleIdMap(newMap);

      // TODO: 예약 데이터도 함께 로드
      // const reservations = await api.getMyReservations({ startDate, endDate });

      // 샘플 예약 데이터 (임시)
      const now = new Date();
      const sampleReservations: CalendarEvent[] = [
        {
          id: 'res-1',
          title: '김*수 - 서울대병원',
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 9, 0),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 12, 0),
          type: 'reservation',
          customerName: '김*수',
          customerPhone: '010-1234-5678',
          hospitalName: '서울대병원',
          status: 'confirmed',
        },
      ];

      setEvents([...scheduleEvents, ...sampleReservations]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '스케줄을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, convertScheduleToEvent]);

  // 초기 로드
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 슬롯 선택 (새 이벤트 생성)
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      const startDate = slotInfo.start;
      const isPast = startDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (isPast) return;

      setEditDate(startDate);
      setEditStartTime(format(startDate, 'HH:mm'));
      setEditEndTime(format(slotInfo.end, 'HH:mm'));
      setIsRecurring(false);
      setRecurringDays([startDate.getDay()]);
      setSelectedEvent(null);
      setIsNewEvent(true);
      setDialogOpen(true);
    },
    [today]
  );

  // 이벤트 선택 (상세 보기/편집)
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditDate(event.start);
    setEditStartTime(format(event.start, 'HH:mm'));
    setEditEndTime(format(event.end, 'HH:mm'));
    setIsRecurring(event.isRecurring || false);
    setRecurringDays(event.recurringDays || [event.start.getDay()]);
    setIsNewEvent(false);
    setDialogOpen(true);
  }, []);

  // 이벤트 저장
  const handleSaveEvent = async () => {
    setIsSaving(true);
    setError('');

    try {
      const [startHour, startMin] = editStartTime.split(':').map(Number);
      const [endHour, endMin] = editEndTime.split(':').map(Number);

      if (isNewEvent) {
        // 새 이벤트 생성
        if (isRecurring && recurringDays.length > 0) {
          // 반복 이벤트: 향후 4주간 생성
          const createdSchedules: ManagerSchedule[] = [];

          for (let week = 0; week < 4; week++) {
            for (const day of recurringDays) {
              const eventDate = new Date(editDate);
              const diff = day - editDate.getDay() + week * 7;
              eventDate.setDate(editDate.getDate() + diff);

              if (eventDate >= today) {
                const schedule = await api.createSchedule({
                  date: format(eventDate, 'yyyy-MM-dd'),
                  start_time: editStartTime,
                  end_time: editEndTime,
                  is_available: true,
                });
                createdSchedules.push(schedule);
              }
            }
          }

          // UI 업데이트
          const newEvents = createdSchedules.map(convertScheduleToEvent);
          setEvents((prev) => [...prev, ...newEvents]);

          // ID 맵 업데이트
          setScheduleIdMap((prev) => {
            const newMap = new Map(prev);
            createdSchedules.forEach((schedule) => {
              newMap.set(`schedule-${schedule.id}`, schedule.id);
            });
            return newMap;
          });
        } else {
          // 단일 이벤트 생성
          const schedule = await api.createSchedule({
            date: format(editDate, 'yyyy-MM-dd'),
            start_time: editStartTime,
            end_time: editEndTime,
            is_available: true,
          });

          const newEvent = convertScheduleToEvent(schedule);
          setEvents((prev) => [...prev, newEvent]);

          // ID 맵 업데이트
          setScheduleIdMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(`schedule-${schedule.id}`, schedule.id);
            return newMap;
          });
        }
      } else if (selectedEvent && selectedEvent.type !== 'reservation') {
        // 기존 이벤트 수정
        const scheduleId = scheduleIdMap.get(selectedEvent.id);
        if (scheduleId) {
          const updatedSchedule = await api.updateSchedule(scheduleId, {
            start_time: editStartTime,
            end_time: editEndTime,
            is_available: true,
          });

          const updatedEvent = convertScheduleToEvent(updatedSchedule);
          setEvents((prev) =>
            prev.map((e) => (e.id === selectedEvent.id ? updatedEvent : e))
          );
        }
      }

      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 이벤트 삭제
  const handleDeleteEvent = async () => {
    if (!selectedEvent || selectedEvent.type === 'reservation') return;

    setIsSaving(true);
    setError('');

    try {
      const scheduleId = scheduleIdMap.get(selectedEvent.id);
      if (scheduleId) {
        await api.deleteSchedule(scheduleId);
        setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
        setScheduleIdMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(selectedEvent.id);
          return newMap;
        });
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 반복 요일 토글
  const handleRecurringDayToggle = (dayCode: number) => {
    setRecurringDays((prev) =>
      prev.includes(dayCode) ? prev.filter((d) => d !== dayCode) : [...prev, dayCode]
    );
  };

  // 설정 완료
  const handleSubmit = async () => {
    const availableEvents = events.filter((e) => e.type === 'available' || e.type === 'recurring');
    if (availableEvents.length === 0) {
      setError('최소 1개 이상의 가능 시간을 등록해주세요.');
      return;
    }

    // 모든 스케줄은 실시간으로 저장되므로, 완료 시 대시보드로 이동
    router.push('/companion/dashboard');
  };

  // 캘린더 높이 계산
  const calendarHeight = useMemo(() => {
    return Math.max(500, 600 * scale);
  }, [scale]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Breadcrumb
          items={[
            { label: '마이페이지', href: '/mypage' },
            { label: '스케줄 관리' },
          ]}
          backHref="/mypage"
        />

        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mb: 1, fontSize: `${1.5 * scale}rem` }}
              >
                스케줄 관리
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
                달력에서 드래그하여 동행 가능한 시간을 등록하세요.
              </Typography>
            </Box>
            <UISizeControl />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading && (
            <>
              {/* 범례 */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label="가능 시간"
              sx={{ bgcolor: '#0288D1', color: 'white', fontSize: `${0.8 * scale}rem` }}
            />
            <Chip
              size="small"
              label="반복 일정"
              sx={{ bgcolor: '#7C3AED', color: 'white', fontSize: `${0.8 * scale}rem` }}
            />
            <Chip
              size="small"
              label="확정된 예약"
              sx={{ bgcolor: '#4CAF50', color: 'white', fontSize: `${0.8 * scale}rem` }}
            />
            <Chip
              size="small"
              label="대기 중 예약"
              sx={{ bgcolor: '#FF9800', color: 'white', fontSize: `${0.8 * scale}rem` }}
            />
          </Box>

          {/* 캘린더 */}
          <ScheduleCalendar
            events={events}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            scale={scale}
            height={calendarHeight}
          />

          {/* 안내 사항 */}
          <Box
            sx={{
              bgcolor: '#FFF3E0',
              p: 3,
              borderRadius: 2,
              mt: 4,
              mb: 4,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ mb: 1, fontSize: `${1 * scale}rem` }}
            >
              이용 안내
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: `${0.9 * scale}rem` }}
            >
              • 달력에서 드래그하여 가능한 시간대를 등록하세요.
              <br />
              • 등록된 시간을 클릭하면 수정하거나 삭제할 수 있습니다.
              <br />
              • &apos;매주 반복&apos; 설정 시 선택한 요일에 자동으로 적용됩니다.
              <br />• 예약이 확정된 시간(녹색)은 수정할 수 없습니다.
            </Typography>
          </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={isLoading || isSaving}
                sx={{ fontSize: `${1 * scale}rem`, py: 1.5 }}
              >
                설정 완료
              </Button>
            </>
          )}
        </Paper>
      </Container>

      {/* 시간 설정 다이얼로그 */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: `${1.2 * scale}rem` }}>
                {selectedEvent?.type === 'reservation'
                  ? '예약 상세'
                  : isNewEvent
                    ? '가능 시간 등록'
                    : '가능 시간 수정'}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: `${0.9 * scale}rem` }}
              >
                {format(editDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
              </Typography>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedEvent?.type === 'reservation' ? (
            // 예약 상세 보기
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" sx={{ mb: 2, fontSize: `${1 * scale}rem` }}>
                <strong>고객명:</strong> {selectedEvent.customerName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: `${1 * scale}rem` }}>
                <strong>연락처:</strong> {selectedEvent.customerPhone}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: `${1 * scale}rem` }}>
                <strong>병원:</strong> {selectedEvent.hospitalName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: `${1 * scale}rem` }}>
                <strong>시간:</strong> {format(selectedEvent.start, 'HH:mm')} ~{' '}
                {format(selectedEvent.end, 'HH:mm')}
              </Typography>
              <Chip
                label={selectedEvent.status === 'confirmed' ? '확정됨' : '대기 중'}
                color={selectedEvent.status === 'confirmed' ? 'success' : 'warning'}
                sx={{ fontSize: `${0.85 * scale}rem` }}
              />
            </Box>
          ) : (
            // 가능 시간 등록/수정
            <Box sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontSize: `${0.9 * scale}rem` }}>시작 시간</InputLabel>
                  <Select
                    value={editStartTime}
                    label="시작 시간"
                    onChange={(e) => setEditStartTime(e.target.value)}
                    sx={{ fontSize: `${1 * scale}rem` }}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <MenuItem key={time} value={time} sx={{ fontSize: `${0.95 * scale}rem` }}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontSize: `${0.9 * scale}rem` }}>종료 시간</InputLabel>
                  <Select
                    value={editEndTime}
                    label="종료 시간"
                    onChange={(e) => setEditEndTime(e.target.value)}
                    sx={{ fontSize: `${1 * scale}rem` }}
                  >
                    {TIME_OPTIONS.map((time) => (
                      <MenuItem key={time} value={time} sx={{ fontSize: `${0.95 * scale}rem` }}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                }
                label={
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ fontSize: `${1 * scale}rem` }}
                    >
                      매주 반복
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: `${0.85 * scale}rem` }}
                    >
                      선택한 요일에 매주 같은 시간으로 적용됩니다
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', ml: 0 }}
              />

              {isRecurring && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {WEEKDAYS.map((day) => (
                    <Chip
                      key={day.code}
                      label={day.short}
                      onClick={() => handleRecurringDayToggle(day.code)}
                      variant={recurringDays.includes(day.code) ? 'filled' : 'outlined'}
                      color={recurringDays.includes(day.code) ? 'primary' : 'default'}
                      sx={{
                        minWidth: 44,
                        fontSize: `${0.9 * scale}rem`,
                        cursor: 'pointer',
                        color:
                          day.code === 0
                            ? recurringDays.includes(day.code)
                              ? 'white'
                              : 'error.main'
                            : day.code === 6
                              ? recurringDays.includes(day.code)
                                ? 'white'
                                : 'primary.main'
                              : undefined,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          {selectedEvent?.type !== 'reservation' && !isNewEvent && (
            <Button
              onClick={handleDeleteEvent}
              color="error"
              startIcon={<Delete />}
              disabled={isSaving}
              sx={{ fontSize: `${0.9 * scale}rem` }}
            >
              삭제
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={isSaving}
            sx={{ fontSize: `${0.9 * scale}rem` }}
          >
            {selectedEvent?.type === 'reservation' ? '닫기' : '취소'}
          </Button>
          {selectedEvent?.type !== 'reservation' && (
            <Button
              variant="contained"
              onClick={handleSaveEvent}
              startIcon={isSaving ? <CircularProgress size={20} /> : isNewEvent ? <Add /> : <Save />}
              disabled={isSaving}
              sx={{ fontSize: `${0.9 * scale}rem` }}
            >
              {isSaving ? '처리 중...' : isNewEvent ? '등록' : '저장'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
