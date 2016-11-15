'use strict';

var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    By = require('selenium-webdriver').By,
    experimental = require('../utils/experimental.js'),
    asyncIt = experimental.asyncIt;

describe("YAHOO search - ", function() {

  function search(driver, searchString) {
    var searchField = driver.findElement(By.id("uh-search-box"));
    searchField.click();
    searchField.clear();
    searchField.sendKeys(searchString);
    driver.findElement(By.id("uh-search-button")).click();
  }

  beforeEach(asyncIt(function(done) {
    this.driver.get("https://www.yahoo.com/");
  }));

  it('Does YAHOO Search work', asyncIt(function(done){
    var driver = this.driver, searchResults;
    search(driver, "Pokemon");
    searchResults = driver.findElements(By.css('[class*="dd algo"]'));
    expect(searchResults).toBeTruthy();
    expect(searchResults.length).toBeGreaterThan(1);
    searchResults[1].click();
  }));
});
