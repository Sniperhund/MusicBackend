import dotenv from "dotenv"
import express, { Application, Express, Request, Response } from "express"
import autoroutes from "express-automatic-routes"
import mongoose from "mongoose"

//For env File
dotenv.config()

async function main() {
	await mongoose.connect("mongodb://localhost:27017/test").catch(console.log)

	const app: Application = express()
	const port = process.env.PORT || 8000

	autoroutes(app, {
		dir: "./routes/",
	})

	app.use(express.static("public"))

	app.listen(port, () => {
		console.log(`Server is started at http://localhost:${port}`)
	})
}

main()
