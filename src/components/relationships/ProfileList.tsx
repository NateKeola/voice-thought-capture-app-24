
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';

const REL_TYPE_COLORS = {
  work: 'bg-blue-100 text-blue-600',
  client: 'bg-purple-100 text-purple-600',
  personal: 'bg-green-100 text-green-600',
  default: 'bg-gray-100 text-gray-600'
};

interface ProfileListProps {
  profiles: Profile[];
  isLoading: boolean;
  selectedProfile: Profile | null;
  onSelectProfile: (profile: Profile) => void;
  onAddProfile: () => void;
}

export function ProfileList({
  profiles,
  isLoading,
  selectedProfile,
  onSelectProfile,
  onAddProfile
}: ProfileListProps) {
  return (
    <div className="w-1/3 bg-white rounded-2xl shadow-sm overflow-y-auto">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-bold text-gray-800 text-lg">People</h2>
        <Button
          size="sm"
          variant="ghost"
          className="hover:bg-orange-100 hover:text-orange-500"
          onClick={onAddProfile}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : profiles.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No relationships found</p>
            <Button
              size="sm"
              className="mt-4 w-full bg-orange-500 text-white"
              onClick={onAddProfile}
            >
              Add New Contact
            </Button>
          </div>
        ) : (
          profiles.map(profile => (
            <div
              key={profile.id}
              className={`p-4 cursor-pointer hover:bg-orange-50 transition-colors ${
                selectedProfile?.id === profile.id ? 'bg-orange-50' : ''
              }`}
              onClick={() => onSelectProfile(profile)}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                  <span className="text-orange-600 font-bold text-lg">
                    {`${profile.first_name[0]}${profile.last_name[0]}`}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-800 font-medium">
                      {`${profile.first_name} ${profile.last_name}`}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      REL_TYPE_COLORS[profile.type.toLowerCase() as keyof typeof REL_TYPE_COLORS] || REL_TYPE_COLORS.default
                    }`}>
                      {profile.type}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-gray-500 text-xs">
                      Added: {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
