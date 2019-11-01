// call all the required packages
const express = require('express')
const cors = require('cors');
const bodyParser= require('body-parser')
const multer = require('multer');
const fs = require('fs');
const FileChunked = require('./FileChunked');

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ storage: storage })

//CREATE EXPRESS APP
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}))
 
app.post('/upload', upload.single('file'), (req, res, next) => {
  const {file, body} = req;
	if(body.chunking == 'true'){
		
		FileChunked.upload({
			chunkStorage:"/tmp/",
			uploadId: body.uploadId,
			chunkIndex: body.chunkIndex,
			totalChunksCount: body.totalChunksCount,
			filePath: req.file.path,
		});
	}
	
  res.json({ message: 'WELCOME' });
  
})

app.listen(3000, () => console.log('Server started on port 3000'));
