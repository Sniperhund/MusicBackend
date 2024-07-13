import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { v4 as uuidv4 } from "uuid"
import validator from "validator"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none()],
		get: async (request: Request, response: Response) => {
			if (!request.query.q) {
				return response.status(400).json({
					status: "error",
					message: "Token is required",
				})
			}

			if (!validator.isUUID(request.query.q as string)) {
				return response.status(400).json({
					status: "error",
					message: "Invalid token",
				})
			}

			let user = await User.findOne({
				verifyToken: request.query.q,
			})

			if (!user) {
				return response.status(400).json({
					status: "error",
					message: "User not found",
				})
			}

			if (user.verified) {
				return response.status(400).json({
					status: "error",
					message: "User already verified",
				})
			}

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
				response: {
					accessToken: user.accessToken,
					refreshToken: user.refreshToken,
					accessTokenExpire: user.accessTokenExpire,
				},
			})
		},
	}
