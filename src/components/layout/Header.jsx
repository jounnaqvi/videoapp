import { Link, useLocation } from 'react-router-dom'
import { FaVideo, FaPlus } from 'react-icons/fa'

const Header = () => {
  const location = useLocation()
  const isEditor = location.pathname.includes('/editor')

  return (
    <header className="bg-editor-dark border-b border-editor-border shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <FaVideo className="text-primary-500 text-2xl" />
          <span className="text-xl font-bold text-editor-text">VidCraft</span>
        </Link>
        
        <nav>
          <ul className="flex space-x-4">
            {!isEditor && (
              <li>
                <Link 
                  to="/new" 
                  className="btn-primary flex items-center"
                >
                  <FaPlus className="mr-2" />
                  New Project
                </Link>
              </li>
            )}
            {isEditor && (
              <li>
                <Link to="/" className="btn-secondary">
                  Back to Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header