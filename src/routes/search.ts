import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import authenticate from "../middleware/auth"
import { Album, Artist, Track } from "../schemas"

enum SearchType {
	TRACK = "track",
	ALBUM = "album",
	ARTIST = "artist",
	DEFAULT = "default", // All of the above
}

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const { q: query, type } = request.query

			if (!query) {
				return response
					.status(400)
					.json({ error: "Query parameter is required" })
			}

			const regex = new RegExp(query as string, "i") // Create a case-insensitive regex
			let results: any[] = []

			switch (type) {
				case SearchType.TRACK:
					results = await Track.find({
						$or: [
							{ name: { $regex: regex } },
							{
								$and: [
									{ "album.name": { $regex: regex } },
									{ name: { $regex: regex } },
								],
							},
							{
								$and: [
									{ "artists.name": { $regex: regex } },
									{ name: { $regex: regex } },
								],
							},
						],
					})
						.populate("album")
						.populate("artists")
					break
				case SearchType.ALBUM:
					results = await Album.find({
						$or: [
							{ name: { $regex: regex } },
							{
								$and: [
									{ "artists.name": { $regex: regex } },
									{ name: { $regex: regex } },
								],
							},
						],
					})
						.populate("artists")
						.populate("genres")
					break
				case SearchType.ARTIST:
					results = await Artist.find({ name: { $regex: regex } })
					break
				case SearchType.DEFAULT:
				default:
					const trackResults = await Track.find({
						$or: [
							{ name: { $regex: regex } },
							{
								$and: [
									{ "album.name": { $regex: regex } },
									{ name: { $regex: regex } },
								],
							},
							{
								$and: [
									{ "artists.name": { $regex: regex } },
									{ name: { $regex: regex } },
								],
							},
						],
					})
						.populate("album")
						.populate("artists")

					const albumResults = await Album.find({
						$or: [
							{ name: { $regex: regex } },
							{
								$and: [
									{ "artists.name": { $regex: regex } },
									{ name: { $regex: regex } },
								],
							},
						],
					})
						.populate("artists")
						.populate("genres")

					const artistResults = await Artist.find({
						name: { $regex: regex },
					})

					results = [
						...trackResults,
						...albumResults,
						...artistResults,
					]
					break
			}

			response.status(200).json({
				status: "ok",
				response: results,
			})
		},
	}
