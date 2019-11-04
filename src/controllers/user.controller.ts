import { RestController } from "../interfaces/rest-controller.interface";
import { Router, Response, Request } from "express";
import { authenticate } from "../middleware/authenticate";
import {
  UserMongo,
  IUserDocument,
  UserJsonWebToken,
  IUser
} from "../models/user.model";
import { invited } from "../middleware/invite";
import { hashSync } from "bcryptjs";

export class UserController implements RestController {
  path: string = "/users";
  initializeRoutes(): Router {
    const router = Router();

    router.get("/current", authenticate, this.getCurrent);
    router.post('/', invited, this.createUser)
    return router;
  }

  createUser(req: Request, res: Response) {
    if(!<IUser>req.body){
      res.status(400).send();
    }

    const newUser = <IUser>req.body;

    const doc: IUserDocument = req.body;
    doc.password = hashSync(newUser.password, 10);
    UserMongo.create(doc)
    .catch((reason) => res.status(500).send())
    .then((user) => res.status(201).header('location', (<IUserDocument>user)._id).send()); 
  }

  async getCurrent(req: Request, res: Response) {
    const user = await UserMongo.findById(
      (<UserJsonWebToken>res.locals.jwtPayload).id
    ).select("-password");
    res.send(<IUser>user);
  }
}
