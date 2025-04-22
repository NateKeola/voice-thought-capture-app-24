
import React from "react";
import { Check, Edit, Trash, CircleCheck, MessageCircle } from "lucide-react";

interface TaskItemProps {
  task: any;
  getCategoryColor: (id: string) => string;
  onToggleComplete: (id: number) => void;
  priorityColors: { [key: string]: string };
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  getCategoryColor,
  onToggleComplete,
  priorityColors,
}) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm ${task.completed ? 'opacity-60' : ''} hover:shadow-md transition-all duration-200`}>
    <div className="flex items-start">
      <button
        onClick={() => onToggleComplete(task.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 border-2 transition-colors duration-200`}
        style={{
          borderColor: task.completed ? "#D1D5DB" : getCategoryColor(task.category),
          background: task.completed ? "#f3f4f6" : "#fff"
        }}
        aria-label="Toggle complete"
      >
        {task.completed && <Check size={16} className="text-gray-500" />}
      </button>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`font-medium ${task.completed ? "text-gray-500 line-through" : "text-gray-800"}`}>
              {task.title}
            </h3>
            <p className={`text-sm ${task.completed ? "text-gray-400" : "text-gray-600"} mt-1`}>
              {task.description}
            </p>
          </div>
          <div className="flex space-x-1">
            <div
              className="h-2 w-2 rounded-full mt-1.5"
              style={{ backgroundColor: getCategoryColor(task.category) }}
            ></div>
            <div
              className={`h-2 w-2 rounded-full mt-1.5 ${priorityColors[task.priority]}`}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{task.due}</span>
            {task.hasAudio && (
              <button className="flex items-center text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                <MessageCircle size={16} />
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Edit Task">
              <Edit size={18} />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Delete Task">
              <Trash size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TaskItem;
