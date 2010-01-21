//Create a collection of unit tests
var UNIT_TESTS = new UnitTestCollection();
var desc = ""; //temp storage for test descriptions

//mixable():
desc = "Tests the mixable() function by creating a JSON object with a single member that has mixable() called on it, then verifies that the transformations performed by mixable() are present.";
UNIT_TESTS.add(new UnitTest("mixable()", desc, function() {
	var X = {
		y: mixable(1),
	};
	
	if (X.y.mixable && X.y.symbol) {
		return true;
	}
	else {
		return false;
	}
}));


//module(), no mixables:
desc = "Tests the creation of a module without any mixable members by calling the module() function and then makes sure the _mixer property has been added, and makes sure that the single property has been copied over properly.";
UNIT_TESTS.add(new UnitTest("module(), no mixables", desc, function() {
	var X = module({
		y: 5,
	});
	
	if (X._mixer && X.y == 5) {
		return true;
	}
	else {
		return false;
	}
}));


//module(), with mixables:
desc = "Tests the creation of a basic module with mixable members. Verifies the mixable member creation by checking that the module's property has been copied to the _mixer property and the transformations performed by mixable() have been removed.";
UNIT_TESTS.add(new UnitTest("module(), with mixables", desc, function() {
	var X = module({
		y: mixable(5),
	});
	
	if (X._mixer.y == 5 && !X.y.mixable) {
		return true;
	}
	else {
		return false;
	}
}));

//mixableModule():
desc = "Tests the creation of a module whose members are all mixable. Performs the same checks as \"module(), with mixables\" in order to verify that everything went according to plan.";
UNIT_TESTS.add(new UnitTest("mixableModule()", desc, function() {
	var X = mixableModule({
		y: 5
	});
	
	if (X._mixer.y == 5 && !X.y.mixable) {
		return true;
	}
	else {
		return false;
	}
}));


//protize():
desc = "Tests the creation of a protized module to use as a prototype for object creation. Creates a mixable module, protizes it, declares an instance of the protized class, and then checks its properties.";
UNIT_TESTS.add(new UnitTest("protize()", desc, function() {
	var X = mixableModule({
		y: 5,
		method: function() {
			return (this.y == 5);
		},
	});
	
	var XClass = X.protize();
	var xInst = new XClass();
	
	if (xInst.y == 5 && xInst.method() == true
		&& xInst.mixerProperties.protized 
		&& XClass.prototype.mixerProperties.protized) {
		return true;
	}
	else {
		return false;
	}
}));


//mixin function verification
desc = "Verifies that the mixin function is only attached to a protized module's function object itself, not the function's prototype. Mixing is not done on the instance level.";
UNIT_TESTS.add(new UnitTest("mixin function verification", desc, function() {
	var X = mixableModule({
		y: 5,
		method: function() {
			return (this.y == 5);
		},
	});
	
	var XClass = X.protize();
	var xInst = new XClass();
	
	if (XClass.mixin && !XClass.prototype.mixin && !xInst.mixin) {
		return true;
	}
	else {
		return false;
	}
}));

//mix function verification
desc = "Verifies that the mix function is only attached to a protized module's function object itself, not the function's prototype. Mixing is not done on the instance level.";
UNIT_TESTS.add(new UnitTest("mix function verification", desc, function() {
	var X = mixableModule({
		y: 5,
		method: function() {
			return (this.y == 5);
		},
	});
	
	var XClass = X.protize();
	var xInst = new XClass();
	
	if (XClass.mix && !XClass.prototype.mix && !xInst.mix) {
		return true;
	}
	else {
		return false;
	}
}));

//Override test
desc = "Verifies functionality of the override mixin.";
UNIT_TESTS.add(new UnitTest("override()", desc, function() {
	var X = mixableModule({
		y: 5,
		method: function() {
			return 'from method 1';
		},
	});
	
	var Y = mixableModule({
		method: function() {
			return 'from method 2';
		}
	});
	
	var XClass = X.protize();
	XClass.override(Y);
	var xInst = new XClass();
	
	if (xInst.method() == 'from method 2') {
		return true;
	}
	else {
		return false;
	}
}));

//exportTo
desc = "Tests exportTo method of mixing in. The equivalent call is ClassName.mixin(Module).";
UNIT_TESTS.add(new UnitTest("Module.exportTo()", desc, function() {
	var X = mixableModule({
		y: 5,
		method: function() {
			return 'from method 1';
		},
	});
	
	function XClass() {};
	X.exportTo(XClass);
	
	var xInst = new XClass();
	
	if (XClass.mix && !XClass.prototype.mix && !xInst.mix) {
		return true;
	}
	else {
		return false;
	}
}));

//bindable: undefined initial state
desc = "Tests bindable symbols being undefined until they are bound.";
UNIT_TESTS.add(new UnitTest("bindable(): initial state == undefined", desc, function() {
	var X = mixableModule({
		y: bindable(),
	});
	
	var XClass = X.protize();
	var xInst = new XClass();
	
	if (!xInst.y) {
		return true;
	}
	else {
		return false;
	}
}));

//bindable
desc = "Tests actual binding of bindable symbols by attempting to bind a symbol that is bindable.";
UNIT_TESTS.add(new UnitTest("bindable(): successful binding", desc, function() {
	var X = mixableModule({
		y: bindable(),
	});
	
	var XClass = X.protize();
	var xInst = new XClass();
	X.bind('y', 5, XClass);
	
	if (xInst.y == 5) {
		return true;
	}
	else {
		return false;
	}
}));

//bindable
desc = "Tests binding error checking by attempting to bind a symbol that is not bindable, but does exist";
UNIT_TESTS.add(new UnitTest("bindable(): attempt to bind non-bindable", desc, function() {
	var X = mixableModule({
		y: 5,
	});
	
	var XClass = X.protize();
	var xInst = new XClass();
	var err = Mixer.mixerError;
	Mixer.mixerError = function() {}; //suppress alert message
	
	if (X.bind('y', 5, XClass) == false) {
		Mixer.mixerError = err;
		return true;
	}
	else {
		Mixer.mixerError = err;
		return false;
	}
}));
