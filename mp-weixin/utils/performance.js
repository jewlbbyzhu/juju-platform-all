"use strict";exports.debounce=function(e,t=300){let u;return function(...o){clearTimeout(u),u=setTimeout(()=>{clearTimeout(u),e(...o)},t)}};
