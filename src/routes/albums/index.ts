import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Album } from "../../schemas"

export default (express: Application) =>
	<Resource>{
		get: async (request: Request, response: Response) => {
			let errorHappened = false

			if (!request.body.ids) {
				response.status(422).json({ message: "ids is required" })
				errorHappened = true
			}

			const albums = await Album.find({
				_id: { $in: request.body.ids },
			})
				.populate("artist")
				.catch((error) => {
					response.status(500).json({ message: error.message })
					errorHappened = true
				})

			if (errorHappened) return

			response.status(200).json(albums)
		},
	}
