var fs = require('fs'),
  child_process = require('child_process'),
  async = require('asyncawait/async'),
  await = require('asyncawait/await'),
  path = require('path'),
  glob = require('glob'),
  globalSpecFiles;

function logmsg(msg) {
  var yyyymmddhhmmss = new Date().toISOString().replace(/T/,'')
    .replace(/\..+/,'').replace(/:/g,'').replace(/-/g,'');
  console.log(yyyymmddhhmmss + " - " + msg);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function worker(jconfig,specFile) {
  return new Promise(function(resolve, reject) {
    var pid = child_process.fork(__dirname + '/parallel_worker.js',
      {silent: true}),
      pidStdout = "",
      pidStderr = "";
    pid.on('message', function(data) {
      var result = {};
      console.log(specFile + ":STDOUT:\n" + pidStdout);
      console.log("\n");
      console.log(specFile + ":STDERR:\n" + pidStderr);
      console.log("\n");
      result.pidData = data;
      result.pidStdout = pidStdout;
      result.pidStderr = pidStderr;
      resolve(result);
    });
    pid.stdout && pid.stdout.on('data', function(data) {
      pidStdout += data;
    });
    pid.stdout && pid.stderr.on('data', function(data) {
      pidStderr += data;
    });
    pid.send({
      jconfig: jconfig, 
      specFile: specFile
    });
  });
}

function taskMaster(t_id,jconfig) {
  return async(function(){
    var specFile, results=[], tmName="taskMaster:"+t_id;
    logmsg(tmName + " started.");
    while(specFile = globalSpecFiles.pop()) {
      logmsg(tmName + " starting work on "+specFile);
      results.push(await(worker(jconfig,specFile)));
      logmsg(tmName + " finished " + specFile); 
    }
    logmsg(tmName + " No more files to work on, exiting...");
    return results;
  })();
}

function printReport(retval) {
  var moreInfo = retval.pidData.moreInfo;
  console.log("==== BEGIN REPORT ON SPEC FILE " + moreInfo.specFile + " ====");
  moreInfo.completedSpecs.forEach(function(spec) {
    if(spec.failedExpectations.length) {
      console.log("FAILED " + spec.fullName);
      spec.failedExpectations.forEach(function(e){
        console.log(e.message ? e.message + "\n" + e.stack : e.stack);
      });
    } else {
      console.log("No failures detected for " + moreInfo.specFile);
    }
  });
  console.log("\n\n");
  console.log("==== END REPORT ON SPEC FILE " + moreInfo.specFile + " ====");
  console.log("\n\n");
}

function getSpecFileList(jconfig) {
  var specFiles = [];
  jconfig.spec_files.forEach(function(globPattern) {
    glob.sync(jconfig.spec_dir + "/" + globPattern).forEach(function(filePath) {
      specFiles.push(path.posix.basename(filePath));
    });
  });
  return specFiles;
}

function main() {
  var exitCode = 0,
    startTime = process.hrtime(),
    taskmasters = [],
    data = fs.readFileSync(process.env['JASMINE_CONFIG_PATH'], 'utf-8'),
    jconfig = JSON.parse(data),
    childprocCount = parseInt(jconfig.child_processes);

  globalSpecFiles = getSpecFileList(jconfig);

  if(!isNumeric(childprocCount) || childprocCount < 1) {
    throw new Error("'child_processes' value in jasmine.json not valid.");
  }

  logmsg("BEGIN: Starting " + childprocCount + " child processes to work on " +
    globalSpecFiles.length + " spec files.");
  logmsg("Queued spec files: " + globalSpecFiles);

  for(x = 0; x < childprocCount; x++) {
    taskmasters.push(taskMaster(x,jconfig));
  }

  await(Promise.all(taskmasters)).forEach(function(retvals) {
    retvals.forEach(function(retval) {
      if(retval.pidData.moreInfo.failureDetected) {
        exitCode += 1;
      }
      printReport(retval);
    });
  });
  logmsg("TESTING ENDED: total runtime " + process.hrtime(startTime)[0] +
    "s with exitcode=" + exitCode); 
  return exitCode;
}

async(main)().then(process.exit).catch(function(err) {
  console.log("ERROR IN MAIN!\n " + err.stack);
  process.exit(99);
});
