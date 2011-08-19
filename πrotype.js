(function() {
  /*
  πrotype.js - JS prototype mutation stolen from the gods
  *_whyday, 2011*
  
  Copyright (C) 2011 by Adrian Cushman
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  */
  /*
  	mother = 
  		name: 'Sue'
  		eyes: 'green'
  		age: 35
  
  	father =
  		name: 'Jake'
  		hair: 'brown'
  		age: 33
  
  	child = { name: 'Billy' }.πbind mother, father, -> 
  		console.log "#{@name} has his mother's #{@eyes} eyes and his father's #{@hair} hair."
  	child()
  */
  var __slice = Array.prototype.slice;
  if ({}.π != null) {
    throw new Error('πrotype: `{}.π` is already defined.');
  }
  Object.defineProperty(Object.prototype, 'π', {
    get: function() {
      return Object.getPrototypeOf(this);
    },
    set: function(val) {
      return this.__proto__ = val;
    }
  });
  /*
  	o =
  		a: 1
  		__proto__:
  			b: 2
  		
  	> o.b, o.c			# 2, undefined 
  	> o.π 				# { b: 2 }
  	> o.π = { c: 3 } 	# { c: 3 }
  	> o.b, o.c			# undefined, 3 
  */
  Object.defineProperty(Object.prototype, 'πdel', {
    value: function() {
      var π;
      π = this.π;
      this.π = Object.prototype;
      return π;
    }
  });
  /*
  	o =
  		a: 1
  		__proto__:
  			b: 2
  	> o.b 			# 2
  	> o.πdel() 		# { b: 2 }
  	> o.b			# undefined
  	> o.π			# Object.prototype
  */
  Object.defineProperty(Object.prototype, 'πflatten', {
    value: function() {
      var k, o;
      o = {};
      for (k in this) {
        o[k] = this[k];
      }
      return o;
    }
    /*
    	chain =
    		a: 1
    		__proto__:
    			b: 2
    			__proto__:
    				c: 3
    	> chain				# { a: 1 }
    	> chain.πflatten()	# { a: 1, b: 2, c: 3}
    */
  });
  Object.defineProperty(Object.prototype, 'πtail', {
    get: function() {
      var tail, π;
      tail = this;
      while ((π = tail.π) !== Object.prototype) {
        tail = π;
      }
      return tail;
    },
    set: function(chain) {
      var ptail, tail, π, _ref;
      if (chain === this) {
        return;
      }
      tail = this;
      while ((_ref = (π = tail.π)) !== Object.prototype && _ref !== chain) {
        ptail = tail;
        tail = π;
      }
      return ptail != null ? ptail.π = chain : void 0;
    }
  });
  /*
  	chain =
  		a: 1
  		__proto__:
  			b: 2
  			__proto__:
  				c: 3
  				__proto__:
  					d: 4
  				
  	> chain.πtail						# { d: 4 }
  	> chain.πflatten()					# { a: 1, b: 2, c: 3, d: 4 }
  	> chain.πtail = e: 5 				# { e: 5 }
  	> chain.πflatten()					# { a: 1, b: 2, c: 3, e: 5 }
  */
  /*
  	> o = a: 1
  	> o.πtail = b: 2	# { b: 2 }
  	> o.πflatten()		# { a: 1 }
  */
  Object.defineProperty(Object.prototype, 'πpush', {
    value: function(chain) {
      this.πtail.π = chain;
      return this;
    }
    /*
    	chain =
    		a: 1
    		__proto__:
    			b: 2
    
    	chain2 =
    		c: 3
    		__proto__:
    			d: 4
    
    	> chain.πpush chain2 	# { a: 1 }
    	> chain.πflatten()		# { a: 1, b: 2, c: 3, d: 4 }
    */
  });
  Object.defineProperty(Object.prototype, 'πpop', {
    value: function() {
      var ptail, tail, π;
      tail = this;
      while ((π = tail.π) !== Object.prototype) {
        ptail = tail;
        tail = π;
      }
      return ptail.πdel();
    }
    /*
    	chain =
    		a: 1
    		__proto__:
    			b: 2
    			__proto__:
    				c: 3
    
    	console.log chain.πpop()		# { c: 3 }
    	console.log chain.πflatten()		# { a: 1, b: 2 }
    */
  });
  Object.defineProperty(Object.prototype, 'πbind', {
    value: function() {
      var fn, head, protos, _i;
      protos = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), fn = arguments[_i++];
      head = this;
      return function() {
        var args, chain, out, tail, tails, _j, _k, _l, _len, _len2, _len3;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        tails = [];
        tail = head;
        for (_j = 0, _len = protos.length; _j < _len; _j++) {
          chain = protos[_j];
          tail = tail.πtail;
          tails.push(tail);
          tail.π = chain;
          tail = chain;
        }
        try {
          console.log('fn:', fn);
          out = fn.apply(head, args);
        } catch (error) {
          for (_k = 0, _len2 = tails.length; _k < _len2; _k++) {
            tail = tails[_k];
            tail.πdel();
          }
          throw error;
        }
        for (_l = 0, _len3 = tails.length; _l < _len3; _l++) {
          tail = tails[_l];
          tail.πdel();
        }
        return out;
      };
    }
    /*
    	chain1 =
    		a: 1
    		__proto__:
    			b: 2
    	chain2 =
    		c: 3
    		__proto__:
    			d: 4
    	chain3 =
    		e: 5
    		__proto__:
    			f: 6
    
    	chainFlatten = chain1.πbind chain2, chain3, -> @πflatten()
    	
    	> chain1.πflatten(), chain2.πflatten(), chain3.πflatten() 	# { a: 1, b: 2 } { c: 3, d: 4 } { e: 5, f: 6 }
    	> chainFlatten()											# { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }
    	> chain1.πflatten(), chain2.πflatten(), chain3.πflatten()	# { a: 1, b: 2 } { c: 3, d: 4 } { e: 5, f: 6 }
    */
  });
  Object.defineProperty(Object.prototype, 'πcall', {
    value: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.πbind.apply(this, args)();
    }
  });
  Object.defineProperty(Object.prototype, 'πshift', {
    value: function() {
      var π;
      π = this.π;
      if (π === Object.prototype) {
        return this;
      }
      this.π = π.π;
      π.πdel();
      return π;
    }
    /*
    	chain =
    		a: 1
    		__proto__:
    			b: 2
    			__proto__:
    				c: 3
    
    	> chain.πshift()		# { b: 2 }
    	> chain.πflatten()		# { a: 1, c: 3 }
    
    */
  });
  Object.defineProperty(Object.prototype, 'πunshift', {
    value: function(chain) {
      chain.πpush(this.π);
      this.π = chain;
      return this;
    }
    /*
    	chain =
    		a: 1
    		__proto__:
    			c: 3
    		
    	> chain.πunshift { b: 2 }		# { a: 1 }
    	> chain.πflatten()				# { a: 1, b: 2, c: 3 }
    */
  });
}).call(this);
