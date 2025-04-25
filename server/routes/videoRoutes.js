import express from 'express'
import { uploadVideo } from '../controllers/videoController.js'

const router = express.Router()

router.route('/upload')
  .post(uploadVideo)

export default router