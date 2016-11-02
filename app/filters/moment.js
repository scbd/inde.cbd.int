define(['app', 'moment-timezone'], function(app, moment) { 'use strict';

    app.filter('moment', [function() {

        return function(datetime, method, arg1, arg2, arg3) {
            return moment(datetime)[method](arg1, arg2, arg3);
        };
    }]);

    app.filter('momentTZ', [function() {

        return function(datetime,timezone, method, arg1, arg2, arg3) {
            return moment.tz(datetime,timezone)[method](arg1, arg2, arg3);
        };
    }]);

});
