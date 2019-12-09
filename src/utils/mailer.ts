import nodemailer from 'nodemailer';
import { get } from 'config';

export const mailer = nodemailer.createTransport({
    host: get('beerpong-email-smtp-host'),
    port: get('beerpong-email-smtp-port'),
    secure: false,
    requireTLS: true, // only use if the server really does support TLS
    auth: {
        user: get('beerpong-email'),
        pass: get('beerpong-email-password')
    },

});