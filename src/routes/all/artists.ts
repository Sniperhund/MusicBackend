import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Artist } from "../../schemas"
import auth from "../../middleware/auth"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			const limit = request.query.limit
				? parseInt(request.query.limit as string)
				: 0

			if (isNaN(limit) || limit < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid limit",
				})
			}

			const skip = request.query.offset
				? parseInt(request.query.offset as string)
				: 0

			if (isNaN(skip) || skip < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid offset",
				})
			}

			const artists = await Artist.find({}).limit(limit).skip(skip)

			if (!artists) {
				return response.status(404).json({
					status: "error",
					message: "Artists not found",
				})
			}

			return response.status(200).json({
				status: "ok",
				response: artists,
			})
		},
	}
