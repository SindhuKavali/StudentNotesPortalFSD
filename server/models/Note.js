const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String, required: true },
  semester: { type: String, required: true },
  branch: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }],
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Text index for advanced search
noteSchema.index({ subjectCode: 'text', subject: 'text', title: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);
