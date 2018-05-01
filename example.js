var request = require('request'),
    fs = require('fs'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    driver,
    utils = require('./utils.js');

async function getProfileLinks() {
  return (await driver.findElements(By.css('dl.threadlastpost.td')))
  .map(async function(td) {
    return await td.findElement(By.tagName("a")).getAttribute('href');
  });
}

async function main() {
    var linkTexts = [], profileLinks = {},
      member_username, img_urls;
    driver = new webdriver.Builder('./chromedriver')
                 .withCapabilities({'browserName':'chrome'})
                 .build();
    driver.manage().timeouts().implicitlyWait(1000);
    await driver.get("http://www.sanriotown.com");
    console.log("wait 3 seconds, just because...")
    await utils.sleep(3000);
    await driver.switchTo().frame("iframe_header");
    console.log("1_________________________________");
    (await driver.findElement(By.id("navbar")).findElements(By.tagName("a")))
      .forEach(async function(link){
          console.log("L_1 "+link);
          console.log(">>>>"+(await link.getAttribute("innerHTML")));
      });
    for(navbar_link of (await driver.findElement(By.id("navbar"))
      .findElements(By.tagName("a")))) {
        console.log("L_2 "+navbar_link);
        console.log(">>>>"+(await navbar_link.getAttribute("innerHTML")));
    }
    await driver.findElement(By.id("forum")).click();
    console.log("wait 3 seconds again, just because...")
    await driver.sleep(3000);
    console.log("2_________________________________");
    (await driver.findElements(By.css("h2.forumtitle")))
      .forEach(function(ft){
        linkTexts.push(ft.findElement(By.tagName("a")).getText());
      });
    linkTexts = await Promise.all(linkTexts);
    for(ltxt of linkTexts) {
      console.log("Click "+ltxt);
      await driver.findElement(By.linkText(ltxt)).click();
      console.log(await Promise.all(await getProfileLinks()));
      (await Promise.all(await getProfileLinks()))
      .forEach(function(plink){
        profileLinks[plink] = null;
      });
      await driver.navigate().back();
    }
    console.log("3_________________________________");
    console.log(Object.keys(profileLinks).length + " links found");
    for(url of Object.keys(profileLinks)) {
        await driver.get(url);
        member_username = await driver
                                .findElement(By.className("member_username"))
                                .getText();
        console.log(member_username);
        img_urls = await driver.findElements(By.id("user_avatar"));
        if(!img_urls.length) {
           console.log("Skipping "+member_username+". No avatar found.");
           continue;
        }
        console.log("img URL  "+url);
        await driver.get(url);
        fs.writeFileSync(member_username+'.png',
                         new Buffer(await driver.takeScreenshot(), 'base64'),
                         'utf8');
    };
}

main()
.then(function() {
  console.log('Looks like we are done!');
  driver.quit();
})
.catch(function(e) {
  console.log("MAIN BEGIN ESTACK");
  console.error(e.stack);
  console.log("MAIN END ESTACK");
  driver.quit();
});
