document.addEventListener("DOMContentLoaded", function(event) {
		var url = "/cgi-bin/getSSIDList.cgi";
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false);		// false: wait respond
		xmlHttp.send(null);
		console.log(xmlHttp.responseText);
		var ssidList = xmlHttp.responseText;	//SSID 1,SSID 2,SSID3
		var myobject={};
		var segments = ssidList.split(',');
		//console.log(segments[0], segments.length)
		for(var i = 1; i <= segments.length; i++) {
			console.log(segments[i-1]);
			myobject[i] = {
				"ssid": segments[i-1]
			};
		}
		var select = document.getElementById("selectWifi");
		for (index in myobject) {
			select.options[select.options.length] = new Option(myobject[index].ssid, index);
		}
	});

function httpGET(url) {
		console.log("API Query");
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, true);	// false: wait respond
		xmlHttp.send(null);
		return url+" "+xmlHttp.responseText;
}
function saveWiFiSettings() {
		var url = "/cgi-bin/saveWiFiConfig.cgi?" + document.getElementById('username').value + ";" + document.getElementById('password').value;
		document.getElementById('info-div').innerHTML = httpGET(url);
}
function saveBTSettings() {
	var url = "/cgi-bin/saveBTConfig.cgi";
	document.getElementById('info-div').innerHTML = "BT Paired" + httpGET(url);
}
function updateTextBox() {
	var select = document.getElementById("selectWifi");
	if(select.options.length > 0 || select.options[select.selectedIndex].value == 0) {
		console.log("Text: " + select.options[select.selectedIndex].text + "\nValue: " + select.options[select.selectedIndex].value);
		document.getElementById("username").value = select.options[select.selectedIndex].text;
	}
	else if(select.options.length < 0) {
		window.alert("Select box is empty");
	}
}