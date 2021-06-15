function start(imageUrl) {
    var preload = new Preload(
        new FreshUrl(imageUrl),
        500, true),
    screenShot = new ScreenShot($('#screenShot'));

    preload.on(screenShot.load.bind(screenShot)).start();
  
    screenShot.setDisplay('full', []);
}

function FreshUrl(sBaseUrl) {
    var self = this,
    rand = Math.random();
    this.current = function () {
        return sBaseUrl + '?' + rand;
    };
    this.fresh = function () {
        rand = Math.random();
        return self.current();
    };
}

function Preload(oUrl, iMinInterval, bLoop) {
    var self = this,
    interval = iMinInterval,
    timer = null,
    preload = $('<img>'),
    stat_loaded = false,
    stat_timeout = false,
    begin,
    restart = bLoop === undefined ? false : bLoop,
    actions = [];
    $('body').append(preload);
    preload.css('display', 'none').load(loaded);

    this.delta = 0;
    this.changeRate = function (iMinInterval) {
        if (iMinInterval !== undefined) {
            interval = iMinInterval;
        }
        return interval;
    };
    this.loop = function (bLoop) {
        restart = bLoop === undefined ? true : bLoop;
        return this;
    };
    this.stop = function () {
        window.clearInterval(timer);
        stat_timeout = false;
        return this;
    };
    this.on = function (func) {
        actions.push(func);
        return this;
    };
    this.start = function () {
        self.run(true);
    };
    this.run = function (first) {
        begin = new Date();
        if (first === true) {
            stat_timeout = true;
        } else {
            stat_timeout = false;
            timer = window.setTimeout(timeout, interval); // start Timeout
        }
        stat_loaded = false;
        preload.attr('src', oUrl.fresh()); // start Loading
        return this;
    };
    function loaded() {
        stat_loaded = true;
        checkAction();
    }
    function timeout() {
        stat_timeout = true;
        checkAction();
    }
    function checkAction() {
        if (!stat_timeout || !stat_loaded) {
            return;
        }
        self.delta = (new Date()) - begin;
        fire();
        if (restart) {
            self.run();
        }
    }
    function fire() {
        for (var i in actions) {
            actions[i].call(null, oUrl.current(), preload.width(), preload.height());
        }
    }
}

function ScreenShot(oImageelement) {
    var w = 1,
    h = 1,
    resize_flex = resize_full,
    args = [];
    this.load = function (url, nW, nH) {
        oImageelement.attr('src', url);
        if ((nW != w) || (nH != h)) {
            w = nW;
            h = nH;
            resize_flex.apply(this, args);
        }
        return this;
    };

    this.resize = function () {
        resize_flex.apply(this, args);
    };

    this.setDisplay = function (sType, aArgs) {
        if (sType == 'ratio' || sType == 1) {
            resize_flex = resize_ratio;
            args = aArgs;
        } else if (sType == 'free' || sType == 2) {
            resize_flex = resize_free;
            args = aArgs;
        } else { // 'full'
            resize_flex = resize_full;
            args = [];
        }
        resize_flex.apply(this, args);
        return this;
    };

    function resize_full() {
        resize_raw(0, w, h, 0);
    }

   /* function resize_ratio(tilesVertical, col, tilesHorizontal, row) {
        var tileWidth  = w/tilesVertical,
        tileHeigth = h/tilesHorizontal;
        resize_raw(
            row * tileHeigth,
            (col+1) * tileWidth,
            (row+1) * tileHeigth,
            col * tileWidth
            );
    }

    function resize_free(top, right, bottom, left) {
        resize_raw(
            top * h,
            right * w,
            bottom * h,
            left * w
        );
    }
*/
    function resize_raw(top, right, bottom, left) {
        var imgWidth = right - left,
        imgHeight = bottom - top,
        factor = Math.min(
            window.innerWidth/imgWidth,
            window.innerHeight/imgHeight
            ),
        newHeight = factor * imgHeight,
        newWidth = factor * imgWidth,
        divCSS = {
            top:      Math.round((window.innerHeight - newHeight)/2),
            left:     Math.round((window.innerWidth  - newWidth)/2),
            height:   Math.round(newHeight),
            width:    Math.round(newWidth)
        },
        imgCSS = {
            top:      -Math.round(factor * top),
            left:     -Math.round(factor * left),
            width:    Math.round(factor * w),
            height:   Math.round(factor * h)
        };
        oImageelement.css(imgCSS).parent().css(divCSS);
    }
}

