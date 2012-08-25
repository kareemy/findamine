/**
 * @author Kareem Dana
 */

var self, db, mapview, backgroundLabel, clueLabel, hotColdImage;
var firstlocation;
var clue = [];
var currentLocation;
var tabGroup;
var ResearchQuestionsWindow, rqWindow, rqView, rqSubmitButton;
var sliderValues = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
var android_toolbar_setup = false;
var answeredResearchQuestions = false;
var currentClue;

Ti.include("/lib/version.js");

function updateResearchQuestions()
{
	var rqArray = db.getResearchQuestions(clue.id);
	Ti.API.info("UpdateResearchQuestions(): " + rqArray.length + " research questions available.");
	if (rqArray.length == 0) {
		return;
	}
	// FIXME: Handle heights better
	var tempTop = 130 * rqArray.length + 15;
	rqSubmitButton.top = tempTop + 'dp';
	rqView.height = tempTop + 100;
	var labels = [];
	var children = rqView.getChildren();
	for (var i = 0; i < children.length; i++) {
		if (children[i].title && children[i].title === "Submit") continue;
		rqView.remove(children[i]);
	}
	
	for (var i = 0; i < rqArray.length; i++) {
		var top = 130*i;
		if (i > 0) {
			var hr = Titanium.UI.createView({
				width: '100%',
				height: 1,
				borderWidth: 1,
				borderColor: "black",
				top:top
			});
			rqView.add(hr);
			top = top + 1;
		}
		var questionLabel = Titanium.UI.createLabel({
			text: rqArray[i].questiontext,
			height:75,
			width:'auto',
			font: {fontSize: 14},
			top:top + 'dp'
		});
		rqView.add(questionLabel);
		var slider;
		// FIXME: Handle question types properly
		//if (rqArray[i].questiontype == 1) {
			tempTop = top+80;
			labels[i] = Titanium.UI.createLabel({
				text:'Neutral',
				top:tempTop + 'dp'
			});
			tempTop = top+100;
			slider = Titanium.UI.createSlider({
				min:1,
				max:5,
				value:3,
				width:'300dp',
				height:'auto',
				top:tempTop + 'dp',
				oldvalue:-1,
				id:rqArray[i].id,
				labelid:i
			});
			slider.addEventListener('change', function(e) {
				if (Math.round(e.value) != e.source.oldvalue) {
					Ti.API.info("slider " + e.source.id + " has a value of " + Math.round(e.value));
					db.saveResearchQuestion(e.source.id, sliderValues[Math.round(e.value)-1]);
					e.source.oldvalue = Math.round(e.value);
					labels[e.source.labelid].text = sliderValues[Math.round(e.value)-1];
				}
			});
			rqView.add(labels[i]);
			rqView.add(slider);
		//}
	}

	Ti.App.addEventListener("researchQuestionsSubmitted", function(e) {
		db.startClue(clue.id);
		db.uploadClueData(clue.id, false);
		Ti.API.info("height: ", clueLabel.size.height);
		var newHeight = clueLabel.size.height;
		backgroundLabel.height = newHeight + 'dp';
	});
	
	rqWindow.open();
};

function fireUpTheCamera() {
	Titanium.Media.showCamera({
	
		success:function(event)
		{
			var cropRect = event.cropRect;
			var image = event.media;
	
			Ti.API.info('fireUpTheCamera(): Successfully took picture. Our type was: '+event.mediaType);
			if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO)
			{
				// FIXME: Verify that camera operation works and it saves image properly
				Ti.API.info("Got picture. Finishing hunt and saving image");
				Ti.API.info("Picture size: " + image.width + "x" + image.height);
				var maxsize = Math.max(image.width, image.height);
				var multiplier = (maxsize / 400) + 1;
				var resizedImage = image.imageAsResized(image.width / multiplier, image.height / multipler);
				db.finishHunt(clue.OnlineId, clue.huntid, resizedImage);
				Ti.App.fireEvent('forceHuntRefresh');
				tabGroup.setActiveTab(0); // Go back to SelectHunt tab
				/*
				var imageView = Ti.UI.createImageView({
					width:win.width,
					height:win.height,
					image:event.media
				});
				win.add(imageView);
				*/
			}
			else
			{
				alert("Camera had an error taking the picture. Please report this.");
			}
		},
		cancel:function()
		{
		},
		error:function(error)
		{
			// create alert
			var a = Titanium.UI.createAlertDialog({title:'Camera'});
	
			// set message
			if (error.code == Titanium.Media.NO_CAMERA)
			{
				a.setMessage('Please run this test on device');
			}
			else
			{
				a.setMessage('Unexpected error: ' + error.code);
			}
	
			// show alert
			a.show();
		},
		saveToPhotoGallery:false,
		allowEditing:false,
		mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
	});
}

function distance(lat1, lon1, lat2, lon2)
{
	var R = 6378100; // radius of earth in metters
	var d = Math.acos(Math.sin(lat1)*Math.sin(lat2) + 
                  Math.cos(lat1)*Math.cos(lat2) *
                  Math.cos(lon2-lon1)) * R;
    return d;
}

function switchToNewClue() {
	updateResearchQuestions();
	clueLabel.text = clue['description'];
	currentClue = clue.id;
	Ti.API.info("switchToNewClue(): debug? " + debug);
	if (debug) {
		var d = distance(clue.latitude, clue.longitude, currentLocation.latitude, currentLocation.longitude);
		clueLabel.text = clueLabel.text + "\nlat: " + Math.floor(currentLocation.latitude * 1000) / 1000 
							+ " lon: " + Math.floor(currentLocation.longitude * 1000) / 1000 
							+ " acc: " + currentLocation.accuracy + "m d: " + Math.floor(d * 1000) / 1000 + "m";
		//newHeight += 40;
	}
}

function updateHotColdImage() {
	var d = distance(clue.latitude, clue.longitude, currentLocation.latitude, currentLocation.longitude);
	if (d < 65) {
		hotColdImage.image = "/images/sizzling.png";
	} else if (d < 150) {
		hotColdImage.image = "/images/hot.png";
	} else if (d < 300) {
		hotColdImage.image = "/images/warm.png"
	} else if (d < 500) {
		hotColdImage.image = "/images/cool.png";
	} else {
		hotColdImage.image = "/images/cold.png"
	}
}

function updateMapWindow() {
	Ti.API.info("updateMapWindow(): Updating Map Window.")
	var newClue = db.getCurrentClue();
	// FIXME: No clue, but hunt not solved yet = show camera?
	if (newClue.length == 0) return;
	if (clue.length != 0 && clue.id == newClue.id) {
		Ti.API.info("updateMapWindow(): Still on same clue. No update needed.");
		return;
	}
	clue = newClue;
	
	Ti.API.info("updateMapWindow(): New current clue: ");
	Ti.API.info(clue);
	
	var founditButton = Titanium.UI.createButton({
			title:'Found It!'
	});
	if (!android) {
		founditButton.style = Titanium.UI.iPhone.SystemButtonStyle.BORDERED;
	}
	
	founditButton.addEventListener('click', function() {
		var d = distance(clue.latitude, clue.longitude, currentLocation.latitude, currentLocation.longitude);
		Ti.API.info("Found it clicked: Distance from clue ", d);
		d = 10; // FIXME: Delete this
		if (d < 100) {
			// Found it
			currentClue = -1;
			db.finishClue(clue.id);
			db.uploadClueData(clue.id, true);
			clue = db.getCurrentClue();
			if (clue.length == 0) {
				// Final clue show camera
				var alertDialog = Titanium.UI.createAlertDialog({
					title: 'Found It',
					message: 'Congratulations. You found the final clue. Hit OK to take a picture of it.',
					buttonNames: ['OK']
				});
				alertDialog.addEventListener('click', function(ev){
					Ti.API.info("Clicked OK. Moving to camera view");
					fireUpTheCamera();
				});
				alertDialog.show();
			} else {
				// Another clue to move to
				var alertDialog = Titanium.UI.createAlertDialog({
					title: 'Found It',
					message: 'You found the clue! Hit OK to move to the next clue.',
					buttonNames: ['OK']
				});
				alertDialog.addEventListener('click', function(ev){
					Ti.API.info("Clicked OK. Moving to new clue");
					switchToNewClue();
				});
				alertDialog.show();
			}
		} else {
			// Didn't find clue yet
			var alertDialog = Titanium.UI.createAlertDialog({
				title: 'Sorry',
				message: 'Sorry you have not found the clue yet. Keep trying.',
				buttonNames: ['OK']
			});
			alertDialog.show();
		}
	});
	
	var flexSpace = (android) ? Ti.UI.createView({width:'100dp'}) : Ti.UI.createButton({systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE});
	
	updateHotColdImage();
	
	self.setToolbar([hotColdImage, flexSpace, founditButton]);
}

function MapWindow(tab) {
	tabGroup = tab;
	ResearchQuestionsWindow = require('ui/common/ResearchQuestionsWindow');
	db = require('lib/database');
	var blah = new ResearchQuestionsWindow();
	rqWindow = blah[0];
	rqView = blah[1];
	rqSubmitButton = blah[2];
	currentClue = -1;
	
	function translateErrorCode(code) {
		if (code == null) {
			return null;
		}
		switch (code) {
			case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
				return "Location unknown";
			case Ti.Geolocation.ERROR_DENIED:
				return "Access denied";
			case Ti.Geolocation.ERROR_NETWORK:
				return "Network error";
			case Ti.Geolocation.ERROR_HEADING_FAILURE:
				return "Failure to detect heading";
			case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
				return "Region monitoring access denied";
			case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
				return "Region monitoring access failure";
			case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
				return "Region monitoring setup delayed";
		}
	}
	
	Ti.API.info("MapWindow(): Creating Map Window.")
	firstlocation = false;
	
	self = Ti.UI.createWindow({
		title:"Map",
		backgroundColor:'white'
	});
	if (!android) {
		self.hideNavBar();
	} else {
		self.setToolbar = function(buttons) {
			if (android_toolbar_setup) return;
			var toolbarView = Ti.UI.createView({
				width: '100%',
				height: '50dp',
				bottom: 0,
				backgroundGradient: {
           			type: 'linear',
            		startPoint: { x: '0%', y: '0%' },
            		endPoint: { x: '0%', y: '100%' },
            		colors: [ { color: '#3366FF', offset: 0.0}, {color: '#002EB8', offset: 1.0} ],
        		}
			});
			var subView = Ti.UI.createView({
				layout: 'horizontal',
				width: Ti.UI.SIZE
			});
			toolbarView.add(subView);
			for (var i = 0; i < buttons.length; i++) {
				subView.add(buttons[i]);
			}
			self.add(toolbarView);
			mapview.setBottom(toolbarView.getHeight());
			android_toolbar_setup = true;
		}
	}
	
	hotColdImage = Titanium.UI.createImageView({
		image:'/images/cool.png'
	});
	
	backgroundLabel = Titanium.UI.createLabel({
		top:0,
		height:'66dp',
		width:'320dp',
		opacity:0.5,
		backgroundColor:'black',
		text:'   '
	});
	clueLabel = Titanium.UI.createLabel({
		top:0,
		height:'auto',
		width:'320dp',
		color:'white',
		font:{fontSize: 16},
		text:'Please select a new hunt. No clues available.'
	});
	
    mapview = Titanium.Map.createView({
        mapType: Titanium.Map.HYBRID_TYPE,
        region: {latitude:33.74511, longitude:-84.38993, 
                latitudeDelta:0.01, longitudeDelta:0.01},
        animate:true,
        regionFit:true,
        userLocation:true
    });
    
    // Default currentLocation for android
    currentLocation = {latitude:0, longitude:0, accuracy:-1, timestamp:0};
    
	Ti.Geolocation.preferredProvider = "gps";
	Ti.Geolocation.purpose = "Location needed to play the scavenger hunt game.";
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_NEAREST_TEN_METERS;
	Titanium.Geolocation.distanceFilter = 1;
	
	var locationCallback = function(e)
	{
			if (!e.success || e.error)
			{
				Ti.API.info("Code translation: "+translateErrorCode(e.code));
				return;
			}
			
			var longitude = e.coords.longitude;
			var latitude = e.coords.latitude;
			var accuracy = e.coords.accuracy;
			var timestamp = e.coords.timestamp;
			Ti.API.info("Location Updated: latitude: " + latitude + " longitude: " + longitude + " accuracy: " + accuracy + " ts: " + timestamp);
			if (firstlocation == false) {
				mapview.region = {latitude:latitude, longitude:longitude,latitudeDelta:0.01, longitudeDelta:0.01};
				firstlocation = true;
			}
			currentLocation = {latitude:latitude, longitude:longitude, accuracy:accuracy, timestamp:timestamp};
			Ti.API.info("currentClue: " + currentClue);
			if (currentClue != -1) {
				db.saveLocation(currentClue, currentLocation);
			}
	};
	
	Titanium.Geolocation.addEventListener('location', locationCallback);
  
    self.add(mapview);
	self.add(backgroundLabel);
	self.add(clueLabel);
	self.addEventListener("open", function() {
		Ti.API.info("MapWindow(): Opening Map Window.");
		switchToNewClue();
	});
	
	Ti.App.addEventListener("newActiveHunt", updateMapWindow);
	updateMapWindow();
	
	return self;
};

module.exports = MapWindow;