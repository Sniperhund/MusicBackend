import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Artist } from "../../schemas"
import auth from "../../middleware/auth"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			const artists = await Artist.find({})

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
