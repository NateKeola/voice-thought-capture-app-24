
import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileIconButton: React.FC = () => {
  const userName = localStorage.getItem('userName') || 'MJ';
  const initials = userName
    .split(' ')
    .map(n => (n && n[0]) || '')
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const navigate = useNavigate();

  return (
    <button
      aria-label="Go to Profile"
      onClick={() => navigate("/profile")}
      className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center ml-2"
    >
      <span className="text-orange-600 font-bold text-sm">{initials}</span>
    </button>
  );
};

export default ProfileIconButton;
