/* jshint sub:true */

define(['app'], function(app) {
    'use strict';
    /***************************************************************************************
     * dev env variables
     ***************************************************************************************/
    app.factory('devRouter', [function() {

        var domain = document.location.hostname.replace(/[^\.]+\./, '');
        var production = false; // change to true to work on production accounts from dev
        if ((~domain.indexOf('localhost') || ~domain.indexOf('cbddev.xyz') ))
          domain='cbddev.xyz';
        else if (~domain.indexOf('staging.cbd.int'))
          domain='staging.cbd.int';
        else
          domain = 'cbd.int';

        var ACCOUNTS_URI = 'https://accounts.' + domain;


        /***************************************************************************************
         *

         ***************************************************************************************/
        function isDev() {
          if((domain == 'localhost' || domain == 'houlahan.local' ||(domain.indexOf('cbddev.xyz') >= 0)) && !production)
            return true;
            else {
              return '';
            }
        }

        return {
            ACCOUNTS_URI: ACCOUNTS_URI,
            DOMAIN: domain,
            isDev: isDev
        };
    }]);
});
