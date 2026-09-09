import React from 'react';
import { useParams, Link } from 'react-router-dom';
import catalogData from '../data/srs_ui_catalog.json';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function SRSViewPage() {
  const { screenId } = useParams();
  const screen = catalogData.find(item => item.id === screenId) || catalogData[0];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col bg-slate-900 rounded-xl overflow-hidden text-white border border-slate-800 shadow-xl">
      <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold">{screen.title}</h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                {screen.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">{screen.relPath}</p>
          </div>
        </div>

        <a
          href={screen.relPath}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Fullscreen View
        </a>
      </div>

      <div className="flex-1 bg-white">
        <iframe
          src={screen.relPath}
          title={screen.title}
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
}
