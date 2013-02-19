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
	bottomLabel.hide();
	topLabel.hide();
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
		topLabel.text = "Sorry no hunts available. Please check back later.";
		topLabel.show();
		if (e.error != 0) {
			alert("There was an error trying to retrieve the hunts. Please try again later.")
		}
		return;
	}
	//Remove all existing rows from picker
	if (huntPicker.columns[0]) {
		var _col = huntPicker.columns[0];
		var len = _col.rowCount;
		for (var x = len-1; x >= 0; x--) {
			var _row = _col.rows[x];
			_col.removeRow(_row);
		}
	}
	
	//Add new rows to picker
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
	
	//Set selected row to activeHunt
	huntPicker.setSelectedRow(0,activeRow,true);
	if(iOS) huntPicker.setSelectionIndicator(true);
	actInd.hide();
	bottomLabel.text = "Selected Hunt: " + hunts[activeRow]['description'] + "\nEnds: " + hunts[activeRow]['endtime'] + "\n\nSwitch to the Map tab to start this hunt.";
	bottomLabel.show();
	db.setActiveHunt(hunts[activeRow]['id']);
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
		visible: false,
		font:{fontSize:'17dp'}
	});	
	
	bottomLabel = Titanium.UI.createLabel({
		color: '#000',
		top: '220dp',
		width: 'auto',
		left: '10dp',
		font:{fontSize:'17dp'}
	});
	
	self.add(topLabel);
	self.add(bottomLabel);
	
	/*if (android) {
		actInd = Titanium.UI.createActivityIndicator({
			top:'10dp', 
			height:'50dp',
			width:'250dp'
		});
	} else {*/
		actInd = Titanium.UI.createActivityIndicator({
			height:'50dp',
			width:Ti.UI.SIZE,
			style: (android) ? Titanium.UI.ActivityIndicatorStyle.DARK : Titanium.UI.iPhone.ActivityIndicatorStyle.DARK,
			font: {fontFamily:'Helvetica Neue', fontSize:'15dp',fontWeight:'bold'},
			color: '#444444',
			message: ' Searching for hunts...'
		});
	//}
	
	huntPicker = Titanium.UI.createPicker({
		top:(android) ? '40dp' : 0,
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
	//if (android) actInd.message = "Searching for hunts...";
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