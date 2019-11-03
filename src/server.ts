import { RestApp } from "./utils/rest-app";
import mongoose from 'mongoose';
import { AthleteController } from "./controllers/athlete.controller";
import { SwaggerController } from "./controllers/swagger.controller";
import { TeamController } from "./controllers/team.controller";
import { SeasonController } from "./controllers/season.controller";
import { GameController } from "./controllers/game.controller";
import { RankingController } from "./controllers/ranking.controller";
import { get} from "config";

const app = new RestApp(get("beerpong-port"), [
    new SwaggerController(),
    new AthleteController(),
    new TeamController(),
    new SeasonController(),
    new GameController(),
    new RankingController(),
], '/api/v1', '/api/v1/swagger');

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connect(`mongodb://${get("mongo-host")}:${get("mongo-port")}/beerpong`, {useNewUrlParser: true},(err) => {
    if(err) {
        console.log(err);
        return;
    }
    app.start();
  });