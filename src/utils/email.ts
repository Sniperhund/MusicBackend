import nodemailer from "nodemailer"

if (
	!(
		process.env.SMTP_HOST &&
		process.env.SMTP_PORT &&
		process.env.SMTP_ENCRYPTION &&
		process.env.SMTP_USERNAME &&
		process.env.SMTP_PASSWORD &&
		process.env.SMTP_EMAIL
	)
) {
	throw new Error("SMTP is not configured")
}

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: process.env.SMTP_ENCRYPTION === "true", // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USERNAME,
		pass: process.env.SMTP_PASSWORD,
	},
})

export default async function sendMail(options: {
	to: string
	subject: string
	html: string
}) {
	const response = await transporter.sendMail({
		from: process.env.SMTP_EMAIL,
		to: options.to,
		subject: options.subject,
		html: options.html,
	})
}
