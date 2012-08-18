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
	db.execute('CREATE TABLE IF NOT EXISTS Hunt (id INTEGER PRIMARY KEY, Description TEXT, ActivationTime INTEGER, ExpirationTime INTEGER, StartTime INTEGER, SolvedTime INTEGER, Solved INTEGER, Picture BLOB)');
	db.execute('CREATE TABLE IF NOT EXISTS Clue (id INTEGER PRIMARY KEY, HuntId INTEGER, Description TEXT, ClueOrder INTEGER, Latitude REAL, Longitude REAL, StartTime INTEGER, SolvedTime INTEGER, Solved INTEGER)');
	db.execute('CREATE TABLE IF NOT EXISTS ResearchQuestion (id INTEGER PRIMARY KEY, ClueId INTEGER, QuestionText TEXT, QuestionType INTEGER, Timestamp INTEGER, Answer TEXT, Answered INTEGER)');
	db.execute('CREATE TABLE IF NOT EXISTS Location (Latitude REAL, Longitude REAL, Accuracy REAL, Timestamp INTEGER, Uploaded INTEGER)');

	db.close();
	
	Ti.App.Properties.setInt("dbVersion", dbVersion);
}

function insertDummyData()
{
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
		insertDummyData();
	}
};

exports.getAvailableHunts = function()
{
	var db = Titanium.Database.open(dbName);
	
	var resultSet = db.execute("SELECT id, Description, ActivationTime, ExpirationTime from Hunt Where ActivationTime < date('now') and ExpirationTime > date('now')");
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
};

exports.startHunt = function(huntid)
{
	Ti.API.info("startHunt(): Starting hunt " + huntid);
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Hunt SET StartTime = date('now') where id = ?", huntid);
	db.close();
};

exports.finishHunt = function(huntid, pictureData)
{
	Ti.API.info("finishHunt(): Finishing hunt " + huntid);
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Hunt Set SolvedTime = date('now'), Solved = 1, Picture = ? WHERE id = ?", pictureData, huntid);
	db.close();
};

exports.setActiveHunt = function(huntid)
{
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
	
	var resultSet = db.execute("SELECT id, Description, Latitude, Longitude FROM Clue WHERE HuntId = ? and Solved = 0 ORDER BY ClueOrder", activeHunt);
	var clue = [];
	if (resultSet.isValidRow()) {
		clue = {
			id: resultSet.fieldByName('id'),
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
	db.execute("UPDATE Clue SET StartTime = date('now') WHERE id = ?", clueid);
	db.close();
};

exports.finishClue = function(clueid)
{
	Ti.API.info("finishClue(): Finishing clue " + clueid);
	var db = Titanium.Database.open(dbName);
	db.execute("UPDATE Clue SET SolvedTime = date('now'), Solved = 1 WHERE id = ?", clueid);
	db.close();
};

exports.getResearchQuestions = function(clueid)
{
	Ti.API.info("getResearchQuestions(): Getting research questions.")
	var db = Titanium.Database.open(dbName);
	var resultSet = db.execute("SELECT id, QuestionType, QuestionText FROM ResearchQuestion WHERE ClueId = ?", clueid);
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
	db.execute("UPDATE ResearchQuestion SET Timestamp = date('now'), Answered = 1, Answer = ? WHERE id = ?", answer, rqId);
	db.close();
};

exports.saveLocation = function(location)
{
	Ti.API.info("saveLocation(): Saving Location");
	var db = Titanium.Database.open(dbName);
	db.execute("INSERT INTO Location VALUES (?, ?, ?, ?, 0)", location.latitude, location.longitude, location.accuracy, location.timestamp);
	db.close();
};
