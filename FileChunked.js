const fs = require('fs');
const path = require('path');

class FileChunked {
	getDS(){
		let DS = path.sep;
		if(typeof DS === 'undefined'){
			var isWin = process.platform === "win32";
			if(isWin){
				DS = '\\';	
			}else{
				DS = '/';	
			}
		}
		return DS;
	}
	mkdirRecursive(path){
		const DS = this.getDS();
		
		const folders = path.split(DS);
		
		let checkPath = "";
		let checkPathParts = [];
		for(let i=0; i<folders.length; i++){
			checkPathParts.push(folders[i]);
			if(folders[i] == "." || folders[i] == ""){
				continue;
			}
			checkPath = checkPathParts.join(DS);
			if (!fs.existsSync(checkPath)){
				fs.mkdirSync(checkPath);
			}
		}
		
	}
	upload(file){
		
		if (!fs.existsSync(file.chunkStorage)){
			this.mkdirRecursive(file.chunkStorage);
		}
		
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
