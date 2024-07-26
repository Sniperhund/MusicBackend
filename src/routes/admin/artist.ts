import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { artistCoverUpload } from "../../middleware/upload"
import { Album, Artist, Track } from "../../schemas"
import auth from "../../middleware/auth"
import cleanFile from "../../utils/cleanFile"
import mongoose from "mongoose"
import getFilePath from "../../utils/getFilePath"

export default (express: Application) =>
	<Resource>{
		post: {
			middleware: [artistCoverUpload.single("file"), auth],
			handler: async (request: Request, response: Response) => {
				const fileLocation = request.file?.path as string

				if (request.body.user.role != "admin") {
					cleanFile(fileLocation)

					return response.status(403).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				if (!request.body.name) {
					cleanFile(fileLocation)

					return response.status(400).json({
						status: "error",
						message: "Name is required",
					})
				}

				if (!request.file) {
					cleanFile(fileLocation)

					return response.status(400).json({
						status: "error",
						message: "Cover is required",
					})
				}

				let artist = new Artist({
					name: request.body.name,
					cover: request.file?.filename,
				})

				await artist.save()

				response.status(201).json({
					status: "ok",
					response: artist,
				})
			},
		},
		put: {
			middleware: [artistCoverUpload.single("file"), auth],
			handler: async (request: Request, response: Response) => {
				const fileLocation = request.file?.path as string

				if (request.body.user.role != "admin") {
					cleanFile(fileLocation)

					return response.status(403).json({
						status: "error",
						message: "Unauthorized",
					})
				}

				if (
					!mongoose.Types.ObjectId.isValid(request.query.id as string)
				) {
					cleanFile(fileLocation)

					return response.status(400).json({
						status: "error",
						message: "Invalid id",
					})
				}

				let artist = await Artist.findById(request.query.id)

				if (!artist) {
					cleanFile(fileLocation)

					return response.status(404).json({
						status: "error",
						message: "Artist not found",
					})
				}

				if (request.file) {
					artist.cover = request.file?.filename
				}

				if (request.body.name) {
					artist.name = request.body.name
				}

				await artist.save()

				response.status(200).json({
					status: "ok",
					response: artist,
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

				let artist = await Artist.findById(request.query.id)

				if (!artist) {
					return response.status(404).json({
						status: "error",
						message: "Artist not found",
					})
				}

				console.log(await Album.find({ artists: artist._id }))

				if (
					(await Album.find({ artists: artist._id })) ||
					(await Track.find({ artists: artist._id }))
				) {
					return response.status(400).json({
						status: "error",
						message: "Artist is in use",
					})
				}

				cleanFile(getFilePath("artist", artist.cover as string))

				await Artist.deleteOne({ _id: artist._id })

				response.status(200).json({
					status: "ok",
					message: "Artist deleted",
				})
			},
		},
	}
