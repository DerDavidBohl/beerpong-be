import { RestController } from "../interfaces/rest-controller.interface";
import { Router } from "express";
import {Request, Response} from "express";
import AthleteMongo, { IAthlete, Athlete, AthleteWithId } from "../models/athlete.model";

export class AthleteController implements RestController {
    path: string = '/athletes';    
    
    initializeRoutes(): Router {
        const router = Router();

        router.get('/', (req, res) => this.getAllAthletes(req, res));
        router.post('/', (req, res) => this.createAthlete(req, res));

        router.get('/:athleteId',(req, res) => this.getAthleteById(req, res))
        router.put('/:athleteId',(req, res) => this.updateAthleteById(req, res))
        router.delete('/:athleteId',(req, res) => this.deleteAthleteById(req, res))

        return router;
    }

    getAllAthletes(req: Request, res: Response) {

        let conditions = null;
        if(req.param('name')) {
            conditions = { name: { $regex: req.param('name'), $options: 'i' } } ;
        }

        AthleteMongo.find(conditions, (_err, athletes: IAthlete[]) => {
            res.status(200).send(AthleteWithId.getMultiple(athletes));
        })
    }

    createAthlete(req: Request, res: Response) {
        AthleteMongo.create(req.body, (_dberr: any, dbres: IAthlete) => {
            res.status(201).header('location', req.baseUrl + '/athletes/' + dbres._id).send();
        })
    }

    getAthleteById(req: Request, res: Response) {
        AthleteMongo.findById(req.params.athleteId, (err, athlete) => {

            if(err || athlete === null)  {
                this.sendNotFound(req.params.athleteId, res);
                return;
            }

            res.status(200).send(new Athlete(athlete));
        })
    }

    updateAthleteById(req: Request, res: Response) {
        AthleteMongo.findByIdAndUpdate(req.params.athleteId, req.body, (err, _athlete) => {
            if(err) {
                this.sendNotFound(req.params.athleteId, res);
                return;
            }

            res.status(204).send();
        });
    }

    deleteAthleteById(req: Request, res: Response) {
        AthleteMongo.findByIdAndDelete(req.params.athleteId, (err) => {
            if(err) {
                this.sendNotFound(req.params.athleteId, res);
                return;
            }

            res.status(204).send();
        })
    }


    sendNotFound(id: string, res: Response) {
        res.status(404).send('Could not found a Athlete with ID "' + id + '".')
    }    
}