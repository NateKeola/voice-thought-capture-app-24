
import React, { useState } from 'react';
import { useMemos } from '@/contexts/MemoContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { renderProfileIcon } from '@/utils/iconRenderer';

interface MemoStatsTableProps {
  isOpen: boolean;
  onClose: () => void;
}

const MemoStatsTable: React.FC<MemoStatsTableProps> = ({ isOpen, onClose }) => {
  const { memos } = useMemos();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  if (!isOpen) return null;

  const filteredMemos = memos.filter(memo => {
    if (filter === 'completed') return memo.completed;
    if (filter === 'pending') return !memo.completed;
    return true;
  });

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'todo': 'check-circle',
      'idea': 'lightbulb',
      'note': 'file-text',
      'reminder': 'bell',
      'should': 'arrow-right'
    };
    return iconMap[type] || 'file-text';
  };

  const getStatusColor = (completed: boolean) => {
    return completed ? 'text-green-600' : 'text-orange-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Memo Details</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              All ({memos.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded text-sm ${filter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Completed ({memos.filter(m => m.completed).length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded text-sm ${filter === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Pending ({memos.filter(m => !m.completed).length})
            </button>
            <button
              onClick={onClose}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[60vh]">
          {filteredMemos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No memos found for the selected filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-32">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemos.map((memo) => (
                  <TableRow key={memo.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center justify-center text-gray-500">
                        {renderProfileIcon(getTypeIcon(memo.type))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {memo.text.substring(0, 100)}
                          {memo.text.length > 100 && '...'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize mt-1">
                          {memo.type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${getStatusColor(memo.completed)}`}>
                        {memo.completed ? 'Completed' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {format(new Date(memo.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoStatsTable;
