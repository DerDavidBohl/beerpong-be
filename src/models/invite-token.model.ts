import { model, Schema, Document } from "mongoose";
import { randomBytes } from "crypto";

const InviteTokenSchema = new Schema({
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

export interface InviteToken {
  token: string;
}

export interface InviteTokenDocument extends Document, InviteToken {}

export const TokenMongo = model<InviteTokenDocument>("InviteToken", InviteTokenSchema);
