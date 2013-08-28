
module.exports = function() {
    var procedure = function(fn) {
        return function() {
            var cb = arguments[arguments.length - 1];

            try {
                fn.apply(this, arguments);
            } catch(e) {
                handleError(e, cb);
            }
        };
    };

    var handleError = function(e, cb) {
        cb(e);
    };

    var callback = function(cb, fn) {
        return function(err) {
            try {
                if (err) {
                    cb(err);
                } else {
                    fn.apply(this, arguments);
                }
            } catch(e) {
                handleError(e, cb);
            }
        };
    };

    var _seq = procedure(function(procs, i, res, cb) {
        try {
            if (i >= procs.length) {
                return cb(null, res);
            }
            var proc = procs[i];
            proc(res, callback(cb, function(err, res) {
                return _seq(procs, i+1, res, cb);
            }));
        } catch (e) {
            return cb(e);
        }
    });

    var seq = function(procs, cb) {
        return _seq(procs, 0, null, cb);
    };

    var compose = procedure(function(proc1, proc2, cb) {
        proc1(callback(cb, function(err, res) {
            proc2(res, cb);
        }));
    });

    var rescue = procedure(function(proc1, proc2, cb) {
        try {
            proc1(function(err, res) {
                if (err) {
                    proc2(err, cb);
                } else {
                    cb(null, res);
                }
            });
        } catch(err) {
            proc2(err, cb);
        }
    });

    var pwhile = procedure(function(procBool, procBody, cb){
        procBool(callback(cb, function(err, res) {
            if (!res) {
                cb();
            } else {
                procBody(callback(cb, function(err, res) {
                    pwhile(procBool, procBody, cb);
                }));
            }
        }));
    });

    var peach = procedure(function(arr, proc, cb) {
        var i = 0;

        pwhile(
            procedure(function(cb) {
                cb(null, i < arr.length);
            }),
            procedure(function(cb) {
                proc(arr[i], callback(cb, function(err, res) {
                    i = i + 1;
                    cb();
                }))
            }),
            cb
        )
    });

    var pmap = procedure(function(arr, proc, cb) {
        var l = [];

        peach(arr, procedure(function(e, cb) {
            proc(e, callback(cb, function(err, res) {
                l.push(res);
                cb();
            }));
        }), callback(cb, function(err, res) {
            cb(null, l);
        }));
    });

    var _parallel2 = procedure(function(proc1, proc2, cb) {
        var state1 = 'start';
        var state2 = 'start';
        var res1;
        var res2;

        proc1(function(err, res) {
            if (err) {
                state1 = 'error';
                cb(err);
            } else {
                switch(state2) {
                    case 'start':
                        state1 = 'done';
                        res1 = res;
                        break;
                    case 'done':
                        cb(null, [res1, res2]);
                        break;
                    case 'error':
                        state1 = 'done';
                        res1 = res;
                        break;
                    default:
                }
            }
        });

        proc2(function(err, res) {
            if (err) {
                state2 = 'error';
                cb(err);
            } else {
                switch(state1) {
                    case 'start':
                        state2 = 'done';
                        res2 = res;
                        break;
                    case 'done':
                        cb(null, [res1, res2]);
                        break;
                    case 'error':
                        state2 = 'done';
                        res2 = res;
                        break;
                    default:
                }
            }
        });
    });

    var _parallel = procedure(function(procs, i, cb) {
        if (procs.length == 0) {
            return cb();
        }

        if (i == procs.length - 1) {
            return procs[i](callback(cb, function(err, res) {
                cb(null, [res]);
            }));
        }

        if (i < procs.length) {
            _parallel2(
                procs[i],
                function(cb) {
                    _parallel(procs, i+1, cb);
                },
                callback(cb, function(err, res) {
                    cb(null, [res[0]].concat(res[1]));
                })
            );
        }
    });

    var parallel = procedure(function(procs, cb) {
        _parallel(procs, 0, cb);
    });

    return {
        seq: seq,
        peach: peach,
        pwhile: pwhile,
        pmap: pmap,
        compose: compose,
        rescue: rescue,
        parallel: parallel
    };
}();
