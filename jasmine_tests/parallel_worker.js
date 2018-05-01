var dataCollectingReporter = {
  init: function(opts) {
    this.moreInfo = {};
    Object.keys(opts).forEach(function(key) {
      this.moreInfo[key] = opts[key];
    }.bind(this));
  },
  jasmineStarted: function(metaData) {
    this.moreInfo.completedSuites = [];
    this.moreInfo.completedSpecs = [];
    this.moreInfo.metaData = metaData;
  },
  specStarted: function(specInfo) {
    this.moreInfo.currentSpec = specInfo;
  },
  specDone: function(specInfo) {
    this.moreInfo.completedSpecs.push(specInfo);
  },
  suiteDone: function(suiteInfo) {
    this.moreInfo.completedSuites.push(suiteInfo);
  },
  jasmineDone: function(jdObj) {
    var failureDetected = false;
    this.moreInfo.completedSpecs.forEach(function(specResult) {
      if(specResult.status == 'failed') {
        failureDetected = true;
      }
    });
    this.moreInfo.failureDetected = failureDetected;
    this.moreInfo.jdObj = jdObj;//I have no idea what this is
    process.send(this);
  }
};

process.on('unhandledRejection', function(err, p) {
/*BUG: https://github.com/jasmine/jasmine/issues/1213. */
  var errmsg = "unhandledRejection from child pid ";
  errmsg += "\n" + err.stack + p + dataCollectingReporter;
  console.log(errmsg);
});

process.on('uncaughtException', function(err) {
  var errmsg = "uncaughtException from child pid: \n" + err + err.stack;
  console.log(errmsg);
});

process.on('message', function(data) {
  var jasmine = new (require('jasmine')),
    jconfig = data.jconfig,
    specFile = data.specFile;
  /*This JUnit reporter must be added before anything else happens
    to this jasmine instance, otherwise junit .xml will NOT be created.*/
  jconfig.junitReporterOpts.savePath = __dirname + '/' +
    jconfig.junitReporterOpts.savePath;
  jasmine.addReporter(new (require('jasmine-reporters')).JUnitXmlReporter(
    jconfig.junitReporterOpts));
  dataCollectingReporter.init({j: jasmine, specFile: specFile});
  jconfig.spec_files = [specFile];
  jasmine.addReporter(dataCollectingReporter);
  jasmine.loadConfig(jconfig);
  jasmine.execute();
});
