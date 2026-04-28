import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, ThumbsUp, Download, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function BrowseNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [sort, setSort] = useState('recent');
  const [hints, setHints] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(-1);

  const fetchNotes = async (overrideSearch = null) => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/notes', {
        params: { 
          search: overrideSearch !== null ? overrideSearch : search, 
          branch, 
          semester, 
          sort 
        }
      });
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [branch, semester, sort]);

  useEffect(() => {
    const fetchHints = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/notes/meta/hints');
        setHints(data);
      } catch (err) {
        console.error("Error fetching hints:", err);
      }
    };
    fetchHints();
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchNotes();
    setShowHints(false);
  };

  const filteredHints = search.trim()
    ? hints.filter((h, index, self) => 
        h.toLowerCase().startsWith(search.trim().toLowerCase()) &&
        self.findIndex(item => item.toLowerCase() === h.toLowerCase()) === index
      )
    : [];

  useEffect(() => {
    setActiveHintIndex(-1);
  }, [search]);

  const handleKeyDown = (e) => {
    if (!showHints || filteredHints.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveHintIndex(prev => (prev < filteredHints.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveHintIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (activeHintIndex >= 0 && activeHintIndex < filteredHints.length) {
        e.preventDefault();
        const selectedHint = filteredHints[activeHintIndex];
        setSearch(selectedHint);
        setShowHints(false);
        fetchNotes(selectedHint);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Browse Materials</h1>
          <p className="text-slate-500 mt-1">Discover notes shared by the community</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by subject, code, or tags..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowHints(true);
              }}
              onFocus={() => setShowHints(true)}
              onBlur={() => setTimeout(() => setShowHints(false), 200)}
              onKeyDown={handleKeyDown}
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Search
            </button>
          </form>
          {showHints && search.trim() && filteredHints.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredHints.map((hint, index) => (
                <li 
                  key={index} 
                  className={`px-4 py-2.5 cursor-pointer text-sm border-b border-slate-50 last:border-0 ${index === activeHintIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearch(hint);
                    setShowHints(false);
                    fetchNotes(hint);
                  }}
                  onMouseEnter={() => setActiveHintIndex(index)}
                >
                  {hint}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800">Filters</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full rounded-lg border-slate-300 border py-2.5 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option value="">All Branches</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">IT</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full rounded-lg border-slate-300 border py-2.5 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num.toString()}>Semester {num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-lg border-slate-300 border py-2.5 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Note Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-white h-64 rounded-2xl border border-slate-200"></div>
              ))}
            </div>
          ) : notes.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {notes.map(note => (
                <div key={note._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col group overflow-hidden">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {note.subjectCode}
                      </span>
                      <div className="flex items-center text-slate-400 text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(note.createdAt))} ago
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                      <Link to={`/notes/${note._id}`}>{note.title}</Link>
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">{note.subject}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {note.uploadedBy?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm text-slate-600 text-ellipsis overflow-hidden whitespace-nowrap">
                        {note.uploadedBy?.name || 'Unknown User'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {note.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4 text-emerald-500" /> {note.upvotes}</span>
                      <span className="flex items-center gap-1.5"><Download className="w-4 h-4 text-blue-500" /> {note.downloads}</span>
                    </div>
                    <Link to={`/notes/${note._id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      View <BookOpen className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No notes found</h3>
              <p className="text-slate-500 max-w-sm">We couldn't find any materials matching your search. Try adjusting your filters or search terms.</p>
              <button onClick={() => {setSearch(''); setBranch(''); setSemester('');}} className="mt-6 text-blue-600 font-medium hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
