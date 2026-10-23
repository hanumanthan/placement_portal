import { useState, useEffect } from 'react';
import { resourceService } from '../../services/resourceService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Search,
  Download,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Resume Templates',
  'Aptitude Formulas',
  'Coding Handbooks',
  'Interview Cheat Sheets',
  'Company Placement Papers',
  'General Guides',
];

const FILE_TYPES = ['PDF', 'DOCX', 'ZIP', 'CODE'];

const FILE_TYPE_COLORS = {
  PDF: 'danger',
  DOCX: 'primary',
  ZIP: 'warning',
  CODE: 'success',
};

export default function AdminResources() {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Resume Templates',
    file_url: '',
    file_type: 'PDF',
    description: '',
  });

  useEffect(() => {
    loadResources();
  }, [category]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await resourceService.getResources({
        category: category || undefined,
        search: search.trim() || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setResources(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadResources();
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Resume Templates',
      file_url: '/uploads/resumes/sample_ats_resume_template.pdf',
      file_type: 'PDF',
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingId(r.id);
    setFormData({
      title: r.title || '',
      category: r.category || 'Resume Templates',
      file_url: r.file_url || '',
      file_type: r.file_type || 'PDF',
      description: r.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.file_url.trim()) {
      toast.error('Title and file URL are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        file_url: formData.file_url.trim(),
        file_type: formData.file_type,
        description: formData.description.trim() || null,
      };

      if (editingId) {
        const res = await resourceService.updateResource(editingId, payload);
        if (res.success) {
          toast.success('Resource updated successfully!');
          setModalOpen(false);
          loadResources();
        }
      } else {
        const res = await resourceService.createResource(payload);
        if (res.success) {
          toast.success('Resource created successfully!');
          setModalOpen(false);
          loadResources();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource document?')) return;
    try {
      const res = await resourceService.deleteResource(id);
      if (res.success) {
        toast.success('Resource deleted successfully.');
        setResources((prev) => prev.filter((r) => r.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error('Failed to delete resource.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            Study Materials & Resources Management
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Publish downloadable ATS resume templates, formula cheat sheets, and placement guides.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Resource
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border">
        <CardBody className="p-4 flex items-center justify-between flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
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

      {/* Resources Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary-50 text-secondary-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">File Type</th>
                <th className="py-3 px-4">File URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan="5" className="py-3 px-4">
                      <Skeleton className="w-full h-8" />
                    </td>
                  </tr>
                ))
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-muted">
                    No resources found matching your search.
                  </td>
                </tr>
              ) : (
                resources.map((res) => (
                  <tr key={res.id} className="hover:bg-secondary-50/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-secondary-900 line-clamp-1">{res.title}</div>
                      {res.description && (
                        <div className="text-[11px] text-muted line-clamp-1">{res.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="outline" size="sm">
                        {res.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={FILE_TYPE_COLORS[(res.file_type || 'PDF').toUpperCase()] || 'secondary'} size="sm">
                        {(res.file_type || 'PDF').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        {res.file_url} <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(res)}
                          className="h-7 w-7 p-0 text-secondary-600 hover:text-secondary-900"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(res.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Resource' : 'Add New Resource Document'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">Resource Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g. Master Placement Resume Template (ATS-Ready)"
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
              <label className="block text-xs font-semibold text-secondary-700 mb-1">File Type *</label>
              <select
                value={formData.file_type}
                onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {FILE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">File Download URL *</label>
            <input
              type="text"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              required
              placeholder="/uploads/resumes/template.pdf or https://..."
              className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What this document contains and how students should use it..."
              className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Resource' : 'Add Resource'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
