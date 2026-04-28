import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Download, ThumbsUp, ThumbsDown, MessageSquare, Clock, ArrowLeft, ExternalLink, Eye, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { AuthContext } from '../context/AuthContext';
import FileViewer from '../components/FileViewer';

export default function NoteDetails() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchNote = async () => {
    try {
      const [noteRes, recRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/notes/${id}`),
        axios.get(`http://localhost:5000/api/notes/${id}/recommendations`)
      ]);
      setNote(noteRes.data);
      setRecommendations(recRes.data);
      
      if (user) {
        try {
          const voteRes = await axios.get(`http://localhost:5000/api/votes/check/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setUserVote(voteRes.data.voteType);
        } catch (voteErr) {
          console.error("Error fetching vote status:", voteErr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [id, user]);

  const handleVote = async (type) => {
    if (!user) return alert('Please login to vote');
    try {
      await axios.post('http://localhost:5000/api/votes', 
        { noteId: id, voteType: type },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchNote(); // Refresh to get updated counts
    } catch (err) {
      alert(err.response?.data?.message || 'Error voting');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to comment');
    if (!commentText.trim()) return;

    try {
      await axios.post(`http://localhost:5000/api/notes/${id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setCommentText('');
      fetchNote();
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting comment');
    }
  };

  const handleCommentVote = async (commentId, type) => {
    if (!user) return alert('Please login to vote');
    try {
      const res = await axios.post(`http://localhost:5000/api/notes/${id}/comments/${commentId}/vote`, 
        { voteType: type },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNote(prev => ({ ...prev, comments: res.data }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error voting on comment');
    }
  };

  const handleDownload = async () => {
    try {
      // 1. Increment download count in DB
      await axios.get(`http://localhost:5000/api/notes/download/${id}`);
      setNote(prev => ({ ...prev, downloads: prev.downloads + 1 }));
      
      // 2. Fetch file as blob to force browser download
      const response = await axios.get(`http://localhost:5000${note.fileUrl}`, {
        responseType: 'blob'
      });
      
      // 3. Create invisible link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get original filename or set default
      const filename = note.fileUrl.split('-').slice(1).join('-') || 'study-material';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download the file directly. Attempting to open in a new tab instead.");
      window.open(`http://localhost:5000${note.fileUrl}`, '_blank');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!note) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-slate-800">Note not found</h2>
      <Link to="/browse" className="text-blue-600 mt-4 inline-block hover:underline">Back to Browse</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/browse" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Note Header Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">{note.subjectCode}</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-800 text-sm font-medium rounded-full">{note.branch}</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-800 text-sm font-medium rounded-full">Sem {note.semester}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">{note.title}</h1>
            <p className="text-lg text-slate-600 font-medium mb-6">{note.subject}</p>
            
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                  {note.uploadedBy?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{note.uploadedBy?.name || 'Unknown User'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {format(new Date(note.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button onClick={() => handleVote('upvote')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white hover:text-emerald-600 hover:shadow-sm transition-all text-sm font-medium ${userVote === 'upvote' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'}`}>
                    <ThumbsUp className={`w-4 h-4 ${userVote === 'upvote' ? 'fill-current' : ''}`} /> {note.upvotes}
                  </button>
                  <div className="w-px bg-slate-200 my-1"></div>
                  <button onClick={() => handleVote('downvote')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white hover:text-red-600 hover:shadow-sm transition-all text-sm font-medium ${userVote === 'downvote' ? 'bg-red-50 text-red-600' : 'text-slate-600'}`}>
                    <ThumbsDown className={`w-4 h-4 ${userVote === 'downvote' ? 'fill-current' : ''}`} /> {note.downvotes}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{note.description || 'No description provided.'}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {note.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 text-sm border border-slate-200 rounded-lg">#{tag}</span>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl shadow-sm shadow-blue-200 transition-colors flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> Download File ({note.downloads})
              </button>
              <button onClick={() => setShowPreview(true)} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium py-3 px-6 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2">
                <Eye className="w-5 h-5" /> Preview File
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" /> Discussion ({note.comments.length})
            </h3>
            
            {user ? (
              <form onSubmit={handleComment} className="mb-8">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <textarea 
                      rows="2" 
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button type="submit" disabled={!commentText.trim()} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center mb-8">
                <p className="text-sm text-slate-600"><Link to="/login" className="text-blue-600 font-medium hover:underline">Log in</Link> to join the discussion.</p>
              </div>
            )}

            <div className="space-y-6">
              {note.comments.map((comment, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-sm">
                    {comment.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-slate-900">{comment.user?.name || 'Unknown User'}</span>
                      <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                    </div>
                    <p className="text-slate-700 text-sm mb-3">{comment.text}</p>
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleCommentVote(comment._id, 'like')} className={`flex items-center gap-1 text-xs font-medium transition-colors ${comment.likes?.includes(user?._id) ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600'}`}>
                        <ThumbsUp className={`w-3 h-3 ${comment.likes?.includes(user?._id) ? 'fill-current' : ''}`} /> {comment.likes?.length || 0}
                      </button>
                      <button onClick={() => handleCommentVote(comment._id, 'dislike')} className={`flex items-center gap-1 text-xs font-medium transition-colors ${comment.dislikes?.includes(user?._id) ? 'text-red-600' : 'text-slate-500 hover:text-red-600'}`}>
                        <ThumbsDown className={`w-3 h-3 ${comment.dislikes?.includes(user?._id) ? 'fill-current' : ''}`} /> {comment.dislikes?.length || 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {note.comments.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-4">No comments yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Similar Notes</h3>
            <div className="space-y-4">
              {recommendations.length > 0 ? recommendations.map(rec => (
                <Link key={rec._id} to={`/notes/${rec._id}`} className="group block">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 line-clamp-2 mb-1">{rec.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{rec.subjectCode}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-emerald-500" /> {rec.upvotes}</span>
                  </p>
                </Link>
              )) : (
                <p className="text-sm text-slate-500">No similar notes found.</p>
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-sm p-6 text-white text-center">
            <h3 className="font-bold text-lg mb-2">Got useful notes?</h3>
            <p className="text-blue-100 text-sm mb-4">Help out your peers by sharing your study materials.</p>
            <Link to="/upload" className="inline-block w-full bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
              Upload Now
            </Link>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" /> Document Preview
              </h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-100/50">
              <FileViewer fileUrl={note.fileUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
