/**
 * Utility functions for parsing, formatting, and checking time overlaps
 * Supports 24-hour ('14:30', '09:00') and 12-hour ('02:30 PM', '9:00 AM') formats.
 */

export class TimeUtil {
  /**
   * Convert time string to minutes from midnight (0 - 1439)
   */
  static parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toUpperCase();

    // Check for 12-hour AM/PM format
    const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = parseInt(ampmMatch[2], 10);
      const meridian = ampmMatch[3];

      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }

    // Check for 24-hour format (e.g. "14:30", "09:00")
    const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match24) {
      const hours = parseInt(match24[1], 10);
      const minutes = parseInt(match24[2], 10);
      return hours * 60 + minutes;
    }

    // Fallback: simple split
    const parts = clean.split(":");
    if (parts.length >= 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }

    return 0;
  }

  /**
   * Format minutes from midnight to HH:mm string
   */
  static formatMinutesTo24h(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }

  /**
   * Checks if two time intervals [startA, endA) and [startB, endB) overlap.
   * Back-to-back classes (e.g. 10:00-11:30 and 11:30-13:00) do NOT overlap.
   */
  static areIntervalsOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
    const aStart = this.parseTimeToMinutes(startA);
    const aEnd = this.parseTimeToMinutes(endA);
    const bStart = this.parseTimeToMinutes(startB);
    const bEnd = this.parseTimeToMinutes(endB);

    return aStart < bEnd && aEnd > bStart;
  }

  static overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
    return this.areIntervalsOverlapping(startA, endA, startB, endB);
  }

  /**
   * Normalize time string into standard HH:mm 24-hour string
   */
  static normalizeTime(timeStr: string): string {
    return this.formatMinutesTo24h(this.parseTimeToMinutes(timeStr));
  }
}
