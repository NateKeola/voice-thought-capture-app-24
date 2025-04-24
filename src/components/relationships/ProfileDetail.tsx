
import React from 'react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/hooks/useProfiles';
import { Memo } from '@/types';

const MEMO_TYPE_COLORS = {
  task: 'bg-purple-100 text-purple-600',
  should: 'bg-orange-100 text-orange-500',
  note: 'bg-blue-100 text-blue-600',
};

interface ProfileDetailProps {
  profile: Profile | null;
  memos: Memo[];
  onAddMemo: () => void;
}

export function ProfileDetail({ profile, memos, onAddMemo }: ProfileDetailProps) {
  const getMemoTypeColor = (type: string) => 
    MEMO_TYPE_COLORS[type as keyof typeof MEMO_TYPE_COLORS] || MEMO_TYPE_COLORS.note;

  const getMemoTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'should':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (!profile) {
    return (
      <div className="w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p className="mt-4 text-gray-500">Select a relationship to view and add memos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
            <span className="text-orange-600 font-bold">{`${profile.first_name[0]}${profile.last_name[0]}`}</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{profile.first_name} {profile.last_name}</h2>
            <p className="text-gray-500 text-xs">Added: {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <Button
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg flex items-center"
          onClick={onAddMemo}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Memo
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {memos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No memos for this relationship yet</p>
              <p className="text-sm mt-1">Click "Add Memo" to create one</p>
            </div>
          ) : (
            memos.map((memo, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getMemoTypeColor(memo.type)}`}>
                    {getMemoTypeIcon(memo.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm">{memo.text}</p>
                    <div className="flex justify-between mt-2">
                      <p className="text-gray-400 text-xs">{new Date(memo.createdAt).toLocaleDateString()}</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${getMemoTypeColor(memo.type)}`}>
                        {memo.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
