import { Request, Response } from "express";
import { RefreshTokenDTO, User } from "../models/user.model";
import ErrorResponse from "../models/ErrorResponse";
import UserDao from "../daos/user.dao";
import HttpStatus from "../helpers/http_status";
import Authenticator from "../helpers/auth";
import Utility from "../helpers/utility";
import {
  RefreshTokenValidationSchema,
  UserValidationSchema,
} from "../validation_schemas/user.validation";
import REDIS from "../helpers/init_redis";
import { REFRESH_TOKEN_EXPIRY_TIME_IN_SECONDS } from "../helpers/constants";

const UserController = {
  registerUser: async (req: Request, res: Response) => {
    try {
      const requestBody: User = await Utility.validateRequest(
        req.body,
        UserValidationSchema
      );
      const userexists = await UserDao.findByEmail(requestBody.email);
      if (userexists) {
        throw new ErrorResponse(
          HttpStatus.BAD_REQUEST,
          "User already registered"
        );
      }
      await UserDao.save(requestBody);
      res.sendStatus(HttpStatus.OK);
    } catch (error) {
      Utility.handleRouterError(error, res);
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const requestBody: User = await Utility.validateRequest(
        req.body,
        UserValidationSchema
      );
      const user = await UserDao.findByEmail(requestBody.email);
      if (!user) {
        throw new ErrorResponse(HttpStatus.NOT_FOUND, "User not registered");
      }
      const isPasswordCorrect = await UserDao.isPasswordCorrect(
        requestBody.email,
        requestBody.password
      );
      if (!isPasswordCorrect) {
        throw new ErrorResponse(HttpStatus.UNAUTHORIZED, "Invalid Password");
      }
      const body = {
        accessToken: await Authenticator.signAccessToken(user.userID),
        refreshToken: await Authenticator.signRefreshToken(user.userID),
      };
      REDIS.set(user.userID, body.refreshToken || "", {
        expiryInSeconds: REFRESH_TOKEN_EXPIRY_TIME_IN_SECONDS,
      });
      res.status(HttpStatus.OK).send(body);
    } catch (error) {
      Utility.handleRouterError(error, res);
    }
  },
  refreshToken: async (req: Request, res: Response) => {
    try {
      const requestBody: RefreshTokenDTO = await Utility.validateRequest(
        req.body,
        RefreshTokenValidationSchema
      );
      const userID = await Authenticator.verifyRefreshToken(
        requestBody.refreshToken
      );
      const body = {
        accessToken: await Authenticator.signAccessToken(userID),
        refreshToken: await Authenticator.signRefreshToken(userID),
      };
      REDIS.set(userID, body.refreshToken || "", {
        expiryInSeconds: REFRESH_TOKEN_EXPIRY_TIME_IN_SECONDS,
      });
      res.status(HttpStatus.OK).send(body);
    } catch (error) {
      Utility.handleRouterError(error, res);
    }
  },
  logout: async (req: Request, res: Response) => {
    try {
      const requestBody: RefreshTokenDTO = await Utility.validateRequest(
        req.body,
        RefreshTokenValidationSchema
      );
      const userID = await Authenticator.verifyRefreshToken(
        requestBody.refreshToken
      );
      REDIS.delete(userID);
      res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (error) {
      Utility.handleRouterError(error, res);
    }
  },
};
export default UserController;
