import express from 'express'
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  exportProject
} from '../controllers/projectController.js'

const router = express.Router()

router.route('/')
  .get(getProjects)
  .post(createProject)

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject)

router.route('/:id/export')
  .post(exportProject)

export default router