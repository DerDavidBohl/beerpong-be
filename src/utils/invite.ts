import nodemailer from "nodemailer";
import { get } from "config";
import { InviteTokenMongo } from "../models/invite-token.model";

export function sendInviteMail(emailToInvite: string) {
console.log(`sending invite to ${emailToInvite}`);

    InviteTokenMongo.create(new InviteTokenMongo()).then((token) => {

        const transport = nodemailer.createTransport({
            host: get('beerpong-email-smtp-host'),
            port: get('beerpong-email-smtp-port'),
            secure: false,
            requireTLS: true, // only use if the server really does support TLS
            auth: {
                user: get('beerpong-email'),
                pass: get('beerpong-email-password')
            },
            
        });
    
        transport.sendMail({
            to: emailToInvite,
            subject: 'We want you to administrate beerpong games!',
            html: `Registriere dich <a href="${get<string>('beerpong-invite-url').replace('%token%', token.token)}">hier</a>`
        }).then((val) => console.log('Mail sent...' + val))
        .catch((reason) => console.error('Mail failed: ' + reason));
    });
}