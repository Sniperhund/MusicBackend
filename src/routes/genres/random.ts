import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Genre } from "../../schemas"
import authenticate from "../../middleware/auth"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const excludeIds = request.query.exclude
				? (request.query.exclude as string)
						.split(",")
						.map((id) => new mongoose.Types.ObjectId(id))
				: []

			const pipeline = []

			console.log(excludeIds)

			// Add match stage to exclude the specified genres if excludeIds are provided
			if (excludeIds.length > 0) {
				pipeline.push({
					$match: { _id: { $nin: excludeIds } },
				})
			}

			// Add sample stage to get a random genre
			pipeline.push({ $sample: { size: 1 } })

			const randomGenre = await Genre.aggregate(pipeline)

			if (randomGenre.length === 0) {
				return response.status(404).json({ error: "No genres found" })
			}

			return response.status(200).json(randomGenre[0])
		},
	}
