'use strict';

var webdriver = require('selenium-webdriver'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    fs = require('fs'),
    defaultTimeOut = 30 * 1000,
    experimental = require('../utils/experimental.js'),
    asyncIt = experimental.asyncIt;

jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeOut;
experimental.jasmineMoreInfo(jasmine);
experimental.jasmineItExtend(jasmine);

beforeAll(function(done) {
  this.driver = new webdriver.Builder('./chromedriver')
                .withCapabilities({'browserName': 'chrome'})
                .build();
  experimental.awaitSeleniumDriver(this.driver);
  this.driver._awaitWebElements = true;
  this.driver.manage().timeouts().implicitlyWait(1000);
  done();
});

beforeEach(function() {
  var specDesc = jasmine.moreInfo.currentSpec.description
  jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeOut;
  if (specDesc.indexOf(":SLOW") > -1 ) {
    console.log("SLOW TEST: "+specDesc);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1200 * 1000;
  }
  if (specDesc.indexOf(":SKIP") > -1 ) {
    console.log("SKIPPING TEST: "+specDesc);
    jasmine.skip = true;
  }
});

afterEach(asyncIt(function(done) {
  if(jasmine.moreInfo.currentSpec.status != 'passed') {
    fs.writeFileSync(
      jasmine.moreInfo.currentSpec.fullName + ".png",
      this.driver.takeScreenshot(),
      'base64');
  }
}));

afterAll(asyncIt(function(done) {
  this.driver.close();
  this.driver.quit();
}));
