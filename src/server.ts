import { RestApp } from "./utils/rest-app";
import mongoose from "mongoose";
import { AthleteController } from "./controllers/athlete.controller";
import { SwaggerController } from "./controllers/swagger.controller";
import { TeamController } from "./controllers/team.controller";
import { SeasonController } from "./controllers/season.controller";
import { GameController } from "./controllers/game.controller";
import { RankingController } from "./controllers/ranking.controller";
import { get } from "config";
import { sendInviteMail } from "./utils/invite";
import { UserMongo } from "./models/user.model";
import { UserController } from "./controllers/user.controller";
import { LoginController } from "./controllers/login.controller";

const app = new RestApp(
  get("beerpong-port"),
  [
    new SwaggerController(),
    new AthleteController(),
    new TeamController(),
    new SeasonController(),
    new GameController(),
    new RankingController(),
    new UserController(),
    new LoginController()
  ],
  "/api/v1",
  "/api/v1/swagger"
);

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connect(
  `mongodb://${get("mongo-host")}:${get("mongo-port")}/beerpong`,
  { useNewUrlParser: true },
  err => {
    if (err) {
      console.log(err);
      return;
    }

    UserMongo.find((err, users) => {
      if (users.length == 0) {
        sendInviteMail(get("beerpong-initial-user-email"));
      }
    });
    app.start();
  }
);
