import { useState, useEffect } from 'react';
import { calendarAPI, sitesAPI } from '../api/services';
import Calendar from '../components/common/Calendar';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    siteId: '',
    eventType: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'other',
    startDate: '',
    endDate: '',
    allDay: false,
    siteId: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, sitesRes] = await Promise.all([
        calendarAPI.getEvents({
          ...filters,
          startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
          endDate: new Date(new Date().getFullYear(), 11, 31).toISOString()
        }),
        sitesAPI.getAll({ limit: 100 })
      ]);
      setEvents(eventsRes.data.data || []);
      setSites(sitesRes.data.data?.sites || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      eventType: event.eventType || 'other',
      startDate: event.startDate?.split('T')[0] || '',
      endDate: event.endDate?.split('T')[0] || '',
      allDay: event.allDay || false,
      siteId: event.siteId || '',
      color: event.color || '#3b82f6'
    });
    setIsModalOpen(true);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      eventType: 'other',
      startDate: slotInfo.start.toISOString().split('T')[0],
      endDate: slotInfo.end.toISOString().split('T')[0],
      allDay: slotInfo.slots.length > 1,
      siteId: '',
      color: '#3b82f6'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await calendarAPI.update(selectedEvent.id, formData);
      } else {
        await calendarAPI.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save event');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !confirm('Delete this event?')) return;
    try {
      await calendarAPI.delete(selectedEvent.id);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete event');
    }
  };

  const eventTypeColors = {
    task: '#3b82f6',
    meeting: '#8b5cf6',
    inspection: '#f59e0b',
    delivery: '#10b981',
    milestone: '#ef4444',
    other: '#6b7280'
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          <p className="text-gray-600">Schedule and manage events</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 
                       bg-white border rounded-lg hover:bg-gray-50"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setFormData({
                title: '',
                description: '',
                eventType: 'other',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                allDay: false,
                siteId: '',
                color: '#3b82f6'
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            Add Event
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <select
          value={filters.siteId}
          onChange={(e) => setFilters(prev => ({ ...prev, siteId: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sites</option>
          {sites.map(site => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>

        <select
          value={filters.eventType}
          onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="task">Task</option>
          <option value="meeting">Meeting</option>
          <option value="inspection">Inspection</option>
          <option value="delivery">Delivery</option>
          <option value="milestone">Milestone</option>
          <option value="other">Other</option>
        </select>

        {/* Legend */}
        <div className="flex items-center gap-4 ml-auto">
          {Object.entries(eventTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-sm text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Calendar
          events={events}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          loading={loading}
          height={650}
        />
      </div>

      {/* Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvent ? 'Edit Event' : 'New Event'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  eventType: e.target.value,
                  color: eventTypeColors[e.target.value] || '#3b82f6'
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="task">Task</option>
                <option value="meeting">Meeting</option>
                <option value="inspection">Inspection</option>
                <option value="delivery">Delivery</option>
                <option value="milestone">Milestone</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
              <select
                value={formData.siteId}
                onChange={(e) => setFormData(prev => ({ ...prev, siteId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Site</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData(prev => ({ ...prev, allDay: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="allDay" className="text-sm text-gray-700">All day event</label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            {selectedEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {selectedEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarPage;

