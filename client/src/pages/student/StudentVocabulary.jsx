import { useState, useEffect } from 'react';
import { vocabularyService } from '../../services/vocabularyService';
import { Card, CardBody, Button, Badge, Skeleton, Input, Select } from '../../components/ui';
import {
  Languages,
  Sparkles,
  Search,
  CheckCircle,
  RotateCcw,
  Volume2,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Eye,
  Check,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentVocabulary() {
  const [loading, setLoading] = useState(true);
  const [wordOfTheDay, setWordOfTheDay] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mode: 'browse' | 'flashcards'
  const [activeTab, setActiveTab] = useState('browse');

  // Flashcard State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    loadWordOfTheDay();
    loadVocabulary();
  }, [page, difficulty, statusFilter]);

  const loadWordOfTheDay = async () => {
    try {
      const res = await vocabularyService.getWordOfTheDay();
      if (res.success) {
        setWordOfTheDay(res.data);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  const loadVocabulary = async () => {
    setLoading(true);
    try {
      const res = await vocabularyService.getVocabularyList({
        search,
        difficulty,
        status: statusFilter,
        page,
        limit: 12,
      });

      if (res.success) {
        setVocabList(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load vocabulary list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadVocabulary();
  };

  const handleStatusUpdate = async (vocabId, newStatus) => {
    try {
      const res = await vocabularyService.updateStatus(vocabId, newStatus);
      if (res.success) {
        toast.success(newStatus === 'known' ? 'Marked as Mastered! 🎯' : 'Added to practice queue! 🔄');

        // Update local list state
        setVocabList((prev) =>
          prev.map((item) =>
            item.id === vocabId ? { ...item, student_status: newStatus } : item
          )
        );

        if (wordOfTheDay && wordOfTheDay.id === vocabId) {
          setWordOfTheDay((prev) => ({ ...prev, student_status: newStatus }));
        }
      }
    } catch (err) {
      toast.error('Failed to update word status.');
    }
  };

  const currentFlashcard = vocabList[flashcardIndex] || null;

  const nextFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1 < vocabList.length ? prev + 1 : 0));
  };

  const prevFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev - 1 >= 0 ? prev - 1 : vocabList.length - 1));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Hero Word of the Day ────────────────────────────────────── */}
      {wordOfTheDay && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-900 via-primary-950 to-secondary-900 text-white p-6 sm:p-8 shadow-xl border border-primary-500/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                Word of the Day
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white capitalize">
                  {wordOfTheDay.word}
                </h1>
                <span className="text-primary-300 font-mono text-sm">
                  {wordOfTheDay.pronunciation}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/80 font-medium italic">
                  {wordOfTheDay.part_of_speech}
                </span>
              </div>

              <p className="text-secondary-200 text-base max-w-2xl leading-relaxed">
                {wordOfTheDay.definition}
              </p>

              {wordOfTheDay.example_sentence && (
                <div className="text-xs text-primary-200 italic border-l-2 border-primary-400 pl-3">
                  "{wordOfTheDay.example_sentence}"
                </div>
              )}
            </div>

            {/* Quick Actions for Word of the Day */}
            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleStatusUpdate(wordOfTheDay.id, 'known')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  wordOfTheDay.student_status === 'known'
                    ? 'bg-success text-white shadow-md'
                    : 'bg-white/10 hover:bg-success/20 text-white border border-white/15'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>I Know This</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusUpdate(wordOfTheDay.id, 'practice_again')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  wordOfTheDay.student_status === 'practice_again'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white/10 hover:bg-amber-500/20 text-white border border-white/15'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mode Tabs (Browse vs Flashcard Practice) ────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Vocabulary ({total})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interactive Flashcards Mode</span>
          </button>
        </div>

        {activeTab === 'browse' && (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search word or meaning..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-8 py-1.5 text-xs w-48 sm:w-64"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="input py-1.5 text-xs w-28"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input py-1.5 text-xs w-32"
            >
              <option value="">All Statuses</option>
              <option value="known">Mastered</option>
              <option value="practice_again">Needs Practice</option>
              <option value="unlearned">Unlearned</option>
            </select>
          </form>
        )}
      </div>

      {/* ─── Flashcards Mode ─────────────────────────────────────────── */}
      {activeTab === 'flashcards' ? (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
          {currentFlashcard ? (
            <>
              <div className="flex items-center justify-between text-xs text-secondary-500 font-medium px-2">
                <span>
                  Card {flashcardIndex + 1} of {vocabList.length}
                </span>
                <Badge
                  variant={
                    currentFlashcard.difficulty === 'hard'
                      ? 'danger'
                      : currentFlashcard.difficulty === 'medium'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {currentFlashcard.difficulty}
                </Badge>
              </div>

              {/* 3D-Like Flashcard Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[300px] bg-surface border-2 border-border/80 hover:border-primary/40 rounded-2xl p-8 shadow-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none group relative"
              >
                {!isFlipped ? (
                  /* Front: Word & Part of Speech */
                  <div className="space-y-4">
                    <span className="text-xs uppercase font-bold tracking-widest text-primary">
                      {currentFlashcard.part_of_speech}
                    </span>
                    <h2 className="text-4xl font-extrabold text-secondary-900 capitalize tracking-tight">
                      {currentFlashcard.word}
                    </h2>
                    <p className="text-sm font-mono text-secondary-500">
                      {currentFlashcard.pronunciation}
                    </p>
                    <div className="pt-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-100 text-secondary-600 text-xs font-semibold group-hover:bg-primary-50 group-hover:text-primary transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        Click anywhere to reveal definition
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Back: Definition & Examples */
                  <div className="space-y-4 text-left max-w-lg">
                    <div className="text-center pb-2 border-b border-border">
                      <h3 className="text-2xl font-bold text-secondary-900 capitalize">
                        {currentFlashcard.word}
                      </h3>
                      <span className="text-xs text-muted">{currentFlashcard.part_of_speech}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block mb-1">
                        Definition:
                      </span>
                      <p className="text-base text-secondary-900 leading-relaxed font-medium">
                        {currentFlashcard.definition}
                      </p>
                    </div>
                    {currentFlashcard.example_sentence && (
                      <div>
                        <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider block mb-1">
                          Example in Context:
                        </span>
                        <p className="text-xs text-secondary-700 italic bg-secondary-50 p-3 rounded-lg border border-border/60">
                          "{currentFlashcard.example_sentence}"
                        </p>
                      </div>
                    )}
                    {currentFlashcard.synonyms && (
                      <div className="text-xs text-secondary-600">
                        <strong className="text-secondary-800">Synonyms:</strong> {currentFlashcard.synonyms}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Know vs Practice + Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" size="sm" onClick={prevFlashcard}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-danger-300 text-danger-700 hover:bg-danger-50"
                    onClick={() => {
                      handleStatusUpdate(currentFlashcard.id, 'practice_again');
                      nextFlashcard();
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" /> Practice Again
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-success hover:bg-success-700 text-white"
                    onClick={() => {
                      handleStatusUpdate(currentFlashcard.id, 'known');
                      nextFlashcard();
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" /> I Know This
                  </Button>
                </div>

                <Button variant="outline" size="sm" onClick={nextFlashcard}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-secondary-500">
              No words available for flashcards.
            </div>
          )}
        </div>
      ) : (
        /* ─── Browse Grid Mode ────────────────────────────────────────── */
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : vocabList.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-xl">
              <Languages className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="text-base font-semibold text-secondary-900">No words found</h3>
              <p className="text-xs text-secondary-500 mt-1">
                Try clearing search terms or changing your difficulty filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocabList.map((item) => (
                <Card
                  key={item.id}
                  className="border-border hover:shadow-card-hover transition-all duration-150 flex flex-col justify-between"
                >
                  <CardBody className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-lg font-bold text-secondary-900 capitalize">
                            {item.word}
                          </h3>
                          <span className="text-xs font-mono text-muted">
                            {item.pronunciation}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-primary italic">
                          {item.part_of_speech}
                        </span>
                      </div>

                      <Badge
                        variant={
                          item.difficulty === 'hard'
                            ? 'danger'
                            : item.difficulty === 'medium'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {item.difficulty}
                      </Badge>
                    </div>

                    <p className="text-xs text-secondary-700 leading-relaxed line-clamp-3">
                      {item.definition}
                    </p>

                    {item.example_sentence && (
                      <p className="text-[11px] text-muted italic line-clamp-2">
                        "{item.example_sentence}"
                      </p>
                    )}
                  </CardBody>

                  {/* Card Footer: Status Actions */}
                  <div className="px-5 py-3 bg-secondary-50/70 border-t border-border flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-secondary-500">
                      {item.student_status === 'known' ? (
                        <span className="text-success-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Mastered
                        </span>
                      ) : item.student_status === 'practice_again' ? (
                        <span className="text-amber-700 flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5" /> Needs Practice
                        </span>
                      ) : (
                        <span className="text-muted">Unlearned</span>
                      )}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(item.id, 'known')}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          item.student_status === 'known'
                            ? 'bg-success text-white'
                            : 'bg-white text-secondary-600 hover:text-success hover:bg-success-50 border border-border'
                        }`}
                        title="Mark as Mastered"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(item.id, 'practice_again')}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          item.student_status === 'practice_again'
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-secondary-600 hover:text-amber-600 hover:bg-amber-50 border border-border'
                        }`}
                        title="Needs Practice"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-secondary-600 font-medium px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
