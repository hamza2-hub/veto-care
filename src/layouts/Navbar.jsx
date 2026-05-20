import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Search, Bell, Plus, User, Settings, LogOut, X, Check, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import Button from '../components/common/Button';
import SettingsModal from '../components/common/SettingsModal';
import { toast } from 'react-hot-toast';
import '../styles/layout/layout.css';

const Navbar = ({ toggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const { user, profile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const userRole = profile?.role || 'user';
  const fullName = profile?.full_name || 'User';
  
  const settingsUser = {
    firstName: fullName.split(' ')[0],
    lastName: fullName.split(' ').slice(1).join(' '),
    email: user?.email || '',
  };
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  
  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="navbar flex items-center justify-between">
      <div className="navbar-left flex items-center gap-4">
        <button className="menu-btn hover-bg" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder={t('navbar.search')} className="search-input" />
        </div>
      </div>

      <div className="navbar-right flex items-center gap-4">
        {userRole === 'doctor' && (
          <Button variant="primary" className="add-btn hide-mobile" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> {t('navbar.add_patient')}
          </Button>
        )}

        <div className="relative" ref={notifDropdownRef}>
          <button 
            className="notification-btn hover-bg relative"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="dropdown-menu" style={{ width: '320px', right: '-60px' }}>
              <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-100">
                <h3 className="font-bold text-sm">{t('navbar.notifications')}</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                    className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Check size={14} /> {t('navbar.mark_read')}
                  </button>
                )}
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-sm">
                    {t('navbar.no_notifications')}
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-zinc-50 cursor-pointer transition-colors hover:bg-zinc-50 flex gap-3 ${!notif.read ? 'bg-emerald-50/30' : ''}`}
                    >
                      <div className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${!notif.read ? 'bg-emerald-500' : 'bg-transparent'}`} />
                      <div>
                        <p className={`text-sm ${!notif.read ? 'font-semibold text-zinc-900' : 'text-zinc-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileDropdownRef}>
          <div 
            className="profile-wrapper flex items-center gap-3 cursor-pointer hover-bg"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="profile-info text-right hide-mobile">
              <p className="profile-name">{fullName}</p>
              <p className="profile-role text-muted text-sm capitalize">{userRole === 'doctor' ? 'Veterinarian' : 'Pet Owner'}</p>
            </div>
            <div className="avatar">
              {fullName.charAt(0)}
            </div>
          </div>

          {isProfileOpen && (
            <div className="dropdown-menu">
              <button 
                className="dropdown-item" 
                onClick={() => { setIsProfileOpen(false); setSettingsTab('profile'); setIsSettingsModalOpen(true); }}
              >
                <User size={18} /> {t('navbar.profile')}
              </button>
              <button 
                className="dropdown-item" 
                onClick={() => { setIsProfileOpen(false); setSettingsTab('preferences'); setIsSettingsModalOpen(true); }}
              >
                <Settings size={18} /> {t('navbar.settings')}
              </button>
              <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }}></div>
              <button className="dropdown-item danger" onClick={logout}>
                <LogOut size={18} /> {t('navbar.logout')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Patient</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              setIsModalOpen(false); 
              toast.success('Patient added successfully!'); 
            }}>
              <div className="form-group">
                <label className="form-label">Owner Name</label>
                <input type="text" className="form-input" placeholder="e.g. Jane Smith" required />
              </div>
              <div className="form-group">
                <label className="form-label">Pet Name</label>
                <input type="text" className="form-input" placeholder="e.g. Bella" required />
              </div>
              <div className="form-group">
                <label className="form-label">Pet Type / Breed</label>
                <input type="text" className="form-input" placeholder="e.g. Dog / Golden Retriever" required />
              </div>
              <div className="flex gap-4 mt-6 justify-end">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Patient</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        initialTab={settingsTab}
        user={settingsUser}
      />
    </header>
  );
};

export default Navbar;
