import express from "express";
import helmet from "helmet";
import morgan from "morgan";

const middlewares = [
  () => helmet(),
  () => express.json(),
  () => express.urlencoded({ extended: true }),
  () => morgan("dev"),
];

export default middlewares;
