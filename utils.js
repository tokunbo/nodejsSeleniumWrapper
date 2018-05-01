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

async function sleep(milliseconds) {
  await new Promise(function(resolve, reject) {
    setTimeout(function() {
        resolve(true);
    }, milliseconds);
  });
}

exports.makeTimeoutPromise = makeTimeoutPromise;
exports.sleep = sleep;
