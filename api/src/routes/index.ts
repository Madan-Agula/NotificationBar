import { FastifyInstance } from "fastify";
import notifyRoute from "./notify";

const Routes = (app: FastifyInstance) => {
  app.register(notifyRoute);
};

export default Routes;
