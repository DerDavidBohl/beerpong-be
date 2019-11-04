import { Request, Response, NextFunction } from "express";
import { InviteMongo } from "../models/invite.model";


export function invited(req: Request, res: Response, next: NextFunction) {
    InviteMongo.findById(req.query.invite, (err, invite) => {
        if(err) {
            res.status(401).send();
            return;
        }

        next();
    });
}