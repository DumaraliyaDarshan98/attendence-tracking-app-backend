import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';

@Injectable()
export class AttendanceSchedulerService {
  private readonly logger = new Logger(AttendanceSchedulerService.name);

  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Scheduled task that runs every day at 12:00 AM IST (midnight)
   * Automatically checks out ALL open sessions regardless of check-in time
   * This ensures that any user who checked in but didn't check out gets auto-checked out at midnight
   * 
   * Cron expression: '0 0 * * *' runs at midnight
   * timeZone: 'Asia/Kolkata' ensures it runs at midnight IST
   */
  @Cron('0 0 * * *', {
    name: 'auto-checkout-midnight',
    timeZone: 'Asia/Kolkata', // Explicitly set IST timezone
  })
  async handleMidnightAutoCheckout() {
    this.logger.log('Starting automatic checkout for all open sessions at midnight IST...');
    
    try {
      const result = await this.attendanceService.autoCheckoutOpenSessions();
      this.logger.log(
        `Midnight auto-checkout completed: ${result.checkedOut} sessions checked out, ${result.errors} errors`
      );
    } catch (error) {
      this.logger.error('Error during midnight auto-checkout process:', error);
    }
  }

  /**
   * Scheduled task that runs every hour
   * Automatically checks out sessions that have been open for 12 hours or more
   * This ensures that if a user checks in at 5 AM, they get auto-checked out at 5 PM (12 hours later)
   * 
   * Cron expression: '0 * * * *' runs at the start of every hour
   * timeZone: 'Asia/Kolkata' ensures it runs in IST timezone
   */
  @Cron('0 * * * *', {
    name: 'auto-checkout-12hours',
    timeZone: 'Asia/Kolkata', // Explicitly set IST timezone
  })
  async handle12HourAutoCheckout() {
    this.logger.debug('Starting 12-hour auto-checkout check...');
    
    try {
      const result = await this.attendanceService.autoCheckoutAfter12Hours();
      if (result.checkedOut > 0) {
        this.logger.log(
          `12-hour auto-checkout completed: ${result.checkedOut} sessions checked out, ${result.errors} errors`
        );
      }
    } catch (error) {
      this.logger.error('Error during 12-hour auto-checkout process:', error);
    }
  }
}

