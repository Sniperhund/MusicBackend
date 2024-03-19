import { Application } from "express"
const express = require("express")
import autoroutes from "express-automatic-routes"
import mongoose from "mongoose"

async function main() {
	await mongoose.connect("mongodb://localhost:27017/test").catch(console.log)

	const app: Application = express()
	const port = process.env.PORT || 8000

	app.use(express.static("public"))
	app.use(express.json())

	autoroutes(app, {
		dir: "./routes/",
	})

	app.listen(port, () => {
		console.log(`Server is started at http://localhost:${port}`)
	})
}

main()
