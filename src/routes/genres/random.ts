import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Genre } from "../../schemas"
import authenticate from "../../middleware/auth"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const limit = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			// Validate the limit
			if (isNaN(limit) || limit <= 0) {
				return response
					.status(422)
					.json({ error: "Invalid limit value" })
			}

			// Aggregate and get random genres
			const randomGenres = await Genre.aggregate([
				{ $sample: { size: limit } },
			])

			if (randomGenres.length === 0) {
				return response.status(404).json({ error: "No genres found" })
			}

			return response.status(200).json(randomGenres)
		},
	}
