define(['app',  'directives/side-menu/scbd-side-menu'], function (app,_) {

app.factory("orgMenu", ['scbdMenuService', function(scbdMenuService) {


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
        scbdMenuService.menus.dashboard.push({
          name: 'Dashboard',
          type: 'link',
          mdIcon: 'dashboard',
          path: '/manage',

        });

        scbdMenuService.menus.dashboard.push({
          name: 'Your Side Events',
          type: 'link',
          mdIcon: 'event',
          path: '/manage/events',
        });
        scbdMenuService.menus.dashboard.push({
          name: 'Your Organizations',
          type: 'link',
          mdIcon: 'business',
          path: '/manage/organizations',
        });
        scbdMenuService.validateMenus();// minds color classes and animation ect


        scbdMenuService.menus.orgOptions= [];
        scbdMenuService.menus.orgOptions.push({
          type: 'config',
          menuClass:'dash-menu',
          colorClass: 'dash-menu-color',
          activeClass: 'dash-menu-active',
          iconClass: 'pulse',
          selfMenu: scbdMenuService.menus.orgOptions,// needed shouls be added programatically in parent service
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
        scbdMenuService.menus.orgOptions.push({
          name: 'New',
          type: 'link',
          mdIcon: 'add_box',
          path: '/manage/organizations/new',
        });
        scbdMenuService.menus.orgOptions.push({
          name: 'Unarchived',
          type: 'link',
          mdIcon: 'archive',
          path: '/manage/organizations/',
        });
        scbdMenuService.menus.orgOptions.push({
          name: 'Archives',
          type: 'link',
          mdIcon: 'archive',
          path: '',
        });
        scbdMenuService.menus.orgOptions.push({
          name: 'Sort',
          type: 'link',
          mdIcon: 'sort_by_alpha',
          path: '',
        });

        scbdMenuService.menus.orgOptions.push({
          name: 'Filter',
          type: 'toggle',
          open:0,
          mdIcon: 'filter_list',
          roles:['User'],
          pages: [
            {
              name: 'All',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'all_inclusive',
              roles:['User'],
            },
            {
              name: 'Drafts',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'insert_drive_file',
              roles:['User'],
            },
            {
              name: 'Requests',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'live_help',
              roles:['User'],
            },
            {
              name: 'Approved',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'thumb_up',
              roles:['User'],
            },
            {
              name: 'Canceled',
              type: 'link',
              path: '/admin/events/all',
              mdIcon: 'thumbs_up_down',
              roles:['User'],
            },
            // {
            //   name: 'Rejected',
            //   type: 'link',
            //   path: '/admin/events/all',
            //   mdIcon: 'view_module',
            //   roles:['User'],
            // },
            // {
            //   name: 'Archived',
            //   type: 'link',
            //   path: '/admin/events/all',
            //   mdIcon: 'archived',
            //   roles:['User'],
            // },
          ]
        });
        scbdMenuService.menus.orgOptions.push({
          name: 'View',
          type: 'toggle',
          open:0,
          mdIcon: 'remove_red_eye',
          roles:['User'],
          pages: [
            {
              name: 'Card View',
              type: 'link',
              path: '',
              mdIcon: 'view_module',
              roles:['User'],
            },
            {
              name: 'List View',
              type: 'link',
              path: '',
              mdIcon: 'view_list',
              roles:['User'],
            },
          //   {
          //   name: 'Detail View',
          //   type: 'link',
          //   path: '/admin/events/detail-view',
          //   mdIcon: 'view_headline',
          //   roles:['User'],
          //
          // }
        ],
        });
        scbdMenuService.menus.editOrgOptions= [];
        scbdMenuService.menus.editOrgOptions.push({
          type: 'config',
          menuClass:'dash-menu',
          colorClass: 'dash-menu-color',
          activeClass: 'dash-menu-active',
          iconClass: 'pulse',
          selfMenu: scbdMenuService.menus.editOrgOptions,// needed shouls be added programatically in parent service
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
        scbdMenuService.menus.editOrgOptions.push({
          name: 'New',
          type: 'link',
          mdIcon: 'add_box',
          path: '/manage/organizations/new',
        });
        scbdMenuService.menus.editOrgOptions.push({
          name: 'Save as Draft',
          type: 'link',
          mdIcon: 'add_box',
          path: '',
        });
        scbdMenuService.menus.editOrgOptions.push({
          name: 'Save and Request Approval',
          type: 'link',
          mdIcon: 'add_box',
          path: '',
        });
          scbdMenuService.validateMenus();// minds color classes and animation ect
        return scbdMenuService;
  }]);
});