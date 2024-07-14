import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import auth from "../../middleware/auth"
import { upload } from "../../middleware/upload"
import validator from "validator"
import { v4 as uuidv4 } from "uuid"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		post: async (request: Request, response: Response) => {
			if (!request.body.oldPassword) {
				return response.status(400).json({
					status: "error",
					message: "Old password is required",
				})
			}

			if (!request.body.newPassword) {
				return response.status(400).json({
					status: "error",
					message: "New password is required",
				})
			}

			/**
			 * minLength: 8
			 * minLowercase: 1
			 * minUppercase: 1
			 * minNumbers: 1
			 * minSymbols: 1
			 * returnScore: false
			 * pointsPerUnique: 1
			 * pointsPerRepeat: 0.5
			 * pointsForContainingLower: 10
			 * pointsForContainingUpper: 10
			 * pointsForContainingNumber: 10
			 * pointsForContainingSymbol: 10
			 */
			if (!validator.isStrongPassword(request.body.newPassword)) {
				return response.status(400).json({
					status: "error",
					message: "New password is too weak",
				})
			}

			let user = await User.findOne({
				accessToken: request.body.user.accessToken,
			})

			if (!user) {
				return response.status(400).json({
					status: "error",
					message: "User not found",
				})
			}

			if (user.password != request.body.oldPassword) {
				return response.status(400).json({
					status: "error",
					message: "Password is incorrect",
				})
			}

			if (request.body.oldPassword == request.body.newPassword) {
				return response.status(400).json({
					status: "error",
					message: "New password must be different from old password",
				})
			}

			user.password = request.body.newPassword
			user.accessToken = ""
			user.refreshToken = uuidv4()

			await user.save()

			return response.status(200).json({
				status: "ok",
				response: {
					refreshToken: user.refreshToken,
				},
			})
		},
	}
