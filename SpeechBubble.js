// SpeechBubble.js
// Sunmock Yang, September 2015

function SpeechBubble(context) {
	this.context = context;
	this.panelBounds = new Bounds(10, 10, 200, 100);
	this.target = {x: 100, y: 300};
}

SpeechBubble.prototype.draw = function() {
	this.context.strokeStyle = "#000";
	this.context.beginPath();
	this.context.moveTo(this.panelBounds.left, this.panelBounds.top);
	this.context.lineTo(this.panelBounds.left + this.panelBounds.width, this.panelBounds.top);
	this.context.lineTo(this.panelBounds.left + this.panelBounds.width, this.panelBounds.top + this.panelBounds.height);
	this.context.lineTo(this.panelBounds.left, this.panelBounds.top + this.panelBounds.height);
	this.context.lineTo(this.panelBounds.left, this.panelBounds.top);
	this.context.stroke();
	this.context.closePath();

	this.context.strokeStyle = "#F00";
	this.context.beginPath();
	this.context.moveTo(this.panelBounds.getCenter().x, this.panelBounds.getCenter().y);
	this.context.lineTo(this.getTargetIntersectionPoint().x, this.getTargetIntersectionPoint().y);
	this.context.stroke();
	this.context.closePath();

	this.context.fillStyle = "#0F0";
	this.context.fillRect(this.target.x, this.target.y, 5, 5);
	// this.context.fillRect(this.panelBounds.getCenter().x, this.panelBounds.getCenter().y, 5, 5);
	// this.context.fillRect(this.getTargetIntersectionPoint().x, this.getTargetIntersectionPoint().y, 5, 5);
};

SpeechBubble.prototype.getTargetIntersectionPoint = function() {
	var x = 0, y = 0;

	var boundsCenter = this.panelBounds.getCenter();
	var relativeTargetX = this.target.x - boundsCenter.x;
	var relativeTargetY = this.target.y - boundsCenter.y;

	var targetAspectRatio = relativeTargetX / relativeTargetY;
	var boundsAspectRatio = this.panelBounds.width / this.panelBounds.height;

	if (Math.abs(targetAspectRatio) < Math.abs(boundsAspectRatio))
	{
		y = this.panelBounds.height/2 * Math.sign(relativeTargetY);
		x = relativeTargetX * (y / relativeTargetY);
	}
	else
	{
		x = this.panelBounds.width/2 * Math.sign(relativeTargetX);
		y = relativeTargetY * (x / relativeTargetX);
	}

	x += boundsCenter.x;
	y += boundsCenter.y;

	return {x: x, y: y};
};

SpeechBubble.prototype.TailLocation = function() {
	var side = "";
	
	var boundsCenter = this.panelBounds.getCenter();
	var relativeTargetX = this.target.x - boundsCenter.x;
	var relativeTargetY = this.target.y - boundsCenter.y;
	var targetAspectRatio = relativeTargetX / relativeTargetY;
	var boundsAspectRatio = this.panelBounds.width / this.panelBounds.height;

	if (Math.abs(targetAspectRatio) < Math.abs(boundsAspectRatio)){
		side = (Math.sign(relativeTargetY) > 0) ? "bottom" : "top";
	}
	else {
		side = (Math.sign(relativeTargetX) > 0) ? "right" : "left";
	}

	return side;
};

function Bounds(top, left, width, height){
	this.top = (top) ? top : 0;
	this.left = (left) ? left : 0;
	this.width = (width) ? width : 0;
	this.height = (height) ? height : 0;
};

Bounds.prototype.getCenter = function() {
	return {
		x: this.left + this.width/2,
		y: this.top + this.height/2
	}
};

Bounds.prototype.inBounds = function(x, y) {
	return (x > this.left &&
		x < this.left + this.width &&
		y > this.top &&
		y < this.top + this.height);
};

// Give a point in global space, return point in bound space
Bounds.prototype.relativePoint = function(x, y) {
	return {
		x: x - this.left,
		y: y - this.top
	};
};
