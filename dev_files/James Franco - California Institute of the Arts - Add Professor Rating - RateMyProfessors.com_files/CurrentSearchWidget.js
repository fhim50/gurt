(function ($) {
AjaxSolr.CurrentSearchWidget = AjaxSolr.AbstractWidget.extend({

afterRequest: function () {
  var self = this;
  var links = [];

  var fq = this.manager.store.values('fq');
  for (var i = 0, l = fq.length; i < l; i++) {
    if(fq[i].indexOf("TEACHER") != -1 || fq[i].indexOf("SCHOOL") != -1 ) continue;
    links.push($('<a href="#"/>').html('<div><span class="cursearchleft">'+ fq[i].split(":")[1] + '</span><span class="cursearchright">x</span></div>').click(self.removeFacet(fq[i])));
  }

  var q = this.manager.store.values('q');
  for (var i = 0, l = q.length; i < l; i++) {
    if(q[i].indexOf("*:*") != -1) continue;
    links.push($('<a href="#"/>').html('<div><span class="cursearchleft">'+ (q[i] == "*:*" ? "All" : q[i]) + '</span><span class="cursearchright">x</span></div>').click(self.removeFacet(q[i])));
  }

  if (links.length > 1) {
  links.unshift($('<a href="#"/>').html('<span class="removeall">[remove all]</a>').click(function () {
    self.manager.store.remove('q');
    self.manager.store.remove('fq');
    self.manager.store.get('q').val('*:*');
    self.manager.doRequest(0);
    return false;
  }));
  }

  if (links.length) {
    AjaxSolr.theme('list_items', this.target, links);
  }
  else {
    $(this.target).html('<div class="showingall">[showing all]</div>');
  }
},

removeFacet: function (facet) {
  var self = this;
  return function () {
    if (self.manager.store.removeByValue('fq', facet)) {
      self.manager.doRequest(0);
    }
    if (self.manager.store.removeByValue('q', facet)) {
      self.manager.store.get('q').val('*:*');
      self.manager.doRequest(0);
    }
    return false;
  };
},

sortResults: function (facet) {
  var self = this;
  return function () {
    if (self.manager.store.removeByValue('fq', facet) || self.manager.store.removeByValue('q', facet)) {
      self.manager.doRequest(0);
    }
    return false;
  };
}

});
})(jQuery);

