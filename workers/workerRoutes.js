var pg = require('pg');

var nodemailer = require('nodemailer');

var fs = require('fs')
  , gm = require('gm');

var routes = require('./workerRoutes.js');

var url = require('url');

var s3 = require('s3');

var s3Client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: 'AKIAIFTRAZLMMQJZ6OWQ',
    secretAccessKey: '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',
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});







module.exports.resizeImage = function(request, response) {


  var queryArgs = url.parse(request.url, true).query;

  var keyString = queryArgs.keyString;

  var randomPath = Math.floor(Math.random()*1000000000001);

  var downloadParams = {
    localFile: '/home/ec2-user/images/' + randomPath,

    s3Params: {
      Bucket: 'agora-image-storage',
      Key: keyString,
      // other options supported by getObject
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
    },
  };
  var downloader = s3Client.downloadFile(downloadParams);
  downloader.on('error', function(err) {
    console.error("unable to download:", err.stack);
  });
  downloader.on('progress', function() {
    console.log("progress", downloader.progressAmount, downloader.progressTotal);
  });
  downloader.on('end', function() {
    console.log("done downloading");


    //IDENTIFY IMAGE
    gm('/home/ec2-user/images/' + randomPath)
    .identify(function (err, data) {
      if (err) console.log('error getting image metadat: ', err);

      //take this outtt
      response.json(data);

      //used for scaling the image correctly
      var aspectRatio = data.size.height / data.size.width;
      xRatio = data.size.height / 1000;
      yRatio = data.size.height / 1000;

      var uploadParams = {
        localFile: '/home/ec2-user/images/' + randomPath,

        s3Params: {
          Bucket: "agora-image-storage",
          Key: keyString,
          // other options supported by putObject, except Body and ContentLength.
          // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
      };

      //depending on image size, take appropriate action
      if ((data.size.height >= 1000 || data.size.width >= 1000)
        && data.size.width >= data.size.height) {
        //WIDTH IS GREATER THAN HEIGHT
        gm(randomPath)
        .resize(1000, data.size.height / xRatio)
        .noProfile()
        .write(randomPath, function (err) {
          if (!err) console.log('done');

          var uploader = s3Client.uploadFile(uploadParams);
          uploader.on('error', function(err) {
            console.error("unable to upload:", err.stack);
          });
          uploader.on('progress', function() {
            console.log("progress", uploader.progressMd5Amount,
                      uploader.progressAmount, uploader.progressTotal);
          });
          uploader.on('end', function() {
            console.log("done uploading");

            fs.unlink('/home/ec2-user/images/' + randomPath, function (err) {
              if (err) throw err;
            });


          });//end upload done

        });

      } else if ((data.size.height >= 1000 || data.size.width >= 1000)
        && data.size.height >= data.size.width) {
        //HEIGHT IS GREATER THAN WIDTH
        gm(randomPath)
        .resize(data.size / yRatio, 1000)
        .noProfile()
        .write(randomPath, function (err) {
          if (!err) console.log('done');

          var uploader = s3Client.uploadFile(uploadParams);
          uploader.on('error', function(err) {
            console.error("unable to upload:", err.stack);
          });
          uploader.on('progress', function() {
            console.log("progress", uploader.progressMd5Amount,
                      uploader.progressAmount, uploader.progressTotal);
          });
          uploader.on('end', function() {
            console.log("done uploading");

            fs.unlink('/home/ec2-user/images/' + randomPath, function (err) {
              if (err) throw err;
            });

          });//end upload done

        });//end resize

      } else {
        //DONT NEED TO DO ANY RESIZING
        fs.unlink('/home/ec2-user/images/' + randomPath, function (err) {
          if (err) throw err;
        });

        response.end('no resizing required');

      }



    });//end identification callback


  });//end download finished callback







};


module.exports.treeBuilder = function(request, response) {


};



module.exports.addTree = function(request, response) {


};


module.exports.removeTree = function(request, response) {


};