
import React from "react";

interface TaskCategoryCardProps {
  id: string;
  name: string;
  color: string;
  count: number;
  total: number;
  onSelect: (id: string) => void;
  selected: boolean;
}

const TaskCategoryCard: React.FC<TaskCategoryCardProps> = ({ id, name, color, count, total, onSelect, selected }) => (
  <div
    onClick={() => onSelect(id)}
    className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
      selected ? 'ring-2 ring-offset-2' : ''
    }`}
    style={{ 
      borderColor: color, 
      opacity: selected ? 0.8 : 1,
      ...(selected ? { 
        borderWidth: '2px',  // Use standard CSS property instead of ringColor
        outlineColor: color  // Use outlineColor instead of ringColor
      } : {})
    }}
  >
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-medium text-gray-800">{name}</h3>
      <span
        className="w-6 h-6 rounded-full text-xs flex items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        {count}
      </span>
    </div>
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ backgroundColor: color, width: `${total > 0 ? (count / total) * 100 : 0}%` }}
      ></div>
    </div>
  </div>
);

export default TaskCategoryCard;
