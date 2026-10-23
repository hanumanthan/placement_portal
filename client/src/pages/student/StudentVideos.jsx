import { useState, useEffect } from 'react';
import { videoService } from '../../services/videoService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import {
  Video,
  Play,
  CheckCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

export default function StudentVideos() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');

  // Active playing video (Theater Modal)
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadVideos();
  }, [selectedCategory, difficulty]);

  const loadCategories = async () => {
    try {
      const res = await videoService.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await videoService.getVideos({
        category: selectedCategory || undefined,
        difficulty: difficulty || undefined,
        search: search.trim() || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setVideos(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load learning videos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVideos();
  };

  const toggleWatchStatus = async (videoId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await videoService.toggleProgress(videoId);
      if (res.success) {
        const isNowCompleted = res.data.completed;
        setVideos((prev) =>
          prev.map((v) => (v.id === videoId ? { ...v, is_completed: isNowCompleted } : v))
        );
        if (activeVideo && activeVideo.id === videoId) {
          setActiveVideo((prev) => ({ ...prev, is_completed: isNowCompleted }));
        }
        if (isNowCompleted) {
          toast.success('Video marked as watched! Great job!');
        } else {
          toast('Video progress removed', { icon: '↩️' });
        }
      }
    } catch (err) {
      toast.error('Failed to update watch status.');
    }
  };

  const completedCount = videos.filter((v) => v.is_completed).length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── Hero Header & Progress ─── */}
      <div className="bg-gradient-to-r from-secondary-900 via-primary-950 to-secondary-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-primary-900/60">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold backdrop-blur-sm border border-primary-500/30">
                <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                Curated Placement Masterclasses
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Placement Video Masterclasses
              </h1>
              <p className="text-secondary-300 text-xs sm:text-sm max-w-xl">
                Watch industry-vetted masterclasses on Quantitative Aptitude, Coding Patterns, System Design, and HR rounds.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/15 flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{completedCount} / {total}</p>
                <p className="text-[11px] uppercase tracking-wider text-secondary-300">Completed</p>
              </div>
              <div className="h-8 w-[1px] bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{progressPercent}%</p>
                <p className="text-[11px] uppercase tracking-wider text-secondary-300">Progress</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-secondary-300 font-medium">
              <span>Overall Course Completion</span>
              <span>{completedCount} of {total} lectures completed</span>
            </div>
            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search & Category Filter ─── */}
      <Card>
        <CardBody className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Category pills */}
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
                All Topics ({total})
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

            {/* Search input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search lectures..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>
          </div>
        </CardBody>
      </Card>

      {/* ─── Videos Grid ─── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="w-full h-44 rounded-t-xl" />
              <CardBody className="p-4 space-y-3">
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-full h-12" />
                <Skeleton className="w-1/2 h-4" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto text-secondary-500">
              <Video className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-secondary-900">No videos found</h3>
              <p className="text-sm text-muted max-w-md mx-auto">
                No learning videos matched your category or search filter.
              </p>
            </div>
            {(selectedCategory || search || difficulty) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('');
                  setSearch('');
                  setDifficulty('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((vid) => {
            const ytId = getYouTubeId(vid.youtube_url);
            const thumbUrl = ytId
              ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
              : null;

            return (
              <Card
                key={vid.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 border-border/80 flex flex-col group cursor-pointer"
                onClick={() => setActiveVideo(vid)}
              >
                {/* Video Thumbnail with duration overlay */}
                <div className="relative aspect-video bg-secondary-950 overflow-hidden">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary-900 text-secondary-400">
                      <Video className="w-12 h-12" />
                    </div>
                  )}

                  {/* Play overlay button */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary transition-all">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Duration tag */}
                  {vid.duration && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm">
                      <Clock className="w-3 h-3" />
                      {vid.duration}
                    </div>
                  )}

                  {/* Completed tag */}
                  {vid.is_completed && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-emerald-600/95 text-white text-[11px] font-bold flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardBody className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm" className="bg-secondary-50">
                        {vid.category}
                      </Badge>
                      <Badge variant={DIFFICULTY_COLORS[vid.difficulty?.toLowerCase()] || 'secondary'} size="sm">
                        {vid.difficulty?.toUpperCase()}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-sm text-secondary-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {vid.title}
                    </h3>

                    {vid.description && (
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    )}
                  </div>

                  {/* Card bottom actions */}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => toggleWatchStatus(vid.id, e)}
                      className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        vid.is_completed
                          ? 'text-emerald-600 hover:text-emerald-700'
                          : 'text-secondary-500 hover:text-primary'
                      }`}
                    >
                      <CheckCircle className={`w-4 h-4 ${vid.is_completed ? 'fill-emerald-100 text-emerald-600' : ''}`} />
                      {vid.is_completed ? 'Watched' : 'Mark as Watched'}
                    </button>

                    <span className="text-xs text-primary font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Watch <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Theater Video Player Modal ─── */}
      <Modal
        isOpen={Boolean(activeVideo)}
        onClose={() => setActiveVideo(null)}
        title={activeVideo?.title || 'Learning Video'}
        size="xl"
      >
        {activeVideo && (
          <div className="space-y-4">
            {/* Embedded Iframe */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
              {getYouTubeId(activeVideo.youtube_url) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.youtube_url)}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <a
                    href={activeVideo.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    Open in YouTube <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Video metadata & actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{activeVideo.category}</Badge>
                <Badge variant={DIFFICULTY_COLORS[activeVideo.difficulty?.toLowerCase()] || 'secondary'}>
                  {activeVideo.difficulty?.toUpperCase()}
                </Badge>
                {activeVideo.duration && (
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeVideo.duration}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={activeVideo.is_completed ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => toggleWatchStatus(activeVideo.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  {activeVideo.is_completed ? 'Marked as Completed' : 'Mark as Watched'}
                </Button>
                <a
                  href={activeVideo.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost text-xs p-2 text-secondary-600 hover:text-secondary-900 inline-flex items-center"
                  title="Open on YouTube"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Video description */}
            {activeVideo.description && (
              <div className="p-3.5 bg-secondary-50 rounded-xl border border-border text-xs text-secondary-700 leading-relaxed">
                <p className="font-semibold text-secondary-900 mb-1">Lesson Overview</p>
                {activeVideo.description}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
