//Unit test class.
function UnitTest(name, desc, test) {
	this.name = name;
	this.description = desc;
	this.func = test;
}

UnitTest.prototype.execute = function() {
	try {
		return this.func();
	}
	catch (e) {
		return false;
	}
}

UnitTest.prototype.generateHTML = function() {
	
}

//Unit test collection class

function UnitTestCollection() {
	this._tests = new Array();
	this._t = 0;
	this._times = 0;
	this._successful = 0;
}

UnitTestCollection.prototype.add = function(test) {
	this._tests.push(test);
}

UnitTestCollection.prototype.next = function() {
	if (this._t < this._tests.length) {
		var result = this._tests[this._t++].execute();
		
		if (result == true) this._successful++;
		
		return {
			testName: this._tests[this._t - 1].name,
			testDescription: this._tests[this._t - 1].description,
			testResult: (result == true) ? 'SUCCESS' : 'FAILED',
			cssClass: (result == true) ? 'passed' : 'failed',
		};
	}
	else {
		this._times++;
		return 'done';
	}
}

UnitTestCollection.prototype.times = function() {
	return this._times;
}

UnitTestCollection.prototype.reset = function() {
	this._t = 0;
	this._successful = 0;
}

UnitTestCollection.prototype.successful = function() {
	return this._successful;
}

UnitTestCollection.prototype.size = function() {
	return this._tests.length;
}