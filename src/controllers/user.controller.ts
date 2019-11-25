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

export class UserController implements RestController {
  path: string = "/users";
  initializeRoutes(): Router {
    const router = Router();

    router.get("/current", this.getCurrent);
    router.post('/invite', authenticate, this.inviteUser);
    router.post('/init', this.init)
    router.post('/', tokenRequired, this.createUser);
    
    return router;
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
    if(!<IUser>req.body){
      res.status(400).send();
      return;
    }

    const newUser = <IUser>req.body;
    newUser.email = newUser.email.toLowerCase();
    
    const doc: IUserDocument = <IUserDocument>newUser;
    doc.password = hashSync(newUser.password, 10);
    UserMongo.create(doc)
    .catch((reason) => res.status(500).send(reason))
    .then((user) => res.status(201).header('location', (<IUserDocument>user)._id).send()); 
  }

  async getCurrent(req: Request, res: Response) {

    if(!req.headers.authorization) {
      res.status(400).send();
      return;
    }

    const token = req.headers.authorization;

    const user = <IUser>await UserMongo.findById(
      (<UserJsonWebToken>verify(token, get('beerpong-sign-key'))).id
    ).select("-password");
    res.send({email: user.email, name: user.name});
  }
}
