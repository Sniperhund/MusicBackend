import dotenv from "dotenv";
import express, { Application, Express, Request, Response } from "express";
import autoroutes from "express-automatic-routes";

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

autoroutes(app, {
  dir: "./routes/",
});

app.listen(port, () => {
  console.log(`Server is started at http://localhost:${port}`);
});
