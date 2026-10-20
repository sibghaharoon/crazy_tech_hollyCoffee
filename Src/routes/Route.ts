import { Router } from 'express'
import authRoute from './user.Route'

const router = Router()
router.use('/api/v1/user', authRoute)


export default router

