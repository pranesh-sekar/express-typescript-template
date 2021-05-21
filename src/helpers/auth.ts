import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import {
  APP_NAME,
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_EXPIRY_TIME_IN_SECONDS,
} from "./constants";
import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../models/ErrorResponse";
import Utility from "./utility";
import HttpStatus from "./http_status";
import REDIS from "./init_redis";

class Authenticator {
  static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  static async isPasswordCorrect(originalpassword: string, password: string) {
    try {
      return await bcrypt.compare(password, originalpassword);
    } catch (error) {
      return false;
    }
  }

  static async signAccessToken(userID: string): Promise<string> {
    return new Promise((resolve, reject) => {
      JWT.sign(
        {},
        ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: "1d", issuer: APP_NAME, audience: userID },
        (error, token) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(token || "");
        }
      );
    });
  }

  static verifyAccessToken(req: Request, res: Response, next: NextFunction) {
    if (!req.headers["authorization"]) {
      Utility.handleRouterError(
        new ErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"),
        res
      );
      return;
    }
    let authHeader = req.headers["authorization"];
    if (Array.isArray(authHeader)) {
      authHeader = authHeader[0];
    }
    const bearerToken = authHeader.split(" ");
    if (bearerToken.length != 2) {
      Utility.handleRouterError(
        new ErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"),
        res
      );
      return;
    }
    const token = bearerToken[1];
    JWT.verify(token, ACCESS_TOKEN_SECRET_KEY, (error, payload: any) => {
      if (error) {
        Utility.handleRouterError(
          new ErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"),
          res
        );
        return;
      }
      res.locals.userID = payload.aud;
      next();
    });
  }

  static async signRefreshToken(userID: string): Promise<string> {
    return new Promise((resolve, reject) => {
      JWT.sign(
        {},
        REFRESH_TOKEN_SECRET_KEY,
        {
          expiresIn: REFRESH_TOKEN_EXPIRY_TIME_IN_SECONDS,
          issuer: APP_NAME,
          audience: userID,
        },
        (error, token) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(token || "");
        }
      );
    });
  }

  static async verifyRefreshToken(refreshToken: string): Promise<string> {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET_KEY,
        async (error, payload: any) => {
          if (error) {
            reject(new ErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"));
            return;
          }
          const refreshTokenInRedis = await REDIS.get(payload.aud);
          if (refreshToken !== refreshTokenInRedis) {
            reject(new ErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized"));
            return;
          }
          resolve(payload.aud);
        }
      );
    });
  }
}

export default Authenticator;
