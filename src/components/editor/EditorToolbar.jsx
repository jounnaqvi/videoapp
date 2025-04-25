import { 
  FaFont, 
  FaImage, 
  FaMusic, 
  FaDownload,
  FaSave
} from 'react-icons/fa'

const EditorToolbar = ({ activeTool, toggleTool, tools }) => {
  return (
    <div className="flex flex-col border-b border-editor-border">
      <div className="p-4 border-b border-editor-border">
        <h3 className="font-medium mb-2">Tools</h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => toggleTool(tools.TEXT)}
            className={`flex flex-col items-center justify-center p-3 rounded-md ${
              activeTool === tools.TEXT 
                ? 'bg-primary-900/50 text-primary-400 border border-primary-600' 
                : 'bg-editor-darker hover:bg-editor-light'
            }`}
          >
            <FaFont className="text-xl mb-1" />
            <span className="text-xs">Text</span>
          </button>
          
          <button
            onClick={() => toggleTool(tools.IMAGE)}
            className={`flex flex-col items-center justify-center p-3 rounded-md ${
              activeTool === tools.IMAGE 
                ? 'bg-primary-900/50 text-primary-400 border border-primary-600' 
                : 'bg-editor-darker hover:bg-editor-light'
            }`}
          >
            <FaImage className="text-xl mb-1" />
            <span className="text-xs">Image</span>
          </button>
          
          <button
            onClick={() => toggleTool(tools.AUDIO)}
            className={`flex flex-col items-center justify-center p-3 rounded-md ${
              activeTool === tools.AUDIO 
                ? 'bg-primary-900/50 text-primary-400 border border-primary-600' 
                : 'bg-editor-darker hover:bg-editor-light'
            }`}
          >
            <FaMusic className="text-xl mb-1" />
            <span className="text-xs">Audio</span>
          </button>
          
          <button
            onClick={() => toggleTool(tools.EXPORT)}
            className={`flex flex-col items-center justify-center p-3 rounded-md ${
              activeTool === tools.EXPORT 
                ? 'bg-primary-900/50 text-primary-400 border border-primary-600' 
                : 'bg-editor-darker hover:bg-editor-light'
            }`}
          >
            <FaDownload className="text-xl mb-1" />
            <span className="text-xs">Export</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditorToolbar