import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { Resend } from "resend"
import { v4 as uuidv4 } from "uuid"

export default (express: Application) =>
	<Resource>{
		post: async (request: Request, response: Response) => {
			try {
				if (process.env.TEST) {
					console.warn("Test mode is enabled")

					let user = new User({
						name: request.body.name,
						email: request.body.email.toLowerCase(),
						password: request.body.password,
						verified: true,
						accessToken: uuidv4(),
						accessTokenExpire: new Date(
							Date.now() + 60 * 60 * 24 * 7 * 1000
						),
						refreshToken: uuidv4(),
						role: "admin",
					})

					await user.save()

					return response.status(200).json({
						status: "ok",
						message:
							"Test mode is enabled, please disable if not in testing",
						user,
					})
				}

				const frontendUrl = request.body.frontendUrl

				const uuid = uuidv4()

				let user = await User.findOne({
					email: request.body.email.toLowerCase(),
				})

				if (user)
					return response.status(400).json({
						status: "error",
						message: "Email already in use",
					})

				user = new User({
					name: request.body.name,
					email: request.body.email.toLowerCase(),
					password: request.body.password,
					verifyToken: uuid,
				})

				await user.save()

				const resend = new Resend(
					"re_AQLhfBYq_MTzDvCu3FRDvsyHcRi9kbm8P"
				)

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

				response.status(200).json({
					status: "ok",
				})
			} catch (error) {
				if (typeof error === "object" && error && "message" in error) {
					return response.status(500).json({ message: error.message })
				} else {
					return response
						.status(500)
						.json({ message: "An unknown error occurred" })
				}
			}
		},
	}
