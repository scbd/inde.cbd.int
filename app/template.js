'use strict';
define(['app', 'authentication'], function(app) {

  app.controller('TemplateController', ['$scope', '$window', '$browser', '$document', '$location', 'authentication',
	function($scope, $window, $browser, $document, $location, authentication) {

        $scope.$root.pageTitle = { text: "not set" };


        //============================================================
        //
        //
        //============================================================
		function setCookie (name, value, days, path) {

            var cookieString = $window.escape(name) + '=';

            if(value) cookieString += $window.escape(value);
            else      days = -1;

            if(path)
                cookieString += '; path=' + path;

            if(days || days === 0) {

                var expirationDate = new Date();

                expirationDate.setDate(expirationDate.getDate() + days);

                cookieString += '; expires=' + expirationDate.toUTCString();
            }

            $document[0].cookie = cookieString;
        }

        //============================================================
        //
        //
        //============================================================
        $scope.actionSignin = function () {
            var client_id    = $window.encodeURIComponent('55asz2laxbosdto6dfci0f37vbvdu43yljf8fkjacbq34ln9b09xgpy1ngo8pohd');
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/oauth2/callback');
            $window.location.href = 'https://accounts.cbd.int/oauth2/authorize?client_id='+client_id+'&redirect_uri='+redirect_uri+'&scope=all';
        };

        //============================================================
        //
        //
        //============================================================
        $scope.actionSignOut = function () {
            document.cookie = 'authenticationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/signout?redirect_uri='+redirect_uri;
        };

        //============================================================
        //
        //
        //============================================================
        $scope.actionSignup = function () {
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/signup?redirect_uri='+redirect_uri;
        };

        //============================================================
        //
        //
        //============================================================
        $scope.actionPassword = function () {
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/password?redirect_uri='+redirect_uri;
        };

        //============================================================
        //
        //
        //============================================================
        $scope.actionProfile = function () {
            var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
            $window.location.href = 'https://accounts.cbd.int/profile?redirect_uri='+redirect_uri;
        };

        //============================================================
        //
        //
        //============================================================
        $window.addEventListener('message', function receiveMessage(event)
        {
            if(event.origin!='https://accounts.cbd.int')
                return;

            var message = JSON.parse(event.data);

            if(message.type=='ready')
                event.source.postMessage('{"type":"getAuthenticationToken"}', event.origin);

            if(message.type=='authenticationToken') {
                if(message.authenticationToken && !$browser.cookies().authenticationToken) {
                    setCookie('authenticationToken', message.authenticationToken, 7, '/');
                    $window.location.href = $window.location.href;
                }
                if(!message.authenticationToken && $browser.cookies().authenticationToken) {
                    authentication.signOut();
                    $window.location.href = $window.location.href;
                }
            }
        }, false);

        var qAuthenticationFrame = $document.find('#authenticationFrame');
        
        if(qAuthenticationFrame.size())
            qAuthenticationFrame[0].contentWindow.postMessage('{"type":"getAuthenticationToken"}', 'https://accounts.cbd.int');

  }]);
});