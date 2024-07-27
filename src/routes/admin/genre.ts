import { Application, Request, Response, response } from "express"
import { Resource } from "express-automatic-routes"
import { Album, Genre } from "../../schemas"
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

				if (!request.body.name) {
					return response.status(400).json({
						status: "error",
						message: "Name is required",
					})
				}

				const genreExists = await Genre.findOne({
					name: request.body.name,
				})

				if (genreExists) {
					return response.status(400).json({
						status: "error",
						message: "Genre already exists",
					})
				}

				let genre = new Genre({
					name: request.body.name,
				})

				await genre.save()

				response.status(201).json({
					status: "ok",
					response: genre,
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

				const genre = await Genre.findById(request.query.id)

				if (!genre) {
					return response.status(404).json({
						status: "error",
						message: "Genre not found",
					})
				}

				if (request.body.name) genre.name = request.body.name

				await genre.save()

				response.status(200).json({
					status: "ok",
					response: genre,
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

				const genre = await Genre.findById(request.query.id)

				if (!genre) {
					return response.status(404).json({
						status: "error",
						message: "Genre not found",
					})
				}

				if ((await Album.find({ genres: genre._id })).length != 0) {
					return response.status(400).json({
						status: "error",
						message: "Genre is in use",
					})
				}

				await Genre.findByIdAndDelete(request.query.id)

				response.status(200).json({
					status: "ok",
					message: "Genre deleted",
				})
			},
		},
	}
