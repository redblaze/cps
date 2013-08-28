# cps

A CPS library to help the coding of the asynced programs in Javascript/Node.js

## Supported APIs

* [seq](#seq) Sequence a list of procedures.
* [pwhile](#pwhile) Repeat a procedure until some condition is met.
* [peach](#peach) Apply a procedure on an array sequentially.
* [pmap](#pmap) Apply a procedure on an array sequentially, and record the results in another array, which is pass to the callback.
* [compose](#compose) Compose two procedures, passing the result of the first one as the parameters of the second one.
* [rescue](#rescue) An asyned version of try/catch.  It take two procedures as arguments.  If the first one fails, the second is executed to rescue.
* [parallel](#parallel) Parallel a list of procedures.  Parallel fails if any of the parellel track fails.  If you do not want this behavior, use [rescue](#rescue) to prevent a procedure from failing.
