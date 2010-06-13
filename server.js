PORT = 8000;
HOST = '127.0.0.1';

var sys = require('sys'),
fs = require('fs'),
url = require('url'),
http = require('http'),
util = require('./util');

http.createServer(function(req, res) {
  var handler = util.getMap[url.parse(req.url).pathname] || util.not_found;
  var proxy = http.createClient(80, req.headers['host'])
  var proxy_request = proxy.request(req.method, req.url, req.headers);
  
  res.simpleJSON = function(code, obj) {
    var body = JSON.stringify(obj);
    res.writeHead(code, {
      'Content-Type': 'text/json',
      'Content-Length': body.length
    });
    res.write(body);
    res.close();
  };
  
  proxy_request.addListener('response', function (proxy_response) {
        proxy_response.addListener('data', function(chunk) {
          res.write(chunk);
        });
        proxy_response.addListener('end', function() {
          res.end();
        });
        res.writeHead(proxy_response.statusCode, proxy_response.headers);
      });
      req.addListener('data', function(chunk) {
        proxy_request.write(chunk);
      });
      req.addListener('end', function() {
        proxy_request.end();
      });
  handler(req, res);
}).listen(PORT, HOST);

sys.puts("Server at http://" + HOST + ':' + PORT.toString() + '/');

