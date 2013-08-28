
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
* [compose](#compose) Compose two procedures, passing the result of the first one as the parameters of the second one.
* [rescue](#rescue) An asyned version of try/catch.  It take two procedures as arguments.  If the first one fails, the second is executed to rescue.
* [parallel](#parallel) Parallel a list of procedures.  Parallel fails if any of the parellel track fails.  If you do not want this behavior, use [rescue](#rescue) to prevent a procedure from failing.

