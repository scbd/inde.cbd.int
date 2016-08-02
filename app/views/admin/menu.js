define(['app', 'lodash', 'directives/side-menu/scbd-side-menu'], function(app, _) {

    app.factory("adminMenu", ['scbdMenuService', function(scbdMenuService) {


        scbdMenuService.menus.adminOptions = [];
        scbdMenuService.menus.adminOptions.push({
            type: 'config',
            menuClass: 'dash-menu',
            colorClass: 'dash-menu-color',
            activeClass: 'dash-menu-active',
            iconClass: 'pulse',
            selfMenu: scbdMenuService.menus.adminOptions, // needed shouls be added programatically in parent service
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

        });
        scbdMenuService.menus.adminOptions.push({
            name: 'Side Events',
            type: 'link',
            mdIcon: 'unarchive',
            path: '/admin/events/',

        });
        scbdMenuService.menus.adminOptions.push({
            name: 'Archives',
            type: 'link',
            mdIcon: 'archive',
            path: '/admin/events/archived',
        });
        scbdMenuService.menus.adminOptions.push({
            name: 'Sort',
            type: 'link',
            mdIcon: 'sort_by_alpha',
            path: '/admin/events/sort',
        });

        scbdMenuService.menus.adminOptions.push({
            name: 'Filter',
            type: 'toggle',
            open: 0,
            mdIcon: 'filter_list',
            pages: [{
                    name: 'All',
                    type: 'link',
                    path: '/admin/events/all',
                    mdIcon: 'all_inclusive',

                }, {
                    name: 'Drafts',
                    type: 'link',
                    path: '/admin/events/all',
                    mdIcon: 'insert_drive_file',

                }, {
                    name: 'Requests',
                    type: 'link',
                    path: '/admin/events/all',
                    mdIcon: 'live_help',

                }, {
                    name: 'Under Review',
                    type: 'link',
                    path: '/admin/events/all',
                    mdIcon: 'thumb_up',

                }, {
                    name: 'Canceled',
                    type: 'link',
                    path: '/admin/events/all',
                    mdIcon: 'thumbs_up_down',

                }, {
                    name: 'Rejected',
                    type: 'link',
                    path: '',
                    mdIcon: 'view_module',

                },
            ]
        });
        scbdMenuService.menus.adminOptions.push({
            name: 'View',
            type: 'toggle',
            open: 0,
            mdIcon: 'remove_red_eye',
            roles: ['Administrator', 'IndeAdministrator'],
            pages: [
                // {
                //   name: 'Card View',
                //   type: 'link',
                //   path: '/admin/events/card-view',
                //   mdIcon: 'view_module',
                //   roles:['Administrator','IndeAdministrator'],
                // },
                {
                    name: 'List View',
                    type: 'link',
                    path: '/admin/events/list-view',
                    mdIcon: 'view_list',
                    roles: ['Administrator', 'IndeAdministrator'],
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

        scbdMenuService.buildLinks(scbdMenuService.menus.adminOptions);

        scbdMenuService.validateMenus(); // minds color classes and animation ect

        return scbdMenuService;
    }]);
});