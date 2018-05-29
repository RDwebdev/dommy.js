/**
	RDSolutions.CSSLite
	Author:	Riccardo Degni (http://www.rdsolutions.com)
	What:	Allows modern and super lite DOM navigation
**/

/*
	Utilities
*/
var _add = function() {
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
}

window['add'] = _add;
HTMLElement.prototype['add'] = _add;
HTMLCollection.prototype['add'] = _add;
NodeList.prototype['add'] = _add;


var _css = document.createElement('STYLE');
var addKeyFrames = null;
var animationFxCount = 0;

document.head.appendChild( _css );
_css = _css.sheet;

var addKeyFrames = function(name, frames){
	var pos = _css.length;
	_css.insertRule(
		"@keyframes " + name + "{" + frames + "}", pos);
} 

/*
	Extend the NodeList and HTMLCollection object
*/
var ElementListObj = {
	/*
		Method: css
	*/
	'css': function() {
		var args = arguments;
		var ret = {};
		this.forEach(function(el,i ) {
			ret[i] = el.css.apply(el, args);
		});
		return ret;
	}
}

NodeList.prototype.add(ElementListObj);
HTMLCollection.prototype.add(ElementListObj);

/*
	Extend the Element object
*/
HTMLElement.prototype.add({ 
	/*
		Method: css
		What:	sets or gets the css of the element
		How:	el.css('display');
				el.css(['display', 'color']);
				el.css('display', 'block');
				el.css({'display': 'block'});
	*/
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
				break;
		}
	},
	
	'fx': function(css) {
		var props = {
			'animation-name': 'fx' + animationFxCount,
			'animation-duration': '2s',
			'animation-fill-mode': 'forwards'
		};
        
        var cssStr = '{';
        var prop;
        for(prop in css) {
			cssStr += ' ' + prop + ': ' + css[prop] + '; ';
		}
        cssStr += '}';
        
        addKeyFrames(
			'fx' + animationFxCount, 
			'100% ' + cssStr
		);
        
        animationFxCount++;
        this.css(props);
	}
});

/*
	Extend the Window object
*/
window.add({
	/*
		Method: log
		What:	logs the arguments. Useful for debugging purposes
		How:	log(a, b, c);
	*/
	'log': function() {
		if( typeof(console) === 'undefined' ) return;
		for(var i=0; i<arguments.length; i++) {
			console.log(arguments[i]);
		}
	},
	
	/*
		Method: typeOf
		What:	returns the type of a variable
		How:	typeOf(a);
	*/
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
	
	/*
		Method: load
		What:	shortcut for window.load
	*/
	'load': function(fn) {
		window.onload = fn;
	},

	/*
		Method: $
		What:	shortcut for document.getElementById
		How:	$('a');
	*/
	'$': function(el) {
			var ret;
			var type = typeof(el);
			
			switch ( type ) {
				case 'string':
					ret = document.getElementById(el);
					break;
				
				case 'object':
					ret = el;
					break;
			}
			
			return ret;
	},
	
	/*
		Method: $$
		What:	returns an array of Elements matching a css query selector
		How:	$$('div#a div');
	*/
	'$$': function(sel) {
		var el = document.querySelectorAll(sel);
		return el.length == 1 ? el[0] : el;
	}

});