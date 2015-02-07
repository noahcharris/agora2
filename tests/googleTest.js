module.exports = {
  // 'Demo test Google' : function (browser) {
  //   browser
  //     .url('http://www.google.com')
  //     .waitForElementVisible('body', 1000)
  //     .setValue('input[type=text]', 'nightwatch')
  //     .waitForElementVisible('button[name=btnG]', 1000)
  //     .click('button[name=btnG]')
  //     .pause(1000)
  //     .assert.containsText('#main', 'The Night Watch')
  //     .end();
  // },



  'First Test Agora' : function(browser) {
    browser 
      .url('http://egora.co')
      .waitForElementVisible('body', 1000)
      .click('#registrationButton')
      .waitForElementVisible('#loginUsernameInput', 1000)
      .setValue('#loginUsernameInput', 'noah')
      .setValue('#loginPasswordInput', 'testing')
      .click('#loginButton')
      .pause(500)
      .click('.sidebarContentWrapper')
      .waitForElementVisible('.replyButton', 500)
      .click('.replyButton')
      .waitForElementVisible('#inputBox', 1000)
      .end();



  }




};