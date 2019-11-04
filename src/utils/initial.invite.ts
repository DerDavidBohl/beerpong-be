import nodemailer from "nodemailer";
import { get } from "config";
import { InviteMongo, InviteDocument, Invite } from "../models/invite.model";

export function sendInviteMail(emailToInvite: string) {
console.log(`sending invite to ${emailToInvite}`);
const doc: Invite = {
    email: emailToInvite
}

    InviteMongo.create(doc).then((invite) => {

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
            to: invite.email,
            html: `Invite: ${invite._id}`
        }).then((val) => console.log('Mail sent...' + val))
        .catch((reason) => console.error('Mail failed: ' + reason));
    });
}