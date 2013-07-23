(function ($) {

AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
  beforeRequest: function () {
    //$(this.target).html($('<img/>').attr('src', 'images/ajax-loader.gif'));
  },

  facetLinks: function (facet_field, facet_values) {
    var links = [];
    if (facet_values) {
      for (var i = 0, l = facet_values.length; i < l; i++) {
        links.push(AjaxSolr.theme('facet_link', facet_values[i], this.facetHandler(facet_field, facet_values[i])));
      }
    }
    return links;
  },

  facetHandler: function (facet_field, facet_value) {
    var self = this;
    return function () {
      self.manager.store.remove('fq');
      self.manager.store.addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value));
      self.manager.doRequest(0);
      return false;
    };
  },

  headerLinks: function () {
    $('#teacherhead tr,#schoolhead tr').children("th").each(function(){ 
	var curHead = $(this).children("a").html() ? $(this).children("a").html() : $(this).html();
	var sortterm = $(this).attr('sortterm');
	$(this).html("");
	$(this).html(AjaxSolr.theme('facet_link', curHead, Manager.widgets['result'].headerHandler("sort", sortterm)) );
     });
  },

  headerHandler: function (facet_field, facet_value) {
    var self = this;
    return function () {
      self.modifySortOrder(facet_value);
      self.manager.store.addByValue('sort',  facet_value);
      self.manager.doRequest(0);
      return false;
    };
  },

  modifySortOrder: function ( facet_value) {

    var self = this;
    self.resetSortOrder();

    $('th[sortterm="' +facet_value + '"] span').addClass(function() {
             return facet_value.match(/desc/) ? 'down' : 'up' ;
    });

    $('th[sortterm="' +facet_value + '"]').attr('sortterm', 
             facet_value.match(/desc/) ? facet_value.replace(/desc/g,"asc") : facet_value.replace(/asc/g,"desc")  );

  },

  resetSortOrder: function(){
    //clear all up and down
    $('th span').each(function() {
             $(this).removeClass('up down');
    });

  },

  afterRequest: function () {
    $(this.target).empty();
    var output = '';
    for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
      var doc = this.manager.response.response.docs[i];
      var searchType = this.manager.store.get('fq')[0].value;
      output += AjaxSolr.theme('result', doc, AjaxSolr.theme('snippet', doc),i,searchType).html();

      var items = [];
      items = items.concat(this.facetLinks('schoolname_s', doc.schoolname_s));
      items = items.concat(this.facetLinks('teacherdepartment_s', doc.teacherdepartment_s));
      items = items.concat(this.facetLinks('schoolstate_s', doc.schoolstate_s));
      AjaxSolr.theme('list_items', '#links_' + doc.id, items);
    }
    $(this.target).append(output);
    this.headerLinks();
  },

  init: function () {
      $('a.more').livequery(function () {
    $(this).toggle(function () {
      $(this).parent().find('span').show();
      $(this).text('less');
      return false;
    }, function () {
      $(this).parent().find('span').hide();
      $(this).text('more');
      return false;
    });
  });
  }
});

})(jQuery);
