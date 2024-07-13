import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Genre } from "../../schemas"
import auth from "../../middleware/auth"
import mongoose from "mongoose"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			const limit = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			if (isNaN(limit) || limit < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid limit",
				})
			}

			// Aggregate and get random genres
			const randomGenres = await Genre.aggregate([
				{ $sample: { size: limit } },
			])

			if (randomGenres.length === 0) {
				return response.status(404).json({
					status: "error",
					message: "No genres found",
				})
			}

			return response.status(200).json({
				status: "ok",
				response: randomGenres,
			})
		},
	}
