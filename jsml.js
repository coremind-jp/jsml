/**
 * @fileOverview
 * @url https://github.com/otn83/jsml
 * @author otn83 nakahara@coremind.jp
 * @license http://en.wikipedia.org/wiki/MIT_License
 * @description javascript module loader.
 */
(function()
{
    var HEAD = document.getElementsByTagName("head")[0];
    var SCRIPT_ELEMENT = document.createElement("script");
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
                }) + ".js";
    };

    var _appendScript = function (url)
    {
        var _element = SCRIPT_ELEMENT.cloneNode();
        _element.setAttribute("type", "text/javascript");
        _element.setAttribute("src", url);
        HEAD.removeChild(HEAD.appendChild(_element));
    };

    var exports = function(packagePath, data, dependencePackage)
    {
        console.log("exports", packagePath);

        if (state[packagePath] === STATE.LOADING)
        {
            state[packagePath] = STATE.COMPLETE;
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

    if (window.jsml)
        throw new Error("window has property 'jsml'.");

    window.jsml = {
        setAlias:setAlias,
        require:require,
        exports:exports,
        modules:modules,
        concatScript:concatScript,
    };

})(window);