import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Artist } from "../../schemas"
import authenticate from "../../middleware/auth"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
				return response.status(400).json({
					status: "error",
					message: "Invalid id",
				})
			}

			const artist = await Artist.findById(request.params.id)

			if (!artist) {
				return response.status(404).json({
					status: "error",
					message: "Artist not found",
				})
			}

			response.status(200).json({
				status: "ok",
				response: artist,
			})
		},
	}
