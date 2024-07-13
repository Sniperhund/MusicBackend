import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Artist } from "../../schemas"
import auth from "../../middleware/auth"
import mongoose from "mongoose"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			if (!request.body.ids) {
				return response.status(400).json({
					status: "error",
					message: "Ids are required",
				})
			}

			if (request.body.ids && !Array.isArray(request.body.ids)) {
				return response.status(400).json({
					status: "error",
					message: "Ids must be an array",
				})
			}

			for (let id of request.body.ids) {
				if (!mongoose.Types.ObjectId.isValid(id)) {
					return response.status(400).json({
						status: "error",
						message: "Invalid id",
					})
				}
			}

			const artists = await Artist.find({
				_id: { $in: request.body.ids },
			})

			if (artists.length == 0) {
				return response.status(404).json({
					status: "error",
					message: "No artists found",
				})
			}

			response.status(200).json({
				status: "ok",
				response: artists,
			})
		},
	}
