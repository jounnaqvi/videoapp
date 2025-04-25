import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlus, FaEdit, FaTrash, FaPlay,FaVideo} from 'react-icons/fa'
import { useProject } from '../context/ProjectContext'

const Dashboard = () => {
  const { projects, loading, error, fetchProjects, deleteProject } = useProject()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDeleteClick = (project) => {
    setProjectToDelete(project)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete._id)
      setIsDeleteModalOpen(false)
      setProjectToDelete(null)
    }
  }

  if (loading && projects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Projects</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse-slow text-xl text-editor-muted">Loading projects...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Projects</h1>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Project Card */}
        <Link 
          to="/new" 
          className="panel h-64 flex flex-col items-center justify-center hover:border-primary-500 transition-colors duration-200"
        >
          <FaPlus className="text-primary-500 text-4xl mb-4" />
          <h3 className="text-xl font-medium">Create New Project</h3>
        </Link>
        
        {/* Project Cards */}
        {projects.map((project) => (
          <div key={project._id} className="panel overflow-hidden">
            <div className="h-36 bg-editor-darker relative overflow-hidden">
              {project.thumbnail ? (
                <img 
                  src={`http://localhost:5000${project.thumbnail}`} 
                  alt={project.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-editor-darker">
                  <FaVideo className="text-editor-muted text-5xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-editor-darker to-transparent opacity-70"></div>
            </div>
            
            <div className="p-4">
              <h3 className="text-xl font-medium mb-2">{project.title}</h3>
              <p className="text-editor-muted text-sm mb-4">{project.description || 'No description'}</p>
              
              <div className="flex justify-between items-center">
                <Link to={`/editor/${project._id}`} className="btn-primary flex items-center text-sm">
                  <FaEdit className="mr-1" /> Edit Project
                </Link>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleDeleteClick(project)}
                    className="p-2 text-editor-muted hover:text-red-500 transition-colors"
                  >
                    <FaTrash />
                  </button>
                  {project.outputUrl && (
                    <Link 
                      to={`http://localhost:5000${project.outputUrl}`} 
                      target="_blank"
                      className="p-2 text-editor-muted hover:text-primary-500 transition-colors"
                    >
                      <FaPlay />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="panel p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Project</h3>
            <p className="mb-6">
              Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard