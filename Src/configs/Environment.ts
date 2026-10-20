import dotenv from 'dotenv'

dotenv.config()

const required = (name: string): string => {
	const value = process.env[name]
	if (!value) throw new Error(`${name} is required`)
	return value
}

const environment = {
	port: Number(process.env.PORT ?? 3100),
	corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
	dbUrl: required('DB_URL'),
	firebaseProjectId: required('FIREBASE_PROJECT_ID'),
	firebaseClientEmail: required('FIREBASE_CLIENT_EMAIL'),
	firebasePrivateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),

}

export default environment

