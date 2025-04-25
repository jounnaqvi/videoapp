import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    videoUrl: {
      type: String
    },
    thumbnail: {
      type: String
    },
    timeline: {
      type: Array,
      default: []
    },
    outputUrl: {
      type: String
    },
    duration: {
      type: Number
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'completed'],
      default: 'draft'
    }
  },
  {
    timestamps: true
  }
)

const Project = mongoose.model('Project', projectSchema)

export default Project