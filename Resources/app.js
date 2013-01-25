/*
 * A tabbed application, consisting of multiple stacks of windows associated with tabs in a tab group.  
 * A starting point for tab-based application with multiple top-level windows. 
 * Requires Titanium Mobile SDK 1.8.0+.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */

//bootstrap and check dependencies
if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

// This is a single context application with mutliple windows in a stack
(function() {
	Ti.include('/lib/version.js');
	Ti.API.info("app.js main(): Starting Application.");
	if (android) {
		if (tablet) {
			Ti.API.info("app.js main(): Running on an Android Tablet.");
		} else {
			Ti.API.info("app.js main(): Running on an Android Smartphone.");
		}
	} else if (iPhone) {
		Ti.API.info("app.js main(): Running on an iPhone.");
	} else if (iPad) {
		Ti.API.info("app.js main(): Running on an iPad.")
	}
	
	
	// Setup database
	var db = require('lib/database');
	db.setupDatabase();
	
	var authenticate = require('lib/authenticate');
	
	Ti.App.addEventListener("pause", function() {
		Ti.API.info("app.js main(): Application Entered Background.");
		if (authenticate.isLoggedIn()) {
			var currentClue = db.getCurrentClue();
			if (currentClue.hasOwnProperty('id')) {
				db.uploadClueData(currentClue.id, false);
			}
			db.retryUploads();
		}
	});
	
	var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	var appWindow = new ApplicationTabGroup();
	if (android) {
		Ti.App.addEventListener("loggedIn", function() {
			Ti.API.info("app.js main(): ANDROID loggedIn event triggered. Opening applicationTabGroup");
			appWindow.open();
		});
	} else {
		appWindow.open();
	}
	
	if (!authenticate.isLoggedIn()) {	
		Ti.API.info("app.js main(): User is not logged in. Showing modal login window.");
		var LoginWindow = require('ui/common/LoginWindow');
		var w = new LoginWindow();
		w.open();
	} else {
		if (android) {
			appWindow.open();
		}
	}
	
})();
