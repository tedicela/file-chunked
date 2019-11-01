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
	getChunkStoragePath(fileChunkStorage){
		const DS = this.getDS();
		let CHUNK_STORAGE = fileChunkStorage.split(DS);
		if(CHUNK_STORAGE[CHUNK_STORAGE.length-1] == ""){
			CHUNK_STORAGE[CHUNK_STORAGE.length-1] = 'tmp_chunks';
		}else{
			CHUNK_STORAGE.push('tmp_chunks');
		}
		CHUNK_STORAGE = CHUNK_STORAGE.join(DS);
		
		return CHUNK_STORAGE;
	}
	upload(file){
		
		let CHUNK_STORAGE = this.getChunkStoragePath(file.chunkStorage);
		
		if (!fs.existsSync(CHUNK_STORAGE)){
			this.mkdirRecursive(CHUNK_STORAGE);
		}
		
		let oldTmpFileName = file.filePath;
		if(file.chunkIndex < file.totalChunksCount - 1){ //merge
			
			if(file.chunkIndex > 0){ // do merge
				oldTmpFileName = CHUNK_STORAGE + ["chunk", file.uploadId, file.chunkIndex-1].join("-");
				let chunkedFile = fs.readFileSync(file.filePath);
				fs.appendFileSync(oldTmpFileName, chunkedFile);
				fs.unlinkSync(file.filePath);
			}
			
			let newTmpFileName = CHUNK_STORAGE + ["chunk", file.uploadId, file.chunkIndex].join("-");
			//Rename and move file:
			fs.renameSync(oldTmpFileName, newTmpFileName);
			
		}else{
			//Final merge a rename it as final fileName:
			oldTmpFileName = CHUNK_STORAGE + ["chunk", file.uploadId, file.chunkIndex-1].join("-");
			let chunkedFile = fs.readFileSync(file.filePath);
			fs.appendFileSync(oldTmpFileName, chunkedFile);
			fs.unlinkSync(file.filePath);
			
			//Rename and move file:	
			fs.renameSync(oldTmpFileName, file.filePath);
		}
		this.clearOrphanedChunks(CHUNK_STORAGE);
	}
	clearOrphanedChunks(storagePath){
		const DS = this.getDS();
		fs.readdir(storagePath, function (err, files) {
			//handling error
			if (err) {
				return console.log('Unable to scan directory: ' + err);
			} 
			//listing all files using forEach
			files.forEach(function (file) {
				if( file.split("-")[0] != 'chunk') return;
				
				let file_path = (storagePath[storagePath.length-1] != DS ) ? storagePath+DS+file : storagePath+file;
				fs.stat(file_path, function(err, stats){
					if( (new Date()).getTime() - stats.mtime.getTime() >= 24*60*60*1000 ){
						fs.unlinkSync(file_path);
					}
				});
			});
		});
	}
}
module.exports = new FileChunked();
