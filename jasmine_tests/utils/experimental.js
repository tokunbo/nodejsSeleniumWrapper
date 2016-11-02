'use strict';

var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    webdriver = require('selenium-webdriver');

function jasmineMoreInfo(jasmine) {
  var jEnv = jasmine.getEnv ? jasmine.getEnv() : jasmine.env;
  jEnv.addReporter({
    jasmineStarted: function(metaData) {
      jasmine.moreInfo = {};
      jasmine.moreInfo.metaData = metaData;
    },
    suiteStarted: function(suiteInfo) {
      jasmine.moreInfo.currentSuite = suiteInfo; 
    },
    specStarted: function(specInfo) {
      jasmine.moreInfo.currentSpec = specInfo;
    },
    specDone: function(specInfo) {
      jasmine.moreInfo.completedSpecs = jasmine.moreInfo.completedSpecs || [];
      jasmine.moreInfo.completedSpecs.push(specInfo);
      jasmine.moreInfo.currentSpec = null;
    },
    suiteDone: function(suiteInfo) {
      jasmine.moreInfo.CompletedSuites = jasmine.moreInfo.CompletedSuites || [];
      jasmine.moreInfo.CompletedSuites.push(suiteInfo);
      jasmine.moreInfo.currentSuite = null;
    }
  });
}

function asyncIt(fn) {
  return function(done) {
    async(fn.bind(this))(done).then(done)
      .catch(function(err) {
        /* It doesn't like this should work, but in jasmine 2.5.2...
        
         - If you call only done.fail(), the spec will wait for 
           jasmine.DEFAULT_TIMEOUT_INTERVAL to elapse
           before moving forward.
         - If you call only done(), the spec will be marked
           as passed even though it failed
         - If you call done.fail() before calling done(), the spec
           will wait for jasmine.DEFAULT_TIMEOUT_INTERVAL.

           Thus this seems to be the only way to catch any errors in
           the spec, fail it and immediately move on.
        */
        done();
        done.fail(err.stack);
      });
  };
}

function catchIt(fn) {
  return function(done) {
    try {
      fn.bind(this)(done);
      done();
    } catch (e) {
      done();
      done.fail(e.stack);
    }
  };
};

function jasmineItExtend(jasmine) {
  var  jEnv = jasmine.getEnv ? jasmine.getEnv() : jasmine.env,
    origIt = jEnv.it; 
  jEnv.it = function(specdesc, originalfn) {
    origIt(specdesc, function(done){
      if (jasmine.skip) {
        jasmine.skip = false;
        return done();
      }
      originalfn.bind(this)(done);
    });
  };
};

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
      }.bind(new Object({'originalThis': this})));
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
                   "findElements","getCssValue","getLocation",
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
        return awaitWebElements(retval);//Because WebElement.findElement(s)
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
    if(d._origMethods && d._origMethods[method]) {
      throw new Error("Don't try to awaitWrap driver twice.");
    }
    d._origMethods[method] = d[method];
    d[method] = function() {
      var retval = await(d._origMethods[method].apply(this, arguments));
      return d._awaitWebElements ? awaitWebElements(retval) : retval;
    };
  });
  d.setAwaitElements = function(shouldDoIt) {
    d._awaitWebElements = shouldDoIt;
  };
}

module.exports = {
  makeTimeoutPromise: makeTimeoutPromise,
  sleep: sleep,
  jasmineMoreInfo: jasmineMoreInfo,
  awaitWebElements: awaitWebElements,
  awaitSeleniumDriver: awaitSeleniumDriver,
  asyncIt: asyncIt,
  catchIt: catchIt,
  jasmineItExtend: jasmineItExtend
};

