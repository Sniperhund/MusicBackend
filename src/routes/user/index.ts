import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import authenticate from "../../middleware/auth"
import { User } from "../../schemas"
import { Schema } from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const user = await User.findById(request.body.user._id)
				.select(
					"-password -accessToken -refreshToken -accessTokenExpire -verifyToken"
				)
				.populate("savedTracks")

			if (!user)
				return response.status(400).json({
					status: "error",
					message: "User not found",
				})

			response.status(200).json(user)
		},
	}
