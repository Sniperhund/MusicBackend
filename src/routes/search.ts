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
			const { q: query, type, limit } = request.query

			if (!query) {
				return response
					.status(400)
					.json({ error: "Query parameter is required" })
			}

			// Escape special characters in the query string
			const escapeRegExp = (string: string) => {
				return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
			}

			let regex: RegExp
			try {
				regex = new RegExp(escapeRegExp(query as string), "i") // Create a case-insensitive regex
			} catch (e) {
				console.error(e)
				return response.status(400).json({
					error: "Invalid regular expression in query parameter",
				})
			}

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
					let trackResults = await Track.find({
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

					let albumResults = await Album.find({
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

					let artistResults = await Artist.find({
						name: { $regex: regex },
					})

					trackResults = trackResults.map((track: any) => ({
						...track.toJSON(),
						type: SearchType.TRACK,
					}))

					albumResults = albumResults.map((album: any) => ({
						...album.toJSON(),
						type: SearchType.ALBUM,
					}))

					artistResults = artistResults.map((artist: any) => ({
						...artist.toJSON(),
						type: SearchType.ARTIST,
					}))

					results = [
						...trackResults,
						...albumResults,
						...artistResults,
					]

					results = results.splice(
						0,
						parseInt(limit as string) || results.length
					)

					break
			}

			response.status(200).json({
				status: "ok",
				response: results,
			})
		},
	}
