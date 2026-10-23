import { useState, useEffect } from 'react';
import { codingService } from '../../services/codingService';
import { Card, CardBody, Button, Badge, Skeleton, Modal } from '../../components/ui';
import {
  Code2,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  XCircle,
  FileCode2,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Arrays & Hashing',
  'Strings',
  'Two Pointers',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees & Graphs',
  'Dynamic Programming',
  'Math & Bit Manipulation',
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const DIFFICULTY_COLORS = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

const DEFAULT_STARTER_C = `#include <stdio.h>

int main() {
    // Read input from standard input
    
    // Write your code here
    
    return 0;
}`;

const DEFAULT_STARTER_JAVA = `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your code here
        
    }
}`;

export default function AdminCodingQuestions() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'medium',
    category: 'Arrays & Hashing',
    points: 50,
    time_limit: 2000,
    description: '',
    input_format: '',
    output_format: '',
    constraints: '',
    sample_input: '',
    sample_output: '',
    explanation: '',
    starter_c: DEFAULT_STARTER_C,
    starter_java: DEFAULT_STARTER_JAVA,
    test_cases: [
      { input: '', expected_output: '', is_hidden: false },
      { input: '', expected_output: '', is_hidden: true },
    ],
  });

  useEffect(() => {
    loadQuestions();
  }, [category]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await codingService.getQuestions({
        category: category || undefined,
        search: search.trim() || undefined,
        limit: 50,
      });

      if (res.success && res.data) {
        setQuestions(res.data.items || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load coding questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadQuestions();
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      difficulty: 'medium',
      category: 'Arrays & Hashing',
      points: 50,
      time_limit: 2000,
      description: '',
      input_format: '',
      output_format: '',
      constraints: '',
      sample_input: '',
      sample_output: '',
      explanation: '',
      starter_c: DEFAULT_STARTER_C,
      starter_java: DEFAULT_STARTER_JAVA,
      test_cases: [
        { input: '', expected_output: '', is_hidden: false },
        { input: '', expected_output: '', is_hidden: true },
      ],
    });
    setModalOpen(true);
  };

  const openEditModal = async (q) => {
    setEditingId(q.id);
    try {
      const res = await codingService.getQuestionById(q.id);
      if (res.success && res.data) {
        const fullQ = res.data;
        let tcs = fullQ.test_cases;
        if (typeof tcs === 'string') {
          try {
            tcs = JSON.parse(tcs);
          } catch {
            tcs = [];
          }
        }
        if (!Array.isArray(tcs) || tcs.length === 0) {
          tcs = [{ input: '', expected_output: '', is_hidden: false }];
        }

        setFormData({
          title: fullQ.title || '',
          difficulty: fullQ.difficulty || 'medium',
          category: fullQ.category || 'Arrays & Hashing',
          points: fullQ.points || 50,
          time_limit: fullQ.time_limit || 2000,
          description: fullQ.description || '',
          input_format: fullQ.input_format || '',
          output_format: fullQ.output_format || '',
          constraints: fullQ.constraints || '',
          sample_input: fullQ.sample_input || '',
          sample_output: fullQ.sample_output || '',
          explanation: fullQ.explanation || '',
          starter_c: fullQ.starter_c || DEFAULT_STARTER_C,
          starter_java: fullQ.starter_java || DEFAULT_STARTER_JAVA,
          test_cases: tcs,
        });
        setModalOpen(true);
      }
    } catch (err) {
      toast.error('Failed to load problem details.');
    }
  };

  const handleAddTestCase = () => {
    setFormData((prev) => ({
      ...prev,
      test_cases: [...prev.test_cases, { input: '', expected_output: '', is_hidden: true }],
    }));
  };

  const handleRemoveTestCase = (index) => {
    if (formData.test_cases.length <= 1) {
      toast.error('At least one testcase is required.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      test_cases: prev.test_cases.filter((_, i) => i !== index),
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.test_cases];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, test_cases: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required.');
      return;
    }

    if (formData.test_cases.some((tc) => !tc.input.trim() || !tc.expected_output.trim())) {
      toast.error('All test cases must have input and expected output filled.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        points: parseInt(formData.points, 10),
        time_limit: parseInt(formData.time_limit, 10),
        test_cases: formData.test_cases,
      };

      if (editingId) {
        const res = await codingService.updateQuestion(editingId, payload);
        if (res.success) {
          toast.success('Coding question updated successfully!');
          setModalOpen(false);
          loadQuestions();
        }
      } else {
        const res = await codingService.createQuestion(payload);
        if (res.success) {
          toast.success('Coding question posted successfully!');
          setModalOpen(false);
          loadQuestions();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coding question?')) return;
    try {
      const res = await codingService.deleteQuestion(id);
      if (res.success) {
        toast.success('Coding question deleted.');
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      toast.error('Failed to delete question.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            Coding Challenges Management
          </h1>
          <p className="text-xs text-secondary-500 mt-1">
            Author and publish algorithmic coding problems evaluated with native C and Java compilers.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Post Coding Question
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border">
        <CardBody className="p-4 flex items-center justify-between flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search coding problem..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-60 pl-8 pr-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
            <option value="">All Topics</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </CardBody>
      </Card>

      {/* Questions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary-50 text-secondary-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Title & Problem</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Languages Supported</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan="6" className="py-3 px-4">
                      <Skeleton className="w-full h-8" />
                    </td>
                  </tr>
                ))
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted">
                    No coding questions posted yet. Click "Post Coding Question" to author one.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-secondary-50/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-secondary-900">{q.title}</div>
                      <div className="text-[11px] text-muted line-clamp-1">{q.description_snippet}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="outline" size="sm">
                        {q.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={DIFFICULTY_COLORS[q.difficulty?.toLowerCase()] || 'secondary'} size="sm">
                        {q.difficulty?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-primary">
                      +{q.points} pts
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-secondary-100 text-[10px] font-bold">C</span>
                        <span className="px-1.5 py-0.5 rounded bg-secondary-100 text-[10px] font-bold">Java</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(q)}
                          className="h-7 w-7 p-0 text-secondary-600 hover:text-secondary-900"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(q.id)}
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

      {/* Post / Edit Coding Question Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Coding Question' : 'Post New Coding Question'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          {/* Title & Difficulty Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Problem Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g. Longest Substring Without Repeating Characters"
                className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Topic / Category *</label>
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

            <div className="sm:col-span-3">
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

          {/* Problem Statement */}
          <div>
            <label className="block text-xs font-semibold text-secondary-700 mb-1">
              Problem Description *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Detailed algorithmic problem statement..."
              className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Input Format, Output Format, Constraints */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Input Format</label>
              <textarea
                rows={2}
                value={formData.input_format}
                onChange={(e) => setFormData({ ...formData, input_format: e.target.value })}
                placeholder="First line contains N..."
                className="w-full px-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Output Format</label>
              <textarea
                rows={2}
                value={formData.output_format}
                onChange={(e) => setFormData({ ...formData, output_format: e.target.value })}
                placeholder="Print space-separated..."
                className="w-full px-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Constraints</label>
              <textarea
                rows={2}
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                placeholder="1 <= N <= 10^5..."
                className="w-full px-3 py-1.5 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Sample Input / Output */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Sample Input</label>
              <textarea
                rows={3}
                value={formData.sample_input}
                onChange={(e) => setFormData({ ...formData, sample_input: e.target.value })}
                placeholder="Sample stdin input..."
                className="w-full px-3 py-1.5 text-xs font-mono bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-700 mb-1">Sample Output</label>
              <textarea
                rows={3}
                value={formData.sample_output}
                onChange={(e) => setFormData({ ...formData, sample_output: e.target.value })}
                placeholder="Expected stdout output..."
                className="w-full px-3 py-1.5 text-xs font-mono bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Test Cases Builder */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-secondary-900">Automated Test Cases</p>
                <p className="text-[11px] text-muted">Evaluated automatically by C and Java compiler</p>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={handleAddTestCase} className="text-xs">
                <PlusCircle className="w-3.5 h-3.5 mr-1 text-primary" /> Add Test Case
              </Button>
            </div>

            <div className="space-y-2.5">
              {formData.test_cases.map((tc, idx) => (
                <div key={idx} className="p-3 bg-secondary-50 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-secondary-800">Test Case #{idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-secondary-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.is_hidden}
                          onChange={(e) => handleTestCaseChange(idx, 'is_hidden', e.target.checked)}
                          className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span>Hidden Test Case</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-red-500 hover:text-red-700 p-0.5"
                        title="Delete test case"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <textarea
                      rows={2}
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                      placeholder="Input..."
                      className="w-full px-2.5 py-1 text-xs font-mono bg-surface border border-border rounded"
                    />
                    <textarea
                      rows={2}
                      value={tc.expected_output}
                      onChange={(e) => handleTestCaseChange(idx, 'expected_output', e.target.value)}
                      placeholder="Expected Output..."
                      className="w-full px-2.5 py-1 text-xs font-mono bg-surface border border-border rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Question' : 'Post Question'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
