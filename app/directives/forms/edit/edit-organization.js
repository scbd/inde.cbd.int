define(['app', 'lodash',
    'text!./edit-organization.html',
    'text!directives/forms/edit/publish-dialog-org.html',
    'scbd-angularjs-controls/km-inputtext-ml',
    'scbd-angularjs-controls/km-control-group',
    'css!libs/ng-dialog/css/ngDialog.css',
    'css!libs/ng-dialog/css/ngDialog-theme-default.min.css',
    'scbd-angularjs-controls/km-select',
    'scbd-angularjs-controls/km-form-languages',
    'scbd-angularjs-controls/km-inputtext-list',
    '../../../services/mongo-storage',
    '../controls/scbd-file-upload'
], function(app, _,template,dailogTemp) { //'scbd-services/utilities',


  app.directive("editOrganization", [ '$q', '$http','$filter','$route','mongoStorage','$location','$window','ngDialog','history','smoothScroll', //"$http", "$filter", "Thesaurus",
      function( $q, $http,$filter,$route,mongoStorage,$location,$window,ngDialog,history,smoothScroll) {
      return {
        restrict   : 'E',
        template   : template,
        replace    : true,
        transclude : false,
        scope      : {hide:"=?", selectedOrgs:"="},
        link : function($scope,$element,$attrs) {//, $http, $filter, Thesaurus

            //  if(!$scope.hide)$scope.hide=0;
              $scope.loading=false;
              $scope.schema="inde-orgs";
              $scope.shortForm =($attrs.short !== undefined && $attrs.short !== null);
              $scope.isNew=true;
              if(!$scope.shortForm)
                $scope._id = $route.current.params.id;
              // $scope.toggle = scbdMenuService.toggle;
              // $scope.dashboard = scbdMenuService.dashboard;
              $scope.doc={};

              if($attrs.selectedOrgs)
                $scope.isInForm=true;

              if(!$scope._id || $scope._id==='0' || $scope._id==='new'){
                mongoStorage.createDoc('inde-orgs').then(
                        function(document){
                          $scope.loading=true;
                          $scope._id=document[0];
                          $scope.doc=document[1];
                          $scope.doc.logo='app/images/ic_business_black_48px.svg';
                          $scope.isNew=true;
                        }
                );

                }
              else{
                if($scope._id.search('^[0-9A-Fa-f]{24}$')<0)
                  $location.url('/404');
                else
                  mongoStorage.loadDoc('inde-orgs',$scope._id).then(function(document){

                        $scope.loading=true;
                        $scope._id=document[0];
                        $scope.doc=document[1];
                        if(!$scope.doc.logo)
                          $scope.doc.logo='app/images/ic_business_black_48px.svg';
                          $scope.isNew=false;
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

                  // organizationTypes: function() {
                  //     return $http.get("https://api.cbd.int/api/v2015/t_reg_org_typs", {
                  //         cache: true
                  //     }).then(function(o) {
                  //         return o.data;
                  //     });
                  // }
              };

              //=======================================================================
              //
              //=======================================================================
              $scope.saveDoc = function(){

                  mongoStorage.save('inde-orgs',$scope.doc,$scope._id).then(function(res){

                        // if(!($scope.hide  !== undefined && $scope.hide !== null)){
                        //         $scope._id=res.data._id;
                        //
                        // } else{
                        //   $scope.hide=0;

                          if($scope.isInForm){
                            if(!_.isArray($scope.selectedOrgs))$scope.selectedOrgs=[];
                            $scope.selectedOrgs.push(res.data._id);
                                 $scope.hide=0;
                          }
                          mongoStorage.createDoc('inde-orgs').then(
                                  function(document){
                                    $scope.loading=true;
                                    $scope._id=document[0];
                                    $scope.doc=document[1];
                                    $scope.doc.logo='app/images/ic_business_black_48px.svg';
                                    $scope.isNew=true;
                                    $scope.hide=0;
                                  }
                          );
                      //  }
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
                mongoStorage.save($scope.schema,$scope.doc,$scope._id);

              };
              //=======================================================================
    		      //
    		      //=======================================================================
    		      $scope.submitForm = function (formData){
                $scope.submitted=true;

                if(formData.$valid){
                  $scope.saveDoc();
                  $scope.publishRequestDial();
                }else {

                    if(formData.title.$error.required && $scope.submitted){
                        findScrollFocus ('editOrgForm.title');
                        return;
                    }
                    if(formData.acronym.$error.required && $scope.submitted)
                        findScrollFocus ('editOrgForm.acronym');

                }

                $scope.focused=false;

    		      };// archiveOrg
              //SET CURSOR POSITION
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
        }//link
      };//return
  }]);
});