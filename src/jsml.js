/**
 * @fileOverview
 * @url https://github.com/otn83/jsml
 * @author otn83 nakahara@coremind.jp
 * @license http://en.wikipedia.org/wiki/MIT_License
 * @description javascript module loader.
 **/
/**
 * javascript module loader(jsml)はブラウザ、nodejs上で動作する外部モジュールローダーです.
 * <br>サポートしているブラウザ<br>
 * ・Chrome<br>
 * ・Firefox<br>
 * ・Opera<br>
 * ・Safari<br>
 * ・InternetExplorer 6+<br>
 * @namespace
 */
var jsml;
/*@cc_on
    @if (@_jscript_version <= 6)
        window.console = { log:function(){} };
    @end
@*/
(function(g)
{
    g.IS_NODE = this.window === undefined;
    var STATE = {
        LOADING:false,
        COMPLETE:true
    };

    var alias = {};
    var setAlias = function(url, aliasName)
    {
        console.log("setAlias", arguments);
        alias[aliasName] = url;
    };

    var que = [], state = {}, modules = {}, dependence = {};
    var require = function(packageList, callback)
    {
        callback = callback || function(){};
        if (packageList.length === 0 || _isLoaded(packageList))
            callback(packageList);
        else
        {
            que.unshift({ pl:packageList, cb:callback || function(){}, chk:true });

            for (var i = 0, len = packageList.length; i < len; i++)
                _loadSource(packageList[i]);
        }
    };

    var _loadSource = function(packagePath)
    {
        if (state[packagePath] === undefined)
        {
            // console.log("require", packagePath);
            state[packagePath] = STATE.LOADING;
            _appendScript(_toUrl(packagePath));
        }
    };

    var _toUrl = function(packagePath)
    {
        return packagePath
            .replace(/\./g, "/")
            .replace(/^([A-Za-z][\w-]*)?/,
                function() {
                    return alias[arguments[1]] || arguments[1];
                }) + ".js";// + Math.random();
    };

    var _appendScript = IS_NODE ?
        function (url) { module.require(url); }:
        (function()
        {
            var HEAD = document.getElementsByTagName("head")[0];
            var SCRIPT_ELEMENT = document.createElement("script");
            return function (url)
            {
                var _element = SCRIPT_ELEMENT.cloneNode();
                _element.setAttribute("type", "text/javascript");
                _element.setAttribute("src", url);
               HEAD.removeChild(
                    HEAD.appendChild(_element)
               );
            };
        })();

    var exports = function(packagePath, data, dependencePackage)
    {
        console.log("exports", packagePath);

        if (state[packagePath] === STATE.LOADING)
        {
            state[packagePath] = STATE.COMPLETE;
            order.push(packagePath);
            modules[packagePath] = data;
            dependence[packagePath] = dependencePackage;

            _appendDependencePackage(packagePath, dependencePackage);
            _dispatchCallback();
            _createOrder();
        }
    };

    var _appendDependencePackage = function(packagePath, dependencePackage)
    {
        if (!dependencePackage || dependencePackage.length === 0)
            return;

        for (var i = 0, len = que.length; i < len; i++)
        {
            var _pl = que[i].pl;
            var _idx = _indexOf(_pl, packagePath);
            if (_idx > -1)
            {
                var _delta = _unique(_pl, dependencePackage.slice(0));
                _delta.splice(0, 0, _idx, 0);
                _pl.splice.apply(_pl, _delta);
            }
        }

        for (i = 0, len = dependencePackage.length; i < len; i++)
            _loadSource(dependencePackage[i]);
    };

    var _unique = function(src, dest)
    {
        for (var i = 0; i < dest.length; i++)
            if (_indexOf(src, dest[i]) > -1)
                dest.splice(i--, 1);
        return dest;
    };

    var _indexOf = function(arr, val)
    {
        for (var i = 0, len = arr.length; i < len; i++)
            if (arr[i] === val)
                return i;
        return -1;
    };

    var loadNum = 0;
    var _dispatchCallback = function()
    {
        for (var i = 0; i < que.length; i++)
        {
            if (que[i].chk && _isLoaded(que[i].pl))
            {
                loadNum++;
                que[i].chk = false;
                que[i].cb(que[i].pl.slice(0));
            }
            else
            {
                if (!_isLoaded(que[i].pl))
                {
                    var packageList = que[i].pl;
                    var a = packageList.slice(0);
                    for (h = 0; h < a.length; h++)
                        if (a[packageList[h]] === STATE.COMPLETE)
                            a.splice(h--, 1);
                    //console.log("isnotLoaded", a);
                }
            }
        }
    };

    var _isLoaded = function(packageList)
    {
        for (var i = 0, len = packageList.length; i < len; i++)
            if (state[packageList[i]] !== STATE.COMPLETE)
                return false;
        return true;
    };

    var order = [];
    var _createOrder = function()
    {
        // if (que.length === loadNum)
        //     console.log(order);
    };

    var concatScript = function(callback) {
        _concatScript(order, "", callback || _openDownloadDialog);
    };

    var _concatScript = function (orderList, src, callback)
    {
        if (!XMLHttpRequest)
            throw new Error("jsml::concatScript is require 'XMLHttpRequest'.");

        var xhr = new XMLHttpRequest();
        xhr.onload = function()
        {
            src += this.responseText + "\n";
            this.onload = null;
            this.abort();

            orderList.length > 0 ?
                _concatScript(orderList, src, callback):
                callback(src);
        };
        xhr.open("POST", _toUrl(orderList.shift()), true);
        xhr.send(null);
    };

    //chrome only
    var _openDownloadDialog = function(joinedSource)
    {
        var e = document.createEvent("MouseEvents");
        var a = document.createElement("a");

        a.href = "data:text/plain," + encodeURIComponent(joinedSource);
        a.download = "script.js";

        e.initMouseEvent('click');
        a.dispatchEvent(e);
    };

    //nodejs only
    var requireSourceFile = function(packagePath)
    {
        return module.require("fs").readFileSync(
            _toUrl(packagePath), { encoding:"utf8" });
    };

    if (!g.jsml)
    {
        g.jsml = /** @lends jsml */{
            /**
             * モジュールを格納しているルートディレクトリパスのエイリアスを設定します.
             * <br>設定したエイリアスを利用してモジュールにアクセスすることが出来るようになります。
             * <br>
             * <br>「./abc/def/G.js」というモジュールを読み込む例：
             * @example
             * jsml.setAlias("./abc", "abcAlias");
             * jsml.require("abcAlias.def.G", function(){
             *     var gModule = jsml.modules["abcAlias.def.G"];
             *     alert("module [G] is loaded.");
             * });
             * @function
             * @param {String} url モジュールを格納しているルートディレクトリ
             * @param {String} aliasName エイリアス
             */
            setAlias:setAlias,
            /**
             * 外部モジュールを読み込みます.
             * <br>packageListの指定はエイリアスを利用する必要があります。
             * @function
             * @see jsml.setAlias
             * @param  {Array} packageList 外部モジュールへの参照パスを格納した配列
             * @param  {Function} callback 全ての外部モジュールを読み込み終わった際に呼び出すコールバック関数
             */
            require:require,
            /**
             * 外部モジュールを定義します.
             * <br>packagePath, dependencePackageの指定はエイリアスを利用する必要があります。
             * @see jsml.setAlias
             * @function
             * @param  {String} packagePath パッケージ名を含めたモジュールの完全な名称
             * @param  {Object} data モジュールの実体
             * @param  {Array} dependencePackage 依存している外部モジュールの参照パスを格納した配列
             */
            exports:exports,
            /**
             * 参照パスをキーとして{@link jsml.require}によって読み込まれたモジュールを格納するオブジェクトです.
             * <br>参照パスの指定はエイリアスを利用する必要があります。
             * @see jsml.setAlias
             * @type {Object}
             */
            modules:modules
        };

        IS_NODE ?
            g.jsml.requireSourceFile = requireSourceFile:
            g.jsml.concatScript = concatScript;
    }
    else
        throw new Error("already defined 'jsml'.");

})(this.window || global);