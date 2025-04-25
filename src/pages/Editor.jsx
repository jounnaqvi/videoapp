import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import EditorToolbar from '../components/editor/EditorToolbar'
import Timeline from '../components/editor/Timeline'
import VideoPreview from '../components/editor/VideoPreview'
import TextOverlayPanel from '../components/editor/TextOverlayPanel'
import ImageOverlayPanel from '../components/editor/ImageOverlayPanel'
import AudioPanel from '../components/editor/AudioPanel'
import ExportPanel from '../components/editor/ExportPanel'

// Tools enum
const TOOLS = {
  NONE: 'none',
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  EXPORT: 'export'
}

const Editor = () => {
  const { projectId } = useParams()
  const { getProject, updateProject, loading, error } = useProject()
  const [project, setProject] = useState(null)
  const [activeTool, setActiveTool] = useState(TOOLS.NONE)
  const [timelineItems, setTimelineItems] = useState([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const videoRef = useRef(null)
  const saveTimeoutRef = useRef(null)

  // Fetch project data
  useEffect(() => {
    const loadProject = async () => {
      const projectData = await getProject(projectId)
      if (projectData) {
        setProject(projectData)

        if (projectData.timeline) {
          setTimelineItems(projectData.timeline)
        } else {
          setTimelineItems([{
            id: 'base-video',
            type: 'video',
            src: projectData.videoUrl,
            start: 0,
            end: 100,
            track: 0,
          }])
        }
      }
    }

    loadProject()
  }, [projectId])

  // Auto-save on timeline update
  useEffect(() => {
    if (!project || timelineItems.length === 0) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        await updateProject(projectId, { timeline: timelineItems })
      } catch (err) {
        console.error('Error saving project:', err)
      } finally {
        setIsSaving(false)
      }
    }, 2000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [timelineItems, project])

  // Tool panel toggle
  const toggleTool = (tool) => {
    setActiveTool(activeTool === tool ? TOOLS.NONE : tool)
  }

  const addTextOverlay = (textData) => {
    const newItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: textData.text,
      style: textData.style,
      position: textData.position,
      start: currentTime,
      end: currentTime + 5,
      track: 1,
    }
    setTimelineItems([...timelineItems, newItem])
  }

  const addImageOverlay = (imageData) => {
    const newItem = {
      id: `image-${Date.now()}`,
      type: 'image',
      src: imageData.src,
      position: imageData.position,
      size: imageData.size,
      start: currentTime,
      end: currentTime + 5,
      track: 2,
    }
    setTimelineItems([...timelineItems, newItem])
  }

  const addAudio = (audioData) => {
    const newItem = {
      id: `audio-${Date.now()}`,
      type: 'audio',
      src: audioData.src,
      volume: audioData.volume,
      start: currentTime,
      end: currentTime + audioData.duration,
      track: 3,
    }
    setTimelineItems([...timelineItems, newItem])
  }

  const updateTimelineItem = (id, updates) => {
    setTimelineItems(timelineItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const removeTimelineItem = (id) => {
    setTimelineItems(timelineItems.filter(item => item.id !== id))
  }

  const handleExport = async (exportSettings) => {
    console.log("Exporting with settings:", exportSettings)
  }

  if (loading && !project) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl animate-pulse">Loading editor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-200 px-4 py-3 rounded">
          Project not found
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-y-auto">
      {/* Status Bar */}
      <div className="bg-editor-dark px-4 py-1 text-sm flex justify-between items-center border-b border-editor-border">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{project.title}</span>
          {isSaving && <span className="text-editor-muted text-xs">Saving...</span>}
        </div>
        <div>
          {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Preview & Timeline Area */}
        <div className="w-full md:w-3/4 flex flex-col overflow-y-auto">
          <VideoPreview
            videoRef={videoRef}
            project={project}
            timelineItems={timelineItems}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            duration={duration}
            setDuration={setDuration}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />

          <div className="flex-shrink-0">
            <Timeline
              items={timelineItems}
              updateItem={updateTimelineItem}
              removeItem={removeTimelineItem}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              duration={duration}
            />
          </div>
        </div>

        {/* Tools Panel */}
        <div className="w-full md:w-1/4 bg-editor-dark border-l border-editor-border overflow-y-auto">
          <div className="sticky top-0 z-10 bg-editor-dark">
            <EditorToolbar
              activeTool={activeTool}
              toggleTool={toggleTool}
              tools={TOOLS}
            />
          </div>

          {activeTool === TOOLS.TEXT && (
            <TextOverlayPanel onAdd={addTextOverlay} />
          )}

          {activeTool === TOOLS.IMAGE && (
            <ImageOverlayPanel onAdd={addImageOverlay} />
          )}

          {activeTool === TOOLS.AUDIO && (
            <AudioPanel onAdd={addAudio} />
          )}

          {activeTool === TOOLS.EXPORT && (
            <ExportPanel onExport={handleExport} project={project} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Editor;