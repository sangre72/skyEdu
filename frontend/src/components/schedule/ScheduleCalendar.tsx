'use client';

import { useCallback, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// date-fns localizer 설정
const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// 이벤트 타입
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'available' | 'unavailable' | 'reservation' | 'recurring';
  customerName?: string;
  customerPhone?: string;
  hospitalName?: string;
  status?: 'pending' | 'confirmed' | 'completed';
  isRecurring?: boolean;
  recurringDays?: number[];
}

// SlotInfo 타입 정의
export interface SlotInfo {
  start: Date;
  end: Date;
  slots: Date[];
  action: 'select' | 'click' | 'doubleClick';
}

interface ScheduleCalendarProps {
  events: CalendarEvent[];
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  scale: number;
  height: number;
}

export default function ScheduleCalendar({
  events,
  onSelectSlot,
  onSelectEvent,
  scale,
  height,
}: ScheduleCalendarProps) {
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());

  // 이벤트 스타일
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      let backgroundColor = '#0288D1'; // 기본: 파란색 (가능 시간)
      let borderColor = '#01579B';

      if (event.type === 'reservation') {
        if (event.status === 'confirmed') {
          backgroundColor = '#4CAF50'; // 녹색 (확정된 예약)
          borderColor = '#2E7D32';
        } else {
          backgroundColor = '#FF9800'; // 주황색 (대기 중)
          borderColor = '#E65100';
        }
      } else if (event.type === 'recurring') {
        backgroundColor = '#7C3AED'; // 보라색 (반복)
        borderColor = '#5B21B6';
      } else if (event.type === 'unavailable') {
        backgroundColor = '#9E9E9E'; // 회색 (휴무)
        borderColor = '#616161';
      }

      return {
        style: {
          backgroundColor,
          borderColor,
          borderRadius: '4px',
          opacity: 0.9,
          color: 'white',
          border: `1px solid ${borderColor}`,
          fontSize: `${0.8 * scale}rem`,
          cursor: 'pointer',
        },
      };
    },
    [scale]
  );

  // 커스텀 메시지 (한국어)
  const messages = useMemo(
    () => ({
      today: '오늘',
      previous: '이전',
      next: '다음',
      month: '월',
      week: '주',
      day: '일',
      agenda: '일정',
      date: '날짜',
      time: '시간',
      event: '일정',
      noEventsInRange: '이 기간에 등록된 일정이 없습니다.',
      showMore: (total: number) => `+${total}개 더보기`,
    }),
    []
  );

  // 캘린더 포맷
  const formats = useMemo(
    () => ({
      dayFormat: (d: Date) => format(d, 'EEE d', { locale: ko }),
      dayHeaderFormat: (d: Date) => format(d, 'M월 d일 (EEE)', { locale: ko }),
      dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
        `${format(start, 'M월 d일', { locale: ko })} - ${format(end, 'M월 d일', { locale: ko })}`,
      monthHeaderFormat: (d: Date) => format(d, 'yyyy년 M월', { locale: ko }),
      weekdayFormat: (d: Date) => format(d, 'EEE', { locale: ko }),
      timeGutterFormat: (d: Date) => format(d, 'HH:mm'),
      eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
        `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
    }),
    []
  );

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  return (
    <div
      style={{
        height,
        width: '100%',
      }}
    >
      <style>{`
        .rbc-calendar {
          font-size: ${0.9 * scale}rem;
        }
        .rbc-toolbar {
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rbc-toolbar button {
          font-size: ${0.85 * scale}rem;
          padding: 8px 16px;
          cursor: pointer;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fff;
          color: #333;
        }
        .rbc-toolbar button:hover {
          background-color: #f5f5f5;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #0288D1;
          color: white;
          border-color: #0288D1;
        }
        .rbc-btn-group button {
          margin-right: -1px;
        }
        .rbc-btn-group button:first-child {
          border-radius: 4px 0 0 4px;
        }
        .rbc-btn-group button:last-child {
          border-radius: 0 4px 4px 0;
        }
        .rbc-header {
          font-size: ${0.9 * scale}rem;
          font-weight: 600;
          padding: 8px 4px;
        }
        .rbc-date-cell {
          font-size: ${0.9 * scale}rem;
          padding: 4px;
          cursor: pointer;
        }
        .rbc-event {
          font-size: ${0.75 * scale}rem;
          cursor: pointer;
        }
        .rbc-today {
          background-color: rgba(2, 136, 209, 0.1);
        }
        .rbc-off-range-bg {
          background-color: #FAFAFA;
        }
        .rbc-time-slot {
          cursor: pointer;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f0f0f0;
        }
        .rbc-timeslot-group {
          min-height: 60px;
        }
        .rbc-time-view {
          border: 1px solid #ddd;
        }
        .rbc-time-header {
          border-bottom: 1px solid #ddd;
        }
        .rbc-time-content {
          border-top: none;
        }
        .rbc-day-slot .rbc-events-container {
          margin-right: 0;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
        view={view}
        date={date}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        formats={formats}
        min={new Date(0, 0, 0, 7, 0, 0)}
        max={new Date(0, 0, 0, 22, 0, 0)}
        step={30}
        timeslots={2}
        popup
        showMultiDayTimes
      />
    </div>
  );
}
