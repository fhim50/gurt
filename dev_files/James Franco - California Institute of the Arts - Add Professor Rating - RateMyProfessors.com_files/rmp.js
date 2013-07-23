//RMP Legal Text above submit button
function acknowledge(text){
	var ackMessage = "<p> By clicking the '"+text+"' button, I acknowledge that I have read and agreed to the Rate My Professors <a href='/site_guidelines.jsp'  target='_parent'>Site Guidelines</a>, <a href='/TermsOfUse_us.jsp'  target='_blank'>Terms of Use</a> and <a href='/PrivacyPolicy_us.jsp'  target='_blank'>Privacy Policy</a>. Submitted data becomes the property of RateMyProfessors.com.  IP addresses are logged.</p>";
	document.getElementById('ackText').innerHTML = ackMessage; 
	
}
function defaultTextInputSwap(ele,defaultText,defaultTextColor) {
	// If form item with "id" is null
	// Place "defaultText" into "ele"
	// If "ele"'s value is "defaultText", value disappears when "ele" gains focus
	// and form item color is set back to "defaultTextColor"
	var elem = $(ele);
	if (elem.value == "" || defaultText) {
		elem.style.color = "gray";
		elem.value = defaultText;
		elem.observe('focus', function() {
			elem.style.color = defaultTextColor;
			if (elem.value == defaultText) {
				elem.value = "";
			};
		});	
		elem.observe('blur', function() {
			elem.style.color = "gray";
		});
	};
};

// Even out the height of Additional Feature boxes on the front page
function evenHeights(wrap,containerType,container) {
	var height = $(wrap).offsetHeight;
	if (containerType == 'class') {
	   	$(wrap).getElementsByClassName(container).each(function(element) {
			element.style.height = height;
		});
	};
	if (containerType == 'id') {
		$(container).style.height = height;
	}
}

// Assign class name 'first' to first list item in boxes on front page
function classForFirstLi(wrap,container,nOfItems) {
	$(wrap).getElementsByClassName(container).each(function(j) {
		$A(j.getElementsByTagName('li')).each(function(k,index) {
			if (index % nOfItems == 0) k.addClassName('first');
		});
	});
};

// Assign class name 'even' to every even-colored row
// Assumes the first row is a header row
function alternateTableRows(tableID,classN) {
	if($(tableID)) {
		var trArray = $A($(tableID).getElementsByTagName('tr'));
		var l=trArray.length;
		for (var i=0; i < l; i++) {
			if(i % 2 == 1) {
				trArray[i].className += (" " + classN);
			};
		};
	};
}

// CSS Browser Selector   v0.2.5
// Documentation:         http://rafael.adm.br/css_browser_selector
// License:               http://creativecommons.org/licenses/by/2.5/
// Author:                Rafael Lima (http://rafael.adm.br)
// Contributors:          http://rafael.adm.br/css_browser_selector#contributors
var css_browser_selector = function() {
	var 
		ua=navigator.userAgent.toLowerCase(),
		is=function(t){ return ua.indexOf(t) != -1; },
		h=document.getElementsByTagName('html')[0],
		b=(!(/opera|webtv/i.test(ua))&&/msie (\d)/.test(ua))?('ie ie'+RegExp.$1):is('gecko/')? 'gecko':is('opera/9')?'opera opera9':/opera (\d)/.test(ua)?'opera opera'+RegExp.$1:is('konqueror')?'konqueror':is('applewebkit/')?'webkit safari':is('mozilla/')?'gecko':'',
		os=(is('x11')||is('linux'))?' linux':is('mac')?' mac':is('win')?' win':'';
	var c=b+os+' js';
	h.className += h.className?' '+c:c;
}();

// makes the element whose id is called appear with a blinds effect
// element id must have inline style="display:none"
function noticeAppear(id) {
	if($(id)) {
		new Effect.BlindDown(id);
	}
}

// for Change Country drop down menu
function extraDropDowns(navId,DDclass,selClass) {
   	if($(navId)) {
     	$(navId).getElementsByClassName(DDclass).each(function(element){
	        element.observe('mouseover', function() {
	                element.addClassName(selClass);
	        });
	        element.observe('mouseout', function() {
	                element.removeClassName(selClass);
	        });
        });
	}
}


//Flag behaviors
// worked fine everywhere but IE so went back to old-school setup
/*function buildFlagMouseovers() {
	$A($('flags').getElementsByTagName('img')).each(function(element) {
		element.observe('mouseover', function() {
			element.setAttribute("src",'<%= com.ratemyprofessors.listener.ctx.RmpUrls.RMP_STATIC_URL_VALUE %>/images/site/flags/' + element.id + '.jpg');
		});
		element.observe('mouseout', function() {
			element.setAttribute("src",'<%= com.ratemyprofessors.listener.ctx.RmpUrls.RMP_STATIC_URL_VALUE %>/images/site/flags/' + element.id + '_faded.png');
		});
	});
}*/

// RMP Front Page Tab Switcher
function switchTabs(tabLetter) {
	var tabA = $('rmp_tabA');
	var tabB = $('rmp_tabB');
	var tabRoot = $('rmp_tabsRoot').immediateDescendants();
	if(tabLetter == 'a') {
		tabB.hide();
		tabA.show();
		if (!tabA.hasClassName('selected')) {
			tabRoot.last().removeClassName('selected');
			tabRoot.first().addClassName('selected');
		}
	}
	if(tabLetter == 'b') {
		tabA.hide();
		tabB.show();
		if (!tabB.hasClassName('selected')) {
			tabRoot.first().removeClassName('selected');
			tabRoot.last().addClassName('selected');
		}
	}
}


function replaceQueryParam(url,pName,pValue){
    if( !url.match(new RegExp("\\?|"+pName+"=(\\w+)","g")) ){
       return url += "?"+pName+"="+pValue;
    }else if( !url.match(new RegExp("\\&|"+pName+"=(\\w+)","g")) ){
       return url += "&"+pName+"="+pValue;
    }else{
       var regex = new RegExp(pName+"=(\\w+)","g");
       return url.replace(regex,pName+"="+pValue);
    }
}
