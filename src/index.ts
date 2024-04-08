import { Application } from "express"
const express = require("express")
import autoroutes from "express-automatic-routes"
import mongoose from "mongoose"
import cors from "cors"

async function main() {
	if (!process.env.MONGODB_URL) throw new Error("MONGODB_URL is not defined")
	await mongoose.connect(process.env.MONGODB_URL).catch(console.log)

	const app: Application = express()
	const port = process.env.PORT || 8000

	app.use(cors())
	app.use(express.static("public"))
	app.use(express.json())

	autoroutes(app, {
		dir: "./routes/",
	})

	app.listen(port, () => {
		console.log(`Server is started at ${process.env.PUBLIC_URL}`)
	})
}

main()
