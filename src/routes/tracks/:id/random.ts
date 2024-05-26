import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Album, Artist, Track, Genre } from "../../../schemas"
import authenticate from "../../../middleware/auth"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const genreId = request.params.id
			const limit = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			const genre = await Genre.findById(genreId)
			if (!genre) {
				return response.status(404).json({ error: "Genre not found" })
			}

			// Aggregate and get random tracks
			const randomTracks = await Track.aggregate([
				{
					$lookup: {
						from: "albums",
						localField: "album",
						foreignField: "_id",
						as: "albumInfo",
					},
				},
				{
					$unwind: "$albumInfo",
				},
				{
					$match: {
						"albumInfo.genres": new mongoose.Types.ObjectId(
							genreId
						),
					},
				},
				{ $sample: { size: limit } },
			])

			return response.status(200).json(randomTracks)
		},
	}
