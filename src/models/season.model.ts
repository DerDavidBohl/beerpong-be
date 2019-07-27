import mongoose, { Document, Schema } from "mongoose";

export interface ISeason extends Document {
  name: string;
  from: Date;
  to: Date;
}

export const SeasonSchema: Schema = new Schema({
  name: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true }
});

export class SeasonSimple {
    name: string;
    from: Date;
    to: Date;

    constructor(season: ISeason) {
      this.name = season.name;
      this.from = season.from;
      this.to = season.to;
    }
}

export class SeasonWithId extends SeasonSimple {
  id: string;

  constructor(season: ISeason) {
    super(season);
    this.id = season._id;
  }

  public static createMultiple(seasons: ISeason[]): SeasonWithId[] {
    const arr: SeasonWithId[] = [];

    seasons.forEach(season => {
        arr.push(new SeasonWithId(season));
    });

    return arr;
  }
}

const SeasonMongo = mongoose.model<ISeason>("Season", SeasonSchema);
export default SeasonMongo;
