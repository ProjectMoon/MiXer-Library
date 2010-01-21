/*
mixer.js: MiXer JavaScript library
*/

(function() {

this.bindable = function() {
	var tuple = {
		mixable: true,
		bindable: true,
		symbol: '',
	}
	
	return tuple;
}


this.mixable = function(symOrModule) {
	//Is this a module?
	if (symOrModule._mixer) {
		Mixer.mixerError('Warning', 'To make a mixable module, call mixableModule instead');
	}
	//Or is it a symbol?
	else {
		return {
			mixable: true,
			symbol: symOrModule,
		};
	}
};

this.mixableModule = function(mod) {
	//Ignore already-created modules
	if (mod._mixer) return;
	
	mod._mixer = {};
	
	var count = 0;
	for (var s in mod) {
		mod._mixer[s] = mod[s];
		count++;
	}
	
	Mixer._initProperties(mod);
	count--; //because of _mixer.
	mod.mixerProperties.mixables = count;
	mod.mixerProperties.nonMixables = 0;
	Mixer._initModule(mod);
	
	return mod;
}

this.module = function(mod) {
	//Ignore already-created modules
	if (mod._mixer) return;
	
	mod._mixer = {};
	
	//Process mixables: Add the symbol to the list
	//of mixable symbol and remap it to the module.
	var mixables = 0;
	var nonMixables = 0;
	for (var s in mod) {
		if (mod[s] !== mod.module && mod[s] !== mod.mixerProperties) {
			if (mod[s].mixable) {
				if (mod[s].bindable) {
					mod._mixer[s] = mod[s];			
				}
				else {
					mod._mixer[s] = mod[s].symbol;
					mod[s] = mod[s].symbol;
				}
				mixables++;
			}
			else {
				nonMixables++;
			}
		}
	}
	
	Mixer._initProperties(mod);
	mod.mixerProperties.mixables = mixables;
	mod.mixerProperties.nonMixables = 0;
	
	Mixer._initModule(mod);
	
	return mod;
};

this.Mixer = {
	settings: {
		collisions: 'append',
	},
	
	_initProperties: function(target) {
		target.mixerProperties = {};
		target.mixerProperties.collisions = new Array();
		target.mixerProperties.module = false;
		target.mixerProperties.protized = false;
		target.mixerProperties.mixables = 0;
		target.mixerProperties.nonMixables = 0;
		
		target.mixerProperties.append = function(otherProps) {
			target.mixerProperties.mixables += otherProps.mixables;
			target.mixerProperties.nonMixables += otherProps.nonMixables;
		};
	},
	
	mixerError: function(level, text) {
		alert('MiXer Error: [' + level + ']\n\n' + text);
	},
	
	containsFunction: function(obj, funcName) {
		if (obj[funcName])
			return true;
		else
			return false;
	},
	
	isModule: function(symbol) {
		if (symbol._mixer) {
			return symbol._mixer.module;
		}
		else {
			return false;
		}
	},
	
	isProtizedModule: function(symbol) {
		if (symbol.prototype) {
			if (symbol.prototype._mixer) {
				return symbol.prototype.mixerProperties.protized;
			}
			else {
				return false;
			}
		}
		else {
			if (symbol._mixer) {
				return symbol.mixerProperties.protized;
			}
			else {
				return false;
			}
		}
	},
	
	isMixable: function(module, symbol) {
		//Test on the whole module
		if (!symbol) {
			if (module.mixerProperties.nonMixables) {
				return (module.mixerProperties.nonMixables == 0);
			}
			else {
				return false;
			}
		}
		//Or on a specific symbol
		else {
			for (var s in module._mixer) {
				if (s == symbol) {
					return true;
				}
			}
			
			return false;
		}
	},
	
	_initModule: function(mod) {
		//Allow module to mix in to "classes."
		mod.exportTo = function(target) {		
			if (!target.prototype) {
				Mixer.mixerError('Critical', 'Mixing can only be done on prototypes');
				return;
			}
			else {
				Mixer._mixin(mod, target.prototype);
				Mixer._setupPrototype(target);
			}
		};
		
		//Single symbols
		mod.exportSymbolTo = function(symbolName, target) {
			Mxer._mix(mod, target, symbolName);
		}
		
		mod.bind = function(symName, value, target) {
			if (!target.prototype) {
				Mixer.mixerError('Critical', 'Mixing can only be done on prototypes');
			}
			else {
				Mixer._bind(mod, target.prototype, symName, value);
			}
		}
		
		//Protize creates a prototype from a module
		mod.protize = function(ctor) {
			var C;
			if (ctor) { C = ctor; }
			else { C = function() {} }
			
			if (!C.prototype) C.prototype = {};
			
			mod.exportTo(C);	
			Mixer._setupPrototype(C);
			
			C.prototype.mixerProperties.protized = true;
			return C;
		}
		
		mod.mixerProperties.module = true;	
	},
	
	//Attaches to function directly instead of prototype.
	_setupPrototype: function(target) {
		target.mixin = function(module) {
			if (!typeof this == 'function' || !this.prototype) {
				Mixer.mixerError('Critical', 'Mixing can only be done on prototypes');
			}
			else {
				Mixer._mixin(module, this.prototype);
			}
		};
		
		target.mix = function(module, symbolName) {
			if (!this.prototype) {
				Mixer.mixerError('Critical', 'Mixing can only be done on prototypes');
			}
			else {
				Mixer._mix(module, this, symbolName);
			}
		};
		
		target.override = function(module) {
			if (!typeof this == 'function' || !this.prototype) {
				Mixer.mixerError('Critical', 'Mixing can only be done on prototypes');
			}
			else {
				var oldSetting = Mixer.settings.collisions;
				Mixer.settings.collisions = 'override';
				Mixer._mixin(module, this.prototype);
				Mixer.settings.collisions = oldSetting;
			}
		}
		
	},
	
	//Implementation of mixin function. The accessible versions
	//call this with different parameters.
	_mixin: function(module, target) {
		if (!target._mixer) {
			target._mixer = {};
			Mixer._initProperties(target);
		}
			
		for (var s in module._mixer) {
			if (!module._mixer[s].bindable) {
				Mixer._doMix(target, s, module._mixer[s]);
			}
		}
		
		target.mixerProperties.append(module.mixerProperties);
	},
	
	//Implementation of mix for mixing in individual pieces of a module
	_mix: function(module, target, symName) {
		if (Mixer.isMixable(module, module[symName])) {
			Mixer._doMix(target, symName, module[symName]);
		}
	},
	
	//Does an actual mixin on a specific symbol.
	_doMix: function(target, s, symbol) {
		var props = target.mixerProperties;
		
		if (!Mixer.containsFunction(target, s)) {
			target[s] = symbol;
		}
		else {
			if (Mixer.settings.collisions === 'append') {
				if (!props.collisions[s]) {
					props.collisions[s] = 1;
				}
				target[s + '_' + props.collisions[s]] = symbol;
				props.collisions[s]++;
			}
			else if (Mixer.settings.collisions === 'override') {
				target[s] = symbol;
			}
		}
	},
	
	_bind: function(module, target, symName, value) {
		try {
			if (module._mixer[symName].bindable) {
				target[symName] = value;
			}
			else {
				alert('symbol not bindable');
			}
		}
		catch (e) {
			Mixer.mixerError('Critical', 'symbol ' + symName + ' does not exist in target');
		}
	},
};

})();
