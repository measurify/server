const NodeCache = require( "node-cache" );
let cache = null;

exports.init = function() { cache = new NodeCache( { stdTTL: process.env.CACHE_TIME, useClones: false } ); }

exports.set = function(key, val) { return cache.set( key, val) }

exports.flush = function() { return cache.flushAll() }

exports.stats = function() { return cache.getStats() }

exports.get = function(key) { 
    const value = cache.get(key);
    if ( value == undefined ) return null; 
    return value;
}


