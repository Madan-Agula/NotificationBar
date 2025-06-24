import { FastifyInstance } from "fastify";
import promptRoute from "./prompt-route";
import userRoute from "./notify";

const Routes = (app: FastifyInstance) => {
  app.register(userRoute);
  app.register(promptRoute);
};

export default Routes;
