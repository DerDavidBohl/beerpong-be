import { RestController } from "../../interfaces/rest-controller.interface";
import { Router } from "express";
import { Request, Response } from "express";
import { AthleteRanking } from "../../models/ranking/athlete.ranking.model";
import AthleteMongo, {
  AthleteWithId,
  IAthlete
} from "../../models/athlete.model";
import { GameMongo } from "../../models/game.model";

export class AthleteRankingController implements RestController {
  path: string = "/rankings/athletes";

  initializeRoutes(): Router {
    const router: Router = Router();

    router.get("/", (req, res) => this.getAllAthleteRankings(req, res));

    return router;
  }

  getAllAthleteRankings(req: Request, res: Response): any {
    AthleteMongo.find((err, athletes) => {
      if (err) {
        res.status(500).send("Internal error.");
        return;
      }

      GameMongo.find((err, games) => {
        if (err) {
          res.status(500).send("Internal error.");
          return;
        }
        const ranks: AthleteRanking[] = [];

        athletes.forEach(athlete => {
          const rank = new AthleteRanking(new AthleteWithId(athlete));

          games.forEach(game => {
            if (
              this.athleteArrayContainsAthleteById(
                game.athletesTeam1,
                athlete._id
              )
            ) {
              rank.hostileHits += 10 - game.scoreTeam1.valueOf();
              rank.ownHits += 10 - game.scoreTeam2.valueOf();
            }

            if (
              this.athleteArrayContainsAthleteById(
                game.athletesTeam2,
                athlete._id
              )
            ) {
              rank.hostileHits += 10 - game.scoreTeam2.valueOf();
              rank.ownHits += 10 - game.scoreTeam1.valueOf();
            }

            if (
              (this.athleteArrayContainsAthleteById(
                game.athletesTeam1,
                athlete._id
              ) &&
                game.scoreTeam1 > game.scoreTeam2) ||
              (this.athleteArrayContainsAthleteById(
                game.athletesTeam2,
                athlete._id
              ) &&
                game.scoreTeam2 > game.scoreTeam1)
            ) {
              rank.amountOfVictories++;
            }
          });

          ranks.push(rank);
          ranks.sort((a, b) => {
            if (a.amountOfVictories < b.amountOfVictories) return 1;
            if (a.amountOfVictories > b.amountOfVictories) return -1;

            if (a.ownHits < b.ownHits) {
              return 1;
            }
            if (a.ownHits > b.ownHits) {
              return -1;
            }
            if (a.hostileHits < b.hostileHits) {
              return -1;
            }
            if (a.hostileHits > b.hostileHits) {
              return 1;
            }

            return 0;
          });

          let rankCtr = 1;
          ranks.forEach(rank => {
            rank.rank = rankCtr;
            rankCtr++;
          });
        });

        res.send(ranks);
      });
    });
  }

  athleteArrayContainsAthleteById(
    athleteArray: IAthlete[],
    athleteId: any
  ): boolean {
    let result = false;

    athleteArray.forEach(athlete => {
      if (athlete._id.equals(athleteId)) {
        result = true;
      }
    });

    return result;
  }
}
