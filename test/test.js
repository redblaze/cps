
var cps = require('../lib/cps.js');

var handleError = function(e) {
    if (e.stack) {
        console.log(e.stack);
    } else {
        console.log(e);
    }
};

var start = new Date();
var cb = function(err, res) {
    try {
        var end = new Date();
        console.log('time spent: ', end-start);
        if (err) {
            handleError(err);
        } else {
            console.log(res);
        }
    } catch(e) {
        handleError(e);
    }
};

var alienAdd = function(a, b, cb) {
    setTimeout(function() {
        cb(null, a + b);
    }, 0);
};

var asyncFib = function(n, cb) {
    if (n < 0) {
        throw new Error('fib input error');
        // return cb(new Error('fib input error'));
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

/*
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
 */

cps.seq([
    function(_, cb) {
        cps.pmap(
            [-1,1,2,3,4,5,6,7,8,9,10],
            function(el, cb) {
                cps.rescue(
                    function(cb) {
                        asyncFib(el, cb);
                    },
                    function(err, cb) {
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