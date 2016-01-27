//To get sjhint to ignore protrator calls ad this to .jshint "browser","element","by","expect","protractor","beforeEach"
describe('Sign-In Page', function() { //jshint ignore:line

  var EC = protractor.ExpectedConditions;

  beforeEach(function() {
    browser.get('/');
    browser.driver.sleep(1);
    browser.waitForAngular();
    //       spyOn(console, 'error');
  }); // it



  it('should have a title', function() { //jshint ignore:line
    expect(browser.getTitle()).toEqual('Accounts: Convention on Biological Diversity');
  }); // it

  it('should show alert message when invalid email/password is submitted', function() { //jshint ignore:line

    element(by.model('email')).sendKeys(1);
    element(by.model('password')).sendKeys(2);
    $('.btn-primary').click().then(function() {
      EC.visibilityOf($('#failedLoginAlert'));
    });
    //  browser.debugger();
  }); // it



  it('should not report errors when the page is loaded', function() {

        if (browser.browserName !== 'internet explorer') {
          var count = 0;
          browser.manage().logs().get('browser').then(function(browserLog) {

            for (var i = 0; i < browserLog.length; i++) {
              if (browserLog[i].level.name === 'SEVERE'){
                    count++;
                    console.log('-----------------------',browserLog[i]);
              }

            }
            expect(count).toEqual(0);
          });
        }
    });

});

