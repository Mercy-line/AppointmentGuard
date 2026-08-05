import type { TimeSlot } from '../types';

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: '09:00 AM', available: true },
  { time: '09:30 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '10:30 AM', available: true },
  { time: '11:30 AM', available: true },
  { time: '01:00 PM', available: true },
  { time: '02:30 PM', available: true },
  { time: '03:00 PM', available: true },
];

export const CLINIC_HOURS = 'Mon–Fri, 9:00 AM – 5:00 PM (EAT / UTC)';
