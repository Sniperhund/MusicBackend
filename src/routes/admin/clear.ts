import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { artistCoverUpload } from "../../middleware/upload"
import { Artist, Album, Track, Genre, User } from "../../schemas"

export default (express: Application) =>
	<Resource>{
		get: {
			middleware: [artistCoverUpload.single("file")],
			handler: async (request: Request, response: Response) => {
				if (process.env.TEST) {
					await Promise.all([
						Artist.deleteMany({}),
						Album.deleteMany({}),
						Track.deleteMany({}),
						Genre.deleteMany({}),
						User.deleteMany({}),
						// Add other models as necessary
					])

					return response.status(200).json({
						message: "All data has been deleted.",
					})
				}

				return response.status(500).json({
					message: "This can only be used in test mode :(",
				})
			},
		},
	}
