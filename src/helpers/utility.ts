import Joi from "joi";
import ErrorResponse from "../models/ErrorResponse";
import HttpStatus from "./http_status";
import { Response } from "express";
import Logger from "./logger";
import { v4 as uuidv4 } from "uuid";

class Utility {
  static handleRouterError(error: any, response: Response) {
    if (error instanceof ErrorResponse) {
      response.status(error.status).send(error);
      return;
    }
    Logger.log("Internal Server Error", error);
    response
      .status(ErrorResponse.InternalServerError.status)
      .send(ErrorResponse.InternalServerError);
  }

  static async validateRequest(requestBody: any, validationSchema: Joi.Schema) {
    try {
      return await validationSchema.validateAsync(requestBody);
    } catch (error) {
      throw new ErrorResponse(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "Validation Error",
        error.details.map((item: Joi.ValidationErrorItem) => item.message)
      );
    }
  }

  static generateUniqueID(): string {
    return uuidv4();
  }
}

export default Utility;
