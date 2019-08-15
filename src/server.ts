import { RestApp } from "./utils/rest-app";
import mongoose from 'mongoose';
import { AthleteController } from "./controllers/athlete.controller";
import { SwaggerController } from "./controllers/swagger.controller";
import { TeamController } from "./controllers/team.controller";
import { SeasonController } from "./controllers/season.controller";
import { GameController } from "./controllers/game.controller";

const app = new RestApp(3000, [
    new SwaggerController(),
    new AthleteController(),
    new TeamController(),
    new SeasonController(),
    new GameController()
]);

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

mongoose.connect('mongodb://mongo:27017/beerpong', {useNewUrlParser: true},(err) => {
    if(err) {
        console.log(err);
        return;
    }
    app.start();
  });