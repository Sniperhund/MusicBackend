import { v4 as uuidv4 } from "uuid"
import { log } from "./logger"

export default async function logError(message: string) {
	const errorId = uuidv4()

	log.error({
		id: errorId,
		error: message,
	})

	return errorId
}
