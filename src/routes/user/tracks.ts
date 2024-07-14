import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import auth from "../../middleware/auth"
import { User } from "../../schemas"
import { upload } from "../../middleware/upload"
import mongoose from "mongoose"

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
			const songIds = request.body.ids

			if (!songIds) {
				return response.status(400).json({
					status: "error",
					message: "Ids are required",
				})
			}

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

			const user = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate("savedTracks")

			if (!user) {
				return response.status(400).json({
					status: "error",
					message: "The user was not found",
				})
			}

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

			if (!songIds) {
				return response.status(400).json({
					status: "error",
					message: "Ids are required",
				})
			}

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
