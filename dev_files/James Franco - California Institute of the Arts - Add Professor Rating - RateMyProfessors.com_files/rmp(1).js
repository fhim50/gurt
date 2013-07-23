var Manager;

(function ($) {

  $(function () {

    hideSolrElements();

    Manager = new AjaxSolr.Manager({
      solrUrl: '/solr/interim.jsp?'
    });

    Manager.addWidget(new AjaxSolr.ResultWidget({
      id: 'result',
      target: '#docs_table tbody'
    }));

    Manager.addWidget(new AjaxSolr.PagerWidget({
      id: 'pager',
      target: '#pager',
      prevLabel: '&lt;',
      nextLabel: '&gt;',
      innerWindow: 1,
      renderHeader: function (perPage, offset, total,strtotal) {
        if(total == 0 || getParameter("rdr") == "true" ){
           $('#pager-header').html($('<span/>').html("Your search didn't return any results. Try a new search using the search field above."));
           if(getParameter("rdr") == "true"){
             $('#pager-header').html($('<span/>').html("The professor or school you were looking for could not be found. Try searching instead by using the search field above."));
             $('#left').hide();
			 $('#div_right').css("width","100%");
           }
           $('#pager-header').css("display","block");
           $('#pager-header').css("padding-top","50px");
        }else{
           $('#pager-header').html($('<span/>').text('displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + strtotal));
           showSolrElements();
        }
      }
    }));

    Manager.addWidget(new AjaxSolr.CurrentSearchWidget({
      id: 'currentsearch',
      target: '#selection'
    }));

/*
    Manager.addWidget(new AjaxSolr.TextWidget({
      id: 'text',
      target: '#solrsearch',
      field: 'content_type_s'
    })); 
*/

    Manager.addWidget(new AjaxSolr.AutocompleteWidget({
	  id: 'text',
	  target: '#solrsearch',
	  field: 'content_type_s',
	  fields: [ 'teacherlastname_t', 'teacherfirstname_t', 'schoolname_s' ]
    })); 



    var fields = [ 'schoolname_s', 'teacherdepartment_s', 'schoolcountry_s','schoolstate_s' ];
    for (var i = 0, l = fields.length; i < l; i++) {
      Manager.addWidget(new AjaxSolr.TagcloudWidget({
        id: fields[i],
        target: '#' + fields[i]+'_table',
        field: fields[i]
      }));
    }

    Manager.init();
    var sterm = getParameter("query") ||  getParameter("query1") ||  getParameter("query2") ;
    // Browser escapes value once. We are escaping value once again resulting in double escape. So unescaping here.
    //sterm = unescape(sterm);
    sterm = unescape(unescape(sterm)).replace(/[\(\[\]\)\?}{#:]/g,"");
    sterm = sterm || '*:*' ;
    Manager.store.addByValue('q', sterm);
    //Manager.store.addByValue('q', '*:*');

    var params = {
      facet: true,
      'facet.field': [ 'schoolname_s', 'teacherdepartment_s', 'schoolcountry_s','schoolstate_s' ],
      'facet.limit': 50,
      'rows': 20,
      'facet.mincount': 1,
      'json.nl': 'map'
    };
    for (var name in params) {
      Manager.store.addByValue(name, params[name]);
    }

    Manager.widgets['text'].afterRequest();
    if(window.location.href.indexOf("search.jsp") != -1){
      Manager.doRequest();
    }
  });

})(jQuery);
