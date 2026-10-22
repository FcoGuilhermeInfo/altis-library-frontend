export function toISODate(
    value: string,
    locale: string,
): string | null {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
    
    if (!match) {
        return null
    }

    const first = Number(match[1])
    const second = Number(match[2])
    const year = Number(match[3])

    const isEnglish = locale === 'en-US'

    const day = isEnglish ? second : first
    const month = isEnglish ? first : second
    
    const date = new Date(year, month - 1, day)

    const isValid = 
        year >= 1900 &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day &&
        date <= new Date()

    if (!isValid) {
        return null
    }

    const formattedYear = String(year).padStart(4, '0')
    const formattedMonth = String(month).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    
    return `${formattedYear}-${formattedMonth}-${formattedDay}`
}

export function formatISODate(
    isoDate: string,
    locale: string,
): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
    
    if (!match) {
        return ''
    }

    const [, year, month, day] = match

    if (locale === 'en-US') {
        return `${month}/${day}/${year}`
    }

    return `${day}/${month}/${year}`
}


export function formatDateTime(value: string): string {
  if (!value) return '-'

  const [datePart, timePart] = value.split('T')

  if (!datePart || !timePart) return '-'

  const [year, month, day] = datePart.split('-')
  const time = timePart.slice(0, 5)

  if (!year || !month || !day) return '-'

  return `${day}/${month}/${year} às ${time}`
}
