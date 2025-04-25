import express from 'express'
import { 
  uploadImageHandler,
  uploadAudioHandler
} from '../controllers/assetController.js'

const router = express.Router()

router.route('/upload')
  .post(uploadImageHandler)

router.route('/upload-audio')
  .post(uploadAudioHandler)

export default router