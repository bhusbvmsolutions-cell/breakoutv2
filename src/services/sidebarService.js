const sidebarConfig = require('../config/sidebar');
const { userHasPermission } = require('../utils/rbacHelper');

class SidebarService {
  /**
   * Filter menu items based on user permissions
   */
  static getFilteredMenu(user) {
    if (!user) return [];

    // Super admin sees everything
    const isSuper = user.roles?.some(role => role.name === 'super_admin');
    if (isSuper) {
      return this.sortMenuItems(sidebarConfig);
    }

    // Filter menu based on permissions
    const filteredMenu = sidebarConfig.filter(item => {
      // Check main menu item permission
      const hasMainPermission = this.checkPermission(user, item.permission);
      
      if (!hasMainPermission) return false;

      // If item has submenu, filter submenu items
      if (item.submenu && item.submenu.length > 0) {
        const filteredSubmenu = item.submenu.filter(subItem => 
          this.checkPermission(user, subItem.permission)
        );
        
        // Only include main menu if it has visible submenu items
        if (filteredSubmenu.length === 0) {
          // If no submenu items but main item has direct path, keep it
          return item.path ? true : false;
        }
        
        // Update submenu with filtered items
        item.visibleSubmenu = filteredSubmenu;
      }

      return true;
    });

    return this.sortMenuItems(filteredMenu);
  }

  /**
   * Check if user has permission for a menu item
   */
  static checkPermission(user, permission) {
    if (!permission) return true; // No permission required
    
    const { resource, action } = permission;
    
    // Super admin check
    if (user.roles?.some(role => role.name === 'super_admin')) {
      return true;
    }

    // Check specific permission
    return userHasPermission(user, resource, action);
  }

  /**
   * Sort menu items by order
   */
  static sortMenuItems(menuItems) {
    return menuItems.sort((a, b) => (a.order || 999) - (b.order || 999));
  }

  /**
   * Get current active menu item based on URL
   */
  static getActiveMenu(currentUrl, menuItems) {
    let activeItem = null;
    let activeParent = null;

    for (const item of menuItems) {
      // Check if current URL matches this item
      if (item.path && currentUrl.startsWith(item.path)) {
        activeItem = item;
        break;
      }

      // Check submenu items
      if (item.submenu || item.visibleSubmenu) {
        const submenu = item.submenu || item.visibleSubmenu;
        for (const subItem of submenu) {
          if (subItem.path && currentUrl.startsWith(subItem.path)) {
            activeItem = subItem;
            activeParent = item;
            break;
          }
        }
      }

      if (activeItem) break;
    }

    return { activeItem, activeParent };
  }

  /**
   * Generate breadcrumb navigation
   */
  static getBreadcrumb(currentUrl, menuItems, pageTitle) {
    const breadcrumb = [];
    const { activeItem, activeParent } = this.getActiveMenu(currentUrl, menuItems);

    if (activeParent) {
      breadcrumb.push({
        title: activeParent.title,
        path: activeParent.path,
        icon: activeParent.icon
      });
    }

    if (activeItem && activeItem !== activeParent) {
      breadcrumb.push({
        title: activeItem.title,
        path: activeItem.path,
        icon: activeItem.icon
      });
    }

    // If no breadcrumb from menu, use page title
    if (breadcrumb.length === 0 && pageTitle) {
      breadcrumb.push({
        title: pageTitle,
        path: currentUrl
      });
    }

    return breadcrumb;
  }

  /**
   * Check if user can access a specific path
   */
  static canAccessPath(user, path) {
    const allMenuItems = this.getAllMenuItems(sidebarConfig);
    const menuItem = allMenuItems.find(item => item.path === path);
    
    if (!menuItem) return true; // Path not in menu, assume accessible
    
    return this.checkPermission(user, menuItem.permission);
  }

  /**
   * Get all menu items flattened (including submenu items)
   */
  static getAllMenuItems(menuItems) {
    let allItems = [];
    
    for (const item of menuItems) {
      allItems.push(item);
      
      if (item.submenu && item.submenu.length > 0) {
        allItems = allItems.concat(item.submenu);
      }
    }
    
    return allItems;
  }

  /**
   * Get menu items for a specific module
   */
  static getModuleMenu(moduleId, user) {
    const module = sidebarConfig.find(item => item.id === moduleId);
    if (!module) return null;

    const filteredModule = { ...module };
    
    if (module.submenu) {
      filteredModule.submenu = module.submenu.filter(subItem =>
        this.checkPermission(user, subItem.permission)
      );
    }

    return this.checkPermission(user, module.permission) ? filteredModule : null;
  }
}

module.exports = SidebarService;