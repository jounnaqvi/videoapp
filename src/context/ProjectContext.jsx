import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const ProjectContext = createContext()

export const useProject = () => useContext(ProjectContext)

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const API_URL = 'http://localhost:5000/api'

  // Fetch all projects
  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/projects`)
      setProjects(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create new project
  const createProject = async (projectData) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/projects`, projectData)
      setProjects([...projects, response.data])
      setError(null)
      return response.data._id
    } catch (err) {
      setError('Failed to create project')
      console.error('Error creating project:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Get project by ID
  const getProject = async (projectId) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}`)
      setCurrentProject(response.data)
      setError(null)
      return response.data
    } catch (err) {
      setError('Failed to fetch project')
      console.error('Error fetching project:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update project
  const updateProject = async (projectId, updateData) => {
    setLoading(true)
    try {
      const response = await axios.put(`${API_URL}/projects/${projectId}`, updateData)
      
      // Update projects list
      setProjects(projects.map(project => 
        project._id === projectId ? response.data : project
      ))
      
      // Update current project if it's the one being edited
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(response.data)
      }
      
      setError(null)
      return response.data
    } catch (err) {
      setError('Failed to update project')
      console.error('Error updating project:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Delete project
  const deleteProject = async (projectId) => {
    setLoading(true)
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`)
      setProjects(projects.filter(project => project._id !== projectId))
      
      // Clear current project if it's the one being deleted
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(null)
      }
      
      setError(null)
      return true
    } catch (err) {
      setError('Failed to delete project')
      console.error('Error deleting project:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Upload video
  const uploadVideo = async (file, projectId) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('video', file)
    
    try {
      const response = await axios.post(
        `${API_URL}/videos/upload${projectId ? `?projectId=${projectId}` : ''}`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            // Handle upload progress if needed
          }
        }
      )
      setError(null)
      return response.data
    } catch (err) {
      setError('Failed to upload video')
      console.error('Error uploading video:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const value = {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
    uploadVideo,
    setCurrentProject
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}