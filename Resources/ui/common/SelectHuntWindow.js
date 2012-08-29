/**
 * @author Kareem Dana
 */

var self;
var huntPicker, topLabel, bottomLabel, actInd;

Ti.include("/lib/version.js");

function ForceHuntRefresh()
{
	var db = require('lib/database');
	huntPicker.hide();
	actInd.show();
	db.getAvailableHunts();
}

function RefreshHuntPicker(e)
{
	Ti.API.info("RefreshHuntPicker(): Available Hunts: ");
	var db = require('lib/database');
	var hunts = e.data;
	Ti.API.info(hunts);
	
	var activeHunt = db.getActiveHunt();
	
	if (hunts.length == 0) {
		actInd.hide();
		bottomLabel.hide();
		topLabel.text = "Sorry no hunts available. Please check back later.";
		topLabel.show();
		if (e.error != 0) {
			alert("There was an error trying to retrieve the hunts. Please try again later.")
		}
		return;
	} 
	
	if (huntPicker.columns[0]) {
		var _col = huntPicker.columns[0];
		var len = _col.rowCount;
		for (var x = len-1; x >= 0; x--) {
			var _row = _col.rows[x];
			_col.removeRow(_row);
		}
	}
	
	var activeRow = 0;
	for (var i = 0; i < hunts.length; i++) {
		var row = Ti.UI.createPickerRow({
			title:hunts[i]['description'],
			huntid:hunts[i]['id'],
			starttime:hunts[i]['starttime'],
			endtime:hunts[i]['endtime']
		});
		huntPicker.add(row);
		if (hunts[i]['id'] == activeHunt) activeRow = i;
	}
	
	huntPicker.selectionIndicator = true;
	huntPicker.setSelectedRow(0,activeRow,true);
	bottomLabel.text = "Selected Hunt: " + hunts[activeRow]['description'] + "\nEnds: " + hunts[activeRow]['endtime'] + "\n\nSwitch to the Map tab to start this hunt.";
	bottomLabel.show();
	db.setActiveHunt(hunts[activeRow]['id']);
	
	actInd.hide();
	huntPicker.show();
}

function SetupSelectHuntWindow()
{
	Ti.API.info("SetupSelectHuntWindow(): Setting up or changing Select Hunt Window.");
	var auth = require('lib/authenticate');
	var db = require('lib/database');

	if (!auth.isLoggedIn()) {
		Ti.API.info("SetupSelectHuntWindow(): User is not logged in.");
		return;
	}
	
	topLabel = Titanium.UI.createLabel({
		color: '#000',			
		top:'10dp',
		left:'10dp',
		width:'auto',
		visible: false
	});	
	
	bottomLabel = Titanium.UI.createLabel({
		color: '#000',
		top: '220dp',
		width: 'auto',
		left: '10dp'
	});
	
	self.add(topLabel);
	self.add(bottomLabel);
	
	if (android) {
		actInd = Titanium.UI.createActivityIndicator({
			bottom:10, 
			height:50,
			width:150
		});
	} else {
		actInd = Titanium.UI.createActivityIndicator({
			top:'10dp', 
			height:'50dp',
			height:'50dp',
			width:'auto',
			style: Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
			font: {fontFamily:'Helvetica Neue', fontSize:15,fontWeight:'bold'},
			color: 'black',
			message: 'Searching for hunts...'
		});
	}
	
	huntPicker = Titanium.UI.createPicker({
		top:0,
		visible: false
	});
	self.add(huntPicker);
	
	huntPicker.addEventListener('change',function(e)
	{
		bottomLabel.text = "Selected Hunt: " + e.row.title + "\nEnds: " + e.row.endtime + "\n\nSwitch to the Map tab to start this hunt.";
		db.setActiveHunt(e.row.huntid);	
	});
	
	self.add(actInd);
	actInd.show();
	if (android) actInd.message = "Searching for hunts...";
	Ti.App.addEventListener("GotHunts", RefreshHuntPicker);
	db.getAvailableHunts();
}

function SelectHuntWindow() {
	Ti.API.info("SelectHuntWindow(): Creating Select Hunt Window.")
	self = Ti.UI.createWindow({
		title:"Select Hunt",
		backgroundColor:'white'
	});
	
	var auth = require('lib/authenticate');
	if (!auth.isLoggedIn()) {
		Ti.API.info("SelectHuntWindow(): User not logged in, adding loggedIn event listener.");
		Ti.App.addEventListener('loggedIn', SetupSelectHuntWindow);
	} else {
		SetupSelectHuntWindow();
	}
	
	Ti.App.addEventListener('forceHuntRefresh', ForceHuntRefresh)
	Ti.App.addEventListener('resume', function() {
		Ti.API.info("App Resumed. Checking if new hunts available");
		ForceHuntRefresh();
	});
	
	return self;
};

module.exports = SelectHuntWindow;