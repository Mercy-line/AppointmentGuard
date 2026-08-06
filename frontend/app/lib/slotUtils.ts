export const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTimezoneBadgeDisplay = (tzChoice: string): string => {
  try {
    let tzName = tzChoice;
    if (tzChoice === 'AUTO') {
      tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Nairobi';
    }
    const offsetMinutes = -new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const mins = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const formattedOffset = `UTC${sign}${hours}${mins > 0 ? `:${mins}` : ''}`;

    let shortName = tzName.split('/')[1]?.replace(/_/g, ' ') || 'Local';
    if (tzName === 'Africa/Nairobi') shortName = 'EAT';
    if (tzName === 'UTC') shortName = 'UTC';
    if (tzName === 'America/New_York') shortName = 'EST';
    if (tzName === 'America/Los_Angeles') shortName = 'PST';
    if (tzName === 'Europe/London') shortName = 'GMT';
    if (tzName === 'Europe/Paris') shortName = 'CET';
    if (tzName === 'Asia/Dubai') shortName = 'GST';
    if (tzName === 'Asia/Kolkata') shortName = 'IST';
    if (tzName === 'Asia/Tokyo') shortName = 'JST';

    return `${shortName} (${formattedOffset})`;
  } catch {
    return 'EAT (UTC+3)';
  }
};

export const isSlotValidWithAdvanceNotice = (slotTimeStr: string, dateStr: string): boolean => {
  try {
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000);

    const [time, period] = slotTimeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const [year, month, day] = dateStr.split('-').map(Number);
    const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0);

    return slotDateTime >= minBookingTime;
  } catch {
    return true;
  }
};
