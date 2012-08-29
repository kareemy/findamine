/**
 * @author Kareem Dana
 */
Ti.include("/lib/version.js");

function ResearchQuestionsWindow() {
	Ti.API.info("ResearchQuestionsWindow(): Creating New Research Questions window.");
	
	var self = Ti.UI.createWindow({
		title:"Research Questions",
		backgroundColor:'white',
		modal: (android) ? false : true
	});
	
	self.addEventListener('android:back', function(){
		Ti.UI.createAlertDialog({
			title:'Questions Incomplete',
			message:'You must complete the questions before continuing.',
			buttonNames:['Okay'],
			cancel:0
		}).show();
	});
	
	var scrollView = Titanium.UI.createScrollView({
		contentWidth:'100%',
		contentHeight:Ti.UI.SIZE,
		top:0,
		showVerticalScrollIndicator:true,
		showHorizontalScrollIndicator:true,
		layout:'vertical'
	});
	
	var view = Ti.UI.createView({
		borderRadius:0,
		width:'auto',
		height:Ti.UI.SIZE,
		layout:'vertical'
	});
	
	scrollView.add(view);
	
	var button = Ti.UI.createButton({
		height:'44dp',
		width:'200dp',
		title:'Submit',
		top:'10dp',
		bottom:'10dp'
	});

	scrollView.add(button);
	
	button.addEventListener('click', function() {
		Ti.App.fireEvent("researchQuestionsSubmitted");
		self.close();
	});
	
	self.add(scrollView);
	
	return [self, view, button];
};

module.exports = ResearchQuestionsWindow;