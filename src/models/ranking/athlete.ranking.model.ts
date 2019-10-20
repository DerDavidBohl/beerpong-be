import { RankingBase } from "./base.ranking.model";
import { AthleteWithId } from "../athlete.model";

export class AthleteRanking extends RankingBase {
  constructor(public athlete: AthleteWithId) {
    super(0, 0, 0, 0);
  }
}
