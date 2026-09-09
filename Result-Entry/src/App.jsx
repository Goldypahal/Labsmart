import React, { useState } from 'react'
import { Layout, Activity, UserPlus, FileText, Settings, LogOut, Search, Bell, Menu, Plus, CheckCircle2, ChevronRight, X } from 'lucide-react'
import ResultEntry from './components/ResultEntry'
import ReportPreview from './components/ReportPreview'

// Placeholder components
const Dashboard = ({ onViewReport }) => (
  <div className="dashboard-view animate-fade-in">
    <div className="section-header">
      <h2>Laboratory Dashboard</h2>
      <p>Welcome back, Dr. Sarah Admin</p>
    </div>
    
    <div className="stats-grid">
      <StatCard icon={<UserPlus />} label="New Registrations" value="48" trend="+12% from yesterday" color="#6366f1" />
      <StatCard icon={<FileText />} label="Pending Reports" value="12" trend="3 critical cases" color="#f59e0b" />
      <StatCard icon={<CheckCircle2 />} label="Reports Verified" value="156" trend="+24% this week" color="#10b981" />
      <StatCard icon={<Activity />} label="Daily Revenue" value="₹32,450" trend="+5% target reached" color="#6366f1" />
    </div>

    <div className="recent-activity glass-card mt-8">
      <h3>Recent Sample Submissions</h3>
      <table className="activity-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Sample ID</th>
            <th>Test Panel</th>
            <th>Registered At</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <RecentSampleRow name="Rohit Sharma" id="S0321" test="CBC, LFT" time="10:45 AM" status="Pending" onAction={onViewReport} />
          <RecentSampleRow name="Alice Johnson" id="S0322" test="KFT" time="11:02 AM" status="In Progress" onAction={onViewReport} />
          <RecentSampleRow name="Rahul Gupta" id="S0323" test="Lipid Profile" time="11:15 AM" status="Pending" onAction={onViewReport} />
        </tbody>
      </table>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="glass-card stat-card" style={{ '--card-accent': color }}>
    <div className="stat-icon-wrapper" style={{ background: color + '20', color: color }}>
      {icon}
    </div>
    <div className="stat-content">
      <span className="stat-label text-dim">{label}</span>
      <h3 className="stat-value">{value}</h3>
      <span className="stat-trend" style={{ color: trend.includes('+') ? '#10b981' : '#f59e0b' }}>
        {trend}
      </span>
    </div>
  </div>
);

const RecentSampleRow = ({ name, id, test, time, status, onAction }) => (
  <tr>
    <td>{name}</td>
    <td><code className="sample-id">{id}</code></td>
    <td>{test}</td>
    <td>{time}</td>
    <td><span className={`status-badge ${status.replace(' ', '-').toLowerCase()}`}>{status}</span></td>
    <td><button className="icon-btn-lite" onClick={onAction}><ChevronRight size={18} /></button></td>
  </tr>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [viewingReport, setViewingReport] = useState(false);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      {!viewingReport && (
        <aside className="main-sidebar glass-card">
          <div className="brand">
            <div className="logo-box">
              <Activity size={24} color="#6366f1" strokeWidth={3} />
            </div>
            <h1>PathLab</h1>
          </div>
          
          <nav className="sidebar-nav">
            <NavItem icon={<Layout size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<UserPlus size={20} />} label="Registration" active={activeTab === 'registration'} onClick={() => setActiveTab('registration')} />
            <NavItem icon={<Plus size={20} />} label="Order Tests" active={activeTab === 'order'} onClick={() => setActiveTab('order')} />
            <NavItem icon={<FileText size={20} />} label="Result Entry" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
            <NavItem icon={<Settings size={20} />} label="Admin Panel" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
          </nav>

          <div className="user-section">
            <div className="user-profile">
              <div className="avatar">SA</div>
              <div className="user-info">
                <span className="user-name">Sarah Admin</span>
                <span className="user-role text-dim">Super Admin</span>
              </div>
              <LogOut size={16} className="logout-icon text-dim" />
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="main-viewport">
        {!viewingReport && (
          <header className="top-navbar glass-card">
            <div className="search-box">
              <Search size={18} className="text-dim" />
              <input type="text" placeholder="Quick search patients or UHID (Ctrl + K)..." />
            </div>
            <div className="top-nav-actions">
              <div className="notif-btn">
                <Bell size={20} className="text-dim" />
                <span className="notif-badge"></span>
              </div>
              <button className="primary-btn"><Plus size={18} /> New Patient</button>
            </div>
          </header>
        )}

        <div className="content-scroll">
          {viewingReport ? (
            <ReportPreview onBack={() => setViewingReport(false)} />
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard onViewReport={() => setViewingReport(true)} />}
              {activeTab === 'results' && <ResultEntry />}
              {activeTab !== 'dashboard' && activeTab !== 'results' && <div><h2>{activeTab.charAt(4).toUpperCase() + activeTab.slice(4)} Module</h2><p className="text-dim mt-2">Coming soon in Phase 1.</p></div>}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </div>
  )
}
