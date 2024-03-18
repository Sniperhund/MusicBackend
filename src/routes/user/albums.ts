import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import authenticate from "../../middleware/auth"
import { Album, User } from "../../schemas"
import { Schema } from "mongoose"
import album from "../admin/album"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const limit: number = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			const savedTracksIds = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate("savedTracks")

			if (!savedTracksIds)
				return response.status(400).json({
					status: "error",
					message: "No saved albums found",
				})

			const albumIds: any[] = savedTracksIds.savedTracks.map(
				(track: any) => {
					return track.album
				}
			)

			const savedAlbums = await Album.find({
				_id: { $in: albumIds },
			})

			response.status(200).json({
				status: "ok",
				savedAlbums,
			})
		},
		put: async (request: Request, response: Response) => {
			const songIds = request.body.ids

			const user = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate("savedTracks")

			if (!user)
				return response.status(400).json({
					status: "error",
					message: "The user was not found",
				})

			songIds.forEach(async (id: string) => {
				if (!user.savedTracks.includes(id as any)) {
					user.savedTracks.push(id as any)
				}
			})

			await user.save()

			response.status(200).json({
				status: "ok",
			})
		},
		delete: async (request: Request, response: Response) => {
			const songIds = request.body.ids

			const user = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate("savedTracks")

			if (!user)
				return response.status(400).json({
					status: "error",
					message: "The user was not found",
				})

			user.savedTracks = user.savedTracks.filter((id: any) => {
				return !songIds.includes(id._id.toString())
			})

			await user.save()

			response.status(200).json({
				status: "ok",
			})
		},
	}
