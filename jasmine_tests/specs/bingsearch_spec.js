'use strict';

var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    By = require('selenium-webdriver').By,
    experimental = require('../utils/experimental.js'),
    asyncIt = experimental.asyncIt;

describe("Sanrio Online Store - ", function() {
  it('Add bag to shopping cart', asyncIt(function(done){
    var driver = this.driver, products;

    driver.findElements(By.css("button[title='Close']"))
    .forEach(function(button) {
      button.click();
    });

    driver.findElement(By.linkText("Sale")).click();

    products = driver.findElements(By.css("div[class='product-summary']"))
    .map(function(product) {
      return JSON.parse(product.findElement(By.tagName("a"))
        .getAttribute("data-analytics-product-impression"));
    });

    console.log(products.length + " products on page.");
  }));

  it('Add all page1 HomeOffice items :SLOW', asyncIt(function(done){
    this.driver.get("http://xwww.google.com");
    console.log("I'm done in 9s");
    setTimeout(done, 9000);
  }));

  it('I am going to be skipped :SKIP', asyncIt(function(done) {
    console.log("You will not see this message.");
    setTimeout(function() {
      console.log("And you'll Never see this message either.");
      done();
    }, 3000);
  }));
});


