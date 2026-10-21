import type { Types } from 'mongoose'

export declare namespace ILocationModule {
	interface ILocation {
		_id: Types.ObjectId
		userId: Types.ObjectId
		city: string
		state: string
		latitude?: number
		longitude?: number
		createdAt?: Date
		updatedAt?: Date
	}

	interface IUpdateLocation {
		city: string
		state: string
		latitude?: number
		longitude?: number
	}
}
