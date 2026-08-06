import type { TimeSlot } from '../types';

export const TIMEZONE_OPTIONS = [
  { value: 'AUTO', label: 'Auto (Detected)' },
  { value: 'Africa/Nairobi', label: 'EAT (UTC+3 - East Africa)' },
  { value: 'UTC', label: 'UTC (UTC+0 - Universal)' },
  { value: 'America/New_York', label: 'EST (UTC-5 - New York)' },
  { value: 'America/Los_Angeles', label: 'PST (UTC-8 - Los Angeles)' },
  { value: 'Europe/London', label: 'GMT (UTC+0 - London)' },
  { value: 'Europe/Paris', label: 'CET (UTC+1 - Paris)' },
  { value: 'Asia/Dubai', label: 'GST (UTC+4 - Dubai)' },
  { value: 'Asia/Kolkata', label: 'IST (UTC+5:30 - India)' },
  { value: 'Asia/Tokyo', label: 'JST (UTC+9 - Tokyo)' },
];

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
