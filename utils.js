var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    webdriver = require('selenium-webdriver');

function makeTimeoutPromise(originalFunction, maxRuntime) {
    return function() {
        var originalArguments = arguments,
            p = new Promise(function(resolve, reject) {
                var errStack = (new Error()).stack,
                    timeout = maxRuntime ? setTimeout(function() {
                                reject("Promise timed out after "
                                    +maxRuntime+"ms\n"+errStack);
                              }, maxRuntime) : undefined;
                this.resolve = function(result) {
                    clearTimeout(timeout);
                    resolve(result);
                };
                this.reject = function(result) {
                    clearTimeout(timeout);
                    reject(result+"\n"+errStack);
                };
                try {
                    originalFunction.apply(this, originalArguments);
                } catch(e) {
                    clearTimeout(timeout);
                    reject("An exception occurred: "+e.toString()+errStack);
                }
            }.bind(new Object()));
        return p;
    };
}

function sleep(milliseconds) {
    await(new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(true);
        }, milliseconds);
    }));
}

function awaitWebElements(obj) {
    var myObjs;
    if(obj instanceof webdriver.WebElement) {
        myObjs = [obj];
    } else if(obj instanceof Array && 
              obj[0] instanceof webdriver.WebElement) {
        myObjs = obj; 
    } else {
        return obj;
    }
    myObjs.forEach(function(element) {
        var methods = ["click","getText","getAttribute","findElement",
                       "findElements","getCssValue","getId","getLocation",
                       "getSize","getTagName","isDisplayed","isEnabled",
                       "sendKeys","clear","isSelected","submit",
                       "takeScreenshot"];
        element._origMethods = {};
        methods.forEach(function(method) {
            if(!element[method]) {
                return;
            }
            element._origMethods[method] = element[method];
            element[method] = function() {
               var retval = await(element._origMethods[method]
                                  .apply(this, arguments));
               //Why? Because WebElement.findElement(s)
               return awaitWebElements(retval);
            };
        });
    });
    if(obj instanceof Array) {
        return myObjs;
    } else {
        return obj;
    }
}

function awaitSeleniumDriver(d) {
    var methods = ["quit","get","findElement","findElements",
                   "getCurrentUrl","getPageSource","getSession",
                   "getTitle","sleep","takeScreenshot","wait",
                   "call","close","executeScript","getAllWindowHandles",
                   "getCapabilities","getWindowHandle",
                   "switchTo"];
    d._origMethods = {};
    methods.forEach(function(method) {
        d._origMethods[method] = d[method];
        d[method] = function() {
            var retval = await(d._origMethods[method].apply(this, arguments));
            return d._awaitWebElements ? awaitWebElements(retval) : retval;
        };
    });
}

exports.makeTimeoutPromise = makeTimeoutPromise;
exports.sleep = sleep; 
exports.awaitSeleniumDriver = awaitSeleniumDriver;
