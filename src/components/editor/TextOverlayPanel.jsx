import { useState } from 'react'

const TextOverlayPanel = ({ onAdd }) => {
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [fontWeight, setFontWeight] = useState('normal')
  const [color, setColor] = useState('#ffffff')
  const [shadow, setShadow] = useState(true)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!text.trim()) return
    
    onAdd({
      text: text.trim(),
      style: {
        fontSize,
        fontWeight,
        color,
        shadow
      },
      position
    })
    
    // Reset form
    setText('')
  }
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Add Text Overlay</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Text Content</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input w-full h-20 resize-none"
            placeholder="Enter your text here..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Font Size: {fontSize}px</label>
          <input
            type="range"
            min="12"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Font Weight</label>
          <select
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value)}
            className="input w-full"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Text Color</label>
          <div className="flex items-center space-x-2">
            <div 
              className="w-10 h-10 rounded border border-editor-border" 
              style={{ backgroundColor: color }}
            ></div>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input flex-1"
              placeholder="#ffffff"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={shadow}
              onChange={(e) => setShadow(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Add text shadow</span>
          </label>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Position</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-editor-muted mb-1">Horizontal: {position.x}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={position.x}
                onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-editor-muted mb-1">Vertical: {position.y}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={position.y}
                onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <button type="submit" className="btn-primary w-full">
          Add Text
        </button>
      </form>
    </div>
  )
}

export default TextOverlayPanel