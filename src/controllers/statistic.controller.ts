import { RestController } from "../interfaces/rest-controller.interface";
import { Router } from "express";

export class StatisticController implements RestController{
    path: string = "/statistics";
    initializeRoutes(): Router {
        const router: Router = Router();

        router.get('', (req, res) => res.send('Stats works!'));

        return router;
    }
}