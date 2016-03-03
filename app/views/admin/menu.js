define(['app','scbd-branding/side-menu/scbd-menu-service'], function (app,_) {

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
          name: 'Dashboard',
          type: 'link',
          mdIcon: 'dashboard',
          path: '/admin',

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
        //   imgSrc: '/app/images/inde-logo.svg',
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


        scbdMenuService.validateMenus();// minds color classes and animation ect

        return scbdMenuService;
  }]);
});