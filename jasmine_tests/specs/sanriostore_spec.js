'use strict';

var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    By = require('selenium-webdriver').By,
    experimental = require('../utils/experimental.js'),
    asyncIt = experimental.asyncIt;

describe("Sanrio Online Store, Characters - ", function() {

  function goToProductPage(driver) {
    driver.findElements(By.css("button[title='Close']"))
    .forEach(function(button) {
      button.click();
    });
    driver.findElement(By.linkText("Characters")).click();
    return driver.findElements(By.css("a[itemprop='url']"))
    .map(function(link) {
      return link.getAttribute('innerText').trim();
    });
  }

  beforeEach(asyncIt(function(done) {
    this.driver.get("https://www.sanrio.com/shop");
  }));

  it('Add first product to shopping cart', asyncIt(function(done) {
    var driver = this.driver, products;
    products = goToProductPage(driver);
    console.log(products.length + " products on page.");
    driver.findElement(By.css("a[itemprop='url']")).click();
    driver.findElement(By.css("button[value='add_to_cart']")).click();
    driver.wait(async(function() {
      return driver.findElements(By.linkText("View Shopping Bag")).length;
    }), 20000);
  }));

  it('Add all initial page1 items to cart :SLOW', asyncIt(function(done) {
    var driver = this.driver, products;
    products = goToProductPage(driver);
    console.log(products.length + " products on page.");
    products.forEach(function(linkText) {
      driver.findElement(By.linkText(linkText)).click();  
      driver.findElement(By.css("button[value='add_to_cart']")).click();
      driver.wait(async(function() {
        return driver.findElements(By.linkText("View Shopping Bag")).length;
      }), 20000);
      await(driver.navigate().back());
    });
  }));

  it('I am going to be skipped :SKIP', function(done) {
    console.log("You will not see this message.");
    setTimeout(function() {
      console.log("And you'll Never see this message either.");
      done();
    }, 3000);
  });
});


