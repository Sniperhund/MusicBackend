import { Application, Request, Response } from "express";
import { Resource } from "express-automatic-routes";

export default (express: Application) =>
  <Resource>{
    get: (request: Request, response: Response) => {
      const eq = JSON.parse(request.query.eq as string);
      const eqKey = Object.keys(eq);

      console.log(eqKey);

      response
        .status(200)
        .send({
          status: 200,
        })
        .end();
    },
  };
