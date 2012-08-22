/**
 * @author Kareem Dana
 */

var db = require('/lib/database');

exports.isLoggedIn = function() {
	var loggedIn = false;
	if (Ti.App.Properties.hasProperty("loggedIn")) {
		loggedIn = Ti.App.Properties.getBool("loggedIn");
	}
	
	return loggedIn;
}

exports.login = function(username, password) {
	Ti.API.info("login: Attempting to login " + username + " with password '" + password + "'");
	if (exports.isLoggedIn()) {
		Ti.API.info("login(): Already logged in.");
		return;
	}
	
	var api = require('lib/api');
	api.authenticate(username, password);
	return;
};

exports.logout = function() {
	if (!exports.isLoggedIn()) {
		return true;
	}

	Ti.App.Properties.setBool("loggedIn", false);
	Ti.App.Properties.removeProperty("username");
	Ti.App.Properties.removeProperty("hashedPassword");
	Ti.App.Properties.removeProperty("gameID");
	return true;
}

exports.getUserName = function() {
	if (!exports.isLoggedIn()) {
		return '';
	}
	
	if (Ti.App.Properties.hasProperty("username")) {
		return Ti.App.Properties.getString("username");
	}

	return '';
}

exports.getHashedPassword = function() {
	if (!exports.isLoggedIn()) {
		return '';
	}
	
	if (Ti.App.Properties.hasProperty("hashedPassword")) {
		return Ti.App.Properties.getString("hashedPassword");
	}

	return '';
}
