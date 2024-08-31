import multer from "multer"
const SharpMulter: any = require("sharp-multer")
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

const uploadDir = process.env.UPLOAD_DIR || "public"

const track = multer.diskStorage({
	destination: function (req: any, file: any, cb: any) {
		fs.mkdirSync(uploadDir + "/track", { recursive: true })

		cb(null, uploadDir + "/track")
	},
	filename: function (req: any, file: any, cb: any) {
		const uuid = uuidv4()

		cb(
			null,
			uuid + file.originalname.slice(file.originalname.lastIndexOf("."))
		)
	},
})

export const trackUpload = multer({ storage: track })

const albumCover = SharpMulter({
	destination: function (req: any, file: any, cb: any) {
		fs.mkdirSync(uploadDir + "/albumCover", { recursive: true })

		cb(null, uploadDir + "/albumCover")
	},
	filename: function (currentFilename: any, options: any) {
		const uuid = uuidv4()

		return uuid + currentFilename.slice(currentFilename.lastIndexOf("."))
	},
	imageOptions: {
		fileFormat: "webp",
		quality: 100,
		resize: { width: 500, height: 500 },
	},
})

export const albumCoverUpload = multer({ storage: albumCover })

const artistCover = SharpMulter({
	destination: function (req: any, file: any, cb: any) {
		fs.mkdirSync(uploadDir + "/artistCover", { recursive: true })

		cb(null, uploadDir + "/artistCover")
	},
	filename: function (currentFilename: any, options: any) {
		const uuid = uuidv4()

		return uuid + currentFilename.slice(currentFilename.lastIndexOf("."))
	},
	imageOptions: {
		fileFormat: "webp",
		quality: 100,
		resize: { width: 500, height: 500 },
	},
})

export const artistCoverUpload = multer({ storage: artistCover })

// Use this for getting fields
const storage = multer.memoryStorage()
export const upload = multer({ storage: storage })
