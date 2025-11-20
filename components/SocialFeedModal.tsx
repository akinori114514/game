
import React from 'react';
import { useGame } from '../context/GameContext';
import { X, MessageCircle, Repeat, Heart, Share } from 'lucide-react';

export const SocialFeedModal = () => {
  const { gameState, closeSocialPost, replyToSocialPost } = useGame();
  const post = gameState.active_social_post;

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
           <h3 className="font-bold text-slate-200 text-lg">Post</h3>
           <button onClick={closeSocialPost} className="p-2 hover:bg-slate-900 rounded-full text-slate-400 hover:text-white">
               <X size={20} />
           </button>
        </div>

        {/* Tweet Content */}
        <div className="p-4">
            <div className="flex gap-3">
                <div className={`w-12 h-12 rounded-full ${post.avatar_color} flex-shrink-0`}></div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{post.author_name}</span>
                        <span className="text-slate-500">{post.handle}</span>
                    </div>
                    <p className="text-slate-200 text-xl mt-2 leading-normal">
                        {post.content}
                    </p>
                </div>
            </div>
            
            <div className="text-slate-500 text-sm mt-4 pb-4 border-b border-slate-800">
                {new Date().toLocaleTimeString()} · Twitter for iPhone
            </div>

            <div className="flex items-center gap-6 py-4 border-b border-slate-800 text-slate-500 text-sm">
                <div><span className="font-bold text-white">{post.retweets}</span> Retweets</div>
                <div><span className="font-bold text-white">{post.likes}</span> Likes</div>
            </div>

            {/* Interaction Icons */}
            <div className="flex justify-around py-3 border-b border-slate-800 text-slate-500">
                <MessageCircle size={20} />
                <Repeat size={20} />
                <Heart size={20} />
                <Share size={20} />
            </div>
        </div>

        {/* Actions (Reply Options) */}
        {post.reply_options && post.reply_options.length > 0 && (
            <div className="p-4 bg-slate-900/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Reply as @BurnRateCEO</h4>
                <div className="space-y-3">
                    {post.reply_options.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => replyToSocialPost(opt.id)}
                            className="w-full text-left p-4 rounded-xl border border-slate-700 bg-black hover:bg-slate-900 hover:border-indigo-500 transition-all group"
                        >
                            <div className="font-bold text-white group-hover:text-indigo-400">{opt.label}</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {opt.riskDescription}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
