'use strict';

var webdriver = require('selenium-webdriver'),
    fs = require('fs'),
    defaultTimeOut = 60 * 1000,
    slowTimeOut = 1200 * 1000,
    experimental = require('../utils/experimental.js');

jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeOut;
experimental.jasmineMoreInfo(jasmine);

function getTimeStamp() {
  return new Date().toISOString().replace(/T/,'')
    .replace(/\..+/,'').replace(/:/g,'').replace(/-/g,'');
}


beforeAll(function() {
  this.driver = new webdriver.Builder('./chromedriver')
                .withCapabilities({'browserName': 'chrome'})
                .build();
  this.driver.manage().timeouts().implicitlyWait(5000);
});

beforeEach(function() {
  var specDesc = jasmine.moreInfo.currentSpec.description
  jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeOut;
  if (specDesc.indexOf(":SLOW") > -1 ) {
    console.log("SLOW TEST: "+specDesc);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = slowTimeOut;
  }
});

afterEach(async function(done) {
  if(jasmine.testcaseFailed) {
    fs.writeFileSync(
      jasmine.moreInfo.currentSpec.fullName + "." + getTimeStamp() + ".png",
      await this.driver.takeScreenshot(),
      'base64');
  }
  done();
});

afterAll(async function(done) {
  await this.driver.close();
  await this.driver.quit();
  done();
});
