const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/votes
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { noteId, voteType } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const existingVote = await Vote.findOne({ userId: req.user._id, noteId });

    if (existingVote) {
      // User changing their vote
      if (existingVote.voteType !== voteType) {
        if (voteType === 'upvote') {
          note.upvotes += 1;
          note.downvotes -= 1;
        } else {
          note.downvotes += 1;
          note.upvotes -= 1;
        }
        existingVote.voteType = voteType;
        await existingVote.save();
        await note.save();
        return res.json({ message: 'Vote changed successfully', note });
      } else {
        // User clicking the same vote -> Undo vote
        if (voteType === 'upvote') {
          note.upvotes -= 1;
        } else {
          note.downvotes -= 1;
        }
        await Vote.deleteOne({ _id: existingVote._id });
        await note.save();
        return res.json({ message: 'Vote removed successfully', note });
      }
    } else {
      // New vote
      const vote = await Vote.create({
        userId: req.user._id,
        noteId,
        voteType
      });

      if (voteType === 'upvote') {
        note.upvotes += 1;
      } else {
        note.downvotes += 1;
      }
      await note.save();
      return res.status(201).json({ message: 'Vote added successfully', note });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/votes/check/:noteId
// @access  Private
router.get('/check/:noteId', protect, async (req, res) => {
  try {
    const vote = await Vote.findOne({ userId: req.user._id, noteId: req.params.noteId });
    res.json({ voteType: vote ? vote.voteType : null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
