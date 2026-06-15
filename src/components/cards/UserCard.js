import React from 'react';
import { Link } from 'react-router-dom';

export default function UserCard({ user }) {
  const initial = user.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="bg-[#111114] rounded p-5 border border-white/[0.07] text-center hover:border-[#00D9FF]/20 hover:-translate-y-0.5 transition-all duration-200">
      {/* Avatar */}
      <div className="flex justify-center mb-3">
        <div className="w-[72px] h-[72px] rounded-full ring-2 ring-white/5 overflow-hidden bg-gradient-to-br from-brand-600 to-blue-600 flex items-center justify-center flex-shrink-0">
          {user.profile_picture_url
            ? <img src={user.profile_picture_url} alt={user.username} className="w-full h-full object-cover" />
            : <span className="text-2xl font-black text-white">{initial}</span>
          }
        </div>
      </div>

      {/* Username */}
      <p className="text-base font-bold text-white mt-1">@{user.username}</p>

      {/* Bio */}
      {user.bio && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{user.bio}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div>
          <p className="text-lg font-black text-white leading-none">{user.review_count || 0}</p>
          <p className="text-xs text-gray-600 mt-0.5">Reviews</p>
        </div>
        <div>
          <p className="text-lg font-black text-white leading-none">{user.following_count || 0}</p>
          <p className="text-xs text-gray-600 mt-0.5">Following</p>
        </div>
      </div>

      {/* Button */}
      <Link to={`/profile/${user.id}`}>
        <button className="mt-4 w-full py-2 rounded-xl bg-white/[0.05] hover:bg-brand-600 border border-white/[0.07] hover:border-brand-600 text-gray-300 hover:text-white text-xs font-semibold transition-all duration-200">
          View Profile
        </button>
      </Link>
    </div>
  );
}
