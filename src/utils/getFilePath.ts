const uploadDir = process.env.UPLOAD_DIR || "public"

export default function getFilePath(type: String, path: String) {
	switch (type) {
		case "album":
		case "Album":
			return `${uploadDir}albumCover/${path}`
		case "artist":
		case "Artist":
			return `${uploadDir}artistCover/${path}`
		case "track":
		case "Track":
		default:
			return `${uploadDir}track/${path}`
	}
}
