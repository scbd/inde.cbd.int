define(['app', 'lodash','moment','text!./ouical-dialog.html','directives/mobi-menu',    'directives/link-list','directives/share',    'directives/ouical','ngDialog'], function(app, _,moment,ouicalDialog) {
    app.filter('fileSize', function() {
        return function(size) {
            if (size < 1024)
                return Math.ceil(size) + ' B';
            else if (size < 1048576)
                return Math.ceil((Number(size) / 1024)) + ' KB';
            else
                return Math.ceil((Number(size) / 1048576)) + ' MB';
        };
    });

    return ['$scope','mongoStorage', '$route', '$http', '$sce', '$location', '$q','authentication','$window','devRouter','$timeout','ngDialog', function($scope,mongoStorage, $route, $http, $sce, $location, $q, auth,$window,devRouter,$timeout,ngDialog) {
        var _ctrl = this;
        var allOrgs;
        var editable=false;
        _ctrl.loadingAuth =true;
        _ctrl.hasError = hasError;
        _ctrl.trustSrc = trustSrc;
        _ctrl.isEditable= isEditable;
        _ctrl.notAuth = true;
        _ctrl.goTo = goTo;
        _ctrl.tab = 'description';
        _ctrl.scheduled=false;
        _ctrl.aichiLink=aichiLink;
        _ctrl.aichiImgLink=aichiImgLink;
        _ctrl.calDialog=calDialog;
        _ctrl.isChromeIOS = isChromeIOS;
        init();
        return this;


        //==============================
        //
        //==============================
        function loadOrgs() {
            return mongoStorage.loadOrgs('inde-orgs').then(function(orgs) {
                allOrgs = orgs;
            });
        }
        //============================================================
        //
        //============================================================
        function calDialog (res) {

            $scope.dialogRes=Object.assign(_ctrl.reservation,_ctrl.doc);
            $scope.room=_ctrl.room;
            $scope.isChromeIOS = isChromeIOS;

            ngDialog.open({
                template: ouicalDialog,
                className: 'ngdialog-theme-default',
                closeByDocument: true,
                plain: true,
                scope: $scope
            });

        }; //$scope.roomDialog
        //==============================
        //
        //==============================
        function loadEditPermisions(doc) {
            return auth.getUser().then(
              function(u){
                  if(doc && doc.meta)
                    editable = (_.intersection(['Administrator', 'IndeAdministrator'], u.roles).length > 0 ) ||
                    (u.userID===doc.meta.createdBy && !isPastConfrence(doc.conference)) ;
                  else
                    editable =  false;

                  return editable ;
              }
            );
        }

        //==============================
        //
        //==============================
        function isChromeIOS(){

          if(/CriOS/i.test(navigator.userAgent) &&
              /iphone|ipod|ipad/i.test(navigator.userAgent)){
                  return true;
              }else{
                  return false;
              }
        }

        //==============================
        //
        //==============================
        function isPastConfrence(id) {

            var c = _.find(_ctrl.conferences,{'_id':id});
            if(!c) throw "error: conference not found";

            if(moment(c.EndDate).isAfter(new Date()))
                return false;
            else
               return true;

        }

        //==============================
        //
        //==============================
        function isEditable() {
            return editable;
        }

        //==============================
        //
        //==============================
        function loadConfrences() {

            return $http.get('/api/v2016/conferences', {
                params: {
                    s:{StartDate:1},
                    f:{Title:1,MajorEventIDs:1,timezone:1}
                }
            },{
                cache: true
            }).then(function(conf) {
                _ctrl.conferences = conf.data;

            }).then(function(){
              _.each(_ctrl.conferences, function(conf, key) {
                var oidArray=[];
              if(!_.isArray(conf.MajorEventIDs))conf.MajorEventIDs=[];

              _.each(conf.MajorEventIDs, function(id) {
                  oidArray.push({
                      '$oid': id
                  });
              });

              $http.get("/api/v2016/meetings", {
                  params: {
                      q: {
                          _id: {
                              $in: oidArray
                          }
                      },
                      f:{EVT_TIT_EN:1,EVT_CD:1}
                  }
              }, {
                  cache: true
              }).then(function(m) {
                  _ctrl.conferences[key].meetings = m.data;

              });
                });

            });
        }


        //==============================
        //
        //==============================
        function loadDoc() {
            var _id = $route.current.params.id;
            var params = {
                f:{'meta.status':1,title:1,description:1,hostOrgs:1,id:1,conference:1,logo:1,subjects:1,targets:1,videos:1,publications:1,links:1,images:1,meetings:1}
            };
            return $http.get('/api/v2016/inde-side-events/'+_id, {params:params}).then(function(se) {
                se=se.data;
                var paramsR ={q:{'sideEvent.id':se.id},f:{start:1,end:1,'location.room':1,open:1}};
                $http.get('/api/v2016/reservations/', {params:paramsR}).then(function(res) {
                    return _ctrl.reservation=res.data[0];
                }).then(function(r){
                        if(r && r.location && r.location.room)
                        return $http.get('/api/v2016/venue-rooms/'+r.location.room, {params:{f:{title:1,acronym:1,location:1,atTable:1,capacity:1}}}).then(function(room) {
                            _ctrl.room=room.data;
                            if(_ctrl.room)
                              _ctrl.scheduled=true;
                        });
                });

                return loadEditPermisions(se).then(function(){

                  if(isEditable() || se.meta.status==='published'){
                    _ctrl.notAuth=false;
                    _ctrl.doc = se;
                    _ctrl.doc.orgs = [];
                  }else if(Number(_id))
                      return loadSideEventFromRes();

                });
            }).catch(function(error){

              if(error.status===403 || (_ctrl.doc && _ctrl.doc.meta.status!=='published'))
                loadSideEventFromRes();


            });
        }

        //==============================
        //
        //==============================
        function loadSideEventFromRes(){
            var _id = $route.current.params.id;
            _ctrl.loadingAuth =true;
          return $http.get("/api/v2016/reservations", {
              params: {
                  q: {
                      'sideEvent.id': Number(_id),
                      '$and':[{start:{$exists:true}},{start:{$ne:null}}]
                  }
              }
          }).then(function(se) {

              if(se.data.length){

                _ctrl.doc = se.data[0].sideEvent;
                _ctrl.doc.orgs = [];
                _ctrl.notAuth=false;
                _ctrl.loadingAuth =false;
              }

              //wasPrevPub(_ctrl.doc );
          });
        }

        //==============================
        //
        //==============================
        function loadSubjects() {

            return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {

            }).then(function(res) {
                if(!_ctrl.doc)_ctrl.doc={};

                _ctrl.doc.subjectObjs = [];
                _.each(_ctrl.doc.subjects, function(subj) {

                    if(_.isObject(subj))
                        _ctrl.doc.subjectObjs.push(_.find(res.data, {
                            'identifier': subj.identifier
                        }));
                    else
                      _ctrl.doc.subjectObjs.push(_.find(res.data, {
                          'identifier': subj
                      }));
                });
            }).catch(onError);
        }
        //==============================
        //
        //==============================
        function getSubjects(keys) {

            return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
                cache: true
            }).then(function(res) {
                if(!_ctrl.doc)_ctrl.doc={};

                _ctrl.doc.subjectObjs = [];
                _.each(_ctrl.doc.subjects, function(subj) {

                    _ctrl.doc.subjectObjs.push(_.find(res.data, {
                        'identifier': subj.identifier
                    }));

                });

            }).catch(onError);
        }
        //============================================================
        //
        //============================================================
        function wasPrevPub(body) {
          var wasReqOrPub = false;
          if(!body.history || body.history.length===0) return wasReqOrPub;

          body.history.forEach(function(d,index){

                if(d.meta.status==='published' )
                  wasReqOrPub = d;
          });
          return wasReqOrPub;
        }
        //==============================
        //
        //==============================
        function init() {

            $q.all([loadConfrences(), loadOrgs(),loadDoc()]).then(function() {
                loadSubjects();

                if(!_ctrl.doc) return;
                _ctrl.doc.conferenceObj = _.find(_ctrl.conferences, {
                    '_id': _ctrl.doc.conference
                });


                if (allOrgs && allOrgs.length > 0) {
                    _.each(_ctrl.doc.hostOrgs, function(org) {
                      var o =_.find(allOrgs, {
                          '_id': org
                      });
                      if(o)
                        _ctrl.doc.orgs.push(o); // findWhere
                      else
                        _ctrl.doc.orgs.push({'_id':org,acronym:'ORG WAITING FOR APPROVAL'});
                    }); // each

                }

            }).catch(onError);
        }

        //============================================================
        //
        //============================================================
        function goTo(url, code) {
            if (code)
                $location.url(url + code);
            else
                $location.url(url);
        }

        //============================================================
        //
        //============================================================
        function hasError() {
            return !!_ctrl.error;
        }
        //============================================================
        //
        //============================================================
        function trustSrc(src) {
            return $sce.trustAsResourceUrl(src);
        }

        //============================================================
        //
        //============================================================
        function aichiLink(target) {
            if(!target)return '';
            var number = Number(target.substring(target.length-2));
            return 'https://www.cbd.int/aichi-targets/target/'+number;
        }

        //============================================================
        //
        //============================================================
        function aichiImgLink(target) {
            if(!target)return '';
            var number = Number(target.substring(target.length-2));
            return 'https://www.cbd.int/app/images/aichi-targets/abt-'+number+'-96.png';
        }

        //============================================================
        //
        //============================================================
        function onError(res) {

            _ctrl.status = "error";
            if (res.status === -1) {
                _ctrl.error = "The URI " + res.config.url + " could not be resolved.  This could be caused form a number of reasons.  The URI does not exist or is erroneous.  The server located at that URI is down.  Or lastly your internet connection stopped or stopped momentarily. ";
                if (res.data && res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            }
            if (res.status == "notAuthorized") {
                _ctrl.error = "You are not authorized to perform this action: [Method:" + res.config.method + " URI:" + res.config.url + "]";
                if (res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            } else if (res.status == 404) {
                _ctrl.error = "The server at URI: " + res.config.url + " has responded that the record was not found.";
                if (res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            } else if (res.status == 500) {
                _ctrl.error = "The server at URI: " + res.config.url + " has responded with an internal server error message.";
                if (res.data.message)
                    _ctrl.error += " Message Detail: " + res.data.message;
            } else if (res.status == "badSchema") {
                _ctrl.error = "Record type is invalid meaning that the data being sent to the server is not in a  supported format.";
            } else if (res.data && res.data.Message)
                _ctrl.error = res.data.Message;
            else
                _ctrl.error = res.data;
        }




    }];


});