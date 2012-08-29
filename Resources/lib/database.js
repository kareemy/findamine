/**
 * @author Kareem Dana
 */

var dbVersion = 1;
var dbName = "iSpy_Datastore";

// Update database from oldDbVersion to dbVersion
function updateDatabase(oldDbVersion)
{
	// WRITEME
	Ti.App.Properties.setInt("dbVersion", dbVersion);
	return;
}

// Create database from scratch
function createDatabase()
{
	var db = Titanium.Database.open(dbName);

	// There is no DATETIME data type in SQLite. We can use STRING, INTEGER, or REAL for dates. I chose to use INTEGER.
	db.execute('CREATE TABLE IF NOT EXISTS Hunt (id INTEGER PRIMARY KEY, Description TEXT, ActivationTime INTEGER, ExpirationTime INTEGER, StartTime INTEGER, SolvedTime INTEGER, Solved INTEGER, Picture BLOB, UploadError INTEGER)');
	db.execute('CREATE TABLE IF NOT EXISTS Clue (id INTEGER PRIMARY KEY AUTOINCREMENT, OnlineId INTEGER, HuntId INTEGER, Description TEXT, ClueOrder INTEGER, Latitude REAL, Longitude REAL, StartTime INTEGER, SolvedTime INTEGER, Solved INTEGER, UploadError INTEGER)');
	db.execute('CREATE TABLE IF NOT EXISTS ResearchQuestion (id INTEGER PRIMARY KEY AUTOINCREMENT, OnlineId INTEGER, ClueId INTEGER, QuestionText TEXT, QuestionType TEXT, QuestionOrder INTEGER, Timestamp INTEGER, Answer TEXT, Answered INTEGER)');
	db.execute('CREATE TABLE IF NOT EXISTS Location (id INTEGER PRIMARY KEY AUTOINCREMENT, ClueId Integer, Latitude REAL, Longitude REAL, Accuracy REAL, Timestamp INTEGER, Uploaded INTEGER)');

	db.close();
	
	Ti.App.Properties.setInt("dbVersion", dbVersion);
}

function insertDummyData()
{
	// FIXME: insertDummyData is broken. Values don't match how the database actually is anymore.
	Ti.API.info("insertDummyData(): Inserting Dummy Values into Database.");
	var db = Titanium.Database.open(dbName);
	db.execute('INSERT INTO Hunt VALUES (1, ?, ?, ?, 0, 0, 0, 0)', "Hunt 1", "2012-08-01", "2012-10-01");
	db.execute('INSERT INTO Clue VALUES (1, 1, ?, ?, ?, ?, 0, 0, 0)', "Hunt 1 Clue 1", 1, 30.001, 180.234);
	db.execute('INSERT INTO Clue VALUES (2, 1, ?, ?, ?, ?, 0, 0, 0)', "Hunt 1 Clue 2", 2, 30.101, 180.666);
	db.execute('INSERT INTO ResearchQuestion VALUES (1, 1, "RQ 1 For Clue 1. This is a Test Question", 1, 0, "", 0)');
	db.execute('INSERT INTO ResearchQuestion VALUES (2, 1, "RQ 2 For Clue 1. This is a Test Question 2", 1, 0, "", 0)');
	db.execute('INSERT INTO ResearchQuestion VALUES (3, 1, "RQ 3 For Clue 1. This is a Test Question 3", 1, 0, "", 0)');
	
	db.execute('INSERT INTO ResearchQuestion VALUES (4, 2, "RQ 1 For Clue 2. This is a Test Question 4", 1, 0, "", 0)');
	db.execute('INSERT INTO ResearchQuestion VALUES (5, 2, "RQ 2 For Clue 2. This is a Test Question 5", 1, 0, "", 0)');
	db.execute('INSERT INTO ResearchQuestion VALUES (6, 2, "RQ 3 For Clue 2. This is a Test Question 6", 1, 0, "", 0)');
		
	db.close();
}

function addHuntsToDB(jsonHuntArray)
{
	Ti.API.info("addHuntsToDB(): Adding Hunts to local database.")
	var moment = require('lib/moment.min');
	var db = Titanium.Database.open(dbName);
	Ti.API.info(jsonHuntArray);
	Ti.API.info(jsonHuntArray.length);
	for (var i = 0; i < jsonHuntArray.length; i++) {
		// FIXME: Validate hunt values. (1) Make sure each element exists (2) Put them in the right format
		var momentA = moment(jsonHuntArray[i].Hunt_start_date);
		var momentB = moment(jsonHuntArray[i].Hunt_end_date);
		Ti.API.info("addHuntsToDB start_date: " + jsonHuntArray[i].Hunt_start_date);
		Ti.API.info("addHuntsToDB end_date: " + jsonHuntArray[i].Hunt_end_date);
		var hunt = {id: jsonHuntArray[i].Hunt_ID, 
					Description: jsonHuntArray[i].Hunt_name, 
					ActivationTime: momentA.format("YYYY-MM-DD HH:mm"), 
					ExpirationTime: momentB.format("YYYY-MM-DD HH:mm")
				   	};
		Ti.API.info(hunt);
		var rows = db.execute('SELECT id FROM Hunt WHERE id=?', hunt.id);
		if (rows.rowCount == 1) {
			// Hunt already exists.
			Ti.API.info("addHuntsToDB(): Hunt " + hunt.id + " already exists. Skipping.");
			continue;
		}
		var jsonClueArray = jsonHuntArray[i].Hunt_clues;
		if (jsonClueArray.length == 0) {
			Ti.API.info("addHuntsToDB(): Hunt " + hunt.id + " has no clues. Skipping.");
			continue;
		}
		db.execute('INSERT INTO Hunt VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0)', hunt.id, hunt.Description, hunt.ActivationTime, hunt.ExpirationTime);
		Ti.API.info(db.rowsAffected);
		for (var j = 0; j < jsonClueArray.length; j++) {
			// FIXME: Validate clue values.
			var clue = {OnlineId: jsonClueArray[j].Clue_ID, 
						Description: jsonClueArray[j].Clue_text, 
						ClueOrder: jsonClueArray[j].Clue_order, 
						latitude: jsonClueArray[j].Clue_location_latitude, 
						longitude: jsonClueArray[j].Clue_location_longitude
						};
			db.execute('INSERT INTO Clue VALUES (NULL, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0)', clue.OnlineId, hunt.id, clue.Description, clue.ClueOrder, clue.latitude, clue.longitude);
			clue.id = db.lastInsertRowId;
			
			var jsonQuestionArray = jsonClueArray[j].Clue_questions;
			for (var k = 0; k < jsonQuestionArray.length; k++) {
				// FIXME: Validate question values.
				var question = {OnlineId: jsonQuestionArray[k].Question_ID,
								QuestionText: jsonQuestionArray[k].Question_text,
								QuestionOrder: jsonQuestionArray[k].Question_order,
								QuestionType: jsonQuestionArray[k].Question_type
								};
				db.execute('INSERT INTO ResearchQuestion VALUES (NULL, ?, ?, ?, ?, ?, 0, "", 0)', question.OnlineId, clue.id, question.QuestionText, question.QuestionType, question.QuestionOrder);
			}
		}
	}
	db.close();
}

function getHuntsFromDB()
{
	var db = Titanium.Database.open(dbName);
	
	var resultSet = db.execute("SELECT id, Description, ActivationTime, ExpirationTime from Hunt Where ActivationTime < datetime('now') and ExpirationTime > datetime('now') and Solved = 0");
	var results = [];
	while (resultSet.isValidRow()) {
		results.push({
			id: resultSet.fieldByName('id'),
			description: resultSet.fieldByName('Description'),
			starttime: resultSet.fieldByName('ActivationTime'),
			endtime: resultSet.fieldByName('ExpirationTime')
		});
		resultSet.next();	
	}

	resultSet.close();
	db.close();
	return results;
}

exports.setupDatabase = function() 
{
	if (Ti.App.Properties.hasProperty("dbVersion")) {
		var oldDbVersion = Ti.App.Properties.getInt("dbVersion");
		if (oldDbVersion < dbVersion) {
			Ti.API.info("setupDatabase(): Found database version " + oldDbVersion + ". Updating to database version" + dbVersion + ".");
			updateDatabase(oldDbVersion);
		} else {
			Ti.API.info("setupDatabase(): Database already exists. Doing nothing.");
		}
	} else {
		Ti.API.info("setupDatase(): First time setup. Creating database.");
		createDatabase();
		//insertDummyData();
	}
};

exports.getAvailableHunts = function()
{
	Ti.API.info("getAvailableHunts(): Getting available hunts from web service.");
	var api = require('lib/api');
	Ti.App.addEventListener("GotHuntsFromWebService", function(e) {
		if (e.error == 0) {
			addHuntsToDB(e.data);
		}
		hunts = getHuntsFromDB();
		Ti.API.info("getAvailableHunts(): Firing GotHunts event.");
		Ti.App.fireEvent("GotHunts", {error: e.error, data: hunts});
	})
	api.getAvailableHunts();
};

exports.startHunt = function(huntid)
{
	Ti.API.info("startHunt(): Starting hunt " + huntid);
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Hunt SET StartTime = datetime('now') where id = ?", huntid);
	db.close();
};

exports.finishHunt = function(huntid, finalClueOnlineId, pictureData)
{
	Ti.API.info("finishHunt(): Finishing hunt " + huntid);
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Hunt Set SolvedTime = datetime('now'), Solved = 1, Picture = ? WHERE id = ?", pictureData, huntid);
	db.close();
	var api = require('lib/api');
	api.uploadImage(huntid, finalClueOnlineId, pictureData, true);
};

exports.setActiveHunt = function(huntid)
{
	if (huntid == exports.getActiveHunt()) return;
	Ti.API.info("setActiveHunt(): New active hunt. id: " + huntid + ". Firing newActiveHunt event.");
	Ti.App.Properties.setInt("activeHunt", huntid);	
	Ti.App.fireEvent("newActiveHunt");
};

exports.getActiveHunt = function()
{
	if (Ti.App.Properties.hasProperty("activeHunt")) {
		return Ti.App.Properties.getInt("activeHunt");
	} else {
		return -1;
	}
};

exports.getCurrentClue = function()
{
	var activeHunt = exports.getActiveHunt();
	if (activeHunt == -1) return [];
	
	var db = Titanium.Database.open(dbName);
	
	var resultSet = db.execute("SELECT id, OnlineId, Description, Latitude, Longitude FROM Clue WHERE HuntId = ? and Solved = 0 ORDER BY ClueOrder", activeHunt);
	var clue = [];
	if (resultSet.isValidRow()) {
		clue = {
			id: resultSet.fieldByName('id'),
			OnlineId: resultSet.fieldByName('OnlineId'),
			huntid: activeHunt,
			description: resultSet.fieldByName('Description'),
			latitude: resultSet.fieldByName('Latitude'),
			longitude: resultSet.fieldByName('Longitude')
		};
	}
	resultSet.close();
	db.close();
	
	return clue;
};

exports.startClue = function(clueid)
{
	Ti.API.info("startClue(): Starting clue " + clueid);
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Clue SET StartTime = datetime('now') WHERE id = ?", clueid);
	var resultSet = db.execute("SELECT StartTime FROM Clue WHERE id = ?", clueid);
	Ti.API.info(resultSet.fieldByName('StartTime'));
	db.close();
};

exports.finishClue = function(clueid)
{
	Ti.API.info("finishClue(): Finishing clue " + clueid);
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Clue SET SolvedTime = datetime('now'), Solved = 1 WHERE id = ?", clueid);
	db.close();
};

exports.getResearchQuestions = function(clueid)
{
	Ti.API.info("getResearchQuestions(): Getting research questions.")
	var db = Titanium.Database.open(dbName);
	var resultSet = db.execute("SELECT id, QuestionType, QuestionText FROM ResearchQuestion WHERE ClueId = ? AND Answered = 0 ORDER BY QuestionOrder", clueid);
	var results = [];
	while (resultSet.isValidRow()) {
		results.push({
			id: resultSet.fieldByName('id'),
			questiontype: resultSet.fieldByName('questiontype'),
			questiontext: resultSet.fieldByName('questiontext')
		});
		resultSet.next();	
	}

	resultSet.close();
	db.close();
	return results;
}

exports.saveResearchQuestion = function(rqId, answer)
{
	Ti.API.info("saveResearchQuestions(): Saving Research Question " + rqId);
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE ResearchQuestion SET Timestamp = datetime('now'), Answered = 1, Answer = ? WHERE id = ?", answer, rqId);
	db.close();
};

exports.uploadClueData = function(clueid, retryOnFail)
{
	Ti.API.info("uploadClueData(): Uploading clue data.");
	var db = Titanium.Database.open(dbName);
	var resultSet = db.execute("SELECT OnlineId, StartTime, SolvedTime FROM Clue WHERE id = ?", clueid);
	var clue;
	if (resultSet.isValidRow()) {
		clue = {
			"id": clueid,
			"OnlineId": resultSet.fieldByName("OnlineId"),
			"StartTime": resultSet.fieldByName("StartTime"),
			"SolvedTime": resultSet.fieldByName("SolvedTime")
		}
		clue.locations = [];
		var locationSet = db.execute("SELECT id, Latitude, Longitude, Timestamp FROM Location WHERE ClueId = ? AND Uploaded = 0", clueid);
		while (locationSet.isValidRow()) {
			clue.locations.push({
				"id": locationSet.fieldByName("id"),
				"latitude": locationSet.fieldByName("Latitude"),
				"longitude": locationSet.fieldByName("Longitude"),
				"timestamp": locationSet.fieldByName("Timestamp")
			});
			locationSet.next();
		}
		locationSet.close();
	}
	resultSet.close();
	
	var resultSet = db.execute("SELECT Answer, Timestamp, OnlineId FROM ResearchQuestion WHERE ClueId = ? AND Answered = 1", clueid);
	var questions = [];
	while (resultSet.isValidRow()) {
		questions.push({
			"OnlineId": resultSet.fieldByName('OnlineId'),
			"Answer": resultSet.fieldByName('Answer'),
			"Timestamp": resultSet.fieldByName('Timestamp')
		});
		resultSet.next();
	}
	resultSet.close();
	db.close();
	clue.questions = questions;

	var api = require('lib/api');
	api.uploadClue(clue, retryOnFail);
}

exports.saveLocation = function(clueid, location)
{
	Ti.API.info("saveLocation(): Saving Location");
	var db = Titanium.Database.open(dbName);
	var moment = require('lib/moment.min');
	var locationTimestamp = moment(location.timestamp);
	var formattedLocationTimestamp = locationTimestamp.format("YYYY-MM-DD HH:mm:ss");
	Ti.API.info(formattedLocationTimestamp);
	db.execute("INSERT INTO Location VALUES (NULL, ?, ?, ?, ?, ?, 0)", clueid, location.latitude, location.longitude, location.accuracy, formattedLocationTimestamp);
	db.close();
};

exports.markUploadSuccess = function(clueid, locations)
{
	Ti.API.info("uploadedLocations(): Marking array of locations as uploaded.");
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Clue Set UploadError = 0 WHERE id = ?", clueid);
	for (var i = 0; i < locations.length; i++) {
		db.execute("UPDATE Location SET Uploaded = 1 WHERE id=?", locations[i].id);
	}
	db.close();
}

exports.markUploadImageSuccess = function(huntid)
{
	Ti.API.info("markUploadImageSuccess(): Marking image as successfully uploaded.");
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Hunt SET UploadError = 0 WHERE id=?", huntid);
	db.close();
}

exports.markUploadError = function(clueid)
{
	Ti.API.info("markUploadError(): Marking clue " + clueid + " as a failed upload.");
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Clue SET UploadError = 1 WHERE id = ?", clueid);
	db.close();
}

exports.markUploadImageError = function(huntid)
{
	Ti.API.info("markUploadImageError(): Marking image as failed upload.");
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Hunt SET UploadError = 1 WHERE id=?", huntid);
	db.close();
}

exports.retryUploads = function()
{
	Ti.API.info("retryUploads(): Retrying any failed uploads.");
	var db = Titanium.Database.open(dbName);
	var resultSet = db.execute("SELECT id FROM Clue WHERE Solved = 1 AND UploadError = 1");
	while (resultSet.isValidRow()) {
		exports.uploadClueData(resultSet.fieldByName('id'), true);
		resultSet.next();
	}
	resultSet.close();
	db.close();
}
