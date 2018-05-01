'use strict';

var By = require('selenium-webdriver').By,
  doIt = require('../utils/experimental.js').doIt;

describe("YAHOO search - ", function() {
  var driver = null;

  beforeAll(function() {
    driver = this.driver;
  });

  async function search(searchString) {
    var searchField = await driver.findElement(By.id("uh-search-box"));
    await searchField.click();
    await searchField.clear();
    await searchField.sendKeys(searchString);
    await (await driver.findElement(By.id("uh-search-button"))).click();
  }

  beforeEach(async function(done) {
    await driver.get("https://www.yahoo.com/");
    done();
  });

  doIt('Does YAHOO Search work', async function(done){
    var searchResults;
    await search("Pokemon");
    searchResults = await driver.findElements(By.css('[class*="dd algo"]'));
    expect(searchResults).toBeTruthy();
    expect(searchResults.length).toBeGreaterThan(1);
    await searchResults[1].click();
  });
});
