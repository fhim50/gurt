function getCookie(c_name)
{
var i,x,y,ARRcookies=document.cookie.split(";");
for (i=0;i<ARRcookies.length;i++)
{
  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
  x=x.replace(/^\s+|\s+$/g,"");
  if (x==c_name)
    {
    return unescape(y);
    }
  }
}

function setCookie(c_name,value,exsecs)
{
//var exdate=new Date();
//exdate.setDate(exdate.getDate() + exdays);
var exdate = new Date();
exdate.setTime(exdate.getTime()+(exsecs*1000));
var c_value=escape(value) + ((exsecs==null) ? "" : "; expires="+exdate.toGMTString()+"; path=/");
document.cookie=c_name + "=" + c_value;
}

function setCIDCookie(sessionID)
{
var c_value = getCookie("cid");
if (c_value == null || c_value == '') {
var d = new Date();
var c_value=escape(sessionID) + "-" + d.getFullYear() + (d.getMonth() + 1 ) + d.getDate()+ "; expires=Wed, 23-Mar-2036 21:15:35 GMT";
document.cookie="cid" + "=" + c_value;
//alert("Cookie : " + "cid" + "=" + c_value + " is set.");
}
}
