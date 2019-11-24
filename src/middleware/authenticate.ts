import {  verify, sign} from "jsonwebtoken";
import { get } from "config";
import {Request, Response, NextFunction} from "express";
import { UserJsonWebToken } from "../models/user.model";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    //get the token from the header if present
    const token = <string>req.headers.authorization;
    let jwtPayload;
    
    //Try to validate the token and get data
    try {
      jwtPayload = <UserJsonWebToken>verify(token, get('beerpong-sign-key'));
      res.locals.jwtPayload = jwtPayload;
    } catch (error) {
      //If token is not valid, respond with 401 (unauthorized)
      res.status(401).send();
      return;
    }
  
    //Call the next middleware or controller
    next();
  };