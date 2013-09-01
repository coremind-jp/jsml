/**
 * @fileOverview
 * @url https://github.com/otn83/jsml
 * @author otn83 nakahara@coremind.jp
 * @license http://en.wikipedia.org/wiki/MIT_License
 * @description javascript module loader.
 */
(function(){var f=document.getElementsByTagName("head")[0],p=document.createElement("script"),g={},e=[],d={},h={},q=function(a){if(void 0===d[a]){d[a]=!1;a=k(a);var b=p.cloneNode();b.setAttribute("type","text/javascript");b.setAttribute("src",a);f.removeChild(f.appendChild(b))}},k=function(a){return a.replace(/\./g,"/").replace(/^([A-Za-z][\w-]*)?/,function(a,c){return g[c]||c})+".js"},l=[],m=function(a){for(var b=0,c=a.length;b<c;b++)if(!0!==d[a[b]])return!1;return!0},n=function(a,b,c){if(!XMLHttpRequest)throw Error("jsml::concatScript is require 'XMLHttpRequest'.");
var d=new XMLHttpRequest;d.onload=function(){b+=this.responseText+"\n";this.onload=null;this.abort();0<a.length?n(a,b,c):c(b)};d.open("POST",k(a.shift()),!0);d.send(null)},r=function(a){var b=document.createEvent("MouseEvents"),c=document.createElement("a");c.href="data:text/plain,"+encodeURIComponent(a);c.download="script.js";b.initMouseEvent("click");c.dispatchEvent(b)};if(window.jsml)throw Error("window has property 'jsml'.");window.jsml={setAlias:function(a,b){console.log("setAlias",arguments);
g[b]=a},require:function(a,b){console.log("require",a);if(0===a.length||m(a))b();else{e.push({pl:a,cb:b||function(){}});for(var c=0,d=a.length;c<d;c++)q(a[c])}},exports:function(a,b){console.log("exports",a);if(!1===d[a]){d[a]=!0;h[a]=b;l.push(a);for(var c=0;c<e.length;c++)m(e[c].pl)&&e.splice(c--,1)[0].cb()}},modules:h,concatScript:function(a){n(l,"",a||r)}}})(window);