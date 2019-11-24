import mongoose, { Document } from "mongoose";
import jwt = require("jsonwebtoken");
import config = require("config");
import joi from "joi";
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  }
});

//custom method to generate authToken
UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { email: this.email },
    config.get("beerpong-sign-key")
  ); //get the private key from the config file -> environment variable
  return token;
};

export interface UserJsonWebToken {
  id: string,
  email: string
}

export interface IUser {
  name: string;
  email: string;
  password: string;
}

export interface IUserDocument extends Document, IUser {}

export const UserMongo = mongoose.model<IUserDocument>("User", UserSchema);

//function to validate user
export function validateUser(user: any) {
  const schema = {
    name: joi
      .string()
      .min(3)
      .max(50)
      .required(),
    email: joi
      .string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: joi
      .string()
      .min(3)
      .max(255)
      .required()
  };

  return joi.validate(user, schema);
}
