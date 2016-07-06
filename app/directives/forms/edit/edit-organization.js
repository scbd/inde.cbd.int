define(['app', 'lodash',
    'text!./edit-organization.html',
    'text!directives/forms/edit/publish-dialog-org.html',
    'services/mongo-storage',
    'directives/forms/controls/scbd-file-upload',
    'ngDialog','ngSmoothScroll',
], function(app, _,template,dailogTemp) {


  app.directive("editOrganization", [ '$q', '$http','$filter','$route','mongoStorage','$location','$window','ngDialog','history','smoothScroll', //"$http", "$filter", "Thesaurus",
      function( $q, $http,$filter,$route,mongoStorage,$location,$window,ngDialog,history,smoothScroll) {
      return {
        restrict   : 'E',
        template   : template,
        replace    : true,
        transclude : false,
        scope      : {hide:"=?", selectedOrgs:"="},
        link : function($scope,$element,$attrs) {//, $http, $filter, Thesaurus

              $scope.loading=false;
              $scope.schema="inde-orgs";
              $scope.shortForm =($attrs.short !== undefined && $attrs.short !== null);
              $scope.isNew=true;
              if(!$scope.shortForm)
                $scope._id = $route.current.params.id;

              $scope.doc={};

              if($attrs.selectedOrgs)
                $scope.isInForm=true;

              if(!$scope._id || $scope._id==='0' || $scope._id==='new'){
                mongoStorage.createDoc('inde-orgs').then(
                        function(document){
                          $scope._id=document._id;
                          $scope.doc=document;
                          $scope.doc.logo='app/images/ic_business_black_48px.svg';
                          $scope.isNew=true;
                          $scope.doc.hostOrgs=[];
                        }
                );

                }
              else{
                if($scope._id.search('^[0-9A-Fa-f]{24}$')<0)
                  $location.url('/404');
                else
                  mongoStorage.loadDoc('inde-orgs',$scope._id).then(function(document){

                        $scope.loading=true;
                        $scope._id=document._id;
                        $scope.doc=document;
                        if(!$scope.doc.logo)
                          $scope.doc.logo='app/images/ic_business_black_48px.svg';
                          $scope.isNew=false;

                        if(!$scope.doc.hostOrgs)$scope.doc.hostOrgs=[];
                  });
              }

              $scope.options = {
                  countries: function() {
                      return $http.get("https://api.cbd.int/api/v2015/countries", {
                          cache: true
                      }).then(function(o) {
                          return $filter("orderBy")(o.data, "name.en");
                      });
                  },
              };

              //=======================================================================
              //
              //=======================================================================
              $scope.saveDoc = function(){
                  $scope.doc.meta.status='draft';
                  mongoStorage.save('inde-orgs',$scope.doc,$scope._id).then(function(res){

                          if($scope.isInForm){
                             if(!_.isArray($scope.selectedOrgs))$scope.selectedOrgs=[];
                             $scope.selectedOrgs.push($scope._id);
                             $scope.hide=0;
                             mongoStorage.createDoc('inde-orgs').then(
                                     function(document){
                                       $scope._id=document._id;
                                       $scope.doc=document;
                                       $scope.doc.logo='app/images/ic_business_black_48px.svg';
                                       $scope.isNew=true;
                                       $scope.hide=0;
                                       $scope.submitted=false;
                                     }
                             );
                          }
                  });
              };

              //============================================================
              //
              //============================================================
              $scope.toggleIcon= function() {
                      $scope.doc.logo='app/images/ic_business_black_48px.svg';
              }// initProfile()

              //============================================================
              //
              //============================================================
              $scope.toggleForm= function() {
                      $scope.hide=!$scope.hide;
              }// initProfile()
                //=======================================================================
                //
                //=======================================================================
                $scope.close = function(){
                    history.goBack();
                };

              //=======================================================================
              //
              //=======================================================================
              $scope.goTo = function(url){

                  $location.url(url);
              };

              //============================================================
              //
              //============================================================
              $scope.requestPublish = function () {
                //dialogTemplate = $compile(dialogTemplate,$scope);

                $scope.doc.meta.status='request';
                return mongoStorage.save($scope.schema,$scope.doc,$scope._id);

              };
              //=======================================================================
    		      //
    		      //=======================================================================
    		      $scope.submitForm = function (formData){
                $scope.submitted=true;

                if(formData.title && formData.acronym){
                  $scope.saveDoc();
                  if(!$scope.isInForm)
                    $scope.publishRequestDial();
                }else {

                    if(!formData.title && $scope.submitted){
                        findScrollFocus ('editOrgForm.title');
                        return;
                    }
                    if(!formData.acronym && $scope.submitted)
                        findScrollFocus ('editOrgForm.acronym');

                }

                $scope.focused=false;

    		      };// archiveOrg

              //=======================================================================
              //
              //=======================================================================
              function findScrollFocus (id){
                    var el = document.getElementById(id);
                    if(!$scope.focused ){

                      smoothScroll(el);
                      if($(el).is("input") || $(el).is("select"))
                        el.focus();
                      else{
                        if($(el).find('input').length===0)
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
              $scope.publishRequestDial = function () {
                    if(!$scope.isInForm)
                        ngDialog.open({ template: dailogTemp, className: 'ngdialog-theme-default',plain: true ,scope:$scope,preCloseCallback:$scope.close});


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

                  if (ret.value == 'draft') $scope.close();
                  if (ret.value == 'publish') $scope.requestPublish().then($scope.close).catch(function onerror(response) {

                    $scope.onError(response);

                  });

                });
              };

                          //============================================================
                          //
                          //============================================================
                          $scope.onError = function(res)
                          {

                            $scope.status = "error";
                            if(res.status===-1){
                                $scope.error="The URI "+res.config.url+" could not be resolved.  This could be caused form a number of reasons.  The URI does not exist or is erroneous.  The server located at that URI is down.  Or lastly your internet connection stopped or stopped momentarily. ";
                                if(res.data.message)
                                  $scope.error += " Message Detail: "+res.data.message;
                            }
                            if (res.status == "notAuthorized") {
                              $scope.error  = "You are not authorized to perform this action: [Method:"+res.config.method+" URI:"+res.config.url+"]";
                              if(res.data.message)
                                $scope.error += " Message Detail: "+res.data.message;
                            }
                            else if (res.status == 404) {
                              $scope.error  = "The server at URI: "+res.config.url+ " has responded that the record was not found.";
                              if(res.data.message)
                                $scope.error += " Message Detail: "+res.data.message;
                            }
                            else if (res.status == 500) {
                              $scope.error  = "The server at URI: "+res.config.url+ " has responded with an internal server error message.";
                              if(res.data.message)
                                $scope.error += " Message Detail: "+res.data.message;
                            }
                            else if (res.status == "badSchema") {
                              $scope.error  = "Record type is invalid meaning that the data being sent to the server is not in a  supported format.";
                            }
                            else if (res.data.Message)
                              $scope.error = res.data.Message;
                            else
                              $scope.error = res.data;
                          };
                          //============================================================
                    			//
                    			//============================================================
                    			$scope.hasError = function() {
                    				return !!$scope.error;
                    			};
        }//link
      };//return
  }]);
});