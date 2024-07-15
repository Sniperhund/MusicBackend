import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Track, Genre } from "../../../schemas"
import auth from "../../../middleware/auth"
import mongoose from "mongoose"
import { upload } from "../../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
				return response.status(400).json({
					status: "error",
					message: "Invalid id",
				})
			}

			const genreId = request.params.id

			if (!mongoose.Types.ObjectId.isValid(genreId)) {
				return response.status(400).json({
					status: "error",
					message: "Invalid genre id",
				})
			}

			const limit = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			if (isNaN(limit) || limit < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid limit",
				})
			}

			const genre = await Genre.findById(genreId)

			if (!genre) {
				return response.status(400).json({
					status: "error",
					message: "Genre not found",
				})
			}

			// Aggregate and get random tracks
			const pipeline = [
				{
					$lookup: {
						from: "albums",
						localField: "album",
						foreignField: "_id",
						as: "album",
					},
				},
				{
					$unwind: "$album",
				},
				{
					$lookup: {
						from: "artists",
						localField: "album.artists",
						foreignField: "_id",
						as: "artists",
					},
				},
				{
					$unwind: "$artists",
				},
				{
					$match: {
						"album.genres": new mongoose.Types.ObjectId(genreId),
					},
				},
				{ $sample: { size: limit } },
			]

			const randomTracks = await Track.aggregate(pipeline)

			if (randomTracks.length === 0) {
				return response.status(404).json({
					status: "error",
					message: "No tracks found",
				})
			}

			return response.status(200).json({
				status: "ok",
				response: randomTracks,
			})
		},
	}
