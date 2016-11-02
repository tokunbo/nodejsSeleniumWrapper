var reporter = {
  jasmineStarted: function(metaData) {
    this.moreInfo = {};
    this.moreInfo.completedSuites = [];
    this.moreInfo.completedSpecs = [];
    this.moreInfo.metaData = metaData;
  },
  specDone: function(specInfo) {
    this.moreInfo.completedSpecs.push(specInfo);
  },
  suiteDone: function(suiteInfo) {
    this.moreInfo.completedSuites.push(suiteInfo);
  }},
  globalSpecFile;


process.on('unhandledRejection', function(err, p) {
/*BUG: https://github.com/jasmine/jasmine/issues/1213.

  There's a 99.9% chance this is just noise you don't need to see.
  When a spec fails, jasmine throws the error all the way "up the stack" and
  it shows up here. But, it will also be reported in the normal way by jasmine's
  spec runner. That's what you should look at. But if something really odd
  is going on that you can't figure out, uncomment the code below:
 
  var errmsg = "unhandledRejection from child pid working on " + globalSpecFile;
  console.error(errmsg + "\n  " + err.stack + p); */
});

process.on('message', function(data) {
  var jasmine = new(require('jasmine')),
    JasmineReporters = require('jasmine-reporters'),
    jconfig = data.jconfig,
    junitReporter = new JasmineReporters
      .JUnitXmlReporter(__dirname + '/testresults', true, true, 'test-'),
    specFile = data.specFile;

  globalSpecFile = specFile;
  jconfig.spec_files = [specFile];
  jasmine.loadConfig(jconfig);
  reporter.j = jasmine;
  reporter.jasmineDone = function(passed) {
    var everythingPassed = true;
    this.moreInfo.completedSpecs.forEach(function(specResult) {
      if(specResult.status == 'failed') {
        everythingPassed = false;
      }
    });
    this.moreInfo.fileName = specFile;
    this.moreInfo.everythingPassed = everythingPassed;
    process.send({ j: this.j, moreInfo: this.moreInfo, passed: passed });
    process.exit(everythingPassed ? 0 : 1);
  };
  jasmine.jasmine.exit = function(){};//Prevent jasmine from auto-exit.
  jasmine.addReporter(reporter);
  jasmine.addReporter(junitReporter);
  jasmine.execute();
});

