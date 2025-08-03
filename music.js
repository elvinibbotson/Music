var files=[];
var artists=[];
var albums=[];
var album={};
var songs=[];
var playlists=[];
var index;
var artist;
var album;
var playlist;
var list=[];
var handle0;
var handle1;
var dragStart={};
var previousList;

function id(el) {
	return document.getElementById(el); 
}

load();

id('header').addEventListener('click',listSongs);
id('addButton').addEventListener('click',addSong);
id('scanButton').addEventListener('click',scan);
id('saveButton').addEventListener('click',save);
// SWIPE RIGHT TO GO BACK OR LEFT TO CLOSE DIALOGS
id('list').addEventListener('touchstart', function(event) {
    // console.log(event.changedTouches.length+" touches");
    dragStart.x=event.changedTouches[0].clientX;
    dragStart.y=event.changedTouches[0].clientY;
})

id('list').addEventListener('touchend', function(event) {
    var drag={};
    drag.x=dragStart.x-event.changedTouches[0].clientX;
    drag.y=dragStart.y-event.changedTouches[0].clientY;
    if(Math.abs(drag.y)>50) return; // ignore vertical drags
    if(drag.x<-50) previous(); // back to previous list
    else if((drag.x>50)&&(currentDialog)) toggleDialog(currentDialog,false); // drag left to close dialogs
})

async function addSong() {
	report("play What's Up");
	id('player').src="/storage/070D-4726/Music/4 Non Blondes/What's Up.mp3";
	id('player').play();
	/*
	files=await addSongSelect();
	await addSongSave(files[0]);
	save();
	*/
}

async function addSongSelect() {
	var input=document.createElement('input');
	input.type = 'file';
	// input.multiple = true;
	input.accept = ['.mp3','audio/mpeg'].join(',');
	// Simulate a click on the input element.
	var event = new MouseEvent('click',{
		bubbles: true,
		cancelable: true,
		view: window
	});
	input.dispatchEvent(event);
	// Wait for the file to be selected.
	return new Promise((resolve)=>{
		input.onchange=(event)=>{
			// tracks=[];
			// console.log('file 0: '+event.target.files[0].name);
			resolve(event.target.files);
		}
	});
}

async function addSongSave(file) {
	var title=file.name.substring(0,file.name.indexOf('.'));
	console.log('save song '+title+' '+file.size+' bytes');
	console.log('content: '+file.value);
	var song={};
	song.type='file';
	song.title=title;
	song.data=file.value;
	songs.push(song);
}
			/*
			var files=event.target.files;
			console.log(files.length+' files');
			console.log('file 0: '+files[0].name);
			var link=URL.createObjectURL(files[0]);
			id('player').src=link;
			console.log('link: '+link);
			id('player').play();
			var track={};
			track.title=files[0].name;
			track.link=link.substring(5)+'.mp3';
			tracks.push(track);
			console.log('track 0: '+tracks[0].title);
			song={};
			// this works until reload app...
			// song.type=='url';
			// song.link=link;
			song.type='file';
			song.title=
			song.data=files[0];
			songs.push(song);
			console.log('song 0: '+songs[0]);
			save();
		}
	});
	// get songs from files
	
}
*/

function artistAlbums(album) {
	return album.artist==artist;
}

function artistTracks(track) {
	return track.artist==artist;
}

function hide(element) {
	id(element).style.display='none';
}

function listAlbums() {
	console.log('list albums');
	id('list').innerHTML='';
	for(var i in albums) {
		console.log('list '+i+': '+albums[i].title);
		var listItem=document.createElement('li');
		listItem.index=i; // index of list item
		listItem.addEventListener('click', function(){index=this.index; listAlbum();});
		listItem.innerHTML=albums[i].title+'<br><small>'+albums[i].artist+'</small>';
		id('list').appendChild(listItem);
	}
}

function listArtist() {
	artist=artists[index];
	previousList='artists';
	console.log('list albums and tracks for '+artist);
	id('listHeader').style.display='block';
	id('listHeader').innerHTML=artist;
	list=albums.filter(artistAlbums);
	id('list').innerHTML='';
	for(var i in list) {
		console.log(list[i]);
		var listItem=document.createElement('li');
		listItem.index=i; // index of list item
		listItem.addEventListener('click', function(){index=this.index; listAlbum();});
		listItem.innerHTML='<b>'+list[i].title+'</b>';
		id('list').appendChild(listItem);
	}
	list=tracks.filter(artistTracks);
	for(i in list) {
		listItem=document.createElement('li');
		listItem.index=i; // index of list item
		listItem.addEventListener('click', function(){index=this.index; playTrack();});
		listItem.innerHTML=list[i].title;
		id('list').appendChild(listItem);
	}
}

function listArtists() {
	console.log('list artists');
	id('list').innerHTML='';
	artists.sort();
	for(var i in artists) {
		console.log('list '+artists[i]);
		var listItem=document.createElement('li');
		listItem.index=i; // index of list item
		listItem.addEventListener('click', function(){index=this.index; listArtist();});
		listItem.innerHTML=artists[i];
		id('list').appendChild(listItem);
	}
}

function listPlaylists() {
	console.log('list playlists');
	id('list').innerHTML='';
	//	LIST PLAYLISTS
}

function listSongs() {
	console.log('list songs');
	id('list').innerHTML='';
	for(i in songs) {
		var listItem=document.createElement('li');
		listItem.index=i; // index of list item
		listItem.addEventListener('click', function(){index=this.index; playSong();});
		var html=songs[i].title+'<br><small>'+songs[i].artist;
		if(songs[i].album) html+=' - '+songs[i].album;
		html+='</small>';
		listItem.innerHTML=html;
		id('list').appendChild(listItem);
	}
}

function load() {
	var  data=window.localStorage.getItem('music');
	if(!data) {
		show('scanDialog');
		return;
	}
	var json=JSON.parse(data);
	tracks=json.tracks;
	songs=json.songs;
	// links=json.links;
	console.log(songs.length+' songs loaded');
	listSongs();
	/*
	artists=[];
	albums=[];
	for(var i in tracks) {
		if(artists.indexOf(tracks[i].artist)<0) artists.push(tracks[i].artist);
		if(tracks[i].album) {
			album={};
			album.artist=tracks[i].artist;
			album.title=tracks[i].album;
			var found=false;
			var j=0;
			while(j<albums.length && !found) {
				if(albums[j].title==album.title) found=true;
				else j++
			}
			if(!found) albums.push(album);
		}
	}
	console.log(artists.length+' artists; '+albums.length+' albums');
	*/
}

function playSong() {
	console.log('play track '+index+': '+songs[index].title);
	// SHOW TRACK DETAILS - TITLE, ARTIST, ALBUM PLUS PLAY, ADD TO PLAYLIST AND DELETE BUTTONS
	// var path=handle0+'/Music/'+tracks[index].artist+'/'+tracks[index].title;
	// console.log('link: '+songs[index].link);
	/*
	var blob=window.URL;
	var file=songs[index].data;
	report(file);
	report(file.name);
	report(file.type);
	var url=URL.createObjectURL(file);
	report('url');
	id('player').src=url;
	*/
	var path='songs/'+songs[index].artist+'~'+songs[index].title;
	console.log('play '+path);
	id('player').src=path;
	id('player').play();
}

function report(text) {
	id('feedback').innerHTML+='<br>'+text;
}

function previous() {
	console.log('return to previous list: '+previousList);
	id('listHeader').style.display='none';
	switch(previousList) {
		case 'artists':
			listArtists();
			break;
		case 'albums':
			listAlbums();
			break;
		case 'tracks':
			listTracks();
			break;
		case 'playlists':
			listPlaylists();
	}
}

function save() {
	var data={};
	data.songs=songs;
	// data.links=links;
	// data.playlists=[];
	var json=JSON.stringify(data);
	console.log('save JSON: '+json);
	window.localStorage.setItem('music',json);
	console.log('SAVED');
}

async function scan() {
	songs=[];
	// links=[];
	artists=[];
	albums=[];
	handle0=await window.showDirectoryPicker();
	for await(var entry of handle0.values()) {
		// console.log(entry.kind,entry.name);
		artists.push(entry.name); // build array of artist's names
	}
	// console.log(artists.length+' artists; first: '+artists[0]);
	for(var i in artists) scanArtist(artists[i]); // get albums and tracks for each artist
	scanArtist('Daniel Ibbotson');
	// scanAlbums(); // list all albums after scanning all artist folders
};

async function scanAlbums(artistName,albumName) {
	handle2=await handle1.getDirectoryHandle(albumName);
	for await(var entry of handle2.values()) {
		var track={};
		track.artist=artistName;
		track.album=albumName;
		track.title=entry.name;
		tracks.push(track);
	}
}

async function scanArtist(name) {
	console.log('scan artist '+name);
	handle1=await handle0.getDirectoryHandle(name);
	for await(var entry of handle1.values()) {
		// console.log(entry.kind,entry.name);
		if(entry.kind=='directory') {
			var album={};
			album.artist=name;
			album.title=entry.name;
			albums.push(album);
			console.log('scan album '+entry.name);
			scanAlbums(name,entry);
		}
		else {
			// addTrack(entry,name);
			var song={};
			song.artist=name;
			song.title=entry.name;
			// track.link=entry;
			console.log(song.title+'/'+song.artist);
			songs.push(song);
			// console.log('link: '+entry.name+' - '+entry.kind);
			// links.push(entry);
		}
	}
}
/*
async function addTrack(entry,artist,album) {
	// var path=await handle0.resolve(f);
	// var file=await entry.getFile();
		var track={};
		track.artist=artist;
		if(album) track.album=album;
		track.title=entry.name;
		track.link=entry;
	// track.path=path;
	// track.url=URL.createObjectURL(file);
	console.log(track.title+'/'+track.artist+'/'+track.link);
		tracks.push(track);
	console.log('add track '+entry.name);
}
*/
function show(element) {
	id(element).style.display='block';
}

	






