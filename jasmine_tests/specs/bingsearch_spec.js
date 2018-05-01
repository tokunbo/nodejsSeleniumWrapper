'use strict';

var By = require('selenium-webdriver').By,
  doIt = require('../utils/experimental.js').doIt;

describe("BING search - ", function() {
  var driver = null;

  beforeAll(function() {
    driver = this.driver;
  });

  async function search(searchString) {
    var searchField = await driver.findElement(By.id("sb_form_q"));
    await searchField.click();
    await searchField.clear();
    await searchField.sendKeys(searchString);
    await (await driver.findElement(By.id("sb_form_go"))).click();
  }

  beforeEach(async function(done) {
    await driver.get("https://www.bing.com/");
    done();
  });

  doIt('Does BING Search work', async function(done) {
    var searchResults;
    await search("Pokemon");
    searchResults = await driver.findElements(By.css('[class="b_algo"]'));
    expect(searchResults).toBeTruthy();
    expect(searchResults.length).toBeGreaterThan(1);
    await searchResults[1].click();
  });
});
