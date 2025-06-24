import dotenv from "dotenv";
import fastify, { FastifyInstance } from "fastify";
import { connectServer } from "./config/connect-server";

dotenv.config();

const app: FastifyInstance = fastify({ logger: true });

const PORT: number = Number(process.env.PORT);

connectServer(app, PORT);
