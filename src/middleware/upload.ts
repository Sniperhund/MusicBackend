import multer from "multer"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

const uploadDir = process.env.UPLOAD_DIR || "public"

const track = multer.diskStorage({
	destination: function (req: any, file: any, cb: any) {
		if (!fs.existsSync(uploadDir + "/track")) {
			fs.mkdirSync(uploadDir + "/track")
		}

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

const albumCover = multer.diskStorage({
	destination: function (req: any, file: any, cb: any) {
		if (!fs.existsSync(uploadDir + "/albumCover")) {
			fs.mkdirSync(uploadDir + "/albumCover")
		}

		cb(null, uploadDir + "/albumCover")
	},
	filename: function (req: any, file: any, cb: any) {
		const uuid = uuidv4()

		cb(
			null,
			uuid + file.originalname.slice(file.originalname.lastIndexOf("."))
		)
	},
})

export const albumCoverUpload = multer({ storage: albumCover })

const artistCover = multer.diskStorage({
	destination: function (req: any, file: any, cb: any) {
		if (!fs.existsSync(uploadDir + "/artistCover")) {
			fs.mkdirSync(uploadDir + "/artistCover")
		}

		cb(null, uploadDir + "/artistCover")
	},
	filename: function (req: any, file: any, cb: any) {
		const uuid = uuidv4()

		cb(
			null,
			uuid + file.originalname.slice(file.originalname.lastIndexOf("."))
		)
	},
})

export const artistCoverUpload = multer({ storage: artistCover })
