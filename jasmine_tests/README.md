# JASMINE PARALLEL Runner and other craziness.

If you really want to see me abuse async/await and jasmine's reporter feature...



cd into this dir and 

```
npm install
```

...then go get the newest chromedriver binary and put it in this dir, then...

```
node ./parallel_runtest.js 
```

And I leave it an exercise for the reader to understand what I did here ^_^;
While protractor is nice with the By.bindings, By.model stuff for AngularJS pages... the unignorable feature imho is the sharding(parallel) feature. With the files <code>parallel_runtests.js</code> and <code>parallel_worker.js</code>, you can run your tests in parallel using only pure jasmine. Take a look and see if you can make use of it!
