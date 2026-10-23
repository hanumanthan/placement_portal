import { useState, useEffect } from 'react';
import companyService from '../../services/companyService';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Modal,
  Badge,
  Skeleton,
} from '../../components/ui';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Globe,
  MapPin,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: 'Information Technology',
    headquarters: '',
    description: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await companyService.getCompanies({ search, limit: 50 });
      if (res.success) {
        setCompanies(res.data);
      }
    } catch (err) {
      toast.error('Failed to load corporate partners.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedCompany(null);
    setFormData({
      name: '',
      website: '',
      industry: 'Information Technology',
      headquarters: '',
      description: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name || '',
      website: company.website || '',
      industry: company.industry || 'Information Technology',
      headquarters: company.headquarters || '',
      description: company.description || '',
    });
    setModalOpen(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Company name is required.');
      return;
    }

    try {
      setSaving(true);
      if (selectedCompany) {
        await companyService.updateCompany(selectedCompany.id, formData);
        toast.success('Company updated successfully!');
      } else {
        await companyService.createCompany(formData);
        toast.success('Company created successfully!');
      }
      setModalOpen(false);
      fetchCompanies();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to save company.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;
    try {
      setSaving(true);
      await companyService.deleteCompany(selectedCompany.id);
      toast.success('Company removed successfully');
      setDeleteModalOpen(false);
      fetchCompanies();
    } catch (err) {
      toast.error('Failed to delete company.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-primary" /> Manage Recruiting Companies
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain hiring partner profiles, official recruitment websites, and visit history.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-600">
          <Plus className="w-4 h-4 mr-1.5" /> Add Partner Company
        </Button>
      </div>

      {/* ─── Search Bar ────────────────────────────────────────── */}
      <Card className="bg-slate-900 border-slate-800 p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search companies by name, industry, or headquarters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCompanies()}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </Card>

      {/* ─── Companies Table ───────────────────────────────────── */}
      <Card className="bg-slate-900 border-slate-800">
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-800" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Company Name</th>
                    <th className="px-4 py-3">Industry</th>
                    <th className="px-4 py-3">Headquarters</th>
                    <th className="px-4 py-3">Active Drives</th>
                    <th className="px-4 py-3">Official Link</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {companies && companies.length > 0 ? (
                    companies.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-bold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/30 shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <span>{c.name}</span>
                            <span className="block text-[10px] text-slate-500 font-normal truncate max-w-[200px]">
                              {c.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300">{c.industry}</td>
                        <td className="px-4 py-4 text-slate-400">{c.headquarters || 'India'}</td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/20 text-primary border border-primary/30">
                            {c.total_drives || 0} Drives
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {c.website ? (
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 font-medium"
                            >
                              Visit <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                            title="Edit Company"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(c);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-md transition-colors"
                            title="Delete Company"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                        No companies registered. Click "Add Partner Company" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─── Add / Edit Modal ──────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedCompany ? 'Edit Recruiting Partner' : 'Add New Partner Company'}
        size="md"
      >
        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Zoho Corporation"
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. IT Services & SaaS"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                Headquarters
              </label>
              <input
                type="text"
                value={formData.headquarters}
                onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                placeholder="e.g. Chennai, Tamil Nadu"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
              Official Website / Careers URL
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.company.com/careers"
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
              Company Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overview of business, market presence, and technology domains..."
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              {selectedCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Delete Confirmation Modal ─────────────────────────── */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Company Removal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-secondary-700 leading-relaxed">
            Are you sure you want to delete <strong>{selectedCompany?.name}</strong>?
            All associated placement drives and historical records will be permanently removed.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={saving} onClick={handleDeleteCompany}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
