import { RestController } from "../interfaces/rest-controller.interface";
import { Router, Request, Response } from "express";
import { UserMongo, IUserDocument, UserJsonWebToken } from "../models/user.model";
import { Login } from "../models/login.model";
import { compareSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { get } from "config";

export class LoginController implements RestController {
  path: string = "/login";

  initializeRoutes(): Router {
    const router = Router();

    router.post("/", this.login);

    return router;
  }

  login(req: Request, res: Response) {
    if (!(<Login>req.body)) {
      res.status(401).send('Wrong Login Information');
      return;
    }

    const login: Login = req.body;

    UserMongo.findOne({ email: login.email }, (err, user) => {
      if (err || !user) {
        res.status(401).send('User Not Found');
        return;
      }

      if (!compareSync(login.password, user.password)) {
        res.status(401).send('Wrong Password');
        return;
      }

      res.header("authorization", LoginController.getJwt(user)).send({token: LoginController.getJwt(user)});
    });
  }

  static getJwt(user: IUserDocument) {
    const token = sign(
      <UserJsonWebToken>{
        id: user._id,
        email: user.email
      },
      get("beerpong-sign-key")
      , {
        expiresIn: '1 day'
      }
    );
    return token;
  }
}
