import fs from "fs"
import { log } from "./logger"
import path from "path"

export default async function cleanFile(fileName: string) {
	if (fileName === undefined) {
		log.warn("A file was not cleaned because it was not provided")
		return
	}

	internalCleanFile(fileName)

	const fileDir = path.dirname(fileName)
	const fileBaseName = path.basename(fileName).split(".")[0]

	const outputLow = path.join(fileDir, `/low/${fileBaseName}.mp3`)
	const outputMid = path.join(fileDir, `/mid/${fileBaseName}.mp3`)

	internalCleanFile(outputLow)
	internalCleanFile(outputMid)
}

const internalCleanFile = async (fileName: string) => {
	try {
		if (!fs.existsSync(fileName))
			return log.warn(
				"A file was not cleaned because it does not exist: ",
				fileName
			)

		await fs.promises.unlink(fileName)
		log.info("A file was cleaned: ", fileName)
	} catch (err) {
		log.warn("A error happened when trying to clean file: ", fileName, err)
	}
}
