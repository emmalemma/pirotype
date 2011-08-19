
# πrotype.js 
### JavaScript prototype mutation stolen from the gods ###
*_whyday, 2011*



##What?##

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


πrotype just adds a few basic methods to every object which make it conceptually
easier to modify their prototypes, and let you deal with the idea of prototype
chains (πchains) as a unit— where πchains are sort of like linked lists of objects.
Yes, that's a little silly. Happy _whyday!

##_why?##

To be completely honest, I'm not sure either. I've had, and read, several
conversations in the last week which were highly critical of mutable `__proto__`.
The difficulty seems to be that it's very hard to optimize, and no one can think
of a use for it that's very interesting— so of course it's discouraged, and smart
people don't play with it, and so in general we try to pretend that JavaScript
is a classical language and life is kinda boring.

I'm hoping that a few methods that actively encourage you to mess around with
the object prototype will inspire some people, in the spirit of _whyday, to
imagine what sorts of unusual, highly non-classical things mutating `__proto__`
can be really good for. And no, I'm not sure there are any... Let's find out 
together.

##Caveats##

1. I have only tested πrotype against V8. It should work the same way in any
implementation which provides `__proto__` and `Object.defineProperty`, but no guarantees.

2. I'm serious about it being hard to optimize. I've done benchmarks that show 10x or worse
slowdowns vs. boring but optimizable code. As always, you are responsible for the
speed of your own program. In case that isn't clear enough: Please — *I beg of 
you* — do not use this for anything real.

3. πrotype alters the Object prototype, since every object has a prototype. If that's
something which makes you squeamish, the concept of πrotype altogether will probably
baffle you. It may baffle you regardless. That's okay.

4. To mitigate conflicts, and to be *even hipper*, all πrotype methods are namespaced 
under `π` (Greek small letter pi, `U+03C0`). πrotype won't load if `{}.π` is defined.

(Yes, `π` in identifier names does not pass JSLint. Neither does accessing `__proto__`.)

##π##
The single most aggravating part of using prototypes is the name `__proto__`.
`{}.π` is useful shorthand, and may be able to fake it if a future ECMAScript
standard has finally killed off the last of the true πρmancers, or if `__proto__`
just isn't exposed on your platform.


	o =
		a: 1
		__proto__:
			b: 2
		
	> o.b, o.c			# 2, undefined 
	> o.π 				# { b: 2 }
	> o.π = { c: 3 } 	# { c: 3 }
	> o.b, o.c			# undefined, 3 


##πdel()##
Since `delete` doesn't work on `__proto__`, the `{}.πdel()` method is provided.
It simply sets `{}.π = Object.prototype`, and returns the original `π` as a
convenience.


	o =
		a: 1
		__proto__:
			b: 2
	> o.b 			# 2
	> o.πdel() 		# { b: 2 }
	> o.b			# undefined
	> o.π			# Object.prototype



##πflatten()##
`{}.πflatten()` returns a new object which has every property of `{}` defined on it.
Use this to convert πchains to boring objects.



	chain =
		a: 1
		__proto__:
			b: 2
			__proto__:
				c: 3
	> chain				# { a: 1 }
	> chain.πflatten()	# { a: 1, b: 2, c: 3}

	

##πtail##
One thing you might want to do when you work with πchains is refer to the tail
of the chain; that is, the last object in the chain before Object.prototype.
`{}.πtail` provides this object, while setting it replaces that object in the chain.


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



If `chain.π is Object.prototype`, then `chain.πtail is chain` and setting `chain.πtail`
is a no-op (since you're effectively saying to replace `chain` with a different object.)



	> o = a: 1
	> o.πtail = b: 2	# { b: 2 }
	> o.πflatten()		# { a: 1 }



##πpush()##
`{}.πpush o` sets `{}.πtail.π = o`, effectively appending one πchain to another,
and returns the original `{}`.


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



##πpop()##
`{}.πpop()` returns and removes `{}.πtail`.


	chain =
		a: 1
		__proto__:
			b: 2
			__proto__:
				c: 3

	console.log chain.πpop()		# { c: 3 }
	console.log chain.πflatten()		# { a: 1, b: 2 }

#πbind()()#
If you only want to merge two or more chains temporarily, the `{}.πbind` method
takes a list of chains and a function, and returns a function. When the returned
function is called, the chain is assembled, the function called with the chain as
`this`, and the chain is disassembled before returning, or in the event of an
exception.

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


##πcall()##
 `{}.πcall(...)` is simply an alias for `{}.πbind(...)()`.


	chain1.πcall chain2, chain3, -> @πflatten()	# { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }

##πshift()##
These ones I'm not so sure about. The metaphor starts to fall apart at some point...
For example, it makes no sense for `{}.πshift()` to return the object in question 
without a prototype. Instead, it removes the first prototype from the πchain 
and returns that.

	chain =
		a: 1
		__proto__:
			b: 2
			__proto__:
				c: 3

	> chain.πshift()		# { b: 2 }
	> chain.πflatten()		# { a: 1, c: 3 }


##πunshift()##
...and `{}.πunshift()` does the opposite.

	chain =
		a: 1
		__proto__:
			c: 3
		
	> chain.πunshift { b: 2 }		# { a: 1 }
	> chain.πflatten()				# { a: 1, b: 2, c: 3 }


###That's just to get you started.###
I'm sure that some of these methods are practically
useless, but some of them might have utility, and there are many I haven't thought
of or decided not to bother with. If this gets you started thinking, don't stop—
fork me!


###For contributors (if there's anyone out there as crazy as me):###
πrotype is written in [CoffeeScript](http://www.coffeescript.org/). A compiled 
JavaScript version is provided as a convenience. If you want to fork it, I recommend
you make your changes in the CoffeeScript— it's unlikely you'll be able to produce
as well-formed, readable JavaScript (no offense), and even if you can, it's a 
waste of your time. That's robot work. Personally, I treat the `.js` as compilation
output, which it is, and will not accept pull requests on it. Soz.

πrotype is MIT licensed.
