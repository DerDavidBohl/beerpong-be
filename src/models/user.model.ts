import mongoose, { Document } from "mongoose";
import jwt = require("jsonwebtoken");
import config = require("config");

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
  },
  emailVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  passwordResetToken: String,
  passwordResetTokenRequestDate: Date
});

//custom method to generate authToken
UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { email: this.email, name: this.name },
    config.get("beerpong-sign-key")
  ); //get the private key from the config file -> environment variable
  return token;
};

export interface UserJsonWebToken {
  id: string,
  email: string,
  name: string
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  passwordResetToken: String;
  passwordResetTokenCreationDate: Date
}

export interface IUserDocument extends Document, IUser {}

export const UserMongo = mongoose.model<IUserDocument>("User", UserSchema);

