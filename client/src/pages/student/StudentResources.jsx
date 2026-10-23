import { useState, useEffect } from 'react';
import { resourceService } from '../../services/resourceService';
import { Card, CardBody, Button, Badge, Skeleton } from '../../components/ui';
import {
  FileText,
  Download,
  Search,
  Filter,
  FileCode,
  FileArchive,
  BookOpen,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const FILE_TYPE_COLORS = {
  PDF: 'danger',
  DOCX: 'primary',
  ZIP: 'warning',
  CODE: 'success',
};

export default function StudentResources() {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadResources();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await resourceService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load resource categories:', err);
    }
  };

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await resourceService.getResources({
        category: selectedCategory || undefined,
        search: search.trim() || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setResources(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load study resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadResources();
  };

  const handleDownload = (res) => {
    toast.success(`Opening ${res.title}...`);
    // Open file URL or simulate download
    if (res.file_url) {
      window.open(res.file_url, '_blank');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── Hero Header ─── */}
      <div className="bg-gradient-to-r from-primary-950 via-secondary-900 to-primary-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-primary-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold backdrop-blur-sm border border-primary-500/30">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              Verified Placement Assets & Guides
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Study Material & Resource Library
            </h1>
            <p className="text-secondary-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Download battle-tested ATS resume templates, complete aptitude formula sheets, and coding interview cheat sheets curated by placement cells.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-xl border border-white/15 text-center shrink-0">
            <p className="text-3xl font-black text-white">{total}</p>
            <p className="text-[11px] uppercase tracking-wider text-secondary-300">Available Files</p>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <Card>
        <CardBody className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === ''
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                All Resources ({total})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search cheat sheets, templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>
          </div>
        </CardBody>
      </Card>

      {/* ─── Resources Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardBody className="p-5 space-y-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-full h-12" />
                <Skeleton className="w-1/3 h-8" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto text-secondary-500">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-secondary-900">No resources found</h3>
              <p className="text-sm text-muted max-w-md mx-auto">
                No documents matched your category selection or search query.
              </p>
            </div>
            {(selectedCategory || search) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('');
                  setSearch('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => {
            const fileType = (res.file_type || 'PDF').toUpperCase();
            return (
              <Card
                key={res.id}
                className="hover:shadow-md transition-all duration-200 border-border/80 flex flex-col justify-between"
              >
                <CardBody className="p-5 space-y-4 flex-1">
                  {/* Card top icon & category */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant={FILE_TYPE_COLORS[fileType] || 'secondary'} size="sm">
                        {fileType}
                      </Badge>
                      <Badge variant="outline" size="sm" className="bg-secondary-50">
                        {res.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Title & description */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-sm text-secondary-900 leading-snug">
                      {res.title}
                    </h3>
                    {res.description && (
                      <p className="text-xs text-muted leading-relaxed line-clamp-3">
                        {res.description}
                      </p>
                    )}
                  </div>
                </CardBody>

                {/* Footer download button */}
                <div className="px-5 py-3 border-t border-border bg-secondary-50/40 rounded-b-xl flex items-center justify-between">
                  <span className="text-[11px] text-muted font-medium">
                    Verified Resource
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownload(res)}
                    className="text-xs h-8 px-3"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download File
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
