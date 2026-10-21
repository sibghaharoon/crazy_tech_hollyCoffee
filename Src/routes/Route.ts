import { Router } from 'express'
import authRoute from './user.Route'
import locationRoute from './location.Route'
import categoryRoute from './category.Route'


const router = Router()
router.use('/api/v1/user', authRoute)
router.use('/api/v1/user', locationRoute)
router.use('/api/v1/categories', categoryRoute)


export default router

