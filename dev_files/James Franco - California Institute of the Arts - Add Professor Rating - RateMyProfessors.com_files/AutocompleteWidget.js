(function ($) {
AjaxSolr.AutocompleteWidget = AjaxSolr.AbstractFacetWidget.extend({

afterRequest: function () {
  $('#query').unbind().removeData('events').val('');
  $('#query1').unbind().removeData('events').val('');
  $('#query2').unbind().removeData('events').val('');
  $('#query4').unbind().removeData('events').val('');
  $('#search_submit').unbind().removeData('events');
  $('#search_submit1').unbind().removeData('events');
  $('#search_submit2').unbind().removeData('events');

  var self = this;

  var list = [];
  this.requestSent = false;


  self.bindElements("query","queryoption","search_submit");
  self.bindElements("query1","queryoption1","search_submit1");
  self.bindElements("query4","queryoption4","search_submit1");
  self.bindElements("query2","queryoption2","search_submit2");
 
/*
  $('input[name^=query]').each(function(){
     self.bindElements(this.attr("id"));
  });
*/

/*
  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i];
    for (var facet in this.manager.response.facet_counts.facet_fields[field]) {
      list.push({
        field: field,
        value: facet,
        text: facet + ' (' + this.manager.response.facet_counts.facet_fields[field][facet] + ') - ' + field
      });
    }
  }

  $(this.target).find('#query').unautocomplete().autocomplete(list, {
    formatItem: function(facet) {
      return facet.text;
    }
  }).result(function(e, facet) {
    self.requestSent = true;
    if (self.manager.store.addByValue('fq', facet.field + ':' + facet.value)) {
      self.manager.doRequest(0);
    }
  });

*/

  // This has lower priority so that requestSent is set.
 // $(this.target).find('input[name^=query').bind('keydown', function(e) {
/*
  $('input[name^=query]').each(function(){
    $(this).bind('keydown', function(e) {
      if (self.requestSent === false && e.which == 13) {
       self.doSearch();
      }
    });
  });
*/

/*
  $(this.target).find('#search_submit').bind('click', function(e) {
    if (self.requestSent === false) {
      self.doSearch();
    }
  });
*/

},

beforeRequest: function () {
  var self = this;
  // var value = $(this).val(); not using this var. commenting out as it was throwing error.
  //self.manager.store.addByValue('fq', 'content_type_s' + ':' + $('#queryoption').val()); 
  if(self.manager.store.get('fq')[0].value === null){
    var qoption = getParameter("queryoption") ||  getParameter("queryoption1") ||  getParameter("queryoption2") || 'TEACHER' ;
    self.replace(qoption);
  }
  //self.replace($('input:radio[name=queryoption]:checked').val());
},

  resetSortOrder: function(){
    //clear all up and down
    $('th span').each(function() {
             $(this).removeClass('up down');
    });

    $('th[sortterm^="total_number_of_ratings_i"] span').addClass("down");

  },

doSearch: function(e,id,optionid){
  var self = this;
  var value = $('#'+id).val();
  //if (value && self.add(value)) {
  if (value && self.addQ(value) && self.replace($('#'+optionid).val()) ) {
    self.resetSortOrder();
    self.manager.store.addByValue('sort',  "total_number_of_ratings_i desc");
    self.manager.doRequest(0);
  }
},

bindElements: function(id,optionid,submitid){

         var self = this;
         var url = "http://search.mtvnservices.com/typeahead/suggest/?solrformat=true&limit=10&spellcheck.q=s";
         this.requestSent = false;

                $('#'+id).bind('keydown',{ eid: id, eoptionid: optionid }, function(e) {
                   if (self.requestSent === false && e.which == 13){
                      self.doSearch(e,e.data.eid,e.data.eoptionid);
                   }
                 });

                $('#'+submitid).bind('click',{ eid: id, eoptionid: optionid }, function(e) {
                   if (self.requestSent === false) {
                     self.doSearch(e,e.data.eid,e.data.eoptionid);
                   }
                 });

          if(id === 'query2') return ; //we don't want to do autocomplete for footer

                $("#"+id).unautocomplete().autocomplete(url, {

                        minChars :1,
                        minChars :1,
                        width :350,
                        dataType :"jsonp",
                        url : url,
                        type :"GET",
                        autoFill :false,
                        scrollHeight :300,
                        scroll :true,
                        max :10,
                        selectFirst :false,
                        cacheLength :0,
                        matchCase :0,
                        matchSubset :1,
                        matchContains :0,
                        mustMatch :0,
                        lineSeparator :"\n",
                        cellSeparator :"|",
                        delay :0,
                        extraParams: {
                                 siteName: function() { return getSitename(); },
                                "spellcheck.q": function() { return getTerm(); },
                                "fq": function() { return "content_type_s:"+$('#'+optionid).val() ; }
                        },
                        formatItem: function(row, i, n, max) {
                           max = max.split("~~")[0];
                         return getValue(max, "Term:");
                        },
                        formatResult: function(row, max) {
                                return getValue(max, "Term:");
                        }
                }).result(function(event, row, max) {
                          this.requestSent = true;
                          if( max == "No Suggestion available") return;
                          var url = getSelectedValue(max, "URL:");
                          // var value = max.split("~~")[0];
                          var value = row.replace("Term:","");

                          var domain = window.location.hostname.replace("blog","www");

                          if( $('#'+optionid).val() == 'TEACHER'){
                             window.location = "http://"+domain+"/ShowRatings.jsp?tid="+value;
                          }else{
                             window.location = "http://"+domain+"/SelectTeacher.jsp?sid="+value;
                          }

			  if (value && self.addQ(value)) {
			     self.manager.doRequest(0);
			  }

                          if(url == max) {
                             return;
                          }
                          if(url.length != 0) {
                             location.href = url;
                          }
                });


  }


});
})(jQuery);

