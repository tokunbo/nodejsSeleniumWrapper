'use strict';

var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    By = require('selenium-webdriver').By,
    experimental = require('../utils/experimental.js'),
    asyncIt = experimental.asyncIt;

describe("BING search - ", function() {

  function search(driver, searchString) {
    var searchField = driver.findElement(By.id("sb_form_q"));
    searchField.click();
    searchField.clear();
    searchField.sendKeys(searchString);
    driver.findElement(By.id("sb_form_go")).click();
  }

  beforeEach(asyncIt(function(done) {
    this.driver.get("https://www.bing.com/");
  }));

  it('Does BING Search work', asyncIt(function(done){
    var driver = this.driver, searchResults;
    search(driver, "Pokemon");
    searchResults = driver.findElements(By.css('[class="b_algo"]'));
    expect(searchResults).toBeTruthy();
    expect(searchResults.length).toBeGreaterThan(1);
    searchResults[1].click();
  }));
});


