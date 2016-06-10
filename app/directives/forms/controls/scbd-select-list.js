define(['app',
        'lodash',
        'text!./scbd-select-list.html',
        'css!./scbd-select-list.css',
        'services/filters',
        'services/mongo-storage',
        'css!libs/angular-dragula/dist/dragula.css',
], function(app, _, template) {
    'use strict';
    app.directive('scbdSelectList', ["$location", "$timeout", 'mongoStorage', '$http', 'authentication', function($location, $timeout, mongoStorage, $http, authentication) {

        return {
            restrict: 'E',
            template: template,
            priority: 600,
            transclude: false,
            scope: {
                binding: "=ngModal",
                showOrgForm: "=?",
                doc: "=doc"
            },

            link: function($scope, $element) {

                if (typeof $scope.showOrgForm === 'undefined')
                    $scope.showOrgForm = 0;

                $scope.docs = [];

                // //==================================
                // //
                // //==================================
                // $scope.$watch('showOrgForm', function() {
                //     if (typeof $scope.doc !== 'undefined')
                //         $scope.loadList();
                // }, true);

                //==================================
                //
                //==================================
                $scope.$watch('binding', function() {
                    if (typeof $scope.binding !== 'undefined' && !_.isEmpty($scope.docs))
                        buldBindingMirror();
                }, true);

                //==================================
                //
                //==================================
                $scope.$watch('doc', function() {
                    if ((_.isArray($scope.doc.hostOrgs) && $scope.doc.hostOrgs.length!==0))
                        $scope.loadList();

                });

                //==================================
                //
                //==================================
                function buldBindingMirror() {
                    $scope.mirror = [];
                    _.each($scope.binding, function(val, key) {
                        $scope.mirror[key] = _.find($scope.docs, {
                            '_id': val
                        });
                    });
                } // init


                //==================================
                //
                //==================================
                function setChips() {
                  console.log($scope.binding);
                    $timeout(function() {
                        if ($scope.binding)
                            if ($scope.binding.length > 0) {
                                $scope.loading = false;
                                mongoStorage.getCountries().then(function(data){
                                  _.each(_.union($scope.docs,data), function(doc) {
                                      _.each($scope.binding, function(id) {
                                          if (doc._id === id)
                                              doc.selected = !doc.selected;
                                      });
                                  });
                                  buldBindingMirror();
                                });
                            }
                    }, 500);
                } // set chips


                //=======================================================================
                //
                //=======================================================================
                $scope.searchToggle = function() {
                    var serEl = $element.find('.lst-search');
                    serEl.toggleClass('lst-search-expanded');
                    serEl.focus();
                    var serElb = $element.find('.search-lbtn');
                    serElb.toggleClass('search-lbtn-expanded');

                    $scope.sOpen = !$scope.sOpen;
                    $scope.search = '';
                }; //$scope.searchToggle


                //=======================================================================
                //
                //=======================================================================
                $scope.noEnter = function(event) {
                    if (event.keyCode === 13) { // '13' is the key code for enter
                        event.preventDefault();
                    }
                }; //$scope.noEnter


                //=======================================================================
                //
                //=======================================================================
                $scope.loadList = function() {
                  if(!$scope.doc ) return;
                    $scope.atCapacity = false;
                    var createdByParams = {
                        'meta.status': 'published',
                        'meta.v': {
                            $ne: 0
                        }
                    };
                    authentication.getUser().then(function(user) {

                        if ($scope.doc.meta && $scope.doc.meta.createdBy)
                            createdByParams = {
                                'meta.createdBy': $scope.doc.meta.createdBy,
                                'meta.status': {
                                    $in: ['draft', 'request']
                                },
                                'meta.v': {
                                    $ne: 0
                                }
                            };
                        var params = {
                            q: {
                                $or: [{
                                        'meta.status': 'published',
                                        'meta.v': {
                                            $ne: 0
                                        }
                                    }, {
                                        'meta.createdBy': user.userID,
                                        'meta.status': {
                                            $in: ['draft', 'request']
                                        },
                                        'meta.v': {
                                            $ne: 0
                                        }
                                    },
                                    createdByParams
                                ]
                            },
                        };
                        $http.get('/api/v2016/inde-orgs', {
                            'params': params
                        }).then(function(res) {
                            $scope.docs = res.data;
                            $scope.binding = _.clone($scope.binding);
                            mongoStorage.getCountries().then(function(data){
                              $scope.docs=_.union($scope.docs,data);
                            });
                        }).then(function() {
                            setChips();
                        });
                    });

                };


                //=======================================================================
                //
                //=======================================================================
                $scope.select = function(docObj, reload) {

                    docObj.selected = !docObj.selected;

                    if (!_.isArray($scope.binding)) $scope.binding = [];

                    if (docObj.selected)
                        $scope.binding.push(docObj._id);
                    else
                        _.remove($scope.binding, function(obj) {
                            return obj === docObj._id;
                        });

                    buldBindingMirror();
                    if (reload)
                        $scope.loadList();
                }; // select
            }
        };
    }]);
});