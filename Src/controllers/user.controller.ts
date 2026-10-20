import type { Request, Response } from 'express'
import type { IUser } from '../interfaces/IUser'
import type { ILocation } from '../interfaces/ILocation'
import type { AuthenticatedUser } from '../middlewares/Passport'
import LocationRepository from '../repositories/Location.Repository'
import parseProfileUpdate from '../validators/Profile.Validator'
import UserRepository from '../repositories/User.Repository'

const toProfileResponse = (user: AuthenticatedUser, location: ILocation.Model | null): ProfileResponse => ({
	id: user._id,
	name: user.name ?? null,
	email: user.email ?? null,
	phoneNumber: user.phoneNumber ?? null,
	photoUrl: user.photoUrl ?? null,
	location,
	role: user.role ?? 'buyer',
	status: user.status ?? 'active',
})

type ProfileResponse = {
	id: AuthenticatedUser['_id']
	name: string | null
	email: string | null
	phoneNumber: string | null
	photoUrl: string | null
	location: ILocation.Model | null
	role: IUser.Role
	status: IUser.Status
}

const userController = {
	async getProfile(req: Request, res: Response) {
		const user = req.user
		if (!user) {
			return res.status(401).json({ success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' })
		}
		const location = await LocationRepository.findByUserId(user._id)
		return res.status(200).json({
			success: true,
			data: toProfileResponse(user, location),
		})
	},

	async updateMe(req: Request, res: Response) {
		const parsed = parseProfileUpdate(req.body)
		if (!parsed.success) return res.status(400).json(parsed)

		const actorUserId = req.user?._id
		if (!actorUserId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
				code: 'AUTH_REQUIRED',
			})
		}

		const user = await UserRepository.updateById(actorUserId, parsed.data)
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
				code: 'USER_NOT_FOUND',
			})
		}
		const location = await LocationRepository.findByUserId(user._id)

		return res.status(200).json({
			success: true,
			data: toProfileResponse(user, location),
		})
	},
}

export default userController

