import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import authenticate from "../../../middleware/auth"
import { User } from "../../../schemas"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const user = await User.findById(request.body.user._id).select(
				"savedTracks"
			)

			if (!user)
				return response.status(400).json({
					status: "error",
					message: "The user was not found",
				})

			const contains = user.savedTracks.includes(request.query.id as any)

			response.status(200).json({
				status: "ok",
				contains: contains,
			})
		},
	}
