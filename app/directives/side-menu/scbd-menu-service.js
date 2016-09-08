define(['app','lodash'],function(app,_) {


'use strict';


  app.factory('scbdMenuService', [
      '$location','$timeout','$q','$rootScope','devRouter',

      function ($location,$timeout,$q,$rootScope) {
        var navRegistry={};
        var menus={};
        var history=[];

        $rootScope.$on('$locationChangeSuccess', function(event, url, oldUrl){
            history.push({'from':oldUrl,'to':url});
        });

//link config options
      //============================================================
      //
      //
      //============================================================
      function validateMenus() {
        _.each(menus, function(menu) {
          var config = _.find(menu, {
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

              if(navRegistry[navId])
                return navRegistry[navId].isOpen();
              else
                return false;
        }

        //============================================================
        //
        //
        //============================================================
        function toggle(navId) {

              whenNavCtrlLoaded(navId).then(function(nav){nav.toggle();}).catch(function(err){throw err;});
        }

        //=======================================================================
        //
        //=======================================================================
        function whenNavCtrlLoaded(navId) {
          var resolved = false;
          return $q(function(resolve, reject){
          var cancelId = setInterval(function() {
            if (navRegistry[navId]) {

              resolved=true;
              resolve(navRegistry[navId]);
              clearInterval(cancelId);
            }
          }, 100);
          $timeout(function() {
            if (!resolved) {
              reject('Nav Controler is not loaded within 5 seconds.');
              clearInterval(cancelId);
            }
          }, 5000);
        });
        }

        // //============================================================
        // //
        // //============================================================
        // function addMenu() {
        //       _.each(navRegistry,function(navCtrl){
        //           navCtrl.close();
        //       });
        // }
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
            function buildLinks(menu, toggle) {
                if (!menu[0].links)
                    menu[0].links = [];

                var section = toggle || menu;
                _.each(section, function(item) {
                    if (item.type === 'link')
                        menu[0].links.push(item);
                    if (item.type === 'toggle')
                        buildLinks(menu, item.pages);
                });
            }

            function setPathOfLink(menu, linkName, value) {

                var link = _.find(menu[0].links, {
                    'name': linkName
                });
                if (link)
                    link.path = value;
                else throw 'Error: Menu link not found by the name of: '+linkName;
            }
            validateMenus();

          return  {
            buildLinks:buildLinks,
            setPathOfLink:setPathOfLink,
            history:history,
            cssTransforms3d:cssTransforms3d,
            closeAllActive:closeAllActive,
            registerNavInstance:registerNavInstance,
            isOpen:isOpen,
            toggle: toggle,
            close: close,
            open: open,
            menus:menus,

            getMenu:getMenu,
            cbdMenu:menus.cbdMenu,
            accMenu:menus.accMenu,
            localeMenu:menus.localeMenu,
            dashboard:menus.dashboard,
            validateMenus:validateMenus
          };

      }]);

});