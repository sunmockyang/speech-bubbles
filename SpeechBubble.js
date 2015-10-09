// SpeechBubble.js
// Sunmock Yang, September 2015

/*
Future plans
- Rounded tail
 */

function SpeechBubble(context) {
	this.context = context;

	// Attributes
	this.tailBaseWidth = 10;
	this.cornerRadius = 15;
	this.text = "";
	this.padding = 0;
	this.lineSpacing = 5;
	this.font = "Georgia";
	this.fontSize = 20;
	this.fontColor = "#900";
	this.panelBorderColor = "#333";
	this.panelFillColor = "#FFF"
	this.textAlign = SpeechBubble.ALIGN_LEFT;

	// Utility
	this.panelBounds = new Bounds(100, 100, 300, 100);
	this.target = {x: 100, y: 300};
};

SpeechBubble.TOP_SIDE = {name: "SPEECH_BUBBLE_TOP", normalVector: {x: 0, y: -1}, drawVector: {x: 1, y: 0}};
SpeechBubble.BOTTOM_SIDE = {name: "SPEECH_BUBBLE_BOTTOM", normalVector: {x: 0, y: 1}, drawVector: {x: -1, y: 0}};
SpeechBubble.LEFT_SIDE = {name: "SPEECH_BUBBLE_LEFT", normalVector: {x: -1, y: 0}, drawVector: {x: 0, y: -1}};
SpeechBubble.RIGHT_SIDE = {name: "SPEECH_BUBBLE_RIGHT", normalVector: {x: 1, y: 0}, drawVector: {x: 0, y: 1}};

SpeechBubble.ALIGN_LEFT = "SPEECH_BUBBLE_ALIGN_LEFT";
SpeechBubble.ALIGN_RIGHT = "SPEECH_BUBBLE_ALIGN_RIGHT";
SpeechBubble.ALIGN_CENTER = "SPEECH_BUBBLE_ALIGN_CENTER";

SpeechBubble.clamp = function(val, min, max) {
	return Math.min(Math.max(val, min), max);
};

SpeechBubble.prototype.setTarget = function(target) {
	this.target = target;
};

SpeechBubble.prototype.draw = function() {
	var formattedText = this.formatText();
	this.panelBounds.setSize(this.panelBounds.width, formattedText.height);

	var tailLocation = this.getTailLocation();

	this.context.beginPath();
	this.context.moveTo(this.panelBounds.left + this.cornerRadius, this.panelBounds.top);

	var cornerAngle = 1.5 * Math.PI;

	this.drawPanelWall(SpeechBubble.TOP_SIDE, tailLocation, this.panelBounds.right - this.cornerRadius, this.panelBounds.top);
	this.drawPanelCorners(this.panelBounds.right - this.cornerRadius, this.panelBounds.top + this.cornerRadius, cornerAngle, cornerAngle += 0.5 * Math.PI);

	this.drawPanelWall(SpeechBubble.RIGHT_SIDE, tailLocation, this.panelBounds.right, this.panelBounds.bottom - this.cornerRadius);
	this.drawPanelCorners(this.panelBounds.right - this.cornerRadius, this.panelBounds.bottom - this.cornerRadius, cornerAngle, cornerAngle += 0.5 * Math.PI);

	this.drawPanelWall(SpeechBubble.BOTTOM_SIDE, tailLocation, this.panelBounds.left + this.cornerRadius, this.panelBounds.bottom);
	this.drawPanelCorners(this.panelBounds.left + this.cornerRadius, this.panelBounds.bottom - this.cornerRadius, cornerAngle, cornerAngle += 0.5 * Math.PI);

	this.drawPanelWall(SpeechBubble.LEFT_SIDE, tailLocation, this.panelBounds.left, this.panelBounds.top + this.cornerRadius);
	this.drawPanelCorners(this.panelBounds.left + this.cornerRadius, this.panelBounds.top + this.cornerRadius, cornerAngle, cornerAngle += 0.5 * Math.PI);

	this.context.fillStyle = this.panelFillColor;
	this.context.fill();

	this.context.strokeStyle = this.panelBorderColor;
	this.context.stroke();
	
	this.context.closePath();

	this.drawText(formattedText.lines);
	// this.drawDebug();
};

SpeechBubble.prototype.formatText = function() {
	var words = this.text.split(" ");

	if (words.length == 0)
		return;

	this.context.font = this.fontSize + "px " + this.font;

	var lines = [words[0]];
	var lineLength = this.padding * 2 + this.cornerRadius * 2 + this.context.measureText(words[0]).width;

	for (var i = 1; i < words.length; i++) {
		var lineNum = lines.length - 1;
		var wordLength = this.context.measureText(" " + words[i]).width;

		if (lineLength + wordLength < this.panelBounds.width - this.padding * 2) {
			lines[lineNum] += " " + words[i];
			lineLength += wordLength;
		}
		else {
			lines.push(words[i]);
			lineLength = this.padding * 2 + this.cornerRadius * 2 + this.context.measureText(words[i]).width;
		}
	};

	var height = this.padding * 2 + this.cornerRadius * 2 + this.fontSize * lines.length + this.lineSpacing * (lines.length - 1);

	return {
		height: height,
		lines: lines
	};
};

SpeechBubble.prototype.drawText = function(lines) {
	this.context.font = this.fontSize + "px " + this.font;
	this.context.fillStyle = this.fontColor;
	this.context.textBaseline = "hanging";

	var verticalOffset = this.padding + this.cornerRadius;
	var horizontalOffset = this.panelBounds.left + this.padding + this.cornerRadius;

	for (var i = 0; i < lines.length; i++) {
		switch (this.textAlign) {
			case SpeechBubble.ALIGN_RIGHT:
				horizontalOffset = this.panelBounds.left + this.panelBounds.width - (this.padding + this.cornerRadius) - this.context.measureText(lines[i]).width;
			break;

			case SpeechBubble.ALIGN_CENTER:
				horizontalOffset = this.panelBounds.left + (this.panelBounds.width - this.context.measureText(lines[i]).width) / 2;
			break;
		}

		this.context.fillText(lines[i], horizontalOffset, this.panelBounds.top + this.padding + verticalOffset);
		verticalOffset += this.fontSize + this.lineSpacing;
	};
};

SpeechBubble.prototype.drawPanelWall = function(panelSide, tailLocation, toX, toY) {
	if (panelSide == tailLocation.side && !this.panelBounds.inBounds(this.target.x, this.target.y)) {
		var tailBaseVector = SpeechBubble.Utils.scaleVector(panelSide.drawVector, this.tailBaseWidth);
		var start = SpeechBubble.Utils.subVectors(tailLocation, tailBaseVector);
		var end = SpeechBubble.Utils.addVectors(tailLocation, tailBaseVector);

		this.drawTail(panelSide, start, end);
	}

	this.context.lineTo(toX, toY);
};

SpeechBubble.prototype.drawTail = function(panelSide, start, end) {
	this.context.lineTo(start.x, start.y);
	this.context.lineTo(this.target.x, this.target.y);
	this.context.lineTo(end.x, end.y);
};

SpeechBubble.prototype.drawPanelCorners = function(x, y, startAngle, endAngle) {
	if (this.cornerRadius > 0) {
		this.context.arc(x, y, this.cornerRadius, startAngle, endAngle);
	}
};

SpeechBubble.prototype.drawDebug = function() {
	this.context.strokeStyle = "#F00";
	this.context.beginPath();
	this.context.moveTo(this.panelBounds.getCenter().x, this.panelBounds.getCenter().y);
	this.context.lineTo(this.getTailLocation().x, this.getTailLocation().y);
	this.context.stroke();
	this.context.closePath();

	this.context.fillStyle = "#0F0";
	this.context.fillRect(this.target.x, this.target.y, 5, 5);
	this.context.fillRect(this.panelBounds.getCenter().x, this.panelBounds.getCenter().y, 5, 5);
	this.context.fillRect(this.getTailLocation().x, this.getTailLocation().y, 5, 5);
};

SpeechBubble.prototype.getTailLocation = function() {
	var x = 0, y = 0;
	var side = "";

	var boundsCenter = this.panelBounds.getCenter();
	var relativeTargetX = this.target.x - boundsCenter.x;
	var relativeTargetY = this.target.y - boundsCenter.y;

	var targetAspectRatio = relativeTargetX / relativeTargetY;
	var boundsAspectRatio = this.panelBounds.width / this.panelBounds.height;

	if (Math.abs(targetAspectRatio) < Math.abs(boundsAspectRatio))
	{
		// Top/bottom
		y = this.panelBounds.height/2 * Math.sign(relativeTargetY);
		x = relativeTargetX * (y / relativeTargetY);
		side = (Math.sign(relativeTargetY) > 0) ? SpeechBubble.BOTTOM_SIDE : SpeechBubble.TOP_SIDE;
		x = SpeechBubble.clamp(x, this.cornerRadius + this.tailBaseWidth - this.panelBounds.width/2, this.panelBounds.width/2 - this.tailBaseWidth - this.cornerRadius);
	}
	else
	{
		// Sides
		x = this.panelBounds.width/2 * Math.sign(relativeTargetX);
		y = relativeTargetY * (x / relativeTargetX);
		side = (Math.sign(relativeTargetX) > 0) ? SpeechBubble.RIGHT_SIDE : SpeechBubble.LEFT_SIDE;
		y = SpeechBubble.clamp(y, this.cornerRadius + this.tailBaseWidth - this.panelBounds.height/2, this.panelBounds.height/2 - this.tailBaseWidth - this.cornerRadius);
	}


	x += boundsCenter.x;
	y += boundsCenter.y;

	return {x: x, y: y, side:side};
};

SpeechBubble.Utils = {};
SpeechBubble.Utils.addVectors = function(a, b) {
	return {x: a.x + b.x, y: a.y + b.y};
};

SpeechBubble.Utils.subVectors = function(a, b) {
	return {x: a.x - b.x, y: a.y - b.y};
};

SpeechBubble.Utils.scaleVector = function(vec, t) {
	return {x: vec.x * t, y: vec.y * t};
};

function Bounds(top, left, width, height){
	this.top = (top) ? top : 0;
	this.left = (left) ? left : 0;
	this.width = (width) ? width : 0;
	this.height = (height) ? height : 0;

	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
};

Bounds.prototype.move = function(left, top) {
	this.top = top;
	this.left = left;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
};

Bounds.prototype.setSize = function(width, height) {
	this.width = width;
	this.height = height;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
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
