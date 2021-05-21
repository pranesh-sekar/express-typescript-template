import express, { Request, Response } from "express";
import HttpStatus from "../helpers/http_status";
import Authenticator from "../helpers/auth";

const router = express();

// Sample Route which verifies user token
router.get(
  "/",
  Authenticator.verifyAccessToken,
  (req: Request, res: Response) => {
    res.sendStatus(HttpStatus.OK);
  }
);

export default router;
