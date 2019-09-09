import { Document, Schema, model } from "mongoose";
import { ISeason, SeasonSimple, SeasonWithId } from "./season.model";
import { ITeam, TeamWithId } from "./team.model";
import { IAthlete, AthleteWithId } from "./athlete.model";

export interface IGame extends Document {
  date: Date;
  scoreTeam1: Number;
  scoreTeam2: Number;
  season: ISeason;
  team1: ITeam;
  team2: ITeam;
  athletesTeam1: IAthlete[];
  athletesTeam2: IAthlete[];
}

export class SpecificGame {
    date: Date;
    scoreTeam1: Number;
    scoreTeam2: Number;
    season: SeasonWithId | null;
    team1: TeamWithId | null;
    team2: TeamWithId | null;

    constructor(game: IGame) {
      this.date = game.date;
      this.scoreTeam1 = game.scoreTeam1;
      this.scoreTeam2 = game.scoreTeam2;
  
      if (!game.team1) {
        this.team1 = null;
      } else {
        this.team1 = new TeamWithId(game.team1);
      }
  
      if (!game.team2) {
        this.team2 = null;
      } else {
        this.team2 = new TeamWithId(game.team2);
      }
  
      if (!game.season) {
        this.season = null;
      } else {
        this.season = new SeasonWithId(game.season);
      }      
    }

}

export class AllGamesGame extends SpecificGame {
  id: string;

  constructor(game: IGame) {
    super(game);
    this.id = game._id;
  }

  static generateMultiple(games: IGame[]): AllGamesGame[] {
    const result: AllGamesGame[] = [];

    games.forEach(game => {
      result.push(new AllGamesGame(game));
    });

    return result;
  }
}

export const GameSchema: Schema = new Schema({
  date: { type: Date },
  scoreTeam1: { type: Number },
  scoreTeam2: { type: Number },
  season: { type: Schema.Types.ObjectId, ref: 'Season' },
  team1: { type: Schema.Types.ObjectId, ref: 'Team' },
  team2: { type: Schema.Types.ObjectId, ref: 'Team' },
  athletesTeam1: [{ type: Schema.Types.ObjectId, ref: 'Athlete' }],
  athletesTeam2: [{ type: Schema.Types.ObjectId, ref: 'Athlete' }]
});

export const GameMongo = model<IGame>("Game", GameSchema);
