import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { v4 as uuidv4 } from "uuid"

export default (express: Application) =>
	<Resource>{
		post: async (request: Request, response: Response) => {
			let user = await User.findOne({
				refreshToken: request.body.refreshToken,
			})

			if (!user)
				return response.status(404).json({
					status: "error",
					message: "The refresh token is invalid",
				})

			user.accessToken = uuidv4()

			await user.save()

			response.status(200).json({
				status: "ok",
				accessToken: user.accessToken,
			})
		},
	}
