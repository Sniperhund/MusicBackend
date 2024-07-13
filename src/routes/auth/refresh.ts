import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { v4 as uuidv4 } from "uuid"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none()],
		post: async (request: Request, response: Response) => {
			let user = await User.findOne({
				refreshToken: request.body.refreshToken,
			})

			if (!user)
				return response.status(400).json({
					status: "error",
					message: "The refresh token is invalid",
				})

			user.accessToken = uuidv4()
			user.accessTokenExpire = new Date(
				Date.now() + 60 * 60 * 24 * 7 * 1000
			)

			await user.save()

			response.status(200).json({
				status: "ok",
				response: {
					accessToken: user.accessToken,
					accessTokenExpire: user.accessTokenExpire,
				},
			})
		},
	}
