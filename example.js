var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    request = require('request'),
    fs = require('fs'),
    webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    driver,
    utils = require('./utils.js');

function getProfileLinks() {
    var profileLinks = {};
    driver.findElements(By.css('dl.threadlastpost.td')).forEach(function(td){
        var profileLink;
        profileLink = td.findElement(By.tagName("a")).getAttribute('href');
        profileLinks[profileLink] = null;
    });
    return Object.keys(profileLinks);
}

function saveAvatarToFile(fileName,url) {
    var bytes;
    driver.get(url);
    bytes = new Buffer(driver.takeScreenshot(), 'base64');
    fs.writeFile(fileName+".png", bytes, 'utf8', function(err) {
        if(err) {
            this.reject("Couldn't write "+fileName+": "+err.toString());
        } else {
            this.resolve(true);
        }
    }.bind(this));
}
saveAvatarToFile = utils.makeTimeoutPromise(saveAvatarToFile,3000);

function main() {
    var linkText = [], profileLinks = {};
    driver = new webdriver.Builder('./chromedriver')
                 .withCapabilities({'browserName':'chrome'})
                 .build();
    driver.manage().timeouts().implicitlyWait(1000);
    utils.awaitSeleniumDriver(driver);
    driver._awaitWebElements = true;
    driver.get("http://www.sanriotown.com");
    utils.sleep(3000);
    driver.switchTo().frame("iframe_header");
    console.log("1_________________________________");
    driver.findElement(By.id("navbar")).findElements(By.tagName("a"))
        .forEach(function(link){
            console.log("  "+link.getAttribute("innerHTML"));
        });
    driver.findElement(By.id("forum")).click();
    driver.sleep(3000);
    console.log("2_________________________________");
    driver.findElements(By.css("h2.forumtitle")).forEach(function(ft){
        linkText.push(ft.findElement(By.tagName("a")).getText());
    });
    linkText.forEach(function(ltxt){
        console.log("Click "+ltxt);
        driver.findElement(By.linkText(ltxt)).click();
        getProfileLinks().forEach(function(plink){
            profileLinks[plink] = null;
        });
        await(driver.navigate().back());
    });
    console.log("3_________________________________");
    Object.keys(profileLinks).forEach(function(url) {
        var member_username,img_urls;
        driver.get(url);
        member_username = driver.findElement(By.className("member_username"))
                                .getText();
        img_urls = driver.findElements(By.id("user_avatar"));
        if(!img_urls.length) {
            return;
        }
        console.log("  "+url);
        await(saveAvatarToFile(member_username, 
                               img_urls[0].getAttribute('src')));
    });
    driver.quit();
}

async(main)().catch(async(function(e) {
    console.error(e.toString());
    console.error(e.stack);
    driver.quit();
}));
