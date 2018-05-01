'use strict';

var fs = require('fs'),
  jconfig,
  child_process = require('child_process'),
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

function worker(jconfig, specFile) {
  var pid = child_process.fork(__dirname + '/parallel_worker.js',
    {silent: jconfig.child_silence}),
    pidStdout = "", pidStderr = "", waitpidPromise;

  waitpidPromise = new Promise(function(resolve, reject) {
    pid.on('message', function(data) {
      var result = {};
      result.pidData = data;
      result.pidStdout = pidStdout;
      result.pidStderr = pidStderr;
      resolve(result);
    });
  });

  pid.stdout && pid.stdout.on('data', function(data) {
    pidStdout += data;
  });

  pid.stdout && pid.stderr.on('data', function(data) {
    pidStderr += data;
  });

  pid.send({jconfig: jconfig, specFile: specFile});
  return waitpidPromise;
}

async function taskManager(t_id, jconfig) {
  var specFile, results=[], tmName="taskManager:"+t_id;
  logmsg(tmName + " started.");
  while(specFile = globalSpecFiles.pop()) {
    logmsg(tmName + " starting work on "+specFile);
    results.push(await worker(jconfig, specFile));
    logmsg(tmName + " finished " + specFile);
  }
  logmsg(tmName + " No more files to work on, exiting...");
  return results;
}

function printReport(retval) {
  var moreInfo = retval.pidData.moreInfo, failDetected = false;
  console.log("==== BEGIN REPORT ON SPEC FILE " + moreInfo.specFile + " ====");
  for(let spec of moreInfo.completedSpecs) {
    moreInfo.completedSpecs.forEach(function(spec) {
      if(spec.failedExpectations.length) {
        failDetected = true;
      }
    });
  }
  console.log(" ---" + moreInfo.specFile + ":STDOUT:\n" + retval.pidStdout);
  console.log(" ---END STDOUT\n");
  console.log(" ---" + moreInfo.specFile + ":STDERR:\n" + retval.pidStderr);
  console.log(" ---END STDERR\n");
  if(!failDetected) {
    console.log("No failures detected for " + moreInfo.specFile);
  }
  console.log("\n");
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

async function main() {
  var exitCode = 0,
    q,
    startTime = process.hrtime(),
    taskmanagers = [],
    childprocCount;

  jconfig = JSON.parse(
    fs.readFileSync(process.env['JASMINE_CONFIG_PATH'], 'utf-8')
  );
  childprocCount = parseInt(jconfig.child_processes)
  globalSpecFiles = getSpecFileList(jconfig);

  if(!isNumeric(childprocCount) || childprocCount < 1) {
    throw new Error("'child_processes' value in jasmine.json not valid.");
  }

  logmsg("BEGIN: Starting " + childprocCount + " child processes to work on " +
    globalSpecFiles.length + " spec files.");
  logmsg("Queued spec files: " + globalSpecFiles);

  for(q = 0; q < childprocCount; q++) {
    taskmanagers.push(taskManager(q, jconfig));
  }

  logmsg("Waiting on taskmanagers...");
  await Promise.all(taskmanagers);
  logmsg("All taskmanagers have exited.");
  (await Promise.all(taskmanagers)).forEach(function(retvals) {
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

main()
.then(function(exitCode) {
  console.log("2sec exit delay to allow all stdout to print ¯\\_(ツ)_/¯");
  setTimeout(function() {
    process.exit(exitCode);
  },2000);
})
.catch(function(err) {
  console.log("ERROR IN MAIN!\n " + err.stack);
  process.exit(99);
});
