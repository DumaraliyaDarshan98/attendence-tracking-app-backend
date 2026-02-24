export class DateUtil {
  /**
   * Get current date and time in Indian Standard Time (IST)
   * IST is UTC+5:30
   */
  static getCurrentDateIST(): Date {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    return new Date(now.getTime() + istOffset);
  }

  /**
   * Get current date (start of day) in IST
   */
  static getCurrentDateISTStartOfDay(): Date {
    // const istDate = this.getCurrentDateIST();
    const  istDate = new Date();
    istDate.setHours(0, 0, 0, 0);
    return istDate;
  }

  /**
   * Get end of current date in IST
   */
  static getCurrentDateISTEndOfDay(): Date {
    // const istDate = this.getCurrentDateIST();
    const istDate = new Date();
    istDate.setHours(23, 59, 59, 999);
    return istDate;
  }

  /**
   * Convert a date string to IST date (start of day)
   * Treats the input date string as IST midnight and converts to UTC for storage
   * Example: "2025-12-17" is treated as "2025-12-17T00:00:00+05:30" (IST)
   * which becomes "2025-12-16T18:30:00Z" (UTC) for storage
   */
  static parseDateToISTStartOfDay(dateString: string): Date {
    if (!dateString) {
      throw new Error('Date string is required');
    }
    
    // If the date string is in YYYY-MM-DD format, treat it as IST midnight
    // Append IST timezone offset to ensure correct parsing
    let dateStr = dateString.trim();
    
    // Check if it already has timezone info
    const hasTimezone = /[Z+-]\d{2}:?\d{2}$/.test(dateStr) || dateStr.endsWith('Z');
    
    if (!hasTimezone) {
      // If it's just a date (YYYY-MM-DD), append IST timezone
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        dateStr = dateStr + 'T00:00:00+05:30';
      } else if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
        // If it has time but no timezone, append IST timezone
        dateStr = dateStr + '+05:30';
      }
    }
    
    const date = new Date(dateStr);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }
    
    // Return the date (it's now in UTC, representing IST midnight)
    return date;
  }

  /**
   * Convert a date string to IST date (end of day).
   * Must be consistent with parseDateToISTStartOfDay: end of IST day = start of that IST day + 24h - 1ms.
   */
  static parseDateToISTEndOfDay(dateString: string): Date {
    const startOfDay = this.parseDateToISTStartOfDay(dateString);
    return new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
  }

  /**
   * Convert a date to IST timezone
   */
  static convertToIST(date: Date): Date {
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + istOffset);
  }

  /**
   * Parse a datetime string and convert it to IST while preserving the time
   * This method treats the input datetime as if it's in IST timezone
   * Handles datetime-local format (YYYY-MM-DDTHH:mm) and ISO strings
   */
  static parseDateTimeToIST(dateTimeString: string): Date {
    if (!dateTimeString) {
      throw new Error('Date time string is required');
    }

    // Check if the string has timezone info (ends with Z or has +/- offset)
    const hasTimezone = /[Z+-]\d{2}:?\d{2}$/.test(dateTimeString) || dateTimeString.endsWith('Z');
    
    if (hasTimezone) {
      // If it has timezone info, parse it normally
      // If it's UTC (Z), the date is already in UTC, return as-is for MongoDB storage
      if (dateTimeString.endsWith('Z')) {
        const date = new Date(dateTimeString);
        // Validate the date
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date string: ${dateTimeString}`);
        }
        // The date is already in UTC, so we return it as-is
        // MongoDB will store it correctly
        return date;
      } else {
        // Has timezone offset, parse normally
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date string: ${dateTimeString}`);
        }
        return date;
      }
    } else {
      // If no timezone info (datetime-local format), treat as IST
      // Append IST timezone offset (+05:30) to the string
      // This ensures JavaScript parses it correctly as IST time
      // Example: "2024-01-15T14:30" becomes "2024-01-15T14:30+05:30"
      const istDateTimeString = dateTimeString + '+05:30';
      const date = new Date(istDateTimeString);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string: ${dateTimeString}`);
      }
      
      return date;
    }
  }

  /**
   * Get start of year in IST
   */
  static getStartOfYearIST(year: number): Date {
    const startOfYear = new Date(year, 0, 1);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(startOfYear.getTime() + istOffset);
    istDate.setHours(0, 0, 0, 0);
    return istDate;
  }

  /**
   * Get end of year in IST
   */
  static getEndOfYearIST(year: number): Date {
    const endOfYear = new Date(year, 11, 31);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(endOfYear.getTime() + istOffset);
    istDate.setHours(23, 59, 59, 999);
    return istDate;
  }

  /**
   * Format date to ISO string in IST
   */
  static toISOStringIST(date: Date): string {
    const istDate = this.convertToIST(date);
    return istDate.toISOString();
  }

  /**
   * Format a date to YYYY-MM-DD string in IST timezone
   * This converts a UTC date (stored in DB) to IST date string for display
   * Example: UTC date 2025-12-16T18:30:00Z (which is IST midnight of 2025-12-17) 
   * should return "2025-12-17"
   */
  static formatDateToISTString(date: Date): string {
    if (!date) {
      return '';
    }
    
    // The date stored in DB is UTC
    // To get the IST date, we add the IST offset to get the IST time
    // Then we format it as YYYY-MM-DD
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = date.getTime() + istOffset;
    
    // Create a date object representing the IST time
    // Use UTC methods to extract the date components
    const tempDate = new Date(istTime);
    const year = tempDate.getUTCFullYear();
    const month = String(tempDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(tempDate.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Get current year in IST
   */
  static getCurrentYearIST(): number {
    return this.getCurrentDateIST().getFullYear();
  }

  /**
   * Check if a date is today in IST
   */
  static isTodayIST(date: Date): boolean {
    const today = this.getCurrentDateISTStartOfDay();
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return today.getTime() === checkDate.getTime();
  }

  /**
   * Get working days between two dates (excluding weekends) in IST
   */
  static getWorkingDaysIST(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  }
}
