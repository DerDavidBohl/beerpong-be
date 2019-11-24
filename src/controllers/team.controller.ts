import { RestController } from "../interfaces/rest-controller.interface";
import { Router, Request, Response } from "express";
import {
  ITeam,
  TeamWithMembers,
  TeamWithId,
  TeamMongo
} from "../models/team.model";
import AthleteMongo, { Athlete } from "../models/athlete.model";
import { model } from "mongoose";
import bodyParser = require("body-parser");
import { authenticate } from "../middleware/authenticate";

export class TeamController implements RestController {
  path: string = "/teams";

  initializeRoutes(): Router {
    const router: Router = Router();
    router.use(authenticate);

    router.get("/", (req, res) => this.getAllTeams(req, res));
    router.post("/", (req, res) => this.createNewTeam(req, res));
    router.get("/:teamId", (req, res) => this.getTeamById(req, res));
    router.put("/:teamId", (req, res) => this.updateTeamById(req, res));
    router.delete("/:teamId", (req, res) => this.deleteTeamById(req, res));

    return router;
  }
  deleteTeamById(req: Request, res: Response): any {
    TeamMongo.findByIdAndDelete(req.params.teamId, (err, team) => {
      if (err) {
        res.status(404).send(this.generateNotFoundMessage(req.params.teamId));
        return;
      }

      res.status(204).send();
    });
  }

  updateTeamById(req: Request, res: Response): void {

    req.body.members = Array.from(new Set(req.body.members)); // Remove Duplicates
    
    TeamMongo.findByIdAndUpdate(req.params.teamId, req.body, (err, team) => {
      if (err || !team) {
        res.status(404).send(this.generateNotFoundMessage(req.params.teamId));
        return;
      }

      res.status(204).send();
    });
  }

  createNewTeam(req: Request, res: Response): void {
    TeamMongo.create(req.body, (err: any, team: ITeam) => {

      if(err) {
          res
          .status(400)
          .send(`Something is wrong with your Request.`)
          return;
      }

      res
        .status(201)
        .header("location", team._id)
        .send();
    });
  }

  getAllTeams(req: Request, res: Response): void {
    let conditions = null;
    if (req.param("name")) {
      conditions = { name: { $regex: req.param("name"), $options: "i" } };
    }

    TeamMongo.find(conditions, (_err: any, teams: ITeam[]) => {
      res.status(200).send(TeamWithId.getMultiple(teams));
    });
  }

  getTeamById(req: Request, res: Response) {
    TeamMongo.findById(req.params.teamId)
      .populate("members")
      .exec((err: any, team: ITeam) => {
        if (err || !team) {
          res.status(404).send(this.generateNotFoundMessage(req.params.teamId));
          return;
        }

        res.status(200).send(new TeamWithMembers(team));
      });
  }

  generateNotFoundMessage(entity: string): any {
    return 'Could not find a Team with ID "' + entity + '"';
  }
}
