import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { Resend } from "resend"
import { v4 as uuidv4 } from "uuid"
import validator from "validator"
import { log } from "../../utils/logger"
import { upload } from "../../middleware/upload"

export default (express: Application) =>
	<Resource>{
		middleware: [upload.none()],
		post: async (request: Request, response: Response) => {
			if (!validator.isEmail(request.body.email)) {
				return response.status(400).json({
					status: "error",
					message: "Email is invalid",
				})
			}

			/**
			 * minLength: 8
			 * minLowercase: 1
			 * minUppercase: 1
			 * minNumbers: 1
			 * minSymbols: 1
			 * returnScore: false
			 * pointsPerUnique: 1
			 * pointsPerRepeat: 0.5
			 * pointsForContainingLower: 10
			 * pointsForContainingUpper: 10
			 * pointsForContainingNumber: 10
			 * pointsForContainingSymbol: 10
			 */
			if (!validator.isStrongPassword(request.body.password)) {
				return response.status(400).json({
					status: "error",
					message: "Password is too weak",
				})
			}

			if (!request.body.name) {
				return response.status(400).json({
					status: "error",
					message: "Name is required",
				})
			}

			if (process.env.TEST) {
				log.warn("Test mode is enabled")

				let user = new User({
					name: request.body.name,
					email: request.body.email.toLowerCase(),
					password: request.body.password,
					verifyToken: uuidv4(),
					accessToken: uuidv4(),
					accessTokenExpire: new Date(
						Date.now() + 60 * 60 * 24 * 7 * 1000
					),
					refreshToken: uuidv4(),
					role: "admin",
				})

				await user.save()

				return response.status(201).json({
					status: "ok",
					response: {
						message:
							"Test mode is enabled, please disable if not in testing",
						user,
					},
				})
			}

			let user = await User.findOne({
				email: request.body.email.toLowerCase(),
			})

			if (user) {
				return response.status(400).json({
					status: "error",
					message: "Email already in use",
				})
			}

			const uuid = uuidv4()

			user = new User({
				name: request.body.name,
				email: request.body.email.toLowerCase(),
				password: request.body.password,
				verifyToken: uuid,
			})

			await user.save()

			const frontendUrl = request.body.frontendUrl

			if (process.env.RESEND_API_KEY && frontendUrl) {
				const resend = new Resend(process.env.RESEND_API_KEY)

				resend.emails.send({
					from: "noreply@lucasskt.dk",
					to: request.body.email,
					subject: "Verify your email",
					html:
						'<p>Congrats on creating an account <a href="' +
						frontendUrl +
						"?q=" +
						uuid +
						'">Verify here.</a></p>',
				})
			} else if (!process.env.RESEND_API_KEY) {
				log.error("RESEND_API_KEY is not set")
			} else if (!frontendUrl) {
				log.error("Frontend URL is not set")
			}

			return response.status(201).json({
				status: "ok",
			})
		},
	}
