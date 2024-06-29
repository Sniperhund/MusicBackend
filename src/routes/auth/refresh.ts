import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { v4 as uuidv4 } from "uuid"

export default (express: Application) =>
	<Resource>{
		post: async (request: Request, response: Response) => {
			try {
				let user = await User.findOne({
					refreshToken: request.body.refreshToken,
				})

				if (!user)
					return response.status(404).json({
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
					accessToken: user.accessToken,
					accessTokenExpire: user.accessTokenExpire,
				})
			} catch (error) {
				if (typeof error === "object" && error && "message" in error) {
					return response.status(500).json({ message: error.message })
				} else {
					return response
						.status(500)
						.json({ message: "An unknown error occurred" })
				}
			}
		},
	}
