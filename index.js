var express = require('express');
var app = express();
var path = require('path');
var multiparty = require('connect-multiparty');
var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
var multiMiddleware = multiparty();
var fs = require('fs');

var collectionFaces = 'collectionFaces';

var rekognition = new AWS.Rekognition();
rekognition.listCollections({}, function (err, data) {
  if (err) {
    console.log(err);
    return;
  }

  if (data.CollectionIds.indexOf(collectionFaces) === -1) {
    rekognition.createCollection({CollectionId: collectionFaces}, function (err, data) {
      console.log(err, data);
    })
  }
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/admin', function (req, res) {
  res.sendFile(path.join(__dirname + '/admin.html'));
});
				
app.post('/upload-image', multiMiddleware, function (req, res) {
  var file = req.files.image;

  fs.readFile(file.path, function (err, data) {
    var params = {
      CollectionId: collectionFaces,
      DetectionAttributes: [],
      ExternalImageId: file.originalFilename,
      Image: {
        Bytes: data
      }
    };
    rekognition.indexFaces(params, function (err, data) {
      if (err) {
        console.log('ERROR MSG: ', err);
        res.status(500).send(err);
      } else {
        console.log('Successfully uploaded data');
        res.status(200).end();
      }
    });
  });
})

app.post('/recognize', multiMiddleware, function (req, res) {
  var rekognition = new AWS.Rekognition();
  var file = req.files.image;
  fs.readFile(file.path, function (err, data) {
    var params = {
      CollectionId: collectionFaces,
      FaceMatchThreshold: 95,
      Image: {
        Bytes: data
      },
      MaxFaces: 1
    };
    rekognition.searchFacesByImage(params, function (err, data) {
      if (err) {
        console.log('ERROR MSG: ', err);
        res.status(400).send('no match');
      } else {
        if (data.FaceMatches.length === 0) {
          res.status(400).send('no match');
        } else {
          res.status(200).end();
        }

      }
    })
  });
})
app.get("/",function(req,res){
	var id = req.query.id;
	//further operations to perform
	response.end('I have received the ID: ' + id);
});
var port = process.env.PORT || 8080;
console.log('start listeing on' + port);
app.listen(port);
