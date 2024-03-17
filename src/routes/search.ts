import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import authenticate from "../middleware/auth"
import { Album, Artist, Track } from "../schemas"

enum SearchType {
	TRACK = "track",
	ALBUM = "album",
	ARTIST = "artist",
	DEFAULT = "default",
}

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			let type: SearchType = request.query.type
				? (request.query.type as SearchType)
				: SearchType.DEFAULT

			let artistResult: any[] = []
			let albumResult: any[] = []
			let trackResult: any[] = []

			const limit = request.query.limit
				? parseInt(request.query.limit as string)
				: 12

			//TODO: Implement a better search function
			switch (type) {
				case SearchType.DEFAULT:
					const nonTrackLimit = limit / 6

					let tempResult: any[] = []

					tempResult = await Artist.find({
						$text: { $search: request.query.q as string },
					}).limit(nonTrackLimit)
					if (tempResult.length > 0) artistResult.push(...tempResult)

					tempResult = await Album.find({
						$text: { $search: request.query.q as string },
					}).limit(nonTrackLimit)
					if (tempResult.length > 0) albumResult.push(...tempResult)

					tempResult = await Track.find({
						$text: { $search: request.query.q as string },
					}).limit(limit - nonTrackLimit * 2)
					if (tempResult.length > 0) trackResult.push(...tempResult)

					break
				case SearchType.ARTIST:
					artistResult = await Artist.find({
						$text: { $search: request.query.q as string },
					}).limit(limit)
					break
				case SearchType.ALBUM:
					albumResult = await Album.find({
						$text: { $search: request.query.q as string },
					}).limit(limit)
					break
				case SearchType.TRACK:
					trackResult = await Track.find({
						$text: { $search: request.query.q as string },
					}).limit(limit)
					break
			}

			response.status(200).json({
				status: "ok",
				artistResult,
				albumResult,
				trackResult,
			})
		},
	}
