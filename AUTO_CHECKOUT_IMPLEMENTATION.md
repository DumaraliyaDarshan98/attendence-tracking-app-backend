# Auto-Checkout Implementation

## Overview
This document describes the implementation of two auto-checkout functionalities for the attendance system:

1. **12-Hour Auto-Checkout**: Automatically checks out users who have been checked in for 12 hours or more
2. **Midnight Auto-Checkout**: Automatically checks out all open sessions at 12:00 AM IST (midnight)

## Implementation Details

### 1. 12-Hour Auto-Checkout

**Purpose**: If a user checks in (e.g., at 5 AM IST), they will be automatically checked out after 12 hours (at 5 PM IST).

**How it works**:
- A scheduled task runs every hour
- It finds all open sessions where check-in time was 12+ hours ago
- Each session is checked out exactly 12 hours after check-in
- Total hours are calculated and stored

**Scheduler**: Runs every hour at the start of the hour (cron: `0 * * * *`)
- Timezone: `Asia/Kolkata` (IST)

**Method**: `autoCheckoutAfter12Hours()` in `AttendanceService`

### 2. Midnight Auto-Checkout

**Purpose**: At midnight (12:00 AM IST), all open sessions are automatically checked out, regardless of when they were checked in.

**How it works**:
- A scheduled task runs every day at 12:00 AM IST
- It finds ALL open sessions (regardless of check-in time or date)
- Each session is checked out at midnight IST
- Total hours are calculated from check-in to midnight

**Scheduler**: Runs daily at midnight (cron: `0 0 * * *`)
- Timezone: `Asia/Kolkata` (IST)

**Method**: `autoCheckoutOpenSessions()` in `AttendanceService`

## Files Modified

1. **`src/attendance/attendance.service.ts`**
   - Added `autoCheckoutAfter12Hours()` method
   - Updated `autoCheckoutOpenSessions()` method to handle all open sessions

2. **`src/attendance/attendance-scheduler.service.ts`**
   - Added `handle12HourAutoCheckout()` scheduled task
   - Updated `handleMidnightAutoCheckout()` scheduled task

## Testing

A test script is provided at `test-auto-checkout.js` to verify the functionality:

```bash
node test-auto-checkout.js
```

**Note**: Update the `TEST_EMAIL` and `TEST_PASSWORD` variables in the test script before running.

## Examples

### Example 1: 12-Hour Auto-Checkout
- User checks in at **5:00 AM IST**
- System automatically checks out at **5:00 PM IST** (12 hours later)

### Example 2: Midnight Auto-Checkout
- User checks in at **8:00 PM IST**
- System automatically checks out at **12:00 AM IST** (midnight)

### Example 3: Combined Scenario
- User checks in at **5:00 AM IST**
- At **5:00 PM IST**: 12-hour auto-checkout would trigger (if not already checked out)
- At **12:00 AM IST**: Midnight auto-checkout would trigger (if still open)

## Important Notes

1. **Timezone**: All times are handled in IST (Indian Standard Time, UTC+5:30)
2. **Priority**: If both conditions are met, the 12-hour checkout happens first (if the hourly job runs before midnight)
3. **Safety**: Both methods include validation to prevent negative hours
4. **Logging**: All auto-checkout operations are logged for monitoring

## Monitoring

Check the application logs for:
- `[12-Hour Auto-Checkout]` - Logs from 12-hour auto-checkout
- `[Midnight Auto-Checkout]` - Logs from midnight auto-checkout

Both log the number of sessions checked out and any errors encountered.
