import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { Lyrics } from "../../schemas"
import auth from "../../middleware/auth"
import { upload } from "../../middleware/upload"
import mongoose from "mongoose"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [upload.none(), auth],
			handler: async (request: Request, response: Response) => {
				if (request.body.user.role != "admin") {
					return response.status(403).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				if (!mongoose.Types.ObjectId.isValid(request.body.songId)) {
					return response.status(400).json({
						status: "error",
						message: "Invalid song id",
					})
				}

				if (!request.body.synced) {
					return response.status(400).json({
						status: "error",
						message: "Synced is required",
					})
				}

				if (!request.body.lyrics) {
					return response.status(400).json({
						status: "error",
						message: "Lyrics is required",
					})
				}

				if (await Lyrics.findOne({ songId: request.body.songId })) {
					return response.status(400).json({
						status: "error",
						message: "Lyrics already exists",
					})
				}

				let lyrics = new Lyrics({
					songId: request.body.songId,
					synced: request.body.synced,
					lyrics: request.body.lyrics,
				})

				await lyrics.save()

				response.status(201).json({
					status: "ok",
					response: lyrics,
				})
			},
		},
		put: {
			middleware: [upload.none(), auth],
			handler: async (request: Request, response: Response) => {
				if (request.body.user.role != "admin") {
					return response.status(403).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				if (
					!mongoose.Types.ObjectId.isValid(request.query.id as string)
				) {
					return response.status(400).json({
						status: "error",
						message: "Invalid id",
					})
				}

				let lyrics = await Lyrics.findOne({
					songId: request.query.id as string,
				})

				if (!lyrics) {
                    lyrics = new Lyrics({
                        songId: request.query.id as string
                    })
				}

				if (request.body.synced != undefined)
					lyrics.synced = request.body.synced
				if (request.body.lyrics) lyrics.lyrics = request.body.lyrics

				await lyrics.save()

				response.status(200).json({
					status: "ok",
					response: lyrics,
				})
			},
		},
		delete: {
			middleware: [auth],
			handler: async (request: Request, response: Response) => {
				if (request.body.user.role != "admin") {
					return response.status(403).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				if (
					!mongoose.Types.ObjectId.isValid(request.query.id as string)
				) {
					return response.status(400).json({
						status: "error",
						message: "Invalid id",
					})
				}

				await Lyrics.findOneAndDelete({
					songId: request.query.id as string,
				})

				response.status(200).json({
					status: "ok",
					message: "Lyrics deleted",
				})
			},
		},
	}
