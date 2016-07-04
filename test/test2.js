
var cps = require('../lib/cps.js');

var remoteAdd = function(a, b, cb) {
    var a2, b2;

    cps.rescue({
	'try': function(cb) {
	    cps.seq([
		function(_, cb) {
		    setTimeout(function() {
			cb(null, a*a);
		    }, 1000);
		},
		function(_, cb) {
		    throw new Error('foobar');
		    a2 = _;
		    setTimeout(function() {
			cb(null, b*b);
		    }, 1000);
		},
		function(_, cb) {
		    b2 = _;
		    cb(null, a2+b2);
		}
	    ], cb);
	},
	'catch': function(e, cb) {
	    console.log('inner catch', e);
	    throw e;
	},
	'finally': function(cb) {
	    console.log('do finally');
	    cb();
	}
    }, cb);

};

console.log('start');
remoteAdd(1, 2, function(err, res) {
    console.log('end');
    if (err) {
        console.log('top error: ', err);
	if (err.stack) {
	    // console.log(err.stack);
        }	
    } else {
        console.log('top res: ', res);
    }
});
