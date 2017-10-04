var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://mczdekhm.preview.infomaniak.website');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

module.exports = allowCrossDomain;
