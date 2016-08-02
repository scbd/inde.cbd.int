define(['app','directives/side-menu/scbd-side-menu'], function (app,_) {

app.factory("adminOrgMenu", ['scbdMenuService', function(scbdMenuService) {


        //var extended = angular.extend(scbdMenuService, {});
        //console.log(extended);
        scbdMenuService.menus.admin= [];
        scbdMenuService.menus.admin.push({
          type: 'config',
          menuClass:'dash-menu',
          colorClass: 'dash-menu-color',
          activeClass: 'dash-menu-active',
          iconClass: 'pulse',
          selfMenu: scbdMenuService.menus.admin,// needed shouls be added programatically in parent service
          childrenColorClass: 'dash-menu-children-color',
          childrenActiveClass: 'dash-menu-children-active'
        });
        scbdMenuService.menus.admin.push({
          name: 'Admin Dashboard',
          type: 'link',
          mdIcon: 'dashboard',
          path: '/admin',
          roles:['Administrator','IndeAdministrator'],
        });
        // scbdMenuService.menus.admin.push({
        //   name: 'Side Events',
        //   type: 'link',
        //   path: '/admin/events',
        //   mdIcon: 'event',
        //   roles:['Administrator','IndeAdministrator'],
        // });

        scbdMenuService.menus.admin.push({
          name: 'Organizations',
          type: 'link',
          path: '/admin/organizations',
          mdIcon: 'business',
          roles:['Administrator','IndeAdministrator'],
        });

        scbdMenuService.menus.adminOrgOptions= [];
        scbdMenuService.menus.adminOrgOptions.push({
          type: 'config',
          menuClass:'dash-menu',
          colorClass: 'dash-menu-color',
          activeClass: 'dash-menu-active',
          iconClass: 'pulse',
          selfMenu: scbdMenuService.menus.adminOrgOptions,// needed shouls be added programatically in parent service
          childrenColorClass: 'dash-menu-children-color',
          childrenActiveClass: 'dash-menu-children-active'
        });
        scbdMenuService.menus.adminOrgOptions.push({
          name: 'New',
          type: 'link',
          mdIcon: 'add_box',
          path: '/manage/organizations/new',
          roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.adminOrgOptions.push({
          name: 'Organizations',
          type: 'link',
          mdIcon: 'unarchive',
          path: '/admin/organizations/',
                  roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.adminOrgOptions.push({
          name: 'Archives',
          type: 'link',
          mdIcon: 'archive',
          path: '',
          roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.adminOrgOptions.push({
          name: 'Sort',
          type: 'link',
          mdIcon: 'sort_by_alpha',
          path: '',
          roles:['Administrator','IndeAdministrator'],
        });

        scbdMenuService.menus.adminOrgOptions.push({
          name: 'Filter',
          type: 'toggle',
          open:0,
          mdIcon: 'filter_list',
          roles:['Administrator','IndeAdministrator'],
          pages: [
            {
              name: 'All',
              type: 'link',
              path: '',
              mdIcon: 'all_inclusive',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Drafts',
              type: 'link',
              path: '',
              mdIcon: 'insert_drive_file',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Requests',
              type: 'link',
              path: '',
              mdIcon: 'live_help',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Under Review',
              type: 'link',
              path: '',
              mdIcon: 'thumb_up',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Canceled',
              type: 'link',
              path: '',
              mdIcon: 'thumbs_up_down',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Rejected',
              type: 'link',
              path: '',
              mdIcon: 'view_module',
              roles:['Administrator','IndeAdministrator'],
            },

          ]
        });
        scbdMenuService.menus.adminOrgOptions.push({
          name: 'View',
          type: 'toggle',
          open:0,
          mdIcon: 'remove_red_eye',
          roles:['Administrator','IndeAdministrator'],
          pages: [

            {
              name: 'List View',
              type: 'link',
              path: '',
              mdIcon: 'view_list',
              roles:['Administrator','IndeAdministrator'],
            },
        ],
        });

        scbdMenuService.buildLinks(scbdMenuService.menus.adminOrgOptions);

        scbdMenuService.validateMenus(); // minds color classes and animation ect

        return scbdMenuService;
  }]);
});