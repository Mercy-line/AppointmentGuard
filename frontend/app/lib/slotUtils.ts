/**
 * Enforces Rule #4: Appointments must be booked at least 1 hour in advance.
 */
export function isSlotAtLeast1HourInAdvance(slotTimeStr: string, targetDateStr: string): boolean {
  try {
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000); // now + 1 hour

    const [time, period] = slotTimeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const [year, month, day] = targetDateStr.split('-').map(Number);
    const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0);

    return slotDateTime >= minBookingTime;
  } catch {
    return true;
  }
}

export function getTodayMinDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
