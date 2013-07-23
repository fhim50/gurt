// $Id$

(function ($) {

/**
 * A pager widget for jQuery.
 *
 * <p>Heavily inspired by the Ruby on Rails will_paginate gem.</p>
 *
 * @expects this.target to be a list.
 * @class PagerWidget
 * @augments AjaxSolr.AbstractWidget
 * @todo Don't use the manager to send the request. Request only the results,
 * not the facets. Update only itself and the results widget.
 */
AjaxSolr.PagerWidget = AjaxSolr.AbstractWidget.extend(
  /** @lends AjaxSolr.PagerWidget.prototype */
  {
  /**
   * How many links are shown around the current page.
   *
   * @field
   * @public
   * @type Number
   * @default 4
   */
  innerWindow: 4,

  /**
   * How many links are around the first and the last page.
   *
   * @field
   * @public
   * @type Number
   * @default 1
   */
  outerWindow: 1,

  /**
   * The previous page link label.
   *
   * @field
   * @public
   * @type String
   * @default "&laquo; previous"
   */
  prevLabel: '&laquo; Previous',

  /**
   * The next page link label.
   *
   * @field
   * @public
   * @type String
   * @default "next &raquo;"
   */
  nextLabel: 'Next &raquo;',

  /**
   * The previous page link label.
   *
   * @field
   * @public
   * @type String
   * @default "&laquo; previous"
   */
  firstLabel: ' &laquo;',

  /**
   * The next page link label.
   *
   * @field
   * @public
   * @type String
   * @default "next &raquo;"
   */
  lastLabel: ' &raquo;',

  /**
   * Separator between pagination links.
   *
   * @field
   * @public
   * @type String
   * @default ""
   */
  separator: ' ',

  /**
   * The current page number.
   *
   * @field
   * @private
   * @type Number
   */
  currentPage: null,

  /**
   * The total number of pages.
   *
   * @field
   * @private
   * @type Number
   */
  totalPages: null,

  /**
   * @returns {String} The gap in page links, which is represented by:
   *   <span class="pager-gap">&hellip;</span>
   */
  gapMarker: function () {
    return '<span class="pager-gap"> of </span>';
    //return '<span class="pager-gap">&hellip;</span>';
  },

  /**
   * @returns {Array} The links for the visible page numbers.
   */
  windowedLinks: function () {
    var links = [];

    var prev = null;

    var visible = this.visiblePageNumbers();
    for (var i = 0, l = visible.length; i < l; i++){
      //if (visible[i] > prev + 1) links.push(this.gapMarker());
      //links.push(this.gapMarker());
      if(i==0) {
        links.push(this.pageLinkOrSpan(visible[i], [ 'pager-current' ]));
        links.push(this.pageLinkOrSpan("", [ 'pager-gap' ]," of "));
        if(this.totalPages == 1)
        links.push(this.pageLinkOrSpan("", [ 'pager-last' ], visible[i]));
      }else if(visible[i] == this.totalPages){
        links.push(this.pageLinkOrSpan("", [ 'pager-last' ], visible[i]));
      }else{
        links.push(this.pageLinkOrSpan(visible[i], [ 'pager-now' ]));
      }
      prev = visible[i];
    }

    return links;
  },

  /**
   * @returns {Array} The visible page numbers according to the window options.
   */ 
  visiblePageNumbers: function () {
    var windowFrom = this.currentPage - this.innerWindow;
    var windowTo = this.currentPage + this.innerWindow;

    // If the window is truncated on one side, make the other side longer
    if (windowTo > this.totalPages) {
      windowFrom = Math.max(0, windowFrom - (windowTo - this.totalPages));
      windowTo = this.totalPages;
    }
    if (windowFrom < 1) {
      windowTo = Math.min(this.totalPages, windowTo + (1 - windowFrom));
      windowFrom = 1;
    }

    var visible = [];

    // Always show the first page
    visible.push(this.currentPage);
    // Don't add inner window pages twice
/*
    for (var i = 2; i <= Math.min(1 + this.outerWindow, windowFrom - 1); i++) {
      visible.push(i);
    }
    // If the gap is just one page, close the gap
    if (1 + this.outerWindow == windowFrom - 2) {
      visible.push(windowFrom - 1);
    }
    // Don't add the first or last page twice
    for (var i = Math.max(2, windowFrom); i <= Math.min(windowTo, this.totalPages - 1); i++) {
      visible.push(i);
    }
    // If the gap is just one page, close the gap
    if (this.totalPages - this.outerWindow == windowTo + 2) {
      visible.push(windowTo + 1);
    }
    // Don't add inner window pages twice
    for (var i = Math.max(this.totalPages - this.outerWindow, windowTo + 1); i < this.totalPages; i++) {
      visible.push(i);
    }
*/
    // Always show the last page, unless it's the first page
    if (this.totalPages > 1) {
      visible.push(this.totalPages);
    }

    return visible;
  },

  /**
   * @param {Number} page A page number.
   * @param {String} classnames CSS classes to add to the page link.
   * @param {String} text The inner HTML of the page link (optional).
   * @returns The link or span for the given page.
   */
  pageLinkOrSpan: function (page, classnames, text) {
    text = text || page;

    if (page && page != this.currentPage) {
      return $('<a href="#"/>').html(text).attr('rel', this.relValue(page)).addClass(classnames[1]).click(this.clickHandler(page));
    }
    else {
      return $('<span/>').html(text).addClass(classnames.join(' '));
    }
  },

  /**
   * @param {Number} page A page number.
   * @returns {Function} The click handler for the page link.
   */
  clickHandler: function (page) {
    var self = this;
    return function () {
      self.manager.store.get('start').val((page - 1) * (self.manager.response.responseHeader.params && self.manager.response.responseHeader.params.rows || 10));
      self.manager.doRequest();
      return false;
    }
  },

  /**
   * @param {Number} page A page number.
   * @returns {String} The <tt>rel</tt> attribute for the page link.
   */
  relValue: function (page) {
    switch (page) {
      case this.previousPage():
        return 'prev' + (page == 1 ? 'start' : '');
      case this.nextPage():
        return 'next';
      case 1:
        return 'start';
      default: 
        return '';
    }
  },

  /**
   * @returns {Number} The page number of the previous page or null if no previous page.
   */
  previousPage: function () {
    return this.currentPage > 1 ? (this.currentPage - 1) : null;
  },

  /**
   * @returns {Number} The page number of the next page or null if no next page.
   */
  nextPage: function () {
    return this.currentPage < this.totalPages ? (this.currentPage + 1) : null;
  },

  /**
   * @returns {Number} The page number of the next page or null if no next page.
   */
  jumpToPage: function () {
    return this.currentPage < this.totalPages ? (this.currentPage + 1) : null;
  },

  /**
   * @returns {Number} The page number of the last page.
   */
  lastPage: function () {
    return this.totalPages;
  },

  /**
   * @returns {Number} The page number of the first page.
   */
  firstPage: function () {
    return 1;
  },

  /**
   * An abstract hook for child implementations.
   *
   * @param {Number} perPage The number of items shown per results page.
   * @param {Number} offset The index in the result set of the first document to render.
   * @param {Number} total The total number of documents in the result set.
   */
  renderHeader: function (perPage, offset, total,strtotal) {},

  /**
   * Render the pagination links.
   *
   * @param {Array} links The links for the visible page numbers.
   */
  renderLinks: function (links) {
    if (this.totalPages) {
      links.unshift(this.pageLinkOrSpan(this.previousPage(), [ 'pager-disabled', 'pager-prev' ], this.prevLabel));
      links.unshift(this.pageLinkOrSpan(this.firstPage(), [ 'pager-disabled', 'pager-first' ], this.firstLabel));
      links.unshift(this.pageLinkOrSpan("", [ 'pager-disabled', 'pager-first' ], this.renderTotal()));
      links.push(this.pageLinkOrSpan(this.nextPage(), [ 'pager-disabled', 'pager-next' ], this.nextLabel));
      links.push(this.pageLinkOrSpan(this.lastPage(), [ 'pager-disabled', 'pager-last' ], this.lastLabel));
      AjaxSolr.theme('list_items', this.target, links, this.separator);
    }
  },

  renderTotal: function(){
    var total = parseInt(this.manager.response.response.numFound);
    var strtotal = this.formatTotal(total);
    return total > 1 ? strtotal + " results" : strtotal + " result";
  },

  formatTotal: function(total){
    var strtotal = ""+total;
    if(total > 999){ // we want to add comma only 
      strtotal = (""+total).split("").reverse().join("").replace(/([0-9][0-9][0-9])/g,"$1,").split("").reverse().join("");
    }
    return strtotal;
  },

  afterRequest: function () {
    var self = this;
    var perPage = parseInt(this.manager.response.responseHeader.params && this.manager.response.responseHeader.params.rows || 50);
    var offset = parseInt(this.manager.response.responseHeader.params && this.manager.response.responseHeader.params.start || 0);
    var total = parseInt(this.manager.response.response.numFound);
    var strtotal = this.formatTotal(total);

    // Normalize the offset to a multiple of perPage.
    offset = offset - offset % perPage;

    this.currentPage = Math.ceil((offset + 1) / perPage);
    this.totalPages = Math.ceil(total / perPage);

    $(this.target).empty();

    this.renderLinks(this.windowedLinks());

    var pnum = $(".pager-current").html();
    $(".pager-current").replaceWith('<input type="text" id="navinput" name="navinput" size="2" value="'+pnum+'"/>');
    $("#navinput").keypress(function(e){
       if(e.which == 13){
         var jumpPage = self.clickHandler($("#navinput").val());
         jumpPage();
       }
    });
    this.renderHeader(perPage, offset, total, strtotal);
  }
});

})(jQuery);
