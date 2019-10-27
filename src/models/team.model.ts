import { Schema, model, Document } from "mongoose";
import { IAthlete, AthleteWithId } from "./athlete.model";
import { IHaveNameAndId } from "./simpleNameAndId.model";

export interface ITeam extends Document {
    name: string;
    members: IAthlete[];
}

export const TeamSchema : Schema = new Schema({
    name: {type: String, required: true},
    members: [{ type: Schema.Types.ObjectId, ref: 'Athlete' }]
    });

export class TeamWithId implements IHaveNameAndId {
    name: string;
    id: string;

    constructor(teamDoc: ITeam) {
        this.id = teamDoc.id;
        this.name = teamDoc.name;
    } 

    static getMultiple(teamDocs: ITeam[]): TeamWithId[] {
        const teams: TeamWithId[] = [];

        teamDocs.forEach(teamDoc => {
            teams.push(new TeamWithId(teamDoc));
        });

        return teams;
    }
}

export class TeamWithMembers {
    name: string;
    members: AthleteWithId[];

    constructor(teamDoc: ITeam) {
        this.name = teamDoc.name;
        this.members = AthleteWithId.getMultiple(teamDoc.members);
    }
}

export const TeamMongo = model<ITeam>('Team', TeamSchema);
