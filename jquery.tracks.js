/*!
* tracks.js
* @author Mike Nowak
* @version 0.1
*
* Copyright (c) 2013 Mike Nowak https://github.com/n0wak
* Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*
*/
(function( $ ) {
    "use strict";
    
    //
    // Tracking controllers.
    //
    var trackers = {              
        "ga.js" : {
            "event" : function(trackEvent) {
                window._gaq = window._gaq || [];
                window._gaq.push(['_trackEvent', trackEvent.category, trackEvent.action, trackEvent.label, trackEvent.value]);
            },
            "page" : function(trackPage) {
                window._gaq = window._gaq || [];            
                window._gaq.push(['_trackPageview', trackPage]);                
            },
            "social" : function (trackSocial) {
                /* to be implemented */
            }
        }         
    };


    var options = {
        "event" : "click",      // on what event we want to bind the tracker. Usually on click.
        "category" : "",        // Default name for the category. If an empty string, no tracking takes place. 
                                // Otherwise the default is used on all elements.
        "action" : "trigger",   // Default action. If category is set, this needs to be set as it's required by GA
                                // see https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
        "label" : "",           // Optional GA tracking option
        "value" : 0             // Optional GA tracking option
    };

    //
    // Checks for data-track json object with tracker settings
    //
    function parseJSONTrackingObject($el) {
        // ensure no exceptions are thrown from tracking data
        if (typeof $el.attr("data-track") !== "undefined") {
            try{
                var event = $.parseJSON($el.attr("data-track"));
                if(event){
                    return event;
                }
            } catch (e) {
                console.error('Bad tracking data : ' + e,e);
            }
        }
        return false;
    };
    
    //
    // Create a tracking object from data attributes.
    //
    function createTrackingObject($el) {
        var tobj = {
            "category" : $el.attr("data-track-category"),
            "action" : $el.attr("data-track-action"),
            "label" : $el.attr("data-track-label"),
            "value" : $el.attr("data-track-value"),
        };
        return (tobj.category === "")?false:tobj;
    }
    
    //
    // Ensure values in the tracking object exist and then trim them, otherwise use defaults.
    //
    function parseTrackingObject(trackObj) {
        var tobj = {
            "category" : (typeof trackObj.category === "undefined")?options.category:$.trim(trackObj.category),
            "action" : (typeof trackObj.action === "undefined")?options.action:$.trim(trackObj.action),
            "label" : (typeof trackObj.label === "undefined")?options.label:$.trim(trackObj.label),
            "value" : Math.floor((typeof trackObj.value === "undefined")?options.value:$.trim(trackObj.value))
        };
        return (tobj.category === "")?false:tobj;
    }
    
    //
    // Ensure our tracking object is all good
    //
    function parseDataToTrack($el) {
        var trackObj = false;
        if ($el) {
            trackObj = parseJSONTrackingObject($el);
        }
        if (trackObj !== false) { 
            return parseTrackingObject(trackObj); 
        }
        return parseTrackingObject(createTrackingObject($el));                
    }
    
    //
    // Push tracking event to all the trackers
    //
    function trackInternal(type, track) {
        // iterate through trackers
        for (var key in trackers) {
            if (trackers.hasOwnProperty(key)) { //not some other junk
                var fo = trackers[key];
                // Ensure right type of event
                if (type !== "page" && type !== "social") {
                    type = "event";
                }
                // If the tracker is a function we assume it is only
                // there for events so we pass along the track object
                if (typeof fo === "function") {
                    fo(track)
                // If the tracker is an object and has a function with
                // the name $type we call that 
                } else if (typeof fo[type] === "function") {
                    fo[type](track);
                }
                // Otherwise we don't do anything.
            }
        }
    }    
    
    function addTracker(name, tracker) {
        // If one of that name exists, cancel out
        if (typeof trackers[name] !== "undefined") {
            console.log ("Tracker " + name + " exists. Can not add.");
            return false;
        }
        // If it's a function add it to the tracker
        if (typeof tracker === "function") {
            trackers[name] = tracker;
        } else if (typeof tracker === "object") {
            var valid = ["event", "page", "social"]; // the only things we track
            var t = {}
            for (var i = 0; i < valid.length; i++) {
                if (typeof tracker[valid[i]] === "function") { // if there is a valid tracking function, add it
                   t[valid[i]] = tracker[valid[i]];
                }
            }
            trackers[name] = t;            
        }  
    }

    
    //
    // The main stuff
    //
    $.fn.tracks = function ( opts ) {
        // Iterate through options. All options are global now affecting all trackers. Might revisit.
        if (typeof opts === "object") {
            for (var i in opts) {
                options[i] = opts[i];
            }
        }
        
        //
        // the core of it
		return this.on(options.event, function(e) {
            var track = parseDataToTrack($(this));
            if (track !== false) {
                trackInternal('event', track);
            }
		});
    };
  
        
    //
    // Direct tracking requests
    //
    $.fn.tracks.page = function (trackPage) {     
        trackInternal('page', trackPage);  
    }        
    $.fn.tracks.event = function (track) {
        var trackObj = false;
        if (track instanceof jQuery) {
            trackObj = parseDataToTrack(track);
        } else if (typeof track === "object") {
            trackObj = track;
        }
        if (trackObj !== false) {
            trackInternal('event', parseTrackingObject(trackObj));
        }
    }
        
    //
    // Add a custom tracker for each tracking call. Fails if a tracker of that name exists.
    // name : String
    // tracker : Function / Object
    // If tracker is a function that immediately gets associated with 'event' tracking calls.
    // The tracker is an object it can contain a function for every tracking trigger you want
    // to handle. (event/page/social)    
    //
    $.fn.tracks.addTracker = function( name, tracker ) {        
        addTracker(name, tracker);             
    };
    
}( jQuery ));

