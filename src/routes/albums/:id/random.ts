import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Album, Artist, Track, Genre } from "../../../schemas"
import authenticate from "../../../middleware/auth"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const genreId = new mongoose.Types.ObjectId(request.params.id)
			const limit = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			// Validate the limit
			if (isNaN(limit) || limit <= 0) {
				return response
					.status(422)
					.json({ error: "Invalid limit value" })
			}

			// Validate the genre ID
			if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
				return response.status(422).json({ error: "Invalid genre ID" })
			}

			// Build the aggregation pipeline
			const pipeline = [
				{ $match: { genres: genreId } },
				{ $sample: { size: limit } },
				{
					$lookup: {
						from: "artists",
						localField: "artist",
						foreignField: "_id",
						as: "artistInfo",
					},
				},
				{ $unwind: "$artistInfo" },
				{
					$project: {
						_id: 1,
						name: 1,
						cover: 1,
						genres: 1,
						artist: {
							_id: "$artistInfo._id",
							name: "$artistInfo.name",
							cover: "$artistInfo.cover",
						},
					},
				},
			]

			const randomAlbums = await Album.aggregate(pipeline)

			if (randomAlbums.length === 0) {
				return response.status(404).json({ error: "No albums found" })
			}

			response.status(200).json(randomAlbums)
		},
	}
