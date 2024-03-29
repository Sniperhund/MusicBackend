import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../schemas"

export default (express: Application) =>
	<Resource>{
		get: async (request: Request, response: Response) => {
			/*const user = new User({
				name: "Lucas",
				email: "lucastakker@gmail.com",
				password: "123456",
			})

			await user.save()

			response.json(user)*/

			response.status(200).json({
				status: "ok",
			})
		},
	}
