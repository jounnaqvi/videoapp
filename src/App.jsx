import { Routes, Route, Navigate } from 'react-router-dom'
import { ProjectProvider } from './context/ProjectContext'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import NewProject from './pages/NewProject'

function App() {
  return (
    <ProjectProvider>
      <div className="flex flex-col min-h-screen bg-editor-darker text-editor-text">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewProject />} />
            <Route path="/editor/:projectId" element={<Editor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ProjectProvider>
  )
}

export default App;
