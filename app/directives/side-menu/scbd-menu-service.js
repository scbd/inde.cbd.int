define(['app','lodash'],function(app,_) {


'use strict';


  app.factory('scbdMenuService', [
      '$location','$timeout','$q','$rootScope',

      function ($location,$timeout,$q,$rootScope) {
        var navRegistry={};
        var menus={};
        var history=[];

        $rootScope.$on('$locationChangeSuccess', function(event, url, oldUrl, state, oldState){
            history.push({'from':oldUrl,'to':url});
        });

        menus.localeMenu= [];
        menus.localeMenu.push({
          type: 'config',
          menuClass:'cbd-menu',
          colorClass: 'cbd-menu-color',
          activeClass: 'cbd-menu-active',
          iconClass: 'pulse',
          selfMenu:menus.localeMenu,
          childrenColorClass: 'cbd-menu-children-color',
          childrenActiveClass: 'cbd-menu-children-active'
        });
        menus.localeMenu.push({
          name: 'لعربية',
          type: 'link',
          mdIcon: 'language',
          disabled:'true'
        });
        menus.localeMenu.push({
          name: '中文',
          type: 'link',
          mdIcon: 'language',
          disabled:'true'
        });
        menus.localeMenu.push({
          name: 'English',
          type: 'link',
          mdIcon: 'language',

        });
        menus.localeMenu.push({
          name: 'Español',
          type: 'link',
          mdIcon: 'language',
          disabled:'true'
        });
        menus.localeMenu.push({
          name: 'Français',
          type: 'link',
          mdIcon: 'language',
          disabled:'true'
        });
        menus.localeMenu.push({
          name: 'Русский',
          type: 'link',
          mdIcon: 'language',
          disabled:'true'
        });

        menus.accMenu= [];
        menus.accMenu.push({
          type: 'config',
          menuClass:'cbd-menu',
          colorClass: 'cbd-menu-color',
          activeClass: 'cbd-menu-active',
          iconClass: 'pulse',
          selfMenu:menus.accMenu,
          childrenColorClass: 'cbd-menu-children-color',
          childrenActiveClass: 'cbd-menu-children-active'
        });
        menus.accMenu.push({
          name: 'Your Profile',
          type: 'link',
          mdIcon: 'person',
          state:'https://accounts.cbd.int/profile'
        });

        menus.accMenu.push({
          name: 'Roles',
          type: 'toggle',
          faIcon: 'fa fa-users',
          faIconSize: 'fa-lg',
          pages: [{
            name: 'Text of the Convention',
            type: 'link',
            state: 'https://www.cbd.int/convention/text/',
            faIcon: 'fa fa-users',
            faIconSize: 'fa-lg',
          }, {
            name: 'List of Parties',
            state: 'https://www.cbd.int/convention/parties/list/',
            type: 'link',
            mdIcon: 'nature_people',
          }
        ]});
        menus.accMenu.push({
          name: 'Password',
          type: 'link',
          faIcon: 'fa fa-key',
          faIconSize: 'fa-lg',
          state:'https://accounts.cbd.int/password'
        });
        menus.accMenu.push({
          name: 'Sign-out',
          type: 'link',
          faIcon: 'fa fa-sign-out',
          faIconSize: 'fa-lg',
          //state:'signOut'
        });

        menus.cbdMenu= [];
        menus.cbdMenu.push({
          type: 'config',
          menuClass:'cbd-menu',
          colorClass: 'cbd-menu-color',
          activeClass: 'cbd-menu-active',
          iconClass: 'pulse',
          selfMenu:menus.cbdMenu,
          childrenColorClass: 'cbd-menu-children-color',
          childrenActiveClass: 'cbd-menu-children-active'
        });
        menus.cbdMenu.push({
          name: 'The Convention',
          type: 'toggle',
          imgSrc: 'app/images/cbd-leaf-white.svg',
          pages: [{
            name: 'Text of the Convention',
            type: 'link',
            state: 'https://www.cbd.int/convention/text/',
            faIcon: 'fa fa-gavel',
            faIconSize: 'fa-lg'
          }, {
            name: 'List of Parties',
            state: 'https://www.cbd.int/convention/parties/list/',
            type: 'link',
            mdIcon: 'nature_people',
          },
            {
              name: 'Strategic Plan',
              state: 'https://www.cbd.int/sp/',
              type: 'link',
              mdIcon: 'directions_run',
            },
            {
              name: 'Programmes and Issues',
              state: 'https://www.cbd.int/programmes/',
              type: 'link',
              faIcon: 'fa fa-tasks',
              faIconSize: 'fa-lg'
            },
            {
              name: 'Cooperation & Partnerships',
              state: 'https://www.cbd.int/cooperation/',
              type: 'link',
              mdIcon: 'compare_arrows'
            }
        ]});


        menus.cbdMenu.push({
          name: 'Cartagena Protocol',
          type: 'toggle',
          faIcon: 'fa-heartbeat',
          faIconSize: 'fa-lg',
          pages: [{
            name: 'Text of the Protocol',
            type: 'link',
            state: 'https://bch.cbd.int/protocol/text/',
            faIcon: 'fa-gavel',
            faIconSize: 'fa-lg'
          }, {
            name: 'List of Parties',
            state: 'https://bch.cbd.int/protocol/parties/',
            type: 'link',
            mdIcon: 'nature_people',
          },
            {
              name: 'Strategic Plan',
              state: 'https://bch.cbd.int/protocol/issues/cpb_stplan.shtml',
              type: 'link',
              mdIcon: 'directions_run',
            },
            {
              name: 'Biosafety Clearing-House',
              state: 'https://bch.cbd.int/',
              type: 'link',
              mdIcon: 'computer',
            }
          ]
        });


        menus.cbdMenu.push({
          name: 'Nagoya Protocol',
          type: 'toggle',
          faIcon: 'fa-share-alt-square',
          faIconSize: 'fa-lg',
          pages: [{
            name: 'Text of the Protocol',
            type: 'link',
            state: 'https://www.cbd.int/abs/text/',
            faIcon: 'fa-gavel',
            faIconSize: 'fa-lg'
          }, {
            name: 'List of Parties',
            state: 'https://www.cbd.int/abs/nagoya-protocol/signatories/',
            type: 'link',
            mdIcon: 'nature_people',
          },
            {
              name: 'ABS Clearing-House',
              state: 'https://absch.cbd.int/',
              type: 'link',
              mdIcon: 'computer',
            }
          ]
        });

        menus.cbdMenu.push({
          name: 'Programmes',
          type: 'toggle',
          faIcon: 'fa-tasks',
          faIconSize: 'fa-lg',
          pages: [{
            name: 'Thematic Programmes',
            type: 'link',
            state: 'https://www.cbd.int/programmes/',
            mdIcon: 'art_track',
          }, {
            name: 'Cross-Cutting Issues',
            state: 'https://www.cbd.int/programmes/',
            type: 'link',
            mdIcon: 'content_cut',
          },
            {
              name: 'Major Groups',
              state: 'https://www.cbd.int/programmes/',
              type: 'link',
              mdIcon: 'group_work',
            }
          ]
        });

        menus.cbdMenu.push({
          name: 'Information',
          type: 'toggle',
          mdIcon: 'info_outline',
          pages: [{
            name: 'Meetings',
            type: 'link',
            state: 'https://www.cbd.int/meetings/',
            faIcon: 'fa-users',
            faIconSize: 'fa-lg'
          }, {
            name: 'Notifications',
            state: 'https://www.cbd.int/notifications/',
            type: 'link',
            faIcon: 'fa-comments-o',
            faIconSize: 'fa-lg'
          },
            {
              name: 'National Information',
              state: 'https://www.cbd.int/countries/',
              type: 'link',
              mdIcon: 'flag',
            },
            {
              name: 'Publications',
              state: 'https://www.cbd.int/information/publications.shtml',
              type: 'link',
              faIcon: 'fa-book',
              faIconSize: 'fa-lg'
            }
          ]
        });


        menus.cbdMenu.push({
          name: 'Secretariat',
          type: 'toggle',
          mdIcon: 'gavel',
          pages: [{
            name: 'Overview',
            type: 'link',
            state: 'https://www.cbd.int/secretariat/staff/',
            // faIcon: 'fa fa-gavel',
            // faIconSize: 'fa-lg'
          }, {
            name: 'Staff',
            state: 'https://www.cbd.int/secretariat/staff/',
            type: 'link',
            // faIcon: 'fa-bluetooth',
            // faIconSize: 'fa-lg'
          },
            {
              name: 'Opportunities',
              state: 'https://www.cbd.int/secretariat/vacancies/',
              type: 'link',
              // faIcon: 'fa-bluetooth',
              // faIconSize: 'fa-2x'
            },
            {
              name: 'Contact Us',
              state: 'https://www.cbd.int/contact/',
              type: 'link',
              // faIcon: 'fa-bluetooth',
              // faIconSize: 'fa-2x'
            }
          ]
        });
//link config options
      //============================================================
      //
      //
      //============================================================
      function validateMenus() {
        _.each(menus, function(menu) {
          var config = _.findWhere(menu, {
            'type': 'config'
          });
          _.each(menu, function(menuItem) {
            if (menuItem.type === 'config') return;

            if (menuItem.type === 'toggle') {
              menuItem.config = config;
              _.each(menuItem.pages, function(page) {
                page.config = config;
                page.isChild = true;
              });
            } else {
              menuItem.config = config;
            }
          });
        });
      }//validate menues

        //=======================================================================
        //
        //=======================================================================
        function registerNavInstance(navId,navCtrl) {

          if (navId) {
            if(navRegistry[navId])
              navRegistry[navId]={};
            navRegistry[navId] = navCtrl;
          } else
            throw "Error: thrying to register a nav controler in the scbd-menuservice with out a navId";
        }
        //============================================================
        //
        //
        //============================================================
        function isOpen(navId) {

              return whenNavCtrlLoaded(navId).then(function(){return navRegistry[navId].isOpen;});
        }
        //============================================================
        //
        //
        //============================================================
        function toggle(navId) {

              whenNavCtrlLoaded(navId).then(navRegistry[navId].toggle());
        }
        //=======================================================================
        //
        //=======================================================================
        function whenNavCtrlLoaded(navId) {
          var deferred = $q.defer();
          deferred.resolved = 0;

          var cancelId = setInterval(function() {
            if (navRegistry[navId]) {

              deferred.resolve(navRegistry[navId]);
              deferred.resolved = 1;
              clearInterval(cancelId);
              return deferred.promise;
            }
          }, 100);
          setTimeout(function() {
            if (!deferred.resolved) {
              deferred.reject('Nav Controler is not loaded within 5 seconds.');
              clearInterval(cancelId);
            }
          }, 5000);
          return deferred.promise;
        }

        //============================================================
        //
        //============================================================
        function addMenu() {
              _.each(navRegistry,function(navCtrl){
                  navCtrl.close();
              });
        }
        //============================================================
        //
        //============================================================
        function getMenu(menuName) {
              return menus[menuName];
        }
          //============================================================
          //
          //============================================================
          function closeAll(menuName) {
                menus[menuName]=[];
          }
          //============================================================
          //
          //============================================================
          function closeAllActive(menu) {
                _.each(menu,function(item){
                  if(item.type==='link'){
                      if(item.self && item.active)
                        item.self.deactivate();

                      if(item.active)
                        item.active=false;
                  } else if(item.type==='toggle'){
                    if(item.pages){
                        _.each(item.pages,function(){
                          if(item.self && item.active)
                            item.self.deactivate();

                          if(item.active)
                            item.active=false;
                        });
                    }
                  }//

                });
          }//closeAllActive
          function cssTransforms3d(){
          		var el = document.createElement('p'),
          		supported = false,
          		transforms = {
          		    'webkitTransform':'-webkit-transform',
          		    'OTransform':'-o-transform',
          		    'msTransform':'-ms-transform',
          		    'MozTransform':'-moz-transform',
          		    'transform':'transform'
          		};

          		// Add it to the body to get the computed style
          		document.body.insertBefore(el, null);

          		for(var t in transforms){
          		    if( el.style[t] !== undefined ){
          		        el.style[t] = 'translate3d(1px,1px,1px)';
          		        supported = window.getComputedStyle(el).getPropertyValue(transforms[t]);
          		    }
          		}

          		document.body.removeChild(el);

          		return (supported !== undefined && supported.length > 0 && supported !== "none");
            }

            validateMenus();

          return  {
            history:history,
            cssTransforms3d:cssTransforms3d,
            closeAllActive:closeAllActive,
            registerNavInstance:registerNavInstance,
            isOpen:isOpen,
            toggle: toggle,
            close: close,
            open: open,
            menus:menus,
            addMenu:addMenu,
            getMenu:getMenu,
            cbdMenu:menus.cbdMenu,
            accMenu:menus.accMenu,
            localeMenu:menus.localeMenu,
            dashboard:menus.dashboard,
            validateMenus:validateMenus
          };

      }]);

});