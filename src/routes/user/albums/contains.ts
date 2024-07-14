import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import auth from "../../../middleware/auth"
import { Album, User } from "../../../schemas"
import { upload } from "../../../middleware/upload"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			if (!mongoose.Types.ObjectId.isValid(request.query.id as string)) {
				return response.status(400).json({
					status: "error",
					message: "Invalid id",
				})
			}

			const user = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate("savedTracks")

			if (!user) {
				return response.status(400).json({
					status: "error",
					message: "The user was not found",
				})
			}

			const albumIds: any[] = user.savedTracks.map((track: any) => {
				return track.album.toString()
			})

			const contains = albumIds.includes(request.query.id as any)

			response.status(200).json({
				status: "ok",
				response: contains,
			})
		},
	}
