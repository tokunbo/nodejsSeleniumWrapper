

# nodejsSeleniumWrapper (and other stuff)

This is just a wild experiment. I'm tired of .then() everywhere and I'm not the world's biggest fan of nodejs in general, but reading some article somewhere I came to learn of async & await:
* https://github.com/yortus/asyncawait
* npm install asyncawait

It seemed too good to be true so I went to try some things and sure enough, this thing really works and removes the madness
of .then(func(){}) chains all over the place. Between that and confusing errors when a promise chain didn't resolve properly, I use to go crazy trying to write selenium tests. When automating a browser I pretty much always want my steps to be synchronous so I decided to see how far I could (ab)use this asyncawait module. Turns out you can really get rid of a lot of the nodejs madness using asyncawait in interesting way. Look at```example.js```to see a selenium test```(function main())```with no .then()'s in it. Then look at```utils.js```to see how I altered a bunch of webdriver methods to stop returning promises and instead make await() fully resolve them before returning to testcode. 

* Other stuff

> Besides the functions```awaitSeleniumDriver & awaitWebElements```....
> 
>- You'll see inside```utils.js```that I also have a ```sleep(milliseconds)``` that you can use.
>
>- You'll see the ```makeTimeoutPromise(fnptr,millisecons)``` method. Any function wrapped by this method, will have access to a ```this.resolve()``` and ```this.reject()```. One of them must happen before ```milliseconds``` after the function is called or you'll get a timeout. If you give ```null``` as the maxRunTime then the promise can run foever. 
>

This may not be too special to hardcore nodejs people out there, but for me async&await takes nodejs from unviable to actually usable. Though I still just pick a synchronous language like ruby/python/etc, if nodejs is a __requirement__ for a project I'm working on, I'd have to be allowed to use asyncawait or I'd just go crazy.
