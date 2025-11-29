import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';

@Injectable()
export class AttendanceSchedulerService {
  private readonly logger = new Logger(AttendanceSchedulerService.name);

  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Scheduled task that runs every day at 12:00 AM IST (midnight)
   * Automatically checks out all users who forgot to check out
   * 
   * Cron expression: '0 0 * * *' runs at midnight
   * timeZone: 'Asia/Kolkata' ensures it runs at midnight IST
   */
  @Cron('0 0 * * *', {
    name: 'auto-checkout-midnight',
    timeZone: 'Asia/Kolkata', // Explicitly set IST timezone
  })
  async handleAutoCheckout() {
    this.logger.log('Starting automatic checkout for open sessions at midnight IST...');
    
    try {
      const result = await this.attendanceService.autoCheckoutOpenSessions();
      this.logger.log(
        `Auto-checkout completed successfully: ${result.checkedOut} sessions checked out, ${result.errors} errors`
      );
    } catch (error) {
      this.logger.error('Error during auto-checkout process:', error);
    }
  }
}

