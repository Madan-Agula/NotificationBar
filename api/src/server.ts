import dotenv from "dotenv";
import fastify, { FastifyInstance } from "fastify";
import { connectServer } from "./config/connect-server";

dotenv.config();

const app: FastifyInstance = fastify({ logger: true });

const PORT: number = Number(process.env.PORT);
const DB: string = process.env.MONGO_URI as string;
const SCRETE: string = process.env.JWT_SECRET as string;

connectServer(app, PORT, SCRETE);
