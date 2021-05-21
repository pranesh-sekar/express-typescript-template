import redis from "redis";
import ErrorResponse from "../models/ErrorResponse";
import { REDIS_HOST, REDIS_PORT } from "./constants";
import Logger from "./logger";

class Redis {
  private client: redis.RedisClient;

  constructor() {
    this.client = redis.createClient({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });
    this.client.on("connect", function (error) {
      console.error("Redis Connected");
    });
    this.client.on("ready", function () {
      console.error("Redis ready");
    });
    this.client.on("error", function (error) {
      console.error("Redis Error", error);
    });
    process.on("SIGINT", async () => {
      Logger.log("Closing Redis connections");
      this.client.quit();
    });
  }

  async get(key: string) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, reply) => {
        if (error) {
          reject(ErrorResponse.InternalServerError);
          return;
        }
        resolve(reply);
      });
    });
  }

  async set(
    key: string,
    value: string,
    options: { expiryInSeconds?: number } = {}
  ) {
    return new Promise((resolve, reject) => {
      const cb = (error: any, reply: any) => {
        if (error) {
          reject(ErrorResponse.InternalServerError);
          return;
        }
        resolve(reply);
      };
      if (options.expiryInSeconds) {
        this.client.set(key, value, "EX", options.expiryInSeconds, cb);
        return;
      }
      this.client.set(key, value, cb);
    });
  }

  async delete(key: string) {
    return new Promise((resolve, reject) => {
      const cb = (error: any, reply: any) => {
        if (error) {
          reject(ErrorResponse.InternalServerError);
          return;
        }
        resolve(null);
      };
      this.client.del(key, cb);
    });
  }
}

const REDIS = new Redis();

export default REDIS;
