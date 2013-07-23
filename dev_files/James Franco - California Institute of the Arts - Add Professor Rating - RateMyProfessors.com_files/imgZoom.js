document.write('<div style="position:absolute;z-index:100" id="outer_frame">');
document.write('</div>');

var offsetfrommouse=[15,-25]; //image x,y offsets from cursor position in pixels. Enter 0,0 for no offset
var displayduration=0; //duration in seconds image should remain visible. 0 for always.

function compatBodyCheck()
{
	return (!window.opera && document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
}

function zoom(imgName)
{
	if(imgName.indexOf("Professor_photo.png") > -1)
		imgName = "/images/site/Professor_photoNA.png";
	// below - you have to specify a width (1 px) which does not matter since this div resizes for the image anyhow
	var zoomHTML = '<div style="vertical-align:middle;padding: 5px; background-color: #F0F7FF;border: 2px solid #7F9DB9;">';
	zoomHTML += '<div align="center" style="padding: 2px 2px 2px 2px;"><img src="' + imgName + '" border="0" /></div></div>';
	document.getElementById("outer_frame").innerHTML = zoomHTML;
	document.getElementById("outer_frame").style.visibility="visible";
	document.onmousemove=zoomAtMseLocation;
}


function removeZoom()
{
		document.getElementById("outer_frame").style.visibility="hidden";
		document.onmousemove="";
		document.getElementById("outer_frame").style.left="-500px";
}

function zoomAtMseLocation(e)
{
	var xcoord=offsetfrommouse[0];
	var ycoord=offsetfrommouse[1];

	var docwidth=document.all? compatBodyCheck().scrollLeft+compatBodyCheck().clientWidth : pageXOffset+window.innerWidth-15;
	var docheight=document.all? Math.min(compatBodyCheck().scrollHeight, compatBodyCheck().clientHeight) : Math.min(document.body.offsetHeight, window.innerHeight);

	// FireFox (else if is for IE)
	if (typeof e != "undefined")
	{
		var currentimageheight = 0;	// maximum image size.
		if (docwidth - e.pageX < 367){
			xcoord = e.pageX - xcoord - 340; // Move to the left side of the cursor
		} else {
			xcoord += e.pageX;
		}
		if (docheight - e.pageY < (currentimageheight + 110))
		{
			ycoord += e.pageY - Math.max(0,(110 + currentimageheight + e.pageY - window.innerHeight - compatBodyCheck().scrollTop));
			//alert("docheight: " + docheight + "  e.pageY: " + e.pageY + "   currentimageheight: " + currentimageheight + "\nmax: " + Math.max(0,(110 + currentimageheight + e.pageY - docheight - compatBodyCheck().scrollTop)));
		} else {
			ycoord += e.pageY;
		}

	} 
	else if (typeof window.event != "undefined")
	{
		var currentimageheight = 0;	// maximum image size.
		if (docwidth - event.clientX < 367){
			xcoord = event.clientX + compatBodyCheck().scrollLeft - xcoord - 340; // Move to the left side of the cursor
		} else {
			xcoord += compatBodyCheck().scrollLeft+event.clientX
		}
		if (docheight - event.clientY < (currentimageheight + 110)){
			ycoord += event.clientY + compatBodyCheck().scrollTop - Math.max(0,(110 + currentimageheight + event.clientY - docheight));
			//alert("docheight: " + docheight + "  event.clientY: " + event.clientY + "   currentimageheight: " + currentimageheight);
		} else {
			ycoord += compatBodyCheck().scrollTop + event.clientY;
		}
	}
	document.getElementById("outer_frame").style.left=xcoord+"px";
	document.getElementById("outer_frame").style.top=ycoord+"px";

}