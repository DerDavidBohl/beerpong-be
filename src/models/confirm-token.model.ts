import mongoose, { Document } from 'mongoose'
import { randomBytes } from 'crypto';

export interface ConfirmToken {
    _userId: mongoose.Schema.Types.ObjectId;
}

export interface ConfirmTokenDocument extends Document, ConfirmToken {
    token: string;
 }

export const ConfirmTokenSchema = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true, default: randomBytes(16).toString('hex') },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

export const ConfirmTokenMongo = mongoose.model<ConfirmTokenDocument>('ConfirmToken', ConfirmTokenSchema);