import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import auth from "../../middleware/auth"
import { User } from "../../schemas"
import { upload } from "../../middleware/upload"
import mongoose, { ObjectId } from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none(), auth],
		get: async (request: Request, response: Response) => {
			const limit: number = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			if (isNaN(limit) || limit < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid limit",
				})
			}

			const offset = request.query.offset
				? parseInt(request.query.offset as string)
				: 0

			if (isNaN(offset) || offset < 0) {
				return response.status(400).json({
					status: "error",
					message: "Invalid offset",
				})
			}

			const savedTracks = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate({
					path: "savedTracks",
					options: {
						limit: limit,
						skip: offset,
					},
					populate: {
						path: "artists album",
						options: {
							strictPopulate: false,
						},
					},
				})

			if (!savedTracks) {
				return response.status(400).json({
					status: "error",
					message: "No saved tracks found",
				})
			}

			response.status(200).json({
				status: "ok",
				response: savedTracks.savedTracks,
			})
		},
		put: async (request: Request, response: Response) => {
			let songIds = request.body.ids
			const songId = request.body.id

			if (!(songIds || songId)) {
				return response.status(400).json({
					status: "error",
					message: "Id(s) are required",
				})
			}

			if (songIds) {
				if (!Array.isArray(songIds)) {
					return response.status(400).json({
						status: "error",
						message: "Ids must be an array",
					})
				}

				for (let id of songIds) {
					if (!mongoose.Types.ObjectId.isValid(id)) {
						return response.status(400).json({
							status: "error",
							message: "Invalid id",
						})
					}
				}
			} else {
				if (!mongoose.Types.ObjectId.isValid(songId)) {
					return response.status(400).json({
						status: "error",
						message: "Invalid id",
					})
				}

				songIds = [songId]
			}

			const user = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate("savedTracks")

			if (!user) {
				return response.status(400).json({
					status: "error",
					message: "The user was not found",
				})
			}

			for (let id of songIds) {
				if (
					!user.savedTracks.find(
						(song: any) => song._id.toString() === id
					)
				) {
					user.savedTracks.push(id)
				}
			}

			await user.save()

			response.status(200).json({
				status: "ok",
				response: {},
			})
		},
		delete: async (request: Request, response: Response) => {
			let songIds = request.body.ids
			const songId = request.body.id

			if (!(songIds || songId)) {
				return response.status(400).json({
					status: "error",
					message: "Id(s) are required",
				})
			}

			if (songIds) {
				if (!Array.isArray(songIds)) {
					return response.status(400).json({
						status: "error",
						message: "Ids must be an array",
					})
				}

				for (let id of songIds) {
					if (!mongoose.Types.ObjectId.isValid(id)) {
						return response.status(400).json({
							status: "error",
							message: "Invalid id",
						})
					}
				}
			} else {
				if (!mongoose.Types.ObjectId.isValid(songId)) {
					return response.status(400).json({
						status: "error",
						message: "Invalid id",
					})
				}

				songIds = [songId]
			}

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
				response: {},
			})
		},
	}
