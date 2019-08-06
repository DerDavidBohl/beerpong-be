import { RestController } from "../interfaces/rest-controller.interface";
import { Router, Request, Response } from "express";
import { GameMongo, IGame, AllGamesGame, SpecificGame } from "../models/game.model";
import AthleteMongo, { IAthlete, AthleteWithId } from "../models/athlete.model";

export class GameController implements RestController {

    path: string = '/Games';    
    
    initializeRoutes(): Router {
        const router = Router();

        router.get('/', (req, res) => this.getAllGames(req, res));
        router.post('/', (req, res) => this.createNewGame(req, res));
        router.get('/:gameId', (req, res) => this.getSpecificGame(req, res));
        router.put('/:gameId', (req, res) => this.editSpecificGame(req, res));
        router.delete('/:gameId', (req, res) => this.deleteSpecificGame(req, res));
        router.get('/:gameId/athletesTeam1', (req, res) => this.getAthletesForSpecificGame(req, res, 1));
        router.get('/:gameId/athletesTeam2', (req, res) => this.getAthletesForSpecificGame(req, res, 2));
        router.post('/:gameId/athletesTeam1', (req, res) => this.addAthletesToSpecificGame(req, res, 1));
        router.post('/:gameId/athletesTeam2', (req, res) => this.addAthletesToSpecificGame(req, res, 2));
        router.delete('/:gameId/athletesTeam1/:athleteId', (req, res) => this.deleteAthletesToSpecificGame(req, res, 1));
        router.delete('/:gameId/athletesTeam2/:athleteId', (req, res) => this.deleteAthletesToSpecificGame(req, res, 2));

        return router;
    }
    deleteAthletesToSpecificGame(req: Request, res: Response, team: number): any {
        GameMongo.findById(req.params.gameId, (err, game: IGame) => {
            if(err) {
                res
                .status(404)
                .send(this.generateNotFound(req.params.gameId));
                return;
            }

            switch(team) {
                case 1:
                    game.athletesTeam1 = game.athletesTeam1.filter((element, index, self) => {
                        return element._id != req.params.athleteId;
                    });
                case 2:
                    game.athletesTeam2 = game.athletesTeam2.filter((element, index, self) => {
                        return element._id != req.params.athleteId;
                    });
            }

            game.save();

            res
            .status(204)
            .send();
        });
    }

    addAthletesToSpecificGame(req: Request, res: Response, team: number): any {
        AthleteMongo.findById(req.body.id, (err, athlete: IAthlete) => {
            if(err) {
                res
                .status(400)
                .send(`Could not find a Athlete with ID "${req.body.id}".`);
                return;
            }

            const populate = 'athletesTeam' + team;
            GameMongo.findById(req.params.gameId)
            .populate(populate)
            .exec((err, game: IGame) => {
                if(err) {
                    res
                    .status(404)
                    .send(this.generateNotFound(req.params.gameId));
                }

                switch(team) {
                    case 1:
                        if(!game.athletesTeam1.find((element, index, self) => {
                            return element._id === athlete._id;
                        })) {
                            game.athletesTeam1.push(athlete);
                            game.save();
                            break
                        }
                    case 2:
                        if(!game.athletesTeam2.find((element, index, self) => {
                            return element._id === athlete._id;
                        })) {
                            game.athletesTeam2.push(athlete);
                            game.save();
                            break
                        }
                }

                res
                .status(204)
                .send();
            });
        });
    }

    getAthletesForSpecificGame(req: Request, res: Response, team: number): any {

        const populate = 'athletesTeam' + team;

        GameMongo.findById(req.params.gameId)
        .populate(populate)
        .exec((err, game: IGame) => {
            switch(team) {
                case 1:
                    res.send(AthleteWithId.getMultiple(game.athletesTeam1));
                    break;
                case 2:
                    res.send(AthleteWithId.getMultiple(game.athletesTeam2));
                    break;
            }
        });
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
        .exec((err, games) => {

            res.send(AllGamesGame.generateMultiple(games));
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