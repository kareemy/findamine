/**
 * @author Kareem Dana
 */

var baseURL = "http://findaminemo.web709.discountasp.net/API/findamine.svc"

exports.getGameID = function() {
	if (Ti.App.Properties.hasProperty("gameID")) {
		return Ti.App.Properties.getString("gameID");
	}

	return -1;
}

exports.authenticate = function(username, password) {
	Ti.API.info("api.authenticate: Attempting to authenticate with web service.");
	var hashedPassword = Ti.Utils.sha1(password);
	
	var xhr = Ti.Network.createHTTPClient({
    	onload: function() {
			Ti.API.info("api.authenticate: " + this.responseText);
			var json = JSON.parse(this.responseText);
			var value = 1;
			if (json.valid.toLowerCase() == "true") {
				Ti.App.Properties.setString("username", username);
				Ti.App.Properties.setString("hashedPassword", hashedPassword);
				Ti.App.Properties.setString("gameID", json.gameId);
				Ti.App.Properties.setBool("loggedIn", true);
				value = 0;
			}
			Ti.App.fireEvent("apiAuthenticate", {value: value});
    	},
    	onerror: function(e) {
    		Ti.API.info("api.authenticate network error:")
			Ti.API.info("STATUS: " + this.status);
			Ti.API.info("TEXT:   " + this.responseText);
			Ti.API.info("ERROR:  " + e.error);
			Ti.App.fireEvent("apiAuthenticate", {value: 2});
    	},
    	timeout:30000
	});
	var url = baseURL + "/Authenticate?format=json&username=" + username + "&password=" + hashedPassword;
	Ti.API.info("api.authenticate: " + url);
	xhr.open('GET', url);
	xhr.send();
}

exports.getAvailableHunts = function() {
	Ti.API.info("api.getAvailableHunts: Attempting to get ALL available hunts from web service.");
	
	var xhr = Ti.Network.createHTTPClient({
    	onload: function() {
			Ti.API.info("api.getAvailableHunts: " + this.responseText);
			var json = JSON.parse(this.responseText);
			Ti.App.fireEvent("GotHuntsFromWebService", {error: 0, data: json});
			Ti.API.info("json: " + json);
			Ti.API.info(json.length);
			Ti.API.info(json[0].Hunt_ID);
    	},
    	onerror: function(e) {
			Ti.API.info("STATUS: " + this.status);
			Ti.API.info("TEXT:   " + this.responseText);
			Ti.API.info("ERROR:  " + e.error);
			Ti.App.fireEvent("GotHuntsFromWebService", {error: 1, data: {'status': this.status, 'responseText': this.responseText, 'error': e.error}});
    	},
    	timeout:30000
	});
	var authenticate = require('lib/authenticate');
	var gameID = exports.getGameID();
	var username = authenticate.getUserName();
	var hashedPassword = authenticate.getHashedPassword();
	var url = baseURL + "/GetActiveHunts?format=json&gameID=" + gameID + "&username=" + username + "&password=" + hashedPassword;
	Ti.API.info("api.getAvailableHunts: " + url);
	xhr.open('GET', url);
	xhr.send();
}

exports.uploadImage = function(finalClueID, imageData)
{
	Ti.API.info("api.uploadImage: Uploading image. finalClueID = " + finalClueID);
	
	var xhr = Ti.Network.createHTTPClient({
    	onload: function() {
			Ti.API.info(this.responseText);
			alert("hello");
			//var json = JSON.parse(this.responseText);
    	},
    	onerror: function(e) {
			Ti.API.info("STATUS: " + this.status);
			Ti.API.info("TEXT:   " + this.responseText);
			Ti.API.info("ERROR:  " + e.error);
			alert('There was an error retrieving the remote data. Try again.');
    	},
    	timeout:30000
	});
	var authenticate = require('lib/authenticate');
	var gameID = exports.getGameID();
	var username = authenticate.getUserName();
	var hashedPassword = authenticate.getHashedPassword();
	var url = baseURL + "/UploadImage?format=json&clueID=" + finalClueID + "&fileExtension=png" + "&username=" + username + "&password=" + hashedPassword;
	Ti.API.info("api.getAvailableHunts: " + url);
	xhr.open('POST', url);
	xhr.send(imageData);
}
