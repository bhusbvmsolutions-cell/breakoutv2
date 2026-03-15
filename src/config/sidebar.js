// Sidebar menu configuration with permission requirements
const sidebarConfig = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'bi-speedometer2',
    path: '/admin/dashboard',
    permission: { resource: 'dashboard', action: 'read' },
    order: 1
  },
  {
    id: 'users',
    title: 'User Management',
    icon: 'bi-people',
    path: '/admin/users',
    permission: { resource: 'users', action: 'read' },
    order: 2,
    submenu: [
      {
        id: 'users-list',
        title: 'All Users',
        path: '/admin/users',
        permission: { resource: 'users', action: 'read' },
        icon: 'bi-list-ul'
      },
      {
        id: 'users-create',
        title: 'Add New User',
        path: '/admin/users/create',
        permission: { resource: 'users', action: 'create' },
        icon: 'bi-person-plus'
      },
      {
        id: 'users-roles',
        title: 'Manage Roles',
        path: '/admin/roles',
        permission: { resource: 'roles', action: 'read' },
        icon: 'bi-shield'
      }
    ]
  },
  {
    id: 'roles',
    title: 'Roles & Permissions',
    icon: 'bi-shield-lock',
    path: '/admin/roles',
    permission: { resource: 'roles', action: 'read' },
    order: 3,
    submenu: [
      {
        id: 'roles-list',
        title: 'All Roles',
        path: '/admin/roles',
        permission: { resource: 'roles', action: 'read' },
        icon: 'bi-list-ul'
      },
      {
        id: 'roles-create',
        title: 'Create Role',
        path: '/admin/roles/create',
        permission: { resource: 'roles', action: 'create' },
        icon: 'bi-plus-circle'
      },
      {
        id: 'permissions-list',
        title: 'Permissions',
        path: '/admin/permissions',
        permission: { resource: 'permissions', action: 'read' },
        icon: 'bi-key'
      }
    ]
  },
  {
    id: 'content',
    title: 'Content Management',
    icon: 'bi-file-text',
    path: '/admin/content',
    permission: { resource: 'content', action: 'read' },
    order: 4,
    submenu: [
      {
        id: 'posts',
        title: 'Posts',
        path: '/admin/posts',
        permission: { resource: 'posts', action: 'read' },
        icon: 'bi-file-post'
      },
      {
        id: 'pages',
        title: 'Pages',
        path: '/admin/pages',
        permission: { resource: 'pages', action: 'read' },
        icon: 'bi-files'
      },
      {
        id: 'media',
        title: 'Media Library',
        path: '/admin/media',
        permission: { resource: 'media', action: 'read' },
        icon: 'bi-images'
      },
      {
        id: 'categories',
        title: 'Categories',
        path: '/admin/categories',
        permission: { resource: 'categories', action: 'read' },
        icon: 'bi-tags'
      }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'bi-gear',
    path: '/admin/settings',
    permission: { resource: 'settings', action: 'read' },
    order: 5,
    submenu: [
      {
        id: 'general-settings',
        title: 'General',
        path: '/admin/settings/general',
        permission: { resource: 'settings', action: 'update' },
        icon: 'bi-sliders'
      },
      {
        id: 'email-settings',
        title: 'Email',
        path: '/admin/settings/email',
        permission: { resource: 'settings', action: 'update' },
        icon: 'bi-envelope'
      },
      {
        id: 'security-settings',
        title: 'Security',
        path: '/admin/settings/security',
        permission: { resource: 'settings', action: 'update' },
        icon: 'bi-shield-check'
      }
    ]
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: 'bi-graph-up',
    path: '/admin/reports',
    permission: { resource: 'reports', action: 'read' },
    order: 6,
    submenu: [
      {
        id: 'user-reports',
        title: 'User Reports',
        path: '/admin/reports/users',
        permission: { resource: 'reports', action: 'read' },
        icon: 'bi-people'
      },
      {
        id: 'activity-logs',
        title: 'Activity Logs',
        path: '/admin/reports/activity',
        permission: { resource: 'reports', action: 'read' },
        icon: 'bi-clock-history'
      }
    ]
  },
  {
    id: 'system',
    title: 'System',
    icon: 'bi-cpu',
    path: '/admin/system',
    permission: { resource: 'system', action: 'read' },
    order: 7,
    submenu: [
      {
        id: 'system-info',
        title: 'System Info',
        path: '/admin/system/info',
        permission: { resource: 'system', action: 'read' },
        icon: 'bi-info-circle'
      },
      {
        id: 'database',
        title: 'Database',
        path: '/admin/system/database',
        permission: { resource: 'system', action: 'manage' },
        icon: 'bi-database'
      },
      {
        id: 'cache',
        title: 'Cache Management',
        path: '/admin/system/cache',
        permission: { resource: 'system', action: 'manage' },
        icon: 'bi-lightning'
      }
    ]
  }
];

module.exports = sidebarConfig;