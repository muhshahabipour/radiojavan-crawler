const express = require('express')
const bodyParser = require('body-parser');
const path = require("path");
const _defaults = require("lodash/defaults");
const RadioJavan = require('./js/modules/RadioJavan');
var expressLayouts = require('express-ejs-layouts');

const app = express();


app.use('/node_modules', express.static('node_modules'))
app.use('/static/styles', express.static('public/styles'))
app.use('/static/js', express.static('public/js'))
app.use('/static/images', express.static('public/images'))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
})); // support encoded bodies

// app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');
app.set('views', __dirname + "/views");
app.set('layout extractScripts', true)
app.set('layout extractStyles', true)

app.use(expressLayouts);

app.get('/', function (req, res) {
  var locals = {
    title: 'RJ Plus - RJ Downloader'
  };

  res.render('landing', locals);
  // res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/find', function (req, res) {
  res.redirect('/');
});

app.get('/notfound', function (req, res) {
  var locals = {
    title: 'RJ Plus - Page Not Found'
  };

  res.render('notFound', locals);
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

        let downloadItem = {
          link: domain + filePath.link
        }

        if (radioJavan.type !== "video") {
          const fileDetail = await radioJavan.getFileDetail(domain + filePath.link);
          downloadItem = _defaults(downloadItem, {
            title: fileDetail.title || filePath.title || "",
            type: fileDetail.type || "",
            cover: fileDetail.cover || "",
            album: fileDetail.album || ""
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
    var locals = {
      title: 'RJ Plus - Found',
      downloadLinks: downloadLinks && downloadLinks.length ? downloadLinks : "not found!",
    };

    res.render('founded', locals);
  } else {
    var locals = {
      title: 'RJ Plus - Not Found'
    };

    res.render('notFound', locals);
  }
});

app.get('*', function (req, res) {
  var locals = {
    title: 'RJ Plus - 404 Not Found'
  };

  res.render('404', locals);
});

// Bind the app to a specified port
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);