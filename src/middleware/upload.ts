import multer from "multer"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

const track = multer.diskStorage({
	destination: function (req: any, file: any, cb: any) {
		if (!fs.existsSync("public/track")) {
			fs.mkdirSync("public/track")
		}

		cb(null, "public/track")
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
		if (!fs.existsSync("public/albumCover")) {
			fs.mkdirSync("public/albumCover")
		}

		cb(null, "public/albumCover")
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
		if (!fs.existsSync("public/artistCover")) {
			fs.mkdirSync("public/artistCover")
		}

		cb(null, "public/artistCover")
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
