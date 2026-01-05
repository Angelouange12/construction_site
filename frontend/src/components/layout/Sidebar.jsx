import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardList, 
  Users, 
  UserCheck,
  Package, 
  DollarSign, 
  AlertTriangle,
  BarChart3,
  Settings,
  Calendar,
  Clock,
  UserCog,
  FileText,
  User
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, canManage } = useAuth();

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Tableau de bord', 
      path: '/',
      show: true
    },
    { 
      icon: Building2, 
      label: 'Chantiers', 
      path: '/sites',
      show: true
    },
    { 
      icon: ClipboardList, 
      label: 'Tâches', 
      path: '/tasks',
      show: true
    },
    { 
      icon: Calendar, 
      label: 'Calendrier', 
      path: '/calendar',
      show: canManage()
    },
    { 
      icon: Users, 
      label: 'Ouvriers', 
      path: '/workers',
      show: canManage()
    },
    { 
      icon: UserCog, 
      label: 'Affectations', 
      path: '/assignments',
      show: canManage()
    },
    { 
      icon: UserCheck, 
      label: 'Présences', 
      path: '/attendance',
      show: canManage()
    },
    { 
      icon: Clock, 
      label: 'Feuilles de temps', 
      path: '/timesheets',
      show: canManage()
    },
    { 
      icon: Package, 
      label: 'Matériaux', 
      path: '/materials',
      show: canManage()
    },
    { 
      icon: DollarSign, 
      label: 'Dépenses', 
      path: '/expenses',
      show: canManage()
    },
    { 
      icon: AlertTriangle, 
      label: 'Incidents', 
      path: '/incidents',
      show: true
    },
    { 
      icon: BarChart3, 
      label: 'Rapports', 
      path: '/reports',
      show: canManage()
    },
    { 
      icon: FileText, 
      label: 'Journal d\'audit', 
      path: '/audit-logs',
      show: isAdmin()
    },
    { 
      icon: Settings, 
      label: 'Utilisateurs', 
      path: '/users',
      show: isAdmin()
    },
    { 
      icon: User, 
      label: 'Mon Profil', 
      path: '/profile',
      show: true
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-slate-900 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        overflow-y-auto
      `}>
        {/* Close button - mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800 lg:hidden"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Navigation */}
        <nav className="p-4 space-y-1 mt-4 lg:mt-0">
          {navItems.filter(item => item.show).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-slate-800 bg-slate-900">
          <div className="text-center">
            <p className="text-xs text-slate-500">ConstructPro v2.0</p>
            <p className="text-xs text-slate-600">© 2026 Gestion de Chantier - Burundi</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
