//'use strict';
function createNode(element) {
  return document.createElement(element);
}
function append(parent, el) {
  return parent.appendChild(el);
}
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return("");
}
function setCookie(cname,cvalue,exdays)
{
  var d = new Date();
  if (!exdays) {
    d.setTime(d.getTime()+d.getTime());
  } else {
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
  }
  var expires = "expires="+d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname)
{
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) 
  {
    var c = ca[i].trim();
    if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  }
  return "";
}
Array.prototype.insertRandomAfter = function(_item, _afterIndex) {
	if (!_afterIndex) {
		this.splice(Math.floor(Math.random() * this.length), 0, _item);
	} else {
		this.splice(_afterIndex + 1 + Math.floor(Math.random() * (this.length - _afterIndex - 1)), 0, _item);
	}
};

function showSongs() {
    if (table.rows.length >= songs.length) return;
    for (var i = 0; i < songs.length; i++) {
        if (table.rows.length <= songs.length) {
            tr = table.insertRow(-1);
            tr.innerHTML = "<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>";
        }
        tr = table.rows[i];
        tr.cells.item(0).innerHTML = songs[i].name;
    }
    for (var i = songs.length; i < table.rows.length; i++) {
        if (table.rows.length > songs.length) {
            table.deleteRow(table.rows.length-1);
        }
    }
}

var fmList = [];
var urlList = 'https://bird.ioliu.cn/v2?url=http://m.kugou.com/app/i/fmList.php?pagesize=20&pageindex=';
var pageIndex = 1;
function fetchFM() {
    var urlTemp = urlList + pageIndex;
    fetch(urlTemp).then(function (resp) {
        return resp.json();
    }).then(function (json) {
        var len = json.data.length;
        for (var i=0; i<len; i++) {
            fmList.push({'fmid': json.data[i].fmid, 'fmname': json.data[i].fmname});
        }
        if (pageIndex*20 < json.recordcount) {
            pageIndex++;
            fetchFM();
        }
    })['catch'](function (error) {
        console.log(error);//JSON.stringify(error));
        setTimeout(fetchFM, 3000);
    });
}

var offsets = '';
var fmSongs = 'https://bird.ioliu.cn/v2?url=http://m.kugou.com/app/i/fmSongs.php?size=20';
var getSong = 'https://bird.ioliu.cn/v2?url=http://m.kugou.com/app/i/getSongInfo.php?cmd=playInfo&hash=';
function fetchSongs(_fmid) {
	if (!_fmid) { 
		var _fmid = localStorage.getItem("songsID");
		if (_fmid == null) {_fmid = 27;}
	} else {
		if (_fmid != localStorage.getItem("songsID")) {
			localStorage.setItem("songsID", _fmid);
		}
	}
	if (offsets == '') {
		var d = new Date();
		offsets = '%7B%22offset%22%3A0%2C%22time%22%3A' + Math.round(d.getTime()/1000-3600) + '%7D';
	}
var urlTemp = fmSongs;
urlTemp += '&fmid='; urlTemp += _fmid;
urlTemp += '&offset='; urlTemp += offsets;

fetch(urlTemp).then(function (resp) {
  return resp.json();
}).then(function (json) {
    offsets = json.data[0].offset;
    var len = 0;
    if (json.data[0].songs) { len = json.data[0].songs.length; }
    var ran = [];
    for (var i=0; i<len; i++) {ran.push(i);}
    while (ran.length > 0) {
		i = Math.floor(Math.random()*ran.length);
        fetch(getSong + json.data[0].songs[ran[i]].hash)
            .then(function (resp) {
                return resp.json();
            })
            .then(function(songJson) {
                if (songJson.errcode == 0) {
                    var srcTemp = songJson.url;
                    if (srcTemp.trim() != '') {
                        songs.push({'name': songJson.fileName, 'src': srcTemp});
                    }
                } else {
                    //console.log(songJson);
                }
            });
		ran.splice(i, 1);
    }
    if (songs.length == 0 && len == 0) {setTimeout(function(){fetchSongs(_fmid)}, 3000);}
})['catch'](function (error) {
    console.log(error);//JSON.stringify(error));
    if (songs.length == 0) {setTimeout(fetchSongs, 3000);}
});
}

fetch('http://192.168.2.133:1664').then(function (resp) {
  return resp.text();
}).then(function (text) {
	console.log(text);
});
fetch('/cgi-bin/play.cgi').then(function (resp) {
  return resp.text();
}).then(function (text) {
	if (text.startsWith('yottaCar')) {
		yottaCar = '';
	}
});
var yottaCarIP = window.location.search.substring(1).split('&')[0].trim();
if (yottaCarIP) {
fetch('http://'+yottaCarIP+'/cgi-bin/play.cgi').then(function (resp) {
  return resp.text();
}).then(function (text) {
	if (text.startsWith('yottaCar')) {
		yottaCar = 'http://' + yottaCarIP;
	}
});
};

function playStart() {
    if (songs.length == 0) {
        setTimeout(playStart, 1000);
        return;
    }
    kbox.addEventListener("ended", function() {
            playNextSongAuto()
        }, true);
    kbox.onplay = function() {
            gallery.ui.updatePlayPause();
			gallery.ui.updateIndexIndicator();
        };
    kbox.onpause = function() {
            gallery.ui.updatePlayPause();
        };
    if (indexPlay >= songs.length) indexPlay = 0;
                    //document.getElementById('kbox').innerHTML = "<audio id='kbox' src='" + songUrl + "' autoplay='autoplay' controls></audio>";
    kbox.setAttribute("src", songs[indexPlay].src);
                    document.getElementById('kbox').setAttribute("autoplay", 'autoplay');
                    //console.log(document.getElementById('kbox').innerHTML);
                    document.getElementById('kbox').load();
                    //document.getElementById('kbox').play();
    document.getElementById('kbox').play();
    var urlTemp = yottaCar + '/cgi-bin/play.cgi?' + encodeURIComponent(songs[indexPlay].src.replace("https://","http://"));
    fetch(urlTemp).then(function (resp) {
        return resp.text();
    }).then(function (text) {
		console.log(text);
	})['catch'](function (error) {
        console.log(error);//JSON.stringify(error));
    });
}

function playNextSongAuto() {
    if (songs.length == 0) {
        setTimeout(playStart, 1000);
        return;
    }
    indexPlay++;
    if (indexPlay+20 > songs.length) fetchSongs();
    if (indexPlay >= songs.length) indexPlay = 0;
    kbox.setAttribute("src", songs[indexPlay].src);
    kbox.load();
    kbox.play();
    var urlTemp = yottaCar + "/cgi-bin/play.cgi?" + encodeURIComponent(songs[indexPlay].src.replace("https://","http://"));
    fetch(urlTemp).then(function (resp) {
        return resp.text();
    }).then(function (text) {
		console.log(text);
	})['catch'](function (error) {
        console.log(error);//JSON.stringify(error));
    });
}

function fetchPics(size) {
if (window.location.host) {
	var urlTemp = "vladstudio.json";
} else {
	var urlTemp = "https://kbox.cn/vladstudio.json";
}
fetch(urlTemp).then(function (resp) {
  return resp.json();
}).then(function (json) {
	var len = 0;
	if (json.art) { len = json.art.length;}
    for (var i=0; i<len; i++) {
		if (json.art[i].name) {
			var $titl3 = json.art[i].name + '\r\nvlad.studio';
		} else {
			var $titl3 = json.art[i].name + '\r\nvlad.studio';
		}
		gallery.items.insertRandomAfter({src: json.art[i].wall_thumb_url, w:1024, h:1024, webpage: json.art[i].webpage, titl3:$titl3}, 1);
    } 
  // sets a flag that slides should be updated
  gallery.invalidateCurrItems();
  // updates the content of slides
  gallery.updateSize(true);
})['catch'](function (error) {
  console.log(error);//JSON.stringify(error));
  setTimeout(fetchPics, 3000);
});
}

function fetchPixabay() {
if (window.location.host) {
	var urlTemp = "pixabay.json";
} else {
	var urlTemp = "https://kbox.cn/pixabay.json";
}
fetch(urlTemp).then(function (resp) {
  return resp.json();
}).then(function (json) {
	var len = 0;
	if (json.hits) { len = json.hits.length; }
	for (var i=0; i<len; i++) {
		if (json.hits[i].tags) {
			var $titl3 = json.hits[i].tags + '\r\npixabay.com';
		} else {
			var $titl3 = 'pixabay.com';
		}
		gallery.items.insertRandomAfter({src: json.hits[i].largeImageURL, w:json.hits[i].webformatWidth, h:json.hits[i].webformatHeight, webpage:json.hits[i].pageURL, titl3:$titl3, resize:true}, 1);
	} 
  // sets a flag that slides should be updated
  gallery.invalidateCurrItems();
  // updates the content of slides
  gallery.updateSize(true);
})['catch'](function (error) {
  console.log(error);//JSON.stringify(error));
  setTimeout(fetchPixabay, 3000);
});
}

function fetchUnsplash() {
if (window.location.host) {
	var urlTemp = "unsplash.json";
} else {
	var urlTemp = "https://kbox.cn/unsplash.json";
}
fetch(urlTemp).then(function (resp) {
  return resp.json();
}).then(function (json) {
	var len = 0;
	if (json) { len = json.length; }
    for (var i=0; i<len; i++) {
		if (json[i].description) {
			var $titl3 = json[i].description+ '\r\nunsplash.com';
		} else {
			var $titl3 = 'unsplash.com';
		}
		gallery.items.insertRandomAfter({src: json[i].urls.regular, w:json[i].width, h:json[i].height, webpage:json[i].links.html, titl3:$titl3, resize:true}, 1);
	} 
  // sets a flag that slides should be updated
  gallery.invalidateCurrItems();
  // updates the content of slides
  gallery.updateSize(true);
})['catch'](function (error) {
  console.log(error);//JSON.stringify(error));
  setTimeout(fetchUnsplash, 3000);
});
}
