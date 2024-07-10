import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Album, Track } from "../../../schemas"
import auth from "../../../middleware/auth"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [auth],
		get: async (request: Request, response: Response) => {
			if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
				return response.status(400).json({
					status: "error",
					message: "Invalid id",
				})
			}

			const limit = request.query.limit
				? parseInt(request.query.limit as string)
				: 0

			if (isNaN(limit) || limit < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid limit",
				})
			}

			const skip = request.query.offset
				? parseInt(request.query.offset as string)
				: 0

			if (isNaN(skip) || skip < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid offset",
				})
			}

			const tracks = await Track.find({ album: request.params.id })
				.limit(limit)
				.skip(skip)
				.populate("album")
				.populate("artist")

			if (tracks.length === 0) {
				return response.status(404).json({
					status: "error",
					message: "No tracks found",
				})
			}

			response.status(200).json({
				status: "ok",
				response: tracks,
			})
		},
	}
