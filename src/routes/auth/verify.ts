import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { v4 as uuidv4 } from "uuid"

export default (express: Application) =>
	<Resource>{
		get: async (request: Request, response: Response) => {
			let user = await User.findOne({
				verifyToken: request.query.q,
			})

			if (!user)
				return response.status(400).json({
					status: "error",
					message: "User not found",
				})

			if (user.verified)
				return response.status(400).json({
					status: "error",
					message: "User already verified",
				})

			user.verified = true
			user.verifyToken = ""

			user.accessToken = uuidv4()
			user.accessTokenExpire = new Date(
				Date.now() + 60 * 60 * 24 * 7 * 1000
			)
			user.refreshToken = uuidv4()

			await user.save()

			response.status(200).json({
				status: "ok",
				accessToken: user.accessToken,
				refreshToken: user.refreshToken,
				accessTokenExpire: user.accessTokenExpire,
			})
		},
	}
