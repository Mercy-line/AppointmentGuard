'use client';

import { useState } from 'react';
import type { DoctorTimeOff } from '../types';

export function useTimeOff() {
  const [timeOffList, setTimeOffList] = useState<DoctorTimeOff[]>([]);
  const [startTime, setStartTime] = useState('2026-08-05T08:00');
  const [endTime, setEndTime] = useState('2026-08-05T17:00');
  const [reason, setReason] = useState('Personal Leave');

  const addTimeOff = (docId: string, docName: string) => {
    const item: DoctorTimeOff = {
      id: `TO-${Math.floor(100 + Math.random() * 900)}`,
      doctorId: docId, doctorName: docName, startTime, endTime, reason
    };
    setTimeOffList(prev => [item, ...prev]);
    return item;
  };

  return { timeOffList, startTime, setStartTime, endTime, setEndTime, reason, setReason, addTimeOff };
}
