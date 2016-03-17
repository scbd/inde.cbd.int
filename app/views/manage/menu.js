define(['app',  '../../directives/side-menu/scbd-side-menu'], function (app,_) {

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
        scbdMenuService.menus.dashboard.push({
          name: 'Dashboard',
          type: 'link',
          mdIcon: 'dashboard',
          path: '/manage',
  //            roles:['Administrator','IndeAdministrator'],
        });

        scbdMenuService.menus.dashboard.push({
          name: 'Your Side Events',
          type: 'link',
          mdIcon: 'event',
          path: '/manage/events',
  //            roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.dashboard.push({
          name: 'Your Organizations',
          type: 'link',
          mdIcon: 'business',
          path: '/manage/organizations',
    //          roles:['Administrator','IndeAdministrator'],
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
  //            roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.options.push({
          name: 'Unarchived',
          type: 'link',
          mdIcon: 'archive',
          path: '/manage/events/',
  //            roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.options.push({
          name: 'Archives',
          type: 'link',
          mdIcon: 'archive',
          path: '/manage/events/archived',
  //            roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.options.push({
          name: 'Sort',
          type: 'link',
          mdIcon: 'sort_by_alpha',
          path: '/manage/events/sort',
  //            roles:['Administrator','IndeAdministrator'],
        });

        scbdMenuService.menus.options.push({
          name: 'Filter',
          type: 'toggle',
          open:0,
          mdIcon: 'filter_list',
  //        roles:['Administrator','IndeAdministrator'],
          pages: [
            {
              name: 'All',
              type: 'link',
              path: '/all',
              mdIcon: 'all_inclusive',
  //            roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Drafts',
              type: 'link',
              path: '/all',
              mdIcon: 'insert_drive_file',
//              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Requests',
              type: 'link',
              path: '/all',
              mdIcon: 'live_help',
  //            roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Approved',
              type: 'link',
              path: '/all',
              mdIcon: 'thumb_up',
  //            roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'Canceled',
              type: 'link',
              path: '/all',
              mdIcon: 'thumbs_up_down',
  //            roles:['Administrator','IndeAdministrator'],
            },
            // {
            //   name: 'Rejected',
            //   type: 'link',
            //   path: '/all',
            //   mdIcon: 'view_module',
            //   roles:['Administrator','IndeAdministrator'],
            // },
            // {
            //   name: 'Archived',
            //   type: 'link',
            //   path: '/all',
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
//          roles:['Administrator','IndeAdministrator'],
          pages: [
            {
              name: 'Card View',
              type: 'link',
              path: '/card-view',
              mdIcon: 'view_module',
//              roles:['Administrator','IndeAdministrator'],
            },
            {
              name: 'List View',
              type: 'link',
              path: '/list-view',
              mdIcon: 'view_list',
  //            roles:['Administrator','IndeAdministrator'],
            },
          //   {
          //   name: 'Detail View',
          //   type: 'link',
          //   path: '/detail-view',
          //   mdIcon: 'view_headline',
          //   roles:['Administrator','IndeAdministrator'],
          //
          // }
        ],
        });
        scbdMenuService.menus.editEventOptions= [];
        scbdMenuService.menus.editEventOptions.push({
          type: 'config',
          menuClass:'dash-menu',
          colorClass: 'dash-menu-color',
          activeClass: 'dash-menu-active',
          iconClass: 'pulse',
          selfMenu: scbdMenuService.menus.editEventOptions,// needed shouls be added programatically in parent service
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
        scbdMenuService.menus.editEventOptions.push({
          name: 'Register',
          type: 'link',
          mdIcon: 'add_box',
          path: '/manage/events/new',
              roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.editEventOptions.push({
          name: 'Save as Draft',
          type: 'link',
          mdIcon: 'insert_drive_file',
          path: '',
              roles:['Administrator','IndeAdministrator'],
        });
        scbdMenuService.menus.editEventOptions.push({
          name: 'Request Approval',
          type: 'link',
          mdIcon: 'live_help',
          path: '',
              roles:['Administrator','IndeAdministrator'],
        });
          scbdMenuService.validateMenus();// minds color classes and animation ect
        return scbdMenuService;
  }]);
});