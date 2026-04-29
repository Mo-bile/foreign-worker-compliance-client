import type { NotificationLog, TriggerResponse } from "@/types/notification";

export const mockNotificationLogs: readonly NotificationLog[] = [
  {
    id: 1,
    sentAt: "2026-04-25T14:30:00",
    templateType: "D7",
    deadlineCount: 3,
    recipientEmail: "owner1@demo.test",
  },
  {
    id: 2,
    sentAt: "2026-04-20T09:00:00",
    templateType: "D30",
    deadlineCount: 5,
    recipientEmail: "owner1@demo.test",
  },
  {
    id: 3,
    sentAt: "2026-04-15T11:15:00",
    templateType: "OVERDUE",
    deadlineCount: 2,
    recipientEmail: "owner1@demo.test",
  },
];

export const mockTriggerResponse: TriggerResponse = {
  triggered: 3,
  skipped: 0,
  failedRecipients: [],
};
