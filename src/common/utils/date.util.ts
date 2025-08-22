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
    const istDate = this.getCurrentDateIST();
    istDate.setHours(0, 0, 0, 0);
    return istDate;
  }

  /**
   * Get end of current date in IST
   */
  static getCurrentDateISTEndOfDay(): Date {
    const istDate = this.getCurrentDateIST();
    istDate.setHours(23, 59, 59, 999);
    return istDate;
  }

  /**
   * Convert a date string to IST date (start of day)
   */
  static parseDateToISTStartOfDay(dateString: string): Date {
    const date = new Date(dateString);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    istDate.setHours(0, 0, 0, 0);
    return istDate;
  }

  /**
   * Convert a date string to IST date (end of day)
   */
  static parseDateToISTEndOfDay(dateString: string): Date {
    const date = new Date(dateString);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    istDate.setHours(23, 59, 59, 999);
    return istDate;
  }

  /**
   * Convert a date to IST timezone
   */
  static convertToIST(date: Date): Date {
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + istOffset);
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
