import { i18n } from './i18n';

export function toISODate(value: string, locale: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

  if (!match) {
    return null;
  }

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3]);

  const isEnglish = locale === 'en-US';

  const day = isEnglish ? second : first;
  const month = isEnglish ? first : second;

  const date = new Date(year, month - 1, day);

  const isValid =
    year >= 1900 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= new Date();

  if (!isValid) {
    return null;
  }

  const formattedYear = String(year).padStart(4, '0');
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');

  return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}

export function formatISODate(isoDate: string, locale: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

  if (!match) {
    return '';
  }

  const [, year, month, day] = match;

  if (locale === 'en-US') {
    return `${month}/${day}/${year}`;
  }

  return `${day}/${month}/${year}`;
}

// LocalDate/LocalDateTime carry wall-clock values, not a timezone. UTC here is
// only a formatting container: never parse these values as browser-local instants.
function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour = '0', minute = '0', second = '0'] = match;
  const date = new Date(0);
  date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  date.setUTCHours(Number(hour), Number(minute), Number(second), 0);
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day) ||
    date.getUTCHours() !== Number(hour) ||
    date.getUTCMinutes() !== Number(minute) ||
    date.getUTCSeconds() !== Number(second)
  )
    return null;
  return date;
}

export function formatDate(
  value: string | null | undefined,
  locale: string = i18n.global.locale.value,
): string {
  const date = value ? parseCalendarDate(value.slice(0, 10)) : null;
  return date
    ? new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC',
      }).format(date)
    : '-';
}

export function formatDateTime(value: string, locale: string = i18n.global.locale.value): string {
  const date = value.includes('T') ? parseCalendarDate(value) : null;
  return date
    ? new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }).format(date)
    : '-';
}
