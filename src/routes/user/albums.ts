import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import auth from "../../middleware/auth"
import { Album, User } from "../../schemas"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			const limit: number = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			if (isNaN(limit) || limit < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid limit",
				})
			}

			const offset = request.query.offset
				? parseInt(request.query.offset as string)
				: 0

			if (isNaN(offset) || offset < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid offset",
				})
			}

			const savedTracksIds = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate({
					path: "savedTracks",
					options: {
						limit: limit,
						skip: offset,
					},
				})

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

			const savedAlbums = await Album.find({
				_id: { $in: albumIds },
			}).populate("artists")

			response.status(200).json({
				status: "ok",
				response: savedAlbums,
			})
		},
	}
