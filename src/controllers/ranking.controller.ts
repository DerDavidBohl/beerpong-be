import { RestController } from "../interfaces/rest-controller.interface";
import { Router } from "express";
import { Request, Response } from "express";
import AthleteMongo, { AthleteWithId, IAthlete } from "../models/athlete.model";
import { GameMongo, IGame } from "../models/game.model";
import { Ranking, RankingType } from "../models/base.ranking.model";
import { IHaveNameAndId } from "../interfaces/simple-name-and-id.interface";
import { TeamMongo, TeamWithId } from "../models/team.model";

export class RankingController implements RestController {
  path: string = "/rankings";

  initializeRoutes(): Router {
    const router: Router = Router();

    router.get("/athletes", (req, res) => this.getAllAthleteRankings(req, res));
    router.get("/teams", (req, res) => this.getAllTeamRankings(req, res));

    return router;
  }

  getAllAthleteRankings(req: Request, res: Response): any {
    let seasonId: any = null;

    if (req.query.seasonId) {
      seasonId = req.query.seasonId;
    }

    AthleteMongo.find((err, athletes) => {
      if (err) {
        res.status(500).send("Internal error.");
        return;
      }

      const athletesWithId: AthleteWithId[] = AthleteWithId.getMultiple(
        athletes
      );
      this.createAndSendRanking(
        res,
        athletesWithId,
        seasonId,
        RankingType.Athlete
      );
    });
  }

  getAllTeamRankings(req: Request, res: Response): any {
    let seasonId: any = null;

    if (req.query.seasonId) {
      seasonId = req.query.seasonId;
    }

    TeamMongo.find((err, teams) => {
      if (err) {
        res.status(500).send("Internal error.");
        return;
      }

      const teamsWithId: TeamWithId[] = TeamWithId.getMultiple(teams);
      this.createAndSendRanking(res, teamsWithId, seasonId, RankingType.Team);
    });
  }

  private createAndSendRanking(
    res: Response,
    rankableEntities: IHaveNameAndId[],
    seasonId: any,
    rankingType: RankingType
  ) {
    GameMongo.find((err, games) => {
      if (err) {
        res.status(500).send("Internal error.");
        return;
      }
      let ranks: Ranking[] = [];
      rankableEntities.forEach(rankableEntity => {
        let rank = new Ranking(rankableEntity);
        games.forEach(game => {
          if (seasonId && seasonId != game.season) return;

          if (rankingType == RankingType.Team) {
            rank = this.updateRankForTeam(game, rankableEntity, rank);
          }

          if (rankingType == RankingType.Athlete) {
            rank = this.updateRankForAthlete(game, rankableEntity, rank);
          }
        });
        ranks.push(rank);
        ranks = this.SortRankings(ranks);
      });
      res.send(ranks);
    });
  }

  private updateRankForTeam(
    game: IGame,
    rankableEntity: IHaveNameAndId,
    rank: Ranking
  ): Ranking {
    if (
      (game.team1 && game.team1._id.equals(rankableEntity.id)) ||
      (game.team2 && game.team2._id.equals(rankableEntity.id))
    ) {
      rank.amountOfGames++;

      let cupsOwnSide: number = -1;
      let cupsHostileSide: number = -1;

      if (game.team1 && game.team1._id.equals(rankableEntity.id)) {
        cupsOwnSide = game.scoreTeam1.valueOf();
        cupsHostileSide = game.scoreTeam2.valueOf();
      }
      
      if (game.team2 && game.team2._id.equals(rankableEntity.id)) {
        cupsOwnSide = game.scoreTeam2.valueOf();
        cupsHostileSide = game.scoreTeam1.valueOf();
      }

      rank.hostileHits += 10 - cupsOwnSide;
      rank.ownHits += 10 - cupsHostileSide;

      if (cupsOwnSide > cupsHostileSide) {
        rank.amountOfVictories++;
      } else {
        rank.amountOfDefeats++;
      }
    }

    return rank;
  }

  private SortRankings(ranks: Ranking[]): Ranking[] {
    let rankCtr = 1;
    ranks.sort((a, b) => {
      if (a.amountOfVictories < b.amountOfVictories) return 1;
      if (a.amountOfVictories > b.amountOfVictories) return -1;
      if (a.ownHits < b.ownHits) return 1;
      if (a.ownHits > b.ownHits) return -1;
      if (a.amountOfDefeats < b.amountOfDefeats) return -1;
      if (a.amountOfDefeats > b.amountOfDefeats) return 1;
      if (a.hostileHits < b.hostileHits) return -1;
      if (a.hostileHits > b.hostileHits) return 1;
      return 0;
    });

    ranks.forEach(rank => {
      rank.rank = rankCtr;
      rankCtr++;
    });

    return ranks;
  }

  private updateRankForAthlete(
    game: IGame,
    rankableEntity: IHaveNameAndId,
    rank: Ranking
  ): Ranking {
    if (
      this.athleteArrayContainsAthleteById(
        game.athletesTeam1,
        rankableEntity.id
      ) ||
      this.athleteArrayContainsAthleteById(
        game.athletesTeam2,
        rankableEntity.id
      )
    ) {
      rank.amountOfGames++;
      if (
        this.athleteArrayContainsAthleteById(
          game.athletesTeam1,
          rankableEntity.id
        )
      ) {
        rank.hostileHits += 10 - game.scoreTeam1.valueOf();
        rank.ownHits += 10 - game.scoreTeam2.valueOf();
      }
      if (
        this.athleteArrayContainsAthleteById(
          game.athletesTeam2,
          rankableEntity.id
        )
      ) {
        rank.hostileHits += 10 - game.scoreTeam2.valueOf();
        rank.ownHits += 10 - game.scoreTeam1.valueOf();
      }
      if (
        (this.athleteArrayContainsAthleteById(
          game.athletesTeam1,
          rankableEntity.id
        ) &&
          game.scoreTeam1 > game.scoreTeam2) ||
        (this.athleteArrayContainsAthleteById(
          game.athletesTeam2,
          rankableEntity.id
        ) &&
          game.scoreTeam2 > game.scoreTeam1)
      ) {
        rank.amountOfVictories++;
      } else {
        rank.amountOfDefeats++;
      }
    }

    return rank;
  }

  private athleteArrayContainsAthleteById(
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
