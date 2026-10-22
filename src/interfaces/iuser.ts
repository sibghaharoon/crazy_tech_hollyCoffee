import type { Types } from 'mongoose'

export declare namespace IUserModule {
	type Role = 'buyer' | 'seller' | 'admin'
	type Status = 'active' | 'inactive'
	type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

	interface ICreateUser {
		firebaseUid: string
		name?: string
		email?: string
		phoneNumber?: string
		gender?: Gender
		dob?: Date
		profileImage?: string
		profileImageKey?: string
		locationId?: Types.ObjectId
		role?: Role
		status?: Status
	}

	interface IUpdateUser {
		name?: string
		gender?: Gender
		dob?: Date
		profileImage?: string
		profileImageKey?: string
	}

	interface ProfileResponse {
		id: Types.ObjectId
		name: string | null
		email: string | null
		phoneNumber: string | null
		gender: Gender | null
		dob: Date | null
		profileImage: string | null
		role: Role
		status: Status
	}
}

