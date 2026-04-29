import { z } from "zod";

export const TEMPLATE_TYPES = ["D30", "D7", "OVERDUE"] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  D30: "D-30",
  D7: "D-7",
  OVERDUE: "기한 초과",
};

export const notificationLogSchema = z.object({
  id: z.number(),
  sentAt: z.string(),
  templateType: z.enum(TEMPLATE_TYPES),
  deadlineCount: z.number(),
  recipientEmail: z.string(),
});

export type NotificationLog = z.infer<typeof notificationLogSchema>;

export const notificationLogsResponseSchema = z.array(notificationLogSchema);

export const triggerResponseSchema = z.object({
  triggered: z.number(),
  skipped: z.number(),
  failedRecipients: z.array(z.string()),
});

export type TriggerResponse = z.infer<typeof triggerResponseSchema>;
