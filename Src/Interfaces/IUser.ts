export declare namespace IUser {
	type Role = 'buyer' | 'seller' | 'admin'
	type Status = 'active' | 'inactive'

	interface CreateObj {
		firebaseUid: string
		name?: string
		email?: string
		phoneNumber?: string
		photoUrl?: string
		role?: Role
		status?: Status
	}

	interface UpdateObj {
		name?: string
		photoUrl?: string
	}
}

