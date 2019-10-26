export class RankingBase {
  constructor(public rank: number,
    public amountOfGames: number,
    public amountOfVictories: number, 
    public amountOfDefeats: number,
    public ownHits: number,
    public hostileHits: number) {}
}
