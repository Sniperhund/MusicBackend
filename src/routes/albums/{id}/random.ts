import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Album } from "../../../schemas"
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

			const genreId = new mongoose.Types.ObjectId(request.params.id)
			const limit = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			if (isNaN(limit) || limit < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid limit",
				})
			}

			const pipeline = [
				{
					$match: {
						genres: genreId,
					},
				},
				{
					$sample: {
						size: limit,
					},
				},
				{
					$lookup: {
						from: "artists",
						localField: "artists",
						foreignField: "_id",
						as: "artists",
					},
				},
				{
					$lookup: {
						from: "genres",
						localField: "genres",
						foreignField: "_id",
						as: "genres",
					},
				},
			]

			const randomAlbums = await Album.aggregate(pipeline)

			if (randomAlbums.length === 0) {
				return response.status(404).json({
					status: "error",
					message: "No albums found",
				})
			}

			response.status(200).json({
				status: "ok",
				response: randomAlbums,
			})
		},
	}
