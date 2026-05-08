"use client";

import { useState } from "react";
import { Search, Download, Trash2, ExternalLink, Clock, Calendar } from "lucide-react";
import Image from "next/image";

// Mock saved summaries data
const savedSummaries = [
  { id: 1, title: "The Art of Focus", source: "Cal Newport Podcast", date: "2 hours ago", length: "4m 32s", cover: "/cover1.jpg" },
  { id: 2, title: "GPT-5 and the Future", source: "Lex Fridman Podcast", date: "Yesterday", length: "6m 18s", cover: "/cover2.jpg" },
  { id: 3, title: "Dopamine Detox", source: "Andrew Huberman", date: "3 days ago", length: "3m 45s", cover: "/cover3.jpg" },
  { id: 4, title: "Crypto Market Analysis", source: "Bankless", date: "1 week ago", length: "8m 12s", cover: "/cover4.jpg" },
  { id: 5, title: "Startup Fundraising", source: "Y Combinator", date: "1 week ago", length: "5m 22s", cover: "/cover5.jpg" },
];

// Podcast covers for marquee
const recentShows = [
  { title: "Huberman Lab", cover: "/cover1.jpg" },
  { title: "Lex Fridman", cover: "/cover2.jpg" },
  { title: "The Joe Rogan Experience", cover: "/cover3.jpg" },
  { title: "The Daily", cover: "/cover4.jpg" },
  { title: "The Tim Ferriss Show", cover: "/cover5.jpg" },
  { title: "Planet Money", cover: "/cover6.jpg" },
  { title: "Radiolab", cover: "/cover7.jpg" },
  { title: "How I Built This", cover: "/cover8.jpg" },
  { title: "The Knowledge Project", cover: "/cover9.jpg" },
  { title: "Invest Like the Best", cover: "/cover10.jpg" },
];

export default function LibraryView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 p-8 flex flex-col h-full">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Your Knowledge Vault</h2>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past briefs..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-all"
          />
        </div>
      </div>

      {/* Recent Shows Marquee */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Recent Shows</h3>
        <div className="space-y-3">
          {/* Row 1 */}
          <div className="flex gap-4 overflow-hidden">
            <div className="flex gap-4 animate-marquee-slow">
              {[...recentShows, ...recentShows].map((show, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 w-24 h-24 bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group"
                >
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-xs text-zinc-500 group-hover:scale-110 transition-transform">
                    {show.title.slice(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Row 2 */}
          <div className="flex gap-4 overflow-hidden">
            <div className="flex gap-4 animate-marquee-slow-reverse">
              {[...recentShows.slice().reverse(), ...recentShows.slice().reverse()].map((show, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group"
                >
                  <div className="w-full h-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center text-xs text-zinc-500 group-hover:scale-110 transition-transform">
                    {show.title.slice(0, 6)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Row 3 */}
          <div className="flex gap-4 overflow-hidden">
            <div className="flex gap-4 animate-marquee-slow">
              {[...recentShows.slice(3), ...recentShows.slice(3)].map((show, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group"
                >
                  <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-[10px] text-zinc-500 group-hover:scale-110 transition-transform">
                    {show.title.slice(0, 5)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Briefs List */}
      <div className="flex-1">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Saved Briefs</h3>
        
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider border-b border-white/5">
          <div>Title/Source</div>
          <div>Date</div>
          <div>Length</div>
          <div>Action</div>
        </div>
        
        {/* Table Rows */}
        <div className="space-y-1">
          {savedSummaries.map((summary) => (
            <div 
              key={summary.id}
              className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-4 py-4 items-center text-sm hover:bg-white/[0.02] transition-colors border-b border-white/5"
            >
              {/* Title/Source */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-lg flex items-center justify-center text-xs text-zinc-500">
                  {summary.title.slice(0, 2)}
                </div>
                <div>
                  <div className="text-white font-medium">{summary.title}</div>
                  <div className="text-zinc-500 text-xs">{summary.source}</div>
                </div>
              </div>
              
              {/* Date */}
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Calendar size={12} />
                {summary.date}
              </div>
              
              {/* Length */}
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock size={12} />
                {summary.length}
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <Download size={14} />
                </button>
                <button className="p-2 text-zinc-400 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-all">
                  <ExternalLink size={14} />
                </button>
                <button className="p-2 text-zinc-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
