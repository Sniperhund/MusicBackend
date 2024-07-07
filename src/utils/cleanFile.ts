import fs from "fs"
import { log } from "./logger"

export default async function cleanFile(fileName: string) {
	try {
		await fs.promises.unlink(fileName)
		log.info("A file was cleaned: ", fileName)
	} catch (err) {
		log.warn("A error happened when trying to clean file: ", fileName, err)
	}
}
