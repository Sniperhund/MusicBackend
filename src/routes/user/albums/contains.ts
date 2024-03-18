import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import authenticate from "../../../middleware/auth"
import { Album, User } from "../../../schemas"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const limit: number = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			const savedTracksIds = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate("savedTracks")

			if (!savedTracksIds)
				return response.status(400).json({
					status: "error",
					message: "No saved albums found",
				})

			const albumIds: any[] = savedTracksIds.savedTracks.map(
				(track: any) => {
					return track.album
				}
			)

			const contains = albumIds.includes(request.query.id as any)

			response.status(200).json({
				status: "ok",
				contains: contains,
			})
		},
	}
