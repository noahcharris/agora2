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

  var params = {
    localFile: '/home/ec2-user/images/' + randomPath,

    s3Params: {
      Bucket: 'agora-image-storage',
      Key: keyString,
      // other options supported by getObject
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
    },
  };
  var downloader = s3Client.downloadFile(params);
  downloader.on('error', function(err) {
    console.error("unable to download:", err.stack);
  });
  downloader.on('progress', function() {
    console.log("progress", downloader.progressAmount, downloader.progressTotal);
  });
  downloader.on('end', function() {
    console.log("done downloading");


    //RESIZE IMAGE THEN REUPLOAD
    gm('/home/ec2-user/images/' + randomPath)
    .identify(function (err, data) {
      if (err) console.log('error getting image metadat: ', err);

      console.log('WHA WHA WHAAAAAAAAA: ', data);

      // if (data.size.height >= 1000 || data.size.width >= 1000) {
      //   gm(files.file[0].path)
      //   .resize(1000, 1000)
      //   .noProfile()
      //   .write(files.file[0].path, function (err) {
      //     if (!err) console.log('done');
      //   });

      // }
    });





  });







};


module.exports.treeBuilder = function(request, response) {


};



module.exports.addTree = function(request, response) {


};


module.exports.removeTree = function(request, response) {


};