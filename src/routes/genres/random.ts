import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Genre } from "../../schemas"
import authenticate from "../../middleware/auth"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const randomGenre = await Genre.aggregate([
				{ $sample: { size: 1 } },
			])

			if (randomGenre.length === 0) {
				return response.status(404).json({ error: "No genres found" })
			}

			return response.status(200).json(randomGenre[0])
		},
	}
