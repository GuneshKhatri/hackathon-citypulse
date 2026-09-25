import React from 'react';
import { Users, HeartHandshake, MessageSquare, ThumbsUp, Sparkles } from 'lucide-react';

export default function Community({ onShowToast }) {
  const posts = [
    {
      author: 'Rohan Sharma (C-Scheme Resident)',
      time: '20 mins ago',
      title: 'Community Sandbag Station set up near Panch Batti',
      content: 'Volunteers have set up temporary barrier sandbags to prevent shop flooding along MI Road Sector 2. Volunteers needed!',
      likes: 24,
      replies: 8
    },
    {
      author: 'Jaipur Disaster Relief Corps',
      time: '1 hour ago',
      title: 'Emergency Shelter locations active in Malviya Nagar Community Hall',
      content: 'Clean drinking water and temporary shelter available for displaced commuters.',
      likes: 56,
      replies: 14
    }
  ];

  return (
    <div className="relative z-20 min-h-screen px-4 sm:px-8 py-8 pt-24 max-w-7xl mx-auto space-y-8 text-slate-800 pointer-events-auto">
      {/* Title Banner */}
      <div className="bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 sm:p-8 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-3 animate-slide-up">
        <div className="flex items-center gap-2 text-blue-600 text-[10px] font-extrabold tracking-[0.2em] uppercase">
          <Users className="w-4 h-4" />
          <span>Jaipur Civic Community</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tighter leading-[1.1]">
          Citizen Response & Relief Network
        </h1>
        <p className="text-slate-500 text-[11px] max-w-2xl leading-relaxed font-medium">
          Peer-to-peer neighborhood alerts, volunteer dispatching, and community resilience initiatives across Jaipur wards.
        </p>
      </div>

      {/* Community Posts */}
      <div className="space-y-5 max-w-4xl">
        {posts.map((post, idx) => (
          <div key={idx} className={`bg-white/70 backdrop-blur-3xl saturate-[1.5] rounded-2xl p-6 border border-white/60 ring-1 ring-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-3 stagger-${idx + 1} premium-hover`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 flex items-center justify-center font-extrabold text-xs border border-white/60">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900">{post.author}</h4>
                  <span className="text-[9px] text-slate-400 font-semibold">{post.time}</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-50/80 text-blue-600 rounded-lg text-[9px] font-bold border border-blue-100/50">Volunteer Alert</span>
            </div>

            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">{post.title}</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{post.content}</p>

            <div className="pt-3 border-t border-slate-100/50 flex items-center gap-5 text-[11px] font-semibold text-slate-400">
              <button
                onClick={() => {
                  if (onShowToast) onShowToast({ type: 'success', message: 'Supported post!' });
                }}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-all duration-300 ease-premium cursor-pointer hover:-translate-y-0.5 active:scale-95"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="data-value">{post.likes} Upvotes</span>
              </button>

              <button
                onClick={() => {
                  if (onShowToast) onShowToast({ type: 'info', message: 'Opening community discussion thread...' });
                }}
                className="flex items-center gap-1.5 hover:text-blue-600 transition-all duration-300 ease-premium cursor-pointer hover:-translate-y-0.5 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="data-value">{post.replies} Replies</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
