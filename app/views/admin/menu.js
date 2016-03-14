define(['app','../../directives/side-menu/scbd-side-menu'], function (app,_) {

app.factory("adminMenu", ['scbdMenuService', function(scbdMenuService) {


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
        scbdMenuService.menus.admin.push({
          name: 'Side Events',
          type: 'link',
          path: '/admin/events',
          mdIcon: 'event',
          roles:['Administrator','IndeAdministrator'],
        });

        scbdMenuService.menus.admin.push({
          name: 'Organizations',
          type: 'link',
          path: '/admin/organizations',
          mdIcon: 'business',
          roles:['Administrator','IndeAdministrator'],
        });

        // scbdMenuService.menus.admin.push({
        //   name: 'Meetings',
        //   path: '/admin/meetings',
        //   type: 'link',
        //   mdIcon: 'nature_people',
        //   roles:['Administrator','IndeAdministrator'],
        // });
        //
        // scbdMenuService.menus.admin.push({
        //   name: 'Inde Configuration',
        //   path: '/admin/config',
        //   type: 'link',
        //   imgSrc: 'app/images/inde-logo.svg',
        //   roles:['Administrator','IndeAdministrator'],
        // });
        //
        // scbdMenuService.menus.admin.push({
        //   name: 'User Management',
        //   path: '/admin/users',
        //   type: 'link',
        //   faIcon: 'fa fa-users',
        //   faIconSize: 'fa-lg',
        //   roles:['Administrator','IndeAdministrator'],
        // });
        scbdMenuService.menus.adminOptions= [];
        scbdMenuService.menus.adminOptions.push({
          type: 'config',
          menuClass:'dash-menu',
          colorClass: 'dash-menu-color',
          activeClass: 'dash-menu-active',
          iconClass: 'pulse',
          selfMenu: scbdMenuService.menus.adminOptions,// needed shouls be added programatically in parent service
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
        scbdMenuService.menus.adminOptions.push({
          name: 'Register',
          type: 'link',
          mdIcon: 'add_box',
          path: '/manage/events/new',
          roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.adminOptions.push({
          name: 'Unarchived',
          type: 'link',
          mdIcon: 'archive',
          path: '/admin/events/',
                  roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.adminOptions.push({
          name: 'Archives',
          type: 'link',
          mdIcon: 'archive',
          path: '/admin/events/archived',
          roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.adminOptions.push({
          name: 'Sort',
          type: 'link',
          mdIcon: 'sort_by_alpha',
          path: '/admin/events/sort',
          roles:['Administrator','IndeAdministrator'],
        });

        scbdMenuService.menus.adminOptions.push({
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
              name: 'Drafts',
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
            {
              name: 'Rejected',
              type: 'link',
              path: '',
              mdIcon: 'view_module',
              roles:['Administrator','IndeAdministrator'],
            },
            // {
            //   name: 'Archived',
            //   type: 'link',
            //   path: '/admin/events/all',
            //   mdIcon: 'archived',
            //   roles:['Administrator','IndeAdministrator'],
            // },
          ]
        });
        scbdMenuService.menus.adminOptions.push({
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
          //   {
          //   name: 'Detail View',
          //   type: 'link',
          //   path: '/admin/events/detail-view',
          //   mdIcon: 'view_headline',
          //   roles:['Administrator','IndeAdministrator'],
          //
          // }
        ],
        });


        scbdMenuService.validateMenus();// minds color classes and animation ect

        return scbdMenuService;
  }]);
});