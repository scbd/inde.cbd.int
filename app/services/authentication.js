/* jshint sub:true */

define(['app', 'angular', 'jquery'], function(app, ng, $) {
    'use strict';

    /***************************************************************************************
     * dev env variables
     ***************************************************************************************/
          var domain = document.location.hostname.replace(/[^\.]+\./, '');
          var production = false; // change to true to work on production accounts
          if ((domain == 'localhost' || (domain.indexOf('cbddev.xyz') >= 0)) && !production)
              domain = 'cbddev.xyz';
          else
              domain = 'cbd.int';

          var ACCOUNTS_URI = 'https://accounts.' + domain;
    /****************************************************************************************/


    app.factory('apiToken', ['$q', '$rootScope', '$window', '$document', '$timeout', function($q, $rootScope, $window, $document, $timeout) {

        var authenticationFrameQ = $q(function(resolve, reject) {

            var frame = $('<iframe src="' + ACCOUNTS_URI + '/app/authorize.html" style="display:none"></iframe>');

            $('body').prepend(frame);

            var timeout = $timeout(function() {
                reject('operation timed out (5000ms)');
            }, 5000);

            frame.load(function(evt) {
                $timeout.cancel(timeout);
                resolve(evt.target || evt.srcElement);
            });
        });

        var pToken;

        //============================================================
        //
        //
        //============================================================
        function getToken() {

            return $q.when(authenticationFrameQ).then(function(authenticationFrame) {

                if (!authenticationFrame) {
                    pToken = pToken || null;
                }

                if (pToken !== undefined) {
                    return $q.when(pToken || null);
                }

                pToken = null;

                var defer = $q.defer();
                var unauthorizedTimeout = $timeout(function() {
                    console.error('accounts.cbd.int is not available / call is made from an unauthorized domain');
                    defer.resolve(null);
                }, 1000);

                var receiveMessage = function(event) {
                    $timeout.cancel(unauthorizedTimeout);

                    if (event.origin != ACCOUNTS_URI)
                        return;

                    var message = JSON.parse(event.data);

                    if (message.type == 'authenticationToken') {
                        defer.resolve(message.authenticationToken || null);

                        if (message.authenticationEmail)
                            $rootScope.lastLoginEmail = message.authenticationEmail;
                    } else {
                        defer.reject('unsupported message type');
                    }
                };

                $window.addEventListener('message', receiveMessage);

                pToken = defer.promise.then(function(t) {

                    pToken = t;

                    return t;

                }).finally(function() {

                    $window.removeEventListener('message', receiveMessage);

                });

                authenticationFrame.contentWindow.postMessage(JSON.stringify({
                    type: 'getAuthenticationToken'
                }), ACCOUNTS_URI);

                return pToken;

            }).catch(function(error) {

                pToken = null;

                console.error(error);

                throw error;
            });
        }

        //============================================================
        //
        //
        //============================================================
        function setToken(token, email) { // remoteUpdate:=true

            return $q.when(authenticationFrameQ).then(function(authenticationFrame) {

                pToken = token || undefined;

                if (authenticationFrame) {

                    var msg = {
                        type: 'setAuthenticationToken',
                        authenticationToken: token,
                        authenticationEmail: email
                    };

                    authenticationFrame.contentWindow.postMessage(JSON.stringify(msg), ACCOUNTS_URI);
                }

                if (email) {
                    $rootScope.lastLoginEmail = email;
                }
            });
        }

        return {
            get: getToken,
            set: setToken
        };
    }]);

    app.factory('authentication', ["$http", "$rootScope", "$q", "apiToken", "$window", "$location", function($http, $rootScope, $q, apiToken, $window, $location) {

        var currentUser = null;

        //============================================================
        //
        //
        //============================================================
        function anonymous() {
            return {
                userID: 1,
                name: 'anonymous',
                email: 'anonymous@domain',
                government: null,
                userGroups: null,
                isAuthenticated: false,
                isOffline: true,
                roles: []
            };
        }


        var inProgress = false;
        //============================================================
        //
        //
        //============================================================
        function getUser() {

            if (currentUser)
                return $q.when(currentUser);

            return $q.when(apiToken.get()).then(function(token) {

                if (!token)
                    return anonymous();

                if (!inProgress) {

                    inProgress = $http.get('/api/v2013/authentication/user', {
                        headers: {
                            Authorization: "Ticket " + token
                        }
                    }).then(function(r) {
                        return r.data;
                    });
                    return inProgress;
                } else {
                    return inProgress;
                }

            }).catch(function() {

                return anonymous();

            }).then(function(user) {
                setUser(user);
                return user;
            });
        }


        //============================================================
        //
        //
        //============================================================
        function signIn(email, password) {

            return $http.post(ACCOUNTS_URI + '/api/v2013/authentication/token', {

                "email": email,
                "password": password

            }).then(function(res) {

                var token = res.data;

                return $q.all([token, $http.get('https://api.' + domain + '/api/v2013/authentication/user', {
                    headers: {
                        Authorization: "Ticket " + token.authenticationToken
                    }
                })]);

            }).then(function(res) {

                var token = res[0];
                var user = res[1].data;

                email = (email || "").toLowerCase();

                apiToken.set(token.authenticationToken, email);
                setUser(user);

                $rootScope.$broadcast('signIn', user);

                return user;

            }).catch(function(error) {

                throw {
                    error: error.data,
                    errorCode: error.status
                };
            });
        }


        //============================================================
        //
        //
        //============================================================
        function signOut() {

            apiToken.set(null);

            setUser(null);

            return $q.when(getUser()).then(function(user) {

                $rootScope.$broadcast('signOut', user);

                return user;
            });
        }


        //============================================================
        //
        //
        //============================================================
        function setUser(user) {
            if (user && user.isAuthenticated && !user.isEmailVerified) {
                $rootScope.$broadcast('event:auth-emailVerification', {
                    message: 'Email verification pending. Please verify you email before submitting any data.'
                });
            }

            currentUser = user || undefined;
            $rootScope.user = user || anonymous();
        }


        //============================================================
        //
        //
        //============================================================
        function encodedReturnUrl() {

            return encodeURIComponent($location.absUrl());
        }


        //============================================================
        //
        //
        //============================================================
        function goToSignIn() {
            $window.location.href = 'https://accounts.' + domain + '/signin?&returnUrl=' + encodedReturnUrl();
        }


        //============================================================
        //
        //
        //============================================================
        function goToSignOut() {
            document.cookie = 'authenticationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            $window.location.href = 'https://accounts.' + domain + '/signout?returnUrl=' + encodedReturnUrl();
        }

        //============================================================
        //
        //
        //============================================================
        function signUp() {
            $window.location.href = 'https://accounts.' + domain + '/signup?returnUrl=' +  encodedReturnUrl();
        }

        //============================================================
        //
        //
        //============================================================
        function passwordReset() {
            $window.location.href = 'https://accounts.' + domain + '/password?returnUrl=' +  encodedReturnUrl();
        }

        //============================================================
        //
        //
        //============================================================
        function editProfile() {
            $window.location.href = 'https://accounts.' + domain + '/profile?returnUrl='+  encodedReturnUrl();
        }


        return {
            signIn: signIn,
            signOut: signOut,
            goToSignIn: goToSignIn,
            goToSignOut: goToSignOut,
            signUp: signUp,
            passwordReset: passwordReset,
            editProfile: editProfile,
            getUser: getUser,
        };
    }]);

    app.factory('authenticationHttpIntercepter', ["$q", "apiToken", '$rootScope', function($q, apiToken, $rootScope) {

        return {
            request: function(config) {

                var trusted = /^https:\/\/api.cbd.int\//i.test(config.url) ||
                    /^\/api\//i.test(config.url);

                var hasAuthorization = (config.headers || {}).hasOwnProperty('Authorization') ||
                    (config.headers || {}).hasOwnProperty('authorization');

                if (!trusted || hasAuthorization) // no need to alter config
                    return config;

                //Add token to http headers

                return $q.when(apiToken.get()).then(function(token) {

                    if (token) {
                        config.headers = ng.extend(config.headers || {}, {
                            Authorization: "Ticket " + token
                        });
                    }

                    return config;
                });
            },
            responseError: function(rejection) {

                if (rejection.data && rejection.data.statusCode == 401) {

                    if (rejection.data.message.indexOf('Email verification pending') >= 0) {
                        $rootScope.$broadcast('event:auth-emailVerification', rejection.data);
                    }

                }
                // otherwise, default behaviour
                return $q.reject(rejection);
            }
        };
    }]);


});