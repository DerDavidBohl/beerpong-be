import mongoose, { Schema, Document } from 'mongoose';

export interface IAthlete extends Document {
  name: string;
}

export const AthleteSchema: Schema = new Schema({
  name: { type: String, required: true }
});

export class AthleteWithId {

  name: string;
  id: string;

  constructor(athlete: IAthlete) {
    this.name = athlete.name;
     this.id = athlete._id;
  }

  static getMultiple(athletes: IAthlete[]): AthleteWithId[] {
    const ath: AthleteWithId[] = [];

    athletes.forEach(element => {
      ath.push(new AthleteWithId(element));
    });

    return ath;
  }
}

export class Athlete {

  name: string;

  constructor(athlete: IAthlete) {
    this.name = athlete.name;
  }
}

// Export the model and return your IUser interface
const AthleteMongo = mongoose.model<IAthlete>('Athlete', AthleteSchema)
export default AthleteMongo;