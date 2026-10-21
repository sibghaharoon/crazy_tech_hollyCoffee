import dotenv from 'dotenv'

dotenv.config()

const required = (name: string): string => {
	const value = process.env[name]
	if (!value) throw new Error(`${name} is required`)
	return value
}

const port = Number(process.env.PORT ?? 3100)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error('PORT must be a valid TCP port')
}

const dnsServers = (process.env.DNS_SERVERS ?? '1.1.1.1,8.8.8.8')
	.split(',')
	.map((server) => server.trim())
	.filter(Boolean)

const environment = {
	port,
	corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
	dnsServers,
	dbUrl: required('DB_URL'),
	firebaseProjectId: required('FIREBASE_PROJECT_ID'),
	firebaseClientEmail: required('FIREBASE_CLIENT_EMAIL'),
	firebasePrivateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
	cloudinaryCloudName:process.env.CLOUDINARY_CLOUD_NAME,
	cloudinaryApiKey:process.env.CLOUDINARY_API_KEY,
	cloudinaryApiSecret:process.env.CLOUDINARY_API_SECRET,

}

export default environment

