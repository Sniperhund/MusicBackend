import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none()],
		post: async (request: Request, response: Response) => {
			let user = await User.findOne({
				email: request.body.email.toLowerCase(),
			})

			if (!user || user.password !== request.body.password) {
				return response.status(400).json({
					status: "error",
					message:
						"Sorry, we couldn't find an account with that email or password",
				})
			}

			if (!user.accessToken) {
				return response.status(400).json({
					status: "error",
					message: "Sorry, you need to verify your email first",
				})
			}

			response.status(200).json({
				status: "ok",
				response: {
					refreshToken: user.refreshToken,
					accessToken: user.accessToken,
				},
			})
		},
	}
