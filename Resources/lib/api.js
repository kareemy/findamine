/**
 * @author Kareem Dana
 */

var baseURL = "http://findaminemo.web709.discountasp.net/API/findamine.svc"

function makeClueXML(clue) 
{
	var moment = require('lib/moment.min');
	var startTime, solvedTime;
	if (clue.StartTime != 0) {
		startTime = moment(clue.StartTime, "YYYY-MM-DD HH:mm:ss");
	} else {
		startTime = moment(0);
	}
	var formattedStartTime = startTime.format("MM/DD/YYYY hh:mm:ss a");
	
	if (clue.SolvedTime != 0) {
		solvedTime = moment(clue.SolvedTime, "YYYY-MM-DD HH:mm:ss");
	} else {
		solvedTime = moment(0);
	}
	var formattedSolvedTime = solvedTime.format("MM/DD/YYYY hh:mm:ss a");

	var xml = "<ArrayOfCompletedClue xmlns=\"http://www.findamine.mobi/API\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
	xml += "<CompletedClue>";
	
	// Add array of locations
	xml += "<CompletedClue_breadcrumbs>";
	for (var i = 0; i < clue.locations.length; i++) {
		var locationTimestamp = moment(clue.locations[i].timestamp, "YYYY-MM-DD HH:mm:ss");
		var formattedLocationTimestamp = locationTimestamp.format("MM/DD/YYYY hh:mm:ss a");
		Ti.API.info(clue.locations[i].timestamp);
		Ti.API.info(locationTimestamp);
		Ti.API.info(formattedLocationTimestamp);
		xml += "<Breadcrumb>";
		xml += "<Breadcrumb_latitude>" + clue.locations[i].latitude + "</Breadcrumb_latitude>";
		xml += "<Breadcrumb_longitude>" + clue.locations[i].longitude + "</Breadcrumb_longitude>";
		xml += "<Breadcrumb_timestamp>" + formattedLocationTimestamp + "</Breadcrumb_timestamp>";
		xml += "</Breadcrumb>";
	}
	xml += "</CompletedClue_breadcrumbs>";
	
	// General clue properties
	xml += "<CompletedClue_clue_ID>" + clue.OnlineId + "</CompletedClue_clue_ID>";
	xml += "<CompletedClue_date_finished>" + formattedSolvedTime + "</CompletedClue_date_finished>";
	xml += "<CompletedClue_date_started>" + formattedStartTime + "</CompletedClue_date_started>";
	xml += "<CompletedClue_hint_level></CompletedClue_hint_level>";
	xml += "<CompletedClue_hot_cold_level></CompletedClue_hot_cold_level>";
	xml += "<CompletedClue_location_order></CompletedClue_location_order>";
	xml += "<CompletedClue_location_started></CompletedClue_location_started>";
	xml += "<CompletedClue_points_earned></CompletedClue_points_earned>";
	
	// Add array of question responses
	xml += "<CompletedClue_question_responses>";
	for (var i = 0; i < clue.questions.length; i++) {
		var questionTimestamp = moment(clue.questions[i].Timestamp);
		var formattedQuestionTimestamp = questionTimestamp.format("MM/DD/YYYY hh:mm:ss a");
		xml += "<QuestionResponse>";
		xml += "<QuestionResponse_answer_boolean></QuestionResponse_answer_boolean>";
		xml += "<QuestionResponse_answer_integer></QuestionResponse_answer_integer>";
		xml += "<QuestionResponse_answer_text>" + clue.questions[i].Answer + "</QuestionResponse_answer_text>";
		xml += "<QuestionResponse_date_answered>" + formattedQuestionTimestamp + "</QuestionResponse_date_answered>";
		xml += "<QuestionResponse_question_ID>" + clue.questions[i].OnlineId + "</QuestionResponse_question_ID>";
		xml += "</QuestionResponse>";
	}
	xml += "</CompletedClue_question_responses>";
	xml += "<CompletedClue_share_level></CompletedClue_share_level>";
	xml += "</CompletedClue></ArrayOfCompletedClue>";
	return xml;
}

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
			if ("code" in json) { // json.hasOwnProperty("code")
				// This means we successfully got data from the web service, but it returned an error
				Ti.App.fireEvent("GotHuntsFromWebService", {error: 1, data: {'code': json.code, 'domain': json.domain, 'fullDescription': json.fullDescription, 'localizedDescription': json.localizedDescription}});
			} else {
				Ti.App.fireEvent("GotHuntsFromWebService", {error: 0, data: json});
			}
    	},
    	onerror: function(e) {
			Ti.API.info("STATUS: " + this.status);
			Ti.API.info("TEXT:   " + this.responseText);
			Ti.API.info("ERROR:  " + e.error);
			Ti.App.fireEvent("GotHuntsFromWebService", {error: 2, data: {'status': this.status, 'responseText': this.responseText, 'error': e.error}});
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

exports.uploadImage = function(huntid, finalClueOnlineId, imageData, retryOnFail)
{
	Ti.API.info("api.uploadImage: Uploading image. finalClueOnlineId = " + finalClueOnlineId);
	var db = require('lib/database');
	
	var xhr = Ti.Network.createHTTPClient({
    	onload: function() {
			Ti.API.info(this.responseText);
			Ti.API.info("api.uploadImage(): Upload success.")
			db.markUploadImageSuccess(huntid);
    	},
    	onerror: function(e) {
			Ti.API.info("STATUS: " + this.status);
			Ti.API.info("TEXT:   " + this.responseText);
			Ti.API.info("ERROR:  " + e.error);
			if (retryOnFail) {
				db.markUploadImageError(huntid);
			}
    	},
    	timeout:30000
	});
	var authenticate = require('lib/authenticate');
	var username = authenticate.getUserName();
	var hashedPassword = authenticate.getHashedPassword();
	var url = baseURL + "/UploadImage?clueID=" + finalClueOnlineId + "&fileExtension=png&username=" + username + "&password=" + hashedPassword;
	Ti.API.info("api.getAvailableHunts: " + url);
	xhr.open('POST', url);
	xhr.setRequestHeader("Content-Type", "text/plain");
	//xhr.setRequestHeader("Content-Length", imageData.size);
	xhr.send(imageData);
}

exports.uploadClue = function(clue, retryOnFail) 
{
	Ti.API.info("api.uploadClue: Uploading clue to web service.");
	var db = require('lib/database');
	
	var xhr = Ti.Network.createHTTPClient({
    	onload: function() {
			Ti.API.info(this.responseText);
			Ti.API.info("api.uploadClue(): Upload success.");
			db.markUploadSuccess(clue.id, clue.locations);
    	},
    	onerror: function(e) {
			Ti.API.info("STATUS: " + this.status);
			Ti.API.info("TEXT:   " + this.responseText);
			Ti.API.info("ERROR:  " + e.error);
			if (retryOnFail) {		
				db.markUploadError(clue.id);
			}
    	},
    	timeout:30000
	});
	var authenticate = require('lib/authenticate');
	var username = authenticate.getUserName();
	var hashedPassword = authenticate.getHashedPassword();
	var url = baseURL + "/UpdateData?username=" + username + "&password=" + hashedPassword;
	Ti.API.info("api.uploadClue: " + url);
	xhr.open('POST', url);
	xhr.setRequestHeader("Content-Type", "application/xml; charset=utf-8");
	//xhr.setRequestHeader("Content-Length", clue.length);
	//xhr.setRequestHeader("SOAPAction", url);
	var buffer = Ti.createBuffer({value: makeClueXML(clue)});
	xhr.send(buffer.toBlob());
	Ti.API.info(buffer.toBlob());
}
