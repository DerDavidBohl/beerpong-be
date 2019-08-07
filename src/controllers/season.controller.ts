import { RestController } from "../interfaces/rest-controller.interface";
import { Router, Request, Response } from "express";
import SeasonMongo, { SeasonWithId, ISeason, SeasonSimple } from "../models/season.model";


export class SeasonController implements RestController {
    path: string = '/seasons';

    initializeRoutes(): Router {
        const router = Router();

        router.get('/', (req, res) => this.getAllSeasons(req, res));
        router.post('/', (req, res) => this.createNewSeason(req, res));
        router.get('/:seasonId', (req, res) => this.getSpecificSeason(req, res));
        router.put('/:seasonId', (req, res) => this.editSpecificSeason(req, res));
        router.delete('/:seasonId', (req, res) => this.deleteSpecificSeason(req, res));

        return router;
    }

    deleteSpecificSeason(req: Request, res: Response): any {
        SeasonMongo.findByIdAndDelete(req.params.seasonId, (err, deletedSeason) => {
            res.status(204).send();
        });
    }

    editSpecificSeason(req: Request, res: Response): any {
        SeasonMongo.findByIdAndUpdate(req.params.seasonId, req.body, (err, updatedSeason) => {

            if(err) {
                res.status(404).send(this.generateNotFoundMsg(req.params.seasonId));
                return;
            }

            res.status(204).send();
        })
    }

    generateNotFoundMsg(id: any) : string {
        return `Eine Season mit der ID "${id}" konnte nicht gefunden werden.`;
    }


    getSpecificSeason(req: Request, res: Response): any {
        SeasonMongo.findById(req.params.seasonId, (err, season) => {

            if(err || !season) {
                res.status(404).send(this.generateNotFoundMsg(req.params.seasonId));
                return;
            }
            res.send(new SeasonSimple(season));
        });
    }  //TESAT

    createNewSeason(req: Request, res: Response) {
        SeasonMongo.create(req.body, (err: any, season: ISeason) => {
            
            if(err) {
                res
                .status(400)
                .send(`Something is wrong with your Request.`)
                return;
            }

            res.status(201).header('location', season._id).send();
        });
    }

    getAllSeasons(req: Request, res: Response) {
        let conditions = null;
        if(req.param('name')) {
            conditions = { name: { $regex: req.param('name'), $options: 'i' } } ;
        }

        SeasonMongo.find(conditions, (err, seasons) => {
            res.send(SeasonWithId.createMultiple(seasons));
        })
    }


}