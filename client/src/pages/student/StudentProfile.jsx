import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  ProgressBar,
  Badge,
  Skeleton,
} from '../../components/ui';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  FileText,
  Upload,
  Plus,
  X,
  ExternalLink,
  Globe,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';

const POPULAR_SKILLS = [
  'Java', 'Python', 'C++', 'JavaScript', 'React', 'Node.js',
  'Spring Boot', 'MySQL', 'PostgreSQL', 'Docker', 'AWS',
  'Machine Learning', 'Data Structures', 'Algorithms', 'SQL',
];

export default function StudentProfile() {
  const { user, updateUserProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    cgpa: '',
    tenth_percentage: '',
    twelfth_percentage: '',
    diploma_percentage: '',
    standing_arrears: '0',
    history_arrears: '0',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await studentService.getProfile();
      if (res.success) {
        setProfile(res.data);
        setFormData({
          full_name: res.data.full_name || '',
          phone: res.data.phone || '',
          cgpa: res.data.cgpa || '',
          tenth_percentage: res.data.tenth_percentage || '',
          twelfth_percentage: res.data.twelfth_percentage || '',
          diploma_percentage: res.data.diploma_percentage || '',
          standing_arrears: String(res.data.standing_arrears ?? '0'),
          history_arrears: String(res.data.history_arrears ?? '0'),
          github_url: res.data.github_url || '',
          linkedin_url: res.data.linkedin_url || '',
          portfolio_url: res.data.portfolio_url || '',
          bio: res.data.bio || '',
        });
      }
    } catch (err) {
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await studentService.updateProfile(formData);
      if (res.success) {
        setProfile(res.data);
        updateUserProfile({ full_name: res.data.full_name, cgpa: res.data.cgpa });
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (skillNameToAdd = null) => {
    const skillName = (skillNameToAdd || newSkill).trim();
    if (!skillName) return;

    try {
      const res = await studentService.addSkill(skillName, newSkillProficiency);
      if (res.success) {
        setProfile((prev) => ({ ...prev, skills: res.data }));
        setNewSkill('');
        toast.success(`Skill "${skillName}" added!`);
      }
    } catch (err) {
      toast.error('Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      const res = await studentService.deleteSkill(skillId);
      if (res.success) {
        setProfile((prev) => ({ ...prev, skills: res.data }));
        toast.success('Skill removed');
      }
    } catch (err) {
      toast.error('Failed to remove skill.');
    }
  };

  const handleResumeFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF format resume.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume size must be under 5MB.');
      return;
    }

    const form = new FormData();
    form.append('resume', file);

    try {
      setResumeUploading(true);
      const res = await studentService.uploadResume(form);
      if (res.success) {
        setProfile((prev) => ({ ...prev, resume_url: res.data.resume_url }));
        toast.success('Resume PDF uploaded and linked to profile!');
      }
    } catch (err) {
      toast.error('Resume upload failed.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo size must be under 2MB.');
      return;
    }

    const form = new FormData();
    form.append('photo', file);

    try {
      setPhotoUploading(true);
      const res = await studentService.uploadPhoto(form);
      if (res.success) {
        setProfile((prev) => ({ ...prev, photo_url: res.data.photo_url }));
        toast.success('Profile photo updated!');
      }
    } catch (err) {
      toast.error('Photo upload failed.');
    } finally {
      setPhotoUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Profile Header with Completeness ─────────────────── */}
      <Card className="p-6 bg-gradient-to-r from-surface via-primary-50/30 to-surface border-primary/20">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Avatar with Upload Button */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-primary-100 text-primary border-2 border-primary-200 flex items-center justify-center font-bold text-2xl overflow-hidden shadow-md">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name?.charAt(0) || 'S'
                )}
              </div>
              <label
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-lg cursor-pointer shadow hover:bg-primary-600 transition-colors"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handlePhotoFileChange} className="hidden" />
              </label>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-secondary-900">{profile?.full_name}</h1>
                <Badge status="published">{profile?.department}</Badge>
              </div>
              <p className="text-xs text-muted">
                {profile?.register_number} • {profile?.course} ({profile?.batch}) • Graduating {profile?.graduation_year}
              </p>
              <p className="text-xs text-secondary-600 max-w-lg italic">
                {profile?.bio || 'Add a professional bio to introduce your engineering career focus.'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 p-3.5 rounded-xl bg-surface border border-border shadow-sm space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-secondary-800">
              <span>Profile Completeness</span>
              <span className="text-primary">{profile?.profile_completeness || 0}%</span>
            </div>
            <ProgressBar value={profile?.profile_completeness || 0} max={100} />
            <p className="text-[11px] text-muted">
              {profile?.profile_completeness >= 80 ? '✅ Ready for Campus Drives' : '⚠️ Fill academics & resume for 100%'}
            </p>
          </div>
        </div>
      </Card>

      {/* ─── Profile Form & Skills/Resume Grid ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Personal & Academic Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-secondary-900 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Personal & Academic Information
              </h2>
              <p className="text-xs text-muted">
                Keep your academic scores verified. Placement drives auto-check eligibility against these numbers.
              </p>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleProfileSave} className="space-y-4">
                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* CGPA, 10th %, 12th % */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                      Current CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      required
                      value={formData.cgpa}
                      onChange={handleInputChange}
                      placeholder="e.g. 8.75"
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                      10th Mark (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      name="tenth_percentage"
                      required
                      value={formData.tenth_percentage}
                      onChange={handleInputChange}
                      placeholder="e.g. 91.5"
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                      12th Mark (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      name="twelfth_percentage"
                      required
                      value={formData.twelfth_percentage}
                      onChange={handleInputChange}
                      placeholder="e.g. 88.0"
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Arrears: Standing & History */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                      Standing (Current) Backlogs
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      name="standing_arrears"
                      value={formData.standing_arrears}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                      History of Arrears (Cleared)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      name="history_arrears"
                      value={formData.history_arrears}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-secondary-700 uppercase tracking-wider mb-1">
                    Professional Bio
                  </label>
                  <textarea
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your programming expertise, key projects, and career aspirations..."
                    className="w-full px-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-secondary-800 uppercase tracking-wider">
                    Online Profiles & Portfolios
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                        <svg className="w-4 h-4 fill-current text-secondary-700" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                      </div>
                      <input
                        type="url"
                        name="github_url"
                        value={formData.github_url}
                        onChange={handleInputChange}
                        placeholder="https://github.com/yourhandle"
                        className="w-full pl-9 pr-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                        <svg className="w-4 h-4 fill-current text-blue-600" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </div>
                      <input
                        type="url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full pl-9 pr-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                        <Globe className="w-4 h-4 text-success" />
                      </div>
                      <input
                        type="url"
                        name="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleInputChange}
                        placeholder="https://yourportfolio.dev"
                        className="w-full pl-9 pr-3.5 py-2 bg-surface border border-border rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  className="w-full py-2.5 text-xs font-semibold mt-2"
                >
                  Save Academic & Profile Changes
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Right 5 Cols: Skills & Resume PDF Upload */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resume Uploader */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-secondary-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Verified Resume (PDF)
              </h2>
              <p className="text-xs text-muted">Used by placement admins for shortlist dispatch</p>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              {profile?.resume_url ? (
                <div className="p-3.5 rounded-xl bg-success-50 border border-success-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-success-900 truncate">Resume PDF Linked</p>
                      <p className="text-[10px] text-success-700 truncate">{profile.resume_url.split('/').pop()}</p>
                    </div>
                  </div>
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-surface text-secondary-800 text-xs font-semibold rounded-lg border border-border hover:bg-secondary-50 flex items-center gap-1 shrink-0"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-warning-50 border border-warning-200 text-warning-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>No resume uploaded yet. Upload your PDF resume.</span>
                </div>
              )}

              <label className="block">
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary hover:bg-primary-50/20 transition-all">
                  <Upload className="w-6 h-6 text-primary mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-secondary-800">
                    {resumeUploading ? 'Uploading PDF...' : 'Click to Upload / Replace Resume'}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">PDF format, max 5MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  disabled={resumeUploading}
                  onChange={handleResumeFileChange}
                  className="hidden"
                />
              </label>
            </CardBody>
          </Card>

          {/* Technical Skills Manager */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-secondary-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> Technical Skills
              </h2>
              <p className="text-xs text-muted">Skills match your eligibility score for drives</p>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              {/* Add Custom Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. React, Docker, Spring Boot"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button variant="primary" size="sm" onClick={() => handleAddSkill()} disabled={!newSkill.trim()}>
                  <Plus className="w-3.5 h-3.5 mr-0.5" /> Add
                </Button>
              </div>

              {/* Current Active Skills */}
              <div>
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                  My Active Skills ({profile?.skills?.length || 0})
                </p>
                <div className="flex flex-wrap gap-1.5 min-h-[48px]">
                  {profile?.skills && profile.skills.length > 0 ? (
                    profile.skills.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary-100 text-secondary-800 border border-border group"
                      >
                        {s.skill_name}
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(s.id)}
                          className="text-muted hover:text-danger rounded-full p-0.5"
                          title="Remove skill"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-muted italic">No skills added yet.</p>
                  )}
                </div>
              </div>

              {/* Suggested Skills */}
              <div className="pt-3 border-t border-border">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                  Suggested Placement Keywords
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.filter(
                    (ps) => !profile?.skills?.some((s) => s.skill_name.toLowerCase() === ps.toLowerCase())
                  ).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface border border-border text-secondary-700 hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5" /> {skill}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
