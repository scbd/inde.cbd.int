define(['app', 'lodash',
    'text!./edit-organization.html',
    'text!directives/forms/edit/publish-dialog-org.html',
    'services/mongo-storage',
    'directives/forms/controls/scbd-file-upload',
    'ngDialog', 'ngSmoothScroll',
], function(app, _, template, dailogTemp) {

    app.directive("editOrganization", ['$q', '$http', '$filter', '$route', 'mongoStorage', '$location', '$window', 'ngDialog', 'history', 'smoothScroll', //"$http", "$filter", "Thesaurus",
        function($q, $http, $filter, $route, mongoStorage, $location, $window, ngDialog, history, smoothScroll) {
            return {
                restrict: 'E',
                template: template,
                replace: true,
                transclude: false,
                scope: {
                    hide: "=?",
                    selectedOrgs: "="
                },
                link: function($scope, $element, $attrs) { //, $http, $filter, Thesaurus

                        $scope.$watch('hide', function() {
                            if ($scope.hide)
                                init();
                        });


                        //==================================
                        //
                        //==================================
                        $scope.$watch('selectedOrgs', function() {
                          if ($scope.selectedOrgs)
                              $scope.isInForm = true;

                        }, true);


                        //=======================================================================
                        //
                        //=======================================================================
                        function init() {
                          $scope.loading = false;
                          $scope.schema = "inde-orgs";
                          $scope.shortForm = ($attrs.short !== undefined && $attrs.short !== null);
                          $scope.isNew = true;
                          if (!$scope.shortForm)
                              $scope._id = $route.current.params.id;

                          $scope.doc = {};
                          $scope.doc.tempFile={};
                            if ((!$scope._id || $scope._id === '0' || $scope._id === 'new') && $scope.hide) {

                                        delete($scope._id);
                                        $scope.doc = {};
                                        $scope.doc.meta={};
                                        $scope.doc.logo = 'app/images/ic_business_black_48px.svg';
                                        $scope.isNew = true;
                                        $scope.doc.hostOrgs = [];

                            } else {

                                if ($scope._id && $scope._id.length===24)
                                    mongoStorage.loadDoc('inde-orgs', $scope._id).then(function(document) {

                                        $scope.loading = true;
                                        $scope._id = document._id;
                                        $scope.doc = document;
                                        if (!$scope.doc.logo)
                                            $scope.doc.logo = 'app/images/ic_business_black_48px.svg';
                                        $scope.isNew = false;

                                    }).catch(onError);
                            }
                        }


                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.saveDoc = function() {
                            if(!$scope.doc.meta) $scope.doc.meta={};
                            var tempFile=getTempFile();
                            $scope.doc.meta.status = 'draft';
                            return mongoStorage.save('inde-orgs', $scope.doc, $scope._id).then(function(d) {
                                if(!$scope._id){
                                  $scope.$emit('showSuccess', 'Organization Created');
                                  $scope._id=d.data.id;
                                  if(!_.isEmpty(tempFile))
                                        saveLogoNewDoc(tempFile);
                                }else
                                  $scope.$emit('showSuccess', 'Organization Saved');

                                if ($scope.isInForm) {
                                    if (!_.isArray($scope.selectedOrgs)) $scope.selectedOrgs = [];

                                    $scope.selectedOrgs.push($scope._id);
                                    $scope.hide = 0;
                                    $scope.doc={};

                                    if(!_.isEmpty(tempFile))
                                        saveLogoNewDoc(tempFile).then(function(){$scope._id=null;});
                                    else
                                        $scope._id=null;
                                }
                            }).catch(onError);
                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        function saveLogoNewDoc(tempFile) {
                            tempFile.metadata.docid = $scope._id;

                            if (tempFile.metadata.schema && tempFile.metadata.docid && tempFile.metadata.filename) {

                                return mongoStorage.moveTempFileToPermanent(tempFile, $scope._id).then(function() {

                                    mongoStorage.loadDoc($scope.schema, $scope._id).then(function(document) {
                                        $scope.doc = document;
                                        $scope.doc.logo = 'https://s3.amazonaws.com/mongo.document.attachments/';
                                        $scope.doc.logo += tempFile.metadata.schema + '/';
                                        $scope.doc.logo += tempFile.metadata.docid + '/';
                                        $scope.doc.logo +=   mongoStorage.awsFileNameFix(tempFile.metadata.filename);

                                        return $scope.saveDoc();
                                    });
                                }).catch(onError);
                            } else
                                throw 'Error: Missing schema or id or filename to move file from temp to perminant';
                        } //saveLogoNewDoc
                        //============================================================
                        //
                        //============================================================
                        $scope.toggleIcon = function() {
                                $scope.doc.logo = 'app/images/ic_business_black_48px.svg';
                            }; // initProfile()


                        //============================================================
                        //
                        //============================================================
                        $scope.toggleForm = function() {
                                $scope.hide = !$scope.hide;
                        }; // initProfile()


                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.close = function() {
                            history.goBack();
                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.goTo = function(url) {

                            $location.url(url);
                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.requestPublish = function() {
                            $scope.doc.meta.status = 'request';
                            return $scope.saveDoc().then(function(d){
                              if(!$scope._id){
                                $scope.$emit('showSuccess', 'Organization Created and Under Review for Publication');
                                $scope._id=d.data.id;
                              }else
                                $scope.$emit('showSuccess', 'Organization Saved and Under Review for Publication');
                            }).catch(onError);

                        };

                        //=======================================================================
                        //
                        //=======================================================================
                        $scope.submitForm = function(formData) {
                            $scope.submitted = true;

                            if (formData.title && formData.acronym) {

                                if (!$scope.isInForm)
                                    $scope.publishRequestDial();
                                else
                                    $scope.saveDoc();
                            } else {

                                if (!formData.title && $scope.submitted) {
                                    findScrollFocus('editOrgForm.title');
                                    $scope.$emit('showError', 'Title of organization is required');
                                    return;
                                }
                                if (!formData.acronym && $scope.submitted){
                                  $scope.$emit('showError', 'Acronym of organization is required');
                                    findScrollFocus('editOrgForm.acronym');
                                  }

                            }

                            $scope.focused = false;

                        }; // archiveOrg

                        //=======================================================================
                        //
                        //=======================================================================
                        function findScrollFocus(id) {
                            var el = document.getElementById(id);
                            if (!$scope.focused) {

                                smoothScroll(el);
                                if ($(el).is("input") || $(el).is("select"))
                                    el.focus();
                                else {
                                    if ($(el).find('input').length === 0)
                                        $(el).find('textarea').focus();
                                    else
                                        $(el).find('input').focus();

                                }

                                $scope.focused = true;
                            }
                        }

                        //============================================================
                        //
                        //============================================================
                        $scope.publishRequestDial = function() {
                            if (!$scope.isInForm)
                                ngDialog.open({
                                    template: dailogTemp,
                                    className: 'ngdialog-theme-default',
                                    plain: true,
                                    scope: $scope,
                                    preCloseCallback: $scope.close
                                });
                        };

                        //============================================================
                        //
                        //============================================================
                        $scope.publishRequestDial = function() {

                            var dialog = ngDialog.open({
                                template: dailogTemp,
                                className: 'ngdialog-theme-default',
                                closeByDocument: false,
                                plain: true,
                                scope: $scope
                            });

                            dialog.closePromise.then(function(ret) {

                                if (ret.value === 'draft') {
                                  $scope.saveDoc();
                                }
                                if (ret.value == 'publish') $scope.requestPublish().catch(onError);

                            });
                        };

                        //============================================================
                        //
                        //============================================================
                        function onError (res) {

                            $scope.status = "error";
                            if (res.status === -1) {
                                $scope.error = "The URI " + res.config.url + " could not be resolved.  This could be caused form a number of reasons.  The URI does not exist or is erroneous.  The server located at that URI is down.  Or lastly your internet connection stopped or stopped momentarily. ";
                                if (res.data.message)
                                    $scope.error += " Message Detail: " + res.data.message;
                            }
                            if (res.status == "notAuthorized") {
                                $scope.error = "You are not authorized to perform this action: [Method:" + res.config.method + " URI:" + res.config.url + "]";
                                if (res.data.message)
                                    $scope.error += " Message Detail: " + res.data.message;
                            } else if (res.status == 404) {
                                $scope.error = "The server at URI: " + res.config.url + " has responded that the record was not found.";
                                if (res.data.message)
                                    $scope.error += " Message Detail: " + res.data.message;
                            } else if (res.status == 500) {
                                $scope.error = "The server at URI: " + res.config.url + " has responded with an internal server error message.";
                                if (res.data.message)
                                    $scope.error += " Message Detail: " + res.data.message;
                            } else if (res.status == "badSchema") {
                                $scope.error = "Record type is invalid meaning that the data being sent to the server is not in a  supported format.";
                            } else  if (res.data && res.data.Message)
                                $scope.error = res.data.Message;
                            else
                                $scope.error = res.data || res;
                        }
                        $scope.onError=onError;

                        //=======================================================================
                        //
                        //=======================================================================
                        function getTempFile(){
                          if(!_.isEmpty($scope.doc.tempFile)){
                            var tempFile=$scope.doc.tempFile;

                              delete($scope.doc.tempFile);
                              return tempFile;
                          }else
                            return false;
                        }//getTempFile

                        //============================================================
                        //
                        //============================================================
                        $scope.hasError = function() {
                            return !!$scope.error;
                        };
                    } //link
            }; //return
        }
    ]);
});