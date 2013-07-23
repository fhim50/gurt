
(function ($) {
AjaxSolr.TagcloudWidget = AjaxSolr.AbstractFacetWidget.extend({
facetClickHandler: function(facet){
  var self = this;
   return function(){
     top.reportFacetClick(facet,self.field);
     self.clickHandler(facet)();
   };
},
afterRequest: function () {
  if (this.manager.response.facet_counts.facet_fields[this.field] === undefined) {
    $(this.target).html(AjaxSolr.theme('no_items_found'));
    return;
  }

  var maxCount = 0;
  var objectedItems = [];
  for (var facet in this.manager.response.facet_counts.facet_fields[this.field]) {
    var count = parseInt(this.manager.response.facet_counts.facet_fields[this.field][facet]);
    if (count > maxCount) {
      maxCount = count;
    }
    objectedItems.push({ facet: facet, count: count });
  }
  objectedItems.sort(function (a, b) {
    return a.facet < b.facet ? -1 : 1;
  });

  var self = this;
  $(this.target).empty();
  for (var i = 0, l = objectedItems.length; i < l; i++) {
    var facet = objectedItems[i].facet;
    $(this.target).append(AjaxSolr.theme('tag', facet + ' ['+objectedItems[i].count+'] ', parseInt(objectedItems[i].count / maxCount * 10), self.facetClickHandler(facet)));
  }

}

});
})(jQuery);

