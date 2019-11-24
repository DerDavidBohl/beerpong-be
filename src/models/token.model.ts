import { model, Schema, Document } from "mongoose";
import { randomBytes } from "crypto";

const TokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    default: function() { return randomBytes(48).toString('hex'); }
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
    expires: "1d"
  }
});

export interface Token {
  token: string;
}

export interface TokenDocument extends Document, Token {}

export const TokenMongo = model<TokenDocument>("Token", TokenSchema);
