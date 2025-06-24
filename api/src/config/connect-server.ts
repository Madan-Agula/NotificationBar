import Routes from "@/routes";
import cors from "@fastify/cors";
import { FastifyInstance } from "fastify";

export const connectServer = async (app: FastifyInstance, PORT: number) => {
  try {
    app.register(cors, {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    });

    app.register(Routes);

    await app.listen({ port: PORT, host: "0.0.0.0" });
    `🚀 Server listening at http://localhost:${PORT}`;
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};
