import { useState, useEffect } from 'react';
import { challengeService } from '../../services/challengeService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import { Trophy, Plus, Trash2, Calendar, Award, CheckCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChallenges() {
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    challenge_date: new Date().toISOString().split('T')[0],
    title: '',
    points: 15,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: '',
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const res = await challengeService.getAllChallengesAdmin();
      if (res.success) {
        setChallenges(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load challenges.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        challenge_date: formData.challenge_date,
        title: formData.title,
        points: parseInt(formData.points, 10),
        question: {
          question_text: formData.question_text,
          option_a: formData.option_a,
          option_b: formData.option_b,
          option_c: formData.option_c,
          option_d: formData.option_d,
          correct_option: formData.correct_option,
          explanation: formData.explanation,
        },
      };

      const res = await challengeService.createChallengeAdmin(payload);
      if (res.success) {
        toast.success('Daily challenge published successfully!');
        setModalOpen(false);
        loadChallenges();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this daily challenge?')) return;
    try {
      const res = await challengeService.deleteChallengeAdmin(id);
      if (res.success) {
        toast.success('Challenge deleted successfully.');
        setChallenges((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete challenge.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            Daily Challenges Management
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Create algorithmic questions and track campus participation streaks.
          </p>
        </div>

        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Publish New Challenge
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardBody className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : challenges.length === 0 ? (
            <div className="p-12 text-center text-sm text-secondary-500">
              No daily challenges created yet. Click "Publish New Challenge" to get started.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary-50 border-b border-border text-xs uppercase text-secondary-500 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Title & Question</th>
                  <th className="px-6 py-3.5 text-center">Correct Ans</th>
                  <th className="px-6 py-3.5 text-center">Points</th>
                  <th className="px-6 py-3.5 text-center">Student Attempts</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {challenges.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-secondary-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        {new Date(c.challenge_date).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-md">
                      <div className="font-semibold text-secondary-900">{c.title}</div>
                      <div className="text-xs text-secondary-500 line-clamp-1 mt-0.5">
                        {c.question_text}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="w-6 h-6 rounded-md bg-success-50 text-success-700 font-bold text-xs inline-flex items-center justify-center border border-success-200">
                        {c.correct_option}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-primary">
                      +{c.points}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 text-xs text-secondary-600">
                        <Users className="w-3.5 h-3.5 text-muted" />
                        <span>{c.total_attempts || 0} students</span>
                        {c.total_attempts > 0 && (
                          <span className="text-success-700 font-medium">
                            ({c.correct_attempts} correct)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-secondary-400 hover:text-danger hover:bg-danger-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* ─── Modal: Create Challenge ─────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Publish Daily Challenge">
        <form onSubmit={handleCreate} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">
                Challenge Date *
              </label>
              <input
                type="date"
                name="challenge_date"
                required
                value={formData.challenge_date}
                onChange={handleChange}
                className="input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">
                Points Awarded *
              </label>
              <input
                type="number"
                name="points"
                min="5"
                max="100"
                required
                value={formData.points}
                onChange={handleChange}
                className="input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Title / Topic *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Bitwise XOR Trick for Duplicates"
              required
              value={formData.title}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Question Text *
            </label>
            <textarea
              name="question_text"
              rows="3"
              required
              placeholder="Enter the problem statement or question..."
              value={formData.question_text}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Option A *</label>
              <input
                type="text"
                name="option_a"
                required
                value={formData.option_a}
                onChange={handleChange}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Option B *</label>
              <input
                type="text"
                name="option_b"
                required
                value={formData.option_b}
                onChange={handleChange}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Option C *</label>
              <input
                type="text"
                name="option_c"
                required
                value={formData.option_c}
                onChange={handleChange}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Option D *</label>
              <input
                type="text"
                name="option_d"
                required
                value={formData.option_d}
                onChange={handleChange}
                className="input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">
                Correct Option *
              </label>
              <select
                name="correct_option"
                value={formData.correct_option}
                onChange={handleChange}
                className="input text-xs"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Detailed Solution / Explanation
            </label>
            <textarea
              name="explanation"
              rows="3"
              placeholder="Explain the intuition and reasoning for the correct option..."
              value={formData.explanation}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Publish Challenge
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
