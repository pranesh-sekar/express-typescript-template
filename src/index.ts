import path from "path";
import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import { LISTENING_PORT } from "./helpers/constants";
import middlewares from "./helpers/middlewares";
import Logger from "./helpers/logger";
import HttpStatus from "./helpers/http_status";

import ErrorResponse from "./models/ErrorResponse";

require("./helpers/init_database");
require("./helpers/init_redis");

import userRouter from "./routers/user.router";
import protectedRouter from "./routers/protected.router";

// configuring environments
const config = process.env.config;
switch (config) {
  case "local":
    dotenv.config({ path: path.join(__dirname, "../env/local.env") });
    break;
  case "dev":
    dotenv.config({ path: path.join(__dirname, "../env/dev.env") });
    break;
  case "staging":
    dotenv.config({ path: path.join(__dirname, "../env/staging.env") });
    break;
  case "production":
    dotenv.config({ path: path.join(__dirname, "../env/production.env") });
    break;
  default:
    dotenv.config();
}

const PORT = LISTENING_PORT;
const app: Express = express();

// running middlewares
for (const middleware of middlewares) {
  app.use(middleware());
}

// Index routing for status check
app.get("/", (req: Request, res: Response) => {
  res.sendStatus(HttpStatus.OK);
});

// Forwarding request to other routers
app.use("/user", userRouter);
app.use("/protected", protectedRouter);

// Route not found
app.use((req: Request, res: Response, next: NextFunction) => {
  const errorResponse = new ErrorResponse(HttpStatus.NOT_FOUND, "Not Found");
  res.status(errorResponse.status).send(errorResponse);
});

// Listening on {PORT} for requests
app.listen(PORT, () => Logger.log(`Running on port ${PORT}`));
