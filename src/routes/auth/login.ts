import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { upload } from "../../middleware/upload"
import bcrypt from "bcrypt"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none()],
		post: async (request: Request, response: Response) => {
			if (!request.body.email) {
				return response.status(400).json({
					status: "error",
					message: "Email is required",
				})
			}

			if (!request.body.password) {
				return response.status(400).json({
					status: "error",
					message: "Password is required",
				})
			}

			let user = await User.findOne({
				email: request.body.email.toLowerCase(),
			})

			if (
				!user ||
				!bcrypt.compareSync(request.body.password, user.password!)
			) {
				return response.status(400).json({
					status: "error",
					message:
						"Sorry, we couldn't find an account with that email or password",
				})
			}

			if (!user.verified) {
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
