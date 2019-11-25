import { RestController } from "../interfaces/rest-controller.interface";
import { Router, Request, Response } from "express";
import { GameMongo, IGame, GameWithId, SpecificGame } from "../models/game.model";
import { authenticate } from "../middleware/authenticate";

export class GameController implements RestController {

    path: string = '/Games';    
    
    initializeRoutes(): Router {
        const router = Router();

        router.use(authenticate);
        router.get('/', (req, res) => this.getAllGames(req, res));
        router.post('/', (req, res) => this.createNewGame(req, res));
        router.get('/:gameId', (req, res) => this.getSpecificGame(req, res));
        router.put('/:gameId', (req, res) => this.editSpecificGame(req, res));
        router.delete('/:gameId', (req, res) => this.deleteSpecificGame(req, res));

        return router;
    }

    deleteSpecificGame(req: Request, res: Response): any {
        GameMongo.findByIdAndDelete(req.params.gameId, (err, deletedGame) => {
            res
            .status(204)
            .send();
        });
    }

    getAllGames(req: Request, res: Response): any {

        // TODO Query Options
        GameMongo.find(null)
        .populate("season")
        .populate('team1')
        .populate('team2')
        .populate('athletesTeam1')
        .populate('athletesTeam2')
        .exec((err, games) => {
            res.send(GameWithId.generateMultiple(games));
        });
    }

    createNewGame(req: Request, res: Response): any {
        GameMongo.create(req.body, (err: any, game: IGame) => {

            if(err) {
                res
                .status(400)
                .send(`Something is wrong with your Request.`)
                return;
            }
            
            res
            .status(201)
            .header("location", game._id)
            .send();
        });
    }

    getSpecificGame(req: Request, res: Response): any {
        GameMongo.findById(req.params.gameId)
        .populate('season')
        .populate('team1')
        .populate('team2')
        .populate('athletesTeam1')
        .populate('athletesTeam2')
        .exec((err, game: IGame) => {
            if(err) {
                res
                .status(404)
                .send(this.generateNotFound(req.params.gameId));
                return;
            }

            res.send(new SpecificGame(game));
        });
    }

    editSpecificGame(req: Request, res: Response): any {
        GameMongo.findByIdAndUpdate(req.params.gameId, req.body, (err, updatedGame) => {
            if(err) {
                res
                .status(404)
                .send(this.generateNotFound(req.params.gameId));
                return;
            }

            res
            .status(204)
            .send();
        });
    }


    generateNotFound(id: string): string {
        return `Could not find a Game with ID "${id}".`
    }

}