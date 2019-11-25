import { Request, Response, NextFunction } from "express";
import { InviteToken, InviteTokenMongo } from "../models/invite-token.model";

export function tokenRequired(req: Request, res: Response, next: NextFunction) {
  InviteTokenMongo.findOne({ token: req.param("token") }, (err, token) => {
    if (err || !token) {
      res.status(401).send();
      return;
    }
    token.remove();
    // TokenMongo.findOneAndRemove({_id: token._id});

    next();
  });
}
