import type { Types } from 'mongoose'

export declare namespace ILocation {
	interface Model {
		_id: Types.ObjectId
		userId: Types.ObjectId
		city: string
		state: string
		latitude?: number
		longitude?: number
		createdAt?: Date
		updatedAt?: Date
	}

	interface UpdateObj {
		city: string
		state: string
		latitude?: number
		longitude?: number
	}
}
