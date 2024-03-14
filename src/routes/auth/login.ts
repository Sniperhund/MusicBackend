import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"

export default (express: Application) =>
	<Resource>{
		post: async (request: Request, response: Response) => {
			let user = await User.findOne({ email: request.body.email })

			if (!user)
				return response.status(400).json({
					status: "error",
					message: "User not found",
				})

			if (!user.password === request.body.password)
				return response.status(400).json({
					status: "error",
					message: "Invalid password",
				})

			response.status(200).json({
				status: "ok",
				refreshToken: user.refreshToken,
				accessToken: user.accessToken,
			})
		},
	}
