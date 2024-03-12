import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"

export default (express: Application) =>
	<Resource>{
		get: async (request: Request, response: Response) => {
			response.status(200).json({
				status: "ok",
			})
		},
	}
