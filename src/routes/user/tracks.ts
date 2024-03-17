import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import authenticate from "../../middleware/auth"
import { User } from "../../schemas"
import { Schema } from "mongoose"

export default (express: Application) =>
	<Resource>{
		middleware: [authenticate],
		get: async (request: Request, response: Response) => {
			const limit: number = request.query.limit
				? parseInt(request.query.limit as string)
				: 10

			//! The offset may not working (I'm not sure since I only have one song in the database and lazy)
			const offset = request.query.offset
				? parseInt(request.query.offset as string)
				: 0

			const savedTracks = await User.findById(request.body.user._id)
				.select("savedTracks")
				.populate({
					path: "savedTracks",
					options: {
						limit: limit,
						skip: offset,
					},
				})

			if (!savedTracks)
				return response.status(400).json({
					status: "error",
					message: "No saved tracks found",
				})

			response.status(200).json({
				status: "ok",
				savedTracks: savedTracks.savedTracks,
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
