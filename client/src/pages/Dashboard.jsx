import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Download, ThumbsUp, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [myNotes, setMyNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyNotes = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/notes/dashboard', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMyNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyNotes();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`http://localhost:5000/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchMyNotes();
      } catch (err) {
        alert('Error deleting note');
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-xl text-slate-600">Please login to view dashboard.</p>
      </div>
    );
  }

  const totalDownloads = myNotes.reduce((acc, note) => acc + note.downloads, 0);
  const totalUpvotes = myNotes.reduce((acc, note) => acc + note.upvotes, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">My Uploads</p>
            <p className="text-2xl font-bold text-slate-900">{myNotes.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Downloads</p>
            <p className="text-2xl font-bold text-slate-900">{totalDownloads}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Upvotes</p>
            <p className="text-2xl font-bold text-slate-900">{totalUpvotes}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">My Uploaded Materials</h2>
          <Link to="/upload" className="text-sm font-medium text-blue-600 hover:underline">
            Upload New +
          </Link>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading your materials...</div>
        ) : myNotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-sm font-medium text-slate-500">
                  <th className="px-6 py-4">Title & Subject</th>
                  <th className="px-6 py-4">Uploaded On</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myNotes.map((note) => (
                  <tr key={note._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/notes/${note._id}`} className="font-bold text-slate-900 hover:text-blue-600 block line-clamp-1">{note.title}</Link>
                      <span className="text-sm text-slate-500">{note.subjectCode} • {note.subject}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(note.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><Download className="w-4 h-4 text-slate-400" /> {note.downloads}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-slate-400" /> {note.upvotes}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleDelete(note._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No uploads yet</h3>
            <p className="text-slate-500 mb-6">You haven't shared any study materials with the community yet.</p>
            <Link to="/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Upload Material
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
