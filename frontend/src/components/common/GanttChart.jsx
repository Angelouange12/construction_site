import { useMemo } from 'react';

const GanttChart = ({ tasks = [], startDate, endDate }) => {
  // Calculate timeline
  const timeline = useMemo(() => {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const weeks = [];
    let current = new Date(start);
    while (current <= end) {
      weeks.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    return { start, end, totalDays, weeks };
  }, [startDate, endDate]);

  // Calculate task positions
  const taskBars = useMemo(() => {
    return tasks.map(task => {
      const taskStart = task.startDate ? new Date(task.startDate) : timeline.start;
      const taskEnd = task.dueDate ? new Date(task.dueDate) : taskStart;
      
      const startOffset = Math.max(0, (taskStart - timeline.start) / (1000 * 60 * 60 * 24));
      const duration = Math.max(1, (taskEnd - taskStart) / (1000 * 60 * 60 * 24) + 1);
      
      return {
        ...task,
        left: (startOffset / timeline.totalDays) * 100,
        width: (duration / timeline.totalDays) * 100
      };
    });
  }, [tasks, timeline]);

  const getStatusColor = (status, progress) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'in_progress') return 'bg-blue-500';
    if (status === 'pending') return 'bg-gray-400';
    return 'bg-gray-400';
  };

  const getPriorityBorder = (priority) => {
    if (priority === 'high') return 'border-l-4 border-red-500';
    if (priority === 'medium') return 'border-l-4 border-yellow-500';
    return 'border-l-4 border-green-500';
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks to display
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header with dates */}
      <div className="flex border-b bg-gray-50">
        {/* Task names column */}
        <div className="w-48 flex-shrink-0 px-4 py-2 font-medium text-sm text-gray-600 border-r">
          Task
        </div>
        {/* Timeline header */}
        <div className="flex-1 flex">
          {timeline.weeks.map((week, i) => (
            <div 
              key={i} 
              className="flex-1 text-center py-2 text-xs text-gray-500 border-r last:border-r-0"
              style={{ minWidth: '80px' }}
            >
              {week.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          ))}
        </div>
      </div>

      {/* Task rows */}
      <div className="divide-y">
        {taskBars.map((task, index) => (
          <div key={task.id || index} className="flex hover:bg-gray-50">
            {/* Task name */}
            <div className="w-48 flex-shrink-0 px-4 py-3 border-r">
              <p className="font-medium text-sm text-gray-800 truncate" title={task.title}>
                {task.title}
              </p>
              <p className="text-xs text-gray-500 capitalize">{task.status}</p>
            </div>

            {/* Timeline bar */}
            <div className="flex-1 relative py-3 px-2">
              {/* Background grid lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timeline.weeks.map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-100" />
                ))}
              </div>

              {/* Task bar */}
              <div
                className={`
                  absolute top-1/2 -translate-y-1/2 h-7 rounded
                  ${getStatusColor(task.status, task.progress)}
                  ${getPriorityBorder(task.priority)}
                  shadow-sm transition-all hover:shadow-md cursor-pointer
                `}
                style={{
                  left: `${task.left}%`,
                  width: `${Math.max(task.width, 2)}%`,
                  minWidth: '30px'
                }}
                title={`${task.title} - ${task.progress || 0}%`}
              >
                {/* Progress overlay */}
                {task.progress > 0 && task.progress < 100 && (
                  <div
                    className="absolute inset-0 bg-black/10 rounded-l"
                    style={{ width: `${task.progress}%` }}
                  />
                )}
                
                {/* Label */}
                <span className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium truncate">
                  {task.progress || 0}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span className="text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded" />
          <span className="text-gray-600">Pending</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-red-500" />
            <span className="text-gray-600">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-yellow-500" />
            <span className="text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-green-500" />
            <span className="text-gray-600">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;

