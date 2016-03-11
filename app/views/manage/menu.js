define(['app','directives/side-menu/scbd-menu-service'], function (app,_) {

app.factory("dashMenu", ['scbdMenuService', function(scbdMenuService) {


        //var extended = angular.extend(scbdMenuService, {});
        //console.log(extended);
        scbdMenuService.menus.dashboard= [];
        scbdMenuService.menus.dashboard.push({
          type: 'config',
          menuClass:'dash-menu',
          colorClass: 'dash-menu-color',
          activeClass: 'dash-menu-active',
          iconClass: 'pulse',
          selfMenu: scbdMenuService.menus.dashboard,// needed shouls be added programatically in parent service
          childrenColorClass: 'dash-menu-children-color',
          childrenActiveClass: 'dash-menu-children-active'
        });
        // scbdMenuService.menus.dashboard.push({
        //   name: 'Dashboard',
        //   type: 'link',
        //   mdIcon: 'dashboard',
        //   path: '/manage',
        //
        // });

        scbdMenuService.menus.dashboard.push({
          name: 'Side Events',
          type: 'link',
          mdIcon: 'event',
          path: '/manage/events',
        });
        scbdMenuService.menus.dashboard.push({
          name: 'Organizations',
          type: 'link',
          mdIcon: 'business',
          path: '/manage/organizations',
        });
        scbdMenuService.validateMenus();// minds color classes and animation ect


        scbdMenuService.menus.options= [];
        scbdMenuService.menus.options.push({
          type: 'config',
          menuClass:'dash-menu',
          colorClass: 'dash-menu-color',
          activeClass: 'dash-menu-active',
          iconClass: 'pulse',
          selfMenu: scbdMenuService.menus.options,// needed shouls be added programatically in parent service
          childrenColorClass: 'dash-menu-children-color',
          childrenActiveClass: 'dash-menu-children-active'
        });
        // scbdMenuService.menus.dashboard.push({
        //   name: 'Dashboard',
        //   type: 'link',
        //   mdIcon: 'dashboard',
        //   path: '/manage',
        //
        // });
        scbdMenuService.menus.options.push({
          name: 'Register',
          type: 'link',
          mdIcon: 'add_box',
          path: '/manage/events/new',
        });
        scbdMenuService.menus.options.push({
          name: 'View Archive',
          type: 'link',
          mdIcon: 'archive',
          path: '/manage/events/archived',
        });
        scbdMenuService.menus.options.push({
          name: 'Sort Order',
          type: 'link',
          mdIcon: 'sort_by_alpha',
          path: '/manage/events/sort',
        });

        scbdMenuService.menus.options.push({
          name: 'Filter',
          type: 'toggle',
          open:0,
          mdIcon: 'filter_list',
          roles:['Administrator','IndeAdministrator'],
          pages: [
            {
              name: 'All',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'all_inclusive',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Draft',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'insert_drive_file',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Requests',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'live_help',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Approved',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'thumb_up',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Canceled',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'thumbs_up_down',
              roles:['Administrator','IndeAdministrator'],
            },
            // {
            //   name: 'Rejected',
            //   type: 'link',
            //   path: '/admin/events/all',
            //   mdIcon: 'view_module',
            //   roles:['Administrator','IndeAdministrator'],
            // },
            // {
            //   name: 'Archived',
            //   type: 'link',
            //   path: '/admin/events/all',
            //   mdIcon: 'archived',
            //   roles:['Administrator','IndeAdministrator'],
            // },
          ]
        });
        scbdMenuService.menus.options.push({
          name: 'View',
          type: 'toggle',
          open:0,
          mdIcon: 'remove_red_eye',
          roles:['Administrator','IndeAdministrator'],
          pages: [
            {
              name: 'Card View',
              type: 'link',
              path: '/admin/events/card-view',
              mdIcon: 'view_module',
              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'List View',
              type: 'link',
              path: '/admin/events/list-view',
              mdIcon: 'view_list',
              roles:['Administrator','IndeAdministrator'],
            },
            {
            name: 'Detail View',
            type: 'link',
            path: '/admin/events/detail-view',
            mdIcon: 'view_headline',
            roles:['Administrator','IndeAdministrator'],

          }],
        });
          scbdMenuService.validateMenus();// minds color classes and animation ect
        return scbdMenuService;
  }]);
});