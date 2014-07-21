/*
 * Copyright 2014, hugohua
 *
 * Released on: 2014-07-20 10:44:38 PM  hugohua
*/
(function(window){
    window.rAF = window.requestAnimationFrame	||
    window.webkitRequestAnimationFrame	||
    window.mozRequestAnimationFrame		||
    window.oRequestAnimationFrame		||
    window.msRequestAnimationFrame		||
    function (callback) { window.setTimeout(callback, 1000 / 60); }
})(window);

(function(window,$){
    //防止重复加载
    if (window.Pui) {
        return
    }

var Pui = window.Pui ={
    version: '0.1.0'
};

Pui.mix = function(to, from) {
    for (var i in from) {
        to[i] = from[i];
    }
    return to;
};




Pui.mix(Pui,{

    $win:$(window),

    $doc:$(document),

    /**
     * 页面模块
     * @param name
     * @param func 公共方法
     */
    add:function(name,func){
        var exports = {},
            returnVal,
            me = this;
        if(typeof name !== 'string'){
            $.error(name + '必须是个字符串！');
            return;
        }


        //如果之前就有这个对象 就直接合并
        //name
        me[name] = me[name] || {};
        //将func里面的export参数抽取出来，用于合并到Pui命名空间上
        //同时判断是否存在return值,将jq传入
        returnVal = func(exports,me,$);
        //判断返回值是否是对象
        if(returnVal && $.isPlainObject(returnVal)){
            $.extend(exports,returnVal);
        }
        for(var i in exports){
            me[name][i] = exports[i];
            //如果有init的话 就立即执行
            if(i === 'init'){
                exports[i]();
            }else if(i === 'lazyInit'){
                //1s后执行
                (function(i){
                    setTimeout(function(){
                        me[name][i]();
                    },1000)
                })(i);
            }else if(i === 'winLoad'){
                //win load 后执行
                (function(i){
                    me.$win.load(function(){
                        me[name][i]();
                    })
                })(i);

            }
        }
        //断开引用 回收内存
        exports = null;
    },

    /**
     * 检测浏览器是否支持css属性
     * @param prop: CSS3的属性
     * @returns {boolean}
     */
    supports:function(prop){
        var div = document.createElement('div'),
            vendors = 'Khtml Ms O Moz Webkit'.split(' '),
            len;
        if (prop in div.style) return true;

        prop = prop.replace(/^[a-z]/, function(val) {
            return val.toUpperCase();
        });
        len = vendors.length - 1;
        while (len >= 0) {
            if (vendors[len] + prop in div.style) {
                return true;
            }
            len--;
        }
        return false;
    },
    /**
     * 当该函数被调用，wait毫秒后才执行，wait毫秒期间如果再次触发则重新计时。
     * @param func
     * @param wait
     * @param immediate
     * @returns {Function}
     */
    debounce:function(func, wait, immediate){
        var timeout, result;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;//最后一次调用时清除延时
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            //每次func被调用，都是先清除延时再重新设置延时，这样只有最后一次触发func再经过wait延时后才会调用func
            clearTimeout(timeout);//
            timeout = setTimeout(later, wait);
            //如果第一次func被调用 && immediate ->立即执行func
            if (callNow) result = func.apply(context, args);
            return result;
        };
    },
    /**
     * 无视一定时间内所有的调用
     * 函数调用的频度控制器
     * @param func
     * @param wait
     * @returns {Function}
     */
    throttle:function(func,wait){
        var context, args, timeout, throttling, more, result;
        //延时wait后将more  throttling 设置为false
        var whenDone = this.debounce(function(){
            more = throttling = false;
        }, wait);
        return function() {
            context = this; args = arguments;
            var later = function() {
                timeout = null;
                if (more) { //more：最后一次func调用时，确保还能再调用一次
                    result = func.apply(context, args);
                }
                whenDone();
            };
            if (!timeout) timeout = setTimeout(later, wait);
            if (throttling) {
                more = true;
            } else {
                //每次触发func 有会保证throttling 设置为true
                throttling = true;
                result = func.apply(context, args);
            }
            //每次触发func 在 wait延时后将 more  throttling 设置为false
            whenDone();
            return result;
        };
    },


    /**
     * 懒加载容器内的Image iframe等
     * @param $warp 容器
     */
    loadAsset:function($warp){
        var $asset = $warp.find('[data-src]');
        if(!$asset.length) return;
        $asset.each(function(){
            var $this = $(this),
                src = $this.attr('data-src');
            $this.attr('src',src).removeAttr('data-src');
        })
    }

});

(function(P){
// Cookie
// -------------
// Thanks to:
//  - http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
//  - http://developer.yahoo.com/yui/3/cookie/


    var Cookie = {};

    var decode = decodeURIComponent;
    var encode = encodeURIComponent;


    /**
     * Returns the cookie value for the given name.
     *
     * @param {String} name The name of the cookie to retrieve.
     *
     * @param {Function|Object} options (Optional) An object containing one or
     *     more cookie options: raw (true/false) and converter (a function).
     *     The converter function is run on the value before returning it. The
     *     function is not used if the cookie doesn't exist. The function can be
     *     passed instead of the options object for conveniently. When raw is
     *     set to true, the cookie value is not URI decoded.
     *
     * @return {*} If no converter is specified, returns a string or undefined
     *     if the cookie doesn't exist. If the converter is specified, returns
     *     the value returned from the converter.
     */
    Cookie.get = function(name, options) {
        validateCookieName(name);

        if (typeof options === 'function') {
            options = { converter: options };
        }
        else {
            options = options || {};
        }

        var cookies = parseCookieString(document.cookie, !options['raw']);
        return (options.converter || same)(cookies[name]);
    };


    /**
     * Sets a cookie with a given name and value.
     *
     * @param {string} name The name of the cookie to set.
     *
     * @param {*} value The value to set for the cookie.
     *
     * @param {Object} options (Optional) An object containing one or more
     *     cookie options: path (a string), domain (a string),
     *     expires (number or a Date object), secure (true/false),
     *     and raw (true/false). Setting raw to true indicates that the cookie
     *     should not be URI encoded before being set.
     *
     * @return {string} The created cookie string.
     */
    Cookie.set = function(name, value, options) {
        validateCookieName(name);

        options = options || {};
        var expires = options['expires'];
        var domain = options['domain'];
        var path = options['path'];

        if (!options['raw']) {
            value = encode(String(value));
        }

        var text = name + '=' + value;

        // expires
        var date = expires;
        if (typeof date === 'number') {
            date = new Date();
            date.setDate(date.getDate() + expires);
        }
        if (date instanceof Date) {
            text += '; expires=' + date.toUTCString();
        }

        // domain
        if (isNonEmptyString(domain)) {
            text += '; domain=' + domain;
        }

        // path
        if (isNonEmptyString(path)) {
            text += '; path=' + path;
        }

        // secure
        if (options['secure']) {
            text += '; secure';
        }

        document.cookie = text;
        return text;
    };


    /**
     * Removes a cookie from the machine by setting its expiration date to
     * sometime in the past.
     *
     * @param {string} name The name of the cookie to remove.
     *
     * @param {Object} options (Optional) An object containing one or more
     *     cookie options: path (a string), domain (a string),
     *     and secure (true/false). The expires option will be overwritten
     *     by the method.
     *
     * @return {string} The created cookie string.
     */
    Cookie.remove = function(name, options) {
        options = options || {};
        options['expires'] = new Date(0);
        return this.set(name, '', options);
    };


    function parseCookieString(text, shouldDecode) {
        var cookies = {};

        if (isString(text) && text.length > 0) {

            var decodeValue = shouldDecode ? decode : same;
            var cookieParts = text.split(/;\s/g);
            var cookieName;
            var cookieValue;
            var cookieNameValue;

            for (var i = 0, len = cookieParts.length; i < len; i++) {

                // Check for normally-formatted cookie (name-value)
                cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
                if (cookieNameValue instanceof Array) {
                    try {
                        cookieName = decode(cookieNameValue[1]);
                        cookieValue = decodeValue(cookieParts[i]
                            .substring(cookieNameValue[1].length + 1));
                    } catch (ex) {
                        // Intentionally ignore the cookie -
                        // the encoding is wrong
                    }
                } else {
                    // Means the cookie does not have an "=", so treat it as
                    // a boolean flag
                    cookieName = decode(cookieParts[i]);
                    cookieValue = '';
                }

                if (cookieName) {
                    cookies[cookieName] = cookieValue;
                }
            }

        }

        return cookies;
    }

    P.cookie = Cookie;


// Helpers

    function isString(o) {
        return typeof o === 'string';
    }

    function isNonEmptyString(s) {
        return isString(s) && s !== '';
    }

    function validateCookieName(name) {
        if (!isNonEmptyString(name)) {
            throw new TypeError('Cookie name must be a non-empty string');
        }
    }

    function same(s) {
        return s;
    }
})(Pui);


/***
 * Module based on jquery plugin from http://www.stoimen.com/blog/2010/02/26/jquery-localstorage-plugin-alpha
 * localStorage类，支持object，number类型
 */
(function(P){
    var ls = null,
        hasJSON = (typeof JSON !== 'undefined');

    if (typeof localStorage !== 'undefined') {
        ls = localStorage;
    }

    P.localStore = {
        set: function (key, value) {
            if (!ls || !P.localStore.canStore(value)) return false;
            ls.setItem(key, JSON.stringify(value));
            return true;
        },

        get: function (key) {
            if (!ls) return false;
            return JSON.parse(ls.getItem(key));
        },

        remove: function (key) {
            if (!ls) return false;
            ls.removeItem(key);
            return true;
        },

        canStore: function (value) {
            switch (typeof value) {
                case 'string':
                case 'number':
                    return true;
            }
            if (!hasJSON) {
                console && console.warn('localStore cannot serialise object data.');
            }
            return hasJSON;
        },

        clear: function () {
            ls.clear();
        }
    };

})(Pui);

/**
 * 客户端信息检测
 * @returns {{os, browser, engine, version}}
 */
(function(P){

    var detector = function(){
        var ua = navigator.userAgent.toLowerCase(),
            re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;

        function toString(object){
            return Object.prototype.toString.call(object);
        }

        function isString(object){
            return toString(object) === "[object String]";
        }


        var ENGINE = [
            ["trident", re_msie],
            ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/],
            ["gecko", /\bgecko\/(\d+)/],
            ["presto", /\bpresto\/([0-9.]+)/]
        ];

        var BROWSER = [
            ["ie", re_msie],
            ["firefox", /\bfirefox\/([0-9.ab]+)/],
            ["opera", /\bopr\/([0-9.]+)/],
            ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
            ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//]
        ];

        // 操作系统信息识别表达式
        var OS = [
            ["windows", /\bwindows nt ([0-9.]+)/],
            ["ipad", "ipad"],
            ["ipod", "ipod"],
            ["iphone", /\biphone\b|\biph(\d)/],
            ["mac", "macintosh"],
            ["linux", "linux"]
        ];

        var IE = [
            [6,'msie 6.0'],
            [7,'msie 7.0'],
            [8,'msie 8.0'],
            [9,'msie 9.0'],
            [10,'msie 10.0']
        ];

        var detect = function(client, ua){
            for(var i in client){
                var name = client[i][0],
                    expr = client[i][1],
                    isStr = isString(expr),
                    info;
                if(isStr){
                    if(ua.indexOf(expr) !== -1){
                        info = name;
                        return info
                    }
                }else{
                    if(expr.test(ua)){
                        info = name;
                        return info;
                    }
                }
            }
            return 'unknow';
        };

        return {
            os:detect(OS,ua),
            browser:detect(BROWSER,ua),
            engine:detect(ENGINE,ua),
            //只有IE才检测版本，否则意义不大
            version:re_msie.test(ua) ? detect(IE,ua) : ''
        };
    };

    var det = detector();

    P.detector = {
        os : det.os,
        engine : det.engine,
        browser : det.browser,
        version: det.version
    }

})(Pui);

/*!
 Underscore.js templates as a standalone implementation.
 Underscore templates documentation: http://documentcloud.github.com/underscore/#template
 Modifyed by hugohua
 */
(function (P) {

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    var templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /.^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        '\\': '\\',
        "'": "'",
        'r': '\r',
        'n': '\n',
        't': '\t',
        'u2028': '\u2028',
        'u2029': '\u2029'
    };

    for (var p in escapes) {
        escapes[escapes[p]] = p;
    }

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    var escapeChar = function(match) {
        return '\\' + escapes[match];
    };

    P.tmpl = function(text, data, settings) {
        settings = $.extend({}, settings, templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offest.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";

        try {
            var render = new Function(settings.variable || 'obj', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data);
        var template = function(data) {
            return render.call(this, data);
        };

        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';

        return template;
    };

}(Pui));
var widget_uuid = 0,
        widget_slice = [].slice;

    /**
     * widget工厂方法，用于创建插件
     * @method
     * @param {string} name 包含命名空间的插件名称，格式 xx.xxx
     * @param [base=Pui.Base] {object} base 需要继承的ui组件 （可选） 默认继承Pui.Base
     * @param {object} prototype 插件的实际代码
     * @return {Function} constructor
     */
    Pui.widget = function(name,base,prototype){
        var fullName,
            namespace = name.split( "." )[ 0 ],
            basePrototype,
            proxiedPrototype = {},
            constructor;

        name = name.split( "." )[ 1 ];
        fullName = namespace + "-" + name;
        //如果只有2个参数  base默认为Widget类，组件默认会继承base类的所有方法
        if ( !prototype ) {
            prototype = base;
            base = Pui.Base;
        }

        //创建一个自定义的伪类选择器
        //如 $(':pp-menu') 则表示选择定义了pp-menu插件的元素
        $.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
            return !!$.data( elem, fullName );
        };

        //将插件的调用方法暴露给Pui上，可统一用Pui.namespace来管理查看插件
        Pui[ namespace ] = Pui[ namespace ] || {};
        //实际创建的对象为 Pui.pp.plugin
        constructor = Pui[ namespace ][ name ] = function( element,options ) {
//            debugger;
            if ( !this._createWidget ) {
                return new constructor( element,options );
            }
            // allow instantiation without initializing for simple inheritance
            if ( arguments.length ) {
                this._createWidget( element , options );
            }
        };

        //赋值版本号
        constructor.version = prototype.version;

        //实例化父类 获取父类的  prototype
        basePrototype = new base();
        //继承
        //在传入的ui原型中有方法调用this._super 和this.__superApply会调用到base上（最基类上）的方法
        //主要是给prototype增加 调用父类的方法
        $.each( prototype, function( prop, value ) {
            //如果val不是function 则直接给对象赋值字符串
            if ( !$.isFunction( value ) ) {
                proxiedPrototype[ prop ] = value;
                return;
            }
            //如果val是func
            proxiedPrototype[ prop ] = (function() {
                //两种调用父类函数的方法
                var _super = function() {
                        //将当前实例调用父类的方法
                        return base.prototype[ prop ].apply( this, arguments );
                    },
                    _superApply = function( args ) {
                        return base.prototype[ prop ].apply( this, args );
                    };
//                debugger;
                return function() {
                    var __super = this._super,
                        __superApply = this._superApply,
                        returnValue;
//                debugger;
                    //在这里调用父类的函数
                    this._super = _super;
                    this._superApply = _superApply;

                    returnValue = value.apply( this, arguments );

                    this._super = __super;
                    this._superApply = __superApply;
                    return returnValue;
                };
            })();
        });

        // 给当前插件继承父类的所有原型方法和参数
        constructor.prototype = $.extend( true, {},basePrototype, {
            namespace: namespace,
            widgetName: name,
            widgetFullName: fullName,
            constructor:constructor,        //将constructor指向constructor变量，完善作用域链
            // 组件的事件名前缀，调用_trigger的时候会默认给trigger的事件加上前缀
            // 例如_trigger('create')实际会触发'tabscreate'事件
            widgetEventPrefix: constructor.prototype.widgetEventPrefix || name
        }, proxiedPrototype );

        //将此方法挂在jQuery对象上
        Pui.bridge( name, constructor );

        return constructor;
    };



Pui.Base = function(){};
Pui.Base.prototype = {
    /**
     * 创建插件的方法
     * @param element
     * @param options 插件的配置参数
     * @private
     */
    _createWidget:function(element , options){
        //插件最外层对象
        this.$el = $(element);
        //插件实例化个数
        this.uuid = widget_uuid++;
        //事件的命名空间
        this.eventNamespace = "." + this.widgetName + this.uuid;
        //插件的配置参数 支持data-xx的方式进行参数设置
        this.options = $.extend(true,{}, this.options, this.$el.data(), options);

        //缓存实例，单例 第一个参数：转为dom对象 用于存储实例
        $.data( this.$el[0], this.widgetFullName, this );
        //收集有事件绑定的dom
        //用于destroy
        this.bindings = $();
        // 开发者实现
        this._create();
        // 如果绑定了初始化的回调函数，会在这里触发。
        // 注意绑定的事件名是需要加上前缀的，如$('#tab1').bind('tabscreate',function(){});
        this._trigger( "create" );
        // 开发者实现
        this._init();
    },

    /**
     * 在页面调用widget的时候，就会执行此方法
     * Widget的绝大大多数行为和结构都是在这里进行创建及初始化的。
     * @method _create
     */
    _create     : $.noop,
    /**
     * 每次调用插件时会执行此方法
     * 与_create不同的是_create只调用一次，_init则在每次调用时都执行
     * @method _init
     */
    _init       : $.noop,
    /**
     * 销毁对象
     * @method _destroy
     */
    _destroy: $.noop,

    /**
     * 获取插件的dom warp
     * @method widget
     * @returns 当前插件的jquery dom对象
     */
    widget: function() {
        return this.$el;
    },

    /**
     * 设置选项函数
     * 支持直接通过插件$('#id').plugin('option',key,value)
     * @param {string|object} key
     * @param {*} value
     * @returns {*}
     */
    option: function( key, value ) {
        var options = key,
            parts,
            curOption,
            i;

        if ( arguments.length === 0 ) {
            // don't return a reference to the internal hash
            //返回一个新的对象，不是内部数据的引用
            return $.extend(true, {}, this.options );
        }

        if ( typeof key === "string" ) {
            // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
            options = {};
            parts = key.split( "." );
            key = parts.shift();
            if ( parts.length ) {
                curOption = options[ key ] = $.extend(true, {}, this.options[ key ] );
                for ( i = 0; i < parts.length - 1; i++ ) {
                    curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
                    curOption = curOption[ parts[ i ] ];
                }
                key = parts.pop();
                if ( arguments.length === 1 ) {
                    return curOption[ key ] === undefined ? null : curOption[ key ];
                }
                curOption[ key ] = value;
            } else {
                if ( arguments.length === 1 ) {
                    return this.options[ key ] === undefined ? null : this.options[ key ];
                }
                options[ key ] = value;
            }
        }

        this._setOptions( options );

        return this;
    },

    _setOptions: function( options ) {
        var key;

        for ( key in options ) {
            this._setOption( key, options[ key ] );
        }

        return this;
    },

    _setOption: function( key, value ) {
        this.options[ key ] = value;
        return this;
    },

    enable: function() {
        return this._setOptions({ disabled: false });
    },
    disable: function() {
        return this._setOptions({ disabled: true });
    },

    //销毁模块：去除绑定事件、去除数据、去除样式、属性
    destroy: function() {
        this._destroy();
        // we can probably remove the unbind calls in 2.0
        // all event bindings should go through this._on()
        this.$el
            .unbind( this.eventNamespace )
            .removeData( this.widgetFullName )

        // clean up events and states
        this.bindings.unbind( this.eventNamespace );
    },


    /**
     * $.widget中优化过的trigger方法。可以同时调用config中的方法和bind的方法。
     * 即可以用两个方式去给组件绑定事件。
     * Thanks to jquery ui widget _trigget
     * 如$("tabs").omTabs({"change":function(){//handler}});
     * 或者$("tabs").bind("tabschange",function(){//handler});
     * @method _trigger
     * @param type 事件类型
     * @param event 事件对象
     * @param data 数据
     * @returns {boolean}
     * @private
     */
    _trigger: function( type, event, data ){
        var prop, orig,
            callback = this.options[ type ];        //支持options的调用方式

        data = data || {};
        //将event转为jq的event对象
        event = $.Event( event );
        event.type = ( type === this.widgetEventPrefix ?
            type :
            this.widgetEventPrefix + type ).toLowerCase();
        // the original event may come from any element
        // so we need to reset the target on the new event
        event.target = this.$el[ 0 ];
        // copy original event properties over to the new event
        orig = event.originalEvent;
        if ( orig ) {
            for ( prop in orig ) {
                if ( !( prop in event ) ) {
                    event[ prop ] = orig[ prop ];
                }
            }
        }
        // 触发element中绑定的事件
        this.$el.trigger( event, data );
//            debugger
        return !( $.isFunction( callback ) &&
            callback.apply( this.$el[0], [ event ].concat( data ) ) === false ||
            event.isDefaultPrevented() );
    },

    /**
     * 事件绑定
     * @method _on
     * @param [suppressDisabledCheck=false] {boolean} suppressDisabledCheck
     * @param [element=this.$el] {jQuery} element
     * @param {Object} handlers
     */
    _on: function( suppressDisabledCheck, element, handlers ) {
        var delegateElement,
            instance = this;

        // no suppressDisabledCheck flag, shuffle arguments
        if ( typeof suppressDisabledCheck !== "boolean" ) {
            handlers = element;
            element = suppressDisabledCheck;
            suppressDisabledCheck = false;
        }

        // no element argument, shuffle and use this.element
        if ( !handlers ) {
            handlers = element;
            element = this.$el;
            delegateElement = this.widget();
        } else {
            // accept selectors, DOM elements
            element = delegateElement = $( element );
            //将事件绑定的对象添加进bindings
            this.bindings = this.bindings.add( element );
        }

        $.each( handlers, function( event, handler ) {
            function handlerProxy() {
                // allow widgets to customize the disabled handling
                // - disabled as an array instead of boolean
                // - disabled class as method for disabling individual parts
                //如果是disabled状态 则不触发事件
                if ( !suppressDisabledCheck && instance.options.disabled === true ) {
                    return;
                }
                //主要处理this指向问题
                return ( typeof handler === "string" ? instance[ handler ] : handler )
                    .apply( instance, arguments );
            }

            // copy the guid so direct unbinding works
            if ( typeof handler !== "string" ) {
                handlerProxy.guid = handler.guid =
                    handler.guid || handlerProxy.guid || $.guid++;
            }
            //处理带命名空间的事件名
            //如果是类似 'click li'则将li事件委派给$el
            var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
                eventName = match[1] + instance.eventNamespace,
                selector = match[2];
            if ( selector ) {
                delegateElement.delegate( selector, eventName, handlerProxy );
            } else {
                element.bind( eventName, handlerProxy );
            }
        });
    },

    /**
     * 取消事件绑定
     * @method _off
     * @param {jQuery} element
     * @param {String} eventName
     * @private
     */
    _off: function( element, eventName ) {
        eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
        element.unbind( eventName ).undelegate( eventName );
    },

    /**
     * 将模板转为html
     * @method tpl2html
     */
    tpl2html :function(){
        var tpl = this.template;
        console.info(tpl,'tpl')
    }

};
Pui.bridge = function(name, object){
    var fullName = object.prototype.widgetFullName || name;
    //定义一个插件
    $.fn[name] = function(options){
        var isMethodCall = $.type(options) === 'string',
            args = widget_slice.call( arguments, 1 ),
            returnValue = this;

        options = !isMethodCall && args.length ?
            $.extend.apply( null, [ true, options ].concat(args) ) :
            options;
        //这里对字符串和对象分别作处理
        if ( isMethodCall ) {
            this.each(function() {
                var methodValue,
                    instance = $.data( this, fullName );
                //如果传递的是instance则将this返回。
                if ( options === "instance" ) {
                    returnValue = instance;
                    return false;
                }

                //这里对私有方法的调用做了限制，直接调用会抛出异常事件
                if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
                    return $.error(options + "' 是 " + name + " 的私有方法，不可直接调用" );
                }
                //这里是如果传递的是字符串，则调用字符串方法，并传递对应的参数.
                //比如插件有个方法hide(a,b); 有2个参数：a，b
                //则调用时$('#id').menu('hide',1,2);//1和2 分别就是参数a和b了。
                methodValue = instance[ options ].apply( instance, args );
                //如果methodValue不是插件对象也不是undefined
                if ( methodValue !== instance && methodValue !== undefined ) {
                    //如果是methodValue是jq对象则自动设置jq链式调用 支持end()等方法回溯
                    //pushStack:http://www.learningjquery.com/2011/12/using-jquerys-pushstack-for-reusable-dom-traversing-methods/
                    //如：$('#id').plugin().end();
                    returnValue = methodValue && methodValue.jquery ?
                        returnValue.pushStack( methodValue.get() ) :
                        methodValue;
                    return false;
                }
            });
        } else {
            this.each(function() {
                var instance = $.data( this, fullName );

                if ( instance ) {
//                        instance.option( options || {} );
                    //这里每次都调用init方法
                    if ( instance._init ) {
                        instance._init();
                    }
                } else {
                    //缓存插件实例
                    $.data( this, fullName, new object( this,options ) );
                }
            });
        }
        return returnValue;
    }

};

//添加CMD支持 for seajs
if(typeof define === "function"){
    define(function(require, exports, module){
        module.exports = Pui;
    });
}

//this is window
})(window,jQuery,undefined);

(function($,P){
    $.extend( jQuery.easing,
        {
            easeInOutQuint: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
                return c/2*((t-=2)*t*t*t*t + 2) + b;
            }
        });
    var $win = P.$win,
        isIE6 = !-[1,]&&!window.XMLHttpRequest,
//        ltIE8 = P.detector.browser === 'ie' && P.detector.version < 8,
        scrollDom = (P.detector.engine === 'webkit') ? "body": "html";

    P.widget('pp.scrollnav',{

        options:{
            cssSlide        : '.page',              //关联的页面
            duration        : 600,                  //滚动速度
            easing          : 'easeInOutQuint',     //滚动效果
            clActive        : 'selected',            //选中态类名
            pagerSensitive  : null,                 //翻页灵敏度。下一页出现多少像素时才切换菜单的curIndex，为null时取值$win.height()/2
            offset          : 0,                        //偏移量
            cssNavItem      : 'a',                    //导航点击元素
            sticky          : false,                     //是否支持sticky
            cssSticky       :'scroll_fixed',             //支持sticky的情况下 加fixed类名
            hash            : false                     //是否支持hash定位
        },

        _create:function(){
            // 插件的菜单，就是点击滚动的小点
            this.$navItems = this.$el.find(this.options.cssNavItem);
            // 页面屏数 通过属性data-snav 与之关联
            var cssSlide = this.$el.attr('data-snav');
            cssSlide && ( this.options.cssSlide = cssSlide );
            // 将所有屏数的坐标值存进数组
            this.reset();
//            this.offsets = this._getPageOffset();
//            this.offsets = [743,1749,3546,6392];
            // 获取插件目前所在的位置（用于IE6无法使用fiexd的设置）
            this.top = this.$el.offset().top;
            //判断是否在动画中
            this.isAnimating=false;
            //当前的所在屏数
            this.curIndex = -1;
            //总屏数
            this.total = this.$navItems.length;
            this._bindEvt();
            this.options.hash && this._checkStatus();
        },

        /**
         * 判断当前状态
         * @private
         */
        _checkStatus:function(){
            var navs = parseInt(getUrlParam('navs','#'),10) || 0;
            if($.isNumeric(navs)){
                this.goTo(navs);
            }
        },

        /**
         * 绑定事件
         * @private
         */
        _bindEvt:function(){
            var that = this;
            that._on(that.$navItems,{
                'click':function(e) {
                    //获取点击所在的屏数
                    var index = that.$navItems.index(e.delegateTarget);
                    //跳转到相应的屏数
                    that.goTo(index);
                    //阻止元素本身的事件
                    e.preventDefault();
                }
            });
            //滚动条事件
            that._on($win,{
                'scroll':P.throttle(function(){
                    //更新频数索引值
                    that.updateSelectedNavIndex();
                    //更新导航菜单选中态
                    that.updateNav(that.curIndex);
                    //IE6则使用绝对定位
                    if(isIE6){
                        var scrolls = $(window).scrollTop();
                        that.$el.css({
                            position:'absolute',
                            top: scrolls + that.top
                        });
                    }
//                    console.log($(window).scrollTop());
                    
                    //是否支持sticky
                    if(that.options.sticky){
                        var y = $win.scrollTop();
                        if(y >= that.top){
                            that.$el.addClass(that.options.cssSticky);
                        }else{
                            that.$el.removeClass(that.options.cssSticky);
                        }
                    }
                },50)
            });
        },

        /**
         * 跳转到第几屏
         */
        goTo:function(idx){
            var that = this,
                s_top,
                dom;

            //已经当前页  || 当前正在动画中
            if (that.isAnimating) return;


            s_top = that.offsets[idx];      // 获取当前屏数的坐标值 s_  实际就是select_ 即选中的

            that.curIndex = idx;
            that.isAnimating = true;
            //更新导航菜单
            that.updateNav(idx);
            //console.log(idx);

            $(scrollDom).animate({
                scrollTop: s_top
            }, that.options.duration,that.options.easing,function(){
                that.isAnimating = false;
                that._trigger('done',null,{
                    index: +that.curIndex
                });
            });
        },

        /**
         * 跳转到上一屏
         */
        goPrev:function(){
            var idx = +this.curIndex - 1;
            if (idx<0) return;

            this.goTo(idx);
        },

        /**
         * 跳转到下一屏
         */
        goNext:function(){
            var idx = +this.curIndex + 1;
            if (idx>=this.total) return;
            this.goTo(idx);
        },

        /**
         * 更新导航菜单
         * @param index
         */
        updateNav:function(index){
            this.$navItems
                .removeClass(this.options.clActive)
                .eq(index)
                .addClass(this.options.clActive);
            //TODO urlparam 这里需要优化性能
            this.options.hash && setUrlParam('navs',index);
        },

        /**
         * 获取所有页面片的偏移量数据
         */
        _getPageOffset : function(){
            var arr = [],
                that = this;
            $(this.options.cssSlide).each(function(i){
                var $this = $(this),
                    top = $this.offset().top + that.options.offset;
                if(i==0){
                    top = $this.offset().top -140 ;
                }
//                console.log(top);
                
                arr.push(top);
            });
            return arr;
        },

        /**
         * 更新屏数索引
         */
        updateSelectedNavIndex : function(){
            //如果还在动画中 则不更新
            if (this.isAnimating) return;

            var  s_top = $win.scrollTop(), //当前滚动条的位置
                winHeight = $win.height(),
                pagerSensitive = this.options.pagerSensitive !== null ? this.options.pagerSensitive : (winHeight/2),
                idx = 0;
            for(var i in this.offsets)  {
                if ( (s_top+winHeight-this.offsets[this.total-i-1]) >= pagerSensitive ) {
                    idx = this.total-i-1;
                    break;
                }
            }//for

            if(this.curIndex !== idx){
                this.curIndex = idx;
                this._trigger('done',null,{
                    index: +idx
                });
            }
        },

        /**
         * 重新更新索引
         */
        reset : function(){
            this.offsets = this._getPageOffset();
        }


    })

})(jQuery,Pui);





























(function(P, $){

    P.widget('pp.lazyloader', {

        version:'0.1.0',

        //选项设置
        options: {
            srcLazyAttr: 'data-lazy', //img iframe lazyload属性名，值为真实地址
            moduleLazyAttr: 'data-lazy-module', //module lazyload属性名，值为module ID, ID作为回调事件的参数
            autoDestroy: true, //容器内的图片都加载完成时，是否自动停止监听
            dynamic: true, //是否有动态的内容插入
            threshold: 150, //预加载的距离
            moduleLoadCallback: null //模块加载回调 带 moduleLazyAttr值 和 module容器为参数
        },

        /*
         * 初始化
         * @private
        */
        _create: function () {
            var opts = this.options;
            this.container = this.$el;
            //若无动态插入的内容,缓存待加载的内容
            if (!opts.dynamic) {
                this._filterItems();
                //无加载内容
                if (this.srcLazyItems.length === 0 && this.moduleLazyItems.length === 0) {
                    return; 
                }
            }
            this._bindEvent();
            //初始化时执行load
            this.load();
            this.container.data('Lazyloader', this); //兼容原有
        },

        /*
         * 获取需lazyload的图片 和模块
         * @private
        */
        _filterItems: function () {
            var opts = this.options;
            this.srcLazyItems = this.container.find('[' + opts.srcLazyAttr + ']');
            this.moduleLazyItems = this.container.find('[' + opts.moduleLazyAttr + ']');
        },

        /*
         * 绑定事件
         * @private
        */
        _bindEvent: function () {
            var self = this;
            this._loadFn = function () {
                if (self.timer) {
                    window.clearTimeout(self.timer);
                }
                self.curTime = +new Date();
                if (!self.startTime) {
                    self.startTime = self.curTime;
                }
                if ((self.curTime - self.startTime) > 100) {
                    self.load();
                    self.startTime = undefined;
                    return;
                }
                self.timer = window.setTimeout(function () {
                    self.load();
                }, 30);
            };
            P.$win.on('resize.lazyloader' + ' scroll.lazyloader', this._loadFn);
        },

        /*
         * 加载lazy内容
         * @private
        */
        load: function () {
            //dynamic为true(存在动态内容)时，每次都取一次待加载内容
            var opts = this.options;
            if (opts.dynamic) {
                this._filterItems();
            }
            this._loadSrc();
            this._loadModule();
            //无动态插入时，更新待加载内容
            if (!opts.dynamic) {
                this._filterItems();
                //完全加载时，若autoDestroy为true，执行destroy
                if (this.srcLazyItems.length === 0 && this.moduleLazyItems.length === 0 && opts.autoDestroy) {
                    this.destroy();
                }
            }
        },


        /*
         * 加载资源
         * @private
        */
        _loadSrc: function () {
            var opts = this.options, self = this, attr = opts.srcLazyAttr, items = this.srcLazyItems;
            $.each(items, function () {
                var item = $(this), src, tagName = this.tagName.toLowerCase();
                if (self._isInViewport(item)) {
                    src = item.attr(attr);
                    item.hide();
                    if (tagName === 'img' || tagName === 'iframe') {
                        item.attr('src', src).removeAttr(attr);
                    } else {
                        item.css('background-image', 'url(' + src + ')').removeAttr(attr);
                    }
                    item.fadeIn();
                }
            });
        },

        /*
         * 加载模块
         * @private
        */
        _loadModule: function () {
            var opts = this.options, self = this, attr = opts.moduleLazyAttr, callback = opts.moduleLoadCallback, items = this.moduleLazyItems;
            $.each(items, function () {
                var item = $(this), id;
                if (self._isInViewport(item)) {
                    id = item.attr(attr);
                    item.removeAttr(attr);
                    if (typeof callback === 'function') {
                        callback(id, item);
                    }
                }
            });
        },

        /*
         * 是否在视窗中 暂只考虑垂直方向
         * @private
         * @param object 
        */
        _isInViewport: function (item) {
            var win = P.$win,
                scrollTop = win.scrollTop(),
                threshold = this.options.threshold,
                maxTop = scrollTop + win.height() + threshold,
                minTop = scrollTop - threshold,
                itemTop = item.offset().top,
                itemBottom = itemTop + item.outerHeight();
            if (itemTop > maxTop || itemBottom < minTop) {
                return false;
            }
            return true;
        },

        /*
         * 停止监听
         * @private
        */
        destroy: function () {
            P.$win.off('resize.lazyloader' + ' scroll.lazyloader', this._loadFn);
            this.container.removeData('Lazyloader').removeData('pp-lazyloader');
        }
    });
})(Pui, jQuery);


(function(P, $){

    P.widget('pp.slider', {

        version:'0.1.0',

        //选项设置
        options: {
            scroller: '.mod_slide_img',
            nav: '.mod_slide_nav',
            triggerEvent: 'mouseover',
            prevBtn: '.mod_slide_btn_pre',
            nextBtn: '.mod_slide_btn_next',
            curCls: 'on',
            index: 0,
            speed: 500,
            delay: 3000,
            needBtn: true,
            navTpl: '<li></li>', //需要index可 '<li>{index}<li>' index从1起
            btnTpl: '<a href="#" class="mod_slide_btn"><i></i></a>',
            preload: true, //配合lazyload使用，预加载下一帧
            lazyload: 'data-src',
            loadingCls: 'mod_loading',
            autoPlay: true,
            effect: 'fade',
            btnHoverShow: false, //是否需要hover时控制btn的显示
            useWebkitTransition: false
        },

        /**
         * 初始化
         * @private
         */
        _create: function () {
            var opts = this.options;
            this.element = this.$el; //兼容原有，后续再调整
            this.scroller = this.element.find(opts.scroller);
            this.slides = this.scroller.children();
            this.index = isNaN(opts.index) ? 0 : opts.index;
            if (opts.lazyload) {
                this._loadImg(this.index);
            }
            if (this.slides.length < 2) {
                return ;
            }
            this.navWrap = this.element.find(opts.nav)
            this._createNav();
            if (opts.needBtn) {
                this._createBtns();
            }
            this.nav = this.navWrap.children();
            this.speed = opts.speed;
            this.autoPlay = opts.autoPlay;
            this.delay = opts.delay;
            this.length = this.slides.length;
            this.maxIndex = this.length - 1;
            this.transition = 'webkitTransition' in document.body.style && opts.useWebkitTransition;
            this._initEffect();
            if (this.autoPlay) {
                this.play();
            }
            this._bindEvent();
        },

        /**
         * 效果函数集
         * TODO: use css3 transition
         */
        effectFns: {
            none: function(index){
                this.slides.hide().eq(index).show();
            },

            fade: function(index){
                var curIdx = this.index;
                this.slides.eq(curIdx).stop().css('z-index', 0).removeClass(this.options.curCls).animate({opacity: 0}, this.speed);
                this.slides.eq(index).stop().css('z-index', 1).addClass(this.options.curCls).animate({opacity: 1}, this.speed);
            },

            scrollX: function(index){
                this.scroller.stop().animate({'left': -index * this.stepWidth}, this.speed);
            },

            scrollY: function(index){
                this.scroller.stop().animate({'top': -index * this.stepWidth}, this.speed);
            }
        },




        /**
         * 绑定事件
         * @private
         */
        _bindEvent: function () {
            var opts = this.options, self = this;
            //导航事件
            this.nav.on(opts.triggerEvent, function(e){
                var index = self.nav.index($(this));
                if (index == self.index) {
                    return ;
                }
                self.slideTo(index);
            });

            //hover事件
            this.element.on('mouseenter', function(e){
                if (self.autoPlay) {
                    self.stop();
                }
                
            }).on('mouseleave', function(e){
                if (self.autoPlay) {
                    self.play();
                }
            });

            if (opts.needBtn) {
                if (opts.btnHoverShow) {
                    this.element.on('mouseenter', function(e){
                        self.prevBtn.fadeIn();
                        self.nextBtn.fadeIn();
                    }).on('mouseleave', function(e){
                        self.prevBtn.fadeOut();
                        self.nextBtn.fadeOut();
                    });
                }
                //前后按钮
                this.prevBtn.on('click', function(e){
                    e.preventDefault();
                    self.prev();
                });
                this.nextBtn.on('click', function(e){
                    e.preventDefault();
                    self.next();
                });
            }
            
            
        },

        /**
         * 生成导航节点
         * @private
         */
        _createNav: function () {
            if (this.navWrap.length == 0) {
                return ;
            }
            var tpl = this.options.navTpl, html = [];
            for (var i = 0, len = this.slides.length; i < len; i++) {
                var row = tpl.replace(/{index}/g, i + 1);
                html.push(row);
            }
            this.navWrap.html(html.join(''));
        },

        /**
         * 生成按钮
         * @private
         */
        _createBtns: function () {
            var opts = this.options, prevBtn = this.element.find(opts.prevBtn), nextBtn = this.element.find(opts.nextBtn);
            this.prevBtn = prevBtn.length === 0 ? $(opts.btnTpl).addClass(opts.prevBtn.substring(1)).appendTo(this.element) : prevBtn;
            this.nextBtn = nextBtn.length === 0 ? $(opts.btnTpl).addClass(opts.nextBtn.substring(1)).appendTo(this.element) : nextBtn;
        },

        /**
         * 初始化效果样式
         * @private
         */
        _initEffect: function () {
            var opts = this.options, effect = opts.effect, slides = this.slides, index = this.index;
            this.effectFn = this.effectFns[effect];
            switch(effect){
                case 'none':
                    slides.hide().eq(index).show();
                    break ;
                case 'fade':
                    slides.css({'opacity': 0, 'position': 'absolute', 'top': 0, 'left': 0, 'z-index': 0}).eq(index).css({'opacity': 1, 'z-index': 1}).addClass(this.options.curCls);
                    break ;
                case 'scrollX':
                    this.stepWidth = slides.eq(0).width();
                    this.scroller.css({'position': 'absolute', 'width': this.length * this.stepWidth, 'left': -index * this.stepWidth});
                    slides.css('float', 'left');
                    break ;
                case 'scrollY':
                    this.stepWidth = this.slides.eq(0).height();
                    this.scroller.css({'position': 'absolute', 'top': -index * this.stepWidth});
                    break ;
            }
            this._updateNav();
        },

        /**
         * 获取当前帧索引
         * @public
         * @return 当前索引
         */
        getIndex: function () {
            return this.index;
        },

        /**
         * 播放
         * @public
         */
        play: function () {
            var self = this;
            if (!this.timer) {
                this.timer = window.setInterval(function () {
                    self.next();
                }, this.delay);
            }
        },

        /**
         * 暂停
         * @public
         */
        stop: function () {
            if (this.timer) {
                window.clearInterval(this.timer);
                this.timer = null;
            }
        },

        /**
         * 滚动到指定帧
         * @public
         * @prama 帧索引
         */
        slideTo: function(index){
            var opts = this.options;
            if (index === this.index || index < 0 || index > this.maxIndex) {
                return ;
            }
            this.effectFn(index);
            this.index = index;
            this._updateNav();
            if (opts.lazyload) {
                this._loadImg(index)
            }
            //预加载下一帧图片
            if (opts.lazyload && opts.preload) {
                index = index === 0 ? this.maxIndex : index === this.maxIndex ? 0 : index;
                this._loadImg(index);
            }
        },

        /**
         * 下一帧
         * @public
         */
        next: function () {
            var index = this.index + 1;
            if (index > this.maxIndex) {
                index = index % this.length;
            }
            this.slideTo(index);
        },

        /**
         * 上一帧
         * @public
         */
        prev: function () {
            var index = this.index - 1;
            if (index < 0) {
                index = this.maxIndex;
            }
            this.slideTo(index);
        },

        /**
         * lazyload 图片
         * @private
         * TODO: 增加预加载下一帧功能
         */
        _loadImg: function(index){
            var self = this, img = this.slides.eq(index).find('img'), opts = this.options, lazyAttr = opts.lazyload, loadingCls = opts.loadingCls;
            var src = $(img).attr(lazyAttr);
            if (!src) {
                return ;
            }
            this.slides.eq(index).addClass(loadingCls);
            var imgObj = new Image();
            $(imgObj).on('load', function(e){
                img.attr('src', src).removeAttr(lazyAttr);
                self.slides.eq(index).removeClass(loadingCls);
            });
            imgObj.src = src;
        },

        /**
         * 更新导航状态
         * @private
         */
        _updateNav: function () {
            var index = this.index, curCls = this.options.curCls;
            this.nav.eq(index).addClass(curCls).siblings().removeClass(curCls);
        }


    });
})(Pui, jQuery);



// jquery.parallax.js
// 2.0
// Stephen Band
//
// Project and documentation site:
// webdev.stephband.info/jparallax/
//
// Repository:
// github.com/stephband/jparallax

(function(jQuery, undefined) {
	// VAR
	var debug = true,
	    
	    options = {
	    	mouseport:     'body',  // jQuery object or selector of DOM node to use as mouseport
	    	xparallax:     true,    // boolean | 0-1 | 'npx' | 'n%'
	    	yparallax:     true,    //
	    	xorigin:       0.5,     // 0-1 - Sets default alignment. Only has effect when parallax values are something other than 1 (or true, or '100%')
	    	yorigin:       0.5,     //
	    	decay:         0.66,    // 0-1 (0 instant, 1 forever) - Sets rate of decay curve for catching up with target mouse position
	    	frameDuration: 30,      // Int (milliseconds)
	    	freezeClass:   'freeze' // String - Class added to layer when frozen
	    },
	
	    value = {
	    	left: 0,
	    	top: 0,
	    	middle: 0.5,
	    	center: 0.5,
	    	right: 1,
	    	bottom: 1
	    },
	
	    rpx = /^\d+\s?px$/,
	    rpercent = /^\d+\s?%$/,
	    
	    win = jQuery(window),
	    doc = jQuery(document),
	    mouse = [0, 0];
	
	var Timer = (function(){
		var debug = false;
		
		// Shim for requestAnimationFrame, falling back to timer. See:
		// see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
		var requestFrame = (function(){
		    	return (
		    		window.requestAnimationFrame ||
		    		window.webkitRequestAnimationFrame ||
		    		window.mozRequestAnimationFrame ||
		    		window.oRequestAnimationFrame ||
		    		window.msRequestAnimationFrame ||
		    		function(fn, node){
		    			return window.setTimeout(function(){
		    				fn();
		    			}, 25);
		    		}
		    	);
		    })();
		
		function Timer() {
			var callbacks = [],
				nextFrame;
			
			function noop() {}
			
			function frame(){
				var cbs = callbacks.slice(0),
				    l = cbs.length,
				    i = -1;
				
				if (debug) { console.log('timer frame()', l); }
				
				while(++i < l) { cbs[i].call(this); }
				requestFrame(nextFrame);
			}
			
			function start() {
				if (debug) { console.log('timer start()'); }
				this.start = noop;
				this.stop = stop;
				nextFrame = frame;
				requestFrame(nextFrame);
			}
			
			function stop() {
				if (debug) { console.log('timer stop()'); }
				this.start = start;
				this.stop = noop;
				nextFrame = noop;
			}
			
			this.callbacks = callbacks;
			this.start = start;
			this.stop = stop;
		}

		Timer.prototype = {
			add: function(fn) {
				var callbacks = this.callbacks,
				    l = callbacks.length;
				
				// Check to see if this callback is already in the list.
				// Don't add it twice.
				while (l--) {
					if (callbacks[l] === fn) { return; }
				}
				
				this.callbacks.push(fn);
				if (debug) { console.log('timer add()', this.callbacks.length); }
			},
		
			remove: function(fn) {
				var callbacks = this.callbacks,
				    l = callbacks.length;
				
				// Remove all instances of this callback.
				while (l--) {
					if (callbacks[l] === fn) { callbacks.splice(l, 1); }
				}
				
				if (debug) { console.log('timer remove()', this.callbacks.length); }
				
				if (callbacks.length === 0) { this.stop(); }
			}
		};
		
		return Timer;
	})();
	
	function parseCoord(x) {
		return (rpercent.exec(x)) ? parseFloat(x)/100 : x;
	}
	
	function parseBool(x) {
		return typeof x === "boolean" ? x : !!( parseFloat(x) ) ;
	}
	
	function portData(port) {
		var events = {
		    	'mouseenter.parallax': mouseenter,
		    	'mouseleave.parallax': mouseleave
		    },
		    winEvents = {
		    	'resize.parallax': resize
		    },
		    data = {
		    	elem: port,
		    	events: events,
		    	winEvents: winEvents,
		    	timer: new Timer()
		    },
		    layers, size, offset;
		
		function updatePointer() {
			data.pointer = getPointer(mouse, [true, true], offset, size);
		}
		
		function resize() {
			size = getSize(port);
			offset = getOffset(port);
			data.threshold = getThreshold(size);
		}
		
		function mouseenter() {
			data.timer.add(updatePointer);
		}
		
		function mouseleave(e) {
			data.timer.remove(updatePointer);
			data.pointer = getPointer([e.pageX, e.pageY], [true, true], offset, size);
		}

		win.on(winEvents);
		port.on(events);
		
		resize();
		
		return data;
	}
	
	function getData(elem, name, fn) {
		var data = elem.data(name);
		
		if (!data) {
			data = fn ? fn(elem) : {} ;
			elem.data(name, data);
		}
		
		return data;
	}
	
	function getPointer(mouse, parallax, offset, size){
		var pointer = [],
		    x = 2;
		
		while (x--) {
			pointer[x] = (mouse[x] - offset[x]) / size[x] ;
			pointer[x] = pointer[x] < 0 ? 0 : pointer[x] > 1 ? 1 : pointer[x] ;
		}
		
		return pointer;
	}
	
	function getSize(elem) {
		return [elem.width(), elem.height()];
	}
	
	function getOffset(elem) {
		var offset = elem.offset() || {left: 0, top: 0},
			borderLeft = elem.css('borderLeftStyle') === 'none' ? 0 : parseInt(elem.css('borderLeftWidth'), 10),
			borderTop = elem.css('borderTopStyle') === 'none' ? 0 : parseInt(elem.css('borderTopWidth'), 10),
			paddingLeft = parseInt(elem.css('paddingLeft'), 10),
			paddingTop = parseInt(elem.css('paddingTop'), 10);
		
		return [offset.left + borderLeft + paddingLeft, offset.top + borderTop + paddingTop];
	}
	
	function getThreshold(size) {
		return [1/size[0], 1/size[1]];
	}
	
	function layerSize(elem, x, y) {
		return [x || elem.outerWidth(), y || elem.outerHeight()];
	}
	
	function layerOrigin(xo, yo) {
		var o = [xo, yo],
			i = 2,
			origin = [];
		
		while (i--) {
			origin[i] = typeof o[i] === 'string' ?
				o[i] === undefined ?
					1 :
					value[origin[i]] || parseCoord(origin[i]) :
				o[i] ;
		}
		
		return origin;
	}
	
	function layerPx(xp, yp) {
		return [rpx.test(xp), rpx.test(yp)];
	}
	
	function layerParallax(xp, yp, px) {
		var p = [xp, yp],
		    i = 2,
		    parallax = [];
		
		while (i--) {
			parallax[i] = px[i] ?
				parseInt(p[i], 10) :
				parallax[i] = p[i] === true ? 1 : parseCoord(p[i]) ;
		}
		
		return parallax;
	}
	
	function layerOffset(parallax, px, origin, size) {
		var i = 2,
		    offset = [];
		
		while (i--) {
			offset[i] = px[i] ?
				origin[i] * (size[i] - parallax[i]) :
				parallax[i] ? origin[i] * ( 1 - parallax[i] ) : 0 ;
		}
		
		return offset;
	}
	
	function layerPosition(px, origin) {
		var i = 2,
		    position = [];
		
		while (i--) {
			if (px[i]) {
				// Set css position constant
				position[i] = origin[i] * 100 + '%';
			}
			else {
			
			}
		}
		
		return position;
	}
	
	function layerPointer(elem, parallax, px, offset, size) {
		var viewport = elem.offsetParent(),
			pos = elem.position(),
			position = [],
			pointer = [],
			i = 2;
		
		// Reverse calculate ratio from elem's current position
		while (i--) {
			position[i] = px[i] ?
				// TODO: reverse calculation for pixel case
				0 :
				pos[i === 0 ? 'left' : 'top'] / (viewport[i === 0 ? 'outerWidth' : 'outerHeight']() - size[i]) ;
			
			pointer[i] = (position[i] - offset[i]) / parallax[i] ;
		}
		
		return pointer;
	}
	
	function layerCss(parallax, px, offset, size, position, pointer) {
		var pos = [],
		    cssPosition,
		    cssMargin,
		    x = 2,
		    css = {};
		
		while (x--) {
			if (parallax[x]) {
				pos[x] = parallax[x] * pointer[x] + offset[x];
				
				// We're working in pixels
				if (px[x]) {
					cssPosition = position[x];
					cssMargin = pos[x] * -1;
				}
				// We're working by ratio
				else {
					cssPosition = pos[x] * 100 + '%';
					cssMargin = pos[x] * size[x] * -1;
				}
				
				// Fill in css object
				if (x === 0) {
					css.left = cssPosition;
					css.marginLeft = cssMargin;
				}
				else {
					css.top = cssPosition;
					css.marginTop = cssMargin;
				}
			}
		}
		
		return css;
	}
	
	function pointerOffTarget(targetPointer, prevPointer, threshold, decay, parallax, targetFn, updateFn) {
		var pointer, x;
		
		if ((!parallax[0] || Math.abs(targetPointer[0] - prevPointer[0]) < threshold[0]) &&
		    (!parallax[1] || Math.abs(targetPointer[1] - prevPointer[1]) < threshold[1])) {
		    // Pointer has hit the target
		    if (targetFn) { targetFn(); }
		    return updateFn(targetPointer);
		}
		
		// Pointer is nowhere near the target
		pointer = [];
		x = 2;
		
		while (x--) {
			if (parallax[x]) {
				pointer[x] = targetPointer[x] + decay * (prevPointer[x] - targetPointer[x]);
			}
		}
			
		return updateFn(pointer);
	}
	
	function pointerOnTarget(targetPointer, prevPointer, threshold, decay, parallax, targetFn, updateFn) {
		// Don't bother updating if the pointer hasn't changed.
		if (targetPointer[0] === prevPointer[0] && targetPointer[1] === prevPointer[1]) {
			return;
		}
		
		return updateFn(targetPointer);
	}
	
	function unport(elem, events, winEvents) {
		elem.off(events).removeData('parallax_port');
		win.off(winEvents);
	}
	
	function unparallax(node, port, events) {
		port.elem.off(events);
		
		// Remove this node from layers
		port.layers = port.layers.not(node);
		
		// If port.layers is empty, destroy the port
		if (port.layers.length === 0) {
			unport(port.elem, port.events, port.winEvents);
		}
	}
	
	function unstyle(parallax) {
		var css = {};
		
		if (parallax[0]) {
			css.left = '';
			css.marginLeft = '';
		}
		
		if (parallax[1]) {
			css.top = '';
			css.marginTop = '';
		}
		
		elem.css(css);
	}
	
	jQuery.fn.parallax = function(o){
		var options = jQuery.extend({}, jQuery.fn.parallax.options, o),
		    args = arguments,
		    elem = options.mouseport instanceof jQuery ?
		    	options.mouseport :
		    	jQuery(options.mouseport) ,
		    port = getData(elem, 'parallax_port', portData),
		    timer = port.timer;
		
		return this.each(function(i) {
			var node      = this,
			    elem      = jQuery(this),
			    opts      = args[i + 1] ? jQuery.extend({}, options, args[i + 1]) : options,
			    decay     = opts.decay,
			    size      = layerSize(elem, opts.width, opts.height),
			    origin    = layerOrigin(opts.xorigin, opts.yorigin),
			    px        = layerPx(opts.xparallax, opts.yparallax),
			    parallax  = layerParallax(opts.xparallax, opts.yparallax, px),
			    offset    = layerOffset(parallax, px, origin, size),
			    position  = layerPosition(px, origin),
			    pointer   = layerPointer(elem, parallax, px, offset, size),
			    pointerFn = pointerOffTarget,
			    targetFn  = targetInside,
			    events = {
			    	'mouseenter.parallax': function mouseenter(e) {
			    		pointerFn = pointerOffTarget;
			    		targetFn = targetInside;
			    		timer.add(frame);
			    		timer.start();
			    	},
			    	'mouseleave.parallax': function mouseleave(e) {
			    		// Make the layer come to rest at it's limit with inertia
			    		pointerFn = pointerOffTarget;
			    		// Stop the timer when the the pointer hits target
			    		targetFn = targetOutside;
			    	}
			    };
			
			function updateCss(newPointer) {
				var css = layerCss(parallax, px, offset, size, position, newPointer);
				elem.css(css);
				pointer = newPointer;
			}
			
			function frame() {
				pointerFn(port.pointer, pointer, port.threshold, decay, parallax, targetFn, updateCss);
			}
			
			function targetInside() {
				// Pointer hits the target pointer inside the port
				pointerFn = pointerOnTarget;
			}
			
			function targetOutside() {
				// Pointer hits the target pointer outside the port
				timer.remove(frame);
			}
			
			
			if (jQuery.data(node, 'parallax')) {
				elem.unparallax();
			}
			
			jQuery.data(node, 'parallax', {
				port: port,
				events: events,
				parallax: parallax
			});
			
			port.elem.on(events);
			port.layers = port.layers? port.layers.add(node): jQuery(node);
			
			/*function freeze() {
				freeze = true;
			}
			
			function unfreeze() {
				freeze = false;
			}*/
			
			/*jQuery.event.add(this, 'freeze.parallax', freeze);
			jQuery.event.add(this, 'unfreeze.parallax', unfreeze);*/
		});
	};
	
	jQuery.fn.unparallax = function(bool) {
		return this.each(function() {
			var data = jQuery.data(this, 'parallax');
			
			// This elem is not parallaxed
			if (!data) { return; }
			
			jQuery.removeData(this, 'parallax');
			unparallax(this, data.port, data.events);
			if (bool) { unstyle(data.parallax); }
		});
	};
	
	jQuery.fn.parallax.options = options;
	
	// Pick up and store mouse position on document: IE does not register
	// mousemove on window.
	doc.on('mousemove.parallax', function(e){
		mouse = [e.pageX, e.pageY];
	});
}(jQuery));
;(function(window){

  var
    // Is Modernizr defined on the global scope
    Modernizr = typeof Modernizr !== "undefined" ? Modernizr : false,

    // whether or not is a touch device
    isTouchDevice = Modernizr ? Modernizr.touch : !!('ontouchstart' in window || 'onmsgesturechange' in window),

    // Are we expecting a touch or a click?
    buttonPressedEvent = ( isTouchDevice ) ? 'touchstart' : 'click',

    // List of all animation/transition properties
    // with its animationEnd/transitionEnd event
    animationEndEventNames = {
      'WebkitAnimation' : 'webkitAnimationEnd',
      'OAnimation' : 'oAnimationEnd',
      'msAnimation' : 'MSAnimationEnd',
      'animation' : 'animationend'
    },

    transitionEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd',
      'OTransition' : 'oTransitionEnd',
      'msTransition' : 'MSTransitionEnd',
      'transition' : 'transitionend'
    },

    Effeckt = function() {
      this.init();
    };

  // Current version.
  Effeckt.version = '0.0.1';

  // Initialization method
  Effeckt.prototype.init = function() {
    this.buttonPressedEvent = buttonPressedEvent;

    //event trigger after animation/transition end.
    this.transitionEndEventName = Modernizr ? transitionEndEventNames[Modernizr.prefixed('transition')] : getTransitionEndEventNames();
    this.animationEndEventName  = Modernizr ? animationEndEventNames[Modernizr.prefixed('animation')] : getAnimationEndEventNames();
    this.transitionAnimationEndEvent = this.animationEndEventName + ' ' + this.transitionEndEventName;
  };

  Effeckt.prototype.getViewportHeight = function() {

    var docElement = document.documentElement,
      client = docElement['clientHeight'],
      inner = window['innerHeight'];

    if( client < inner )
      return inner;
    else
      return client;
  };

  // Get all the properties for transition/animation end
  function getTransitionEndEventNames() {
    return _getEndEventNames( transitionEndEventNames );
  }

  function getAnimationEndEventNames() {
    return _getEndEventNames( animationEndEventNames );
  }

  function _getEndEventNames(obj) {
    var events = [];

    for ( var eventName in obj ) {
      events.push( obj[ eventName ] );
    }

    return events.join(' ');
  }

  // Creates a Effeckt object.
  window.Effeckt = new Effeckt();

})(this);

;(function(window){

  var Effeckt = window.Effeckt;

   var suportAni = Pui.supports("animation");

  var EffecktModal = function() {
    if ( !(this instanceof EffecktModal) ) {
      return new EffecktModal();
    }

    this.init();
  };

  EffecktModal.version = '0.0.1';

  EffecktModal.prototype.init = function() {
    this.$body                = $('body');
    this.$element             = null;
    this.$overlay             = null;
    this.isShown              = false;
    this.hasPerspective       = false;
    this.modalEffeckt         = '';
    this.modalEffecktOut      = '';
    this.modalEffecktProvided = true; //it's suppose to be provided

    this.bindUIActions();
  };

  EffecktModal.prototype.bindUIActions = function() {
    $(document).on( Effeckt.buttonPressedEvent,
                    '.effeckt-modal-button',
                    $.proxy(this.open, this)
                  );

    $(document).on( Effeckt.buttonPressedEvent,
                    '.effeckt-modal-close, [data-effeckt-dismiss="modal"]',
                    $.proxy(this.close, this)
                  );

    var self = this;
    $(window).on( 'keyup', function( e ) {
      if ( e.keyCode === 27 ) self.close(e);
    });
  };

  EffecktModal.prototype.open = function( e ) {
    e.preventDefault();

    if ( this.isShown ) {
      return;
    }

    var $button = $(e.currentTarget);

    var target = $button.data('effeckt-target');

    this.$element = $(target || '#effeckt-modal-wrap');

    if ( !this.$element.length ) return;

    // Modal Effeckt-Type
    this.modalEffeckt     = $button.data( 'effeckt-type' );
    this.modalEffecktOut  = $button.data( 'effeckt-out-type' );

    if ( $button.data( 'effeckt-needs-perspective' ) ) {
      this.$body.addClass( 'effeckt-perspective' );
      this.hasPerspective = true;
    }

      //hugo add 判定是否支持transition
      if(!suportAni){
          this.showModal();

          return;
      }
    // check if the effeckt class is already added
    if ( this.$element.hasClass( this.modalEffeckt ) || this.modalEffeckt === undefined ) {
      this.showModal();
    } else {
      this.modalEffecktProvided = false;
      this.$element.addClass( this.modalEffeckt );

      this.$element.on( Effeckt.transitionAnimationEndEvent, $.proxy(function() {
        this.$element.off( Effeckt.transitionAnimationEndEvent );
        this.showModal();
      }, this));
    }
  };

  EffecktModal.prototype.close = function( e ) {
    e.preventDefault();

    if ( !this.isShown ) {
      return;
    }

      //hugo add 判定是否支持transition
      if(!suportAni){
          this.hideModal();
          this.$element.removeClass( 'effeckt-show' );
          this.isShown = false;
          return;
      }

    this.$element.on( Effeckt.transitionAnimationEndEvent, $.proxy(function () {
      this.$element.off( Effeckt.transitionAnimationEndEvent );
      this.hideModal();
    }, this));

    this.$element.removeClass( 'effeckt-show' );
    this.isShown = false;

    if ( this.modalEffecktOut ) {
      this.$element.addClass( this.modalEffecktOut );
    }
  };

  EffecktModal.prototype.showModal = function() {
    this.addOverlay();
    this.$element.addClass( 'effeckt-show' );
    this.isShown = true;
  };

  EffecktModal.prototype.hideModal = function() {

    // Only remove effeckt-hide class if it's any
    if ( this.modalEffecktOut ){
      this.$element.removeClass( this.modalEffecktOut );
      this.modalEffecktOut = '';
    }

    if ( this.hasPerspective ) {
      this.$body.removeClass( 'effeckt-perspective' );
      this.hasPerspective = false;
    }

    this.removeOverlay();
    this.$element.removeClass( this.modalEffeckt );
    this.modalEffeckt = '';
      //hugo add 判定是否支持transition
      if(!suportAni){
          this.$element.removeClass('effeckt-show');
      }
  }

  EffecktModal.prototype.addOverlay = function() {
    // just for fun
    var atts = [];
    atts.push('class="effeckt-overlay effeckt-modal-overlay"');
    atts.push('id="effeckt-modal-overlay"');
    atts.push('data-effeckt-dismiss="modal"')

    this.$overlay = $('<div ' + atts.join(' ') + ' />')
                        .insertAfter( this.$element );

    this.$overlay[0].offsetWidth; // force reflow
  };

  EffecktModal.prototype.removeOverlay = function() {
    this.$overlay.remove();
    this.$overlay = null;
  };

  window.Effeckt.Modal = EffecktModal();

})(this);

Pui.add('config', function(exports) {
    var isLocal = (window.location.href.indexOf('localhost') !== -1);
    var root = function(){
        var _root = "http://1.fubi.pw/eic/server/";
        if(isLocal){
            _root = "http://localhost/github/cp_eic/server/";
        }
        return _root
    };


    exports.root = root();

});


Pui.add('rest',function(exports,P){
    var defaults = {
        dataType : "json"
    };

    var root = P.config.root + 'index.php/';

//    var ajaxDom = '<div id="J_loading" class="ui_tips ui_tips_show"><div class="J_txt">加载中...</div></div>';
//    $('body').append(ajaxDom);
//    var $ajax = $('#J_loading');
//
//    $(document).ajaxStart(function() {
//        $ajax.show();
//    }).ajaxComplete(function(){
//        $ajax.hide();
//    });

    /***
     * 获取api url
     * @param {Object} api_path
     */
    var getUrl = function(api_path) {
        return root + api_path;
    };
    /***
     *
     * @param {Object} params
     * @param {Object} type GET/POST/PUT/DELETE
     */
    var baseRest = function(params, type) {
        $.extend(params, defaults);
        params.type = type || "GET";
        return $.ajax(params);
    };

    exports.addProduct = function(data){
        var params = {
            data : data,
            url : getUrl('product'),
            success : function(t_data){
                if(t_data.error){
                    alert(t_data.error.text);
                }
            }
        };
        return baseRest(params, 'POST');
    };

    exports.editProduct = function(data){
        var pId = data.pro_id;
        var params = {
            data : data,
            url : getUrl('product/' + pId)
        };
        return baseRest(params,'PUT');
    };

    exports.getProducts = function(cateId,params){
        params = params || {};
        cateId = cateId || 1;
        params.url = getUrl("products/cate/" + cateId);
        return baseRest(params);
    };

    exports.getProductById = function(pId,params){
        params = params || {};
        params.url = getUrl("product/" + pId);
        return baseRest(params);
    };

    exports.delProductById = function(pId,params){
        params = params || {};
        params.url = getUrl("product/" + pId);
        return baseRest(params,'DELETE');
    };
});

Pui.add('func',function(exports,P){
    /**
     * 根据表单对象 遍历获取数据
     */
    var getDbData = function(form_id){
        var obj = {};
        $(':input[data-db-name]',form_id).each(function(){
            var $this = $(this),
                key = $this.attr('data-db-name');
            obj[key] = $this.val();

        });
        return obj;
    };

    var setDbData = function(data,form_id){
        for(var i in data){
            $(':input[data-db-name="'+ i +'"]',form_id).val(data[i]);
        }
    };

    /**
     * 上传插件
     * 上传ID
     * 路径
     * 回调函数
     */
    var createUploader = function(id,path,callback){
        new qq.FileUploader({
            element: document.getElementById(id),
            action: P.config.root +'fileuploader.php',
            allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'swf'],
            params:{
                folder:path,
                newname:true
            },
            onComplete: function(id, fileName, responseJSON){
                if (callback && typeof(callback) === "function") {
                    callback(responseJSON);
                }
            }
        });
    };

    /**
     * 获取URL参数
     * //example getUrlParam('id') or getUrlParam('id','#')
     */
    var getUrlParam = function(){
        var url = top.window.location.href;
        var u, params, StrBack = '',gg;
        if (arguments[arguments.length - 1] == "#")
            u = url.split("#");
        else
            u = url.split("?");
        if (u.length == 1)
            params = '';
        else
            params = u[1];

        if (params != '') {
            gg = params.split("&");
            var MaxI = gg.length,
                str = arguments[0] + "=";
            for (i = 0; i < MaxI; i++) {
                if (gg[i].indexOf(str) == 0) {
                    StrBack = gg[i].replace(str, "");
                    break;
                }
            }
        }
        return StrBack;
    };

    return {
        getDbData:getDbData,
        setDbData:setDbData,
        upload:createUploader,
        getUrlParam:getUrlParam
    }
});

Pui.add('index',function(exports,P){

    var $win = P.$win,
        $navs = $('#J_navs'),
        scrollDom = (P.detector.engine === 'webkit') ? "body": "html",
        $modalCnt = $('#J_modalCnt'),
        $doc = P.$doc,
        proTpl = $('#J_proItem').html(),
        $proListUl = $("#J_proListUl"),
        $pager = $('#J_proPage'),           //翻页容器
        $cateImg = $('#J_proCateImg'),      //分类图片
        PAGESIZE = 9,//分页
        cacheProData;//产品列表数据


    /**
     * 添加头标签 浏览器检测
     */
    var browserCheck = function(){
        var css3 = P.supports("Transition") ? "transitions": "notransitions",
            css3 = P.supports("animation") ? css3 + " animations": css3 + " noanimations",
            detector = P.detector,
            version = detector.version ? 'ie'+ detector.version : '';

        $("html").addClass( css3 + " " + detector.os + " " + detector.engine + " " + detector.browser + " " + version);
    };

    var headerInit = function(){
        var $height = $('#J_header'),
            winHeight = $win.height();
        var _setHeight = function(){
            winHeight = (winHeight >= 1030)  ? 1030 : $win.height();
//            winHeight = $win.height();
            $height.height(winHeight);
        };
        _setHeight();
        $win.on("resize", P.throttle(function(){_setHeight()},500))

    };

    var scrollInit = function(){

        $navs.scrollnav({
            sticky:true,
            cssSticky:'navs_fixed',
            offset:-200
        });

        $('#J_triggerNavs').find('a').on('click',function(){
            var idx = $(this).index();
            $navs.scrollnav('goTo',idx);//.goTo(idx);
            return false;
        })
    };


    var sliderInit = function(){
        $('#J_banner').slider({
            scroller: '.banner_slider',
            nav: '.banner_dot',
            triggerEvent: 'mouseover',
            prevBtn: '.banner_prev',
            nextBtn: '.banner_next',
            navTpl: '<a class="b4{index}" href="javascript:;"></a>', //需要index可 '<li>{index}<li>' index从1起
            autoPlay: false,
            index:0
        });
    };

    var getProducts = function(cate){
        P.rest.getProducts(cate).done(function(data){
            if(!data){
                alert('该分类下没有找到相关的产品')
                return;
            }
            for(var i = 0,len = data.length;i<len;i++){
                var imgs = data[i]['pro_imgs'];
                data[i]['pro_imgs'] = imgs ? imgs.split(',') : ['demo/1.jpg'];
            }
            //将数据存到变量
            cacheProData = data;

            //初始化分页
            initPager(data);
        })
    };

    var initPager = function(data){
        var total = data.length,
            pageTotal = Math.ceil(total/PAGESIZE),   //页数
            str = '';

        //隐藏并填充数据
        $proListUl.html(P.tmpl(proTpl,{items:data}));

        for(var i = 1;i<= pageTotal;i++){
            var start = i*PAGESIZE - PAGESIZE,
                end = i*PAGESIZE;
            if(end>total) end = total;
            str += '<a href="javascript:;" data-start="'+ start +'" data-end="'+ end +'" class="J_page">'+ i +'</a>';
        }
        $pager.show().html(str);
        //触发第一页
        $pager.find('a:eq(0)').trigger('click');
        //只有一页 则隐藏分页
        if(pageTotal <= 1){
            $pager.hide();
        }
    };

    /**
     * 从cachedata中获取数据
     * @param id
     */
    var getProductById = function(id){
        var data;
        $.each(cacheProData,function(i,item){
            if(item.pro_id == id){
                data = item;
                //找到数据后退出循环
                return false;
            }
        });
        return data;
    };

    var popDetail = function(){
        /**
         * 将换行符用p表示
         * @param str
         */
        var changeLine = function(str){
            if(!str) return;
            str = str.replace(/\n/g, "</p><p>");
            return '<p>'+ str +'</p>'
        };

        var $modal = $('#effeckt-modal-wrap'),
            supAni = P.supports("animation");
        $('#J_cert,#J_media').find('.effeckt-modal-button').on('click.index',function(){
            var $this = $(this),
                img = $this.attr('href');

            $modalCnt.html('<img src="'+ img +'" />');

            if(!supAni){
                var hasClass = $this.hasClass('cert_img');
                if(!hasClass){
                    var width = $modal.width() /2,
                        height = $modal.height() /2;
                    $modal.css({
                        'margin-top':'-' + height + 'px',
                        'margin-left':'-' + width + 'px'
                    });
                }
            }

        });

        var tpl = $('#J_popTpl').html(),
            $warp = $('#J_popCnt'),
            $list = $('#J_proList');
        $list.on('click','.J_pop',function(){
            var proId = $(this).attr('data-id'),
                data = getProductById(proId),
                vars = data.pro_vars;//参数列表
            //change template
            data.pro_vars = changeLine(data.pro_vars);
            data.pro_info = changeLine(data.pro_info);

            $warp.html(P.tmpl(tpl,data));
        });

        //商品图切换
        $warp.on('mouseenter','.J_sImg',function(){
            var $this = $(this),
                bImg = $this.attr('href');
            $warp.find('.J_bImg').attr('src',bImg);
            $this.addClass('selected').siblings('a').removeClass('selected');
            return false;
        })

    };



    var lazyLoad = function(){
        $doc.lazyloader({
            effect : "fadeIn",
            dynamic: false
        })
    };


    /**
     * 事件对象
     * @type {{}}
     */
    var Event = {

        /**
         * 地图图片视差横向滚动 及 鼠标移动放大效果
         */
        mapEffect:function(){
            var $map = $('#J_map');
            $('#J_scroll').find('li').hover(function(){
                var $this = $(this),
                    city = $this.attr('data-city');
                $this.addClass('selected').siblings('li').removeClass('selected');
                $map.find('.'+city).addClass('bounceIn').siblings('b').removeClass('bounceIn');
            });

            $('#J_scrollList').parallax({
                mouseport: jQuery("#J_scroll"),
                yparallax: false
            });

        },

        /**
         * 返回顶部事件
         */
        gotoTop:function(){
            var $top = $('#J_top');
            $top.on('click',function(){
                $(scrollDom).animate({scrollTop : 0},400);
            });

            $navs.on('scrollnavdone',function(e,data){
                if(data.index>0){
                    $top.fadeIn();
                }else{
                    $top.fadeOut();
                }
            })
        },

        /**
         * 分页事件
         */
        pageChange:function(){
            $pager.on('click','a',function(){
                var $this = $(this),
                    start = $this.attr('data-start'),
                    end = $this.attr('data-end');
                //添加样式
                $this.addClass('selected').siblings('a').removeClass('selected');
                //显示数据
                $proListUl.find('li').hide().slice(start,end).show();
                //重新定位
                $navs.scrollnav('reset');//.reset();
            })
        },

        /**
         * 分类切换
         */
        cateChange:function(){
            $('#J_proCate').find('.J_cate').on('click',function(){
                var $this = $(this),
                    cateId = $this.attr('data-cate-id');
                $this.addClass('selected').siblings('.J_cate').removeClass('selected');
                getProducts(cateId);
                $cateImg.attr('src','images/cate/'+ cateId +'.png')
            })
        },

        init:function(){
            //初始化
            for(var i in this) {
                if (this.hasOwnProperty(i) && i !== 'init') {
                    this[i]();
                }
            }
        }
    };


    exports.init  = function(){
        browserCheck();
        headerInit();
        scrollInit();
        sliderInit();
        popDetail();
        getProducts(1);
        Event.init();
    };

    exports.lazyInit = function(){
        lazyLoad();

    }


});