/************* LIBRARYMOUSE.JS************/
/* Created by Sunmock Yang. August 2013. */
/***** https://github.com/sunmockyang ****/

function LibraryMouse(element) {
    // Mouse Status
    this.x = this.y = 0;
    this.mouseover = false;
    this.clicked = this.LClicked = this.MClicked = this.RClicked = false;
    this.wheelDir = 0;

    // Element
    this.isStaticElement = false;
    this.elementX = this.elementY = 0;

    // Event Handlers
    var eClick, eLClick, eRClick,
        eDown, eMDown, eLDown, eRDown,
        eUp, eMUp, eLUp, eRUp,
        eDbl,
        eWheel,
        eOver, eOut,
        eMove;

    // Callbacks
    var _this = this;
    this.click = function (e) {
        _this.update(e);
        var t = eClick ? eClick(e) : false;
        _this.clicked = false;

        if (eLClick != null && e.button === 0) {
            _this.LClicked = false;
            return eLClick(e);
        }

        else if (eRClick != null && e.button === 2) {
            _this.RClicked = false;
            return eRClick(e);
        }

        return t;
    };

    this.mousedown = function (e) {
        _this.update(e);
        var t = eDown ? eDown(e) : false;
        _this.clicked = true;

        if (eLDown != null && e.button === 0){
            _this.LClicked = true;
            return eLDown(e);
        }

        else if (eMDown != null && e.button === 1){
            _this.MClicked = true;
            return eMDown(e);
        }

        else if (eRDown != null && e.button === 2){
            _this.RClicked = true;
            return eRDown(e);
        }

        return t;
    };

    this.mouseup = function (e) {
        _this.update(e);
        var t = eUp ? eUp(e) : false;
        _this.clicked = false;

        if (eLUp != null && e.button === 0){
            _this.LClicked = false;
            return eLUp(e);
        }

        else if (eMUp != null && e.button === 1){
            _this.MClicked = false;
            return eMUp(e);
        }

        else if (eRUp != null && e.button === 2){
            _this.RClicked = false;
            return eRUp(e);
        }

        return t;
    };

    this.doubleclick = function (e) {
        _this.update(e);
        _this.clicked = false;
        _this.LClicked = false;
        return eDbl(e);
    };

    this.mousewheel = function (e) { _this.update(e); _this.wheelDir = ((e.wheelDelta || e.detail) > 0) ? 1 : -1; return eWheel(e); };

    this.mouseover = function (e) { _this.update(e); _this.mouseover = true; return eOver(e); };
    this.mouseout = function (e) { _this.update(e); _this.mouseover = false; return eOut(e); };

    this.mousemove = function (e) { _this.update(e); return eMove(e); };

    this.removeEventListener = function(type){
        this.addEventListener(type, null);
    };

    this.addEventListener = function (type, callback) {
        var override = null;
        var add = (callback !== null);
        switch (type) {
            case "click":
                eClick = callback;
                break;
            case "leftclick":
                eLClick = callback;
                override = "click";
                break;
            case "rightclick":
                eRClick = callback;
                _toggleEventListener(add, "contextmenu", this.click);
                return;
                break;
            case "mousedown":
                eDown = callback;
                break;
            case "leftmousedown":
                eLDown = callback;
                override = "mousedown";
                break;
            case "middlemousedown":
                eMDown = callback;
                override = "mousedown";
                break;
            case "rightmousedown":
                eRDown = callback;
                override = "mousedown";
                break;
            case "mouseup":
                eUp = callback;
                break;
            case "leftmouseup":
                eLUp = callback;
                override = "mouseup";
                break;
            case "middlemouseup":
                eMUp = callback;
                override = "mouseup";
                break;
            case "rightmouseup":
                eRUp = callback;
                override = "mouseup";
                break;
            case "doubleclick":
                eDbl = callback;
                _toggleEventListener(add, "dblclick", this.doubleclick);
                return;
                break;
            case "mousewheel":
                eWheel = callback;
                _toggleEventListener(add, "DOMMouseScroll", this.mousewheel);
                break;
            case "mouseover":
                eOver = callback;
                break;
            case "mouseout":
                eOut = callback;
                break;
            case "mousemove":
                eMove = callback;
                break;
        }
        var temp = (override === null) ? type : override;
        _toggleEventListener(add, temp, this[temp]);
    }

    function _toggleEventListener(add, type, callback) {
        console.log(add, type);
        if (add) _this.element.addEventListener(type, callback);
        else _this.element.removeEventListener(type, callback);
    }

    this.init(element);
}

// Constructor
LibraryMouse.prototype.element = null;
LibraryMouse.prototype.init = function(element) {
    this.setElement(element);
}

LibraryMouse.prototype.addEventContainer = function (obj) {
    var funcs = ["click", "leftclick", "rightclick",
                "mousedown", "leftmousedown", "middlemousedown", "rightmousedown",
                "mouseup", "leftmouseup", "middlemouseup", "rightmouseup",
                "doubleclick",
                "mousewheel",
                "mouseover", "mouseout", "mousemove"];

    for (var i = 0; i < funcs.length; i++) {
        if (obj[funcs[i]])
            this.addEventListener(funcs[i], obj[funcs[i]]);
    }
}

LibraryMouse.prototype.setElement = function (element, isStatic) {
    this.element = element;
    this.isStaticElement = isStatic === undefined ? false : isStatic;
    if (this.isStaticElement) this.getOffset();
}

LibraryMouse.prototype.getOffset = function() {
    var _x = 0;
    var _y = 0;
    var element = this.element;

    if (element.offsetParent) {
        do {
            _x += element.offsetLeft;
            _y += element.offsetTop;
        } while (element = element.offsetParent);
    }

    this.elementX = _x;
    this.elementY = _y;
    return { y: _y, x: _x };
}

LibraryMouse.prototype.update = function (e) {
    if (!this.staticElement) {
        this.getOffset(this.element);
    }

    this.x = e.clientX - this.elementX;
    this.y = e.clientY - this.elementY;

    if (this.x > this.element.offsetWidth)
        this.x = this.element.offsetWidth;
    else if (this.x <= 0)
        this.x = 0;
    if (this.y > this.element.offsetHeight)
        this.y = this.element.offsetHeight;
    else if (this.y <= 0)
        this.y = 0;
}