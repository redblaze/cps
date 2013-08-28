
# cps

A CPS library to help the coding of the asynced programs in Javascript/Node.js

## Terminologies

### Callback

We call a function of the following form a callback:

```javascript
function(err, res) {
  // process the err and res
}
```

A callback is a function that takes two arguments, "err" and "res".  Semantically, a non-null "err" corresponds to a program exception; while a null "err" corresponds to normal return without any exceptions.

### Procedure

We call a function of the following form a procedure:

```javascript
function(arg1, arg2, ..., callback) {
  // do some work with the arguments and then invoke the callback to continue
}
```
A procedure is a function that takes a callback as the last argument.  Semantically, a procedure does some work with the input arguments and at some point, call the callback to continue.  Note that a call to the "callback" argument MUST always be a tail call.  In particular, the following is a procedure:

```javascript
function(callback) {
  // do some work and then invoke the callback to continue
}
```


## Supported APIs

* [seq](#seq) Sequence a list of procedures.
* [pwhile](#pwhile) Repeat a procedure until some condition is met.
* [peach](#peach) Apply a procedure on an array sequentially.
* [pmap](#pmap) Apply a procedure on an array sequentially, and record the results in another array, which is pass to the callback.
* [rescue](#rescue) An asyned version of try/catch.  It take two procedures as arguments.  If the first one fails, the second is executed to rescue.
* [parallel](#parallel) Parallel a list of procedures.  Parallel fails if any of the parellel track fails.  If you do not want this behavior, use [rescue](#rescue) to prevent a procedure from failing.

<a name="seq"/>
### seq(array_of_procedures, callback)

__Example__

```javascript
var concatFile = function(f1, f2, resFile, cb) {
    var contentOfA, contentOfB;
    
    cps.seq([
        function(_, cb) {
            fs.readFile(f1, cb);
        },
        function(res, cb) {
            contentOfA = res;
            fs.readFile(f2, cb);
        },
        function(res, cb) {
            contentOfB = res;
            fs.writeFile(resFile, contentA + contentB, cb);
        }
    ], cb);
};
```

<a name="pwhile">
### pwhile(bool_procedure, repeat_body_procedure, cb)

__Example__

Consider a world in which arithmatic operations do not exists and must be accomplished through alien technology.  Then the Fibonacci function needs to be written in the following way:

```javascript
var alienAdd = function(a, b, cb) {
    setTimeout(function() {
        cb(null, a + b);
    }, 0);
};

var asyncFib = function(n, cb) {
    if (n < 0) {
        throw new Error('fib input error');
    }
    if (n == 0) {return cb(null, 1);}
    if (n == 1) {return cb(null, 1);}

    var a = 1, 
    b = 1, 
    i = 2;
    cps.seq([
        function(_, cb) {
            cps.pwhile(
                function(cb) {
                    cb(null, i <= n);
                },
                function(cb) {
                    cps.seq([
                        function(_, cb) {
                            alienAdd(a, b, cb);
                        },
                        function(res, cb) {
                            a = b;
                            b = res;
                            alienAdd(i, 1, cb);
                        },
                        function(res, cb) {
                            i = res;
                            cb();
                        }
                    ], cb);
                },
                cb
            );
        },
        function(_, cb) {
            cb(null, b);
        }
    ], cb);
};
```

<a name="peach"/>
### peach(arr, procedure_for_each_element, callback)

__Example__

Then in the same "arithmetic-less" world, print out the first 10 Fibonacci numbers.

```javascript
cps.peach(
    [1,2,3,4,5,6,7,8,9,10],
    function(el, cb) {
        cps.seq([
            function(_, cb) {
                asyncFib(el, cb);
            },
            function(res, cb) {
                console.log(res);
                cb();
            }
        ], cb);

    },
    cb
);
```

<a name="pmap" />
### pmap(arr, procedure_for_each_element, callback)

__Example__

You can also map it out first and then log the result list.

```javascript
cps.seq([
    function(_, cb) {
        cps.pmap(
            [1,2,3,4,5,6,7,8,9,10],
            function(el, cb) {
                asyncFib(el, cb);
            },
            cb
        );
    },
    function(res, cb) {
        console.log(res);
        cb();
    }
], cb);
```

<a name="rescue"/>
### rescue(try_clause_procedure, catch_clause_procedure, callback)

__Example__

What if there's some invalid input?  Let's catch it without disturbing the overall flow.

```javascript
cps.seq([
    function(_, cb) {
        cps.pmap(
            [1,2,3,4,5,6,7,8,9,10, -1],
            function(el, cb) {
                cps.rescue(
                    function(cb) { // try clause
                        asyncFib(el, cb);
                    },
                    function(err, cb) { // catch clause
                        console.log(err);
                        cb(null, -1);
                    },
                    cb
                );
            },
            cb
        );
    },
    function(res, cb) {
        console.log(res);
        cb();
    }
], cb);
```
