const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   POST /api/notes/upload-note
// @access  Private
router.post('/upload-note', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, subjectCode, semester, branch, description, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype;

    const note = await Note.create({
      title,
      subject,
      subjectCode,
      semester,
      branch,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      fileUrl,
      fileType,
      uploadedBy: req.user._id
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notes/meta/hints
// @access  Public
router.get('/meta/hints', async (req, res) => {
  try {
    const tags = await Note.distinct('tags');
    const subjectCodes = await Note.distinct('subjectCode');
    const subjects = await Note.distinct('subject');
    
    const hints = [...new Set([...tags, ...subjectCodes, ...subjects])];
    res.json(hints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, branch, semester, subject, sort } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    if (branch) query.branch = branch;
    if (semester) query.semester = semester;
    if (subject) query.subject = new RegExp(subject, 'i');

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { upvotes: -1, downloads: -1 };

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name email profilePicture')
      .sort(sortOption);

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notes/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notes/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('uploadedBy', 'name email branch semester')
      .populate('comments.user', 'name profilePicture');
      
    if (note) {
      res.json(note);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notes/download/:id
// @access  Public
router.get('/download/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      note.downloads += 1;
      await note.save();
      res.json({ message: 'Download count incremented', downloads: note.downloads });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/notes/:id/comments
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const note = await Note.findById(req.params.id);
    
    if (note) {
      note.comments.push({ user: req.user._id, text });
      await note.save();
      
      const updatedNote = await Note.findById(req.params.id).populate('comments.user', 'name profilePicture');
      res.status(201).json(updatedNote.comments);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/notes/:id/comments/:commentId/vote
// @access  Private
router.post('/:id/comments/:commentId/vote', protect, async (req, res) => {
  try {
    const { voteType } = req.body; // 'like' or 'dislike'
    const note = await Note.findById(req.params.id);
    
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    const comment = note.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userId = req.user._id.toString();
    const hasLiked = comment.likes.some(id => id.toString() === userId);
    const hasDisliked = comment.dislikes.some(id => id.toString() === userId);

    comment.likes = comment.likes.filter(id => id.toString() !== userId);
    comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId);

    if (voteType === 'like' && !hasLiked) {
      comment.likes.push(req.user._id);
    } else if (voteType === 'dislike' && !hasDisliked) {
      comment.dislikes.push(req.user._id);
    }

    await note.save();
    
    // Return updated comments to frontend
    const updatedNote = await Note.findById(req.params.id).populate('comments.user', 'name profilePicture');
    res.json(updatedNote.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/notes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (note) {
      if (note.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }
      await Note.deleteOne({ _id: note._id });
      res.json({ message: 'Note removed' });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notes/:id/recommendations
// @access  Public
router.get('/:id/recommendations', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const recommendations = await Note.find({
      _id: { $ne: note._id },
      $or: [
        { subjectCode: note.subjectCode },
        { branch: note.branch, semester: note.semester }
      ]
    }).limit(4);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
