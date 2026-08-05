'use client';

import { useState, useEffect } from 'react';
import type { Appointment, Doctor, User } from '../types';
import { fetchPatientAppointmentsAPI, bookAppointmentAPI, cancelAppointmentAPI, rescheduleAppointmentAPI } from '../lib/api';

export function useAppointments(currentUser: User | null, doctorsList: Doctor[]) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState('2026-08-05');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppts() {
      if (currentUser && currentUser.role === 'PATIENT') {
        const data = await fetchPatientAppointmentsAPI(currentUser.id);
        if (data && Array.isArray(data)) setAppointments(data);
      }
    }
    loadAppts();
  }, [currentUser]);

  const handleBook = async (docId: string, patientName: string) => {
    if (!selectedTimeSlot) return;
    const doc = doctorsList.find(d => d.id === docId);
    const apiRes = await bookAppointmentAPI(docId, `${selectedDate}T10:00:00Z`, currentUser?.id);
    const newAppt: Appointment = {
      id: apiRes?.id || `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorId: docId, doctorName: doc ? doc.name : 'Doctor', specialization: doc ? doc.specialization : 'General',
      patientId: currentUser ? currentUser.id : 'P101', patientName: currentUser ? currentUser.name : patientName,
      date: selectedDate, time: selectedTimeSlot, status: 'CONFIRMED'
    };
    setAppointments(prev => [newAppt, ...prev]);
    setSelectedTimeSlot(null);
  };

  const handleCancel = async (apptId: string, reason: string) => {
    await cancelAppointmentAPI(apptId, reason);
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: 'CANCELLED', cancellationReason: reason } : a));
  };

  const handleReschedule = async (apptId: string, newDate: string, newSlot: string) => {
    await rescheduleAppointmentAPI(apptId, `${newDate}T11:00:00Z`);
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, date: newDate, time: newSlot, status: 'CONFIRMED' } : a));
  };

  return { appointments, setAppointments, selectedDate, setSelectedDate, selectedTimeSlot, setSelectedTimeSlot, handleBook, handleCancel, handleReschedule };
}
