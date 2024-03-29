import { Application, Request, Response } from "express"
import { Resource } from "express-automatic-routes"
import { User } from "../../schemas"
import { Resend } from "resend"
import { v4 as uuidv4 } from "uuid"

export default (express: Application) =>
	<Resource>{
		post: async (request: Request, response: Response) => {
			const frontendUrl = request.body.frontendUrl

			const uuid = uuidv4()

			let user = new User({
				name: request.body.name,
				email: request.body.email,
				password: request.body.password,
				verifyToken: uuid,
			})

			await user.save()

			const resend = new Resend("re_AQLhfBYq_MTzDvCu3FRDvsyHcRi9kbm8P")

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
		},
	}
