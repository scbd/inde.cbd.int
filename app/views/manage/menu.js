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
        // menus.dashboard.push({
        //   name: 'heading',
        //   type: 'heading',
        //
        //
        // });
        // scbdMenuService.menus.dashboard.push({
        //   name: 'Administration',
        //   type: 'toggle',
        //   open:1,
        //   mdIcon: 'supervisor_account',
        //   roles:['Administrator','IndeAdministrator'],
        //   pages: [
        //     {
        //       name: 'Side Events',
        //       type: 'link',
        //       path: '/admin/events',
        //       mdIcon: 'event',
        //       roles:['Administrator','IndeAdministrator'],
        //     },
        //     {
        //       name: 'Organizations',
        //       type: 'link',
        //       path: '/admin/organizations',
        //       mdIcon: 'business',
        //       roles:['Administrator','IndeAdministrator'],
        //     },
        //     {
        //     name: 'Meetings',
        //     type: 'link',
        //     path: '/admin/meetings',
        //     mdIcon: 'nature_people',
        //     roles:['Administrator','IndeAdministrator'],
        //
        //   }, {
        //     name: 'Inde Configuration',
        //     path: '/admin/config',
        //     type: 'link',
        //     imgSrc: '/app/images/inde-logo.svg',
        //     roles:['Administrator','IndeAdministrator'],
        //   },
        //   {
        //     name: 'User Management',
        //     path: '/admin/users',
        //     type: 'link',
        //     faIcon: 'fa fa-users',
        //     faIconSize: 'fa-lg',
        //     roles:['Administrator','IndeAdministrator'],
        //   }],
        // });
        return scbdMenuService;
  }]);
});