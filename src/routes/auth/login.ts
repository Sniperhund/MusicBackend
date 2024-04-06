import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"

export default (express: Application) =>
	<Resource>{
		post: async (request: Request, response: Response) => {
			try {
				let user = await User.findOne({
					email: request.body.email.toLowerCase(),
				})

				if (!user)
					return response.status(400).json({
						status: "error",
						message: "User not found",
					})

				if (user.password !== request.body.password)
					return response.status(400).json({
						status: "error",
						message: "Invalid password",
					})

				if (!user.accessToken)
					return response.status(400).json({
						status: "error",
						message: "You have to verify before you can login",
					})

				response.status(200).json({
					status: "ok",
					refreshToken: user.refreshToken,
					accessToken: user.accessToken,
				})
			} catch (error) {
				if (typeof error === "object" && error && "message" in error) {
					return response.status(404).json({ message: error.message })
				} else {
					return response
						.status(500)
						.json({ message: "An unknown error occurred" })
				}
			}
		},
	}
