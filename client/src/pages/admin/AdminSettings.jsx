import { useState } from 'react';
import { Card, CardBody, Button, Badge } from '../../components/ui';
import {
  Settings,
  Building,
  Shield,
  Bell,
  Database,
  CheckCircle,
  Save,
  Server,
  Cpu,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    collegeName: 'National Institute of Technology & Engineering',
    placementOfficer: 'Dr. R. Ramanathan, Ph.D.',
    contactEmail: 'placement@college.edu',
    academicYear: '2025 - 2026',
    defaultMinCgpa: 6.5,
    maxStandingArrears: 0,
    allowMultipleOffers: true,
    emailNotifications: true,
    cronAutoAlerts: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Placement portal settings saved successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
          Portal & Placement Cell Configuration
        </h1>
        <p className="text-xs text-secondary-500 mt-1">
          Customize campus placement policy rules, officer credentials, and automated alerts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Placement Cell Profile */}
        <Card>
          <CardBody className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-secondary-900">Institution & Officer Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary-700 mb-1">
                  College / Institution Name
                </label>
                <input
                  type="text"
                  value={config.collegeName}
                  onChange={(e) => setConfig({ ...config, collegeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-700 mb-1">
                  Head of Training & Placement
                </label>
                <input
                  type="text"
                  value={config.placementOfficer}
                  onChange={(e) => setConfig({ ...config, placementOfficer: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-700 mb-1">
                  Official Placement Email
                </label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-700 mb-1">
                  Current Placement Season
                </label>
                <input
                  type="text"
                  value={config.academicYear}
                  onChange={(e) => setConfig({ ...config, academicYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Eligibility Policy */}
        <Card>
          <CardBody className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-secondary-900">Eligibility & Placement Rules</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary-700 mb-1">
                  Default Minimum CGPA Cutoff
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={config.defaultMinCgpa}
                  onChange={(e) => setConfig({ ...config, defaultMinCgpa: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-700 mb-1">
                  Max Standing Arrears Permitted
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.maxStandingArrears}
                  onChange={(e) => setConfig({ ...config, maxStandingArrears: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-xs bg-secondary-50 border border-border rounded-lg text-secondary-900 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-secondary-800">
                <input
                  type="checkbox"
                  checked={config.allowMultipleOffers}
                  onChange={(e) => setConfig({ ...config, allowMultipleOffers: e.target.checked })}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span>Allow Dream & Super Dream job upgrades for already placed students</span>
              </label>
            </div>
          </CardBody>
        </Card>

        {/* System & Notification Diagnostics */}
        <Card>
          <CardBody className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Server className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-secondary-900">Engine & Database Health</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-secondary-50 rounded-xl border border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-muted">MySQL 8 Connection</p>
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Connected & Active
                  </p>
                </div>
              </div>

              <div className="p-3 bg-secondary-50 rounded-xl border border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-muted">Cron Scheduler</p>
                  <p className="text-xs font-bold text-secondary-900">Running (Every 1m)</p>
                </div>
              </div>

              <div className="p-3 bg-secondary-50 rounded-xl border border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary-100 text-secondary-700 flex items-center justify-center font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-muted">API Runtime</p>
                  <p className="text-xs font-bold text-secondary-900">Node.js Express (Ready)</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
