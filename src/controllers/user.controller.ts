import type { Request, Response } from 'express'
import type { IUserModule } from '../interfaces/iuser'
import type { AuthenticatedUser } from '../middlewares/passport'
import parseProfileUpdate from '../validators/profile.validator'
import ProfileService from '../services/profile.service'

const toProfileResponse = (user: AuthenticatedUser): IUserModule.ProfileResponse => ({
	id: user._id,
	name: user.name ?? null,
	email: user.email ?? null,
	phoneNumber: user.phoneNumber ?? null,
	gender: user.gender ?? null,
	dob: user.dob ?? null,
	profileImage: user.profileImage ?? null,
	role: user.role ?? 'buyer',
	status: user.status ?? 'active',
})

const userController = {
	async getProfile(req: Request, res: Response) {
		const user = req.user
		if (!user) {
			return res.status(401).json({ success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' })
		}
		return res.status(200).json({
			success: true,
			data: toProfileResponse(user),
		})
	},

	async updateMe(req: Request, res: Response) {
		const parsed = parseProfileUpdate(req.body, Boolean(req.file))
		if (!parsed.success) return res.status(400).json(parsed)

		const actorUserId = req.user?._id
		if (!actorUserId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
				code: 'AUTH_REQUIRED',
			})
		}

		const user = await ProfileService.update(actorUserId, parsed.data, req.file)
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
				code: 'USER_NOT_FOUND',
			})
		}
		return res.status(200).json({
			success: true,
			data: toProfileResponse(user),
		})
	},
}

export default userController

