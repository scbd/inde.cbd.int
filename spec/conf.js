exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  framework: 'jasmine2',
  sauceSeleniumAddress: 'localhost:4444/wd/hub',
  baseUrl: 'http://localhost:8000',
  // Selector for the element housing the angular app - this defaults to
  // body, but is necessary if ng-app is on a descendant of <body>
  // solved intermintent fails
  rootElement: 'body',
  specs: ['*[sS]pec.js'],
  //  maxSessions: 1,
  multiCapabilities: [{
    browserName: 'chrome',
    platform: 'Windows 7',
  }, {
    browserName: 'firefox',
    platform: 'Windows 7',
  }, {
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '10.0'
  }, {
    browserName: 'safari',
    platform: 'OS X 10.10',
  }],
  onPrepare: function() {
    browser.driver.manage().window().maximize();
    return browser.getCapabilities().then(function(cap) {
      browser.browserName = cap.caps_.browserName;
    });
  }
};
