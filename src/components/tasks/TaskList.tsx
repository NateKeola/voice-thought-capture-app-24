
import React from "react";
import TaskItem from "./TaskItem";
import EmptyTaskState from "./EmptyTaskState";
import TaskTimelineIndicator from "./TaskTimelineIndicator";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SquareCheck, ChevronDown, ChevronUp } from "lucide-react";

interface TaskListProps {
  tasks: any[];
  getCategoryColor: (id: string) => string;
  onToggleComplete: (id: string) => void; // Changed from number to string
  priorityColors: { [key: string]: string };
  viewMode: "categories" | "timeline";
  selectedCategory: string | null;
  categoryNames: { [key: string]: string };
  onBackClick?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  getCategoryColor,
  onToggleComplete,
  priorityColors,
  viewMode,
  selectedCategory,
  categoryNames,
  onBackClick,
}) => {
  const [openCategory, setOpenCategory] = React.useState<string | null>(null);
  
  if (tasks.length === 0) {
    return (
      <EmptyTaskState 
        selectedCategory={selectedCategory} 
        categoryName={selectedCategory ? categoryNames[selectedCategory] : undefined} 
        onBackClick={onBackClick} 
      />
    );
  }

  // Group tasks by category for category view
  const groupedTasks = tasks.reduce((acc, task) => {
    const category = task.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(task);
    return acc;
  }, {});

  // If category is selected, show tasks for that category
  if (viewMode === "categories" && selectedCategory) {
    const categoryTasks = tasks.filter(task => task.category === selectedCategory);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 py-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: getCategoryColor(selectedCategory) }}
          ></div>
          <h3 className="font-medium text-gray-700">{categoryNames[selectedCategory] || selectedCategory}</h3>
          <span className="text-sm text-gray-500">({categoryTasks.length})</span>
        </div>
        
        {categoryTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            getCategoryColor={getCategoryColor}
            onToggleComplete={onToggleComplete}
            priorityColors={priorityColors}
          />
        ))}
      </div>
    );
  }

  // Default view (all tasks in timeline or grouped by category)
  return (
    <div className={viewMode === "timeline" ? "space-y-6" : "space-y-3"}>
      {viewMode === "timeline" ? (
        // Timeline view (unchanged)
        tasks.map((task) => (
          <div key={task.id} className="ml-2 pl-4 border-l-2 border-gray-200 pb-6 relative">
            <TaskTimelineIndicator color={getCategoryColor(task.category)} />
            <TaskItem 
              task={task}
              getCategoryColor={getCategoryColor}
              onToggleComplete={onToggleComplete}
              priorityColors={priorityColors}
            />
          </div>
        ))
      ) : (
        // Categories view (when no specific category is selected)
        Object.entries(groupedTasks).map(([category, categoryTasks]) => (
          <Collapsible 
            key={category}
            open={openCategory === category}
            onOpenChange={() => setOpenCategory(openCategory === category ? null : category)}
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <CollapsibleTrigger className="w-full p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getCategoryColor(category) }}
                  ></div>
                  <span className="font-medium text-gray-800">
                    {categoryNames[category] || category}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({(categoryTasks as any[]).length})
                  </span>
                </div>
                {openCategory === category ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3">
                  {(categoryTasks as any[]).map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      getCategoryColor={getCategoryColor}
                      onToggleComplete={onToggleComplete}
                      priorityColors={priorityColors}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))
      )}
    </div>
  );
};

export default TaskList;
