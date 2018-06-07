/**
*   DOMmy.JS
*   Author:    Riccardo Degni (http://www.rdsolutions.com)
*   What:      Allows modern and super lite DOM navigation, Elements Collections, 
*              CSS styles, FX animations through CSS3, Events, Storage, DOMReady
*   License:   MIT License
*   Copyright: Copyright (c) 2018 Riccardo Degni (http://www.rdsolutions.com)
**/

/**
*   GLOBAL METHODS
*   Utilities
**/
var Globals = {
    '_add': function() {
    	switch( arguments.length ) {
    		case 1:
    			var prop;
    			for(prop in arguments[0]) {
    				this[prop] = arguments[0][prop];
    			}
    			break;
    		
    		case 2:
    			this[arguments[0]] = arguments[1];
    			break;
    	}
    },
    
    'Elements': {
        'callMethod': function(methodName, args, thisObj) {
            thisObj.forEach(function(el, i) {
    			el[methodName].apply(el, args);
    		});
    		return thisObj;
        }
    }
};

[window, HTMLElement.prototype, HTMLCollection.prototype, NodeList.prototype, Object.prototype]
.forEach(function(obj, i) {
    obj['add']  = Globals._add;
});

/**
*   ELEMENT METHODS
*   Extend the NodeList and HTMLCollection object to call Element's methods on collection of Elements
**/
var ElementListObj = {};

['css', 'fx', 'attr', 'html', 'on', 'set', 'get']
.forEach(function(method, i) {
    ElementListObj[method] = function() {
        return Globals.Elements.callMethod(method, arguments, this);
    }
});

[NodeList.prototype, HTMLCollection.prototype]
.forEach(function(obj, i) {
    obj.add(ElementListObj);
});


/**
*   OBJECT METHODS
*   Extend the Object object
**/
if( !Object.prototype.forEach ) {
    Object.prototype.add({
       'forEach': function(fn) {
            var object = this, ret;
            
            Object.keys(object).forEach(function(key) {
            if (ret === false)
              return;
            
            ret = fn.call(null, object[key], key, object);
            });
            
            return object;
        }
    });
}

/**
*   ELEMENT METHODS
*   Extend the Element object
**/
HTMLElement.prototype.add({ 
/**
*	@ Method: css
*	@ What:	sets or gets the css of the element
*	@ How:	
*	el.css('display');
*	el.css(['display', 'color']);
*	el.css('display', 'block');
*	el.css({'display': 'block'});
**/
    'css': function() {
		var cssObj = window.getComputedStyle(this);
		switch( arguments.length ) {
			case 1:
				switch(window.typeOf(arguments[0])) {
					// set css
					case 'object':
						var prop;
						for(prop in arguments[0]) {
							this.style[prop] = arguments[0][prop];
						}
                        
                        return this;
						break;
					
					// get css
					case 'string':
						return cssObj.getPropertyValue(arguments[0]);
						break;
						
					case 'array':
						var ret = [];
						for(var i=0; i<arguments[0].length; i++) {
							ret[i] = cssObj.getPropertyValue(arguments[0][i]);
						}
						return ret;
						break;
				}
				break;
			
			// set css
			case 2:
				this.style[arguments[0]] = arguments[1]; //cssObj.setProperty(arguments[0], arguments[1]);
				return this;
                break;
		}
	},
    
/**
*	@ Method: attr
*	@ What:	sets or gets the attribute of the element
*	@ How:	
*	el.attr('src');
*	el.attr('src', 'myimg.jpg');
*	el.attr({'src', 'myimg.jpg'}, 'alt': 'alt text');
**/
    'attr': function() {
        switch( arguments.length ) {
            case 1:
                switch( typeOf( arguments[0] ) ) {
                    case 'string':
                        // get
                        return (this.hasAttribute(arguments[0])) ? this.getAttribute( arguments[0] ) : null;
                    
                    case 'object':
                        // set
                        var prop;
            			for(prop in arguments[0]) {
            				//this[prop] = arguments[0][prop];
                            this.setAttribute( prop, arguments[0][prop] );
            			}
                        return this;
                }
                break;
            
            case 2:
                this.setAttribute( arguments[0], arguments[1] );
                return this;
                break;
        }
        return this;
    },
	
/**
*	@ Method: fx
*	@ What:	produces a CSS3 animation on an element
*	@ How:	
*	el.fx({'color': 'red'}, 2000, callbackFn);
**/
    'fx': function(css, duration, callback, chainFx) {
        var duration = duration || 5;
		var props = {
			'transition-property': 'all',
            'transition-duration': duration + 's',
            'transition-timing-function': 'linear'
		};
        var fullDuration = duration*1000;
        var thisObj = this;
        if( typeOf(chainFx) == 'undefined' ) chainFx = false;
        
        if( this.chain == 0 ) {
            if(chainFx) this.chain++;
            
            this.css(props).css(css);
            
            if( callback ) 
                setTimeout(callback, fullDuration, this);
            
            if( chainFx ) {
                var el = this;  
                setTimeout(function() {
                    el.chain = 0;
                }, fullDuration);
            }
        }
        else if( chainFx ) {
            setTimeout(this.fx.bind(this, css, duration, callback, true), fullDuration+10);   //+10 prevents IE crazyness
        }
        
        return this;
	},
    
    'chain': 0,
    
/**
*	@ Method: on
*	@ What:	attaches and event to an element
*	@ How:	
*	el.on('click', fn);
*   el.on({'click': fn, 'mouseover': fn});
**/
    'on': function(eventName, fn, bubble) {
        var bubble = bubble ? true : false;
        
        switch ( window.typeOf(eventName) ) {
            case 'string':
                if (this.addEventListener) {                    
                    this.addEventListener(eventName, fn, bubble);
                } else if (this.attachEvent) {                  
                    this.attachEvent(eventName, fn);
                }
            break;
            
            case 'object':
                bubble = fn ? true : false;
                for(var evt in eventName) {
                    if (this.addEventListener) {                    
                        this.addEventListener(evt, eventName[evt], fn);
                    } else if (this.attachEvent) {                  
                        this.attachEvent(evt, eventName[evt]);
                    } 
                }
            break;
        }
        
        return this;
    },
    
/**
*	@ Method: html
*	@ What:	sets or gets the innerHTML of an element
*	@ How:	
*	el.html('new content');
*   el.html();
**/
    'html': function(html) {
        if(html) {
            this.innerHTML = html;
            return this;
        } else {
            return this.innerHTML;
        }
    },
    
    'storage': {},
    
/**
*	@ Method: set
*	@ What:	sets a storage value
*	@ How:	
*	el.set('a', 'a');
**/
    'set': function(name, value) {
        this.storage[name] = value;
        return this;
    },
    
/**
*	@ Method: get
*	@ What:	gets a storage value
*	@ How:	
*	el.get('a');
**/
    'get': function(name) {
        return typeOf(this.storage[name] != 'undefined') ? this.storage[name] : undefined;
    }
});

/*****
    WINDOW METHODS
	Extend the Window object
*****/

/**
*	@ Method: $$$
*	@ What:	fires the event handler when DOM is ready
*	@ How:	
*	$$$(fn)
**/
var DomReady = {
    'bindReady': function(handler) {
        var called = false;     
        function ready() {
            if (called) return;
            called = true;
            handler();
        }     
        if ( document.addEventListener ) {
            document.addEventListener( "DOMContentLoaded", function() {
                ready();
            }, false )
        } else if ( document.attachEvent ) { 
            if ( document.documentElement.doScroll && window == window.top ) {
                function tryScroll(){
                    if (called) return;
                    if (!document.body) return;
                    try {
                        document.documentElement.doScroll("left");
                        ready();
                    } catch(e) {
                        setTimeout(tryScroll, 0);
                    }
                }
                tryScroll();
            }
            document.attachEvent("onreadystatechange", function(){     
                if ( document.readyState === "complete" ) {
                    ready();
                }
            })
        }
        if (window.addEventListener)
            window.addEventListener('load', ready, false);
        else if (window.attachEvent)
            window.attachEvent('onload', ready);
    },
    
    'readyList': [], 
    
    '$$$': function (handler) {  
        if (!this.readyList.length) { 
            this.bindReady(function() { 
                for(var i=0; i<this.readyList.length; i++) { 
                    this.readyList[i]();
                } 
            }) 
        }   
        this.readyList.push(handler);
    }
};

window.add(DomReady);
window.add({
/**
*	@ Method: log
*	@ What:	logs the arguments. Useful for debugging purposes
*	@ How:	
*	log(a, b, c);
**/
	'log': function() {
		if( typeof(console) === 'undefined' ) return;
		console.log.apply(console, arguments);
	},
	
/**
*	@ Method: typeOf
*	@ What:	returns the type of a variable
*	@ How:	
*	typeOf(a);
**/
	'typeOf': function(variable) {
		var type = typeof(variable);
		
		switch(type) {
			case 'object':
				return Array.isArray(variable) ? 'array' : 'object'; 
				break;
			
			default:
				return type;
				break;
		}
	},

/**
*	@ Method: $
*	@ What:	returns an element by ID
*	@ How:	
*	$('a');
**/
	'$': function(el) {
		var type = typeof(el);
		
		switch ( type ) {
			case 'string':
				return document.getElementById(el);
				break;
			
			case 'object':
				return el;
				break;
		}	
	},
	
/**
*	@ Method: $$$
*	@ What:	returns an array of Elements matching a css query selector
*	@ How:	
*	$$('div#a div');
**/
	'$$': function(sel) {
		var el = document.querySelectorAll(sel);
		return el.length == 1 ? el[0] : el;
	}
});