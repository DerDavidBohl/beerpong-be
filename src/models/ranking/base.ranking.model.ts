import { IHaveNameAndId } from "../simpleNameAndId.model";

export class Ranking {
  constructor(
    public entity: IHaveNameAndId,
    public rank: number = 0,
    public amountOfGames: number = 0,
    public amountOfVictories: number = 0, 
    public amountOfDefeats: number = 0,
    public ownHits: number = 0,
    public hostileHits: number = 0) {}
}

export enum RankingType {
  Athlete,
  Team
}
