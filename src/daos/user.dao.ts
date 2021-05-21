import mongoose from "mongoose";
import { User } from "../models/user.model";
import Authenticator from "../helpers/auth";
import Logger from "../helpers/logger";
import Utility from "../helpers/utility";
import ErrorResponse from "../models/ErrorResponse";

const UserSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    default: Utility.generateUniqueID(),
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const UserModel = mongoose.model("user", UserSchema);

class UserDao {
  private mapEntityToObject(document: mongoose.Document<any, {}>): User {
    return document.toObject({ virtuals: false }) as User;
  }

  private mapObjectToEntity(user: User): mongoose.Document<any, {}> {
    return new UserModel(user);
  }

  async findByUserID(userID: string) {
    const userDocument = await UserModel.findOne({ userID }).exec();
    if (!userDocument) {
      return null;
    }
    return this.mapEntityToObject(userDocument);
  }

  async findByEmail(email: string) {
    const userDocument = await UserModel.findOne({ email }).exec();
    if (!userDocument) {
      return null;
    }
    return this.mapEntityToObject(userDocument);
  }

  async save(user: User) {
    user.password = await Authenticator.hashPassword(user.password);
    const newUser = this.mapObjectToEntity(user);
    return newUser.save();
  }

  async isPasswordCorrect(email: string, password: string) {
    const userDocument = await UserModel.findOne({ email }).exec();
    if (!userDocument) {
      return false;
    }
    const user = this.mapEntityToObject(userDocument);
    return await Authenticator.isPasswordCorrect(user.password, password);
  }
}
export default new UserDao();
