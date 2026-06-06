import { Router, type IRouter } from "express";
import emailRouter from "./email";
import smtpRouter from "./smtp";
import statsRouter from "./stats";
import developersRouter from "./developers";

const v1Router: IRouter = Router();

v1Router.use("/email", emailRouter);
v1Router.use("/smtp", smtpRouter);
v1Router.use("/stats", statsRouter);
v1Router.use("/developers", developersRouter);

export default v1Router;
