import { SendNotificationType } from "@/schema";
import { sendNotificationToDevice } from "@/utils/helper-util";
import { FastifyReply, FastifyRequest } from "fastify";

let tokens: string[] = [];

export const registerToken = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { token } = request.body as { token: string };
    if (token && !tokens.includes(token)) {
      tokens.push(token);
    }
    reply.send({ message: "Token stored" });
  } catch (error: any) {
    reply.status(500).send({ error: error.message || "Something went wrong" });
  }
};

export const sendNotification = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { title, body, data } = request.body as SendNotificationType;
  const responses = await Promise.allSettled(
    tokens.map((token) => sendNotificationToDevice(token, title, body, data))
  );
  const success = responses.filter((r) => r.status === "fulfilled").length;
  const failed = responses.length - success;

  reply.send({
    status: "Notifications sent",
    success,
    failed,
  });
};
