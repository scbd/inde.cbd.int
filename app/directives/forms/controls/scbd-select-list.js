define(['app',
    'lodash',
    'text!./scbd-select-list.html',
    'services/filters',
    'services/mongo-storage',
    'css!libs/angular-dragula/dist/dragula.css',
], function(app, _, template) {
    'use strict';
    app.directive('scbdSelectList', ["$location", "$timeout", 'mongoStorage', '$q', function($location, $timeout, mongoStorage, $q) {

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

                var numOrgs = 0;


                //==================================
                //
                //==================================
                $scope.$watch('binding', function() {

                    if (typeof $scope.binding !== 'undefined' && !_.isEmpty($scope.docs) && ($scope.binding && $scope.binding.length !== numOrgs)) {

                        numOrgs = $scope.binding.length;
                        buldBindingMirror(true);

                    } else if (typeof $scope.binding !== 'undefined' && !_.isEmpty($scope.docs) && ($scope.binding && $scope.binding.length === numOrgs))
                        buldBindingMirror(false);
                }, true);


                //==================================
                //
                //==================================
                $scope.$watch('doc', function() {
                    if ($scope.doc && (_.isArray($scope.doc.hostOrgs) && $scope.doc.hostOrgs.length !== 0))
                        buldBindingMirror(true);
                    else if (!($scope.docs && !_.isEmpty($scope.docs))) {
                        $scope.doc.hostOrgs = [];
                        $scope.loadList();
                    }
                });


                //==================================
                //
                //==================================
                function buldBindingMirror(reloadAllOrgs) {

                    if (reloadAllOrgs)
                        $q.when($scope.loadList()).then(function() {
                            populateMirror();
                        });
                    else
                        populateMirror();

                } // init

                //==================================
                //
                //==================================
                function populateMirror() {
                    var org;
                    $scope.mirror = [];
                    $scope.binding=_.uniq($scope.binding);
                    if ($scope.binding.length) numOrgs = $scope.binding.length;
                    if ($scope.docs && $scope.docs.length > 0)
                        _.each($scope.binding, function(val, key) {
                            org = _.find($scope.docs, {
                                '_id': val
                            });

                            if (org){
                              org.selected=true;
                                $scope.mirror[key] = org;
                              }
                            else {
                                if(val.length>2)
                                mongoStorage.loadDoc('inde-orgs', val).then(
                                    function(res) {

                                        if (_.isObject(res) && res.meta && (res.meta.status === 'published' || res.meta.status === 'draft' || res.meta.status === 'request')) {
                                            res.selected=true;
                                            $scope.mirror[key] = res;

                                            $scope.loadList(true).then(function() {
                                                $scope.search = res.title;
                                            });

                                        } else {
                                            numOrgs = numOrgs - 1;
                                            $scope.binding.splice(key, 1);
                                        }
                                    }
                                );
                            }

                        });
                }

                //==================================
                //
                //==================================
                function setChips() {


                    if ($scope.binding)
                        if ($scope.binding.length > 0) {
                            $scope.loading = false;

                            _.each($scope.docs, function(doc) {
                                _.each($scope.binding, function(id) {
                                    if (doc._id === id)
                                        doc.selected = true;
                                });
                            });

                        }


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
                    if (event.keyCode === 13)
                        event.preventDefault();
                }; //$scope.noEnter


                //=======================================================================
                //
                //=======================================================================
                $scope.loadList = function(force) {

                    if (force || (!force && _.isEmpty($scope.docs)))
                        return mongoStorage.loadOrgs().then(function(res) {
                            $scope.docs = res;
                            setChips();
                        }).then(loadHostOrgs);
                };
                //=======================================================================
                //
                //=======================================================================
                function loadHostOrgs() {

                    _.each($scope.binding, function(orgId) {
                        if (!_.find($scope.docs, {
                                _id: orgId
                            })) {
                            mongoStorage.loadDoc('inde-orgs', orgId).then(function(responce) {
                                if (!_.find($scope.docs, {
                                        _id: orgId
                                    }) && mongoStorage.isPublishable(responce))
                                    $scope.docs.push(responce);
                            });
                        }
                    });
                } //submitGeneral

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

                    if (reload)
                        $scope.loadList();

                }; // select
            }
        };
    }]);
});