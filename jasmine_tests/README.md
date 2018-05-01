# JASMINE PARALLEL Runner and other craziness.

If you really want to see me abuse async/await and jasmine's reporter feature...



cd into this dir and 

```
npm install
```

...then go get the newest chromedriver binary and put it in this dir, then...

```
JASMINE_CONFIG_PATH=jasmine.json node ./parallel_runtest.js 
```

And I leave it an exercise for the reader to understand what I did here ^_^;
While protractor is nice with the By.bindings, By.model stuff for AngularJS pages... the unignorable feature imho is the sharding(parallel) feature. With the files <code>parallel_runtests.js</code> and <code>parallel_worker.js</code>, you can run your tests in parallel using only pure jasmine. Take a look and see if you can make use of it!

NOTE: If you have some kind of error about binding.gyp or node-gyp or fibers binary missing, then do this stuff: 
```
npm install
npm update
npm install node-gyp
cd ./node_modules/fibers
../../node_modules/node-gyp/bin/node-gyp.js configure
cd ../..
```

