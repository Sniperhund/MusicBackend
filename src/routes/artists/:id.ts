import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Artist } from "../../schemas"
import authenticate from "../../middleware/auth"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			try {
				const artist = await Artist.findById(request.params.id)

				response.status(200).json(artist)
			} catch (error) {
				if (typeof error === "object" && error && "message" in error) {
					return response.status(404).json({ message: error.message })
				} else {
					return response
						.status(500)
						.json({ message: "An unknown error occurred" })
				}
			}
		},
	}
