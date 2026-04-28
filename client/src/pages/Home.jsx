import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Download, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-white opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Share Knowledge, <span className="text-blue-600">Ace Exams</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              The centralized platform for college students to upload, discover, and download top-rated study materials, previous papers, and academic guides.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/browse" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                Browse Notes <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-xl font-semibold text-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2">
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to succeed</h2>
            <p className="mt-4 text-lg text-slate-600">Built by students, for students.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Search</h3>
              <p className="text-slate-600">
                Instantly find notes by subject, semester, or branch. Our powerful search makes finding the right material effortless.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Community Rated</h3>
              <p className="text-slate-600">
                Not sure if the notes are good? Check the upvotes! Popular and highly-rated study materials always surface to the top.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Easy Access</h3>
              <p className="text-slate-600">
                Preview PDFs directly in your browser or download them for offline studying. Accessible anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to share your knowledge?</h2>
          <p className="text-blue-100 text-lg mb-10">
            Join thousands of students who are already exchanging notes and improving their grades.
          </p>
          <Link to="/register" className="inline-block bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
