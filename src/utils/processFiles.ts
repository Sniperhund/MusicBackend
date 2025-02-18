import Ffmpeg from "fluent-ffmpeg"
import path from "path"
import { log } from "./logger"
import fs from "fs"

const uploadDir = process.env.UPLOAD_DIR || "public"

export const processAudio = async (filePath: string) => {
	try {
		if (filePath === undefined) {
			log.warn("A file was not processed because it was not provided")
			return
		}

		const fileDir = path.dirname(filePath)
		const fileName = path.basename(filePath).split(".")[0]

		fs.mkdirSync(uploadDir + "/track/low", { recursive: true })
		fs.mkdirSync(uploadDir + "/track/mid", { recursive: true })
		fs.mkdirSync(uploadDir + "/track/low-aac", { recursive: true })
		fs.mkdirSync(uploadDir + "/track/mid-aac", { recursive: true })

		const outputLowMp3 = path.join(fileDir, `low/${fileName}.mp3`)
		const outputMidMp3 = path.join(fileDir, `mid/${fileName}.mp3`)
		const outputLowAAC = path.join(fileDir, `low-aac/${fileName}.m4a`)
		const outputMidAAC = path.join(fileDir, `mid-aac/${fileName}.m4a`)

		await Promise.all([
			new Promise((resolve, reject) => {
				Ffmpeg(filePath)
					.audioBitrate("128k")
					.toFormat("mp3")
					.audioCodec("libmp3lame")
					.on("end", resolve)
					.on("error", reject)
					.save(outputLowMp3)
			}),
			new Promise((resolve, reject) => {
				Ffmpeg(filePath)
					.audioBitrate("256k")
					.toFormat("mp3")
					.audioCodec("libmp3lame")
					.on("end", resolve)
					.on("error", reject)
					.save(outputMidMp3)
			}),
			new Promise((resolve, reject) => {
				Ffmpeg(filePath)
					.audioBitrate("96k")
					.toFormat("mp4")
					.audioCodec("aac")
					.on("end", resolve)
					.on("error", reject)
					.save(outputLowAAC)
			}),
			new Promise((resolve, reject) => {
				Ffmpeg(filePath)
					.audioBitrate("192k")
					.toFormat("mp4")
					.audioCodec("aac")
					.on("end", resolve)
					.on("error", reject)
					.save(outputMidAAC)
			}),
		])
	} catch (err) {
		log.warn(
			"A error happened when trying to process file: ",
			filePath,
			err
		)
	}
}
