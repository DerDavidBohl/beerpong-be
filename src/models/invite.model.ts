import { model, Schema, Document } from "mongoose";
import { string } from "joi";

const InviteSchema = new Schema({
    email:
    {
        type: String,
        required: true
    }
})

export interface Invite {
    email: string;
}

export interface InviteDocument extends Document, Invite {

}

export const InviteMongo = model<InviteDocument>('Invite', InviteSchema);