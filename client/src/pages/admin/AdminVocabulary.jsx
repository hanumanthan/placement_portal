import { useState, useEffect } from 'react';
import { vocabularyService } from '../../services/vocabularyService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import { Languages, Plus, Trash2, Edit3, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminVocabulary() {
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    word: '',
    pronunciation: '',
    part_of_speech: 'noun',
    definition: '',
    example_sentence: '',
    synonyms: '',
    antonyms: '',
    difficulty: 'medium',
  });

  useEffect(() => {
    loadWords();
  }, [page, difficulty]);

  const loadWords = async () => {
    setLoading(true);
    try {
      const res = await vocabularyService.getVocabularyList({
        search,
        difficulty,
        page,
        limit: 15,
      });

      if (res.success) {
        setWords(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load vocabulary words.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadWords();
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      word: '',
      pronunciation: '',
      part_of_speech: 'noun',
      definition: '',
      example_sentence: '',
      synonyms: '',
      antonyms: '',
      difficulty: 'medium',
    });
    setModalOpen(true);
  };

  const openEditModal = (w) => {
    setEditingId(w.id);
    setFormData({
      word: w.word,
      pronunciation: w.pronunciation || '',
      part_of_speech: w.part_of_speech || 'noun',
      definition: w.definition,
      example_sentence: w.example_sentence || '',
      synonyms: w.synonyms || '',
      antonyms: w.antonyms || '',
      difficulty: w.difficulty || 'medium',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await vocabularyService.updateVocabAdmin(editingId, formData);
        if (res.success) {
          toast.success('Word updated successfully.');
        }
      } else {
        const res = await vocabularyService.createVocabAdmin(formData);
        if (res.success) {
          toast.success('New word added successfully.');
        }
      }
      setModalOpen(false);
      loadWords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vocabulary word?')) return;
    try {
      const res = await vocabularyService.deleteVocabAdmin(id);
      if (res.success) {
        toast.success('Word deleted successfully.');
        setWords((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete word.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            Vocabulary Bank Management
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Curate corporate & campus placement vocabulary words for students.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Vocabulary Word
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="border-border">
        <CardBody className="p-4 flex items-center justify-between flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search word or meaning..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-8 py-1.5 text-xs w-60"
              />
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
            <Button variant="secondary" size="sm" type="submit">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary-500 font-medium">Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="input py-1.5 text-xs w-32"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card className="border-border shadow-sm">
        <CardBody className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : words.length === 0 ? (
            <div className="p-12 text-center text-sm text-secondary-500">
              No words found matching criteria.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary-50 border-b border-border text-xs uppercase text-secondary-500 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Word</th>
                  <th className="px-6 py-3.5">Part of Speech</th>
                  <th className="px-6 py-3.5">Definition</th>
                  <th className="px-6 py-3.5 text-center">Difficulty</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {words.map((w) => (
                  <tr key={w.id} className="hover:bg-secondary-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-secondary-900 capitalize">{w.word}</div>
                      <div className="text-xs font-mono text-muted">{w.pronunciation}</div>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-primary italic whitespace-nowrap">
                      {w.part_of_speech}
                    </td>

                    <td className="px-6 py-4 max-w-md">
                      <div className="text-xs text-secondary-800 line-clamp-2">{w.definition}</div>
                    </td>

                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <Badge
                        variant={
                          w.difficulty === 'hard'
                            ? 'danger'
                            : w.difficulty === 'medium'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {w.difficulty}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(w)}
                          className="p-1.5 text-secondary-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(w.id)}
                          className="p-1.5 text-secondary-400 hover:text-danger hover:bg-danger-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
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

      {/* ─── Modal: Add/Edit Word ────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Vocabulary Word' : 'Add Vocabulary Word'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">
                Word *
              </label>
              <input
                type="text"
                required
                value={formData.word}
                onChange={(e) => setFormData((p) => ({ ...p, word: e.target.value }))}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">
                Phonetic Pronunciation
              </label>
              <input
                type="text"
                placeholder="/pər-sə-ˈvir/"
                value={formData.pronunciation}
                onChange={(e) => setFormData((p) => ({ ...p, pronunciation: e.target.value }))}
                className="input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">
                Part of Speech *
              </label>
              <select
                value={formData.part_of_speech}
                onChange={(e) => setFormData((p) => ({ ...p, part_of_speech: e.target.value }))}
                className="input text-xs"
              >
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">
                Difficulty Level *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData((p) => ({ ...p, difficulty: e.target.value }))}
                className="input text-xs"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Definition / Meaning *
            </label>
            <textarea
              rows="3"
              required
              value={formData.definition}
              onChange={(e) => setFormData((p) => ({ ...p, definition: e.target.value }))}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Example Sentence in Corporate Context
            </label>
            <textarea
              rows="2"
              value={formData.example_sentence}
              onChange={(e) => setFormData((p) => ({ ...p, example_sentence: e.target.value }))}
              className="input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Synonyms</label>
              <input
                type="text"
                placeholder="Comma separated"
                value={formData.synonyms}
                onChange={(e) => setFormData((p) => ({ ...p, synonyms: e.target.value }))}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Antonyms</label>
              <input
                type="text"
                placeholder="Comma separated"
                value={formData.antonyms}
                onChange={(e) => setFormData((p) => ({ ...p, antonyms: e.target.value }))}
                className="input text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {editingId ? 'Save Changes' : 'Add Word'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
