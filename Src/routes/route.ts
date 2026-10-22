import { Router } from 'express'
import authRoute from './user.route'
import locationRoute from './location.route'
import categoryRoute from './category.route'
import productRoute from './product.route'
import cartRoute from './cart.route'


const router = Router()
router.use('/api/v1/user', authRoute)
router.use('/api/v1/user', locationRoute)
router.use('/api/v1/categories', categoryRoute)
router.use('/api/v1/products', productRoute)
router.use('/api/v1/cart', cartRoute)


export default router

