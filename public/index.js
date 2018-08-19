const express = require('express')
const bodyParser = require('body-parser');
const path = require("path");
const _defaults = require("lodash/defaults");
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

app.get('/find', function (req, res) {
  res.redirect('/');
});

app.get('/notfound', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/notFound.html'));
});

app.post('/find', async function (req, res) {
  let downloadLinks = [];

  var url = req.body.url;

  var radioJavan = new RadioJavan({
    url: url
  });

  var filePaths = await radioJavan.getFilePath();
  console.warn("[filePaths] ===>", filePaths);

  var domain = await radioJavan.getDomain();
  console.warn("[domain] ===>", domain);

  if (domain !== "error" && filePaths !== "error") {
    if (filePaths && filePaths.length > 0) {
      for (const filePath of filePaths) {

        let downloadItem = {link: domain + filePath.link}

        if (radioJavan.type !== "video") {
          const fileDetail = await radioJavan.getFileDetail(domain + filePath.link);
          downloadItem = _defaults(downloadItem, {
            title: fileDetail.title || filePath.title || "",
            type: fileDetail.type || "",
            cover: fileDetail.cover || ""
          })
        } else {
          downloadItem = _defaults(downloadItem, {
            title: filePath.title || "",
            quality: filePath.quality || "",
            type: "video",
          })
        }
        downloadLinks.push(downloadItem);
      }
    }
  }


  if (downloadLinks && downloadLinks.length) {
    res.render("founded", {
      downloadLinks: downloadLinks && downloadLinks.length ? downloadLinks : "not found!",
      status: 1
    });
  } else {
    res.render("notFound", {
      status: 0,
    });
  }
});

app.get('*', function (req, res) {
  res.render('404', {});
});

// Bind the app to a specified port
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);