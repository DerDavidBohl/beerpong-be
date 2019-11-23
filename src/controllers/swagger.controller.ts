import { RestController } from "../interfaces/rest-controller.interface";
import { Router } from "express";
import {serve,setup} from "swagger-ui-express"
import YAML from "yamljs";
import { authenticate } from "../middleware/authenticate";

export class SwaggerController implements RestController {
    path: string = '/swagger';
    
    initializeRoutes(): Router { 
        const router = Router();
        
        router.use( serve, setup(YAML.load("swagger.yml"),))

        return router;
    }


}