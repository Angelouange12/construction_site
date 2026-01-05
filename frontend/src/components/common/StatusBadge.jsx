const StatusBadge = ({ status, type = 'default' }) => {
  const statusStyles = {
    // Site statuses
    planning: 'badge-gray',
    in_progress: 'badge-primary',
    paused: 'badge-warning',
    completed: 'badge-success',
    
    // Task statuses
    pending: 'badge-gray',
    cancelled: 'badge-danger',
    
    // Priority
    low: 'badge-gray',
    medium: 'badge-warning',
    high: 'badge-danger',
    
    // Incident severity
    critical: 'bg-red-600 text-white',
    
    // Incident status
    reported: 'badge-warning',
    investigating: 'badge-primary',
    resolved: 'badge-success',
    closed: 'badge-gray',
    
    // Attendance
    present: 'badge-success',
    absent: 'badge-danger',
    late: 'badge-warning',
    half_day: 'badge-primary',
    
    // Default
    default: 'badge-gray'
  };

  const labels = {
    planning: 'Planning',
    in_progress: 'In Progress',
    paused: 'Paused',
    completed: 'Completed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    reported: 'Reported',
    investigating: 'Investigating',
    resolved: 'Resolved',
    closed: 'Closed',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    half_day: 'Half Day'
  };

  const style = statusStyles[status] || statusStyles.default;
  const label = labels[status] || status;

  return (
    <span className={`badge ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;

