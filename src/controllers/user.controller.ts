import { RestController } from "../interfaces/rest-controller.interface";
import { Router, Response, Request } from "express";
import { authenticate } from "../middleware/authenticate";
import {
  UserMongo,
  IUserDocument,
  UserJsonWebToken,
  IUser
} from "../models/user.model";
import { tokenRequired } from "../middleware/tokenRequired";
import { hashSync } from "bcryptjs";
import { sendInviteMail } from "../utils/invite";
import { verify } from "jsonwebtoken";
import { get } from "config";
import { mailer } from "../utils/mailer";
import { ConfirmTokenDocument, ConfirmTokenMongo, ConfirmToken } from "../models/confirm-token.model";

export class UserController implements RestController {
  path: string = "/users";
  initializeRoutes(): Router {
    const router = Router();

    router.get("/current", this.getCurrent);
    router.post('/invite', authenticate, this.inviteUser);
    router.post('/init', this.init)
    router.post('/', tokenRequired, this.createUser);
    router.post('/confirm', this.confirmCreation)

    return router;
  }

  confirmCreation(req: Request, res: Response) {
    if (!req.query.token) {
      res.status(400).send('No Token provided.');
      return;
    }

    ConfirmTokenMongo.findOne({ token: req.query.token }, (err, token) => {
      if (!token || err) {
        res.status(404).send('Could not find Token');
        return;
      }
      UserMongo.findById(token._userId, (err, user) => {
        if (!user || err) {
          res.status(500).send('Could not find User for this Token.');
          return;
        }

        user.emailVerified = true;
        user.save((err, savedUser) => {

          token.remove(() => {
            res.status(200).send(`User ${savedUser.name} is now confirmed.`);
          });
        });
      })
    });
  }

  init(req: Request, res: Response) {

    UserMongo.find((err, users) => {
      if (users.length == 0) {
        sendInviteMail(get("beerpong-initial-user-email"));
        res.status(201).send();
        return;

      }
      res.status(400).send();
      return;
    });
  }

  inviteUser(req: Request, res: Response) {
    sendInviteMail(req.body.email);
    res.status(200).send();
  }

  createUser(req: Request, res: Response) {
    if (!<IUser>req.body) {
      res.status(400).send();
      return;
    }

    const newUser = <IUser>req.body;
    newUser.email = newUser.email.toLowerCase(); //Email should be saved as lowercase to find it again

    const doc: IUserDocument = <IUserDocument>newUser;
    doc.password = hashSync(newUser.password, 10);
    UserMongo.create(doc, (err: any, createdUser: IUserDocument) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      const tokenDoc: ConfirmToken = {
        _userId: createdUser._id
      }

      ConfirmTokenMongo.create(tokenDoc, (err: any, token: ConfirmTokenDocument) => {
        mailer.sendMail({ to: createdUser.email, text: `You can confirm your registration here: ${get<string>('beerpong-confirm-url').replace('%token%', token.token)}` },
          (err, info) => {
            if (err) {
              res.status(500).send(err);
              return;
            }

            res.status(201).send(`Confirmation Mail sent to: ${createdUser.email}`);
          });
      });
    });
  }

  async getCurrent(req: Request, res: Response) {

    if (!req.headers.authorization) {
      res.status(404).send();
      return;
    }

    const token = req.headers.authorization;

    const user = <IUser>await UserMongo.findById(
      (<UserJsonWebToken>verify(token, get('beerpong-sign-key'))).id
    ).select("-password");
    res.send({ email: user.email, name: user.name });
  }
}
