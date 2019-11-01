const fs = require('fs');

class FileChunked {
	upload(file){
		let oldTmpFileName = file.filePath;
		if(file.chunkIndex < file.totalChunksCount - 1){ //merge
			
			if(file.chunkIndex > 0){ // do merge
				oldTmpFileName = file.chunkStorage + ["chunk", file.uploadId, file.chunkIndex-1].join("-");
				let chunkedFile = fs.readFileSync(file.filePath);
				fs.appendFileSync(oldTmpFileName, chunkedFile);
				fs.unlinkSync(file.filePath);
			}
			
			let newTmpFileName = file.chunkStorage + ["chunk", file.uploadId, file.chunkIndex].join("-");
			//Rename and move file:
			fs.renameSync(oldTmpFileName, newTmpFileName);
			
		}else{
			//Final merge a rename it as final fileName:
			oldTmpFileName = file.chunkStorage + ["chunk", file.uploadId, file.chunkIndex-1].join("-");
			let chunkedFile = fs.readFileSync(file.filePath);
			fs.appendFileSync(oldTmpFileName, chunkedFile);
			fs.unlinkSync(file.filePath);
			
			//Rename and move file:	
			fs.renameSync(oldTmpFileName, file.filePath);
		}
	}
}
module.exports = new FileChunked();
