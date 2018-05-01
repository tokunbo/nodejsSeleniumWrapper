'use strict';

var doIt = require('../utils/experimental.js').doIt,
  By = require('selenium-webdriver').By;

describe("Sanrio Online Store, Characters - ", function() {
  var driver = null;

  beforeAll(function() {
    driver = this.driver;
  });

  beforeEach(async function() {
    await driver.get("https://www.sanrio.com/shop");
    for(let b of (await driver
      .findElements(By.css("button[title='Close']")))) {
      await b.click();
    };
  });

  async function addToCart() {
    await driver.findElement(By.css("button[value='add_to_cart']")).click();
    let err_label = (await driver
      .findElements(By.css('label[class="value__error"]')))[0];
    if(err_label && await err_label.isDisplayed()) {
      let skuSelect = await driver
        .findElement(By.css("select[name='sku']"));
      await skuSelect.click();
      await (await skuSelect.findElements(By.css("option")))[1].click();
      await driver.findElement(By.css("button[value='add_to_cart']")).click();
    }
  }

  async function goToProductPage(productName) {
    await driver.findElement(By.linkText(productName)).click();
    return (await driver.findElements(By.css("a[itemprop='url']")))
    .map(async function(link) {
      return (await link.getAttribute('innerText')).trim();
    });
  }


  doIt('Add first product to shopping cart', async function(done) {
    var products;
    products = await Promise.all(await goToProductPage('Characters'));
    console.log(products.length + " products on page.");
    await driver.findElement(By.css("a[itemprop='url']")).click();
    await addToCart();
    await driver.wait(async function() {
      return (
        await driver.findElements(By.linkText("View Shopping Bag"))
      ).length;
    }, 10000);
    done();
  });

  doIt('Add all initial page1 items to cart :SLOW', async function(done) {
    var products, q;
    products = await Promise.all(await goToProductPage('Characters'));
    console.log(products.length + " products on page.");
    for(let product of products) {
      await driver.findElement(By.linkText(product)).click();
      await addToCart();
      await driver.wait(async function() {
        return (
          await driver.findElements(By.linkText("View Shopping Bag"))
        ).length;
      }, 10000);
      await driver.navigate().back();
      await driver.sleep(2000);
    }
    done();
  });
});
