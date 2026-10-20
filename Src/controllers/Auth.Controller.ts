import type { Request, Response } from 'express'
import type { IUser } from '../interfaces/IUser'
import UserRepository from '../repositories/User.Repository'

const AuthController = {
	async get(req: Request, res: Response) {
		const user = req.user
		return res.status(200).json({
			success: true,
			data: {
				id: user?._id,
				firebaseUid: user?.firebaseUid,
				name: user?.name ?? null,
				email: user?.email ?? null,
				phoneNumber: user?.phoneNumber ?? null,
				photoUrl: user?.photoUrl ?? null,
				role: user?.role ?? 'buyer',
				status: user?.status ?? 'active',
			},
		})
	},

	async updateMe(req: Request, res: Response) {
		const body = req.body as unknown
		if (!body || typeof body !== 'object' || Array.isArray(body)) {
			return res.status(400).json({
				success: false,
				message: 'Request body must be an object',
				code: 'INVALID_BODY',
			})
		}

		const input = body as Record<string, unknown>
		const allowedFields = ['name', 'photoUrl']
		const unknownFields = Object.keys(input).filter(
			(field) => !allowedFields.includes(field),
		)

		if (unknownFields.length > 0) {
			return res.status(400).json({
				success: false,
				message: 'Only name and photoUrl can be updated',
				code: 'INVALID_UPDATE_FIELDS',
			})
		}

		const update: IUser.UpdateObj = {}
		if ('name' in input) {
			if (typeof input.name !== 'string' || input.name.trim().length === 0) {
				return res.status(400).json({
					success: false,
					message: 'name must be a non-empty string',
					code: 'INVALID_NAME',
				})
			}
			update.name = input.name.trim()
		}

		if ('photoUrl' in input) {
			if (typeof input.photoUrl !== 'string' || input.photoUrl.trim().length === 0) {
				return res.status(400).json({
					success: false,
					message: 'photoUrl must be a non-empty string',
					code: 'INVALID_PHOTO_URL',
				})
			}
			update.photoUrl = input.photoUrl.trim()
		}

		if (Object.keys(update).length === 0) {
			return res.status(400).json({
				success: false,
				message: 'At least one profile field is required',
				code: 'EMPTY_UPDATE',
			})
		}

		const actorUserId = req.user?._id
		if (!actorUserId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
				code: 'AUTH_REQUIRED',
			})
		}

		const user = await UserRepository.updateById(actorUserId, update)
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
				code: 'USER_NOT_FOUND',
			})
		}

		return res.status(200).json({
			success: true,
			data: user,
		})
	},
}

export default AuthController

