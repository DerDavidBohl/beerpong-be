import nodemailer from "nodemailer";
import { get } from "config";
import { InviteTokenMongo } from "../models/invite-token.model";
import { mailer } from "./mailer";

export function sendInviteMail(emailToInvite: string) {
console.log(`sending invite to ${emailToInvite}`);

    InviteTokenMongo.create(new InviteTokenMongo()).then((token) => {
        mailer.sendMail({
            to: emailToInvite,
            subject: 'We want you to administrate beerpong games!',
            html: `Registriere dich <a href="${get<string>('beerpong-invite-url').replace('%token%', token.token)}">hier</a>`
        }).then((val) => console.log('Mail sent...' + val))
        .catch((reason) => console.error('Mail failed: ' + reason));
    });
}