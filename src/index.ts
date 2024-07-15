import { Application } from "express"
const express = require("express")
import autoroutes from "express-automatic-routes"
import mongoose from "mongoose"
import cors from "cors"
import { config } from "dotenv"
import { log } from "./utils/logger"
import logError from "./utils/logError"
import cleanFile from "./utils/cleanFile"
const swaggerUi = require("swagger-ui-express")
const fs = require("fs")
const YAML = require("yaml")
require("express-async-errors")

config()

let app: Application = express()

const uploadDir = process.env.UPLOAD_DIR || "public"

async function main() {
	if (!process.env.MONGODB_URL) throw new Error("MONGODB_URL is not defined")
	await mongoose.connect(process.env.MONGODB_URL).catch(log.info)

	const port = process.env.PORT || 8000

	app.use(cors())
	app.use(express.static(process.env.UPLOAD_DIR))
	app.use(express.urlencoded({ extended: true }))
	app.use(express.json())

	const options = { explorer: true, tryItOutEnabled: false }

	const file = fs.readFileSync("./src/swagger.yaml", "utf8")
	const swaggerDocument = YAML.parse(file)

	app.use(
		"/api-docs",
		function (req: any, res: any, next: any) {
			swaggerDocument.host = req.get("host")
			swaggerDocument.servers[0].url = `http://${swaggerDocument.host}`
			req.swaggerDoc = swaggerDocument
			next()
		},
		swaggerUi.serveFiles(swaggerDocument, options),
		swaggerUi.setup()
	)

	autoroutes(app, {
		dir: "./routes/",
	})

	app.use((error: any, request: any, response: any, next: any) => {
		if (error) {
			const id = logError(error)

			if (request.file) {
				const fileLocation = request.file?.path

				cleanFile(fileLocation)
			}

			return response.status(500).json({
				status: "error",
				errorId: id,
			})
		}

		return response.status(500).json({
			status: "error",
		})
	})

	app.listen(port, () => {
		log.info(`Server is started at ${process.env.PUBLIC_URL}`)
	})
}

main()

export default app
