

# nodejsSeleniumWrapper (and other stuff)

This branch is pretty much the same as master, except everything has been changed to use nodejs's built-in async/await.

Unfortunately, the built-in nodejs await only works if the immediate containing function is defined as async. The 3rdparty await worked
as long as some ancestor in the function call stack was an async function. Thus I cannot do the cool trick like in the master-branch where
I wrapped all the Selenium methods in blocking-asyncawait functions that freed me from having to type await all over the test code.


To make it clearer, consider the following code:

```
var async = require('asyncawait/async'),
    await = require('asyncawait/await');

function sleep1(milliseconds) {
  await(new Promise(function(resolve, reject) {
    setTimeout(function() { resolve(true); }, milliseconds);
  }));
} 

async function sleep2(milliseconds) {
  await new Promise(function(resolve, reject) {   
    setTimeout(function() {
        resolve(true);
    }, milliseconds);
  });
}

function sleep3(milliseconds) {
  (async function() {
    await new Promise(function(resolve, reject) { 
      setTimeout(function() {
          resolve(true);
      }, milliseconds);
    });
  })();
}

test1 = async(function() {
  console.log(1);
  sleep1(1000);
  console.log(2);
  sleep1(1000);
});

async function test2() {
  console.log(3);
  sleep2(1000);
  console.log(4);
  sleep2(1000);
}

function test3() {
  console.log(5);
  sleep3(1000);
  console.log(6);
  sleep3(1000);
}

test1();
test2();
test3();
```

The result that this prints out is:

```
1
3
4
5
6
2
```

Looking at this for awhile will show the issue.
`NOTE: async(function(){}) is the 3rdparty, async function(){} is the built-in`

