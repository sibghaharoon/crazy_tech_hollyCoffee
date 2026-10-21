import { Router } from 'express'
import authRoute from './user.route'
import locationRoute from './location.route'
import categoryRoute from './category.route'


const router = Router()
router.use('/api/v1/user', authRoute)
router.use('/api/v1/user', locationRoute)
router.use('/api/v1/categories', categoryRoute)


export default router

