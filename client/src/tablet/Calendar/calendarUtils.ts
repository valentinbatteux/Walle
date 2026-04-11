const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_SHORT = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
];

export interface DayData {
  dateString: string; // 'YYYY-MM-DD'
  dayName: string;    // 'Lun'
  dayNumber: number;  // 7
  monthShort: string; // 'Avr'
  isToday: boolean;
}

export function generateDays(centerDate: Date, count = 60): DayData[] {
  const days: DayData[] = [];
  const todayStr = toDateString(new Date());
  const start = new Date(centerDate);
  start.setDate(start.getDate() - Math.floor(count / 2));

  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateString = toDateString(d);
    days.push({
      dateString,
      dayName: DAYS_SHORT[d.getDay()],
      dayNumber: d.getDate(),
      monthShort: MONTHS_SHORT[d.getMonth()],
      isToday: dateString === todayStr,
    });
  }
  return days;
}

export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayString(): string {
  return toDateString(new Date());
}
