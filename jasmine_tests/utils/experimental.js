'use strict';

function jasmineMoreInfo(jasmine) {
  var jEnv = jasmine.getEnv ? jasmine.getEnv() : jasmine.env;
  jEnv.addReporter({
    jasmineStarted: function(metaData) {
      jasmine.moreInfo = {};
      jasmine.moreInfo.metaData = metaData;
    },
    suiteStarted: function(suiteInfo) {
      console.log("Suite started: "+suiteInfo.description);
      jasmine.moreInfo.currentSuite = suiteInfo;
    },
    specStarted: function(specInfo) {
      console.log("Spec started: "+specInfo.description);
      jasmine.moreInfo.currentSpec = specInfo;
    },
    specDone: function(specInfo) {
      console.log("Spec done: "+specInfo.description);
      jasmine.moreInfo.completedSpecs = jasmine.moreInfo.completedSpecs || [];
      jasmine.moreInfo.completedSpecs.push(specInfo);
      jasmine.moreInfo.currentSpec = null;
    },
    suiteDone: function(suiteInfo) {
      console.log("Suite done: "+suiteInfo.description);
      jasmine.moreInfo.CompletedSuites = jasmine.moreInfo.CompletedSuites || [];
      jasmine.moreInfo.CompletedSuites.push(suiteInfo);
      jasmine.moreInfo.currentSuite = null;
    }
  });
}

function doIt(specDescription, testcaseFn) {
 it(specDescription, async function(done) {
   try {
     jasmine.testcaseFailed = false;
     await testcaseFn.bind(this)(done);
     done();
   } catch(e) {
     jasmine.testcaseFailed = true;
     done();
     done.fail(e);
     /* It doesn't like this should work, but...
       - If you call only done.fail(), the spec will wait for
         jasmine.DEFAULT_TIMEOUT_INTERVAL to elapse
         before moving forward.
       - If you call only done(), the spec will be marked
         as passed even though it failed
       - If you call done.fail() before calling done(), the spec
         will wait for jasmine.DEFAULT_TIMEOUT_INTERVAL.
         Thus this seems to be the only way to catch any errors in
         the spec, fail it and immediately move on. */
   }
 });
}

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

module.exports = {
  makeTimeoutPromise: makeTimeoutPromise,
  sleep: sleep,
  jasmineMoreInfo: jasmineMoreInfo,
  doIt: doIt
};
