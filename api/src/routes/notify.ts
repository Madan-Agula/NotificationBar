import { registerToken, sendNotification } from "@/controllers";
import { Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { SendNotificationSchema } from "../schema";

const notifyRoute = (app: FastifyInstance) => {
  app.post(
    "/registerToken",
    {
      schema: {
        body: Type.String(),
        response: {
          200: Type.Object({ message: Type.String() }),
        },
      },
    },
    registerToken
  );

  app.post(
    "/sendNotification",
    {
      schema: {
        body: SendNotificationSchema,
        response: {
          200: Type.Object({ message: Type.String(), token: Type.String() }),
        },
      },
    },
    sendNotification
  );
};

export default notifyRoute;
