import { Request, Response, NextFunction } from "express"
import { User } from "../schemas"

const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let user = await User.findOne({ accessToken: req.headers.authorization })

	if (!user) return res.status(401).json({ message: "Unauthorized" })

	if (user.accessTokenExpire < new Date(Date.now()))
		return res.status(406).json({ message: "Access token expired" })

	req.body.user = user

	next()
}

export default authenticate
