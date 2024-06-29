import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Artist } from "../../schemas"
import auth from "../../middleware/auth"

export default (express: Application) =>
	<Resource>{
		middleware: [auth],
		get: async (request: Request, response: Response) => {
			try {
				const artists = await Artist.find({})

				return response.status(200).json(artists)
			} catch (error) {
				if (typeof error === "object" && error && "message" in error) {
					return response.status(500).json({ message: error.message })
				} else {
					return response
						.status(500)
						.json({ message: "An unknown error occurred" })
				}
			}
		},
	}
