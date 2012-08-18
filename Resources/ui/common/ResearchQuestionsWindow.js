/**
 * @author Kareem Dana
 */
Ti.include("/lib/version.js");

function ResearchQuestionsWindow() {
	Ti.API.info("ResearchQuestionsWindow(): Creating New Research Questions window.");
	
	var self = Ti.UI.createWindow({
		title:"Research Questions",
		backgroundColor:'white',
		modal: true
	});
	
	var scrollView = Titanium.UI.createScrollView({
		contentWidth:'auto',
		contentHeight:'auto',
		top:0,
		showVerticalScrollIndicator:true,
		showHorizontalScrollIndicator:true
	});
	
	var view = Ti.UI.createView({
		backgroundColor:'white',
		borderRadius:0,
		width:'auto',
		height:'500dp',
		top:0
	});
	
	scrollView.add(view);
	
	var button = Ti.UI.createButton({
		height:'44dp',
		width:'200dp',
		title:'Submit',
		top:'100dp'
	});

	view.add(button);
	
	button.addEventListener('click', function() {
		//FIXME: Save answers here
		self.close();
	});
	
	self.add(scrollView);
	
	return [self, view, button];
};

module.exports = ResearchQuestionsWindow;