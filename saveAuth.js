document.addEventListener("DOMContentLoaded", function(event) {
		var url = "/cgi-bin/getSSIDList.cgi";
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);	// false: wait respond
		xmlHttp.send(null);
		console.log(xmlHttp.responseText);
		var myobject = {
			ValueA: 'Text A',
			ValueB: 'Text B',
			ValueC: 'Text C'
		};
		var select = document.getElementById("selectWifi");
		for (index in myobject) {
			select.options[select.options.length] = new Option(myobject[index], index);
		}
	});

function httpGET(url) {
		console.log("API Query");
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, true);	// false: wait respond
		xmlHttp.send(null);
		return url+" "+xmlHttp.responseText;
}
function saveSettings() {
		var url = "/cgi-bin/saveAuthConfig.cgi?" + document.getElementById('username').value + ";" + document.getElementById('password').value;
		document.getElementById('info-div').innerHTML = httpGET(url);
}
