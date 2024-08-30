import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { Artist, Album, Track, Genre, User, Lyrics } from "../../schemas"
import fs from "fs"

const uploadDir = process.env.UPLOAD_DIR || "public"

export default (express: Application) =>
	<Resource>{
		get: {
			handler: async (request: Request, response: Response) => {
				if (process.env.TEST) {
					await Promise.all([
						Artist.deleteMany({}),
						Album.deleteMany({}),
						Track.deleteMany({}),
						Genre.deleteMany({}),
						User.deleteMany({}),
						Lyrics.deleteMany({}),
						// Add other models as necessary
					])

					await fs.rmSync(uploadDir, { recursive: true, force: true })

					return response.status(200).json({
						status: "ok",
						message: "All data has been deleted.",
					})
				}

				return response.status(500).json({
					status: "error",
					message: "This can only be used in test mode :(",
				})
			},
		},
	}
