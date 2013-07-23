(function ($) {

AjaxSolr.theme.prototype.result = function (doc, snippet,i,searchType) {
  //var output = '<div><span style="width:250px;font-weight:bold">' + doc.teacherlastname_t + " " + doc.teacherfirstname_t + " " + '</span><span style="margin-left:15px;margin-right:15px;width:15px"> ' + doc.averageratingscore_rf + ' </span> ' + doc.schoolname_s + " " + doc.teacherdepartment_s  + " " + doc.totalnumberofratings_i;
  //output += '<p id="links_' + doc.id + '" class="links"></p>';
  //output += '<p>' + snippet + '</p></div>';
 // output += '<p> </p></div>';
  /* adding tr inside append because in ResultWidget we fetch html for the element and append in one go. element.html on gives innerHTML and not the element itself so wrapping with another tr */
  var classname = "odd";
  if( (i+1) % 2 == 0 ) classname="even";
  if(searchType == 'content_type_s:TEACHER'){
       AjaxSolr.theme('prof_housekeeping');
       return $('<tr class='+classname+'>').append('<tr class='+classname+'>'+'<td class="td0">' + (AjaxSolr.theme('picture_link',doc.pict_thumb_name_s,doc.pk_id)) + '</td><td class="td1 font14px"> ' + (AjaxSolr.theme('prof_link',doc.teacherlastname_t+', '+doc.teacherfirstname_t,doc.pk_id,doc.status_i)) + '</td><td class="td3"> ' + AjaxSolr.theme('wrap_name',doc.teacherdepartment_s) + '</td><td  class="td4"> ' + AjaxSolr.theme('school_link',doc.schoolname_s,doc.schoolid_s,doc.schoolcity_s) + '</td><td  class="td5"> ' + AjaxSolr.theme('check_undefined',doc.averageratingscore_rf)  + '</td><td class="td6"> ' + AjaxSolr.theme('check_undefined',doc.total_number_of_ratings_i) + '</td>');
       //return $('<tr>').append('<td class="td1">' + AjaxSolr.theme('check_undefined',doc.teacherlastname_t,doc.tid) + '</td><td class="td2"> ' + AjaxSolr.theme('check_undefined',doc.teacherfirstname_t) + '</td><td class="td3"> ' + AjaxSolr.theme('check_undefined',doc.averageratingscore_rf) + '</td><td  class="td4"> ' + AjaxSolr.theme('check_undefined',doc.schoolname_s) + '</td><td  class="td5"> ' + AjaxSolr.theme('check_undefined',doc.teacherdepartment_s)  + '</td><td class="td6"> ' + AjaxSolr.theme('check_undefined',doc.totalnumberofratings_i) + '</td>');
  }else{
       AjaxSolr.theme('school_housekeeping');
       return $('<tr class='+classname+'>').append('<tr class='+classname+'>' + '<td class="std1 font14px">' + AjaxSolr.theme('school_link',doc.schoolname_s,doc.pk_id,"") + '</td><td class="std2"> ' + AjaxSolr.theme('wrap_name',doc.schoolcity_s) + '</td><td class="std3"> ' + AjaxSolr.theme('check_undefined',doc.schoolstate_s) + '</td><td  class="std4"> ' + AjaxSolr.theme('check_undefined',doc.schoolcountry_s) + '</td><td  class="std5"> ' + AjaxSolr.theme('check_undefined',doc.averageteacherrating_rf)  + '</td><td class="std6"> ' + AjaxSolr.theme('check_undefined',doc.total_number_of_ratings_i) + '</td>');
  }
//  return output;
};

AjaxSolr.theme.prototype.snippet = function (doc) {
  var output = '';
  if (doc.teacherlastname_t != undefined && doc.teacherlastname_t.length > 300) {
    output += doc.dateline + ' ' + doc.text.substring(0, 300);
    output += '<span style="display:none;">' + doc.text.substring(300);
    output += '</span> <a href="#" class="more">more</a>';
  }
  else {
    output += doc.dateline + ' ' + doc.text;
  }
  return output;
};

AjaxSolr.theme.prototype.tag = function (value, weight, handler) {
 
  var value1 = value;
  if(value.length > 26){
    value1 = value.substring(0,25)+"...";
  }

  return $('<tr>').append($('<td>').append($('<a href="#" title="'+ value + '" class="tagcloud_item"/>').text(value1).addClass('tagcloud_size_x' + weight).click(handler)));
  //return $('<a href="#" class="tagcloud_item"/><br/>').text(value).addClass('tagcloud_size_' + weight).click(handler);
};

AjaxSolr.theme.prototype.facet_link = function (value, handler) {
  return $('<a href="#"/>').html(value).click(handler);
};

AjaxSolr.theme.prototype.picture_link = function (thumburl,tid) {
  if(AjaxSolr.theme('check_undefined',thumburl) == 0){
    return ('<a href="javascript:function(){return false;}" class="tagcloud_item"><img class="person" width="23" height="23" src="http://static.ratemyprofessors.com/images/site/icons/nophoto_small.png"></img></a>');
  }else{
    var profImage = "http://ratemyprofessors.mtvnimages.com/prof/" + (AjaxSolr.theme('check_undefined',thumburl));
    return (('<a href="/ShowRatings.jsp?tid='+ tid+'" class="tagcloud_item">')+'<img width="23" height="23" src="'+ profImage + '"  onmouseover="zoom(\''+ profImage +'\');" onmouseout="removeZoom();"></img></a>');
  }
};

AjaxSolr.theme.prototype.prof_link = function (teacherlastname_t,tid,status_i) {
  if(status_i == -4){
     return (('<a title="This professor has not yet been approved by the RMP Moderation team. Check back soon!" class="tagcloud_item_disabled">')+(AjaxSolr.theme('wrap_name',teacherlastname_t))+'</a>');
  }else{
     return (('<a href="/ShowRatings.jsp?tid='+ tid+'" class="tagcloud_item">')+(AjaxSolr.theme('wrap_name',teacherlastname_t))+'</a>');
  }
};

AjaxSolr.theme.prototype.school_link = function (schoolname_s, sid,schoolcity_s) {
  var displayName = (schoolcity_s != "" ) ? schoolname_s + " : " + schoolcity_s : schoolname_s ;
  var shortClass = '';
  if(displayName.length > 38){
    displayName.replace(/ [^ ]*$/,'<br/>'); 
    shortClass = 'shortHeight';
  }
  return (('<a href="/SelectTeacher.jsp?sid='+ sid+'" class="tagcloud_item ' + shortClass +' ">')+
          '<div style="word-wrap: break-word;line-height:22px;width:inherit">'+
          (AjaxSolr.theme('check_undefined',displayName))+
          '</div>'+
          '</a>');
};

AjaxSolr.theme.prototype.wrap_name = function (name) {
  if(name.length > 21){
    return '<div style="word-wrap: break-word;line-height:25px;width:inherit">'+ (AjaxSolr.theme('check_undefined',name)) + ' </div>'
  }else{
    return name;
  }
};

AjaxSolr.theme.prototype.no_items_found = function () {
  return 'no items found in current selection';
};

AjaxSolr.theme.prototype.check_undefined = function (value) {
  return (value == undefined) ? 0 : value; 
};

AjaxSolr.theme.prototype.prof_housekeeping = function (value) {
  $('#teacherhead').show();
  $('#schoolhead').hide();
  $('#schoolname_s_div').show();
  $('#teacherdepartment_s_div').show();
  $('#schoolstate_s_div').hide();
};

AjaxSolr.theme.prototype.school_housekeeping = function (value) {
  $('#teacherhead').hide();
  $('#schoolhead').show();
  $('#schoolname_s_div').hide();
  $('#teacherdepartment_s_div').hide();
  $('#schoolstate_s_div').show();
};

})(jQuery);
