    var express = require('express');
    var app = express();
    var server = require('http').createServer(app);



    console.log('Starting Up');

    // configuration =================

    app.use(express.static(__dirname + '/lib'));

    app.post('/auth/google', function(req,res){
      res.send('response');
    })

    app.get('*', function(req, res) {
      res.sendfile('./' + req.url);
    });

    // listen (start app with node server.js) ======================================
    app.set('port', process.env.PORT || 3000);

    server.listen(app.get('port'));