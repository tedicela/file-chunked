# file-chunked
File Chunk or simple upload

### Description
A NodeJS module that makes simple to handle the chunk uploaded on the server side

### Requirements

Nodejs >=v8.16.0

### Installation

```
npm install file-chunked --save
```


### How frontend should work
- The frontend should send not the entire file (ex: 20MB file) but it should send the file splited in 20 chunks of 1MB each. 
- The frontend on each request that sends a chunk should send also: 
  - `uploadId` - a unique ID for each file upload (ex: `md5(filename+((new Date()).getTime())+user.id)`). The `uploadId` is the same for all chunks of a single file uploaded.
  - `chunkIndex` - an ordered number of the chunk
  - `totalChunksCount` - the total number number of chunks the file was divided. Example: a 5.3MB file splited in chunks of 1MB will have a total of 6 chunks(5 chunks of 1MB and one chunk of 0.3MB).

### How the chunk upload works:
- uploaded files are saved into a storage dir
- file-chunked inside that dir creates a dir `tmp_chunks` and moves the file chunk in that directory by giving another name
- When another chunk arrives it merges this chunk with the rest of the file uploaded and deletes this chunk but keeps only the merged chunks inside `tmp_chunks`
- When the last chunk arrives it merges the last chunk with the rest of file, so file file is complete. After that it moves merged file from `tmp_chunks` to the default storage dir where all uploaded files are saved giving this file the original name.
- After each chunk uploaded it checks if there are orphaned chunks that are older than 24 hours. If there are any it deletes all them. This is made to not keep dead chunks that can be created when a user starts to upload a large file and in the middle of the upload process he interrupts the upload(user can interrupt it, network problems etc...)
- on the backend after the last chunk is uploaded you assume that the file is uploaded so you can do the other stuff like: move that file where you want to save it and insert records into db if needed.

### Example implementation on server-side

```
// call all the required packages
const express = require('express')
const cors = require('cors');
const bodyParser= require('body-parser')
const multer = require('multer');
const fs = require('fs');
const FileChunked = require('file-chunked');

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
			chunkStorage:"/tmp/", // where the uploaded file(chunked file in this case) are saved
			uploadId: body.uploadId,
			chunkIndex: body.chunkIndex,
			totalChunksCount: body.totalChunksCount,
			filePath: req.file.path,
		});
	}
	
  res.json({ message: 'WELCOME' });
  
})

app.listen(3000, () => console.log('Server started on port 3000'));
```
