
/*
 * Autocomplete - jQuery plugin 1.0.2
 *
 * Copyright (c) 2007 Dylan Verheul, Dan G. Switzer, Anjesh Tuladhar, J�rn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id: jquery.autocomplete.js 5747 2008-06-25 18:30:55Z joern.zaefferer $
 *
 */

;(function($) {
    
$.fn.extend({
    autocomplete: function(urlOrData, options) {
        var isUrl = typeof urlOrData == "string";
        options = $.extend({}, $.Autocompleter.defaults, {
            url: isUrl ? urlOrData : null,
            data: isUrl ? null : urlOrData,
            delay: isUrl ? $.Autocompleter.defaults.delay : 10,
            max: options && !options.scroll ? 10 : 150
        }, options);
        
        // if highlight is set to false, replace it with a do-nothing function
        options.highlight = options.highlight || function(value) { return value; };
        
        // if the formatMatch option is not specified, then use formatItem for backwards compatibility
        options.formatMatch = options.formatMatch || options.formatItem;
        
        return this.each(function() {
            new $.Autocompleter(this, options);
        });
    },
    result: function(handler) {
        return this.bind("result", handler);
    },
    search: function(handler) {
        return this.trigger("search", [handler]);
    },
    flushCache: function() {
        return this.trigger("flushCache");
    },
    setOptions: function(options){
        return this.trigger("setOptions", [options]);
    },
    unautocomplete: function() {
        return this.trigger("unautocomplete");
    }
});

$.Autocompleter = function(input, options) {

    var KEY = {
        UP: 38,
        DOWN: 40,
        DEL: 46,
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        COMMA: 188,
        PAGEUP: 33,
        PAGEDOWN: 34,
        BACKSPACE: 8
    };

    // Create $ object for input element
    var $input = $(input).attr("autocomplete", "off").addClass(options.inputClass);

    var timeout;
    var previousValue = "";
    var cache = $.Autocompleter.Cache(options);
    var hasFocus = 0;
    var lastKeyPressCode;
    var config = {
        mouseDownOnSelect: false
    };
    var select = $.Autocompleter.Select(options, input, selectCurrent, config);
    
    var blockSubmit;
    
    // prevent form submit in opera when selecting with return key
    $.browser.opera && $(input.form).bind("submit.autocomplete", function() {
        if (blockSubmit) {
            blockSubmit = false;
            return false;
        }
    });
    
    // only opera doesn't trigger keydown multiple times while pressed, others don't work with keypress at all
    $input.bind(($.browser.opera ? "keypress" : "keydown") + ".autocomplete", function(event) {
        // track last key pressed
        lastKeyPressCode = event.keyCode;
        switch(event.keyCode) {
        
            case KEY.UP:
                event.preventDefault();
                if ( select.visible() ) {
                    select.prev();
                } else {
                    onChange(0, true);
                }
                break;
                
            case KEY.DOWN:
                event.preventDefault();
                if ( select.visible() ) {
                    select.next();
                } else {
                    onChange(0, true);
                }
                break;
                
            case KEY.PAGEUP:
                event.preventDefault();
                if ( select.visible() ) {
                    select.pageUp();
                } else {
                    onChange(0, true);
                }
                break;
                
            case KEY.PAGEDOWN:
                event.preventDefault();
                if ( select.visible() ) {
                    select.pageDown();
                } else {
                    onChange(0, true);
                }
                break;
            
            // matches also semicolon
            case options.multiple && $.trim(options.multipleSeparator) == "," && KEY.COMMA:
            case KEY.TAB:
            case KEY.RETURN:
                if( selectCurrent() ) {
                    // stop default to prevent a form submit, Opera needs special handling
                    event.preventDefault();
                    blockSubmit = true;
                    return false;
                }
                break;
                
            case KEY.ESC:
                select.hide();
                break;
                
            default:
                clearTimeout(timeout);
                timeout = setTimeout(onChange, options.delay);
                break;
        }
    }).focus(function(){
        // track whether the field has focus, we shouldn't process any
        // results if the field no longer has focus
        hasFocus++;
    }).blur(function() {
        hasFocus = 0;
        if (!config.mouseDownOnSelect) {
            hideResults();
        }
    }).click(function() {
        // show select when clicking in a focused field
        if ( hasFocus++ > 1 && !select.visible() ) {
            onChange(0, true);
        }
    }).bind("search", function() {
        // TODO why not just specifying both arguments?
        var fn = (arguments.length > 1) ? arguments[1] : null;
        function findValueCallback(q, data) {
            var result;
            if( data && data.length ) {
                for (var i=0; i < data.length; i++) {
                    if( data[i].result.toLowerCase() == q.toLowerCase() ) {
                        result = data[i];
                        break;
                    }
                }
            }
            if( typeof fn == "function" ) fn(result);
            else $input.trigger("result", result && [result.data, result.value]);
        }
        $.each(trimWords($input.val()), function(i, value) {
            request(value, findValueCallback, findValueCallback);
        });
    }).bind("flushCache", function() {
        cache.flush();
    }).bind("setOptions", function() {
        $.extend(options, arguments[1]);
        // if we've updated the data, repopulate
        if ( "data" in arguments[1] )
            cache.populate();
    }).bind("unautocomplete", function() {
        select.unbind();
        $input.unbind();
        $(input.form).unbind(".autocomplete");
    });
    
    
    function selectCurrent() {
        var selected = select.selected();
        if( !selected )
            return false;
        
        var v = selected.result;
        previousValue = v;
        
        if ( options.multiple ) {
            var words = trimWords($input.val());
            if ( words.length > 1 ) {
                v = words.slice(0, words.length - 1).join( options.multipleSeparator ) + options.multipleSeparator + v;
            }
            v += options.multipleSeparator;
        }
        
        // $input.val(v);
        hideResultsNow();
        $input.trigger("result", [selected.data, selected.value]);
        return true;
    }
    
    function onChange(crap, skipPrevCheck) {
        if( lastKeyPressCode == KEY.DEL ) {
            select.hide();
            return;
        }
        
        var currentValue = $input.val();
        
        if ( !skipPrevCheck && currentValue == previousValue )
            return;
        
        previousValue = currentValue;
        
        currentValue = lastWord(currentValue);
        if ( currentValue.length >= options.minChars) {
            $input.addClass(options.loadingClass);
            if (!options.matchCase)
                currentValue = currentValue.toLowerCase();
            request(currentValue, receiveData, hideResultsNow);
        } else {
            stopLoading();
            select.hide();
        }
    };
    
    function trimWords(value) {
        if ( !value ) {
            return [""];
        }
        var words = value.split( options.multipleSeparator );
        var result = [];
        $.each(words, function(i, value) {
            if ( $.trim(value) )
                result[i] = $.trim(value);
        });
        return result;
    }
    
    function lastWord(value) {
        if ( !options.multiple )
            return value;
        var words = trimWords(value);
        return words[words.length - 1];
    }
    
    // fills in the input box w/the first match (assumed to be the best match)
    // q: the term entered
    // sValue: the first matching result
    function autoFill(q, sValue){
        // autofill in the complete box w/the first match as long as the user hasn't entered in more data
        // if the last user key pressed was backspace, don't autofill
        if( options.autoFill && (lastWord($input.val()).toLowerCase() == q.toLowerCase()) && lastKeyPressCode != KEY.BACKSPACE ) {
            // fill in the value (keep the case the user has typed)
            $input.val($input.val() + sValue.substring(lastWord(previousValue).length));
            // select the portion of the value not typed by the user (so the next character will erase)
            $.Autocompleter.Selection(input, previousValue.length, previousValue.length + sValue.length);
        }
    };

    function hideResults() {
        clearTimeout(timeout);
        timeout = setTimeout(hideResultsNow, 200);
    };

    function hideResultsNow() {
        var wasVisible = select.visible();
        select.hide();
        clearTimeout(timeout);
        stopLoading();
        if (options.mustMatch) {
            // call search and run callback
            $input.search(
                function (result){
                    // if no value found, clear the input box
                    if( !result ) {
                        if (options.multiple) {
                            var words = trimWords($input.val()).slice(0, -1);
                            $input.val( words.join(options.multipleSeparator) + (words.length ? options.multipleSeparator : "") );
                        }
                        else
                            $input.val( "" );
                    }
                }
            );
        }
        if (wasVisible)
            // position cursor at end of input field
            $.Autocompleter.Selection(input, input.value.length, input.value.length);
    };

    function receiveData(q, data) {
        if ( data && data.length && hasFocus ) {
            stopLoading();
            select.display(data, q);
            autoFill(q, data[0].value);
            select.show();
        } else {
            hideResultsNow();
        }
    };

    function request(term, success, failure) {
        if (!options.matchCase)
            term = term.toLowerCase();
        var data = cache.load(term);
        // recieve the cached data
        if (data && data.length) {
            success(term, data);
        // if an AJAX url has been supplied, try loading the data now
        } else if( (typeof options.url == "string") && (options.url.length > 0) ){
            
            var extraParams = {};
            // removing the extra timestamp param
            // author: vivek
                //timestamp: +new Date()
        //    };
            $.each(options.extraParams, function(key, param) {
                extraParams[key] = typeof param == "function" ? param() : param;
            });
            $.ajax({
                // try to leverage ajaxQueue plugin to abort previous requests
                mode: "abort",
                cache:'true',
                jsonp:'json.wrf',
                jsonpCallback: "noCb",
                // limit abortion to this input
                port: "autocomplete" + input.name,
                dataType: options.dataType,
                url: options.url,
                data: $.extend({
                    /*
                     * Encoding the requested "term", to support accented 
                     * characters. This will only encode the term sent to
                     * the server and hence maintain correct highlighting
                     * in the client side. 
                     * Added: encodeURIComponent(term)
                     * @author Vivek Kumar Murarka
                        */
                    q: lastWord(encodeURIComponent(term)),
                    limit: options.max
                }, extraParams),
                success: function(data) {
                    var parsed = options.parse && options.parse(data) || parse(data);
                    cache.add(term, parsed);
                    success(term, parsed);
                }
            });
        } else {
            // if we have a failure, we need to empty the list -- this prevents the the [TAB] key from selecting the last successful match
            select.emptyList();
            failure(term);
        }
    };
    
    /*
     * Field Reference:
     * ----------------
     * site_name = Site Name Mentioned in typeahead application context for a site
     * image_url_prefix = Prefix URL to suite mtv standard and will fetch images from mtv image repository.
     * image_size = Size of the image that needs to be downloaded from mtv image repository. Will be appended with image_url_prefix
     * image_field_name = SOLR Image field name. If this is has not come with the feed, then (../images/no_photo_icon_big.gif) this image will be shown.
     * data_column = SOLR data field name to be displayed on the drop down.
     * redirect_url = Any URL without search keyword. Search keyword will be appended at the last before redirect.
     * redirect_url_field_name = If the redirect URL itself fully coming from SOLR, this field will be used, else it will be left blank.
     * extra_display = This is specially for Music ring tone requirement to suite the display format[data_column + " by " + extra_display ](Example : Poker face by Lady gaga)
     *
     *
     */
    
    var siteReference = {    
        "root":{"sites":[
                 {
                 "site_name":"rmp",
                 "data_column":"teacherfullname_s",
                     "extra_display":"schoolname_s",
                     "extra_display1":"schoolcity_s",
                          "to_select":"pk_id"
                 }
                ]
               }};
 var redirect_url = "";
 function parse(data) {
     var parsed = [];
     var myobj =  data; //(new function(){"return " + data})();
     data = myobj;
    var siteName = getSitename();
    var foundObj = "";
    var imagefieldName = "";
    var image_url_prefix = "";
    var extra_field_display = "";
    var extra_field_display1 = "";
    var redirect_url_display = "";
    var redirect_url_type = "";
    var redirect_url_partial = "";
    var image_url_partial = "";
    var image_url_type = ""
    var image_size = "";
        var to_select_field = "";
        var data_to_display = "term";

     for(var a=0; a<siteReference.root.sites.length; a++){
                   for(var b=0; b<extractJonsKeys(siteReference.root.sites[a]).length;b++){
                    if(siteReference.root.sites[a][extractJonsKeys(siteReference.root.sites[a])[b]] == getSitename()){
                       foundObj = siteReference.root.sites[a];
                        if(foundObj.image_field_name){
                            imagefieldName = foundObj.image_field_name;
                            image_url_prefix = foundObj.image_url_prefix;
                            if(foundObj.image_size){
                              image_size = foundObj.image_size;
                                            }
                          }
                        if(foundObj.data_column){
                            data_to_display = foundObj.data_column;
                        } 
                        if(foundObj.extra_display){
                            extra_field_display = foundObj.extra_display;
                        }  
                        if(foundObj.extra_display1){
                            extra_field_display1 = foundObj.extra_display1;
                        }  
                        if(foundObj.to_select){
                            to_select_field = foundObj.to_select;
                       }
                       if(foundObj.redirect_url){
                            redirect_url_display = foundObj.redirect_url;
                       }        
                       if(foundObj.redirect_url_type){
                            redirect_url_type = foundObj.redirect_url_type;
                       }
                       if(foundObj.image_url_type){
                            image_url_type = foundObj.image_url_type;
                       }
                       if(foundObj.image_url_partial){
                            image_url_partial = foundObj.image_url_partial;
                       }
                       if(foundObj.redirect_url_partial){
                            redirect_url_partial = foundObj.redirect_url_partial;
                       }
                       if(foundObj.redirect_url_field_name){
                            redirect_url_field_name = foundObj.redirect_url_field_name;
                       }
                      redirect_url = foundObj.redirect_url;
                    }
                 }
    }

     if(data.responseHeader){
            var column = extractJonsKeys(data.response.docs[0]);
            //fix for RMP site only, to handle {professor name, school name} format for all the records
            if (siteName == 'rmp' && column.length >= 1) {
                var matched=false;
                for(k=0;k<column.length;k++){
                   if (data_to_display == column[k]){ 
                     matched=true;
                     break;
                    // if the data column was not available in the first record it will add . In case of schools since teacher_fullname_s isn't available we change data_to_display to first column.
                   }
                }
                if(!matched){
                    data_to_display = column[0];
                }
            }
            var rows = data.response.docs.length;
            var imagekey = "";
            var imageURL = "";
        if(foundObj.image_url_prefix){
            for (var i=0;i < rows;i++){
              for(var k=0; k<column.length; k++){
                   if(extractJonsKeys(data.response.docs[i])[k]== imagefieldName){ imagekey = k + 1; image_url_prefix = image_url_prefix.replace('full_path','');}
              }
            }
        }
        var to_display = "";
            var to_select = "";
            var thumbnail_url = "";
            if (rows == 0){
                 if (data.spellcheck != undefined && data.spellcheck.suggestions[1] != undefined){
                  to_display += "<tr><td style='font-size:12px;color:red' >Did You Mean:&nbsp;&nbsp;&nbsp;</td><td>" + data.spellcheck.suggestions[1]['suggestion'] + "</td>";
                  to_display += "~~ "+ redirect_url + data.spellcheck.suggestions[1]['suggestion'];
                  to_select += "Term:" + data.spellcheck.suggestions[1]['suggestion'];
                 }else{
                   to_display += "No Suggestion available";
                 }
                 parsed[parsed.length] = {
                               data: to_select,
                                value: to_display,
                                result: to_select.replace("Term:", "")
                         };
                  }
        if(imagekey == "" && image_url_prefix!= "full_path"){
              for (var i=0; i < rows; i++) {
                var title = "";
                var city = "";

                for (var j=0; j < column.length; j++) {
                  title = data.response.docs[i][extra_field_display];
                  city = data.response.docs[i][extra_field_display1];
                  if(data_to_display == extractJonsKeys(data.response.docs[i])[j]){
                       //to_select+= "Term:" + data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]];
                                           to_select+= "Term:" + data.response.docs[i][to_select_field];
                       if(redirect_url_display == "full_path"){
                         if(redirect_url_type == "partial"){
                            thumbnail_url = "~~ "+ redirect_url_partial + data.response.docs[i][redirect_url_field_name];
                         }else{
                            redirect_url_type = "full_redirecturl_withterm";
                          thumbnail_url = "~~ URL:"+ data.response.docs[i][redirect_url_field_name];
                       }
                       }else{
                           thumbnail_url = "~~ "+ redirect_url ;
                        }
                        if(redirect_url_type == "partial"){
                          to_display += data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]] + thumbnail_url;
                        }else if(redirect_url_type == "full_redirecturl_withterm"){
                            to_display += data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]] + thumbnail_url;
                        }else{
                          if (title.length > 0) {
                            to_display += data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]] + ", " ;
                            if(data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]] != title){
                               to_display += title ;
                            }
                              to_display +=  ' <span class="city">' + city  + "</span>" + thumbnail_url + "~~" +data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]] + ", " + title ;
                          } else {
                              to_display += data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]] + ' <span class="city">' + city  + "</span>" + thumbnail_url + "~~" +data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]];
                          }
                        }
                  }

/*
                  if (extra_field_display == extractJonsKeys(data.response.docs[i])[j]){
                      title = data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]];
                  }

                  if (extra_field_display1 == extractJonsKeys(data.response.docs[i])[j]){
                      city = data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]];
                  }
*/
                } // End for loop
  
                if (to_display.length <= 0 && title.length > 0) {
                    // Display value for school type ahead comes from here
                    to_display += title + ' <span class="city">' + city + "</span>"  + thumbnail_url + "~~" + title;
                }

                parsed[parsed.length] = {
                              data: to_select,
                               value: to_display,
                               result: to_select.replace("Term:", "")
                        };
                 to_display ="";                    
                 to_select = "";
                 thumbnail_url = "";
            } // end outer for loop
        }else{
            if (rows == 0){
                 if (data.spellcheck != undefined && data.spellcheck.suggestions[1] != undefined){
                  to_display += "<tr><td style='font-size:12px;color:red' >Did You Mean:&nbsp;&nbsp;&nbsp;</td><td>" + data.spellcheck.suggestions[1]['suggestion'] + "</td>";
                  to_display += "~~ "+ redirect_url + data.spellcheck.suggestions[1]['suggestion'];
                  to_select += "Term:" + data.spellcheck.suggestions[1]['suggestion'];
                 }else{
                   to_display += "No Suggestion available";
                 }
                 if(to_display.indexOf("No Suggestion available") == -1) {
                       parsed[parsed.length] = {
                                 data: to_select,
                                  value: to_display,
                                  result: to_select.replace("Term:", "")
                           };
                      }
                 }
              for (var i=0; i < rows; i++) {
                    var imageToDisplay = "";
                    var title = "";
                   for (var j=0; j < column.length; j++) {
                            if(data_to_display == extractJonsKeys(data.response.docs[i])[j]){
                               to_display += data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]];
                               to_select+= "Term:" + data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]];
                            } 
                            if(extra_field_display == extractJonsKeys(data.response.docs[i])[j]){
                               title = data.response.docs[i][extractJonsKeys(data.response.docs[i])[j]];
                               if (title.length > 0) {
                                   to_display = title + " by " + to_display;
                               }
                            }
                            if(imagefieldName == extractJonsKeys(data.response.docs[i])[j]){
                               
                               if(image_url_type == "partial"){
                                 imageToDisplay = image_url_partial + data.response.docs[i][imagefieldName] + ".jpg";
                               }else{
                                 imageToDisplay = data.response.docs[i][imagefieldName];
                               }
                            }
                            if(redirect_url_display == "full_path"){
                               if(redirect_url_type == "partial"){
                                  thumbnail_url = "~~ URL"+ redirect_url_partial + data.response.docs[i][redirect_url_field_name];
                               }else{
                                  thumbnail_url = "~~ URL:"+ data.response.docs[i][redirect_url_field_name];
                               }
                            }else{
                               thumbnail_url += "~~ "+ redirect_url;
                            }
                            
                        }
                        image_url_prefix = image_url_prefix.replace('full_path','');
                        if(imageToDisplay == ""){
                          imageToDisplay = "../images/no_photo_icon_big.gif";
                        }
                        imageURL  = "<table><tr><td><img height='50px' width= '50px' src='" + image_url_prefix +imageToDisplay+image_size +"' />";
                        if(redirect_url_display=="full_path"){
                           to_display = imageURL + "</td>&nbsp;&nbsp;<td style='font-size:12px' >"+ to_display + "</td></tr></table>"+ thumbnail_url.replace("full_path","") ;
                        }else{
                          to_display = imageURL + "</td>&nbsp;&nbsp;<td style='font-size:12px' >"+ to_display + "</td></tr></table>"+ thumbnail_url + "~~"+to_display;
                        }
                     parsed[parsed.length] = {
                   data: to_select,
                   value: to_display,
                   result: to_select.replace("Term:", "")
            };
              to_display ="";                    
            to_select = "";
              redirect_url = "";
             }      
    }                   
     return parsed;
}else{
     for (var i=0; i < eval(data).length; i++) {
            var row = eval(data)[i];
            if (row) {
               parsed[parsed.length] = {
                 data: row,
                 value: "Term:"+row+ ", URL:http://www.google.com/search?hl=en&q="+row,
                 result: row
               };
            }
    }  
     return parsed;
 }
};




    function extractJonsKeys(obj, parent) {
        var jsonKeys = new Array();
        var j = 0;
        for (var i in obj) {
              if (parent) {
            jsonKeys[j++] = parent
           } else { 
            jsonKeys[j++] = i
           }
        if (typeof obj[i] == "object") {
            if (parent) { 
                extractJonsKeys(obj[i], parent + "." + i); 
            } else { 
                extractJonsKeys(obj[i], i); 
            }
           }
        }
           return jsonKeys;
    }


    function stopLoading() {
        $input.removeClass(options.loadingClass);
    };

};

$.Autocompleter.defaults = {
    inputClass: "ac_input",
    resultsClass: "ac_results",
    loadingClass: "ac_loading",
    minChars: 1,
    delay: 400,
    matchCase: false,
    matchSubset: false,
    matchContains: false,
    cacheLength: 10,
    max: 100,
    mustMatch: false,
    extraParams: {},
    selectFirst: true,
    formatItem: function(row) { return row[0]; },
    formatMatch: null,
    autoFill: false,
    width: 0,
    multiple: false,
    multipleSeparator: ", ",
    highlight: function(value, term) {
        return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
    },
    scroll: true,
    scrollHeight: 180
};

$.Autocompleter.Cache = function(options) {

    var data = {};
    var length = 0;
    
    function matchSubset(s, sub) {
        if (!options.matchCase) 
            s = s.toLowerCase();
        var i = s.indexOf(sub);
        if (i == -1) return false;
        return i == 0 || options.matchContains;
    };
    
    function add(q, value) {
        if (length > options.cacheLength){
            flush();
        }
        if (!data[q]){ 
            length++;
        }
        data[q] = value;
    }
    
    function populate(){
        if( !options.data ) return false;
        // track the matches
        var stMatchSets = {},
            nullData = 0;

        // no url was specified, we need to adjust the cache length to make sure it fits the local data store
        if( !options.url ) options.cacheLength = 1;
        
        // track all options for minChars = 0
        stMatchSets[""] = [];
        
        // loop through the array and create a lookup structure
        for ( var i = 0, ol = options.data.length; i < ol; i++ ) {
            var rawValue = options.data[i];
            // if rawValue is a string, make an array otherwise just reference the array
            rawValue = (typeof rawValue == "string") ? [rawValue] : rawValue;
            
            var value = options.formatMatch(rawValue, i+1, options.data.length);
            if ( value === false )
                continue;
                
            var firstChar = value.charAt(0).toLowerCase();
            // if no lookup array for this character exists, look it up now
            if( !stMatchSets[firstChar] ) 
                stMatchSets[firstChar] = [];

            // if the match is a string
            var row = {
                value: value,
                data: rawValue,
                result: options.formatResult && options.formatResult(rawValue) || value
            };
            
            // push the current match into the set list
            stMatchSets[firstChar].push(row);

            // keep track of minChars zero items
            if ( nullData++ < options.max ) {
                stMatchSets[""].push(row);
            }
        };

        // add the data items to the cache
        $.each(stMatchSets, function(i, value) {
            // increase the cache size
            options.cacheLength++;
            // add to the cache
            add(i, value);
        });
    }
    
    // populate any existing data
    setTimeout(populate, 25);
    
    function flush(){
        data = {};
        length = 0;
    }
    
    return {
        flush: flush,
        add: add,
        populate: populate,
        load: function(q) {
            if (!options.cacheLength || !length)
                return null;
            /* 
             * if dealing w/local data and matchContains than we must make sure
             * to loop through all the data collections looking for matches
             */
            if( !options.url && options.matchContains ){
                // track all matches
                var csub = [];
                // loop through all the data grids for matches
                for( var k in data ){
                    // don't search through the stMatchSets[""] (minChars: 0) cache
                    // this prevents duplicates
                    if( k.length > 0 ){
                        var c = data[k];
                        $.each(c, function(i, x) {
                            // if we've got a match, add it to the array
                            if (matchSubset(x.value, q)) {
                                csub.push(x);
                            }
                        });
                    }
                }                
                return csub;
            } else 
            // if the exact item exists, use it
            if (data[q]){
                return data[q];
            } else
            if (options.matchSubset) {
                for (var i = q.length - 1; i >= options.minChars; i--) {
                    var c = data[q.substr(0, i)];
                    if (c) {
                        var csub = [];
                        $.each(c, function(i, x) {
                            if (matchSubset(x.value, q)) {
                                csub[csub.length] = x;
                            }
                        });
                        return csub;
                    }
                }
            }
            return null;
        }
    };
};

$.Autocompleter.Select = function (options, input, select, config) {
    var CLASSES = {
        ACTIVE: "ac_over"
    };
    
    var listItems,
        active = -1,
        data,
        term = "",
        needsInit = true,
        element,
        list;
    
    // Create results
    function init() {
        if (!needsInit)
            return;
        element = $("<div/>")
        .hide()
        .addClass(options.resultsClass)
        .css("position", "absolute")
        .appendTo(document.body);
    
        list = $("<ul/>").appendTo(element).mouseover( function(event) {
            if(target(event).nodeName && target(event).nodeName.toUpperCase() == 'LI') {
                active = $("li", list).removeClass(CLASSES.ACTIVE).index(target(event));
                $(target(event)).addClass(CLASSES.ACTIVE);            
            }
        }).click(function(event) {
            $(target(event)).addClass(CLASSES.ACTIVE);
            select();
            // TODO provide option to avoid setting focus again after selection? useful for cleanup-on-focus
            input.focus();
            return false;
        }).mousedown(function() {
            config.mouseDownOnSelect = true;
        }).mouseup(function() {
            config.mouseDownOnSelect = false;
        });
        
        if( options.width > 0 )
            element.css("width", options.width);
            
        needsInit = false;
    } 
    
    function target(event) {
        var element = event.target;
        while(element && element.tagName != "LI")
            element = element.parentNode;
        // more fun with IE, sometimes event.target is empty, just ignore it then
        if(!element)
            return [];
        return element;
    }

    function moveSelect(step) {
        listItems.slice(active, active + 1).removeClass(CLASSES.ACTIVE);
        movePosition(step);
        var activeItem = listItems.slice(active, active + 1).addClass(CLASSES.ACTIVE);
        if(options.scroll) {
            var offset = 0;
            listItems.slice(0, active).each(function() {
                offset += this.offsetHeight;
            });
            if((offset + activeItem[0].offsetHeight - list.scrollTop()) > list[0].clientHeight) {
                list.scrollTop(offset + activeItem[0].offsetHeight - list.innerHeight());
            } else if(offset < list.scrollTop()) {
                list.scrollTop(offset);
            }
        }
    };
    
    function movePosition(step) {
        active += step;
        if (active < 0) {
            active = listItems.size() - 1;
        } else if (active >= listItems.size()) {
            active = 0;
        }
    }
    
    function limitNumberOfItems(available) {
        return options.max && options.max < available
            ? options.max
            : available;
    }
    
    function fillList() {
        list.empty();
        var max = limitNumberOfItems(data.length);
        for (var i=0; i < max; i++) {
            if (!data[i])
                continue;
            var formatted = options.formatItem(data[i].data, i+1, max, data[i].value, term);
            if ( formatted === false )
                continue;
            var li = $("<li/>").html( options.highlight(formatted, term) ).addClass(i%2 == 0 ? "ac_even" : "ac_odd").appendTo(list)[0];
            $.data(li, "ac_data", data[i]);
        }
        listItems = list.find("li");
        if ( options.selectFirst ) {
            listItems.slice(0, 1).addClass(CLASSES.ACTIVE);
            active = 0;
        }
        // apply bgiframe if available
        if ( $.fn.bgiframe )
            list.bgiframe();
    }
    
    return {
        display: function(d, q) {
            init();
            data = d;
            term = q;
            fillList();
        },
        next: function() {
            moveSelect(1);
        },
        prev: function() {
            moveSelect(-1);
        },
        pageUp: function() {
            if (active != 0 && active - 8 < 0) {
                moveSelect( -active );
            } else {
                moveSelect(-8);
            }
        },
        pageDown: function() {
            if (active != listItems.size() - 1 && active + 8 > listItems.size()) {
                moveSelect( listItems.size() - 1 - active );
            } else {
                moveSelect(8);
            }
        },
        hide: function() {
            element && element.hide();
            listItems && listItems.removeClass(CLASSES.ACTIVE);
            active = -1;
        },
        visible : function() {
            return element && element.is(":visible");
        },
        current: function() {
            return this.visible() && (listItems.filter("." + CLASSES.ACTIVE)[0] || options.selectFirst && listItems[0]);
        },
        show: function() {
            var offset = $(input).offset();
            element.css({
                width: typeof options.width == "string" || options.width > 0 ? options.width : $(input).width(),
                top: offset.top + input.offsetHeight,
                left: offset.left
            }).show();
            if(options.scroll) {
                list.scrollTop(0);
                list.css({
                    maxHeight: options.scrollHeight,
                    overflow: 'auto'
                });
                
                if($.browser.msie && typeof document.body.style.maxHeight === "undefined") {
                    var listHeight = 0;
                    listItems.each(function() {
                        listHeight += this.offsetHeight;
                    });
                    var scrollbarsVisible = listHeight > options.scrollHeight;
                    list.css('height', scrollbarsVisible ? options.scrollHeight : listHeight );
                    if (!scrollbarsVisible) {
                        // IE doesn't recalculate width when scrollbar disappears
                        listItems.width( list.width() - parseInt(listItems.css("padding-left")) - parseInt(listItems.css("padding-right")) );
                    }
                }
                
            }
        },
        selected: function() {
            var selected = listItems && listItems.filter("." + CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);
            return selected && selected.length && $.data(selected[0], "ac_data");
        },
        emptyList: function (){
            list && list.empty();
        },
        unbind: function() {
            element && element.remove();
        }
    };
};

$.Autocompleter.Selection = function(field, start, end) {
    if( field.createTextRange ){
        var selRange = field.createTextRange();
        selRange.collapse(true);
        selRange.moveStart("character", start);
        selRange.moveEnd("character", end);
        selRange.select();
    } else if( field.setSelectionRange ){
        field.setSelectionRange(start, end);
    } else {
        if( field.selectionStart ){
            field.selectionStart = start;
            field.selectionEnd = end;
        }
    }
    field.focus();
};

})(jQuery);
