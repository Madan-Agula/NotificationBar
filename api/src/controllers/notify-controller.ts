import { SendNotificationType } from "@/schema";
import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

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
    reply.send({ status: "Token stored" });
  } catch (error: any) {
    reply.status(500).send({ error: error.message || "Something went wrong" });
  }
};

export const sendNotification = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  const { title, body, data } = request.body as SendNotificationType;

  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
  }));

  try {
    const response = await axios.post(EXPO_PUSH_URL, messages, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    reply.send({ status: "Notification sent", response: response.data });
  } catch (error: any) {
    reply.status(500).send({ error: error.message || "Something went wrong" });
  }
};
