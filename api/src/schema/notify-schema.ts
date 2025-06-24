import { Type, Static } from "@sinclair/typebox";

export const SendNotificationSchema = Type.Object({
  title: Type.String(),
  body: Type.String(),
  data: Type.Optional(Type.Record(Type.String(), Type.Any())),
});

export type SendNotificationType = Static<typeof SendNotificationSchema>;
