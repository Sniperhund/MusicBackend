import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import authenticate from "../../middleware/auth"
import { Resend } from "resend"
import { v4 as uuidv4 } from "uuid"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		post: async (request: Request, response: Response) => {
			try {
				let user = await User.findOne({
					accessToken: request.body.user.accessToken,
				})

				if (!user)
					return response.status(400).json({
						status: "error",
						message: "User not found",
					})

				if (!request.body.oldPassword || !request.body.newPassword)
					return response.status(422).json({
						status: "error",
						message: "One or more fields are missing",
					})

				if (user.password != request.body.oldPassword)
					return response.status(400).json({
						status: "error",
						message: "Wrong password",
					})

				user.password = request.body.newPassword

				await user.save()
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
