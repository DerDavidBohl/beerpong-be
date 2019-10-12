import { RestController } from "../interfaces/rest-controller.interface";
import express = require("express");
import YAML = require("yamljs");
import swaggerUI from 'swagger-ui-express';
import bodyParser = require("body-parser");
import {Request, Response} from "express";
import cors = require("cors");

export class RestApp {

    private app: express.Application = express();

    constructor(private port: number, private controllers: RestController[], apiRoute: string = '/api/v1', defaultRoute: string = '') {
          
        this.app.use((err: Error, req: Request, res: Response, next: any) => {
            console.error(err.stack);
            res.status(500).send('Something went wrong!!');
        });
        this.app.use(bodyParser());
        this.app.use(cors({
            exposedHeaders: ['location']
        }));

        controllers.forEach(controller => {

            if(!controller.path) {
                throw new Error('The Controller does not have a path.')
            }
            this.app.use(apiRoute + controller.path, controller.initializeRoutes());
        });

        this.app.use((req, res) => res.redirect(defaultRoute));
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`App started (Port: ${this.port})`)
        })
    }
      
}