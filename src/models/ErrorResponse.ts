import HttpStatus from "../helpers/http_status";

class ErrorResponse {
  status: number;
  message: string;
  error?: object | any[];

  static InternalServerError: ErrorResponse = new ErrorResponse(
    HttpStatus.INTERNAL_SERVER_ERROR,
    "Internal server error"
  );

  constructor(status: number, message: string, error?: object | any[]) {
    this.status = status;
    this.message = message;
    this.error = error;
  }
}

export default ErrorResponse;
