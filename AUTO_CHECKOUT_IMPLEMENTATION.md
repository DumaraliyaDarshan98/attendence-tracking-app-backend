# Automatic Checkout Implementation

## Overview
This document describes the implementation of automatic checkout functionality that runs at midnight IST (12:00 AM) to automatically check out all users who forgot to check out for the day.

## Problem Statement
Previously, if a user forgot to check out, their session would remain open and could affect calculations for the next day. The system now automatically checks out all open sessions at midnight IST (11:59:59 PM IST) before the date changes.

## Implementation Details

### 1. Scheduled Task Service
**File:** `src/attendance/attendance-scheduler.service.ts`

A new service that uses NestJS Schedule module to run a cron job:
- **Schedule:** Runs every day at 12:00 AM IST (midnight)
- **Cron Expression:** `'0 0 * * *'`
- **Time Zone:** `'Asia/Kolkata'` (IST)
- **Function:** Calls `autoCheckoutOpenSessions()` method

### 2. Auto-Checkout Method
**File:** `src/attendance/attendance.service.ts`

The `autoCheckoutOpenSessions()` method:
- Finds all open sessions (checked in but not checked out) from the previous day
- Sets checkout time to 11:59:59 PM IST of the previous day
- Calculates total hours worked
- Marks sessions as checked out
- Returns statistics (number of sessions checked out, errors)

### 3. Date Handling
- All date calculations are done in IST timezone
- The checkout time is set to 11:59:59 PM IST of the day that just ended
- Dates are properly converted between IST and UTC for MongoDB storage
- The system handles timezone conversions correctly

### 4. Module Updates
**File:** `src/attendance/attendance.module.ts`

- Added `ScheduleModule.forRoot()` to enable scheduled tasks
- Added `AttendanceSchedulerService` as a provider
- The scheduler automatically starts when the application starts

## Installation

The `@nestjs/schedule` package has been added to `package.json`. To install:

```bash
npm install
```

## How It Works

1. **At Midnight IST (12:00 AM):**
   - The scheduled task automatically triggers
   - Finds all sessions where `isCheckedOut: false` from the previous day
   - For each session:
     - Sets `checkOutTime` to 11:59:59 PM IST of the previous day
     - Calculates `totalHours` from check-in to checkout
     - Sets `isCheckedOut: true`
     - Saves the session

2. **Date Calculation:**
   - When the cron runs at midnight IST, it processes the day that just ended
   - Uses IST timezone for all calculations
   - Converts to UTC for MongoDB storage (maintaining consistency)

3. **Error Handling:**
   - Logs errors for individual sessions that fail
   - Continues processing other sessions even if one fails
   - Returns summary of successful checkouts and errors

## Logging

The system logs:
- When auto-checkout starts
- Number of sessions checked out
- Number of errors encountered
- Individual session errors (if any)

Example log output:
```
[AttendanceSchedulerService] Starting automatic checkout for open sessions at midnight IST...
[Auto-Checkout] Completed at 2025-11-29T18:30:00.000Z: 5 sessions checked out, 0 errors
[AttendanceSchedulerService] Auto-checkout completed successfully: 5 sessions checked out, 0 errors
```

## Testing

To test the auto-checkout functionality:

1. **Manual Test:**
   - Create a test session with `isCheckedOut: false`
   - Manually call `attendanceService.autoCheckoutOpenSessions()`
   - Verify the session is checked out

2. **Scheduled Test:**
   - Wait for midnight IST or adjust the cron expression temporarily
   - Verify logs show the auto-checkout running
   - Check that open sessions are automatically checked out

## Configuration

The cron schedule can be modified in `attendance-scheduler.service.ts`:

```typescript
@Cron('0 0 * * *', {
  name: 'auto-checkout-midnight',
  timeZone: 'Asia/Kolkata',
})
```

## Notes

- The system ensures that sessions are checked out at 11:59:59 PM IST, not at the exact moment the cron runs
- This prevents sessions from carrying over to the next day
- All time calculations respect IST timezone
- The checkout location is not set for auto-checkouts (only manual checkouts have location data)

## Future Enhancements

Potential improvements:
- Add notification system to alert users before auto-checkout
- Add configuration for custom checkout times
- Add reporting for auto-checkout statistics
- Add admin dashboard to view auto-checkout history

