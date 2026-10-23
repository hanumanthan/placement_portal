import { useState, useEffect } from 'react';
import { videoService } from '../../services/videoService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import {
  Video,
  Plus,
  Trash2,
  Edit3,
  Search,
  ExternalLink,
  Clock,
  Play,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Technical',
  'Data Structures & Algorithms',
  'HR & Behavioral',
  'System Design',
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function AdminVideos() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Quantitative Aptitude',
    difficulty: 'medium',
    youtube_url: '',
    duration: '25:00',
  });

  useEffect(() => {
    loadVideos();
  }, [category]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await videoService.getVideos({
        category: category || undefined,
        search: search.trim() || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setVideos(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load videos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadVideos();
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'Quantitative Aptitude',
      difficulty: 'medium',
      youtube_url: '',
      duration: '25:00',
    });
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingId(v.id);
    setFormData({
      title: v.title || '',
      description: v.description || '',
      category: v.category || 'Quantitative Aptitude',
      difficulty: v.difficulty || 'medium',
      youtube_url: v.youtube_url || '',
      duration: v.duration || '25:00',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.youtube_url.trim()) {
      toast.error('Title and YouTube URL are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        difficulty: formData.difficulty,
        youtube_url: formData.youtube_url.trim(),
        duration: formData.duration.trim() || '15:00',
      };

      if (editingId) {
        const res = await videoService.updateVideo(editingId, payload);
        if (res.success) {
          toast.success('Video updated successfully!');
          setModalOpen(false);
          loadVideos();
        }
      } else {
        const res = await videoService.createVideo(payload);
        if (res.success) {
          toast.success('Video added successfully!');
          setModalOpen(false);
          loadVideos();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save video.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lecture video?')) return;
    try {
      const res = await videoService.deleteVideo(id);
      if (res.success) {
        toast.success('Video deleted successfully.');
        setVideos((prev) => prev.filter((v) => v.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error('Failed to delete video.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            Learning Videos Management
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Curate YouTube masterclasses, aptitude lessons, and placement prep tutorials.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Add New Video
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border">
        <CardBody className="p-4 flex items-center justify-between flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search videos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 pl-8 pr-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <Button type="submit" variant="outline" size="sm" className="text-xs py-1.5">
              Search
            </Button>
          </form>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </CardBody>
      </Card>

      {/* Videos Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary-50 text-secondary-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Lecture / Topic</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">YouTube URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan="6" className="py-3 px-4">
                      <Skeleton className="w-full h-8" />
                    </td>
                  </tr>
                ))
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted">
                    No videos found matching your search.
                  </td>
                </tr>
              ) : (
                videos.map((vid) => {
                  const ytId = getYouTubeId(vid.youtube_url);
                  return (
                    <tr key={vid.id} className="hover:bg-secondary-50/60 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-secondary-900 line-clamp-1">{vid.title}</div>
                        {vid.description && (
                          <div className="text-[11px] text-muted line-clamp-1">{vid.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="outline" size="sm">
                          {vid.category}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={DIFFICULTY_COLORS[vid.difficulty?.toLowerCase()] || 'secondary'} size="sm">
                          {vid.difficulty?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-muted">
                          <Clock className="w-3 h-3" />
                          {vid.duration || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <a
                          href={vid.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          Watch Video <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(vid)}
                            className="h-7 w-7 p-0 text-secondary-600 hover:text-secondary-900"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(vid.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Learning Video' : 'Add New Learning Video'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">Video Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g. Master Dynamic Programming Patterns in 45 Mins"
              className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Difficulty *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">YouTube URL *</label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                required
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Duration (MM:SS) *</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
                placeholder="e.g. 28:15"
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Description / Learning Outcomes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What students will learn in this lecture..."
              className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Video' : 'Add Video'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
