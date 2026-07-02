// lib/data/holidays.utils.ts

import { Holiday, holidays } from './holidays';

export function getNextHoliday(allHolidays: Record<number, Holiday[]> = holidays): Holiday | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allHolidayList = Object.values(allHolidays).flat();
  
  const upcoming = allHolidayList
    .filter(h => {
      const holidayDate = new Date(h.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return upcoming[0] || null;
}

export function getAvailableYears(allHolidays: Record<number, Holiday[]> = holidays): number[] {
  return Object.keys(allHolidays)
    .map(Number)
    .sort((a, b) => a - b);
}

export function getHolidaysForYear(year: number, allHolidays: Record<number, Holiday[]> = holidays): Holiday[] {
  const yearHolidays = allHolidays[year] || [];
  return [...yearHolidays].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Get upcoming holidays for the current year (from today onwards).
 */
export function getUpcomingHolidaysThisYear(allHolidays: Record<number, Holiday[]> = holidays): Holiday[] {
  const currentYear = getCurrentYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return getHolidaysForYear(currentYear, allHolidays).filter(h => {
    const holidayDate = new Date(h.date);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate >= today;
  });
}

/**
 * Get past holidays for the current year (before today), in reverse chronological order.
 */
export function getPastHolidaysThisYear(allHolidays: Record<number, Holiday[]> = holidays): Holiday[] {
  const currentYear = getCurrentYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return getHolidaysForYear(currentYear, allHolidays)
    .filter(h => {
      const holidayDate = new Date(h.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate < today;
    })
    .reverse();
}

/**
 * Get holidays for a past year in reverse chronological order (December to January).
 */
export function getPastYearHolidays(year: number, allHolidays: Record<number, Holiday[]> = holidays): Holiday[] {
  return getHolidaysForYear(year, allHolidays).reverse();
}

/**
 * Format an ISO date string to a readable format (e.g., "1 January 2026").
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date without the year (e.g., "1 January").
 * Used in tables where the year is already in the section heading.
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Get the day of the week for a date (e.g., "Monday").
 */
export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
}

/**
 * Get the symbol/notation for a holiday type.
 */
export function getHolidaySymbol(type: Holiday['type']): string {
  switch (type) {
    case 'religious': return '*';
    case 'designated': return '**';
    case 'special': return '†';
    default: return '';
  }
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getDefaultDisplayYear(allHolidays: Record<number, Holiday[]> = holidays): number {
  const currentYear = getCurrentYear();
  const availableYears = getAvailableYears(allHolidays);
  
  if (availableYears.includes(currentYear)) {
    return currentYear;
  }
  
  const futureYears = availableYears.filter(y => y >= currentYear);
  return futureYears[0] || availableYears[0];
}

/**
 * Get the range of past years to display (from currentYear-1 down to 2020).
 */
export function getPastYearsRange(startYear: number = 2020): number[] {
  const currentYear = getCurrentYear();
  const years: number[] = [];
  for (let year = currentYear - 1; year >= startYear; year--) {
    years.push(year);
  }
  return years;
}