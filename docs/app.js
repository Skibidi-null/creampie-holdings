var E,Nn,ls,Bt,Xe,Pe,Pn,Se,Dn,Ve,Je,cs,te=Symbol.for("pv"),De={},Me=[],ds=/^m(i|n|o|s|text|space)$/,Ke=Array.isArray,qe=Me.slice,Wt=Object.assign;function Rt(t){t&&t.parentNode&&t.remove()}function Mn(t,e,n){var o,a,s,i={},r=arguments.length;for(s in e)s=="key"?o=e[s]:s=="ref"&&typeof t!="function"?a=e[s]:i[s]=e[s];return r>2&&(i.children=r>3?qe.call(arguments,2):n),Qt(t,i,o,a,null)}function Qt(t,e,n,o,a){var s={type:t,props:e,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:te,__v:a||++Nn,__i:-1,__u:0};return!a&&E.vnode&&E.vnode(s),s}function Te(t){return t.children}function Ce(t,e){this.props=t,this.context=e,this.__g=0}function Ot(t,e){if(e==null)return t.__&&Ot(t.__,t.__i+1);for(var n;e<t.__k.length;e++)if((n=t.__k[e])&&n.__e)return n.__e;return typeof t.type!="function"||t.props.__P?null:Ot(t)}function ps(t){var e,n=t.__v,o=n.__e,a=[],s=[],i=t.__P;i&&((e=Wt({constructor:te},n)).__v=n.__v+1,E.vnode&&E.vnode(e),Ze(i,e,n,t.__n,i.namespaceURI,32&n.__u?[o]:null,a,o||Ot(n),32&n.__u,s),e.__v=n.__v,e.__.__k[e.__i]=e,Ln(a,e,s),n.__=n.__e=null,e.__e!=o&&Tn(e))}function Tn(t){if((t=t.__)&&t.__c&&!t.props.__P)return t.__e=null,t.__k.some(function(e){return e&&(t.__e=e.__e)}),Tn(t)}function Sn(t){(8&t.__g||(t.__g|=8,Bt.push(t),Pe++))&&Xe==E.debounceRendering||((Xe=E.debounceRendering)||queueMicrotask)(An)}function An(){try{for(var t,e=1;Bt.length;)Bt.length>e&&Bt.sort(Pn),t=Bt.shift(),e=Bt.length,8&t.__g&&ps(t)}finally{(Pe=Bt.length)&&(Xe||queueMicrotask)(An)}}function In(t,e,n,o,a,s,i,r,c,u,d){var h,m,p,$,v,k,w=o.__k||Me,g=e.length;for(c=us(n,e,w,c,g),h=0;h<g;h++)(p=n.__k[h])!=null&&(m=~p.__i&&w[p.__i]||De,p.__i=h,k=Ze(t,p,m,a,s,i,r,c,u,d),$=p.__e,(m.ref!=p.ref||8&m.__u)&&(m.ref&&Qe(m.ref,null,p,m),p.ref&&d.push(p.ref,p.__c||$,p)),v=v||$,4&p.__u?(c=Bn(p,c,t,!m.__v),m.__e&&(m.__e=null)):typeof p.type=="function"&&k!==void 0?c=k:$&&(c=$.nextSibling),p.__u&=-21);return n.__e=v,c}function us(t,e,n,o,a){var s,i,r,c,u,d,h,m,p,$=n.length,v=$,k=0,w=0,g=t.__k=Array(a);for(s=0;s<a;s++)(i=e[s])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i!="object"||i.constructor===String?i=g[s]=Qt(null,i):Ke(i)?i=g[s]=Qt(Te,{children:i}):i.constructor===te&&i.__b?i=g[s]=Qt(i.type,i.props,i.key,i.ref,i.__v):g[s]=i,c=s+k,i.__=t,i.__b=t.__b+1,r=null,~(u=i.__i=ms(i,n,c,v))&&(v--,(r=n[u])&&(r.__u|=2)),r&&r.__v?(i.__u|=16,u==c-1?k--:u==c+1?k++:u!=c&&(u>c?k--:k++,w=1)):(~u||(a>$?k--:a<$&&k++),typeof i.type!="function"&&(i.__u|=4))):g[s]=null;if(w){for(d=[],h=[],s=0;s<a;s++)if((i=g[s])&&16&i.__u){for(k=0,m=d.length;k<m;)d[p=k+m>>1]<i.__i?k=p+1:m=p;d[k]=i.__i,h[s]=k+1}for(k=d.length;s--;)h[s]&&(h[s]==k?k--:g[s].__u|=4)}if(v)for(s=0;s<$;s++)!(r=n[s])||2&r.__u||(r.__e==o&&(o=Ot(r)),tn(r,r));return o}function Bn(t,e,n,o){var a,s,i,r;if(typeof t.type=="function"){if(t.props.__P)return e;if(a=t.__k)for(s=0;s<a.length;s++)a[s]&&(a[s].__=t,e=Bn(a[s],e,n,!1));return e}for(e&&!e.parentNode&&(e=Ot(t))&&!e.parentNode&&(e=null),i=t.__e,r=e;r&&r.nodeType==8;)r=r.nextSibling;for(i!=r&&(!o&&n.moveBefore&&i.parentNode?n.moveBefore(i,e):n.insertBefore(i,e||null)),e=i;(e=e&&e.nextSibling)&&e.nodeType==8&&!e.data.startsWith("$s"););return e}function ms(t,e,n,o){var a,s=t.key,i=t.type,r=e[n],c=r&&!(2&r.__u);if(r===null&&s==null||c&&s==r.key&&i==r.type)return n;if(o>(c?1:0)){for(a=n-1;a>=0;a--)if((r=e[a])&&!(2&r.__u)&&s==r.key&&i==r.type)return a;for(a=n+1;a<e.length;a++)if((r=e[a])&&!(2&r.__u)&&s==r.key&&i==r.type)return a}return-1}function Cn(t,e,n){n==null&&(n=""),e[0]=="-"?t.setProperty(e,n):t[e]=n}function ke(t,e,n,o,a){var s,i;if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof o=="string"&&(t.style.cssText=o=""),o)for(e in o)n&&e in n||Cn(t.style,e);if(n)for(e in n)o&&n[e]==o[e]||Cn(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")typeof n!="function"&&(n=null),typeof o!="function"&&(o=null),(t.__e||(t.__e={}))[e]=n,n&&o||(i=Je[e]||(Je[e]=$s(e)),(t.__a||(t.__a={}))[e]=Ve,s=e!=(e=e.replace(Dn,"$1")),(e=e.slice(2))[0]<"a"&&(e=e.toLowerCase()),n?t.addEventListener(e,i,s):t.removeEventListener(e,i,s));else{if(a=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{return void(t[e]=n??"")}catch{}if(typeof n=="function")return;n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n)}}function $s(t){return function(e){var n=this.__e;if(n){if(n=n[t],e[Se]==null)e[Se]=Ve++;else if(e[Se]<this.__a[t])return;return n(E.event?E.event(e):e)}}}function Ze(t,e,n,o,a,s,i,r,c,u){var d,h,m,p,$,v,k,w,g,y,C,P,N,b,B,O,U,ut,mt=e.type;if(e.constructor!==te)return null;128&n.__u&&(c=32&n.__u,d=n.__c.__z)&&(e.__u|=c,h=s=[],d.nodeType==8?r=Ne(d,s):s.push(d),r=s[0]||r),(d=E.__b)&&d(e);t:if(typeof mt=="function"){m=i.length;try{if(w=e.props,g=(d=mt.prototype)&&d.render,y=(d=mt.contextType)&&o[d.__c],C=d?y?y.props.value:d.__:o,(p=n.__c)?(e.__c=p,2&p.__g&&(p.__g|=1)):(g?e.__c=p=new mt(w,C):(e.__c=p=new Ce(w,C),p.constructor=mt,p.render=fs),y&&y.sub(p),p.state||(p.state={}),p.__n=o,p.__g|=8,p.__h=[],p.__k=[]),g&&(p.__s||(p.__s=p.state),mt.getDerivedStateFromProps&&(p.__s==p.state&&(p.__s=Wt({},p.__s)),Wt(p.__s,mt.getDerivedStateFromProps(w,p.__s)))),$=p.props,v=p.state,p.__v=e,n.__c){if(w!==$&&g&&!mt.getDerivedStateFromProps&&p.componentWillReceiveProps&&p.componentWillReceiveProps(w,C),e.__v==n.__v&&!(8&p.__g)||!(4&p.__g)&&p.shouldComponentUpdate&&p.shouldComponentUpdate(w,p.__s,C)===!1){e.__v!=n.__v&&(p.props=w,p.state=p.__s,p.__g&=-9),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(lt){lt&&(lt.__=e)}),Me.push.apply(p.__h,p.__k),p.__k=[],p.__h.length&&i.push(p),r=Ot(n);break t}p.componentWillUpdate&&p.componentWillUpdate(w,p.__s,C),g&&p.componentDidUpdate&&p.__h.push(function(){p.componentDidUpdate($,v,k)})}else g&&!mt.getDerivedStateFromProps&&p.componentWillMount&&p.componentWillMount(),g&&p.componentDidMount&&p.__h.push(p.componentDidMount);p.context=C,p.props=w,p.__P=t,p.__g&=-5,P=E.__r,N=g?25:0;do p.__g&=-9,P&&P(e),d=p.render(p.props,p.state=p.__s,p.context);while(8&p.__g&&++N<25);g&&(Me.push.apply(p.__h,p.__k),p.__k=[]),p.state=p.__s,p.getChildContext&&(o=Wt({},o,p.getChildContext())),g&&n.__c&&p.getSnapshotBeforeUpdate&&(k=p.getSnapshotBeforeUpdate($,v)),b=d&&d.type===Te&&d.key==null?d.props.children:d,w.__P&&(d=r,a=(t=w.__P).namespaceURI,c=s=null,n.props&&n.props.__P!=t&&(n.__k.some(function(lt){lt&&tn(lt,lt)}),n.__k=null),r=n.__k?Ot(n,0):null),r=In(t,Ke(b)?b:[b],e,n,o,a,s,i,r,c,u),w.__P&&(e.__e=null,r=d),e.__u&=-161,h&&h.some(Rt),p.__h.length&&i.push(p),1&p.__g&&(p.__g&=-4)}catch(lt){if(i.length=m,e.__v=null,c||s)if(lt&&lt.then){if(e.__u|=128|c,s){for(~(U=s.indexOf(r||void 0))||(U=s.length);(ut=s[U-1])&&ut.nodeType==8;)U--;for(;U<s.length;U++)if(ut=s[U])if(s[U]=null,B){if(ut==O)break}else{if(ut.nodeType!=8)break;ut.data.startsWith("$s")&&(O=Ne(B=ut))}}if(!B){for(;r&&r.nodeType==8&&r.nextSibling;)r=r.nextSibling;B=r}(d=Ne(B=e.__c.__z||(e.__c.__z=B)))?(e.__e=B,r=d):e.__e=r,r=r&&r.nextSibling}else s&&s.some(Rt);else e.__e=n.__e;e.__k||(e.__k=n.__k||[]),lt&&lt.then||On(e),E.__e(lt,e,n)}}else r=e.__e=vs(n.__e,e,n,o,a,s,i,c,u,t);return(d=E.diffed)&&d(e),r}function Ne(t,e){if(t&&t.nodeType==8&&t.data.startsWith("$s"))for(var n=1;t=t.nextSibling;){if(t.nodeType==8){if(t.data.startsWith("$s"))n++;else if(t.data.startsWith("/$s")&&!--n)return t}e&&e.push(t)}}function On(t){t&&(t.__c&&(t.__c.__g|=4),t.__k&&t.__k.some(On))}function Ln(t,e,n){for(var o=0;o<n.length;)Qe(n[o++],n[o++],n[o++]);E.__c&&E.__c(e,t),t.some(function(a){try{t=a.__h,a.__h=[],t.some(function(s){s.call(a)})}catch(s){E.__e(s,a.__v)}})}function vs(t,e,n,o,a,s,i,r,c,u){var d,h,m,p,$,v,k,w,g=n.props||De,y=e.props,C=e.type;if(C=="svg"?a="http://www.w3.org/2000/svg":C=="math"?a="http://www.w3.org/1998/Math/MathML":a||(a="http://www.w3.org/1999/xhtml"),s){for(d=0;d<s.length;d++)if(($=s[d])&&(C?$.localName==C:$.nodeType==3)){t=$,s[d]=null;break}}if(!t){if(w=u.ownerDocument||document,!C)return w.createTextNode(y);t=w.createElementNS(a,C,y.is?y:u),r&&(E.__m&&E.__m(e,s),r=!1),s=null}if(C){if(u=C=="template"&&t.content||t,s=C=="textarea"&&y.defaultValue!=null?null:s&&qe.call(u.childNodes),!r&&s)for(g={},d=0;d<t.attributes.length;d++)g[($=t.attributes[d]).name]=$.value;for(d in g)$=g[d],d=="dangerouslySetInnerHTML"?m=$:d=="children"||d in y||d=="value"&&"defaultValue"in y||d=="checked"&&"defaultChecked"in y||ke(t,d,null,$,a);for(d in y)$=y[d],d=="children"?p=$:d=="dangerouslySetInnerHTML"?h=$:d=="value"?v=$:d=="checked"?k=$:r&&typeof $!="function"||g[d]===$||ke(t,d,$,g[d],a);h?(r||m&&(h.__html==m.__html||h.__html==t.innerHTML)||(t.innerHTML=h.__html),e.__k=[]):(m&&(t.textContent=""),(C=="foreignObject"||a=="http://www.w3.org/1998/Math/MathML"&&ds.test(C))&&(a="http://www.w3.org/1999/xhtml"),In(u,Ke(p)?p:[p],e,n,o,a,s,i,s?s[0]:n.__k&&Ot(n,0),r,c),s&&s.some(Rt)),r&&C!="textarea"||(d="value",C=="progress"&&v==null?t.removeAttribute(d):v==null||v===t[d]&&(C!="progress"||v)||ke(t,d,v,g[d],a),d="checked",k!=null&&k!=t[d]&&ke(t,d,k,g[d],a))}else g===y||r&&t.data==y||(t.data=y);return t}function Qe(t,e,n,o){try{typeof t=="function"?e?e.__x=t(e)||1:o&&(o=o.__c||o.__e)&&(e=o.__x)&&(o.__x=null,typeof e=="function"?e():t(null)):t.current=e}catch(a){E.__e(a,n)}}function tn(t,e,n){var o,a,s,i;if(E.unmount&&E.unmount(t),!(o=t.ref)||o.current&&o.current!=t.__e||Qe(o,null,e,t),o=t.__c){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(r){E.__e(r,e)}o.__P=o.__n=null}if(o=t.__k)for(i=0;i<o.length;i++)o[i]&&tn(o[i],e,typeof t.type!="function"||n&&!t.props.__P);!n&&(o=t.__c)&&(o=o.__z)&&(a=Ne(o,s=[]))&&(o==t.__e&&s.some(Rt),Rt(a),Rt(o)),n||Rt(t.__e),t.__e=t.__c=t.__=null}function fs(t,e,n){return this.constructor(t,n)}function Fn(t,e){var n,o,a,s;E.__&&E.__(t,e),e.nodeType==9&&(e=e.documentElement),o=(n=t&&32&t.__u)?null:e.__k,e.__k=Qt(Te,{children:[t]}),a=[],s=[],Ze(e,e.__k,o||De,De,e.namespaceURI,o?null:e.firstChild?qe.call(e.childNodes):null,a,o?o.__e:e.firstChild,n,s),Ln(a,e.__k,s),e.__k.props.children=null}E={__e:function(t,e,n,o){for(var a,s,i;e=e.__;)if((a=e.__c)&&!(1&a.__g)){a.__g|=4;try{if((i=(s=a.constructor)&&s.getDerivedStateFromError)&&a.setState(s.getDerivedStateFromError(t)),a.componentDidCatch&&(a.componentDidCatch(t,o||{}),i=1),i&&8&a.__g)return void(a.__g|=2)}catch(r){t=r}}throw Pe=0,t}},Nn=0,ls=function(t){return t!=null&&t.constructor===te},Ce.prototype.setState=function(t,e){var n=this.__s;n&&n!=this.state||(n=this.__s=Wt({},this.state)),typeof t=="function"&&(t=t(Wt({},n),this.props)),t&&(Wt(n,t),this.__v&&(e&&this.__k.push(e),Sn(this)))},Ce.prototype.forceUpdate=function(t){this.__v&&(this.__g|=4,t&&this.__h.push(t),Sn(this))},Ce.prototype.render=Te,Bt=[],Pe=0,Pn=function(t,e){return t.__v.__b-e.__v.__b},Se=Symbol(),Dn=/(PointerCapture)$|Capture$/i,Ve=0,Je={},cs=0;var ne,X,en,En,nn=Object.is,Ae=0,Xn=[],on=[],Y=E,Hn=Y.__b,Un=Y.__r,zn=Y.diffed,Gn=Y.__c,Rn=Y.unmount,Wn=Y.__;function an(t,e){Y.__h&&Y.__h(X,t,Ae||e),Ae=0;var n=X.__H||(X.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function f(t){return Ae=1,hs(Vn,t)}function hs(t,e,n){var o=an(ne++,2);if(o.t=t,!o.__c&&(o.__=[n?n(e):Vn(void 0,e),function(s){var i=(o.__N||o.__)[0],r=o.t(i,s);nn(i,r)||(o.__N=[r,o.__[1]],o.__c.setState({}))}],o.__c=X,!X.__f)){X.__f=!0;var a=X.shouldComponentUpdate;X.shouldComponentUpdate=function(s,i,r){var c=this.__H;if(!c)return!0;var u=!1,d=this.props!=s;if(c.__.some(function(m){m.__N&&(u=!0,nn(m.__[0],m.__N[0])||(d=!0))}),a){var h=a.call(this,s,i,r);return u?h||d:h}return!u||d}}return o.__}function R(t,e){var n=an(ne++,3);!Y.__s&&Jn(n.__H,e)&&(n.__P=!0,n.__=t,n.u=e,X.__H.__h.push(n))}function rn(t){return Ae=5,st(function(){return{current:t}},[])}function st(t,e){var n=an(ne++,7);return Jn(n.__H,e)&&(n.__=t(),n.__H=e),n.__}function gs(){var t;do{for(;t=on.shift();)try{ee(t)}catch(n){Y.__e(n,{__:(t=t.__P)&&t.__v})}for(;t=Xn.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(ee),e.__h.some(sn),e.__h=[]}catch(n){e.__h=[],Y.__e(n,t.__v)}}}while(on.length)}Y.__b=function(t){X=null,Hn&&Hn(t)},Y.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Wn&&Wn(t,e)},Y.__r=function(t){Un&&Un(t),ne=0;var e=(X=t.__c).__H;e&&(en==X?X.__h=[]:(e.__h.some(ee),e.__h.some(sn),ne=0),e.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})),en=X},Y.diffed=function(t){zn&&zn(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&Yn(Xn.push(e)),e.__H.__.some(function(n){n.u&&(n.__H=n.u)})),en=X=null},Y.__c=function(t,e){e.some(function(n){try{n.__h.some(ee),n.__h=n.__h.filter(function(o){return!o.__||sn(o)})}catch(o){n.__h=[function(){throw o}]}}),Gn&&Gn(t,e)},Y.unmount=function(t){Rn&&Rn(t);var e,n,o=t.__c;o&&o.__H&&(o.__H.__.some(function(a){try{if(a.__P&&a.__c){if(n===void 0){for(n=t.__;n&&(!n.__c||!n.__c.__P);)n=n.__;n=n&&n.__c}a.__P=n,Yn(on.push(a))}else ee(a)}catch(s){e=s}}),o.__H=void 0,e&&Y.__e(e,o.__v))};var jn=typeof requestAnimationFrame=="function";function ys(t){var e,n=function(){clearTimeout(o),jn&&cancelAnimationFrame(e),setTimeout(t)},o=setTimeout(n,35);jn&&(e=requestAnimationFrame(n))}function Yn(t){t!=1&&En==Y.requestAnimationFrame||((En=Y.requestAnimationFrame)||ys)(gs)}function ee(t){var e=X,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),X=e}function sn(t){var e=X;t.__c=t.__(),X=e}function Jn(t,e){return!t||t.length!=e.length||e.some(function(n,o){return!nn(n,t[o])})}function Vn(t,e){return typeof e=="function"?e(t):e}var qn=function(t,e,n,o){var a;e[0]=0;for(var s=1;s<e.length;s++){var i=e[s++],r=e[s]?(e[0]|=i?1:2,n[e[s++]]):e[++s];i===3?o[0]=r:i===4?o[1]=Object.assign(o[1]||{},r):i===5?(o[1]=o[1]||{})[e[++s]]=r:i===6?o[1][e[++s]]+=r+"":i?(a=t.apply(r,qn(t,r,n,["",null])),o.push(a),r[0]?e[0]|=2:(e[s-2]=0,e[s]=a)):o.push(r)}return o},Kn=new Map;function Zn(t){var e=Kn.get(this);return e||(e=new Map,Kn.set(this,e)),(e=qn(this,e.get(t)||(e.set(t,e=(function(n){for(var o,a,s=1,i="",r="",c=[0],u=function(m){s===1&&(m||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?c.push(0,m,i):s===3&&(m||i)?(c.push(3,m,i),s=2):s===2&&i==="..."&&m?c.push(4,m,0):s===2&&i&&!m?c.push(5,0,!0,i):s>=5&&((i||!m&&s===5)&&(c.push(s,0,i,a),s=6),m&&(c.push(s,m,0,a),s=6)),i=""},d=0;d<n.length;d++){d&&(s===1&&u(),u(d));for(var h=0;h<n[d].length;h++)o=n[d][h],s===1?o==="<"?(u(),c=[c],s=3):i+=o:s===4?i==="--"&&o===">"?(s=1,i=""):i=o+i[0]:r?o===r?r="":i+=o:o==='"'||o==="'"?r=o:o===">"?(u(),s=1):s&&(o==="="?(s=5,a=i,i=""):o==="/"&&(s<5||n[d][h+1]===">")?(u(),s===3&&(c=c[0]),s=c,(c=c[0]).push(2,0,s),s=0):o===" "||o==="	"||o===`
`||o==="\r"?(u(),s=2):i+=o),s===3&&i==="!--"&&(s=4,c=c[0])}return u(),c})(t)),e),arguments,[])).length>1?e:e[0]}var Lt=t=>String(t).padStart(2,"0"),Ie=t=>`${t.getFullYear()}-${Lt(t.getMonth()+1)}-${Lt(t.getDate())}`,M=()=>Ie(new Date),yt=t=>t.slice(0,7),H=()=>M().slice(0,7),Vt=t=>{let[e,n,o]=t.split("-").map(Number);return new Date(e,n-1,o)},Pt=(t,e)=>{let n=Vt(t);return n.setDate(n.getDate()+e),Ie(n)},bt=(t,e)=>Math.round((Vt(e)-Vt(t))/864e5),jt=t=>{let[e,n]=t.split("-").map(Number);return new Date(e,n,0).getDate()},vt=t=>{let[e,n]=t.split("-").map(Number);return n===1?`${e-1}-12`:`${e}-${Lt(n-1)}`},Dt=t=>{let[e,n]=t.split("-").map(Number);return n===12?`${e+1}-01`:`${e}-${Lt(n+1)}`},cn=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],bs=["January","February","March","April","May","June","July","August","September","October","November","December"],Yt=(t,e)=>{let[n,o]=t.split("-").map(Number);return`${(e?bs:cn)[o-1]} ${n}`},Be=t=>cn[t],J=t=>{let e=M();if(t===e)return"Today";if(t===Pt(e,-1))return"Yesterday";let n=Vt(t),o=`${n.getDate()} ${cn[n.getMonth()]}`;return n.getFullYear()===new Date().getFullYear()?o:`${o} ${n.getFullYear()}`},_s=0,_t=()=>Date.now().toString(36)+(_s++%1296).toString(36).padStart(2,"0")+Math.random().toString(36).slice(2,5),D=t=>{if(typeof t=="number")return t;if(t==null)return NaN;let e=String(t).replace(/\s|zł/g,"").replace(",",".");return e===""||e==="."?NaN:Number(e)},ln={},ws=t=>ln[t]||(ln[t]=new Intl.NumberFormat("pl-PL",{minimumFractionDigits:t,maximumFractionDigits:t})),T=(t,e=2)=>ws(e).format(Number.isFinite(t)?t:0).replace(/ /g," "),xs={PLN:"z\u0142",EUR:"\u20AC",USD:"$",AED:"AED",GBP:"\xA3"},at=(t,e="PLN",n=2)=>{let o=T(Math.abs(t),n),a=t<0?"\u2212":"";return e==="PLN"?`${a}${o} z\u0142`:e==="AED"?`${a}${o} AED`:`${a}${xs[e]||e}${o}`},Ct=(t,e=1)=>`${t>0?"+":t<0?"\u2212":""}${T(Math.abs(t),e)}%`,Oe=(t,e,n)=>Math.min(n,Math.max(e,t)),ct=(t,e=n=>n)=>t.reduce((n,o)=>n+e(o),0);async function Le(t){let e=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return[...new Uint8Array(e)].map(n=>n.toString(16).padStart(2,"0")).join("")}var Mt=(t=12)=>{try{navigator.vibrate&&navigator.vibrate(t)}catch{}},ks=t=>{let e="";for(let n=0;n<t.length;n+=32768)e+=String.fromCharCode.apply(null,t.subarray(n,n+32768));return btoa(e)};async function dn(t,e,n){if(window.CPNative&&window.CPNative.saveFile)return window.CPNative.saveFile(t,e,ks(n)),"saved";let o=new File([n],t,{type:e});if(navigator.canShare&&navigator.canShare({files:[o]}))try{return await navigator.share({files:[o],title:t}),"shared"}catch(i){if(i.name==="AbortError")return"cancelled"}let a=URL.createObjectURL(o),s=document.createElement("a");return s.href=a,s.download=t,document.body.appendChild(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(a),4e3),"downloaded"}var Fe="cp.data.v1",Ss=[["groceries","Groceries","\u{1F6D2}","Daily living"],["halal","Halal meat & food","\u{1F969}","Daily living"],["household","Household","\u{1F9F4}","Daily living"],["dining","Dining out","\u{1F37D}\uFE0F","Personal"],["coffee","Coffee & snacks","\u2615","Personal"],["transport","Public transport","\u{1F687}","Transport"],["taxi","Fuel / Taxi","\u{1F695}","Transport"],["car","Car","\u{1F697}","Transport"],["rent","Rent","\u{1F3E0}","Housing"],["utilities","Utilities","\u{1F4A1}","Housing"],["phone","Internet / Phone","\u{1F4F6}","Housing"],["uni","University fees","\u{1F393}","Studies"],["books","Books & supplies","\u{1F4DA}","Studies"],["gifts","Gifts & dates","\u{1F381}","Personal"],["subs","Subscriptions","\u{1F501}","Personal"],["health","Health & fitness","\u{1F4AA}","Personal"],["clothes","Clothing","\u{1F455}","Personal"],["haircut","Haircut & care","\u{1F488}","Personal"],["travel","Travel","\u2708\uFE0F","Personal"],["charity","Sadaqah / Charity","\u{1F932}","Personal"],["misc","Miscellaneous","\u{1F4E6}","Other"]].map(([t,e,n,o])=>({id:t,name:e,icon:n,group:o})),Cs=[["salary","Salary","\u{1F4BC}"],["freelance","Freelance / Side","\u{1F9D1}\u200D\u{1F4BB}"],["gift_in","Gift received","\u{1F381}"],["refund","Refund","\u21A9\uFE0F"],["other_in","Other income","\u{1F4B0}"]].map(([t,e,n])=>({id:t,name:e,icon:n})),ie={bank:"Bank",savings:"Savings",cash:"Cash"},Ee=()=>({v:1,created:M(),accounts:[{id:"main",name:"Main bank",cur:"PLN",kind:"bank",opening:0,icon:"\u{1F3E6}"},{id:"savings",name:"Savings",cur:"PLN",kind:"savings",opening:0,icon:"\u{1F512}"},{id:"cash",name:"Cash",cur:"PLN",kind:"cash",opening:0,icon:"\u{1F4B5}"}],txns:[],card:{on:!0,name:"Credit card",limit:0,opening:0,dueDay:0},friends:[],gold:{buys:[],below:null,dropPct:2,alertsOn:!0,newsOn:!0,goalGrams:0,sellSpread:4},budget:{monthly:0,cats:{}},recurring:[],goals:[],cats:{exp:Ss,inc:Cs},zakat:{nisab:"gold",countOwed:!0,hawl:""},settings:{privacy:!1,pin:null,remind9pm:!0,cardRemind:!0,onboarded:!1,alertsSetup:!1},rates:{PLN:1,USD:0,EUR:0,AED:0,GBP:0,at:0}});function Ns(){try{let t=localStorage.getItem(Fe);return t?Qn(JSON.parse(t)):Ee()}catch{try{localStorage.setItem(Fe+".broken."+Date.now(),localStorage.getItem(Fe))}catch{}return Ee()}}function Qn(t){let e=Ee(),n={...e,...t};for(let o of["card","gold","budget","zakat","settings","rates","cats"])n[o]={...e[o],...t[o]||{}};for(let o of["accounts","txns","friends","recurring","goals"])Array.isArray(n[o])||(n[o]=[]);return Array.isArray(n.gold.buys)||(n.gold.buys=[]),n}var ft=Ns(),se=new Set,pn=null,q=()=>ft;function G(t){let e=typeof t=="function"?t(ft):t;!e||e===ft||(ft=e,se.forEach(n=>n(ft)),clearTimeout(pn),pn=setTimeout(re,150))}function re(){clearTimeout(pn);try{localStorage.setItem(Fe,JSON.stringify(ft))}catch(t){console.error(t)}un.forEach(t=>t(ft))}var un=new Set;function to(t){ft=Qn(t),se.forEach(e=>e(ft)),re()}function eo(){ft=Ee(),se.forEach(t=>t(ft)),re()}function I(){let[,t]=f(0);return R(()=>{let e=()=>t(n=>n+1);return se.add(e),()=>se.delete(e)},[]),ft}window.addEventListener("pagehide",re);document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&re()});try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch{}var L=(t,e)=>G(n=>({...n,[t]:{...n[t],...e}}));function Tt(t){let e={id:_t(),date:M(),note:"",...t};return G(n=>({...n,txns:[...n.txns,e]})),e}function Xt(t,e){G(n=>({...n,txns:n.txns.map(o=>o.id===t?{...o,...e}:o)}))}function le(t){G(e=>({...e,txns:e.txns.filter(n=>n.id!==t&&n.pair!==t)}))}function ce(t,e){G(n=>{let o=n[t],a=o.some(s=>s.id===e.id);return{...n,[t]:a?o.map(s=>s.id===e.id?{...s,...e}:s):[...o,{id:_t(),...e}]}})}function de(t,e){G(n=>({...n,[t]:n[t].filter(o=>o.id!==e)}))}function no(t){G(e=>{let n=e.gold.buys,o=t.id&&n.some(a=>a.id===t.id)?n.map(a=>a.id===t.id?{...a,...t}:a):[...n,{...t,id:_t()}];return{...e,gold:{...e.gold,buys:o}}})}function oo(t){G(e=>({...e,gold:{...e.gold,buys:e.gold.buys.filter(n=>n.id!==t)}}))}var z="card",ae=(t,e)=>t.accounts.find(n=>n.id===e),W=(t,e)=>e===z?"PLN":(ae(t,e)||{}).cur||"PLN",V=(t,e)=>t.cats.exp.find(n=>n.id===e)||t.cats.inc.find(n=>n.id===e)||{id:e,name:e||"Other",icon:"\u2022"},Ft=(t,e,n)=>n==="PLN"||!n?e:e*(t.rates[n]||0),dt=(t,e)=>e===z?t.card.name:(ae(t,e)||{name:"\u2014"}).name;function wt(t,e){let n=ae(t,e),o=n&&n.opening||0;for(let a of t.txns)a.from===e&&(o-=a.amt),a.to===e&&(o+=a.t==="xfer"&&a.amt2!=null?a.amt2:a.amt);return o}function et(t){let e=t.card.opening||0;for(let n of t.txns)n.from===z&&(e+=n.amt),n.to===z&&(e-=n.t==="xfer"&&n.amt2!=null?n.amt2:n.amt);return e}function xt(t){let e=new Map(t.friends.map(n=>[n.id,0]));for(let n of t.txns){if(!n.friend||!e.has(n.friend))continue;let o=Ft(t,n.amt,W(t,n.from||n.to));n.t==="fout"&&e.set(n.friend,e.get(n.friend)+o),n.t==="fin"&&e.set(n.friend,e.get(n.friend)-o)}return e}var ht=(t,e)=>Ft(t,e.amt,W(t,e.t==="inc"||e.t==="fin"?e.to:e.from));function nt(t,e){let n={ym:e,income:0,spend:0,saved:0,byCat:{},card:0,count:0};for(let o of t.txns){if(yt(o.date)!==e)continue;let a=ht(t,o);if(o.t==="exp")n.spend+=a,n.byCat[o.cat]=(n.byCat[o.cat]||0)+a,n.count++,o.from===z&&(n.card+=a);else if(o.t==="inc")n.income+=a;else if(o.t==="xfer"){let s=(ae(t,o.to)||{}).kind==="savings",i=(ae(t,o.from)||{}).kind==="savings";s&&!i&&(n.saved+=a),i&&!s&&o.to!==z&&(n.saved-=a)}}return n.net=n.income-n.spend,n}function Ps(t,e){return ct(t.txns.filter(n=>n.t==="exp"&&n.date===e),n=>ht(t,n))}function Et(t){let e=t.budget.monthly;if(!e)return null;let n=H(),o=M(),a=Number(o.slice(8)),s=jt(n),i=ct(t.txns.filter(d=>d.t==="exp"&&yt(d.date)===n&&d.date<o),d=>ht(t,d)),r=Ps(t,o),c=s-a+1,u=Math.max(0,(e-i)/c);return{allowance:u,todaySpent:r,left:u-r,monthLeft:e-i-r,daysLeft:c,budget:e}}function pe(t){return ct(t.accounts,e=>Ft(t,wt(t,e.id),e.cur))}function Ht(t,e){let n=t.gold.buys,o=ct(n,u=>u.g),a=ct(n,u=>u.g*u.paid),s=ct(n,u=>u.g*(u.market||u.paid)),i=n.filter(u=>u.market>0).map(u=>(u.paid-u.market)/u.market),r=i.length?ct(i)/i.length:null,c=e?o*e:0;return{grams:o,paid:a,market:s,avgPaid:o?a/o:0,avgMarket:o?s/o:0,avgPremium:r,value:c,pl:c-a}}function He(t,e){let n=pe(t),o=Ht(t,e).value,a=t.card.on?et(t):0,s=0,i=0;for(let c of xt(t).values())c>0?s+=c:i-=c;return{cash:n,gold:o,card:a,fOwedMe:s,fIOwe:i,total:n+o+s-a-i+0}}function mn(){let t=q(),e=M(),n=H(),o=[],a=t.recurring.map(s=>{if(s.paused)return s;let i=s.last||vt(n),r=Dt(i),c=!1;for(;r<=n;){let u=Math.min(s.day,jt(r)),d=`${r}-${Lt(u)}`;if(d>e)break;o.push({id:_t(),t:"exp",amt:s.amt,cat:s.cat,from:s.from,date:d,note:s.name,rec:s.id}),i=r,c=!0,r=Dt(r)}return c?{...s,last:i}:s});return o.length&&G(s=>({...s,recurring:a,txns:[...s.txns,...o]})),o.length}function so(t){let e=M(),n=H();return`${n}-${Lt(Math.min(t,jt(n)))}`<e?n:vt(n)}function oe(t,e=M()){if(!t)return null;let n=e.slice(0,7);for(let o=0;o<3;o++){let a=`${n}-${Lt(Math.min(t,jt(n)))}`;if(a>=e)return a;n=Dt(n)}return null}function Ue(t,e=35){let n=M(),o=Ie(new Date(Vt(n).getTime()+e*864e5)),a=[];for(let s of t.recurring){if(s.paused)continue;let i=oe(s.day,n);i&&i.slice(0,7)===(s.last||"")&&(i=oe(s.day,`${Dt(s.last)}-01`)),i&&i<=o&&a.push({date:i,name:s.name,amt:s.amt,cur:W(t,s.from),icon:V(t,s.cat).icon,kind:"bill"})}if(t.card.on&&t.card.dueDay){let s=oe(t.card.dueDay,n),i=et(t);s&&s<=o&&a.push({date:s,name:`${t.card.name} payment`,amt:i,cur:"PLN",icon:"\u{1F4B3}",kind:"card"})}return a.sort((s,i)=>s.date.localeCompare(i.date))}var l=Zn.bind(Mn),$n=new Set;function A(t,e="\u{1F48B}",n=3200){$n.forEach(o=>o({text:t,icon:e,id:Math.random(),ms:n}))}function ao(){let[t,e]=f(null);return R(()=>{let n,o=a=>{e(a),clearTimeout(n),n=setTimeout(()=>e(null),a.ms)};return $n.add(o),()=>$n.delete(o)},[]),t?l`<div class="toast" key=${t.id} onClick=${()=>e(null)}><span style="font-size:20px">${t.icon}</span><span>${t.text}</span></div>`:null}function x({v:t,cur:e="PLN",cls:n="",sign:o=!1,d:a=2}){let s=q().settings.privacy,i=(o&&t>0?"+":"")+at(t,e,a);return l`<span class=${`mono ${n} ${s?"blur":""}`}>${s?"\u2022\u2022\u2022\u2022":i}</span>`}function Z({title:t,hint:e,onBack:n,right:o}){return l`<div class="back">
    <button class="iconbtn" onClick=${n} aria-label="Back">←</button>
    <div class="t"><div class="h-title">${t}</div>${e&&l`<div class="hint">${e}</div>`}</div>
    ${o}
  </div>`}function ot({title:t,onClose:e,children:n}){R(()=>{let a=document.body.style.overflow;document.body.style.overflow="hidden";let s=()=>e();return history.pushState({sheet:1},""),window.addEventListener("popstate",s),()=>{document.body.style.overflow=a,window.removeEventListener("popstate",s)}},[]);let o=()=>{history.state&&history.state.sheet?history.back():e()};return l`<div class="overlay" onClick=${a=>a.target===a.currentTarget&&o()}>
    <div class="sheet"><div class="grab"></div>${t&&l`<h3>${t}</h3>`}${typeof n=="function"?n(o):n}</div>
  </div>`}var S=({label:t,children:e})=>l`<div class="field">${t&&l`<label>${t}</label>`}${e}</div>`;function F({value:t,onInput:e,placeholder:n="0",autofocus:o,cls:a="input mono"}){let s=rn();return R(()=>{o&&s.current&&setTimeout(()=>s.current.focus(),250)},[]),l`<input ref=${s} class=${a} inputmode="decimal" placeholder=${n} value=${t}
    onInput=${i=>e(i.target.value.replace(/[^\d.,\-\s]/g,""))} />`}var Q=t=>Number.isFinite(D(t))&&D(t)>0;function At({options:t,value:e,onChange:n}){return l`<div class="seg">${t.map(([o,a])=>l`<button class=${e===o?"on":""} onClick=${()=>n(o)}>${a}</button>`)}</div>`}var it=({on:t,onChange:e})=>l`<button class=${`switch ${t?"on":""}`} onClick=${()=>e(!t)} aria-pressed=${t}></button>`,gt=({v:t,cls:e=""})=>l`<div class=${`bar ${e}`}><i style=${{width:`${Oe(t,0,1)*100}%`}}></i></div>`,It=({e:t="\u{1F351}",text:e})=>l`<div class="empty"><span class="e">${t}</span>${e}</div>`;function tt({title:t,hint:e,children:n,onClick:o}){return l`<div class="row" style="padding:10px 2px" onClick=${o}>
    <div class="grow"><div style="font-weight:600">${t}</div>${e&&l`<div class="hint">${e}</div>`}</div>${n}</div>`}function io({pts:t,color:e="#ff2e88",height:n=180,time:o=!1,fmt:a=r=>T(r),marks:s=!0,refLine:i}){let[r,c]=f(null),u=rn(),d=340,h=n,m=6,p=st(()=>{if(!t||t.length<2)return null;let g=1/0,y=-1/0,C=0,P=0;t.forEach(($t,Gt)=>{$t[1]<g&&(g=$t[1],C=Gt),$t[1]>y&&(y=$t[1],P=Gt)}),i&&(g=Math.min(g,i),y=Math.max(y,i));let N=(y-g)*.12||1,b=g-N,B=y+N,O=t[0][0],U=t[t.length-1][0],ut=$t=>m+($t-O)/(U-O||1)*(d-2*m),mt=$t=>m+(1-($t-b)/(B-b))*(h-2*m),lt=Math.max(1,Math.floor(t.length/400)),kn=t.filter(($t,Gt)=>Gt%lt===0||Gt===t.length-1).map(($t,Gt)=>`${Gt?"L":"M"}${ut($t[0]).toFixed(1)},${mt($t[1]).toFixed(1)}`).join("");return{d:kn,area:`${kn}L${ut(U)},${h}L${ut(O)},${h}Z`,X:ut,Y:mt,lo:t[C],hi:t[P]}},[t,n,i]);if(!p)return l`<div class="empty" style=${{height:h+"px",display:"grid",placeItems:"center"}}>Loading the good stuff…</div>`;let $="g"+e.replace("#",""),v=g=>{let y=u.current.getBoundingClientRect(),C=((g.touches?g.touches[0].clientX:g.clientX)-y.left)/y.width*d,P=0,N=1/0;for(let b=0;b<t.length;b++){let B=Math.abs(p.X(t[b][0])-C);B<N&&(N=B,P=b)}c(t[P])},k=g=>{let y=new Date(g);return o?y.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):y.toLocaleDateString([],{day:"numeric",month:"short",year:"numeric"})},w=t[t.length-1];return l`<div>
    <div class="chart-tip">${r?l`<span class="pink">${a(r[1])}</span> · ${k(r[0])}`:l`<span class="mute">Touch the chart to explore</span>`}</div>
    <svg ref=${u} class="chart" viewBox=${`0 0 ${d} ${h}`} preserveAspectRatio="none" style=${{height:h+"px"}}
      onTouchStart=${v} onTouchMove=${v} onMouseMove=${v} onTouchEnd=${()=>c(null)} onMouseLeave=${()=>c(null)}>
      <defs>
        <linearGradient id=${$} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color=${e} stop-opacity=".45"/><stop offset="1" stop-color=${e} stop-opacity="0"/></linearGradient>
        <filter id=${$+"f"}><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      ${[.25,.5,.75].map(g=>l`<line x1="0" x2=${d} y1=${h*g} y2=${h*g} stroke="rgba(255,255,255,.05)" />`)}
      ${i&&l`<line x1="0" x2=${d} y1=${p.Y(i)} y2=${p.Y(i)} stroke="#38e8ff" stroke-dasharray="4 4" stroke-width="1" opacity=".7" vector-effect="non-scaling-stroke"/>`}
      <path d=${p.area} fill=${`url(#${$})`} />
      <path d=${p.d} fill="none" stroke=${e} stroke-width="5" opacity=".45" filter=${`url(#${$+"f"})`} vector-effect="non-scaling-stroke"/>
      <path d=${p.d} fill="none" stroke=${e} stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
      ${s&&l`<circle cx=${p.X(p.lo[0])} cy=${p.Y(p.lo[1])} r="4" fill="#2bffa3" /><circle cx=${p.X(p.hi[0])} cy=${p.Y(p.hi[1])} r="4" fill="#ff4d6d" />`}
      <circle cx=${p.X(w[0])} cy=${p.Y(w[1])} r="4.5" fill="#fff"><animate attributeName="r" values="4;8;4" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;.4;1" dur="1.6s" repeatCount="indefinite"/></circle>
      ${r&&l`<line x1=${p.X(r[0])} x2=${p.X(r[0])} y1="0" y2=${h} stroke="#fff" stroke-width="1" opacity=".5" vector-effect="non-scaling-stroke"/><circle cx=${p.X(r[0])} cy=${p.Y(r[1])} r="5" fill="#fff" />`}
    </svg>
  </div>`}var ue=["#ff2e88","#a35cff","#38e8ff","#ffc94d","#2bffa3","#ff7a45","#ff7ab8","#6c8cff","#e0ff4d","#b0b0c8"];function ze({data:t,size:e=150,center:n}){let o=t.reduce((r,c)=>r+c.v,0);if(!o)return null;let a=56,s=2*Math.PI*a,i=0;return l`<svg viewBox="0 0 150 150" width=${e} height=${e} style="flex:none">
    <circle cx="75" cy="75" r=${a} fill="none" stroke="rgba(255,255,255,.06)" stroke-width="16"/>
    ${t.map((r,c)=>{let u=r.v/o*s,d=l`<circle cx="75" cy="75" r=${a} fill="none" stroke=${r.color||ue[c%ue.length]} stroke-width="16"
        stroke-dasharray=${`${Math.max(0,u-2)} ${s}`} stroke-dashoffset=${-i} transform="rotate(-90 75 75)" style="filter:drop-shadow(0 0 4px rgba(255,46,136,.5))"/>`;return i+=u,d})}
    ${n&&l`<text x="75" y="72" text-anchor="middle" fill="#b49bb5" font-size="9" font-family="Orbitron" letter-spacing="1.5">${n[0]}</text>
    <text x="75" y="90" text-anchor="middle" fill="#fff" font-size="15" font-weight="800" font-family="Mono">${n[1]}</text>`}
  </svg>`}function ro({rows:t,height:e=140}){if(!t.length)return null;let n=Math.max(1,...t.flatMap(r=>[r.a,r.b])),o=340,a=e,s=Math.min(14,(o/t.length-8)/2),i=o/t.length;return l`<svg viewBox=${`0 0 ${o} ${a+18}`} class="chart" style=${{height:a+18+"px"}}>
    ${t.map((r,c)=>{let u=c*i+i/2,d=r.a/n*a,h=r.b/n*a;return l`<g>
        <rect x=${u-s-1} y=${a-d} width=${s} height=${d} rx="3" fill="#2bffa3" opacity=".85"/>
        <rect x=${u+1} y=${a-h} width=${s} height=${h} rx="3" fill="#ff2e88" opacity=".9"/>
        <text x=${u} y=${a+13} text-anchor="middle" font-size="9" fill="#7c6680" font-family="Orbitron">${r.label}</text>
      </g>`})}
  </svg>`}function lo({rows:t,height:e=120,fmt:n=o=>o.toFixed(1)}){let o=Math.max(...t.map(u=>Math.abs(u.v)),.01),a=340,s=e,i=s/2,r=a/t.length,c=r*.6;return l`<svg viewBox=${`0 0 ${a} ${s+16}`} class="chart" style=${{height:s+16+"px"}}>
    <line x1="0" x2=${a} y1=${i} y2=${i} stroke="rgba(255,255,255,.15)"/>
    ${t.map((u,d)=>{let h=Math.abs(u.v)/o*(i-4),m=d*r+(r-c)/2;return l`<g><rect x=${m} y=${u.v>=0?i-h:i} width=${c} height=${h} rx="3" fill=${u.v<0?"#2bffa3":"#ff4d6d"} opacity=${u.hl?1:.7}/>
        <text x=${m+c/2} y=${s+12} text-anchor="middle" font-size="9" fill=${u.hl?"#fff":"#7c6680"} font-family="Orbitron">${u.label}</text></g>`})}
  </svg>`}var pt={open:t=>{}};var po=31.1034768,uo="https://api.gold-api.com/price/",mo="https://api.nbp.pl/api";async function Kt(t){let e=q();if(!t&&e.rates.USD&&Date.now()-e.rates.at<6*36e5)return e.rates;let n={...e.rates,PLN:1};try{let o=await(await fetch(`${mo}/exchangerates/tables/a/?format=json`,{cache:"no-store"})).json();for(let a of o[0].rates)["USD","EUR","GBP","CHF"].includes(a.code)&&(n[a.code]=a.mid)}catch{}try{let o=await(await fetch("https://open.er-api.com/v6/latest/USD")).json(),a=o.rates.PLN;n.USD||(n.USD=a);for(let s of["AED","EUR","GBP","TRY","INR","SAR"])!n[s]&&o.rates[s]&&(n[s]=a/o.rates[s])}catch{}return n.USD&&(n.at=Date.now(),L("rates",n)),n}var $o="cp.gold.samples",fn=new Set,K={price:null,usdOz:null,at:null,prev:null,dir:0,err:null,dayOpen:null,ticks:0};function Ds(){try{return JSON.parse(localStorage.getItem($o))||[]}catch{return[]}}var kt=Ds(),vn=0;function Ms(){fn.forEach(t=>t({...K}))}async function Ts(){try{let t=q().rates.USD||(await Kt()).USD,n=await(await fetch(uo+"XAU",{cache:"no-store"})).json();if(!n.price||!t)throw new Error("no price");let o=n.price/po*t;K.prev=K.price,K.dir=K.prev==null?0:o>K.prev+1e-6?1:o<K.prev-1e-6?-1:0,K.price=o,K.usdOz=n.price,K.at=n.updatedAt?Date.parse(n.updatedAt):Date.now(),K.err=null,K.ticks++;let a=Date.now();if((a-vn>6e4||K.dir!==0)&&(kt.push([a,+o.toFixed(3)]),kt=kt.filter(s=>s[0]>a-8*864e5),a-vn>6e4)){vn=a;try{localStorage.setItem($o,JSON.stringify(kt))}catch{}}K.dayOpen=As(),Bs(o)}catch(t){K.err=String(t.message||t)}Ms()}function As(){let t=j.data;if(t.length){let o=M();for(let a=t.length-1;a>=0;a--)if(t[a][0]<o)return t[a][1]}let e=new Date;e.setHours(0,0,0,0);let n=kt.find(o=>o[0]>=e.getTime());return n?n[1]:null}var $e=null;function gn(){if($e)return;let t=async()=>{await Ts(),$e=setTimeout(t,1e3)};$e=setTimeout(t,0)}function Is(){clearTimeout($e),$e=null}document.addEventListener("visibilitychange",()=>document.visibilityState==="visible"?gn():Is());function Ut(){let[t,e]=f({...K});return R(()=>(fn.add(e),()=>fn.delete(e)),[]),t}var zt=()=>K.price||(kt.length?kt[kt.length-1][1]:j.data.length?j.data[j.data.length-1][1]:0),Jt=JSON.parse(sessionStorage.getItem("cp.fired")||"{}"),ve=new Set;function Bs(t){let e=q().gold;if(e.alertsOn){if(e.below&&t<=e.below&&!Jt.below&&(Jt.below=!0,ve.forEach(n=>n({kind:"below",text:`Gold dropped to ${t.toFixed(2)} z\u0142/g, under your ${e.below} z\u0142 target`}))),e.below&&t>e.below*1.005&&(Jt.below=!1),e.dropPct){let n=Date.now()-864e5,o=kt.filter(i=>i[0]>=n).map(i=>i[1]),a=(kt.find(i=>i[0]>=n)||[Date.now()])[0];if(o.length<10||a>Date.now()-3*36e5){sessionStorage.setItem("cp.fired",JSON.stringify(Jt));return}let s=Math.max(...o);s>0&&(s-t)/s*100>=e.dropPct&&!Jt.drop&&(Jt.drop=!0,ve.forEach(i=>i({kind:"drop",text:`Gold is down ${((s-t)/s*100).toFixed(1)}% from its 24h high`})))}sessionStorage.setItem("cp.fired",JSON.stringify(Jt))}}var vo="cp.gold.hist",j=(()=>{try{return JSON.parse(localStorage.getItem(vo))||{data:[],upTo:null}}catch{return{data:[],upTo:null}}})(),hn=new Set,me=null;function yn(){return me||(j.upTo===M()&&j.data.length?Promise.resolve(j):(me=(async()=>{let t=M(),e=[],n=j.data.length?Pt(j.data[j.data.length-1][0],1):"2013-01-02";for(;n<=t;){let s=Pt(n,360);s>t&&(s=t),e.push([n,s]),n=Pt(s,1)}let o=await Promise.all(e.map(async([s,i])=>{try{let r=await fetch(`${mo}/cenyzlota/${s}/${i}/?format=json`);return r.ok?(await r.json()).map(c=>[c.data,c.cena]):[]}catch{return null}}));if(o.some(s=>s===null)&&!j.data.length)throw new Error("offline");let a=new Map(j.data);for(let s of o)if(s)for(let[i,r]of s)a.set(i,r);j.data=[...a.entries()].sort((s,i)=>s[0].localeCompare(i[0])),o.some(s=>s===null)||(j.upTo=t);try{localStorage.setItem(vo,JSON.stringify(j))}catch{}return hn.forEach(s=>s(j.data.length)),j})().finally(()=>{me=null}),me))}function Ge(){let[t,e]=f(j.data.length);return R(()=>(hn.add(e),yn().catch(()=>{}),()=>hn.delete(e)),[]),j.data}var bn=[["1D",1],["1W",7],["1M",30],["6M",182],["1Y",365],["5Y",1826],["ALL",99999]];function fo(t,e,n){if(t==="1D"){let i=Date.now()-864e5,r=kt.filter(c=>c[0]>=i).map(([c,u])=>[c,u]);return n&&r.push([Date.now(),n]),{pts:r,time:!0}}let o=bn.find(i=>i[0]===t)[1],a=Pt(M(),-o),s=e.filter(i=>i[0]>=a).map(([i,r])=>[Date.parse(i),r]);return n&&s.length&&s.push([Date.now(),n]),{pts:s,time:!1}}function ho(t){if(!t.length)return null;let e=t[0],n=t[0];for(let s of t)s[1]<e[1]&&(e=s),s[1]>n[1]&&(n=s);let o=t[0][1],a=t[t.length-1][1];return{lo:e,hi:n,first:o,last:a,change:a-o,changePct:(a-o)/o*100,avg:ct(t,s=>s[1])/t.length}}function _n(t,e,n){let o=Pt(M(),-n),a=t.filter(s=>s[0]>=o).map(s=>s[1]);return a.length?a.filter(s=>s<e).length/a.length*100:null}var co=(t,e)=>{let n=t.slice(-e);return n.length?ct(n,o=>o[1])/n.length:null};function Re(t,e,n){if(!e||t.length<60)return null;let o=[],a=0,s=co(t,50),i=co(t,200),r=_n(t,e,365),c=Math.max(...t.slice(-22).map(m=>m[1]),e),u=(c-e)/c*100;if(s){let m=(e-s)/s*100;m<-1?(a+=1,o.push({good:!0,text:`${Math.abs(m).toFixed(1)}% below its 50-day average`})):m>3?(a-=1,o.push({good:!1,text:`${m.toFixed(1)}% above its 50-day average`})):o.push({good:null,text:"Close to its 50-day average"})}if(i){let m=(e-i)/i*100;m<0?(a+=1,o.push({good:!0,text:`Below its 200-day average (${m.toFixed(1)}%)`})):m>12&&(a-=1,o.push({good:!1,text:`${m.toFixed(0)}% above its 200-day average: stretched`}))}if(u>=4&&(a+=1,o.push({good:!0,text:`Dipped ${u.toFixed(1)}% from its 1-month high`})),r!=null&&(r<30?(a+=1,o.push({good:!0,text:`Cheaper than ${(100-r).toFixed(0)}% of days this year`})):r>90&&(a-=1,o.push({good:!1,text:`Near its 1-year high (top ${(100-r).toFixed(0)}%)`}))),n){let m=(e-n)/n*100;m<0?(a+=1,o.push({good:!0,text:`Below what gold cost when you bought (${m.toFixed(1)}%)`})):o.push({good:null,text:`${m.toFixed(1)}% above the market price at your past buys`})}let d=a>=3?"good":a>=1?"ok":"wait",h={good:"Good time to buy",ok:"Fair: could buy a little",wait:"Pricey: maybe wait"}[d];return{score:a,level:d,label:h,reasons:o,m50:s,m200:i,p1y:r,dip:u}}function go(t){let e={};for(let[o,a]of t){let s=o.slice(0,4);(e[s]||(e[s]=[])).push([+o.slice(5,7)-1,a])}let n=Array.from({length:12},()=>[]);for(let[o,a]of Object.entries(e)){if(new Set(a.map(r=>r[0])).size<12)continue;let i=ct(a,r=>r[1])/a.length;for(let r=0;r<12;r++){let c=a.filter(u=>u[0]===r);n[r].push((ct(c,u=>u[1])/c.length-i)/i*100)}}return n.map((o,a)=>({m:a,avg:o.length?ct(o)/o.length:0,n:o.length}))}function yo(t){let e={};for(let[n,o]of t){let a=n.slice(0,4);(!e[a]||o<e[a].lo[1])&&(e[a]={...e[a]||{},lo:[n,o]}),(!e[a].hi||o>e[a].hi[1])&&(e[a].hi=[n,o])}return Object.entries(e).map(([n,o])=>({y:n,...o})).reverse()}function bo(t,e=8){let n=[],o=t[0],a=null;for(let s of t)s[1]>o[1]?(a&&(o[1]-a[1])/o[1]*100>=e&&n.push({peak:o,trough:a,pct:(o[1]-a[1])/o[1]*100}),o=s,a=null):(!a||s[1]<a[1])&&(a=s);return a&&(o[1]-a[1])/o[1]*100>=e&&n.push({peak:o,trough:a,pct:(o[1]-a[1])/o[1]*100,ongoing:!0}),n.reverse()}async function _o(){try{let t=q().rates.USD||(await Kt()).USD;return(await(await fetch(uo+"XAG",{cache:"no-store"})).json()).price/po*t}catch{return null}}var Os="https://skibidi-null.github.io/creampie-holdings/news.json";async function fe(){let t=location.hostname.endsWith("github.io")?["news.json"]:[Os,"news.json"];for(let e of t)try{let n=await fetch(e+"?t="+Math.floor(Date.now()/3e5),{cache:"no-store"});if(n.ok)return await n.json()}catch{}return null}var wo="BNND5xQBfFpLPAdFjW_WMIZcM6RCx7KLS9AoKjWHeDz74Vlrpn9FuL01E9Oci52fSeBDGOVOMsbeL3p2-Gs9h7A",xo="BJ-LY694bqrHi8OwkWZtAUCpBX2H5KNPTdMzaMiuivIY46X3r642bO0IQtk8DcT0lriL2E4jaARskEBBfez86m4",ko="cph-5990de692b97d66928c23030";var Nt=()=>!!window.CPNative,ge=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1,wn=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===!0,No=()=>"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window;function Ls(){let t=q(),e=Et(t);return{v:1,tz:Intl.DateTimeFormat().resolvedOptions().timeZone||"Europe/Warsaw",gold:{on:!!t.gold.alertsOn,below:t.gold.below||null,dropPct:t.gold.dropPct||null,news:!!t.gold.newsOn},remind9pm:!!t.settings.remind9pm,card:{on:!!(t.card.on&&t.settings.cardRemind),name:t.card.name,dueDay:t.card.dueDay||0,owed:Math.round(et(t)*100)/100},lastEntry:t.txns.length?t.txns.reduce((n,o)=>o.date>n?o.date:n,""):null,widget:{today:e?e.todaySpent:null,left:e?e.left:null,month:nt(t,H()).spend,gold:K.price||null,privacy:!!t.settings.privacy}}}var he={enc:t=>btoa(String.fromCharCode(...new Uint8Array(t))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),dec:t=>Uint8Array.from(atob(t.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((t.length+3)%4)),e=>e.charCodeAt(0))};async function Fs(t){let e=await crypto.subtle.importKey("raw",he.dec(xo),{name:"ECDH",namedCurve:"P-256"},!1,[]),n=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},!0,["deriveBits"]),o=await crypto.subtle.deriveBits({name:"ECDH",public:e},n.privateKey,256),a=await crypto.subtle.importKey("raw",o,"HKDF",!1,["deriveKey"]),s=await crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:new Uint8Array(0),info:new TextEncoder().encode("cph-config")},a,{name:"AES-GCM",length:256},!1,["encrypt"]),i=crypto.getRandomValues(new Uint8Array(12)),r=await crypto.subtle.encrypt({name:"AES-GCM",iv:i},s,new TextEncoder().encode(JSON.stringify(t))),c=await crypto.subtle.exportKey("raw",n.publicKey);return JSON.stringify({e:he.enc(c),iv:he.enc(i),ct:he.enc(r)})}var So="",Co=null;async function ye(t){let e=Ls();if(Nt()){try{window.CPNative.setConfig(JSON.stringify(e))}catch{}return!0}if(!q().settings.alertsSetup||!No())return!1;try{let o=await(await navigator.serviceWorker.ready).pushManager.getSubscription();if(!o)return!1;let{widget:a,...s}=e,i={sub:o.toJSON(),cfg:s,at:Date.now()},r=JSON.stringify({...i,at:0}),c=Number(localStorage.getItem("cp.cfg.at")||0);if(!t&&r===So&&Date.now()-c<6*36e5)return!0;let u=await fetch(`https://ntfy.sh/${ko}`,{method:"POST",body:await Fs(i)});return u.ok&&(So=r,localStorage.setItem("cp.cfg.at",String(Date.now()))),u.ok}catch(n){return console.warn("sync",n),!1}}un.add(()=>{clearTimeout(Co),Co=setTimeout(()=>ye(),2500)});async function We(){if(Nt()){try{window.CPNative.requestNotifications()}catch{}return G(a=>({...a,settings:{...a.settings,alertsSetup:!0}})),"ok"}if(ge()&&!wn())return"install-first";if(!No())return"unsupported";if(await Notification.requestPermission()!=="granted")return"denied";let e=await navigator.serviceWorker.ready,n=await e.pushManager.getSubscription();return n||(n=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:he.dec(wo)})),G(a=>({...a,settings:{...a.settings,alertsSetup:!0}})),await ye(!0)?"ok":"relay-failed"}async function Po(t,e){if(Nt()){try{window.CPNative.notify(t,e)}catch{}return}try{Notification.permission==="granted"&&(await navigator.serviceWorker.ready).showNotification(t,{body:e,icon:"icons/icon-192.png",badge:"icons/badge.png",tag:t})}catch{}}var _={app:"Creampie Holdings",tagline:"Strictly adults. Strictly money.",hello:["Welcome back, big spender \u{1F608}","Back for more? \u{1F60F}","Daddy's home \u{1F4B8}","Ready to get filthy rich? \u{1F351}","Look who came back \u{1F4A6}"],nHome:"Lounge",nActivity:"Dirty Laundry",nGold:"Gold Digger",nWealth:"The Stash",nAdd:"Blow",addExp:"Blow some cash",addExpHint:"Add expense",addInc:"Money shot \u{1F4A6}",addIncHint:"Add income",addXfer:"Switch positions",addXferHint:"Move between accounts",addSplit:"Go Dutch",addSplitHint:"Split with a friend",addFriend:"Favours",addFriendHint:"Lend / borrow money",todayLeft:"You can still blow today",todayOver:"You went all the way. Over today by",noBudget:"Set a monthly limit so I know how far you can go",spentToday:"Blown today",thisMonth:"This month",netWorth:"Total package",netWorthHint:"Net worth",empty:"Nothing in here yet. Put it in \u{1F609}",card:"Plastic Daddy",cardHint:"Credit card",accounts:"Cash Stash",accountsHint:"Bank & cash",friends:"Favours Owed",friendsHint:"Friends & debts",goals:"Saving It For Later",goalsHint:"Savings goals",zakat:"Zakat",zakatHint:"Purify the stash",bills:"Regular Bills",billsHint:"Repeat payments",budget:"Limits & Safe Words",budgetHint:"Budgets",news:"Hot Gossip",newsHint:"Gold news",history:"Past Encounters",historyHint:"Monthly history",convert:"Exchange Fluids",convertHint:"Currency converter",summary:"Morning After",summaryHint:"Month summary",settings:"Kinks & Settings",settingsHint:"Settings",backup:"Protection",backupHint:"Backup & export",goldLive:"Gold, live & throbbing",buyGood:"Gold is going down \u{1F346}. Good time to buy",buyOk:"Fair price. A quickie buy is fine",buyWait:"Pricey. Keep it in your pants for now",boughtGold:"Got some gold",boughtGoldHint:"Log a purchase",discreet:"Discreet mode",discreetHint:"Hide all amounts",members:"Members only \u{1F51E}",pinAsk:"Show me your PIN \u{1F60F}",pinWrong:"Wrong. Try harder \u{1F608}",cardWarn80:"Easy tiger, Plastic Daddy is 80% maxed",catWarn:t=>`Getting too hot on ${t}. 80% of your limit`,catOver:t=>`You blew past your ${t} limit \u{1F4A6}`},Do=t=>t[Math.floor(Math.random()*t.length)];function Mo(t,e){let n=e.friend&&(t.friends.find(o=>o.id===e.friend)||{}).name;switch(e.t){case"exp":{let o=V(t,e.cat);return{icon:o.icon,title:e.note||o.name,sub:`${o.name} \xB7 ${dt(t,e.from)}`,sign:-1,cur:W(t,e.from)}}case"inc":{let o=V(t,e.cat);return{icon:o.icon,title:e.note||o.name,sub:`${o.name} \u2192 ${dt(t,e.to)}`,sign:1,cur:W(t,e.to)}}case"xfer":return{icon:e.to===z?"\u{1F4B3}":"\u{1F500}",title:e.note||(e.to===z?"Card bill paid":"Moved money"),sub:`${dt(t,e.from)} \u2192 ${dt(t,e.to)}`,sign:0,cur:W(t,e.from)};case"fout":return{icon:"\u{1F91D}",title:`${n||"Friend"}: ${e.note||"gave money"}`,sub:e.from?`from ${dt(t,e.from)}`:"no money moved",sign:0,cur:W(t,e.from)};case"fin":return{icon:"\u{1F91D}",title:`${n||"Friend"}: ${e.note||"got money"}`,sub:e.to?`into ${dt(t,e.to)}`:"no money moved",sign:0,cur:W(t,e.to)};case"gold":return{icon:"\u{1FA99}",title:e.note||"Gold purchase",sub:`Gold \xB7 ${dt(t,e.from)}`,sign:-1,cur:W(t,e.from)};case"adj":return{icon:"\u{1F6E0}\uFE0F",title:"Balance correction",sub:dt(t,e.to||e.from),sign:0,cur:W(t,e.to||e.from)};default:return{icon:"\u2022",title:e.note||e.t,sub:"",sign:0,cur:"PLN"}}}function qt({t,s:e}){let n=Mo(e,t);return l`<button class="item" onClick=${()=>t.t==="gold"?location.hash="#/gold":t.t!=="adj"&&pt.open({edit:t})}>
    <span class="em">${n.icon}</span>
    <div class="grow"><div class="t1">${n.title}</div><div class="t2">${n.sub}${t.rec?" \xB7 \u{1F501}":""}</div></div>
    <${x} v=${n.sign?n.sign*t.amt:t.amt} cur=${n.cur} sign=${n.sign>0} cls=${`amt ${n.sign>0?"up":n.sign<0?"":"dim"}`} />
  </button>`}function To(){let t=I(),[e,n]=f(H()),[o,a]=f("all"),[s,i]=f(""),r=s.trim().toLowerCase(),c=st(()=>{let m=t.txns;return r?m=m.filter(p=>{let $=Mo(t,p);return($.title+" "+$.sub+" "+(p.note||"")+" "+p.amt).toLowerCase().includes(r)}):m=m.filter(p=>yt(p.date)===e),o!=="all"&&(m=m.filter(p=>o==="exp"?p.t==="exp":o==="inc"?p.t==="inc":!["exp","inc"].includes(p.t))),[...m].sort((p,$)=>($.date+$.id).localeCompare(p.date+p.id))},[t.txns,e,o,r]),u=[];for(let m of c){let p=u[u.length-1];p&&p.date===m.date?p.items.push(m):u.push({date:m.date,items:[m]})}let d=nt(t,e),h=r?c.filter(m=>m.t==="exp").reduce((m,p)=>m+ht(t,p),0):0;return l`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">${_.nActivity}</div><div class="hint">Every naughty purchase, on the record</div></div></div>
    <input class="input" placeholder="🔍  Search: haircut, kebab, 50…" value=${s} onInput=${m=>i(m.target.value)} style="margin-bottom:10px" />
    ${!r&&l`<div class="row between" style="margin:4px 2px 10px">
      <button class="iconbtn" onClick=${()=>n(vt(e))}>‹</button>
      <div style="text-align:center"><div class="h-big" style="font-size:16px">${Yt(e,!0)}</div></div>
      <button class="iconbtn" onClick=${()=>n(Dt(e))} disabled=${e>=H()} style=${{opacity:e>=H()?.3:1}}>›</button>
    </div>
    <div class="stat3" style="margin-bottom:10px">
      <div><div class="l">Blown</div><div class="v"><${x} v=${d.spend} d=${0} /></div></div>
      <div><div class="l">Came in</div><div class="v up"><${x} v=${d.income} d=${0} /></div></div>
      <div><div class="l">Net</div><div class=${`v ${d.net>=0?"up":"down"}`}><${x} v=${d.net} d=${0} /></div></div>
    </div>`}
    ${r&&l`<div class="card" style="padding:12px"><b>${c.length}</b> matches${h?l` · spent <${x} v=${h} cls="pink" />`:""}</div>`}
    <${At} options=${[["all","All"],["exp","Spent"],["inc","Income"],["other","Moves & favours"]]} value=${o} onChange=${a} />
    ${u.length?u.map(m=>{let p=m.items.filter($=>$.t==="exp").reduce(($,v)=>$+ht(t,v),0);return l`<div>
        <div class="dayhead"><span>${J(m.date)}</span>${p>0&&l`<${x} v=${-p} />`}</div>
        <div class="card" style="padding:4px 12px;margin-bottom:6px">${m.items.map($=>l`<${qt} t=${$} s=${t} key=${$.id} />`)}</div>
      </div>`}):l`<${It} text=${r?"Nothing matches. Try something else \u{1F60F}":_.empty} />`}
  </div>`}var St=t=>{location.hash="#/"+t},Es=Do(_.hello);function Ao({openAdd:t}){let e=I(),n=Ut(),o=Ge(),a=n.price||zt(),s=Et(e),i=nt(e,H()),r=Ht(e,a),c=He(e,a),u=et(e),h=[...xt(e).values()].filter(N=>N>0).reduce((N,b)=>N+b,0),m=Ue(e,40),p=m.filter(N=>bt(M(),N.date)<=3&&N.amt>0),$=st(()=>Re(o,a,r.avgMarket),[o.length,Math.round((a||0)*2)]),v=n.dayOpen&&a?(a-n.dayOpen)/n.dayOpen*100:null,k=e.goals[0],[w,g]=f(null);R(()=>{fe().then(g)},[]);let y=w&&w.items&&w.items[0],C=[...e.txns].sort((N,b)=>(b.date+b.id).localeCompare(N.date+N.id)).slice(0,5),P=e.settings.privacy;return l`<div class="screen">
    <div class="top">
      <img class="logo" src="icons/icon-192.png" alt="" />
      <div class="grow"><div class="brand">${_.app}</div><div class="hint">${Es}</div></div>
      <button class=${`iconbtn ${P?"on":""}`} title=${_.discreet} onClick=${()=>{L("settings",{privacy:!P}),A(P?"Showing everything \u{1F633}":"Discreet mode on. Amounts hidden \u{1F92B}",P?"\u{1F440}":"\u{1F648}")}}>${P?"\u{1F648}":"\u{1F440}"}</button>
      <button class="iconbtn" onClick=${()=>St("settings")}>⚙️</button>
    </div>

    ${!e.settings.onboarded&&l`<div class="card neon tap" onClick=${()=>St("setup")}>
      <div class="row"><span style="font-size:30px">🔞</span><div class="grow"><div style="font-weight:700">First time? Let's get you set up</div><div class="hint">Balances, card limit, monthly limit. 1 minute</div></div><span class="pink">→</span></div>
    </div>`}

    <div class="card neon hero" onClick=${()=>St("budget")}>
      <div class="scan"></div><div class="corner"></div>
      ${s?l`
        <div class="label">${s.left>=0?_.todayLeft:"Over today by"}</div>
        <div class=${`big ${s.left>=0?"glow-pink":"down glow-down"}`}><${x} v=${Math.abs(s.left)} /></div>
        <div style="margin:10px 0 6px"><${gt} v=${s.allowance?s.todaySpent/s.allowance:1} cls=${s.left<0?"hot":""} /></div>
        <div class="row between sub"><span>${_.spentToday}: <${x} v=${s.todaySpent} /></span><span>${s.daysLeft}d left · <${x} v=${s.monthLeft} d=${0} /></span></div>
      `:l`
        <div class="label">${_.thisMonth}</div>
        <div class="big glow-pink"><${x} v=${i.spend} /></div>
        <div class="sub">${_.noBudget} →</div>
      `}
    </div>

    <div class="card goldy tap" onClick=${()=>St("gold")} style="padding:14px 16px">
      <div class="row">
        <span style="font-size:26px">🪙</span>
        <div class="grow">
          <div class="hint"><span class=${`livedot ${n.price?"":"off"}`}></span>GOLD · LIVE · per gram</div>
          <div class="row" style="gap:8px;align-items:baseline">
            <span class=${`mono glow-gold gold ${n.dir>0?"ticker flash-up":n.dir<0?"ticker flash-down":""}`} key=${n.ticks} style="font-size:24px;font-weight:800">${a?T(a)+" z\u0142":"\u2026"}</span>
            ${v!=null&&l`<span class=${`mono ${v>=0?"up":"down"}`} style="font-size:13px">${v>=0?"\u25B2":"\u25BC"} ${Ct(v,2)}</span>`}
          </div>
        </div>
        ${$&&l`<span class=${`tag ${$.level==="good"?"up":$.level==="wait"?"down":"watch"}`}>${$.level==="good"?"Buy \u{1F346}":$.level==="wait"?"Wait":"Fair"}</span>`}
      </div>
    </div>

    ${p.map(N=>l`<div class="card tap" style="border-color:rgba(255,184,77,.4);padding:12px 16px" onClick=${()=>St(N.kind==="card"?"card":"bills")}>
      <div class="row"><span style="font-size:20px">⏰</span><div class="grow"><b>${N.name}</b><div class="hint">${J(N.date)}${N.date===M()?". Due today!":""}</div></div><${x} v=${N.amt} cur=${N.cur} cls="warn" /></div>
    </div>`)}

    <div class="sect"><span class="h-title">The Menu 🔞</span><span class="hint">tap anything</span></div>
    <div class="tiles">
      <${rt} ic="🧾" nm=${_.nActivity} hint="All spending" val=${l`<${x} v=${i.spend} />`} sub=${`${i.count} this month`} accent="#ff2e88" go="activity" />
      <${rt} ic="💳" nm=${_.card} hint=${_.cardHint} val=${e.card.limit?l`<${x} v=${e.card.limit-u} />`:"Set limit"} sub=${e.card.limit?"available":""} accent="#a35cff" go="card" />
      <${rt} ic="💰" nm=${_.accounts} hint=${_.accountsHint} val=${l`<${x} v=${pe(e)} />`} sub=${`${e.accounts.length} places`} accent="#38e8ff" go="accounts" />
      <${rt} ic="🪙" nm=${_.nGold} hint="Your gold" val=${r.grams?l`<${x} v=${r.value} />`:"No gold yet"} sub=${r.grams?`${T(r.grams,2)} g`:""} accent="#ffc94d" go="gold" />
      <${rt} wide ic="👑" nm=${_.netWorth} hint="Everything you own minus what you owe" val=${l`<${x} v=${c.total} />`} sub=${"cash + gold + owed to you \u2212 debts"} accent="#2bffa3" go="wealth" />
      <${rt} ic="🤝" nm=${_.friends} hint=${_.friendsHint} val=${l`<${x} v=${h} />`} sub="owed to you" accent="#ff7ab8" go="friends" />
      <${rt} ic="🎯" nm=${_.goals} hint=${_.goalsHint} val=${k?`${Math.round(k.saved/k.target*100||0)}%`:"Add a goal"} sub=${k?k.name:""} accent="#e0ff4d" go="goals" />
      <${rt} ic="🔁" nm=${_.bills} hint=${_.billsHint} val=${m[0]?J(m[0].date):"None yet"} sub=${m[0]?m[0].name:""} accent="#ff7a45" go="bills" />
      <${rt} ic="🗞️" nm=${_.news} hint=${_.newsHint} val=${y?y.impact==="up"?"\u25B2 may rise":y.impact==="down"?"\u25BC may fall":"\u25CF watch":"\u2026"} sub=${y?y.title:""} accent="#38e8ff" go="news" />
    </div>
    <div class="tiles three" style="margin-top:10px">
      <${rt} small ic="⛓️" nm="Limits" hint="Budgets" accent="#ff2e88" go="budget" />
      <${rt} small ic="📊" nm="History" hint="Months" accent="#a35cff" go="history" />
      <${rt} small ic="🌅" nm="Morning After" hint="Summary" accent="#ffc94d" go="summary" />
      <${rt} small ic="🕋" nm="Zakat" hint="Calculator" accent="#2bffa3" go="zakat" />
      <${rt} small ic="💱" nm="Exchange" hint="Converter" accent="#38e8ff" go="convert" />
      <${rt} small ic="🛡️" nm="Protection" hint="Backup" accent="#ff7ab8" go="backup" />
    </div>

    <div class="sect"><span class="h-title">Latest action</span><button class="more" onClick=${()=>St("activity")}>See all →</button></div>
    <div class="card" style="padding:6px 12px">
      ${C.length?C.map(N=>l`<${qt} t=${N} s=${e} />`):l`<div class="empty"><span class="e">🍑</span>${_.empty}<div style="margin-top:12px"><button class="btn primary" onClick=${()=>t("exp")}>${_.addExp}</button></div></div>`}
    </div>
  </div>`}function rt({ic:t,nm:e,hint:n,val:o,sub:a,accent:s,go:i,wide:r,small:c}){return l`<button class=${`tile ${r?"wide":""} ${c?"small":""}`} style=${{"--accent":s}} onClick=${()=>St(i)}>
    <div class="ic">${t}</div>
    <div>
      <div class="nm">${e}</div>
      ${o!=null&&l`<div class="val">${o}</div>`}
      <div class="hint" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a||n}</div>
    </div>
  </button>`}var Hs=[["exp","\u{1F4B8} Spend"],["inc","\u{1F4A6} Income"],["xfer","\u{1F500} Move"],["split","\u{1F355} Split"],["friend","\u{1F91D} Favour"]];function Bo({onClose:t,edit:e,mode:n="exp",preset:o={}}){let a=I(),[s,i]=f(e?e.t==="fout"||e.t==="fin"?"friend":e.t:n);return l`<${ot} onClose=${t}>${r=>l`
    ${!e&&l`<div style="margin-bottom:14px"><${At} options=${Hs} value=${s} onChange=${c=>{Mt(),i(c)}} /></div>`}
    ${e&&l`<h3>Edit entry</h3>`}
    ${s==="exp"&&l`<${zs} s=${a} edit=${e} preset=${o} done=${r} />`}
    ${s==="inc"&&l`<${Gs} s=${a} edit=${e} done=${r} />`}
    ${s==="xfer"&&l`<${Rs} s=${a} edit=${e} preset=${o} done=${r} />`}
    ${s==="split"&&l`<${Ws} s=${a} done=${r} />`}
    ${s==="friend"&&l`<${js} s=${a} edit=${e} preset=${o} done=${r} />`}
  `}<//>`}function be({value:t,onInput:e,cur:n="PLN",label:o}){return l`<div class="amount">
    <div class="cur">${o||n}</div>
    <${F} cls="" value=${t} onInput=${e} autofocus />
  </div>`}function Zt({s:t,value:e,onChange:n,card:o=!0,none:a,noneLabel:s="No money moved"}){return l`<div class="chips">
    ${t.accounts.map(i=>l`<button class=${`chip ${e===i.id?"on":""}`} onClick=${()=>n(i.id)}>${i.icon||"\u{1F3E6}"} ${i.name}${i.cur!=="PLN"?` \xB7 ${i.cur}`:""}</button>`)}
    ${o&&t.card.on&&l`<button class=${`chip ${e===z?"on":""}`} onClick=${()=>n(z)}>💳 ${t.card.name}</button>`}
    ${a&&l`<button class=${`chip ${e==null?"on":""}`} onClick=${()=>n(null)}>✋ ${s}</button>`}
  </div>`}function _e({date:t,setDate:e,note:n,setNote:o}){return l`<div class="row" style="gap:8px">
    <div style="flex:0 0 46%"><${S} label="When"><input class="input" type="date" value=${t} max="2099-12-31" onInput=${a=>e(a.target.value||M())} /><//></div>
    <div class="grow"><${S} label="Note"><input class="input" placeholder="optional" value=${n} onInput=${a=>o(a.target.value)} /><//></div>
  </div>`}function we({edit:t,onSave:e,ok:n,label:o="Save it"}){return l`<div class="btns" style="margin-top:6px">
    ${t&&l`<button class="btn danger" onClick=${()=>{confirm("Delete this entry?")&&(le(t.id),A("Gone. Like it never happened \u{1F92B}","\u{1F5D1}\uFE0F"),e(!0))}}>Delete</button>`}
    <button class="btn primary grow" disabled=${!n} style=${{opacity:n?1:.4}} onClick=${()=>n&&e()}>${o}</button>
  </div>`}var Oo=(t,e,n,o)=>{for(let a=t.txns.length-1;a>=0;a--)if(t.txns[a].t===e&&t.txns[a][n]!=null)return t.txns[a][n];return o};function Us(t,e){let n=q();if(e===z&&n.card.limit){let s=et(n)/n.card.limit;if(s>=1)return A(`Plastic Daddy is maxed out (${Math.round(s*100)}%) \u{1F975}`,"\u{1F4B3}",5e3);if(s>=.8)return A(_.cardWarn80,"\u{1F4B3}",5e3)}let o=n.budget.cats[t];if(o){let s=nt(n,H()).byCat[t]||0,i=V(n,t).name;if(s>=o)return A(_.catOver(i),"\u{1F6A8}",5e3);if(s>=o*.8)return A(_.catWarn(i),"\u{1F525}",5e3)}let a=Et(n);if(a&&a.left<0)return A(`${_.todayOver} ${at(-a.left)}`,"\u{1F633}",4500);A(["Logged. Naughty \u{1F60F}","Spent and recorded \u{1F4B8}","Got it, big spender \u{1F608}","In it goes \u{1F48B}"][Math.floor(Math.random()*4)],"\u2705")}function zs({s:t,edit:e,preset:n,done:o}){let[a,s]=f(e?String(e.amt):n.amt?String(n.amt):""),[i,r]=f(e?e.cat:n.cat||null),[c,u]=f(e?e.from:Oo(t,"exp","from",t.accounts[0]&&t.accounts[0].id)),[d,h]=f(e?e.date:M()),[m,p]=f(e?e.note:n.note||""),$=st(()=>{let w={};for(let g of t.txns)g.t==="exp"&&(w[g.cat]=(w[g.cat]||0)+1);return[...t.cats.exp].sort((g,y)=>(w[y.id]||0)-(w[g.id]||0))},[t.cats.exp]),v=Q(a)&&i&&c!==void 0,k=()=>{let w={t:"exp",amt:D(a),cat:i,from:c,date:d,note:m};e?(Xt(e.id,w),A("Updated \u{1F48B}","\u270F\uFE0F")):(Tt(w),Us(i,c)),o()};return l`
    <${be} value=${a} onInput=${s} cur=${W(t,c)} label=${`${_.addExp} \xB7 ${W(t,c)}`} />
    <div class="catgrid" style="margin-bottom:14px">
      ${$.map(w=>l`<button class=${`cat ${i===w.id?"on":""}`} onClick=${()=>{Mt(),r(w.id)}}><span class="e">${w.icon}</span>${w.name}</button>`)}
    </div>
    <${S} label="Paid with"><${Zt} s=${t} value=${c} onChange=${u} /><//>
    <${_e} ...${{date:d,setDate:h,note:m,setNote:p}} />
    <${we} edit=${e} ok=${v} onSave=${w=>w?o():k()} />`}function Gs({s:t,edit:e,done:n}){let[o,a]=f(e?String(e.amt):""),[s,i]=f(e?e.cat:"salary"),[r,c]=f(e?e.to:Oo(t,"inc","to",t.accounts[0]&&t.accounts[0].id)),[u,d]=f(e?e.date:M()),[h,m]=f(e?e.note:""),p=Q(o)&&s&&r,$=()=>{let v={t:"inc",amt:D(o),cat:s,to:r,date:u,note:h};e?Xt(e.id,v):Tt(v),A(e?"Updated \u{1F48B}":"Money shot received \u{1F4A6}","\u{1F911}"),n()};return l`
    <${be} value=${o} onInput=${a} label=${`${_.addInc} \xB7 ${W(t,r)}`} />
    <${S} label="What kind"><div class="chips">${t.cats.inc.map(v=>l`<button class=${`chip ${s===v.id?"on":""}`} onClick=${()=>i(v.id)}>${v.icon} ${v.name}</button>`)}</div><//>
    <${S} label="Landed in"><${Zt} s=${t} value=${r} onChange=${c} card=${!1} /><//>
    <${_e} ...${{date:u,setDate:d,note:h,setNote:m}} />
    <${we} edit=${e} ok=${p} onSave=${v=>v?n():$()} />`}function Rs({s:t,edit:e,preset:n,done:o}){let[a,s]=f(e?String(e.amt):n.amt?String(n.amt):""),[i,r]=f(e&&e.amt2!=null?String(e.amt2):""),[c,u]=f(e?e.from:n.from||t.accounts[0]&&t.accounts[0].id),[d,h]=f(e?e.to:n.to||t.accounts[1]&&t.accounts[1].id),[m,p]=f(e?e.date:M()),[$,v]=f(e?e.note:n.note||""),k=W(t,c),w=W(t,d),g=k!==w,y=Q(a)&&c&&d&&c!==d&&c!==z&&(!g||Q(i)),C=()=>{let P={t:"xfer",amt:D(a),amt2:g?D(i):null,from:c,to:d,date:m,note:$||(d===z?"Card bill paid":"")};e?Xt(e.id,P):Tt(P),A(d===z?"Plastic Daddy satisfied \u{1F4B3}\u2728":"Switched positions \u{1F500}","\u2705"),o()};return l`
    <${be} value=${a} onInput=${s} label=${`${_.addXfer} \xB7 ${k}`} />
    <${S} label="From"><${Zt} s=${t} value=${c} onChange=${u} card=${!1} /><//>
    <${S} label="To (pick the card to pay its bill)"><${Zt} s=${t} value=${d} onChange=${h} /><//>
    ${g&&l`<${S} label=${`Amount received in ${w}`}><${F} value=${i} onInput=${r} /><//>`}
    <div class="note" style="margin:-4px 4px 12px">Moving money isn't spending. Your totals stay honest.</div>
    <${_e} ...${{date:m,setDate:p,note:$,setNote:v}} />
    <${we} edit=${e} ok=${y} onSave=${P=>P?o():C()} />`}function Lo({s:t,value:e,onChange:n,newName:o,setNewName:a}){return l`<div>
    <div class="chips">
      ${t.friends.map(s=>l`<button class=${`chip ${e===s.id?"on":""}`} onClick=${()=>n(s.id)}>${s.emoji||"\u{1F9D1}"} ${s.name}</button>`)}
      <button class=${`chip ${e==="new"?"on":""}`} onClick=${()=>n("new")}>＋ New person</button>
    </div>
    ${e==="new"&&l`<input class="input" style="margin-top:8px" placeholder="Their name" value=${o} onInput=${s=>a(s.target.value)} />`}
  </div>`}function Fo(t,e){if(t!=="new")return t;let n=_t();return G(o=>({...o,friends:[...o.friends,{id:n,name:e.trim(),emoji:"\u{1F9D1}"}]})),n}function Ws({s:t,done:e}){let[n,o]=f(""),[a,s]=f(""),[i,r]=f(2),[c,u]=f(t.friends[0]?t.friends[0].id:"new"),[d,h]=f(""),[m,p]=f("dining"),[$,v]=f(t.accounts[0]&&t.accounts[0].id),[k,w]=f(M()),[g,y]=f(""),C=D(n),P=a?D(a):C/i,N=C-P,b=Q(n)&&Number.isFinite(P)&&P>=0&&N>0&&(c!=="new"||d.trim())&&$,B=()=>{let O=Fo(c,d),U=Tt({t:"exp",amt:P,cat:m,from:$,date:k,note:g||"Split bill (my share)"});Tt({t:"fout",amt:N,from:$,friend:O,date:k,note:g||"Split bill (their share)",pair:U.id}),A(`Split done. They owe you ${at(N)} \u{1F60F}`,"\u{1F355}"),e()};return l`
    <${be} value=${n} onInput=${o} label="Total bill you paid" />
    <${S} label="Split between"><div class="chips">${[2,3,4,5,6].map(O=>l`<button class=${`chip ${i===O&&!a?"on":""}`} onClick=${()=>{r(O),s("")}}>${O} people</button>`)}</div><//>
    <${S} label="Or my exact share"><${F} value=${a} onInput=${s} placeholder=${Number.isFinite(C)?(C/i).toFixed(2):"0"} /><//>
    <${S} label="Who owes you the rest"><${Lo} ...${{s:t,value:c,onChange:u,newName:d,setNewName:h}} /><//>
    <${S} label="Category"><div class="chips">${t.cats.exp.slice(0,12).map(O=>l`<button class=${`chip ${m===O.id?"on":""}`} onClick=${()=>p(O.id)}>${O.icon} ${O.name}</button>`)}</div><//>
    <${S} label="Paid with"><${Zt} s=${t} value=${$} onChange=${v} /><//>
    ${Q(n)&&l`<div class="card" style="padding:12px"><div class="kv"><span>Your share (spending)</span><span>${at(P)}</span><span>They owe you</span><span class="up">${at(N)}</span></div></div>`}
    <${_e} ...${{date:k,setDate:w,note:g,setNote:y}} />
    <${we} ok=${b} onSave=${B} label="Split it" />`}var Io=[["lend","I lent them","fout","They owe you more"],["borrow","I borrowed","fin","You owe them more"],["repaid","They paid me back","fin","They owe you less"],["repay","I paid them back","fout","You owe them less"]];function js({s:t,edit:e,preset:n,done:o}){let[a,s]=f(e?e.kind||(e.t==="fout"?"lend":"borrow"):n.kind||"lend"),[i,r]=f(e?e.friend:n.friend||(t.friends[0]?t.friends[0].id:"new")),[c,u]=f(""),[d,h]=f(e?String(e.amt):n.amt?String(n.amt):""),m=Io.find(N=>N[0]===a),[p,$]=f(e?m[2]==="fout"?e.from:e.to:null),[v,k]=f(e?e.date:M()),[w,g]=f(e?e.note:""),y=xt(t),C=Q(d)&&(i!=="new"||c.trim()),P=()=>{let N=Fo(i,c),b=m[2],B={t:b,kind:a,amt:D(d),friend:N,from:b==="fout"?p:null,to:b==="fin"?p:null,date:v,note:w||m[1]};e?Xt(e.id,B):Tt(B),A(m[3],"\u{1F91D}"),o()};return l`
    <${be} value=${d} onInput=${h} label=${_.addFriend} />
    <${S} label="What happened"><div class="chips">${Io.map(([N,b])=>l`<button class=${`chip ${a===N?"on":""}`} onClick=${()=>s(N)}>${b}</button>`)}</div><//>
    <${S} label="Who"><${Lo} ...${{s:t,value:i,onChange:r,newName:c,setNewName:u}} /><//>
    ${i&&i!=="new"&&l`<div class="note" style="margin:-4px 4px 12px">Right now: ${(()=>{let N=y.get(i)||0;return N>0?`they owe you ${at(N)}`:N<0?`you owe them ${at(-N)}`:"all square"})()}</div>`}
    <${S} label=${m[2]==="fout"?"Money came out of":"Money went into"}><${Zt} s=${t} value=${p} onChange=${$} card=${m[2]==="fout"} none /><//>
    <${_e} ...${{date:v,setDate:k,note:w,setNote:g}} />
    <${we} edit=${e} ok=${C} onSave=${N=>N?o():P()} />`}function Ho(){let t=I(),e=Ut(),n=Ge(),o=e.price||zt(),[a,s]=f("1M"),[i,r]=f(null),[c,u]=f(null);R(()=>{fe().then(u)},[]);let d=Ht(t,o),h=d.avgPremium!=null?d.avgPremium:.1,m=st(()=>fo(a,n,o),[a,n.length,a==="1D"?e.ticks:Math.round(o||0)]),p=ho(m.pts),$=st(()=>Re(n,o,d.avgMarket),[n.length,Math.round((o||0)*2),d.avgMarket]),v=st(()=>go(n),[n.length]),k=st(()=>yo(n),[n.length]),w=st(()=>bo(n,8).slice(0,6),[n.length]),g=st(()=>o?_n(n,o,1826):null,[n.length,Math.round(o||0)]),y=e.dayOpen&&o?(o-e.dayOpen)/e.dayOpen*100:null,C=e.at?Math.max(0,Math.round((Date.now()-e.at)/1e3)):null,P=[...v].filter(b=>b.n).sort((b,B)=>b.avg-B.avg).slice(0,3),N=t.gold.goalGrams;return l`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">${_.nGold}</div><div class="hint">${_.goldLive}</div></div>
      <button class=${`iconbtn ${t.gold.alertsOn?"on":""}`} onClick=${()=>r("alerts")}>🔔</button></div>

    <div class="card goldy hero" style="text-align:center">
      <div class="scan" style="background:linear-gradient(to bottom,transparent,rgba(255,201,77,.08),transparent)"></div>
      <div class="label"><span class=${`livedot ${e.price&&!e.err?"":"off"}`}></span>${e.err&&!e.price?"Offline: last known":"Live spot \xB7 z\u0142 per gram"}</div>
      <div class=${`ticker gold glow-gold ${e.dir>0?"flash-up":e.dir<0?"flash-down":""}`} key=${e.ticks}>${o?T(o):"\u2026"}</div>
      <div class="row" style="justify-content:center;gap:10px;font-size:13px">
        ${y!=null&&l`<span class=${`mono ${y>=0?"up glow-up":"down glow-down"}`}>${y>=0?"\u25B2":"\u25BC"} ${T(Math.abs(o-e.dayOpen))} (${Ct(y,2)})</span><span class="hint">vs yesterday's NBP price</span>`}
      </div>
      <div class="hint" style="margin-top:6px">${e.usdOz?`$${T(e.usdOz)}/oz \xB7 `:""}${C!=null?`updated ${C}s ago`:"connecting\u2026"} · refreshes every second</div>
      <div class="sep"></div>
      <div class="row between" style="font-size:13px">
        <span class="dim">Shop price estimate<div class="hint">spot + your ${T(h*100,1)}% premium</div></span>
        <span class="mono gold" style="font-weight:800;font-size:18px">${o?T(o*(1+h))+" z\u0142":"\u2026"}</span>
      </div>
    </div>

    ${$&&l`<div class=${`signal ${$.level}`} style="margin-bottom:12px">
      <div class="row between"><b style="font-size:16px">${$.level==="good"?"\u{1F346} "+_.buyGood:$.level==="ok"?"\u{1F60F} "+_.buyOk:"\u{1F975} "+_.buyWait}</b></div>
      <div class="gauge"><i style=${{left:`${Oe(100-($.score+3)/8*100,3,97)}%`}}></i></div>
      <div class="row between hint"><span>Cheap</span><span>Pricey</span></div>
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
        ${$.reasons.map(b=>l`<div style="font-size:13px"><span class=${b.good?"up":b.good===!1?"down":"gold"}>${b.good?"\u2714":b.good===!1?"\u2716":"\u25CF"}</span> ${b.text}</div>`)}
        ${g!=null&&l`<div style="font-size:13px"><span class="cyan">◆</span> Over 5 years, gold was cheaper than today on ${g.toFixed(0)}% of days</div>`}
      </div>
      <div class="note" style="margin-top:8px">Based on price history only. A guide, not financial advice.</div>
    </div>`}

    <div class="card">
      <${At} options=${bn.map(([b])=>[b,b])} value=${a} onChange=${s} />
      <div style="margin-top:10px"><${io} pts=${m.pts} time=${m.time} color="#ffc94d" fmt=${b=>T(b)+" z\u0142/g"} refLine=${d.avgMarket||null} /></div>
      ${d.avgMarket?l`<div class="hint"><span class="cyan">- - -</span> market price at your buys (${T(d.avgMarket)} zł) · <span class="up">●</span> low · <span class="down">●</span> high</div>`:l`<div class="hint"><span class="up">●</span> lowest · <span class="down">●</span> highest</div>`}
      ${p&&l`<div class="stat3" style="margin-top:10px">
        <div><div class="l">Low</div><div class="v up">${T(p.lo[1])}</div><div class="d">${Eo(p.lo[0],m.time)}</div></div>
        <div><div class="l">High</div><div class="v down">${T(p.hi[1])}</div><div class="d">${Eo(p.hi[0],m.time)}</div></div>
        <div><div class="l">Change</div><div class=${`v ${p.change>=0?"up":"down"}`}>${Ct(p.changePct)}</div><div class="d">${a}</div></div>
      </div>`}
      ${a==="1D"&&m.pts.length<5&&l`<div class="note" style="margin-top:8px">The 1-day chart builds while the app is open. Older ranges use the official NBP price.</div>`}
    </div>

    <div class="sect"><span class="h-title">Your gold 🪙</span><button class="more" onClick=${()=>r({buy:{}})}>＋ ${_.boughtGold}</button></div>
    <div class="card goldy">
      ${d.grams?l`
        <div class="row between"><div><div class="hint">You own</div><div class="mono gold glow-gold" style="font-size:28px;font-weight:800">${T(d.grams,2)} g</div></div>
          <div style="text-align:right"><div class="hint">Worth now (spot)</div><div style="font-size:20px;font-weight:800"><${x} v=${d.value} /></div></div></div>
        <div class="sep"></div>
        <div class="kv">
          <span>You paid in total</span><${x} v=${d.paid} />
          <span>Avg you paid / g</span><${x} v=${d.avgPaid} />
          <span>Avg market price / g at purchase</span><${x} v=${d.avgMarket} />
          <span>Avg shop premium</span><span>${d.avgPremium!=null?T(d.avgPremium*100,1)+"%":"\u2014"}</span>
          <span>Profit / loss vs what you paid</span><${x} v=${d.pl} sign cls=${d.pl>=0?"up":"down"} />
          <span>If you sold back (~${t.gold.sellSpread}% below spot)</span><${x} v=${d.value*(1-t.gold.sellSpread/100)-d.paid} sign cls=${d.value*(1-t.gold.sellSpread/100)-d.paid>=0?"up":"down"} />
        </div>
        ${N>0&&l`<div style="margin-top:12px"><div class="row between hint"><span>Goal: ${T(N,0)} g</span><span>${Math.round(d.grams/N*100)}%</span></div><${gt} v=${d.grams/N} cls="gold" /></div>`}
      `:l`<div class="empty"><span class="e">🪙</span>No gold logged yet. Get some bling, daddy.<div style="margin-top:12px"><button class="btn goldbtn" onClick=${()=>r({buy:{}})}>${_.boughtGold}</button></div></div>`}
    </div>
    ${t.gold.buys.length>0&&l`<div class="card" style="padding:4px 12px">
      ${[...t.gold.buys].sort((b,B)=>B.date.localeCompare(b.date)).map(b=>{let B=o?(o-b.paid)/b.paid*100:0;return l`<button class="item" onClick=${()=>r({buy:b})}>
          <span class="em">🪙</span>
          <div class="grow"><div class="t1">${T(b.g,2)} g at ${T(b.paid)} zł/g</div><div class="t2">${J(b.date)} · market was ${T(b.market||0)} · premium ${b.market?T((b.paid-b.market)/b.market*100,1)+"%":"\u2014"}</div></div>
          <span class=${`amt mono ${B>=0?"up":"down"}`}>${Ct(B)}</span>
        </button>`})}
    </div>`}

    <div class="sect"><span class="h-title">Hot Gossip 🗞️</span><button class="more" onClick=${()=>St("news")}>All news →</button></div>
    <div class="card" style="padding:6px 14px"><${Uo} news=${c} max=${3} /></div>

    <div class="sect"><span class="h-title">When was it cheapest?</span></div>
    ${P.length>0&&l`<div class="card">
      <b>Historically cheaper months</b>
      <div class="hint" style="margin-bottom:8px">How each month's average price compared with its year (${v[0].n} full years of NBP data). Green = cheaper than usual.</div>
      <${lo} rows=${v.map(b=>({v:b.avg,label:Be(b.m)[0]+Be(b.m)[1],hl:P.includes(b)}))} />
      <div style="font-size:13px;margin-top:6px">Usually cheapest: ${P.map(b=>l`<span class="tag up" style="margin:2px">${Be(b.m)} ${Ct(b.avg)}</span>`)}</div>
      <div class="note" style="margin-top:6px">Gold has mostly risen year after year, so early months often look "cheap". Patterns don't always repeat.</div>
    </div>`}
    ${w.length>0&&l`<div class="card">
      <b>Biggest dips: the best times to have bought</b>
      <div class="list" style="margin-top:6px">${w.map(b=>l`<div class="item">
        <span class="em">${b.ongoing?"\u{1F525}":"\u{1F4C9}"}</span>
        <div class="grow"><div class="t1">−${b.pct.toFixed(1)}% ${b.ongoing?l`<span class="tag watch">happening now</span>`:""}</div>
          <div class="t2">${J(b.peak[0])} ${T(b.peak[1])} → ${J(b.trough[0])} ${T(b.trough[1])} zł</div></div>
      </div>`)}</div>
    </div>`}
    ${k.length>0&&l`<div class="card">
      <b>Lowest & highest price each year</b>
      <div class="list" style="margin-top:6px">${k.map(b=>l`<div class="item" style="padding:8px 2px">
        <span class="mono" style="width:48px;font-weight:700">${b.y}</span>
        <div class="grow t2"><span class="up">▼ ${T(b.lo[1])}</span> ${J(b.lo[0]).replace(" "+b.y,"")} · <span class="down">▲ ${T(b.hi[1])}</span> ${J(b.hi[0]).replace(" "+b.y,"")}</div>
      </div>`)}</div>
      <div class="note">NBP official gold price (zł per gram), since 2013.</div>
    </div>`}

    ${i==="alerts"&&l`<${Ys} onClose=${()=>r(null)} price=${o} />`}
    ${i&&i.buy&&l`<${Xs} buy=${i.buy} price=${o} onClose=${()=>r(null)} />`}
  </div>`}var Eo=(t,e)=>{let n=new Date(t);return e?n.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):n.toLocaleDateString([],{day:"numeric",month:"short",year:"2-digit"})};function Uo({news:t,max:e=50}){return t?!t.items||!t.items.length?l`<div class="empty" style="padding:16px">No juicy news right now.</div>`:t.items.slice(0,e).map(n=>l`<a class="news" href=${n.link} target="_blank" rel="noopener">
    <div class="row" style="gap:6px;margin-bottom:4px">
      <span class=${`tag ${n.impact}`}>${n.impact==="up"?"\u25B2 may rise":n.impact==="down"?"\u25BC may fall":"\u25CF watch"}</span>
      <span class="hint">${n.source} · ${zo(n.date)}</span>
    </div>
    <div style="font-weight:600;font-size:14px">${n.title}</div>
    ${n.why&&l`<div class="hint" style="margin-top:2px">${n.why}</div>`}
  </a>`):l`<div class="empty" style="padding:16px">Listening for gossip…</div>`}var zo=t=>{let e=Math.round((Date.now()-Date.parse(t))/6e4);return e<60?`${Math.max(1,e)}m ago`:e<1440?`${Math.round(e/60)}h ago`:`${Math.round(e/1440)}d ago`};function Go(){let[t,e]=f(null);R(()=>{fe().then(s=>e(s||{items:[]}))},[]);let n=t&&t.items?t.items.filter(s=>s.impact==="up").length:0,o=t&&t.items?t.items.filter(s=>s.impact==="down").length:0,a=n>o*1.3?["up","Gossip leans BULLISH: things that usually push gold up \u{1F346}"]:o>n*1.3?["down","Gossip leans BEARISH: things that usually pull gold down \u{1F4C9}"]:["watch","Mixed signals. Stay alert \u{1F440}"];return l`<div>
    ${t&&t.items&&t.items.length>0&&l`<div class=${`signal ${a[0]==="up"?"good":a[0]==="down"?"wait":"ok"}`} style="margin-bottom:12px">
      <b>${a[1]}</b>
      <div class="row" style="gap:6px;margin-top:8px"><span class="tag up">▲ ${n}</span><span class="tag down">▼ ${o}</span><span class="tag watch">● ${t.items.length-n-o}</span><span class="hint">last ${t.hours||48}h</span></div>
      <div class="note" style="margin-top:6px">Tags are automatic, based on keywords (rate cuts, war, dollar…). News moves gold, but nobody can predict it for sure.</div>
    </div>`}
    <div class="card" style="padding:6px 14px"><${Uo} news=${t} /></div>
    ${t&&t.updated&&l`<div class="hint" style="text-align:center">Updated ${zo(t.updated)} · Google News</div>`}
  </div>`}function Ys({onClose:t,price:e}){let n=I(),o=n.gold,[a,s]=f(o.below?String(o.below):""),[i,r]=f(null),c=()=>{L("gold",{below:Q(a)?D(a):null}),A("Alerts set. I'll ping you when it goes down \u{1F608}","\u{1F514}")},u=async()=>{r("\u2026");let h=await We();r(h),h==="ok"&&A("Notifications on \u{1F514}","\u2705")},d={"install-first":"On iPhone, first add the app to your Home Screen (Share \u2192 Add to Home Screen), then open it from there and tap this again.",unsupported:"This browser can't do background alerts.",denied:"Notifications were blocked. Allow them in Settings \u2192 Notifications.","relay-failed":"Saved on the phone but couldn't reach the alert server. I'll retry automatically.","\u2026":"Setting up\u2026"};return l`<${ot} title="🔔 Gold alerts" onClose=${t}>${h=>l`
    <${tt} title="Gold alerts" hint="Price drops & big moves"><${it} on=${o.alertsOn} onChange=${m=>L("gold",{alertsOn:m})} /><//>
    <${S} label="Ping me when price per gram falls below">
      <${F} value=${a} onInput=${s} placeholder=${e?(e*.98).toFixed(0):"480"} />
      ${e&&l`<div class="chips" style="margin-top:8px">${[1,2,3,5].map(m=>l`<button class="chip" onClick=${()=>s((e*(1-m/100)).toFixed(0))}>−${m}% (${(e*(1-m/100)).toFixed(0)})</button>`)}</div>`}
    <//>
    <${S} label="Also alert on a drop within 24h of"><div class="chips">${[1,1.5,2,3,5].map(m=>l`<button class=${`chip gold ${o.dropPct===m?"on":""}`} onClick=${()=>L("gold",{dropPct:m})}>${m}%</button>`)}<button class=${`chip ${o.dropPct?"":"on"}`} onClick=${()=>L("gold",{dropPct:null})}>Off</button></div><//>
    <${tt} title="News alerts" hint="Big headlines that could move gold"><${it} on=${o.newsOn} onChange=${m=>L("gold",{newsOn:m})} /><//>
    <${S} label="Gold goal (grams)"><${F} value=${o.goalGrams?String(o.goalGrams):""} onInput=${m=>L("gold",{goalGrams:D(m)||0})} placeholder="e.g. 10" /><//>
    <div class="card" style="margin-top:6px">
      <b>Alerts when the app is closed</b>
      <div class="note" style="margin:6px 0 10px">${Nt()?"The Android app checks gold in the background about every 15 minutes.":ge()?"On iPhone, an online helper checks gold about every 10 minutes and pings you.":"An online helper checks gold about every 10 minutes and pings you."}</div>
      <button class=${`btn block ${n.settings.alertsSetup?"":"primary"}`} onClick=${u}>${n.settings.alertsSetup?"\u2705 Notifications on. Tap to re-check":"\u{1F514} Turn on notifications"}</button>
      ${i&&i!=="ok"&&l`<div class="note warn" style="margin-top:8px">${d[i]||i}</div>`}
    </div>
    <button class="btn primary block" style="margin-top:8px" onClick=${()=>{c(),h()}}>Save</button>
  `}<//>`}function Xs({buy:t,price:e,onClose:n}){let o=I(),a=!!t.id,[s,i]=f(t.date||M()),[r,c]=f(t.g?String(t.g):""),[u,d]=f("pg"),[h,m]=f(t.paid?String(t.paid):""),[p,$]=f(t.market?String(t.market):e?e.toFixed(2):""),[v,k]=f(a&&(o.txns.find(B=>B.id===t.txn)||{}).from||null),[w,g]=f(t.note||"");R(()=>{if(a)return;if(s===M()){e&&$(e.toFixed(2));return}let B=j.data,O=null;for(let U of B)if(U[0]<=s)O=U;else break;O&&$(String(O[1]))},[s]);let y=D(r),C=u==="pg"?D(h):D(h)/y,P=Q(r)&&Number.isFinite(C)&&C>0,N=P&&Q(p)?(C-D(p))/D(p)*100:null,b=B=>{let O=+(y*C).toFixed(2),U=t.txn;U&&!v?(le(U),U=null):U&&v?Xt(U,{amt:O,from:v,date:s}):!U&&v&&(U=Tt({t:"gold",amt:O,from:v,date:s,note:`${T(y,2)} g gold`}).id),no({...a?{id:t.id}:{},date:s,g:y,paid:+C.toFixed(2),market:Q(p)?D(p):null,note:w,txn:U}),A(a?"Updated \u{1FA99}":`${T(y,2)} g of bling added. Shiny \u{1F60D}`,"\u{1FA99}"),B()};return l`<${ot} title=${a?"Edit gold buy":"\u{1FA99} "+_.boughtGold} onClose=${n}>${B=>l`
    <div class="row" style="gap:8px">
      <div style="flex:1"><${S} label="Grams"><${F} value=${r} onInput=${c} autofocus placeholder="1" /><//></div>
      <div style="flex:1"><${S} label="Date"><input class="input" type="date" value=${s} onInput=${O=>i(O.target.value||M())} /><//></div>
    </div>
    <${S} label="What you paid (bought at)">
      <div style="margin-bottom:8px"><${At} options=${[["pg","per gram"],["total","total"]]} value=${u} onChange=${d} /></div>
      <${F} value=${h} onInput=${m} placeholder=${u==="pg"?"544":"1072"} />
    <//>
    <${S} label="Market price per gram that day (actual price)"><${F} value=${p} onInput=${$} /><div class="hint" style="margin:4px">Filled in automatically (live today, NBP for past dates). Change it if your receipt says otherwise.</div><//>
    ${N!=null&&l`<div class="card" style="padding:12px"><div class="kv"><span>Total paid</span><span>${at(y*C)}</span><span>Premium over market</span><span class=${N>12?"down":N>8?"warn":"up"}>${T(N,1)}%</span></div></div>`}
    <${S} label="Paid from (optional, deducts from that account)"><div class="chips">
      ${o.accounts.map(O=>l`<button class=${`chip ${v===O.id?"on":""}`} onClick=${()=>k(O.id)}>${O.icon} ${O.name}</button>`)}
      ${o.card.on&&l`<button class=${`chip ${v==="card"?"on":""}`} onClick=${()=>k("card")}>💳 ${o.card.name}</button>`}
      <button class=${`chip ${v?"":"on"}`} onClick=${()=>k(null)}>Don't deduct</button>
    </div><//>
    <${S} label="Note"><input class="input" value=${w} onInput=${O=>g(O.target.value)} placeholder="shop, coin, bar…" /><//>
    <div class="btns">
      ${a&&l`<button class="btn danger" onClick=${()=>{confirm("Delete this purchase?")&&(t.txn&&le(t.txn),oo(t.id),B())}}>Delete</button>`}
      <button class="btn goldbtn grow" disabled=${!P} style=${{opacity:P?1:.4}} onClick=${()=>P&&b(B)}>Save</button>
    </div>
  `}<//>`}var je=()=>history.back(),Js=["\u{1F3E6}","\u{1F512}","\u{1F4B5}","\u{1F4B6}","\u{1FAAA}","\u{1F7E3}","\u{1F7E0}","\u{1F535}","\u{1F437}","\u{1F48E}","\u{1F9E7}","\u{1F3E7}"];function Ro(){let t=I(),n=Ut().price||zt(),o=He(t,n),a=[{label:"Cash & bank",v:Math.max(0,o.cash),color:"#38e8ff"},{label:"Gold",v:o.gold,color:"#ffc94d"},{label:"Owed to you",v:o.fOwedMe,color:"#ff7ab8"}].filter(s=>s.v>0);return l`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">${_.nWealth}</div><div class="hint">Everything you've got, all in one place</div></div></div>
    <div class="card neon hero">
      <div class="scan"></div>
      <div class="label">${_.netWorth} · ${_.netWorthHint}</div>
      <div class="big glow-pink"><${x} v=${o.total} /></div>
      <div class="row" style="margin-top:12px;gap:16px">
        <${ze} data=${a} size=${120} />
        <div class="legend grow">
          ${a.map(s=>l`<div class="li"><i class="sw" style=${{background:s.color}}></i><span class="grow">${s.label}</span><${x} v=${s.v} d=${0} /></div>`)}
          ${o.card>0&&l`<div class="li"><i class="sw" style="background:#ff4d6d"></i><span class="grow">Card debt</span><${x} v=${-o.card} d=${0} cls="down" /></div>`}
          ${o.fIOwe>0&&l`<div class="li"><i class="sw" style="background:#ff4d6d"></i><span class="grow">You owe friends</span><${x} v=${-o.fIOwe} d=${0} cls="down" /></div>`}
        </div>
      </div>
    </div>
    <div class="tiles">
      ${[["\u{1F4B0}",_.accounts,_.accountsHint,"accounts","#38e8ff",l`<${x} v=${o.cash} />`],["\u{1F4B3}",_.card,_.cardHint,"card","#a35cff",l`<${x} v=${-o.card} />`],["\u{1F91D}",_.friends,_.friendsHint,"friends","#ff7ab8",l`<${x} v=${o.fOwedMe-o.fIOwe} sign />`],["\u{1F3AF}",_.goals,_.goalsHint,"goals","#e0ff4d",`${t.goals.length} goal${t.goals.length===1?"":"s"}`],["\u{1FA99}",_.nGold,"Live value","gold","#ffc94d",l`<${x} v=${o.gold} />`],["\u{1F54B}",_.zakat,_.zakatHint,"zakat","#2bffa3","Calculate"]].map(([s,i,r,c,u,d])=>l`
        <button class="tile" style=${{"--accent":u}} onClick=${()=>St(c)}><div class="ic">${s}</div><div><div class="nm">${i}</div><div class="val">${d}</div><div class="hint">${r}</div></div></button>`)}
    </div>
  </div>`}function Wo(){let t=I(),[e,n]=f(null),o=t.accounts.reduce((a,s)=>a+Ft(t,wt(t,s.id),s.cur),0);return l`<div class="screen">
    <${Z} title=${_.accounts} hint="Bank accounts, savings & cash" onBack=${je} right=${l`<button class="iconbtn" onClick=${()=>n({})}>＋</button>`} />
    <div class="card neon hero"><div class="label">All together (in zł)</div><div class="big glow-pink"><${x} v=${o} /></div></div>
    <div class="card" style="padding:4px 12px">
      ${t.accounts.map(a=>{let s=wt(t,a.id);return l`<button class="item" onClick=${()=>n(a)}>
        <span class="em">${a.icon||"\u{1F3E6}"}</span>
        <div class="grow"><div class="t1">${a.name}</div><div class="t2">${ie[a.kind]} · ${a.cur}${a.cur!=="PLN"?` \xB7 \u2248 ${at(Ft(t,s,a.cur))}`:""}</div></div>
        <${x} v=${s} cur=${a.cur} cls=${`amt ${s<0?"down":""}`} />
      </button>`})}
    </div>
    <div class="note" style="padding:0 6px">Tap an account to fix its balance if it doesn't match your banking app. Balances move automatically when you log spending, income and moves.</div>
    <div class="btns" style="margin-top:12px"><button class="btn grow" onClick=${()=>pt.open({mode:"xfer"})}>🔀 Move money</button><button class="btn grow" onClick=${()=>n({})}>＋ Add account</button></div>
    ${e&&l`<${Vs} a=${e} onClose=${()=>n(null)} />`}
  </div>`}function Vs({a:t,onClose:e}){let n=I(),o=!t.id,[a,s]=f(t.name||""),[i,r]=f(t.icon||"\u{1F3E6}"),[c,u]=f(t.cur||"PLN"),[d,h]=f(t.kind||"bank"),m=o?0:wt(n,t.id),[p,$]=f(o?"":String(+m.toFixed(2))),v=!o&&n.txns.some(w=>w.from===t.id||w.to===t.id),k=w=>{let g=D(p)||0;if(o)G(y=>({...y,accounts:[...y.accounts,{id:_t(),name:a.trim()||"Account",icon:i,cur:c,kind:d,opening:g}]}));else{let y=(t.opening||0)+(g-m);G(C=>({...C,accounts:C.accounts.map(P=>P.id===t.id?{...P,name:a.trim()||P.name,icon:i,cur:c,kind:d,opening:y}:P)}))}A("Saved \u{1F48B}","\u2705"),w()};return l`<${ot} title=${o?"New account":"Edit account"} onClose=${e}>${w=>l`
    <${S} label="Name"><input class="input" value=${a} onInput=${g=>s(g.target.value)} placeholder="ING, Revolut, Wallet…" /><//>
    <${S} label="Icon"><div class="chips">${Js.map(g=>l`<button class=${`chip ${i===g?"on":""}`} onClick=${()=>r(g)}>${g}</button>`)}</div><//>
    <${S} label="Type"><div class="chips">${Object.entries(ie).map(([g,y])=>l`<button class=${`chip ${d===g?"on":""}`} onClick=${()=>h(g)}>${y}</button>`)}</div><//>
    <${S} label="Currency"><div class="chips">${["PLN","EUR","USD","AED","GBP"].map(g=>l`<button class=${`chip ${c===g?"on":""}`} onClick=${()=>u(g)}>${g}</button>`)}</div><//>
    <${S} label=${`Balance right now (${c})`}><${F} value=${p} onInput=${$} /><//>
    <div class="btns">
      ${!o&&l`<button class="btn danger" onClick=${()=>{v&&!confirm("This account has entries. Delete it anyway? Its entries stay in your history.")||!v&&!confirm("Delete this account?")||(de("accounts",t.id),w())}}>Delete</button>`}
      <button class="btn primary grow" onClick=${()=>k(w)}>Save</button>
    </div>
  `}<//>`}function jo(){let t=I(),[e,n]=f(!1),o=t.card,a=et(t),s=o.limit-a,i=o.limit?a/o.limit:0,r=oe(o.dueDay),c=nt(t,H()),u=t.txns.filter(d=>d.from===z||d.to===z).sort((d,h)=>(h.date+h.id).localeCompare(d.date+d.id)).slice(0,30);return l`<div class="screen">
    <${Z} title=${_.card} hint="Credit card: limit, debt & bill" onBack=${je} right=${l`<button class="iconbtn" onClick=${()=>n(!0)}>⚙️</button>`} />
    <div class="card neon hero" style="background:linear-gradient(135deg,rgba(163,92,255,.35),rgba(255,46,136,.25) 60%,rgba(255,255,255,.03))">
      <div class="row between"><span class="xxx">${o.name}</span><span style="font-size:26px">💳</span></div>
      <div class="label" style="margin-top:16px">Available to blow</div>
      <div class=${`big ${s<0?"down":"glow-pink"}`}><${x} v=${s} /></div>
      <div style="margin:10px 0 6px"><${gt} v=${i} cls=${i>=.8?"hot":""} /></div>
      <div class="row between sub"><span>Owed: <${x} v=${a} /></span><span>Limit: <${x} v=${o.limit} d=${0} /></span></div>
      ${i>=.8&&l`<div class="warn" style="margin-top:8px;font-weight:600">🥵 ${Math.round(i*100)}% used. Easy, tiger.</div>`}
    </div>
    ${!o.limit&&l`<div class="card tap" onClick=${()=>n(!0)}><b>Set your limit and bill day</b><div class="hint">So I can warn you before you max it out</div></div>`}
    <div class="stat3">
      <div><div class="l">This month</div><div class="v"><${x} v=${c.card} d=${0} /></div><div class="d">on card</div></div>
      <div><div class="l">Bill due</div><div class="v">${r?J(r):"\u2014"}</div><div class="d">${r?`in ${bt(M(),r)} days`:"set a day"}</div></div>
      <div><div class="l">Pay</div><div class="v"><${x} v=${Math.max(0,a)} d=${0} /></div><div class="d">full amount</div></div>
    </div>
    <button class="btn primary block" style="margin-top:12px" disabled=${a<=0} onClick=${()=>pt.open({mode:"xfer",preset:{to:z,amt:+a.toFixed(2)}})}>💦 Pay the bill (satisfy Plastic Daddy)</button>
    <div class="note" style="padding:8px 6px">Paying the bill moves money from your bank to the card. It isn't counted as spending again, because each purchase already was.</div>
    <div class="sect"><span class="h-title">Card activity</span></div>
    <div class="card" style="padding:4px 12px">${u.length?u.map(d=>l`<${qt} t=${d} s=${t} key=${d.id} />`):l`<${It} e="💳" text="Nothing on the card yet." />`}</div>
    ${e&&l`<${Ks} onClose=${()=>n(!1)} />`}
  </div>`}function Ks({onClose:t}){let e=I(),n=e.card,o=et(e),[a,s]=f(n.name),[i,r]=f(n.limit?String(n.limit):""),[c,u]=f(String(+o.toFixed(2))),[d,h]=f(n.dueDay?String(n.dueDay):"");return l`<${ot} title="💳 Card settings" onClose=${t}>${m=>l`
    <${tt} title="I have a credit card"><${it} on=${n.on} onChange=${p=>L("card",{on:p})} /><//>
    <${S} label="Card name"><input class="input" value=${a} onInput=${p=>s(p.target.value)} /><//>
    <${S} label="Credit limit (zł)"><${F} value=${i} onInput=${r} placeholder="5000" /><//>
    <${S} label="Amount owed right now (zł)"><${F} value=${c} onInput=${u} /><//>
    <${S} label="Bill payment day of month"><${F} value=${d} onInput=${h} placeholder="e.g. 25" /><//>
    <${tt} title="Bill reminders" hint="3 days before, 1 day before & on the day"><${it} on=${e.settings.cardRemind} onChange=${p=>L("settings",{cardRemind:p})} /><//>
    <button class="btn primary block" onClick=${()=>{let p=D(c)||0;L("card",{name:a.trim()||"Credit card",limit:D(i)||0,opening:(n.opening||0)+(p-o),dueDay:Math.min(31,Math.max(0,Math.round(D(d)||0)))}),A("Card saved \u{1F4B3}","\u2705"),m()}}>Save</button>
  `}<//>`}function Yo(){let t=I(),[e,n]=f(null),o=xt(t),a=[...o.values()].filter(r=>r>0).reduce((r,c)=>r+c,0),s=-[...o.values()].filter(r=>r<0).reduce((r,c)=>r+c,0),i=[...t.friends].sort((r,c)=>Math.abs(o.get(c.id)||0)-Math.abs(o.get(r.id)||0));return l`<div class="screen">
    <${Z} title=${_.friends} hint="Who owes who" onBack=${je} right=${l`<button class="iconbtn" onClick=${()=>pt.open({mode:"friend"})}>＋</button>`} />
    <div class="stat3" style="grid-template-columns:1fr 1fr;margin-bottom:12px">
      <div><div class="l">Owed to you</div><div class="v up" style="font-size:18px"><${x} v=${a} /></div></div>
      <div><div class="l">You owe</div><div class="v down" style="font-size:18px"><${x} v=${s} /></div></div>
    </div>
    <div class="card" style="padding:4px 12px">
      ${i.length?i.map(r=>{let c=o.get(r.id)||0;return l`<button class="item" onClick=${()=>n(r)}>
        <span class="em">${r.emoji||"\u{1F9D1}"}</span>
        <div class="grow"><div class="t1">${r.name}</div><div class="t2">${c>0?"owes you":c<0?"you owe them":"all square \u2728"}</div></div>
        <${x} v=${Math.abs(c)} cls=${`amt ${c>0?"up":c<0?"down":"dim"}`} />
      </button>`}):l`<${It} e="🤝" text="Nobody owes anybody. How wholesome." />`}
    </div>
    <div class="btns" style="margin-top:12px"><button class="btn grow" onClick=${()=>pt.open({mode:"friend"})}>🤝 Lend / borrow</button><button class="btn grow" onClick=${()=>pt.open({mode:"split"})}>🍕 Split a bill</button></div>
    ${e&&l`<${qs} f=${e} onClose=${()=>n(null)} />`}
  </div>`}function qs({f:t,onClose:e}){let n=I(),o=xt(n).get(t.id)||0,[a,s]=f(t.name),i=n.txns.filter(c=>c.friend===t.id).sort((c,u)=>(u.date+u.id).localeCompare(c.date+c.id)),r=i.length?bt(i[i.length-1].date,M()):0;return l`<${ot} title=${`${t.emoji||"\u{1F9D1}"} ${t.name}`} onClose=${e}>${c=>l`
    <div class="card neon" style="text-align:center">
      <div class="hint">${o>0?"Owes you":o<0?"You owe them":"All square"}</div>
      <div class=${`mono ${o>0?"up glow-up":o<0?"down glow-down":""}`} style="font-size:30px;font-weight:800"><${x} v=${Math.abs(o)} /></div>
      ${o!==0&&r>0&&l`<div class="hint">open for ${r} days</div>`}
    </div>
    <div class="btns" style="margin-bottom:12px">
      ${o>0&&l`<button class="btn primary grow" onClick=${()=>{c(),setTimeout(()=>pt.open({mode:"friend",preset:{kind:"repaid",friend:t.id,amt:+o.toFixed(2)}}),50)}}>They paid me back</button>`}
      ${o<0&&l`<button class="btn primary grow" onClick=${()=>{c(),setTimeout(()=>pt.open({mode:"friend",preset:{kind:"repay",friend:t.id,amt:+(-o).toFixed(2)}}),50)}}>I paid them back</button>`}
      <button class="btn grow" onClick=${()=>{c(),setTimeout(()=>pt.open({mode:"friend",preset:{friend:t.id}}),50)}}>＋ New favour</button>
    </div>
    <div class="card" style="padding:4px 12px">${i.length?i.map(u=>l`<${qt} t=${u} s=${n} key=${u.id} />`):l`<div class="empty">No history</div>`}</div>
    <${S} label="Name"><input class="input" value=${a} onInput=${u=>s(u.target.value)} onBlur=${()=>a.trim()&&G(u=>({...u,friends:u.friends.map(d=>d.id===t.id?{...d,name:a.trim()}:d)}))} /><//>
    <button class="btn danger block" onClick=${()=>{confirm(`Remove ${t.name} and all their entries?`)&&(G(u=>({...u,friends:u.friends.filter(d=>d.id!==t.id),txns:u.txns.filter(d=>d.friend!==t.id)})),c())}}>Remove person</button>
  `}<//>`}var Zs=["\u{1F3AF}","\u{1F4BB}","\u{1F4F1}","\u2708\uFE0F","\u{1F697}","\u{1F3E0}","\u{1F48D}","\u{1F54B}","\u{1F393}","\u{1FA99}","\u{1F45F}","\u{1F6E1}\uFE0F"];function Xo(){let t=I(),[e,n]=f(null),[o,a]=f(null);return l`<div class="screen">
    <${Z} title=${_.goals} hint="Savings goals" onBack=${je} right=${l`<button class="iconbtn" onClick=${()=>n({})}>＋</button>`} />
    ${t.goals.length?t.goals.map(s=>{let i=s.target?s.saved/s.target:0,r=s.target-s.saved,c=s.by?Math.max(1,Math.round(bt(M(),s.by)/30.4)):null;return l`<div class="card neon tap" onClick=${()=>a(s)}>
        <div class="row"><span style="font-size:30px">${s.emoji}</span>
          <div class="grow"><b>${s.name}</b><div class="hint">${s.by?`by ${J(s.by)}`:"no deadline"}${c&&r>0?` \xB7 ${at(r/c,"PLN",0)}/month needed`:""}</div></div>
          <button class="iconbtn" onClick=${u=>{u.stopPropagation(),n(s)}}>✏️</button></div>
        <div style="margin:12px 0 6px"><${gt} v=${i} cls=${i>=1?"ok":""} /></div>
        <div class="row between"><span><${x} v=${s.saved} d=${0} /> of <${x} v=${s.target} d=${0} /></span><b class=${i>=1?"up":"pink"}>${i>=1?"Done! \u{1F389}":Math.round(i*100)+"%"}</b></div>
      </div>`}):l`<${It} e="🎯" text="Saving it for something special? Add a goal." />`}
    <button class="btn primary block" onClick=${()=>n({})}>＋ New goal</button>
    ${e&&l`<${Qs} g=${e} onClose=${()=>n(null)} />`}
    ${o&&l`<${ta} g=${o} onClose=${()=>a(null)} />`}
  </div>`}function Qs({g:t,onClose:e}){let[n,o]=f(t.name||""),[a,s]=f(t.emoji||"\u{1F3AF}"),[i,r]=f(t.target?String(t.target):""),[c,u]=f(t.saved?String(t.saved):""),[d,h]=f(t.by||"");return l`<${ot} title=${t.id?"Edit goal":"New goal"} onClose=${e}>${m=>l`
    <${S} label="What for"><input class="input" value=${n} onInput=${p=>o(p.target.value)} placeholder="New laptop, Umrah, car…" /><//>
    <${S} label="Icon"><div class="chips">${Zs.map(p=>l`<button class=${`chip ${a===p?"on":""}`} onClick=${()=>s(p)}>${p}</button>`)}</div><//>
    <div class="row" style="gap:8px"><div class="grow"><${S} label="Target (zł)"><${F} value=${i} onInput=${r} /><//></div><div class="grow"><${S} label="Saved so far"><${F} value=${c} onInput=${u} /><//></div></div>
    <${S} label="Deadline (optional)"><input class="input" type="date" value=${d} onInput=${p=>h(p.target.value)} /><//>
    <div class="btns">
      ${t.id&&l`<button class="btn danger" onClick=${()=>{confirm("Delete goal?")&&(de("goals",t.id),m())}}>Delete</button>`}
      <button class="btn primary grow" disabled=${!n.trim()||!Q(i)} onClick=${()=>{ce("goals",{...t.id?{id:t.id}:{},name:n.trim(),emoji:a,target:D(i),saved:D(c)||0,by:d}),m()}}>Save</button>
    </div>
  `}<//>`}function ta({g:t,onClose:e}){let[n,o]=f("");return l`<${ot} title=${`${t.emoji} ${t.name}`} onClose=${e}>${a=>l`
    <div class="amount"><div class="cur">Put some in (or take out with −)</div><${F} cls="" value=${n} onInput=${o} autofocus /></div>
    <div class="note" style="margin-bottom:10px">This only tracks progress. To actually move money into savings, use "Move money".</div>
    <button class="btn primary block" disabled=${!Number.isFinite(D(n))} onClick=${()=>{ce("goals",{id:t.id,saved:Math.max(0,(t.saved||0)+D(n))}),A("Getting closer \u{1F60F}","\u{1F3AF}"),a()}}>Add to goal</button>
  `}<//>`}var Ye=()=>history.back();function Jo({s:t,ms:e,max:n=8}){let o=Object.entries(e.byCat).sort((i,r)=>r[1]-i[1]);if(!o.length)return l`<${It} text=${_.empty} />`;let a=o.slice(0,n).map(([i,r],c)=>({id:i,v:r,color:ue[c%ue.length]})),s=o.slice(n).reduce((i,r)=>i+r[1],0);return s&&a.push({id:"rest",v:s,color:"#555"}),l`<div class="row" style="gap:14px;align-items:center">
    <${ze} data=${a} size=${130} center=${["SPENT",t.settings.privacy?"\u2022\u2022\u2022\u2022":T(e.spend,0)]} />
    <div class="legend grow">${a.map(i=>l`<div class="li"><i class="sw" style=${{background:i.color}}></i><span class="grow" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.id==="rest"?"Other":`${V(t,i.id).icon} ${V(t,i.id).name}`}</span><span class="mono dim" style="font-size:12px">${Math.round(i.v/e.spend*100)}%</span></div>`)}</div>
  </div>`}function Vo(){let t=I(),e=nt(t,H()),n=Et(t),[o,a]=f(t.budget.monthly?String(t.budget.monthly):""),[s,i]=f(null),r=Object.entries(t.budget.cats).filter(([,c])=>c>0);return l`<div class="screen">
    <${Z} title=${_.budget} hint="Monthly limit & category limits" onBack=${Ye} />
    <div class="card neon">
      <${S} label="My monthly spending limit (zł)">
        <div class="row"><${F} value=${o} onInput=${a} placeholder="e.g. 4000" /><button class="btn primary" onClick=${()=>{L("budget",{monthly:D(o)||0}),A("Limit set. Behave \u{1F608}","\u26D3\uFE0F")}}>Set</button></div>
      <//>
      ${n&&l`<div class="kv" style="margin-top:6px">
        <span>Spent this month</span><${x} v=${e.spend} />
        <span>Left this month</span><${x} v=${n.monthLeft} cls=${n.monthLeft<0?"down":"up"} />
        <span>Daily allowance (${n.daysLeft} days left)</span><${x} v=${n.allowance} />
      </div>
      <div style="margin-top:10px"><${gt} v=${e.spend/n.budget} cls=${e.spend>n.budget?"hot":""} /></div>`}
      <div class="note" style="margin-top:8px">Your daily limit = money left this month ÷ days left. Spend less today and tomorrow's limit grows.</div>
    </div>
    <div class="sect"><span class="h-title">This month by category</span></div>
    <div class="card"><${Jo} s=${t} ms=${e} /></div>
    <div class="sect"><span class="h-title">Category limits 🔥</span><button class="more" onClick=${()=>i("pick")}>＋ Add limit</button></div>
    <div class="card" style="padding:6px 14px">
      ${r.length?r.map(([c,u])=>{let d=e.byCat[c]||0,h=d/u,m=V(t,c);return l`<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)" onClick=${()=>i(c)}>
          <div class="row between" style="margin-bottom:6px"><span>${m.icon} ${m.name}</span><span class="mono" style="font-size:13px"><span class=${h>=1?"down":h>=.8?"warn":""}>${t.settings.privacy?"\u2022\u2022":T(d,0)}</span> / ${t.settings.privacy?"\u2022\u2022":T(u,0)}</span></div>
          <${gt} v=${h} cls=${h>=1||h>=.8?"hot":"ok"} />
        </div>`}):l`<div class="empty" style="padding:16px">No limits yet. E.g. Dining out max 400 zł. I'll warn you at 80%.</div>`}
    </div>
    ${s&&l`<${ea} id=${s} onClose=${()=>i(null)} />`}
  </div>`}function ea({id:t,onClose:e}){let n=I(),[o,a]=f(t==="pick"?null:t),[s,i]=f(o&&n.budget.cats[o]?String(n.budget.cats[o]):"");return l`<${ot} title="Category limit" onClose=${e}>${r=>l`
    ${t==="pick"&&l`<div class="catgrid" style="margin-bottom:12px">${n.cats.exp.map(c=>l`<button class=${`cat ${o===c.id?"on":""}`} onClick=${()=>{a(c.id),i(n.budget.cats[c.id]?String(n.budget.cats[c.id]):"")}}><span class="e">${c.icon}</span>${c.name}</button>`)}</div>`}
    ${o&&l`<${S} label=${`${V(n,o).name}: max per month (z\u0142)`}><${F} value=${s} onInput=${i} autofocus /><//>`}
    <div class="btns">
      ${t!=="pick"&&l`<button class="btn danger" onClick=${()=>{let c={...n.budget.cats};delete c[o],L("budget",{cats:c}),r()}}>Remove</button>`}
      <button class="btn primary grow" disabled=${!o||!Q(s)} onClick=${()=>{L("budget",{cats:{...n.budget.cats,[o]:D(s)}}),r()}}>Save</button>
    </div>
  `}<//>`}function Ko(){let t=I(),[e,n]=f(null),o=Ue(t,35),a=t.recurring.filter(s=>!s.paused).reduce((s,i)=>s+i.amt,0);return l`<div class="screen">
    <${Z} title=${_.bills} hint="Rent, phone, subscriptions: added automatically" onBack=${Ye} right=${l`<button class="iconbtn" onClick=${()=>n({})}>＋</button>`} />
    <div class="card neon hero"><div class="label">Fixed costs every month</div><div class="big glow-pink"><${x} v=${a} /></div><div class="sub">${t.recurring.length} repeating bill${t.recurring.length===1?"":"s"}</div></div>
    <div class="sect"><span class="h-title">Coming up 📅</span></div>
    <div class="card" style="padding:4px 12px">
      ${o.length?o.map(s=>{let i=bt(M(),s.date);return l`<div class="item">
        <span class="em">${s.icon}</span>
        <div class="grow"><div class="t1">${s.name}</div><div class="t2">${J(s.date)} · ${i===0?"today":`in ${i} day${i===1?"":"s"}`}${s.kind==="card"?" \xB7 pay manually":" \xB7 auto-added"}</div></div>
        <${x} v=${s.amt} cur=${s.cur} cls=${`amt ${i<=3?"warn":""}`} />
      </div>`}):l`<div class="empty" style="padding:16px">Nothing due in the next 5 weeks</div>`}
    </div>
    <div class="sect"><span class="h-title">Your repeating bills</span></div>
    <div class="card" style="padding:4px 12px">
      ${t.recurring.length?t.recurring.map(s=>l`<button class="item" onClick=${()=>n(s)} style=${{opacity:s.paused?.5:1}}>
        <span class="em">${V(t,s.cat).icon}</span>
        <div class="grow"><div class="t1">${s.name}</div><div class="t2">every month on day ${s.day}${s.paused?" \xB7 paused":""}</div></div>
        <${x} v=${s.amt} cur=${W(t,s.from)} cls="amt" />
      </button>`):l`<${It} e="🔁" text="Add rent, phone, gym… they'll log themselves every month." />`}
    </div>
    ${e&&l`<${na} r=${e} onClose=${()=>n(null)} />`}
  </div>`}function na({r:t,onClose:e}){let n=I(),[o,a]=f(t.name||""),[s,i]=f(t.amt?String(t.amt):""),[r,c]=f(t.cat||"rent"),[u,d]=f(t.from||n.accounts[0]&&n.accounts[0].id),[h,m]=f(t.day?String(t.day):""),[p,$]=f(!!t.paused),v=Math.round(D(h)),k=o.trim()&&Q(s)&&v>=1&&v<=31;return l`<${ot} title=${t.id?"Edit bill":"New repeating bill"} onClose=${e}>${w=>l`
    <${S} label="Name"><input class="input" value=${o} onInput=${g=>a(g.target.value)} placeholder="Rent, Play, Netflix, Gym…" /><//>
    <div class="row" style="gap:8px"><div class="grow"><${S} label="Amount"><${F} value=${s} onInput=${i} /><//></div><div style="flex:0 0 40%"><${S} label="Day of month"><${F} value=${h} onInput=${m} placeholder="1–31" /><//></div></div>
    <${S} label="Category"><div class="chips">${n.cats.exp.map(g=>l`<button class=${`chip ${r===g.id?"on":""}`} onClick=${()=>c(g.id)}>${g.icon} ${g.name}</button>`)}</div><//>
    <${S} label="Paid with"><div class="chips">
      ${n.accounts.map(g=>l`<button class=${`chip ${u===g.id?"on":""}`} onClick=${()=>d(g.id)}>${g.icon} ${g.name}</button>`)}
      ${n.card.on&&l`<button class=${`chip ${u===z?"on":""}`} onClick=${()=>d(z)}>💳 ${n.card.name}</button>`}
    </div><//>
    ${t.id&&l`<${tt} title="Paused" hint="Stop adding it for now"><${it} on=${p} onChange=${$} /><//>`}
    <div class="btns">
      ${t.id&&l`<button class="btn danger" onClick=${()=>{confirm("Delete this bill? Past entries stay.")&&(de("recurring",t.id),w())}}>Delete</button>`}
      <button class="btn primary grow" disabled=${!k} onClick=${()=>{ce("recurring",{...t.id?{id:t.id}:{last:so(v)},name:o.trim(),amt:D(s),cat:r,from:u,day:v,paused:p}),A(t.id?"Bill updated":"Added. It'll log itself every month \u{1F501}","\u2705"),w()}}>Save</button>
    </div>
  `}<//>`}function qo(){let t=I(),e=[],n=H(),o=t.txns.reduce((i,r)=>yt(r.date)<i?yt(r.date):i,H());for(let i=0;i<24&&n>=o;i++)e.push(nt(t,n)),n=vt(n);let a=[...e].slice(0,12).reverse().map(i=>({a:i.income,b:i.spend,label:Yt(i.ym).slice(0,3)})),s=e.length?e.reduce((i,r)=>i+r.spend,0)/e.length:0;return l`<div class="screen">
    <${Z} title=${_.history} hint="Month by month" onBack=${Ye} />
    <div class="card"><${ro} rows=${a} /><div class="hint"><span class="up">■</span> income <span class="pink">■</span> spending · average spend <${x} v=${s} d=${0} />/month</div></div>
    <div class="card" style="padding:4px 12px">
      ${e.map(i=>l`<button class="item" onClick=${()=>{location.hash="#/summary/"+i.ym}}>
        <span class="em">📅</span>
        <div class="grow"><div class="t1">${Yt(i.ym,!0)}</div><div class="t2">in <${x} v=${i.income} d=${0} /> · out <${x} v=${i.spend} d=${0} />${i.saved?l` · saved <${x} v=${i.saved} d=${0} />`:""}</div></div>
        <${x} v=${i.net} sign d=${0} cls=${`amt ${i.net>=0?"up":"down"}`} />
      </button>`)}
    </div>
  </div>`}function Zo({ym:t}){let e=I(),[n,o]=f(t||H()),a=nt(e,n),s=nt(e,vt(n)),i=e.txns.filter(v=>v.t==="exp"&&yt(v.date)===n),r=i.reduce((v,k)=>!v||ht(e,k)>ht(e,v)?k:v,null),c=n===H()?Number(M().slice(8)):jt(n),u=new Set(i.map(v=>v.date)).size,d=Math.max(0,c-u),h=a.income?(a.income-a.spend)/a.income*100:null,m=Object.entries(a.byCat).sort((v,k)=>k[1]-v[1]).slice(0,3),p=Object.keys({...a.byCat,...s.byCat}).map(v=>({id:v,now:a.byCat[v]||0,before:s.byCat[v]||0})).filter(v=>v.before>0||v.now>0).map(v=>({...v,d:v.now-v.before})).sort((v,k)=>Math.abs(k.d)-Math.abs(v.d)).slice(0,5),$=a.spend?a.net>0&&h>20?"Disciplined AND rich. Very hot \u{1F525}":a.net>0?"You finished on top \u{1F60F}":"You went all the way and then some. Pull out next month \u{1F4A6}":"Nothing happened. Saving yourself? \u{1F607}";return l`<div class="screen">
    <${Z} title=${_.summary} hint="Month summary" onBack=${Ye} />
    <div class="row between" style="margin:0 2px 12px">
      <button class="iconbtn" onClick=${()=>o(vt(n))}>‹</button>
      <div class="h-big" style="font-size:16px">${Yt(n,!0)}</div>
      <button class="iconbtn" onClick=${()=>n<H()&&o(Dt(n))} style=${{opacity:n>=H()?.3:1}}>›</button>
    </div>
    <div class="card neon"><div class="h-big" style="font-size:17px;line-height:1.3">${$}</div></div>
    <div class="stat3">
      <div><div class="l">Blown</div><div class="v"><${x} v=${a.spend} d=${0} /></div><div class="d">${s.spend?Ct((a.spend-s.spend)/s.spend*100,0)+" vs last":""}</div></div>
      <div><div class="l">Came in</div><div class="v up"><${x} v=${a.income} d=${0} /></div></div>
      <div><div class="l">Saved</div><div class="v cyan"><${x} v=${a.saved} d=${0} /></div><div class="d">${h!=null?`${T(h,0)}% kept`:""}</div></div>
    </div>
    <div class="card" style="margin-top:12px"><div class="kv">
      <span>Daily average</span><${x} v=${a.spend/c} />
      <span>No-spend days 😇</span><span>${d} / ${c}</span>
      <span>Biggest splurge</span><span>${r?l`<${x} v=${ht(e,r)} /> <span class="hint">${V(e,r.cat).icon}</span>`:"\u2014"}</span>
      <span>On the card</span><${x} v=${a.card} />
    </div></div>
    ${m.length>0&&l`<div class="sect"><span class="h-title">Top 3 guilty pleasures</span></div>
    <div class="card">${m.map(([v,k],w)=>l`<div class="row" style="padding:6px 0"><span class="xxx" style="width:26px">${w+1}</span><span class="grow">${V(e,v).icon} ${V(e,v).name}</span><${x} v=${k} /></div>`)}</div>`}
    ${p.length>0&&s.spend>0&&l`<div class="sect"><span class="h-title">vs ${Yt(vt(n))}</span></div>
    <div class="card">${p.map(v=>l`<div class="row" style="padding:6px 0"><span class="grow">${V(e,v.id).icon} ${V(e,v.id).name}</span>
      <span class=${`mono ${v.d>0?"down":"up"}`} style="font-size:13px">${v.d>0?"\u25B2":"\u25BC"} ${e.settings.privacy?"\u2022\u2022":T(Math.abs(v.d),0)} zł${v.before?` (${Ct(v.d/v.before*100,0)})`:" (new)"}</span></div>`)}</div>`}
    <div class="sect"><span class="h-title">Breakdown</span></div>
    <div class="card"><${Jo} s=${e} ms=${a} /></div>
  </div>`}var Qo=new TextEncoder,oa=(()=>{let t=new Uint32Array(256);for(let e=0;e<256;e++){let n=e;for(let o=0;o<8;o++)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n>>>0}return t})(),sa=t=>{let e=4294967295;for(let n=0;n<t.length;n++)e=oa[(e^t[n])&255]^e>>>8;return(e^4294967295)>>>0};function aa(t){let e=[],n=[],o=0;for(let[u,d]of t){let h=Qo.encode(d),m=Qo.encode(u),p=sa(h),$=new DataView(new ArrayBuffer(30));$.setUint32(0,67324752,!0),$.setUint16(4,20,!0),$.setUint16(6,2048,!0),$.setUint16(8,0,!0),$.setUint32(14,p,!0),$.setUint32(18,h.length,!0),$.setUint32(22,h.length,!0),$.setUint16(26,m.length,!0),e.push(new Uint8Array($.buffer),m,h);let v=new DataView(new ArrayBuffer(46));v.setUint32(0,33639248,!0),v.setUint16(4,20,!0),v.setUint16(6,20,!0),v.setUint16(8,2048,!0),v.setUint32(16,p,!0),v.setUint32(20,h.length,!0),v.setUint32(24,h.length,!0),v.setUint16(28,m.length,!0),v.setUint32(42,o,!0),n.push(new Uint8Array(v.buffer),m),o+=30+m.length+h.length}let a=n.reduce((u,d)=>u+d.length,0),s=new DataView(new ArrayBuffer(22));s.setUint32(0,101010256,!0),s.setUint16(8,t.length,!0),s.setUint16(10,t.length,!0),s.setUint32(12,a,!0),s.setUint32(16,o,!0);let i=[...e,...n,new Uint8Array(s.buffer)],r=new Uint8Array(i.reduce((u,d)=>u+d.length,0)),c=0;for(let u of i)r.set(u,c),c+=u.length;return r}var ts=t=>String(t).replace(/[<>&"]/g,e=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"})[e]).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,""),ia=t=>{let e="";for(t++;t;){let n=(t-1)%26;e=String.fromCharCode(65+n)+e,t=Math.floor((t-1)/26)}return e};function ra(t){let e=t.map((o,a)=>`<row r="${a+1}">${o.map((s,i)=>{let r=ia(i)+(a+1);return s==null||s===""?"":typeof s=="number"&&Number.isFinite(s)?`<c r="${r}"${a===0?' s="1"':""}><v>${Math.round(s*100)/100}</v></c>`:`<c r="${r}" t="inlineStr"${a===0?' s="1"':""}><is><t xml:space="preserve">${ts(s)}</t></is></c>`}).join("")}</row>`).join("");return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${t[0]?`<cols>${t[0].map((o,a)=>`<col min="${a+1}" max="${a+1}" width="${a===0?14:18}" customWidth="1"/>`).join("")}</cols>`:""}<sheetData>${e}</sheetData></worksheet>`}function es(t){let e=t.map(o=>o.name.replace(/[\\/?*[\]:]/g,"").slice(0,31)),n=[["[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${e.map((o,a)=>`<Override PartName="/xl/worksheets/sheet${a+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`],["_rels/.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],["xl/workbook.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${e.map((o,a)=>`<sheet name="${ts(o)}" sheetId="${a+1}" r:id="rId${a+1}"/>`).join("")}</sheets></workbook>`],["xl/_rels/workbook.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${e.map((o,a)=>`<Relationship Id="rId${a+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${a+1}.xml"/>`).join("")}<Relationship Id="rId${e.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],["xl/styles.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>'],...t.map((o,a)=>[`xl/worksheets/sheet${a+1}.xml`,ra(o.rows)])];return aa(n)}var xe=()=>history.back();function ns(){let t=I(),n=Ut().price||zt(),[o,a]=f(null);R(()=>{_o().then(a)},[]);let s=t.zakat,i=pe(t),r=Ht(t,n).value,c=0,u=0;for(let g of xt(t).values())g>0?c+=g:u-=g;let d=t.card.on?Math.max(0,et(t)):0,h=i+r+(s.countOwed?c:0)-d-u,m=n*85,p=o?o*595:null,$=s.nisab==="silver"&&p?p:m,v=h>=$,k=v?h*.025:0,w=s.hawl?Pt(s.hawl,354):null;return l`<div class="screen">
    <${Z} title=${_.zakat} hint="2.5% on wealth held a lunar year above nisab" onBack=${xe} />
    <div class=${`card ${v?"neon":""} hero`} style="text-align:center">
      <div class="label">${v?"Zakat due":"Below nisab: no zakat due"}</div>
      <div class="big glow-pink" style="color:#2bffa3"><${x} v=${k} /></div>
      <div class="sub">on zakatable wealth of <${x} v=${h} d=${0} /></div>
    </div>
    <div class="card"><div class="kv">
      <span>Cash, bank & savings</span><${x} v=${i} />
      <span>Gold (${T(Ht(t,n).grams,2)} g at live price)</span><${x} v=${r} />
      <span>Owed to you</span><span class=${s.countOwed?"":"mute"}><${x} v=${c} /></span>
      <span>Minus card debt</span><${x} v=${-d} />
      <span>Minus what you owe</span><${x} v=${-u} />
    </div>
    <div class="sep"></div>
    <div class="kv">
      <span>Nisab: 85 g gold</span><${x} v=${m} d=${0} />
      <span>Nisab: 595 g silver</span><span>${p?l`<${x} v=${p} d=${0} />`:"\u2026"}</span>
    </div>
    <div style="margin-top:10px"><${gt} v=${h/$} cls=${v?"ok":""} /></div></div>
    <div class="card">
      <${S} label="Nisab standard"><${At} options=${[["gold","Gold (85 g)"],["silver","Silver (595 g)"]]} value=${s.nisab} onChange=${g=>L("zakat",{nisab:g})} /><//>
      <${tt} title="Count money friends owe me" hint="If you expect it back"><${it} on=${s.countOwed} onChange=${g=>L("zakat",{countOwed:g})} /><//>
      <${S} label="My zakat year started on"><input class="input" type="date" value=${s.hawl} onInput=${g=>L("zakat",{hawl:g.target.value})} /><//>
      ${w&&l`<div class="note">Next zakat date (1 lunar year ≈ 354 days): <b class="pink">${J(w)}</b>${bt(M(),w)>=0?` \xB7 in ${bt(M(),w)} days`:""}</div>`}
    </div>
    <div class="note" style="padding:0 6px">A helper, not a fatwa. Jewellery for personal use, business assets and debts have different rulings, so ask a scholar for your case.</div>
  </div>`}function os(){let t=I();R(()=>{Kt(!0)},[]);let e=["PLN","EUR","USD","AED","GBP"],[n,o]=f("100"),[a,s]=f("EUR"),i=D(n)||0,r=a==="PLN"?i:i*(t.rates[a]||0);return l`<div class="screen">
    <${Z} title=${_.convert} hint="Live currency converter" onBack=${xe} />
    <div class="card neon">
      <div class="amount"><div class="cur">${a}</div><${F} cls="" value=${n} onInput=${o} /></div>
      <div class="chips" style="justify-content:center">${e.map(c=>l`<button class=${`chip ${a===c?"on":""}`} onClick=${()=>s(c)}>${c}</button>`)}</div>
    </div>
    <div class="card" style="padding:4px 14px">
      ${e.filter(c=>c!==a).map(c=>{let u=c==="PLN"?r:r/(t.rates[c]||NaN);return l`<div class="item">
        <span class="em" style="font-family:Orbitron;font-size:11px">${c}</span>
        <div class="grow"><div class="t2">1 ${a} = ${T((a==="PLN"?1:t.rates[a])/(c==="PLN"?1:t.rates[c]),4)} ${c}</div></div>
        <span class="amt mono" style="font-size:18px">${Number.isFinite(u)?at(u,c):"\u2026"}</span>
      </div>`})}
    </div>
    <div class="hint" style="text-align:center">Rates: NBP (Polish central bank) + open.er-api · ${t.rates.at?new Date(t.rates.at).toLocaleString():"loading"}</div>
  </div>`}function ss(){let t=I(),e=M(),n=async()=>{await dn(`creampie-backup-${e}.json`,"application/json",new TextEncoder().encode(JSON.stringify(q(),null,1)))!=="cancelled"&&(L("settings",{lastBackup:e}),A("Backup saved. Protection is sexy \u{1F6E1}\uFE0F","\u2705"))},o=async()=>{let s=q(),i=$=>(s.friends.find(v=>v.id===$)||{}).name||"",r={exp:"Expense",inc:"Income",xfer:"Transfer",fout:"To friend",fin:"From friend",gold:"Gold purchase",adj:"Correction"},c=[...s.txns].sort(($,v)=>$.date.localeCompare(v.date)),u=[],d=H(),h=c.length?yt(c[0].date):d;for(;d>=h&&u.length<60;)u.push(nt(s,d)),d=vt(d);let m=es([{name:"Transactions",rows:[["Date","Type","Category","Amount","Currency","Amount (PLN)","From","To","Friend","Note"],...c.map($=>[$.date,r[$.t]||$.t,$.cat?V(s,$.cat).name:"",$.amt,W(s,$.from||$.to),ht(s,$),$.from?dt(s,$.from):"",$.to?dt(s,$.to):"",$.friend?i($.friend):"",$.note||""])]},{name:"Monthly",rows:[["Month","Income","Spending","Net","Saved","On card"],...u.map($=>[$.ym,$.income,$.spend,$.net,$.saved,$.card])]},{name:"Accounts",rows:[["Account","Type","Currency","Balance","Balance (PLN)"],...s.accounts.map($=>[$.name,ie[$.kind],$.cur,wt(s,$.id),Ft(s,wt(s,$.id),$.cur)]),[],["Credit card","Limit",s.card.limit,"Owed",et(s)]]},{name:"Gold",rows:[["Date","Grams","Bought at (z\u0142/g)","Market price (z\u0142/g)","Premium %","Total paid","Note"],...s.gold.buys.map($=>[$.date,$.g,$.paid,$.market||"",$.market?($.paid-$.market)/$.market*100:"",$.g*$.paid,$.note||""])]},{name:"Friends",rows:[["Person","Balance (+ owes me / \u2212 I owe)"],...s.friends.map($=>[$.name,xt(s).get($.id)||0])]},{name:"Bills",rows:[["Bill","Amount","Day","Paid with","Paused"],...s.recurring.map($=>[$.name,$.amt,$.day,dt(s,$.from),$.paused?"yes":""])]},{name:"Goals",rows:[["Goal","Target","Saved","Deadline"],...s.goals.map($=>[$.name,$.target,$.saved,$.by||""])]}]);await dn(`creampie-holdings-${e}.xlsx`,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",m)!=="cancelled"&&A("Excel exported \u{1F4CA}","\u2705")},a=s=>{let i=s.target.files&&s.target.files[0];i&&(i.text().then(r=>{try{let c=JSON.parse(r);if(!c||!Array.isArray(c.txns)||!Array.isArray(c.accounts))throw new Error("bad");if(!confirm(`Replace everything on this phone with the backup (${c.txns.length} entries)?`))return;to(c),A("Restored. Welcome back \u{1F618}","\u2705")}catch{A("That file isn't a Creampie backup \u{1F928}","\u26A0\uFE0F")}}),s.target.value="")};return l`<div class="screen">
    <${Z} title=${_.backup} hint="Backup, restore & Excel" onBack=${xe} />
    <div class="card neon">
      <b>Always use protection 🛡️</b>
      <div class="note" style="margin:6px 0 12px">Your data lives only on this phone. Save a backup now and then (to Google Drive, iCloud Files or email it to yourself). Use it to move to a new phone too.</div>
      <div class="hint" style="margin-bottom:10px">Last backup: ${t.settings.lastBackup?J(t.settings.lastBackup):"never \u{1F62C}"}</div>
      <button class="btn primary block" onClick=${n}>💾 Save backup file</button>
      <label class="btn block" style="margin-top:8px">📂 Restore from backup<input type="file" accept=".json,application/json" style="display:none" onChange=${a} /></label>
    </div>
    <div class="card">
      <b>Excel export 📊</b>
      <div class="note" style="margin:6px 0 12px">Everything in a spreadsheet: transactions, months, accounts, gold, friends, bills, goals.</div>
      <button class="btn block" onClick=${o}>Export to Excel (.xlsx)</button>
    </div>
  </div>`}function as(){let t=I(),[e,n]=f(!1),[o,a]=f(!1),[s,i]=f(null),r=t.settings;return l`<div class="screen">
    <${Z} title=${_.settings} hint="Settings" onBack=${xe} />
    <div class="card">
      <${tt} title=${`\u{1F648} ${_.discreet}`} hint=${_.discreetHint}><${it} on=${r.privacy} onChange=${c=>L("settings",{privacy:c})} /><//>
      <div class="sep"></div>
      <${tt} title=${`\u{1F51E} ${_.members}`} hint=${r.pin?"PIN lock is on":"Lock the app with a PIN"} onClick=${()=>n(!0)}><span class="pink">${r.pin?"Change":"Set up"} →</span><//>
    </div>
    <div class="card">
      <div class="h-title" style="margin-bottom:6px">Notifications</div>
      <${tt} title="🌙 9 pm reminder" hint="“Did you log today's sins?”"><${it} on=${r.remind9pm} onChange=${c=>L("settings",{remind9pm:c})} /><//>
      <${tt} title="💳 Card bill reminders"><${it} on=${r.cardRemind} onChange=${c=>L("settings",{cardRemind:c})} /><//>
      <${tt} title="🪙 Gold price & news alerts" hint="Set targets on the Gold screen"><${it} on=${t.gold.alertsOn} onChange=${c=>L("gold",{alertsOn:c})} /><//>
      <button class=${`btn block ${r.alertsSetup?"":"primary"}`} style="margin-top:8px" onClick=${async()=>{i("\u2026");let c=await We();i(c)}}>${r.alertsSetup?"\u2705 Notifications on. Re-check":"\u{1F514} Turn on notifications"}</button>
      ${s==="install-first"&&l`<div class="note warn" style="margin-top:8px">iPhone: tap Share ⬆️ → “Add to Home Screen”, open the app from your Home Screen, then tap this again.</div>`}
      ${s==="denied"&&l`<div class="note warn" style="margin-top:8px">Blocked. Allow notifications for this app in your phone's Settings.</div>`}
      ${s==="relay-failed"&&l`<div class="note warn" style="margin-top:8px">Couldn't reach the alert helper. Check internet and try again.</div>`}
    </div>
    <div class="card">
      <${tt} title="🏷️ Categories" hint="Add your own spending categories" onClick=${()=>a(!0)}><span class="pink">Edit →</span><//>
      <div class="sep"></div>
      <${tt} title="⚙️ Run setup again" hint="Balances, card, monthly limit" onClick=${()=>location.hash="#/setup"}><span class="pink">→</span><//>
      <div class="sep"></div>
      <${S} label="Gold sell-back discount (%)"><${F} value=${String(t.gold.sellSpread)} onInput=${c=>L("gold",{sellSpread:D(c)||0})} /><//>
    </div>
    ${ge()&&!wn()&&l`<div class="card neon"><b>📲 Install on iPhone</b><div class="note" style="margin-top:6px">In Safari tap Share ⬆️ → “Add to Home Screen”. It opens full-screen like a real app and can send you alerts.</div></div>`}
    <div class="card">
      <button class="btn danger block" onClick=${()=>{confirm("Delete ALL data on this phone? This cannot be undone. Save a backup first!")&&confirm("Really? Everything goes \u{1F480}")&&(eo(),A("Wiped clean \u{1F9FD}","\u{1F5D1}\uFE0F"),location.hash="#/home")}}>Delete all data</button>
    </div>
    <div class="hint" style="text-align:center;margin-top:10px"><span class="xxx">XXX</span><br/>${_.app} · v1.0<br/>Your data never leaves this phone (except encrypted alert settings).</div>
    ${e&&l`<${la} onClose=${()=>n(!1)} />`}
    ${o&&l`<${da} onClose=${()=>a(!1)} />`}
  </div>`}function la({onClose:t}){let e=I(),[n,o]=f(""),[a,s]=f(""),i=/^\d{4,6}$/.test(n)&&n===a;return l`<${ot} title=${`\u{1F51E} ${_.members}`} onClose=${t}>${r=>l`
    <div class="note" style="margin-bottom:12px">Choose a 4–6 digit PIN. You'll need it every time you open the app.${Nt()?" You can also use your fingerprint.":""} If you forget it, you'll have to reinstall and restore a backup.</div>
    <${S} label="New PIN"><input class="input mono" type="password" inputmode="numeric" maxlength="6" value=${n} onInput=${c=>o(c.target.value.replace(/\D/g,""))} /><//>
    <${S} label="Again"><input class="input mono" type="password" inputmode="numeric" maxlength="6" value=${a} onInput=${c=>s(c.target.value.replace(/\D/g,""))} /><//>
    <div class="btns">
      ${e.settings.pin&&l`<button class="btn danger" onClick=${()=>{L("settings",{pin:null}),A("PIN removed. Open to the public \u{1F633}","\u{1F513}"),r()}}>Remove PIN</button>`}
      <button class="btn primary grow" disabled=${!i} style=${{opacity:i?1:.4}} onClick=${async()=>{L("settings",{pin:await Le("cph:"+n)}),A("Locked down. Members only \u{1F51E}","\u{1F512}"),r()}}>Save PIN</button>
    </div>
  `}<//>`}var ca=["\u{1F354}","\u{1F355}","\u{1F959}","\u{1F6CD}\uFE0F","\u{1F3AE}","\u{1F3AC}","\u{1F37A}","\u{1F6AC}","\u{1F48A}","\u{1F436}","\u{1F476}","\u{1F3CB}\uFE0F","\u{1F4E6}","\u{1F9FE}","\u{1F484}","\u{1F389}","\u26FD","\u{1F17F}\uFE0F","\u{1F9FA}","\u{1F6E0}\uFE0F"];function da({onClose:t}){let e=I(),[n,o]=f(""),[a,s]=f("\u{1F6CD}\uFE0F"),i=new Set(e.txns.map(r=>r.cat));return l`<${ot} title="🏷️ Categories" onClose=${t}>${r=>l`
    <div class="chips" style="margin-bottom:14px">${e.cats.exp.map(c=>l`<button class="chip" onClick=${()=>{if(i.has(c.id))return A("Used by entries, so it can't be removed","\u26A0\uFE0F");confirm(`Remove \u201C${c.name}\u201D?`)&&G(u=>({...u,cats:{...u.cats,exp:u.cats.exp.filter(d=>d.id!==c.id)}}))}}>${c.icon} ${c.name} ✕</button>`)}</div>
    <${S} label="New category"><input class="input" value=${n} onInput=${c=>o(c.target.value)} placeholder="e.g. Shisha, Gaming, Pets" /><//>
    <div class="chips" style="margin-bottom:12px">${ca.map(c=>l`<button class=${`chip ${a===c?"on":""}`} onClick=${()=>s(c)}>${c}</button>`)}</div>
    <button class="btn primary block" disabled=${!n.trim()} onClick=${()=>{G(c=>({...c,cats:{...c.cats,exp:[...c.cats.exp,{id:"c_"+_t(),name:n.trim(),icon:a,group:"Custom"}]}})),o(""),A("Category added","\u{1F3F7}\uFE0F")}}>Add category</button>
  `}<//>`}function is(){let t=I(),[e,n]=f(0),[o,a]=f(()=>Object.fromEntries(t.accounts.map(y=>[y.id,wt(t,y.id)?String(+wt(t,y.id).toFixed(2)):""]))),[s,i]=f(()=>Object.fromEntries(t.accounts.map(y=>[y.id,y.name]))),[r,c]=f(t.card.on),[u,d]=f(t.card.limit?String(t.card.limit):""),[h,m]=f(et(t)?String(+et(t).toFixed(2)):""),[p,$]=f(t.card.dueDay?String(t.card.dueDay):""),[v,k]=f(t.budget.monthly?String(t.budget.monthly):""),w=()=>{G(y=>{let C=y.accounts.map(b=>{let B=D(o[b.id])||0,O=wt(y,b.id);return{...b,name:(s[b.id]||b.name).trim()||b.name,opening:(b.opening||0)+(B-O)}}),P=et(y),N={...y.card,on:r,limit:D(u)||0,opening:(y.card.opening||0)+((D(h)||0)-P),dueDay:Math.min(31,Math.round(D(p)||0))};return{...y,accounts:C,card:N,budget:{...y.budget,monthly:D(v)||0},settings:{...y.settings,onboarded:!0}}}),A("All set. Now let's get dirty \u{1F608}","\u{1F51E}"),location.hash="#/home"},g=[l`<div>
      <div class="h-big" style="margin-bottom:6px">Your money, right now 💰</div>
      <div class="note" style="margin-bottom:14px">Rename these to your real accounts (ING, Revolut…) and type what's in each today. You can add more later.</div>
      ${t.accounts.map(y=>l`<div class="card" style="padding:12px">
        <div class="row" style="gap:8px"><span style="font-size:22px">${y.icon}</span><input class="input" style="flex:1" value=${s[y.id]} onInput=${C=>i({...s,[y.id]:C.target.value})} /></div>
        <div style="margin-top:8px"><${F} value=${o[y.id]} onInput=${C=>a({...o,[y.id]:C})} placeholder=${`Balance in ${y.cur}`} /></div>
      </div>`)}
    </div>`,l`<div>
      <div class="h-big" style="margin-bottom:6px">Plastic Daddy 💳</div>
      <${tt} title="I have a credit card"><${it} on=${r} onChange=${c} /><//>
      ${r&&l`
        <${S} label="Credit limit (zł)"><${F} value=${u} onInput=${d} placeholder="5000" /><//>
        <${S} label="How much you owe on it now (zł)"><${F} value=${h} onInput=${m} placeholder="0" /><//>
        <${S} label="Bill payment day of the month"><${F} value=${p} onInput=${$} placeholder="e.g. 25" /><//>`}
    </div>`,l`<div>
      <div class="h-big" style="margin-bottom:6px">Your safe word ⛓️</div>
      <div class="note" style="margin-bottom:14px">How much do you want to spend per month max (excluding savings)? I'll turn it into a daily limit. Leave empty to skip.</div>
      <${S} label="Monthly limit (zł)"><${F} value=${v} onInput=${k} placeholder="e.g. 4000" /><//>
    </div>`];return l`<div class="screen">
    <${Z} title="Setup" hint=${`Step ${e+1} of ${g.length}`} onBack=${()=>e?n(e-1):xe()} />
    <div class="row" style="gap:6px;margin-bottom:16px">${g.map((y,C)=>l`<div class="grow" style=${{height:"4px",borderRadius:"4px",background:C<=e?"var(--pink)":"rgba(255,255,255,.1)",boxShadow:C<=e?"0 0 10px var(--pink)":"none"}}></div>`)}</div>
    ${g[e]}
    <button class="btn primary block" style="margin-top:12px" onClick=${()=>e<g.length-1?n(e+1):w()}>${e<g.length-1?"Next \u2192":"Finish \u{1F608}"}</button>
  </div>`}var rs=["home","activity","gold","wealth"],xn=()=>{let t=(location.hash.replace(/^#\/?/,"")||"home").split("/");return{name:t[0],arg:t[1]}};function pa(){let[t,e]=f(xn());return R(()=>{let n=()=>{e(xn()),window.scrollTo(0,0)};return window.addEventListener("hashchange",n),()=>window.removeEventListener("hashchange",n)},[]),t}function ua({onOpen:t}){let e=I(),[n,o]=f(""),[a,s]=f(!1),i=async c=>{c.length<4||(await Le("cph:"+c)===e.settings.pin?(Mt(20),t()):c.length>=6&&(s(!0),Mt(200),setTimeout(()=>{s(!1),o("")},450)))},r=c=>{Mt(8);let u=c==="\u232B"?n.slice(0,-1):(n+c).slice(0,6);o(u),i(u)};return R(()=>{Nt()&&window.CPNative.canBiometric&&window.CPNative.canBiometric()&&(window.cpBio=c=>c&&t(),setTimeout(()=>window.CPNative.biometric(),300))},[]),l`<div class="lock">
    <img class="logo" src="icons/icon-192.png" alt="" />
    <div class="xxx" style="font-size:18px">${_.members}</div>
    <div class="dim">${a?_.pinWrong:_.pinAsk}</div>
    <div class=${`dots ${a?"shake":""}`}>${[0,1,2,3,4,5].map(c=>l`<i class=${c<n.length?"on":""} style=${{opacity:c<4||c<n.length?1:.3}}></i>`)}</div>
    <div class="pad">
      ${["1","2","3","4","5","6","7","8","9"].map(c=>l`<button onClick=${()=>r(c)}>${c}</button>`)}
      ${Nt()&&window.CPNative.canBiometric&&window.CPNative.canBiometric()?l`<button class="k" onClick=${()=>window.CPNative.biometric()}>👆</button>`:l`<span></span>`}
      <button onClick=${()=>r("0")}>0</button>
      <button class="k" onClick=${()=>r("\u232B")}>⌫</button>
    </div>
  </div>`}function ma({tab:t,onAdd:e}){let n=a=>{Mt(6),xn().name!==a&&location.replace("#/"+a)},o=(a,s,i)=>l`<button class=${t===a?"on":""} onClick=${()=>n(a)}><span class="i">${s}</span>${i}</button>`;return l`<nav class="dock">
    ${o("home","\u{1F48B}",_.nHome)}
    ${o("activity","\u{1F9FE}","Laundry")}
    <button class="plus" onClick=${e} aria-label="Add">＋</button>
    ${o("gold","\u{1FA99}","Gold")}
    ${o("wealth","\u{1F451}","Stash")}
  </nav>`}function $a(){let t=I(),e=pa(),[n,o]=f(!!t.settings.pin),[a,s]=f(null);if(pt.open=d=>s(d||{}),R(()=>{mn(),Kt().then(()=>gn()),yn().catch(()=>{}),ye();let d=p=>{A(p.text,p.kind==="below"?"\u{1F4C9}":"\u{1F525}",6e3),Po("\u{1FA99} Gold went down on you",p.text)};ve.add(d);let h=0,m=()=>{document.visibilityState==="hidden"?h=Date.now():(mn(),ye(),q().settings.pin&&h&&Date.now()-h>6e4&&o(!0))};return document.addEventListener("visibilitychange",m),window.cpOpen=p=>{p==="add"?s({mode:"exp"}):location.hash="#/"+p},location.hash==="#/add"&&(history.replaceState(null,"","#/home"),s({mode:"exp"})),()=>{ve.delete(d),document.removeEventListener("visibilitychange",m)}},[]),n&&t.settings.pin)return l`<${ua} onOpen=${()=>o(!1)} />`;let i=rs.includes(e.name)?e.name:null,r=(d="exp")=>s({mode:d}),c={home:()=>l`<${Ao} openAdd=${r} />`,activity:()=>l`<${To} />`,gold:()=>l`<${Ho} />`,wealth:()=>l`<${Ro} />`,news:()=>l`<div class="screen"><${Z} title=${_.news} hint="Gold news & what it might mean" onBack=${()=>history.back()} /><${Go} /></div>`,accounts:()=>l`<${Wo} />`,card:()=>l`<${jo} />`,friends:()=>l`<${Yo} />`,goals:()=>l`<${Xo} />`,budget:()=>l`<${Vo} />`,bills:()=>l`<${Ko} />`,history:()=>l`<${qo} />`,summary:()=>l`<${Zo} ym=${e.arg} key=${e.arg} />`,zakat:()=>l`<${ns} />`,convert:()=>l`<${os} />`,backup:()=>l`<${ss} />`,settings:()=>l`<${as} />`,setup:()=>l`<${is} />`},u=c[e.name]||c.home;return l`<div>
    <div key=${e.name}>${u()}</div>
    <${ma} tab=${i||(rs.includes(e.name)?e.name:"")} onAdd=${()=>{Mt(15),r("exp")}} />
    ${a&&l`<${Bo} ...${a} onClose=${()=>s(null)} />`}
    <${ao} />
  </div>`}Fn(l`<${$a} />`,document.getElementById("app"));"serviceWorker"in navigator&&location.protocol==="https:"&&navigator.serviceWorker.register("sw.js").catch(()=>{});
