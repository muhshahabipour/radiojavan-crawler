const express = require('express')
const bodyParser = require('body-parser');
const path = require("path");
const RadioJavan = require('./js/modules/RadioJavan');

const app = express();

app.use('/node_modules', express.static('node_modules'))
app.use('/static/styles', express.static('public/styles'))
app.use('/static/js', express.static('public/js'))
app.use('/static/images', express.static('public/images'))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
})); // support encoded bodies

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + "/views");

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/fetch', function (req, res) {
  res.redirect('/');
});

app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.1.html'));
});

app.post('/fetch', async function (req, res) {
  let downloadLinks = [];

  var url = req.body.url;

  var radioJavan = new RadioJavan({
    url: url
  });

  var filePaths = await radioJavan.getFilePath();
  console.warn("[filePaths] ===>", filePaths);

  var domain = await radioJavan.getDomain();
  console.warn("[domain] ===>", domain);


  var poster = "";
  if (radioJavan.type !== "video") {
    poster = await radioJavan.getFilePoster();
    // console.warn("[poster] ===>", poster);
  }


  if (domain !== "error" && filePaths !== "error") {
    if (filePaths && filePaths.length > 0) {
      filePaths.forEach(function (filePath) {
        downloadLinks.push(domain + filePath);
      });
    }

  }



  res.render("fetch", {
    downloadLinks: downloadLinks && downloadLinks.length ? downloadLinks : "not found!",
    status: downloadLinks && downloadLinks.length ? 1 : 0,
    src: poster && poster.length ? poster : ""
  });

});


// Bind the app to a specified port
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);