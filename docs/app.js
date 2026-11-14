var z,Tn,mo,Bt,qe,Ie,Mn,Te,An,Qe,Ze,$o,oe=Symbol.for("pv"),Oe={},Be=[],vo=/^m(i|n|o|s|text|space)$/,tn=Array.isArray,en=Be.slice,Wt=Object.assign;function jt(t){t&&t.parentNode&&t.remove()}function In(t,e,n){var s,a,o,i={},r=arguments.length;for(o in e)o=="key"?s=e[o]:o=="ref"&&typeof t!="function"?a=e[o]:i[o]=e[o];return r>2&&(i.children=r>3?en.call(arguments,2):n),se(t,i,s,a,null)}function se(t,e,n,s,a){var o={type:t,props:e,key:n,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:oe,__v:a||++Tn,__i:-1,__u:0};return!a&&z.vnode&&z.vnode(o),o}function Le(t){return t.children}function Me(t,e){this.props=t,this.context=e,this.__g=0}function Lt(t,e){if(e==null)return t.__&&Lt(t.__,t.__i+1);for(var n;e<t.__k.length;e++)if((n=t.__k[e])&&n.__e)return n.__e;return typeof t.type!="function"||t.props.__P?null:Lt(t)}function ho(t){var e,n=t.__v,s=n.__e,a=[],o=[],i=t.__P;i&&((e=Wt({constructor:oe},n)).__v=n.__v+1,z.vnode&&z.vnode(e),nn(i,e,n,t.__n,i.namespaceURI,32&n.__u?[s]:null,a,s||Lt(n),32&n.__u,o),e.__v=n.__v,e.__.__k[e.__i]=e,Hn(a,e,o),n.__=n.__e=null,e.__e!=s&&On(e))}function On(t){if((t=t.__)&&t.__c&&!t.props.__P)return t.__e=null,t.__k.some(function(e){return e&&(t.__e=e.__e)}),On(t)}function Pn(t){(8&t.__g||(t.__g|=8,Bt.push(t),Ie++))&&qe==z.debounceRendering||((qe=z.debounceRendering)||queueMicrotask)(Bn)}function Bn(){try{for(var t,e=1;Bt.length;)Bt.length>e&&Bt.sort(Mn),t=Bt.shift(),e=Bt.length,8&t.__g&&ho(t)}finally{(Ie=Bt.length)&&(qe||queueMicrotask)(Bn)}}function Ln(t,e,n,s,a,o,i,r,c,u,d){var f,m,p,$,v,k,w=s.__k||Be,g=e.length;for(c=fo(n,e,w,c,g),f=0;f<g;f++)(p=n.__k[f])!=null&&(m=~p.__i&&w[p.__i]||Oe,p.__i=f,k=nn(t,p,m,a,o,i,r,c,u,d),$=p.__e,(m.ref!=p.ref||8&m.__u)&&(m.ref&&sn(m.ref,null,p,m),p.ref&&d.push(p.ref,p.__c||$,p)),v=v||$,4&p.__u?(c=En(p,c,t,!m.__v),m.__e&&(m.__e=null)):typeof p.type=="function"&&k!==void 0?c=k:$&&(c=$.nextSibling),p.__u&=-21);return n.__e=v,c}function fo(t,e,n,s,a){var o,i,r,c,u,d,f,m,p,$=n.length,v=$,k=0,w=0,g=t.__k=Array(a);for(o=0;o<a;o++)(i=e[o])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i!="object"||i.constructor===String?i=g[o]=se(null,i):tn(i)?i=g[o]=se(Le,{children:i}):i.constructor===oe&&i.__b?i=g[o]=se(i.type,i.props,i.key,i.ref,i.__v):g[o]=i,c=o+k,i.__=t,i.__b=t.__b+1,r=null,~(u=i.__i=go(i,n,c,v))&&(v--,(r=n[u])&&(r.__u|=2)),r&&r.__v?(i.__u|=16,u==c-1?k--:u==c+1?k++:u!=c&&(u>c?k--:k++,w=1)):(~u||(a>$?k--:a<$&&k++),typeof i.type!="function"&&(i.__u|=4))):g[o]=null;if(w){for(d=[],f=[],o=0;o<a;o++)if((i=g[o])&&16&i.__u){for(k=0,m=d.length;k<m;)d[p=k+m>>1]<i.__i?k=p+1:m=p;d[k]=i.__i,f[o]=k+1}for(k=d.length;o--;)f[o]&&(f[o]==k?k--:g[o].__u|=4)}if(v)for(o=0;o<$;o++)!(r=n[o])||2&r.__u||(r.__e==s&&(s=Lt(r)),on(r,r));return s}function En(t,e,n,s){var a,o,i,r;if(typeof t.type=="function"){if(t.props.__P)return e;if(a=t.__k)for(o=0;o<a.length;o++)a[o]&&(a[o].__=t,e=En(a[o],e,n,!1));return e}for(e&&!e.parentNode&&(e=Lt(t))&&!e.parentNode&&(e=null),i=t.__e,r=e;r&&r.nodeType==8;)r=r.nextSibling;for(i!=r&&(!s&&n.moveBefore&&i.parentNode?n.moveBefore(i,e):n.insertBefore(i,e||null)),e=i;(e=e&&e.nextSibling)&&e.nodeType==8&&!e.data.startsWith("$s"););return e}function go(t,e,n,s){var a,o=t.key,i=t.type,r=e[n],c=r&&!(2&r.__u);if(r===null&&o==null||c&&o==r.key&&i==r.type)return n;if(s>(c?1:0)){for(a=n-1;a>=0;a--)if((r=e[a])&&!(2&r.__u)&&o==r.key&&i==r.type)return a;for(a=n+1;a<e.length;a++)if((r=e[a])&&!(2&r.__u)&&o==r.key&&i==r.type)return a}return-1}function Dn(t,e,n){n==null&&(n=""),e[0]=="-"?t.setProperty(e,n):t[e]=n}function De(t,e,n,s,a){var o,i;if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof s=="string"&&(t.style.cssText=s=""),s)for(e in s)n&&e in n||Dn(t.style,e);if(n)for(e in n)s&&n[e]==s[e]||Dn(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")typeof n!="function"&&(n=null),typeof s!="function"&&(s=null),(t.__e||(t.__e={}))[e]=n,n&&s||(i=Ze[e]||(Ze[e]=yo(e)),(t.__a||(t.__a={}))[e]=Qe,o=e!=(e=e.replace(An,"$1")),(e=e.slice(2))[0]<"a"&&(e=e.toLowerCase()),n?t.addEventListener(e,i,o):t.removeEventListener(e,i,o));else{if(a=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{return void(t[e]=n??"")}catch{}if(typeof n=="function")return;n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n)}}function yo(t){return function(e){var n=this.__e;if(n){if(n=n[t],e[Te]==null)e[Te]=Qe++;else if(e[Te]<this.__a[t])return;return n(z.event?z.event(e):e)}}}function nn(t,e,n,s,a,o,i,r,c,u){var d,f,m,p,$,v,k,w,g,b,S,P,N,y,M,I,F,ot,at=e.type;if(e.constructor!==oe)return null;128&n.__u&&(c=32&n.__u,d=n.__c.__z)&&(e.__u|=c,f=o=[],d.nodeType==8?r=Ae(d,o):o.push(d),r=o[0]||r),(d=z.__b)&&d(e);t:if(typeof at=="function"){m=i.length;try{if(w=e.props,g=(d=at.prototype)&&d.render,b=(d=at.contextType)&&s[d.__c],S=d?b?b.props.value:d.__:s,(p=n.__c)?(e.__c=p,2&p.__g&&(p.__g|=1)):(g?e.__c=p=new at(w,S):(e.__c=p=new Me(w,S),p.constructor=at,p.render=xo),b&&b.sub(p),p.state||(p.state={}),p.__n=s,p.__g|=8,p.__h=[],p.__k=[]),g&&(p.__s||(p.__s=p.state),at.getDerivedStateFromProps&&(p.__s==p.state&&(p.__s=Wt({},p.__s)),Wt(p.__s,at.getDerivedStateFromProps(w,p.__s)))),$=p.props,v=p.state,p.__v=e,n.__c){if(w!==$&&g&&!at.getDerivedStateFromProps&&p.componentWillReceiveProps&&p.componentWillReceiveProps(w,S),e.__v==n.__v&&!(8&p.__g)||!(4&p.__g)&&p.shouldComponentUpdate&&p.shouldComponentUpdate(w,p.__s,S)===!1){e.__v!=n.__v&&(p.props=w,p.state=p.__s,p.__g&=-9),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(it){it&&(it.__=e)}),Be.push.apply(p.__h,p.__k),p.__k=[],p.__h.length&&i.push(p),r=Lt(n);break t}p.componentWillUpdate&&p.componentWillUpdate(w,p.__s,S),g&&p.componentDidUpdate&&p.__h.push(function(){p.componentDidUpdate($,v,k)})}else g&&!at.getDerivedStateFromProps&&p.componentWillMount&&p.componentWillMount(),g&&p.componentDidMount&&p.__h.push(p.componentDidMount);p.context=S,p.props=w,p.__P=t,p.__g&=-5,P=z.__r,N=g?25:0;do p.__g&=-9,P&&P(e),d=p.render(p.props,p.state=p.__s,p.context);while(8&p.__g&&++N<25);g&&(Be.push.apply(p.__h,p.__k),p.__k=[]),p.state=p.__s,p.getChildContext&&(s=Wt({},s,p.getChildContext())),g&&n.__c&&p.getSnapshotBeforeUpdate&&(k=p.getSnapshotBeforeUpdate($,v)),y=d&&d.type===Le&&d.key==null?d.props.children:d,w.__P&&(d=r,a=(t=w.__P).namespaceURI,c=o=null,n.props&&n.props.__P!=t&&(n.__k.some(function(it){it&&on(it,it)}),n.__k=null),r=n.__k?Lt(n,0):null),r=Ln(t,tn(y)?y:[y],e,n,s,a,o,i,r,c,u),w.__P&&(e.__e=null,r=d),e.__u&=-161,f&&f.some(jt),p.__h.length&&i.push(p),1&p.__g&&(p.__g&=-4)}catch(it){if(i.length=m,e.__v=null,c||o)if(it&&it.then){if(e.__u|=128|c,o){for(~(F=o.indexOf(r||void 0))||(F=o.length);(ot=o[F-1])&&ot.nodeType==8;)F--;for(;F<o.length;F++)if(ot=o[F])if(o[F]=null,M){if(ot==I)break}else{if(ot.nodeType!=8)break;ot.data.startsWith("$s")&&(I=Ae(M=ot))}}if(!M){for(;r&&r.nodeType==8&&r.nextSibling;)r=r.nextSibling;M=r}(d=Ae(M=e.__c.__z||(e.__c.__z=M)))?(e.__e=M,r=d):e.__e=r,r=r&&r.nextSibling}else o&&o.some(jt);else e.__e=n.__e;e.__k||(e.__k=n.__k||[]),it&&it.then||Fn(e),z.__e(it,e,n)}}else r=e.__e=bo(n.__e,e,n,s,a,o,i,c,u,t);return(d=z.diffed)&&d(e),r}function Ae(t,e){if(t&&t.nodeType==8&&t.data.startsWith("$s"))for(var n=1;t=t.nextSibling;){if(t.nodeType==8){if(t.data.startsWith("$s"))n++;else if(t.data.startsWith("/$s")&&!--n)return t}e&&e.push(t)}}function Fn(t){t&&(t.__c&&(t.__c.__g|=4),t.__k&&t.__k.some(Fn))}function Hn(t,e,n){for(var s=0;s<n.length;)sn(n[s++],n[s++],n[s++]);z.__c&&z.__c(e,t),t.some(function(a){try{t=a.__h,a.__h=[],t.some(function(o){o.call(a)})}catch(o){z.__e(o,a.__v)}})}function bo(t,e,n,s,a,o,i,r,c,u){var d,f,m,p,$,v,k,w,g=n.props||Oe,b=e.props,S=e.type;if(S=="svg"?a="http://www.w3.org/2000/svg":S=="math"?a="http://www.w3.org/1998/Math/MathML":a||(a="http://www.w3.org/1999/xhtml"),o){for(d=0;d<o.length;d++)if(($=o[d])&&(S?$.localName==S:$.nodeType==3)){t=$,o[d]=null;break}}if(!t){if(w=u.ownerDocument||document,!S)return w.createTextNode(b);t=w.createElementNS(a,S,b.is?b:u),r&&(z.__m&&z.__m(e,o),r=!1),o=null}if(S){if(u=S=="template"&&t.content||t,o=S=="textarea"&&b.defaultValue!=null?null:o&&en.call(u.childNodes),!r&&o)for(g={},d=0;d<t.attributes.length;d++)g[($=t.attributes[d]).name]=$.value;for(d in g)$=g[d],d=="dangerouslySetInnerHTML"?m=$:d=="children"||d in b||d=="value"&&"defaultValue"in b||d=="checked"&&"defaultChecked"in b||De(t,d,null,$,a);for(d in b)$=b[d],d=="children"?p=$:d=="dangerouslySetInnerHTML"?f=$:d=="value"?v=$:d=="checked"?k=$:r&&typeof $!="function"||g[d]===$||De(t,d,$,g[d],a);f?(r||m&&(f.__html==m.__html||f.__html==t.innerHTML)||(t.innerHTML=f.__html),e.__k=[]):(m&&(t.textContent=""),(S=="foreignObject"||a=="http://www.w3.org/1998/Math/MathML"&&vo.test(S))&&(a="http://www.w3.org/1999/xhtml"),Ln(u,tn(p)?p:[p],e,n,s,a,o,i,o?o[0]:n.__k&&Lt(n,0),r,c),o&&o.some(jt)),r&&S!="textarea"||(d="value",S=="progress"&&v==null?t.removeAttribute(d):v==null||v===t[d]&&(S!="progress"||v)||De(t,d,v,g[d],a),d="checked",k!=null&&k!=t[d]&&De(t,d,k,g[d],a))}else g===b||r&&t.data==b||(t.data=b);return t}function sn(t,e,n,s){try{typeof t=="function"?e?e.__x=t(e)||1:s&&(s=s.__c||s.__e)&&(e=s.__x)&&(s.__x=null,typeof e=="function"?e():t(null)):t.current=e}catch(a){z.__e(a,n)}}function on(t,e,n){var s,a,o,i;if(z.unmount&&z.unmount(t),!(s=t.ref)||s.current&&s.current!=t.__e||sn(s,null,e,t),s=t.__c){if(s.componentWillUnmount)try{s.componentWillUnmount()}catch(r){z.__e(r,e)}s.__P=s.__n=null}if(s=t.__k)for(i=0;i<s.length;i++)s[i]&&on(s[i],e,typeof t.type!="function"||n&&!t.props.__P);!n&&(s=t.__c)&&(s=s.__z)&&(a=Ae(s,o=[]))&&(s==t.__e&&o.some(jt),jt(a),jt(s)),n||jt(t.__e),t.__e=t.__c=t.__=null}function xo(t,e,n){return this.constructor(t,n)}function zn(t,e){var n,s,a,o;z.__&&z.__(t,e),e.nodeType==9&&(e=e.documentElement),s=(n=t&&32&t.__u)?null:e.__k,e.__k=se(Le,{children:[t]}),a=[],o=[],nn(e,e.__k,s||Oe,Oe,e.namespaceURI,s?null:e.firstChild?en.call(e.childNodes):null,a,s?s.__e:e.firstChild,n,o),Hn(a,e.__k,o),e.__k.props.children=null}z={__e:function(t,e,n,s){for(var a,o,i;e=e.__;)if((a=e.__c)&&!(1&a.__g)){a.__g|=4;try{if((i=(o=a.constructor)&&o.getDerivedStateFromError)&&a.setState(o.getDerivedStateFromError(t)),a.componentDidCatch&&(a.componentDidCatch(t,s||{}),i=1),i&&8&a.__g)return void(a.__g|=2)}catch(r){t=r}}throw Ie=0,t}},Tn=0,mo=function(t){return t!=null&&t.constructor===oe},Me.prototype.setState=function(t,e){var n=this.__s;n&&n!=this.state||(n=this.__s=Wt({},this.state)),typeof t=="function"&&(t=t(Wt({},n),this.props)),t&&(Wt(n,t),this.__v&&(e&&this.__k.push(e),Pn(this)))},Me.prototype.forceUpdate=function(t){this.__v&&(this.__g|=4,t&&this.__h.push(t),Pn(this))},Me.prototype.render=Le,Bt=[],Ie=0,Mn=function(t,e){return t.__v.__b-e.__v.__b},Te=Symbol(),An=/(PointerCapture)$|Capture$/i,Qe=0,Ze={},$o=0;var ie,K,an,Un,rn=Object.is,Ee=0,Kn=[],ln=[],X=z,Rn=X.__b,Gn=X.__r,jn=X.diffed,Wn=X.__c,Yn=X.unmount,Xn=X.__;function dn(t,e){X.__h&&X.__h(K,t,Ee||e),Ee=0;var n=K.__H||(K.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function h(t){return Ee=1,_o(Zn,t)}function _o(t,e,n){var s=dn(ie++,2);if(s.t=t,!s.__c&&(s.__=[n?n(e):Zn(void 0,e),function(o){var i=(s.__N||s.__)[0],r=s.t(i,o);rn(i,r)||(s.__N=[r,s.__[1]],s.__c.setState({}))}],s.__c=K,!K.__f)){K.__f=!0;var a=K.shouldComponentUpdate;K.shouldComponentUpdate=function(o,i,r){var c=this.__H;if(!c)return!0;var u=!1,d=this.props!=o;if(c.__.some(function(m){m.__N&&(u=!0,rn(m.__[0],m.__N[0])||(d=!0))}),a){var f=a.call(this,o,i,r);return u?f||d:f}return!u||d}}return s.__}function j(t,e){var n=dn(ie++,3);!X.__s&&qn(n.__H,e)&&(n.__P=!0,n.__=t,n.u=e,K.__H.__h.push(n))}function re(t){return Ee=5,lt(function(){return{current:t}},[])}function lt(t,e){var n=dn(ie++,7);return qn(n.__H,e)&&(n.__=t(),n.__H=e),n.__}function wo(){var t;do{for(;t=ln.shift();)try{ae(t)}catch(n){X.__e(n,{__:(t=t.__P)&&t.__v})}for(;t=Kn.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(ae),e.__h.some(cn),e.__h=[]}catch(n){e.__h=[],X.__e(n,t.__v)}}}while(ln.length)}X.__b=function(t){K=null,Rn&&Rn(t)},X.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Xn&&Xn(t,e)},X.__r=function(t){Gn&&Gn(t),ie=0;var e=(K=t.__c).__H;e&&(an==K?K.__h=[]:(e.__h.some(ae),e.__h.some(cn),ie=0),e.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})),an=K},X.diffed=function(t){jn&&jn(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&Vn(Kn.push(e)),e.__H.__.some(function(n){n.u&&(n.__H=n.u)})),an=K=null},X.__c=function(t,e){e.some(function(n){try{n.__h.some(ae),n.__h=n.__h.filter(function(s){return!s.__||cn(s)})}catch(s){n.__h=[function(){throw s}]}}),Wn&&Wn(t,e)},X.unmount=function(t){Yn&&Yn(t);var e,n,s=t.__c;s&&s.__H&&(s.__H.__.some(function(a){try{if(a.__P&&a.__c){if(n===void 0){for(n=t.__;n&&(!n.__c||!n.__c.__P);)n=n.__;n=n&&n.__c}a.__P=n,Vn(ln.push(a))}else ae(a)}catch(o){e=o}}),s.__H=void 0,e&&X.__e(e,s.__v))};var Jn=typeof requestAnimationFrame=="function";function ko(t){var e,n=function(){clearTimeout(s),Jn&&cancelAnimationFrame(e),setTimeout(t)},s=setTimeout(n,35);Jn&&(e=requestAnimationFrame(n))}function Vn(t){t!=1&&Un==X.requestAnimationFrame||((Un=X.requestAnimationFrame)||ko)(wo)}function ae(t){var e=K,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),K=e}function cn(t){var e=K;t.__c=t.__(),K=e}function qn(t,e){return!t||t.length!=e.length||e.some(function(n,s){return!rn(n,t[s])})}function Zn(t,e){return typeof e=="function"?e(t):e}var ts=function(t,e,n,s){var a;e[0]=0;for(var o=1;o<e.length;o++){var i=e[o++],r=e[o]?(e[0]|=i?1:2,n[e[o++]]):e[++o];i===3?s[0]=r:i===4?s[1]=Object.assign(s[1]||{},r):i===5?(s[1]=s[1]||{})[e[++o]]=r:i===6?s[1][e[++o]]+=r+"":i?(a=t.apply(r,ts(t,r,n,["",null])),s.push(a),r[0]?e[0]|=2:(e[o-2]=0,e[o]=a)):s.push(r)}return s},Qn=new Map;function es(t){var e=Qn.get(this);return e||(e=new Map,Qn.set(this,e)),(e=ts(this,e.get(t)||(e.set(t,e=(function(n){for(var s,a,o=1,i="",r="",c=[0],u=function(m){o===1&&(m||(i=i.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?c.push(0,m,i):o===3&&(m||i)?(c.push(3,m,i),o=2):o===2&&i==="..."&&m?c.push(4,m,0):o===2&&i&&!m?c.push(5,0,!0,i):o>=5&&((i||!m&&o===5)&&(c.push(o,0,i,a),o=6),m&&(c.push(o,m,0,a),o=6)),i=""},d=0;d<n.length;d++){d&&(o===1&&u(),u(d));for(var f=0;f<n[d].length;f++)s=n[d][f],o===1?s==="<"?(u(),c=[c],o=3):i+=s:o===4?i==="--"&&s===">"?(o=1,i=""):i=s+i[0]:r?s===r?r="":i+=s:s==='"'||s==="'"?r=s:s===">"?(u(),o=1):o&&(s==="="?(o=5,a=i,i=""):s==="/"&&(o<5||n[d][f+1]===">")?(u(),o===3&&(c=c[0]),o=c,(c=c[0]).push(2,0,o),o=0):s===" "||s==="	"||s===`
`||s==="\r"?(u(),o=2):i+=s),o===3&&i==="!--"&&(o=4,c=c[0])}return u(),c})(t)),e),arguments,[])).length>1?e:e[0]}var Et=t=>String(t).padStart(2,"0"),Zt=t=>`${t.getFullYear()}-${Et(t.getMonth()+1)}-${Et(t.getDate())}`,A=()=>Zt(new Date),vt=t=>t.slice(0,7),U=()=>A().slice(0,7),qt=t=>{let[e,n,s]=t.split("-").map(Number);return new Date(e,n-1,s)},Dt=(t,e)=>{let n=qt(t);return n.setDate(n.getDate()+e),Zt(n)},St=(t,e)=>Math.round((qt(e)-qt(t))/864e5),Ft=t=>{let[e,n]=t.split("-").map(Number);return new Date(e,n,0).getDate()},ht=t=>{let[e,n]=t.split("-").map(Number);return n===1?`${e-1}-12`:`${e}-${Et(n-1)}`},Tt=t=>{let[e,n]=t.split("-").map(Number);return n===12?`${e+1}-01`:`${e}-${Et(n+1)}`},un=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],So=["January","February","March","April","May","June","July","August","September","October","November","December"],Ct=(t,e)=>{let[n,s]=t.split("-").map(Number);return`${(e?So:un)[s-1]} ${n}`},Fe=t=>un[t],J=t=>{let e=A();if(t===e)return"Today";if(t===Dt(e,-1))return"Yesterday";let n=qt(t),s=`${n.getDate()} ${un[n.getMonth()]}`;return n.getFullYear()===new Date().getFullYear()?s:`${s} ${n.getFullYear()}`},Co=0,bt=()=>Date.now().toString(36)+(Co++%1296).toString(36).padStart(2,"0")+Math.random().toString(36).slice(2,5),D=t=>{if(typeof t=="number")return t;if(t==null)return NaN;let e=String(t).replace(/\s|zł/g,"").replace(",",".");return e===""||e==="."?NaN:Number(e)},pn={},No=t=>pn[t]||(pn[t]=new Intl.NumberFormat("pl-PL",{minimumFractionDigits:t,maximumFractionDigits:t})),T=(t,e=2)=>No(e).format(Number.isFinite(t)?t:0).replace(/ /g," "),Po={PLN:"z\u0142",EUR:"\u20AC",USD:"$",AED:"AED",GBP:"\xA3",INR:"\u20B9"},V=(t,e="PLN",n=2)=>{let s=T(Math.abs(t),n),a=t<0?"\u2212":"";return e==="PLN"?`${a}${s} z\u0142`:e==="AED"?`${a}${s} AED`:`${a}${Po[e]||e}${s}`},Nt=(t,e=1)=>`${t>0?"+":t<0?"\u2212":""}${T(Math.abs(t),e)}%`,He=(t,e,n)=>Math.min(n,Math.max(e,t)),ut=(t,e=n=>n)=>t.reduce((n,s)=>n+e(s),0);async function ze(t){let e=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return[...new Uint8Array(e)].map(n=>n.toString(16).padStart(2,"0")).join("")}var Mt=(t=12)=>{try{navigator.vibrate&&navigator.vibrate(t)}catch{}},Do=t=>{let e="";for(let n=0;n<t.length;n+=32768)e+=String.fromCharCode.apply(null,t.subarray(n,n+32768));return btoa(e)};async function mn(t,e,n){if(window.CPNative&&window.CPNative.saveFile)return window.CPNative.saveFile(t,e,Do(n)),"saved";let s=new File([n],t,{type:e});if(navigator.canShare&&navigator.canShare({files:[s]}))try{return await navigator.share({files:[s],title:t}),"shared"}catch(i){if(i.name==="AbortError")return"cancelled"}let a=URL.createObjectURL(s),o=document.createElement("a");return o.href=a,o.download=t,document.body.appendChild(o),o.click(),o.remove(),setTimeout(()=>URL.revokeObjectURL(a),4e3),"downloaded"}var Ue="cp.data.v1",To=[["groceries","Groceries","\u{1F6D2}","Daily living"],["halal","Halal meat & food","\u{1F969}","Daily living"],["household","Household","\u{1F9F4}","Daily living"],["dining","Dining out","\u{1F37D}\uFE0F","Personal"],["coffee","Coffee & snacks","\u2615","Personal"],["transport","Public transport","\u{1F687}","Transport"],["taxi","Fuel / Taxi","\u{1F695}","Transport"],["car","Car","\u{1F697}","Transport"],["rent","Rent","\u{1F3E0}","Housing"],["utilities","Utilities","\u{1F4A1}","Housing"],["phone","Internet / Phone","\u{1F4F6}","Housing"],["uni","University fees","\u{1F393}","Studies"],["books","Books & supplies","\u{1F4DA}","Studies"],["gifts","Gifts & dates","\u{1F381}","Personal"],["subs","Subscriptions","\u{1F501}","Personal"],["health","Health & fitness","\u{1F4AA}","Personal"],["clothes","Clothing","\u{1F455}","Personal"],["haircut","Haircut & care","\u{1F488}","Personal"],["travel","Travel","\u2708\uFE0F","Personal"],["charity","Sadaqah / Charity","\u{1F932}","Personal"],["misc","Miscellaneous","\u{1F4E6}","Other"]].map(([t,e,n,s])=>({id:t,name:e,icon:n,group:s})),Mo=[["salary","Salary","\u{1F4BC}"],["freelance","Freelance / Side","\u{1F9D1}\u200D\u{1F4BB}"],["gift_in","Gift received","\u{1F381}"],["refund","Refund","\u21A9\uFE0F"],["other_in","Other income","\u{1F4B0}"]].map(([t,e,n])=>({id:t,name:e,icon:n})),pe={bank:"Bank",savings:"Savings",cash:"Cash"},Re=()=>({v:1,created:A(),accounts:[{id:"main",name:"Main bank",cur:"PLN",kind:"bank",opening:0,icon:"\u{1F3E6}"},{id:"savings",name:"Savings",cur:"PLN",kind:"savings",opening:0,icon:"\u{1F512}"},{id:"cash",name:"Cash",cur:"PLN",kind:"cash",opening:0,icon:"\u{1F4B5}"}],txns:[],card:{on:!0,name:"Credit card",limit:0,opening:0,dueDay:0,target:0},friends:[],gold:{buys:[],below:null,dropPct:2,alertsOn:!0,newsOn:!0,goalGrams:0,sellSpread:4},budget:{monthly:0,cats:{}},recurring:[],goals:[],cats:{exp:To,inc:Mo},zakat:{nisab:"gold",countOwed:!0,hawl:"",other:0,debts:0},settings:{privacy:!1,pin:null,remind9pm:!0,cardRemind:!0,onboarded:!1,alertsSetup:!1},rates:{PLN:1,USD:0,EUR:0,AED:0,GBP:0,INR:0,at:0}});function Ao(){try{let t=localStorage.getItem(Ue);return t?ns(JSON.parse(t)):Re()}catch{try{localStorage.setItem(Ue+".broken."+Date.now(),localStorage.getItem(Ue))}catch{}return Re()}}function ns(t){let e=Re(),n={...e,...t};for(let s of["card","gold","budget","zakat","settings","rates","cats"])n[s]={...e[s],...t[s]||{}};for(let s of["accounts","txns","friends","recurring","goals"])Array.isArray(n[s])||(n[s]=[]);return Array.isArray(n.gold.buys)||(n.gold.buys=[]),n}var ft=Ao(),ce=new Set,$n=null,Q=()=>ft;function G(t){let e=typeof t=="function"?t(ft):t;!e||e===ft||(ft=e,ce.forEach(n=>n(ft)),clearTimeout($n),$n=setTimeout(ue,150))}function ue(){clearTimeout($n);try{localStorage.setItem(Ue,JSON.stringify(ft))}catch(t){console.error(t)}vn.forEach(t=>t(ft))}var vn=new Set;function ss(t){ft=ns(t),ce.forEach(e=>e(ft)),ue()}function os(){ft=Re(),ce.forEach(t=>t(ft)),ue()}function B(){let[,t]=h(0);return j(()=>{let e=()=>t(n=>n+1);return ce.add(e),()=>ce.delete(e)},[]),ft}window.addEventListener("pagehide",ue);document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&ue()});try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch{}var E=(t,e)=>G(n=>({...n,[t]:{...n[t],...e}}));function At(t){let e={id:bt(),date:A(),note:"",...t};return G(n=>({...n,txns:[...n.txns,e]})),e}function Yt(t,e){G(n=>({...n,txns:n.txns.map(s=>s.id===t?{...s,...e}:s)}))}function me(t){G(e=>({...e,txns:e.txns.filter(n=>n.id!==t&&n.pair!==t)}))}function $e(t,e){G(n=>{let s=n[t],a=s.some(o=>o.id===e.id);return{...n,[t]:a?s.map(o=>o.id===e.id?{...o,...e}:o):[...s,{id:bt(),...e}]}})}function ve(t,e){G(n=>({...n,[t]:n[t].filter(s=>s.id!==e)}))}function as(t){G(e=>{let n=e.gold.buys,s=t.id&&n.some(a=>a.id===t.id)?n.map(a=>a.id===t.id?{...a,...t}:a):[...n,{...t,id:bt()}];return{...e,gold:{...e.gold,buys:s}}})}function is(t){G(e=>({...e,gold:{...e.gold,buys:e.gold.buys.filter(n=>n.id!==t)}}))}var R="card",de=(t,e)=>t.accounts.find(n=>n.id===e),W=(t,e)=>e===R?"PLN":(de(t,e)||{}).cur||"PLN",q=(t,e)=>t.cats.exp.find(n=>n.id===e)||t.cats.inc.find(n=>n.id===e)||{id:e,name:e||"Other",icon:"\u2022"},Ht=(t,e,n)=>n==="PLN"||!n?e:e*(t.rates[n]||0),mt=(t,e)=>e===R?t.card.name:(de(t,e)||{name:"\u2014"}).name;function xt(t,e){let n=de(t,e),s=n&&n.opening||0;for(let a of t.txns)a.from===e&&(s-=a.amt),a.to===e&&(s+=a.t==="xfer"&&a.amt2!=null?a.amt2:a.amt);return s}function tt(t){let e=t.card.opening||0;for(let n of t.txns)n.from===R&&(e+=n.amt),n.to===R&&(e-=n.t==="xfer"&&n.amt2!=null?n.amt2:n.amt);return e}function _t(t){let e=new Map(t.friends.map(n=>[n.id,0]));for(let n of t.txns){if(!n.friend||!e.has(n.friend))continue;let s=Ht(t,n.amt,W(t,n.from||n.to));n.t==="fout"&&e.set(n.friend,e.get(n.friend)+s),n.t==="fin"&&e.set(n.friend,e.get(n.friend)-s)}return e}var gt=(t,e)=>Ht(t,e.amt,W(t,e.t==="inc"||e.t==="fin"?e.to:e.from));function ct(t,e){let n={ym:e,income:0,spend:0,saved:0,byCat:{},card:0,count:0};for(let s of t.txns){if(vt(s.date)!==e)continue;let a=gt(t,s);if(s.t==="exp")n.spend+=a,n.byCat[s.cat]=(n.byCat[s.cat]||0)+a,n.count++,s.from===R&&(n.card+=a);else if(s.t==="inc")n.income+=a;else if(s.t==="xfer"){let o=(de(t,s.to)||{}).kind==="savings",i=(de(t,s.from)||{}).kind==="savings";o&&!i&&(n.saved+=a),i&&!o&&s.to!==R&&(n.saved-=a)}}return n.net=n.income-n.spend,n}function Io(t,e){return ut(t.txns.filter(n=>n.t==="exp"&&n.date===e),n=>gt(t,n))}function zt(t){let e=t.budget.monthly;if(!e)return null;let n=U(),s=A(),a=Number(s.slice(8)),o=Ft(n),i=ut(t.txns.filter(d=>d.t==="exp"&&vt(d.date)===n&&d.date<s),d=>gt(t,d)),r=Io(t,s),c=o-a+1,u=Math.max(0,(e-i)/c);return{allowance:u,todaySpent:r,left:u-r,monthLeft:e-i-r,daysLeft:c,budget:e}}function Qt(t,e=U()){let n=A(),s=Ft(e),o=e===U()?Number(n.slice(8)):s,i=[];for(let m=0;m<s;m++)i.push(0);let r=0;for(let m of t.txns)m.from!==R||vt(m.date)!==e||m.date>n||(r+=m.amt,i[Number(m.date.slice(8))-1]+=m.amt);let c=o?r/o:0,u=s-o,d=r+c*u,f=t.card.target||0;return{ym:e,spent:r,day:o,dim:s,daysLeft:u,perDay:c,projected:d,days:i,extra:c*u,owedEnd:tt(t)+c*u,target:f,overTarget:f?d-f:null,safePerDay:f&&u>0?Math.max(0,(f-r)/u):null}}function he(t){return ut(t.accounts,e=>Ht(t,xt(t,e.id),e.cur))}function Xt(t,e){let n=t.gold.buys,s=ut(n,u=>u.g),a=ut(n,u=>u.g*u.paid),o=ut(n,u=>u.g*(u.market||u.paid)),i=n.filter(u=>u.market>0).map(u=>(u.paid-u.market)/u.market),r=i.length?ut(i)/i.length:null,c=e?s*e:0;return{grams:s,paid:a,market:o,avgPaid:s?a/s:0,avgMarket:s?o/s:0,avgPremium:r,value:c,pl:c-a}}function Ge(t,e){let n=he(t),s=Xt(t,e).value,a=t.card.on?tt(t):0,o=0,i=0;for(let c of _t(t).values())c>0?o+=c:i-=c;return{cash:n,gold:s,card:a,fOwedMe:o,fIOwe:i,total:n+s+o-a-i+0}}function hn(){let t=Q(),e=A(),n=U(),s=[],a=t.recurring.map(o=>{if(o.paused)return o;let i=o.last||ht(n),r=Tt(i),c=!1;for(;r<=n;){let u=Math.min(o.day,Ft(r)),d=`${r}-${Et(u)}`;if(d>e)break;s.push({id:bt(),t:"exp",amt:o.amt,cat:o.cat,from:o.from,date:d,note:o.name,rec:o.id}),i=r,c=!0,r=Tt(r)}return c?{...o,last:i}:o});return s.length&&G(o=>({...o,recurring:a,txns:[...o.txns,...s]})),s.length}function rs(t){let e=A(),n=U();return`${n}-${Et(Math.min(t,Ft(n)))}`<e?n:ht(n)}function le(t,e=A()){if(!t)return null;let n=e.slice(0,7);for(let s=0;s<3;s++){let a=`${n}-${Et(Math.min(t,Ft(n)))}`;if(a>=e)return a;n=Tt(n)}return null}function je(t,e=35){let n=A(),s=Zt(new Date(qt(n).getTime()+e*864e5)),a=[];for(let o of t.recurring){if(o.paused)continue;let i=le(o.day,n);i&&i.slice(0,7)===(o.last||"")&&(i=le(o.day,`${Tt(o.last)}-01`)),i&&i<=s&&a.push({date:i,name:o.name,amt:o.amt,cur:W(t,o.from),icon:q(t,o.cat).icon,kind:"bill"})}if(t.card.on&&t.card.dueDay){let o=le(t.card.dueDay,n),i=tt(t);o&&o<=s&&a.push({date:o,name:`${t.card.name} payment`,amt:i,cur:"PLN",icon:"\u{1F4B3}",kind:"card"})}return a.sort((o,i)=>o.date.localeCompare(i.date))}var l=es.bind(In),fn=new Set;function O(t,e="\u2713",n=3200){fn.forEach(s=>s({text:t,icon:e,id:Math.random(),ms:n}))}function ls(){let[t,e]=h(null);return j(()=>{let n,s=a=>{e(a),clearTimeout(n),n=setTimeout(()=>e(null),a.ms)};return fn.add(s),()=>fn.delete(s)},[]),t?l`<div class="toast" key=${t.id} onClick=${()=>e(null)}><span style="font-size:20px">${t.icon}</span><span>${t.text}</span></div>`:null}function x({v:t,cur:e="PLN",cls:n="",sign:s=!1,d:a=2}){let o=Q().settings.privacy,i=(s&&t>0?"+":"")+V(t,e,a);return l`<span class=${`mono ${n} ${o?"blur":""}`}>${o?"\u2022\u2022\u2022\u2022":i}</span>`}function et({title:t,hint:e,onBack:n,right:s}){return l`<div class="back">
    <button class="iconbtn" onClick=${n} aria-label="Back">←</button>
    <div class="t"><div class="h-title">${t}</div>${e&&l`<div class="hint">${e}</div>`}</div>
    ${s}
  </div>`}function rt({title:t,onClose:e,children:n}){let s=re(),a=re(),o=()=>{history.state&&history.state.sheet?history.back():e()};return j(()=>{let r=document.body.style.overflow;document.body.style.overflow="hidden";let c=()=>e();history.pushState({sheet:1},""),window.addEventListener("popstate",c);let u=s.current,d=null,f=0,m=0,p=0,$=!1,v=!1,k=b=>{if(b.touches.length!==1){d=null;return}if(v=a.current&&a.current.contains(b.target),!v&&u.scrollTop>0){d=null;return}d=b.touches[0].clientY,f=b.touches[0].clientX,m=0,p=Date.now(),$=!1},w=b=>{if(d==null)return;let S=b.touches[0].clientY-d;if(!$){if(!v&&Math.abs(b.touches[0].clientX-f)>Math.abs(S)){d=null;return}if(S>6&&(v||u.scrollTop<=0)){$=!0;let P=document.activeElement;P&&P!==document.body&&P.blur&&P.blur()}else if(S<-4){d=null;return}else return}b.cancelable&&b.preventDefault(),m=Math.max(0,S),u.style.transition="none",u.style.transform=`translateY(${m}px)`},g=()=>{if(d==null||(d=null,!$))return;$=!1;let b=m/Math.max(1,Date.now()-p);m>100||m>30&&b>.5?(u.style.transition="transform .18s ease-in",u.style.transform="translateY(100%)",setTimeout(o,170)):(u.style.transition="transform .2s ease-out",u.style.transform="")};return u.addEventListener("touchstart",k,{passive:!0}),u.addEventListener("touchmove",w,{passive:!1}),u.addEventListener("touchend",g),u.addEventListener("touchcancel",g),()=>{document.body.style.overflow=r,window.removeEventListener("popstate",c),u.removeEventListener("touchstart",k),u.removeEventListener("touchmove",w),u.removeEventListener("touchend",g),u.removeEventListener("touchcancel",g)}},[]),l`<div class="overlay" onClick=${r=>r.target===r.currentTarget&&o()} onTouchMove=${r=>{r.target===r.currentTarget&&r.cancelable&&r.preventDefault()}}>
    <div class="sheet" ref=${s}>
      <div class="sheet-top" ref=${a}>
        <div class="grab"></div>
        <div class="sheet-head">${t?l`<h3>${t}</h3>`:""}<button class="x" onClick=${o} aria-label="Close">✕</button></div>
      </div>
      ${typeof n=="function"?n(o):n}
    </div>
  </div>`}var C=({label:t,children:e})=>l`<div class="field">${t&&l`<label>${t}</label>`}${e}</div>`;function L({value:t,onInput:e,placeholder:n="0",autofocus:s,cls:a="input mono"}){let o=re();return j(()=>{s&&o.current&&setTimeout(()=>o.current.focus(),250)},[]),l`<input ref=${o} class=${a} inputmode="decimal" placeholder=${n} value=${t}
    onInput=${i=>e(i.target.value.replace(/[^\d.,\-\s]/g,""))} />`}var nt=t=>Number.isFinite(D(t))&&D(t)>0;function It({options:t,value:e,onChange:n}){return l`<div class="seg">${t.map(([s,a])=>l`<button class=${e===s?"on":""} onClick=${()=>n(s)}>${a}</button>`)}</div>`}var dt=({on:t,onChange:e})=>l`<button class=${`switch ${t?"on":""}`} onClick=${()=>e(!t)} aria-pressed=${t}></button>`,yt=({v:t,cls:e=""})=>l`<div class=${`bar ${e}`}><i style=${{width:`${He(t,0,1)*100}%`}}></i></div>`,Ot=({e:t="\u{1F4ED}",text:e})=>l`<div class="empty"><span class="e">${t}</span>${e}</div>`;function st({title:t,hint:e,children:n,onClick:s}){return l`<div class="row" style="padding:10px 2px" onClick=${s}>
    <div class="grow"><div style="font-weight:600">${t}</div>${e&&l`<div class="hint">${e}</div>`}</div>${n}</div>`}function cs({pts:t,color:e="#1f6b57",height:n=180,time:s=!1,fmt:a=r=>T(r),marks:o=!0,refLine:i}){let[r,c]=h(null),u=re(),d=340,f=n,m=6,p=lt(()=>{if(!t||t.length<2)return null;let g=1/0,b=-1/0,S=0,P=0;t.forEach((H,Gt)=>{H[1]<g&&(g=H[1],S=Gt),H[1]>b&&(b=H[1],P=Gt)}),i&&(g=Math.min(g,i),b=Math.max(b,i));let N=(b-g)*.12||1,y=g-N,M=b+N,I=t[0][0],F=t[t.length-1][0],ot=H=>m+(H-I)/(F-I||1)*(d-2*m),at=H=>m+(1-(H-y)/(M-y))*(f-2*m),it=Math.max(1,Math.floor(t.length/400)),Kt=t.filter((H,Gt)=>Gt%it===0||Gt===t.length-1).map((H,Gt)=>`${Gt?"L":"M"}${ot(H[0]).toFixed(1)},${at(H[1]).toFixed(1)}`).join("");return{d:Kt,area:`${Kt}L${ot(F)},${f}L${ot(I)},${f}Z`,X:ot,Y:at,lo:t[S],hi:t[P]}},[t,n,i]);if(!p)return l`<div class="empty" style=${{height:f+"px",display:"grid",placeItems:"center"}}>Loading…</div>`;let $="g"+e.replace("#",""),v=g=>{let b=u.current.getBoundingClientRect(),S=((g.touches?g.touches[0].clientX:g.clientX)-b.left)/b.width*d,P=0,N=1/0;for(let y=0;y<t.length;y++){let M=Math.abs(p.X(t[y][0])-S);M<N&&(N=M,P=y)}c(t[P])},k=g=>{let b=new Date(g);return s?b.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):b.toLocaleDateString([],{day:"numeric",month:"short",year:"numeric"})},w=t[t.length-1];return l`<div>
    <div class="chart-tip">${r?l`<b>${a(r[1])}</b> · ${k(r[0])}`:l`<span class="mute">Touch the chart to explore</span>`}</div>
    <svg ref=${u} class="chart" viewBox=${`0 0 ${d} ${f}`} preserveAspectRatio="none" style=${{height:f+"px"}}
      onTouchStart=${v} onTouchMove=${v} onMouseMove=${v} onTouchEnd=${()=>c(null)} onMouseLeave=${()=>c(null)}>
      <defs>
        <linearGradient id=${$} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color=${e} stop-opacity=".18"/><stop offset="1" stop-color=${e} stop-opacity="0"/></linearGradient>
        
      </defs>
      ${[.25,.5,.75].map(g=>l`<line x1="0" x2=${d} y1=${f*g} y2=${f*g} stroke="rgba(128,128,128,.15)" />`)}
      ${i&&l`<line x1="0" x2=${d} y1=${p.Y(i)} y2=${p.Y(i)} stroke="#2f6fa3" stroke-dasharray="4 4" stroke-width="1" opacity=".7" vector-effect="non-scaling-stroke"/>`}
      <path d=${p.area} fill=${`url(#${$})`} />
      <path d=${p.d} fill="none" stroke=${e} stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
      ${o&&l`<circle cx=${p.X(p.lo[0])} cy=${p.Y(p.lo[1])} r="4" fill="#1e8a55" /><circle cx=${p.X(p.hi[0])} cy=${p.Y(p.hi[1])} r="4" fill="#c2392f" />`}
      <circle cx=${p.X(w[0])} cy=${p.Y(w[1])} r="4" fill=${e} />
      ${r&&l`<line x1=${p.X(r[0])} x2=${p.X(r[0])} y1="0" y2=${f} stroke="currentColor" stroke-width="1" opacity=".4" vector-effect="non-scaling-stroke"/><circle cx=${p.X(r[0])} cy=${p.Y(r[1])} r="5" fill=${e} />`}
    </svg>
  </div>`}var fe=["#1f6b57","#2f6fa3","#c8963e","#b5523b","#6b5b95","#4f8a3c","#a0596e","#3e8e9e","#8a7a52","#9a9a92"];function We({data:t,size:e=150,center:n}){let s=t.reduce((r,c)=>r+c.v,0);if(!s)return null;let a=56,o=2*Math.PI*a,i=0;return l`<svg viewBox="0 0 150 150" width=${e} height=${e} style="flex:none">
    <circle cx="75" cy="75" r=${a} fill="none" stroke="rgba(128,128,128,.15)" stroke-width="16"/>
    ${t.map((r,c)=>{let u=r.v/s*o,d=l`<circle cx="75" cy="75" r=${a} fill="none" stroke=${r.color||fe[c%fe.length]} stroke-width="16"
        stroke-dasharray=${`${Math.max(0,u-2)} ${o}`} stroke-dashoffset=${-i} transform="rotate(-90 75 75)"/>`;return i+=u,d})}
    ${n&&l`<text x="75" y="72" text-anchor="middle" fill="currentColor" opacity=".6" font-size="10">${n[0]}</text>
    <text x="75" y="90" text-anchor="middle" fill="currentColor" font-size="15" font-weight="700">${n[1]}</text>`}
  </svg>`}function ds({rows:t,height:e=140}){if(!t.length)return null;let n=Math.max(1,...t.flatMap(r=>[r.a,r.b])),s=340,a=e,o=Math.min(14,(s/t.length-8)/2),i=s/t.length;return l`<svg viewBox=${`0 0 ${s} ${a+18}`} class="chart" style=${{height:a+18+"px"}}>
    ${t.map((r,c)=>{let u=c*i+i/2,d=r.a/n*a,f=r.b/n*a;return l`<g>
        <rect x=${u-o-1} y=${a-d} width=${o} height=${d} rx="3" fill="#1e8a55" opacity=".85"/>
        <rect x=${u+1} y=${a-f} width=${o} height=${f} rx="3" fill="#b5523b" opacity=".85"/>
        <text x=${u} y=${a+13} text-anchor="middle" font-size="10" fill="#8d8c85">${r.label}</text>
      </g>`})}
  </svg>`}function ps({rows:t,height:e=120,fmt:n=s=>s.toFixed(1)}){let s=Math.max(...t.map(u=>Math.abs(u.v)),.01),a=340,o=e,i=o/2,r=a/t.length,c=r*.6;return l`<svg viewBox=${`0 0 ${a} ${o+16}`} class="chart" style=${{height:o+16+"px"}}>
    <line x1="0" x2=${a} y1=${i} y2=${i} stroke="rgba(128,128,128,.3)"/>
    ${t.map((u,d)=>{let f=Math.abs(u.v)/s*(i-4),m=d*r+(r-c)/2;return l`<g><rect x=${m} y=${u.v>=0?i-f:i} width=${c} height=${f} rx="3" fill=${u.v<0?"#1e8a55":"#c2392f"} opacity=${u.hl?1:.7}/>
        <text x=${m+c/2} y=${o+12} text-anchor="middle" font-size="10" fill="#8d8c85" font-weight=${u.hl?700:400}>${u.label}</text></g>`})}
  </svg>`}var $t={open:t=>{}};var $s=31.1034768,vs="https://api.gold-api.com/price/",hs="https://api.nbp.pl/api",us=["USD","EUR","GBP","CHF","INR","AED","TRY","SAR"];async function Vt(t){let e=Q();if(!t&&e.rates.USD&&e.rates.INR&&Date.now()-e.rates.at<3*36e5)return e.rates;let n={PLN:1},s={},a=null;try{let i=await(await fetch(`${hs}/exchangerates/tables/a/?format=json`,{cache:"no-store"})).json();a=i[0].effectiveDate;for(let r of i[0].rates)us.includes(r.code)&&(n[r.code]=r.mid,s[r.code]="nbp")}catch{}try{let i=await(await fetch("https://open.er-api.com/v6/latest/USD",{cache:"no-store"})).json(),r=i.rates.PLN;for(let c of us)!n[c]&&i.rates[c]&&r&&(n[c]=r/i.rates[c],s[c]="er");!a&&i.time_last_update_unix&&(a=Zt(new Date(i.time_last_update_unix*1e3)))}catch{}if(!n.USD)return e.rates;let o={...e.rates,...n,src:{...e.rates.src||{},...s},date:a||e.rates.date||null,at:Date.now()};return E("rates",o),o}var fs="cp.gold.samples",yn=new Set,Z={price:null,usdOz:null,at:null,prev:null,dir:0,err:null,dayOpen:null,ticks:0};function Oo(){try{return JSON.parse(localStorage.getItem(fs))||[]}catch{return[]}}var wt=Oo(),gn=0;function Bo(){yn.forEach(t=>t({...Z}))}async function Lo(){try{let t=Q().rates.USD||(await Vt()).USD,n=await(await fetch(vs+"XAU",{cache:"no-store"})).json();if(!n.price||!t)throw new Error("no price");let s=n.price/$s*t;Z.prev=Z.price,Z.dir=Z.prev==null?0:s>Z.prev+1e-6?1:s<Z.prev-1e-6?-1:0,Z.price=s,Z.usdOz=n.price,Z.at=n.updatedAt?Date.parse(n.updatedAt):Date.now(),Z.err=null,Z.ticks++;let a=Date.now();if((a-gn>6e4||Z.dir!==0)&&(wt.push([a,+s.toFixed(3)]),wt=wt.filter(o=>o[0]>a-8*864e5),a-gn>6e4)){gn=a;try{localStorage.setItem(fs,JSON.stringify(wt))}catch{}}Z.dayOpen=Eo(),Ho(s)}catch(t){Z.err=String(t.message||t)}Bo()}function Eo(){let t=Y.data;if(t.length){let s=A();for(let a=t.length-1;a>=0;a--)if(t[a][0]<s)return t[a][1]}let e=new Date;e.setHours(0,0,0,0);let n=wt.find(s=>s[0]>=e.getTime());return n?n[1]:null}var ye=null;function xn(){if(ye)return;let t=async()=>{await Lo(),ye=setTimeout(t,1e3)};ye=setTimeout(t,0)}function Fo(){clearTimeout(ye),ye=null}document.addEventListener("visibilitychange",()=>document.visibilityState==="visible"?xn():Fo());function Ut(){let[t,e]=h({...Z});return j(()=>(yn.add(e),()=>yn.delete(e)),[]),t}var Rt=()=>Z.price||(wt.length?wt[wt.length-1][1]:Y.data.length?Y.data[Y.data.length-1][1]:0),Jt=JSON.parse(sessionStorage.getItem("cp.fired")||"{}"),be=new Set;function Ho(t){let e=Q().gold;if(e.alertsOn){if(e.below&&t<=e.below&&!Jt.below&&(Jt.below=!0,be.forEach(n=>n({kind:"below",text:`Gold dropped to ${t.toFixed(2)} z\u0142/g, under your ${e.below} z\u0142 target`}))),e.below&&t>e.below*1.005&&(Jt.below=!1),e.dropPct){let n=Date.now()-864e5,s=wt.filter(i=>i[0]>=n).map(i=>i[1]),a=(wt.find(i=>i[0]>=n)||[Date.now()])[0];if(s.length<10||a>Date.now()-3*36e5){sessionStorage.setItem("cp.fired",JSON.stringify(Jt));return}let o=Math.max(...s);o>0&&(o-t)/o*100>=e.dropPct&&!Jt.drop&&(Jt.drop=!0,be.forEach(i=>i({kind:"drop",text:`Gold is down ${((o-t)/o*100).toFixed(1)}% from its 24h high`})))}sessionStorage.setItem("cp.fired",JSON.stringify(Jt))}}var gs="cp.gold.hist",Y=(()=>{try{return JSON.parse(localStorage.getItem(gs))||{data:[],upTo:null}}catch{return{data:[],upTo:null}}})(),bn=new Set,ge=null;function _n(){return ge||(Y.upTo===A()&&Y.data.length?Promise.resolve(Y):(ge=(async()=>{let t=A(),e=[],n=Y.data.length?Dt(Y.data[Y.data.length-1][0],1):"2013-01-02";for(;n<=t;){let o=Dt(n,360);o>t&&(o=t),e.push([n,o]),n=Dt(o,1)}let s=await Promise.all(e.map(async([o,i])=>{try{let r=await fetch(`${hs}/cenyzlota/${o}/${i}/?format=json`);return r.ok?(await r.json()).map(c=>[c.data,c.cena]):[]}catch{return null}}));if(s.some(o=>o===null)&&!Y.data.length)throw new Error("offline");let a=new Map(Y.data);for(let o of s)if(o)for(let[i,r]of o)a.set(i,r);Y.data=[...a.entries()].sort((o,i)=>o[0].localeCompare(i[0])),s.some(o=>o===null)||(Y.upTo=t);try{localStorage.setItem(gs,JSON.stringify(Y))}catch{}return bn.forEach(o=>o(Y.data.length)),Y})().finally(()=>{ge=null}),ge))}function Ye(){let[t,e]=h(Y.data.length);return j(()=>(bn.add(e),_n().catch(()=>{}),()=>bn.delete(e)),[]),Y.data}var wn=[["1D",1],["1W",7],["1M",30],["6M",182],["1Y",365],["5Y",1826],["ALL",99999]];function ys(t,e,n){if(t==="1D"){let i=Date.now()-864e5,r=wt.filter(c=>c[0]>=i).map(([c,u])=>[c,u]);return n&&r.push([Date.now(),n]),{pts:r,time:!0}}let s=wn.find(i=>i[0]===t)[1],a=Dt(A(),-s),o=e.filter(i=>i[0]>=a).map(([i,r])=>[Date.parse(i),r]);return n&&o.length&&o.push([Date.now(),n]),{pts:o,time:!1}}function bs(t){if(!t.length)return null;let e=t[0],n=t[0];for(let o of t)o[1]<e[1]&&(e=o),o[1]>n[1]&&(n=o);let s=t[0][1],a=t[t.length-1][1];return{lo:e,hi:n,first:s,last:a,change:a-s,changePct:(a-s)/s*100,avg:ut(t,o=>o[1])/t.length}}function kn(t,e,n){let s=Dt(A(),-n),a=t.filter(o=>o[0]>=s).map(o=>o[1]);return a.length?a.filter(o=>o<e).length/a.length*100:null}var ms=(t,e)=>{let n=t.slice(-e);return n.length?ut(n,s=>s[1])/n.length:null};function Xe(t,e,n){if(!e||t.length<60)return null;let s=[],a=0,o=ms(t,50),i=ms(t,200),r=kn(t,e,365),c=Math.max(...t.slice(-22).map(m=>m[1]),e),u=(c-e)/c*100;if(o){let m=(e-o)/o*100;m<-1?(a+=1,s.push({good:!0,text:`${Math.abs(m).toFixed(1)}% below its 50-day average`})):m>3?(a-=1,s.push({good:!1,text:`${m.toFixed(1)}% above its 50-day average`})):s.push({good:null,text:"Close to its 50-day average"})}if(i){let m=(e-i)/i*100;m<0?(a+=1,s.push({good:!0,text:`Below its 200-day average (${m.toFixed(1)}%)`})):m>12&&(a-=1,s.push({good:!1,text:`${m.toFixed(0)}% above its 200-day average: stretched`}))}if(u>=4&&(a+=1,s.push({good:!0,text:`Dipped ${u.toFixed(1)}% from its 1-month high`})),r!=null&&(r<30?(a+=1,s.push({good:!0,text:`Cheaper than ${(100-r).toFixed(0)}% of days this year`})):r>90&&(a-=1,s.push({good:!1,text:`Near its 1-year high (top ${(100-r).toFixed(0)}%)`}))),n){let m=(e-n)/n*100;m<0?(a+=1,s.push({good:!0,text:`Below what gold cost when you bought (${m.toFixed(1)}%)`})):s.push({good:null,text:`${m.toFixed(1)}% above the market price at your past buys`})}let d=a>=3?"good":a>=1?"ok":"wait",f={good:"Good time to buy",ok:"Fair: could buy a little",wait:"Pricey: maybe wait"}[d];return{score:a,level:d,label:f,reasons:s,m50:o,m200:i,p1y:r,dip:u}}function xs(t){let e={};for(let[s,a]of t){let o=s.slice(0,4);(e[o]||(e[o]=[])).push([+s.slice(5,7)-1,a])}let n=Array.from({length:12},()=>[]);for(let[s,a]of Object.entries(e)){if(new Set(a.map(r=>r[0])).size<12)continue;let i=ut(a,r=>r[1])/a.length;for(let r=0;r<12;r++){let c=a.filter(u=>u[0]===r);n[r].push((ut(c,u=>u[1])/c.length-i)/i*100)}}return n.map((s,a)=>({m:a,avg:s.length?ut(s)/s.length:0,n:s.length}))}function _s(t){let e={};for(let[n,s]of t){let a=n.slice(0,4);(!e[a]||s<e[a].lo[1])&&(e[a]={...e[a]||{},lo:[n,s]}),(!e[a].hi||s>e[a].hi[1])&&(e[a].hi=[n,s])}return Object.entries(e).map(([n,s])=>({y:n,...s})).reverse()}function ws(t,e=8){let n=[],s=t[0],a=null;for(let o of t)o[1]>s[1]?(a&&(s[1]-a[1])/s[1]*100>=e&&n.push({peak:s,trough:a,pct:(s[1]-a[1])/s[1]*100}),s=o,a=null):(!a||o[1]<a[1])&&(a=o);return a&&(s[1]-a[1])/s[1]*100>=e&&n.push({peak:s,trough:a,pct:(s[1]-a[1])/s[1]*100,ongoing:!0}),n.reverse()}async function ks(){try{let t=Q().rates.USD||(await Vt()).USD;return(await(await fetch(vs+"XAG",{cache:"no-store"})).json()).price/$s*t}catch{return null}}var zo="https://skibidi-null.github.io/creampie-holdings/news.json";async function xe(){let t=location.hostname.endsWith("github.io")?["news.json"]:[zo,"news.json"];for(let e of t)try{let n=await fetch(e+"?t="+Math.floor(Date.now()/3e5),{cache:"no-store"});if(n.ok)return await n.json()}catch{}return null}var Ss="BNND5xQBfFpLPAdFjW_WMIZcM6RCx7KLS9AoKjWHeDz74Vlrpn9FuL01E9Oci52fSeBDGOVOMsbeL3p2-Gs9h7A",Cs="BJ-LY694bqrHi8OwkWZtAUCpBX2H5KNPTdMzaMiuivIY46X3r642bO0IQtk8DcT0lriL2E4jaARskEBBfez86m4",Ns="cph-5990de692b97d66928c23030";var Pt=()=>!!window.CPNative,we=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1,Sn=()=>window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===!0,Ts=()=>"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window;function Uo(){let t=Q(),e=zt(t);return{v:1,tz:Intl.DateTimeFormat().resolvedOptions().timeZone||"Europe/Warsaw",gold:{on:!!t.gold.alertsOn,below:t.gold.below||null,dropPct:t.gold.dropPct||null,news:!!t.gold.newsOn},remind9pm:!!t.settings.remind9pm,card:{on:!!(t.card.on&&t.settings.cardRemind),name:t.card.name,dueDay:t.card.dueDay||0,owed:Math.round(tt(t)*100)/100},lastEntry:t.txns.length?t.txns.reduce((n,s)=>s.date>n?s.date:n,""):null,widget:{today:e?e.todaySpent:null,left:e?e.left:null,month:ct(t,U()).spend,gold:Z.price||null,privacy:!!t.settings.privacy}}}var _e={enc:t=>btoa(String.fromCharCode(...new Uint8Array(t))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),dec:t=>Uint8Array.from(atob(t.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((t.length+3)%4)),e=>e.charCodeAt(0))};async function Ro(t){let e=await crypto.subtle.importKey("raw",_e.dec(Cs),{name:"ECDH",namedCurve:"P-256"},!1,[]),n=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},!0,["deriveBits"]),s=await crypto.subtle.deriveBits({name:"ECDH",public:e},n.privateKey,256),a=await crypto.subtle.importKey("raw",s,"HKDF",!1,["deriveKey"]),o=await crypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:new Uint8Array(0),info:new TextEncoder().encode("cph-config")},a,{name:"AES-GCM",length:256},!1,["encrypt"]),i=crypto.getRandomValues(new Uint8Array(12)),r=await crypto.subtle.encrypt({name:"AES-GCM",iv:i},o,new TextEncoder().encode(JSON.stringify(t))),c=await crypto.subtle.exportKey("raw",n.publicKey);return JSON.stringify({e:_e.enc(c),iv:_e.enc(i),ct:_e.enc(r)})}var Ps="",Ds=null;async function ke(t){let e=Uo();if(Pt()){try{window.CPNative.setConfig(JSON.stringify(e))}catch{}return!0}if(!Q().settings.alertsSetup||!Ts())return!1;try{let s=await(await navigator.serviceWorker.ready).pushManager.getSubscription();if(!s)return!1;let{widget:a,...o}=e,i={sub:s.toJSON(),cfg:o,at:Date.now()},r=JSON.stringify({...i,at:0}),c=Number(localStorage.getItem("cp.cfg.at")||0);if(!t&&r===Ps&&Date.now()-c<6*36e5)return!0;let u=await fetch(`https://ntfy.sh/${Ns}`,{method:"POST",body:await Ro(i)});return u.ok&&(Ps=r,localStorage.setItem("cp.cfg.at",String(Date.now()))),u.ok}catch(n){return console.warn("sync",n),!1}}vn.add(()=>{clearTimeout(Ds),Ds=setTimeout(()=>ke(),2500)});async function Je(){if(Pt()){try{window.CPNative.requestNotifications()}catch{}return G(a=>({...a,settings:{...a.settings,alertsSetup:!0}})),"ok"}if(we()&&!Sn())return"install-first";if(!Ts())return"unsupported";if(await Notification.requestPermission()!=="granted")return"denied";let e=await navigator.serviceWorker.ready,n=await e.pushManager.getSubscription();return n||(n=await e.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:_e.dec(Ss)})),G(a=>({...a,settings:{...a.settings,alertsSetup:!0}})),await ke(!0)?"ok":"relay-failed"}async function Ms(t,e){if(Pt()){try{window.CPNative.notify(t,e)}catch{}return}try{Notification.permission==="granted"&&(await navigator.serviceWorker.ready).showNotification(t,{body:e,icon:"icons/icon-192.png",badge:"icons/badge.png",tag:t})}catch{}}var _={app:"Creampie Holdings",tagline:"Personal money tracker",hello:["Welcome back","Hello again","Good to see you"],nHome:"Home",nActivity:"Activity",nGold:"Gold",nWealth:"Wealth",nAdd:"Add",addExp:"Add expense",addExpHint:"Add expense",addInc:"Add income",addIncHint:"Add income",addXfer:"Move money",addXferHint:"Move between accounts",addSplit:"Split a bill",addSplitHint:"Split with a friend",addFriend:"Lend / borrow",addFriendHint:"Lend / borrow money",todayLeft:"You can spend today",todayOver:"Over today's limit by",noBudget:"Set a monthly limit to get a daily allowance",spentToday:"Spent today",thisMonth:"Spent this month",netWorth:"Net worth",netWorthHint:"Net worth",empty:"Nothing here yet.",card:"Credit card",cardHint:"Limit, spending & bill",accounts:"Accounts",accountsHint:"Bank & cash",friends:"Friends & debts",friendsHint:"Who owes who",goals:"Savings goals",goalsHint:"Savings goals",zakat:"Zakat",zakatHint:"Calculator",bills:"Regular bills",billsHint:"Repeat payments",budget:"Budgets",budgetHint:"Budgets",news:"Gold news",newsHint:"Gold news",history:"History",historyHint:"Monthly history",convert:"Currency converter",convertHint:"Currency converter",summary:"Month summary",summaryHint:"Month summary",settings:"Settings",settingsHint:"Settings",backup:"Backup",backupHint:"Backup & export",goldLive:"Live price per gram",buyGood:"Price is low. Good time to buy",buyOk:"Fair price. Buying a little is fine",buyWait:"Price is high. Maybe wait",boughtGold:"Add gold purchase",boughtGoldHint:"Log a purchase",discreet:"Hide amounts",discreetHint:"Blur all amounts on screen",members:"PIN lock",pinAsk:"Enter your PIN",pinWrong:"Wrong PIN. Try again",cardWarn80:"Credit card is 80% used",catWarn:t=>`${t}: 80% of your limit used`,catOver:t=>`${t}: over your monthly limit`},As=t=>t[Math.floor(Math.random()*t.length)];function Is(t,e){let n=e.friend&&(t.friends.find(s=>s.id===e.friend)||{}).name;switch(e.t){case"exp":{let s=q(t,e.cat);return{icon:s.icon,title:e.note||s.name,sub:`${s.name} \xB7 ${mt(t,e.from)}`,sign:-1,cur:W(t,e.from)}}case"inc":{let s=q(t,e.cat);return{icon:s.icon,title:e.note||s.name,sub:`${s.name} \u2192 ${mt(t,e.to)}`,sign:1,cur:W(t,e.to)}}case"xfer":return{icon:e.to===R?"\u{1F4B3}":"\u{1F500}",title:e.note||(e.to===R?"Card bill paid":"Moved money"),sub:`${mt(t,e.from)} \u2192 ${mt(t,e.to)}`,sign:0,cur:W(t,e.from)};case"fout":return{icon:"\u{1F91D}",title:`${n||"Friend"}: ${e.note||"gave money"}`,sub:e.from?`from ${mt(t,e.from)}`:"no money moved",sign:0,cur:W(t,e.from)};case"fin":return{icon:"\u{1F91D}",title:`${n||"Friend"}: ${e.note||"got money"}`,sub:e.to?`into ${mt(t,e.to)}`:"no money moved",sign:0,cur:W(t,e.to)};case"gold":return{icon:"\u{1FA99}",title:e.note||"Gold purchase",sub:`Gold \xB7 ${mt(t,e.from)}`,sign:-1,cur:W(t,e.from)};case"adj":return{icon:"\u{1F6E0}\uFE0F",title:"Balance correction",sub:mt(t,e.to||e.from),sign:0,cur:W(t,e.to||e.from)};default:return{icon:"\u2022",title:e.note||e.t,sub:"",sign:0,cur:"PLN"}}}function te({t,s:e}){let n=Is(e,t);return l`<button class="item" onClick=${()=>t.t==="gold"?location.hash="#/gold":t.t!=="adj"&&$t.open({edit:t})}>
    <span class="em">${n.icon}</span>
    <div class="grow"><div class="t1">${n.title}</div><div class="t2">${n.sub}${t.rec?" \xB7 \u{1F501}":""}</div></div>
    <${x} v=${n.sign?n.sign*t.amt:t.amt} cur=${n.cur} sign=${n.sign>0} cls=${`amt ${n.sign>0?"up":n.sign<0?"":"dim"}`} />
  </button>`}function Os(){let t=B(),[e,n]=h(U()),[s,a]=h("all"),[o,i]=h(""),r=o.trim().toLowerCase(),c=lt(()=>{let m=t.txns;return r?m=m.filter(p=>{let $=Is(t,p);return($.title+" "+$.sub+" "+(p.note||"")+" "+p.amt).toLowerCase().includes(r)}):m=m.filter(p=>vt(p.date)===e),s!=="all"&&(m=m.filter(p=>s==="exp"?p.t==="exp":s==="inc"?p.t==="inc":!["exp","inc"].includes(p.t))),[...m].sort((p,$)=>($.date+$.id).localeCompare(p.date+p.id))},[t.txns,e,s,r]),u=[];for(let m of c){let p=u[u.length-1];p&&p.date===m.date?p.items.push(m):u.push({date:m.date,items:[m]})}let d=ct(t,e),f=r?c.filter(m=>m.t==="exp").reduce((m,p)=>m+gt(t,p),0):0;return l`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">${_.nActivity}</div><div class="hint">All your entries</div></div></div>
    <input class="input" placeholder="🔍  Search: haircut, kebab, 50…" value=${o} onInput=${m=>i(m.target.value)} style="margin-bottom:10px" />
    ${!r&&l`<div class="row between" style="margin:4px 2px 10px">
      <button class="iconbtn" onClick=${()=>n(ht(e))}>‹</button>
      <div style="text-align:center"><div class="h-big" style="font-size:16px">${Ct(e,!0)}</div></div>
      <button class="iconbtn" onClick=${()=>n(Tt(e))} disabled=${e>=U()} style=${{opacity:e>=U()?.3:1}}>›</button>
    </div>
    <div class="stat3" style="margin-bottom:10px">
      <div><div class="l">Spent</div><div class="v"><${x} v=${d.spend} d=${0} /></div></div>
      <div><div class="l">Came in</div><div class="v up"><${x} v=${d.income} d=${0} /></div></div>
      <div><div class="l">Net</div><div class=${`v ${d.net>=0?"up":"down"}`}><${x} v=${d.net} d=${0} /></div></div>
    </div>`}
    ${r&&l`<div class="card" style="padding:12px"><b>${c.length}</b> matches${f?l` · spent <${x} v=${f} cls="pink" />`:""}</div>`}
    <${It} options=${[["all","All"],["exp","Spent"],["inc","Income"],["other","Other"]]} value=${s} onChange=${a} />
    ${u.length?u.map(m=>{let p=m.items.filter($=>$.t==="exp").reduce(($,v)=>$+gt(t,v),0);return l`<div>
        <div class="dayhead"><span>${J(m.date)}</span>${p>0&&l`<${x} v=${-p} />`}</div>
        <div class="card" style="padding:4px 12px;margin-bottom:6px">${m.items.map($=>l`<${te} t=${$} s=${t} key=${$.id} />`)}</div>
      </div>`}):l`<${Ot} text=${r?"Nothing matches.":_.empty} />`}
  </div>`}var kt=t=>{location.hash="#/"+t},Go=As(_.hello);function Bs({openAdd:t}){let e=B(),n=Ut(),s=Ye(),a=n.price||Rt(),o=zt(e),i=ct(e,U()),r=Xt(e,a),c=Ge(e,a),u=tt(e),d=Qt(e),m=[..._t(e).values()].filter(y=>y>0).reduce((y,M)=>y+M,0),p=je(e,40),$=p.filter(y=>St(A(),y.date)<=3&&y.amt>0),v=lt(()=>Xe(s,a,r.avgMarket),[s.length,Math.round((a||0)*2)]),k=n.dayOpen&&a?(a-n.dayOpen)/n.dayOpen*100:null,w=e.goals[0],[g,b]=h(null);j(()=>{xe().then(b)},[]);let S=g&&g.items&&g.items[0],P=[...e.txns].sort((y,M)=>(M.date+M.id).localeCompare(y.date+y.id)).slice(0,5),N=e.settings.privacy;return l`<div class="screen">
    <div class="top">
      <img class="logo" src="icons/icon-192.png" alt="" />
      <div class="grow"><div class="brand">${_.app}</div><div class="hint">${Go}</div></div>
      <button class=${`iconbtn ${N?"on":""}`} title=${_.discreet} onClick=${()=>{E("settings",{privacy:!N}),O(N?"Amounts shown":"Amounts hidden","\u2713")}} aria-label="Hide amounts">${N?"\u{1F648}":"\u{1F441}\uFE0F"}</button>
      <button class="iconbtn" onClick=${()=>kt("settings")}>⚙️</button>
    </div>

    ${!e.settings.onboarded&&l`<div class="card tap" onClick=${()=>kt("setup")}>
      <div class="row"><span style="font-size:26px">👋</span><div class="grow"><div style="font-weight:700">First time? Let's get you set up</div><div class="hint">Balances, card limit, monthly limit. 1 minute</div></div><span class="pink">→</span></div>
    </div>`}

    <div class="card hero tap" onClick=${()=>kt("budget")}>
      ${o?l`
        <div class="label">${o.left>=0?_.todayLeft:"Over today by"}</div>
        <div class=${`big ${o.left>=0?"":"down"}`}><${x} v=${Math.abs(o.left)} /></div>
        <div style="margin:10px 0 6px"><${yt} v=${o.allowance?o.todaySpent/o.allowance:1} cls=${o.left<0?"hot":""} /></div>
        <div class="row between sub"><span>${_.spentToday}: <${x} v=${o.todaySpent} /></span><span>${o.daysLeft}d left · <${x} v=${o.monthLeft} d=${0} /></span></div>
      `:l`
        <div class="label">${_.thisMonth}</div>
        <div class="big"><${x} v=${i.spend} /></div>
        <div class="sub">${_.noBudget} →</div>
      `}
    </div>

    <div class="card tap" onClick=${()=>kt("gold")} style="padding:14px 16px">
      <div class="row">
        <span style="font-size:26px">🪙</span>
        <div class="grow">
          <div class="hint"><span class=${`livedot ${n.price?"":"off"}`}></span>Gold · live · per gram</div>
          <div class="row" style="gap:8px;align-items:baseline">
            <span class="mono" style="font-size:22px;font-weight:700">${a?T(a)+" z\u0142":"\u2026"}</span>
            ${k!=null&&l`<span class=${`mono ${k>=0?"up":"down"}`} style="font-size:13px">${k>=0?"\u25B2":"\u25BC"} ${Nt(k,2)}</span>`}
          </div>
        </div>
        ${v&&l`<span class=${`tag ${v.level==="good"?"up":v.level==="wait"?"down":"watch"}`}>${v.level==="good"?"Good to buy":v.level==="wait"?"Wait":"Fair"}</span>`}
      </div>
    </div>

    ${$.map(y=>l`<div class="card tap" style="border-color:rgba(255,184,77,.4);padding:12px 16px" onClick=${()=>kt(y.kind==="card"?"card":"bills")}>
      <div class="row"><span style="font-size:20px">⏰</span><div class="grow"><b>${y.name}</b><div class="hint">${J(y.date)}${y.date===A()?". Due today!":""}</div></div><${x} v=${y.amt} cur=${y.cur} cls="warn" /></div>
    </div>`)}

    <div class="sect"><span class="h-title">Overview</span></div>
    <div class="tiles">
      <${pt} ic="🧾" nm=${_.nActivity} hint="All spending" val=${l`<${x} v=${i.spend} />`} sub=${`${i.count} this month`} go="activity" />
      <${pt} ic="💳" nm=${_.card} hint=${_.cardHint} val=${e.card.limit?l`<${x} v=${e.card.limit-u} />`:"Set limit"} sub=${d.spent>0?`month pace \u2192 ${e.settings.privacy?"\u2022\u2022":V(d.projected,"PLN",0)}`:e.card.limit?"available":""} go="card" />
      <${pt} ic="💰" nm=${_.accounts} hint=${_.accountsHint} val=${l`<${x} v=${he(e)} />`} sub=${`${e.accounts.length} places`} go="accounts" />
      <${pt} ic="🪙" nm=${_.nGold} hint="Your gold" val=${r.grams?l`<${x} v=${r.value} />`:"No gold yet"} sub=${r.grams?`${T(r.grams,2)} g`:""} go="gold" />
      <${pt} wide ic="📊" nm=${_.netWorth} hint="Everything you own minus what you owe" val=${l`<${x} v=${c.total} />`} sub=${"cash + gold + owed to you \u2212 debts"} go="wealth" />
      <${pt} ic="🤝" nm=${_.friends} hint=${_.friendsHint} val=${l`<${x} v=${m} />`} sub="owed to you" go="friends" />
      <${pt} ic="🎯" nm=${_.goals} hint=${_.goalsHint} val=${w?`${Math.round(w.saved/w.target*100||0)}%`:"Add a goal"} sub=${w?w.name:""} go="goals" />
      <${pt} ic="🔁" nm=${_.bills} hint=${_.billsHint} val=${p[0]?J(p[0].date):"None yet"} sub=${p[0]?p[0].name:""} go="bills" />
      <${pt} ic="📰" nm=${_.news} hint=${_.newsHint} val=${S?S.impact==="up"?"\u25B2 may rise":S.impact==="down"?"\u25BC may fall":"\u25CF watch":"\u2026"} sub=${S?S.title:""} go="news" />
    </div>
    <div class="tiles three" style="margin-top:10px">
      <${pt} small ic="🎚️" nm="Budgets" hint="Limits" go="budget" />
      <${pt} small ic="📊" nm="History" hint="Months" go="history" />
      <${pt} small ic="🗓️" nm="Summary" hint="Month" go="summary" />
      <${pt} small ic="🕋" nm="Zakat" hint="Calculator" go="zakat" />
      <${pt} small ic="💱" nm="Currency" hint="Converter" go="convert" />
      <${pt} small ic="💾" nm="Backup" hint="Export" go="backup" />
    </div>

    <div class="sect"><span class="h-title">Recent</span><button class="more" onClick=${()=>kt("activity")}>See all →</button></div>
    <div class="card" style="padding:6px 12px">
      ${P.length?P.map(y=>l`<${te} t=${y} s=${e} />`):l`<div class="empty"><span class="e">📭</span>${_.empty}<div style="margin-top:12px"><button class="btn primary" onClick=${()=>t("exp")}>${_.addExp}</button></div></div>`}
    </div>
  </div>`}function pt({ic:t,nm:e,hint:n,val:s,sub:a,accent:o,go:i,wide:r,small:c}){return l`<button class=${`tile ${r?"wide":""} ${c?"small":""}`} style=${{"--accent":o}} onClick=${()=>kt(i)}>
    <div class="ic">${t}</div>
    <div>
      <div class="nm">${e}</div>
      ${s!=null&&l`<div class="val">${s}</div>`}
      <div class="hint" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a||n}</div>
    </div>
  </button>`}var jo=[["exp","Expense"],["inc","Income"],["xfer","Move"],["split","Split"],["friend","Lend"]];function Es({onClose:t,edit:e,mode:n="exp",preset:s={}}){let a=B(),[o,i]=h(e?e.t==="fout"||e.t==="fin"?"friend":e.t:n);return l`<${rt} onClose=${t}>${r=>l`
    ${!e&&l`<div style="margin-bottom:14px"><${It} options=${jo} value=${o} onChange=${c=>{Mt(),i(c)}} /></div>`}
    ${e&&l`<h3>Edit entry</h3>`}
    ${o==="exp"&&l`<${Yo} s=${a} edit=${e} preset=${s} done=${r} />`}
    ${o==="inc"&&l`<${Xo} s=${a} edit=${e} done=${r} />`}
    ${o==="xfer"&&l`<${Jo} s=${a} edit=${e} preset=${s} done=${r} />`}
    ${o==="split"&&l`<${Vo} s=${a} done=${r} />`}
    ${o==="friend"&&l`<${Ko} s=${a} edit=${e} preset=${s} done=${r} />`}
  `}<//>`}function Se({value:t,onInput:e,cur:n="PLN",label:s}){return l`<div class="amount">
    <div class="cur">${s||n}</div>
    <${L} cls="" value=${t} onInput=${e} autofocus />
  </div>`}function ee({s:t,value:e,onChange:n,card:s=!0,none:a,noneLabel:o="No money moved"}){return l`<div class="chips">
    ${t.accounts.map(i=>l`<button class=${`chip ${e===i.id?"on":""}`} onClick=${()=>n(i.id)}>${i.icon||"\u{1F3E6}"} ${i.name}${i.cur!=="PLN"?` \xB7 ${i.cur}`:""}</button>`)}
    ${s&&t.card.on&&l`<button class=${`chip ${e===R?"on":""}`} onClick=${()=>n(R)}>💳 ${t.card.name}</button>`}
    ${a&&l`<button class=${`chip ${e==null?"on":""}`} onClick=${()=>n(null)}>✋ ${o}</button>`}
  </div>`}function Ce({date:t,setDate:e,note:n,setNote:s}){return l`<div class="row" style="gap:8px">
    <div style="flex:0 0 46%"><${C} label="When"><input class="input" type="date" value=${t} max="2099-12-31" onInput=${a=>e(a.target.value||A())} /><//></div>
    <div class="grow"><${C} label="Note"><input class="input" placeholder="optional" value=${n} onInput=${a=>s(a.target.value)} /><//></div>
  </div>`}function Ne({edit:t,onSave:e,ok:n,label:s="Save it"}){return l`<div class="btns" style="margin-top:6px">
    ${t&&l`<button class="btn danger" onClick=${()=>{confirm("Delete this entry?")&&(me(t.id),O("Deleted","\u{1F5D1}\uFE0F"),e(!0))}}>Delete</button>`}
    <button class="btn primary grow" disabled=${!n} style=${{opacity:n?1:.4}} onClick=${()=>n&&e()}>${s}</button>
  </div>`}var Fs=(t,e,n,s)=>{for(let a=t.txns.length-1;a>=0;a--)if(t.txns[a].t===e&&t.txns[a][n]!=null)return t.txns[a][n];return s};function Wo(t,e){let n=Q();if(e===R&&n.card.limit){let o=tt(n)/n.card.limit;if(o>=1)return O(`Credit card limit reached (${Math.round(o*100)}% used)`,"\u{1F4B3}",5e3);if(o>=.8)return O(_.cardWarn80,"\u{1F4B3}",5e3)}if(e===R&&n.card.target){let o=Qt(n);if(o.projected>o.target)return O(`At this pace your card spending will reach ${V(o.projected,"PLN",0)} this month (target ${V(o.target,"PLN",0)})`,"\u{1F4B3}",6e3)}let s=n.budget.cats[t];if(s){let o=ct(n,U()).byCat[t]||0,i=q(n,t).name;if(o>=s)return O(_.catOver(i),"\u{1F6A8}",5e3);if(o>=s*.8)return O(_.catWarn(i),"\u26A0\uFE0F",5e3)}let a=zt(n);if(a&&a.left<0)return O(`${_.todayOver} ${V(-a.left)}`,"\u26A0\uFE0F",4500);O("Expense saved","\u2713")}function Yo({s:t,edit:e,preset:n,done:s}){let[a,o]=h(e?String(e.amt):n.amt?String(n.amt):""),[i,r]=h(e?e.cat:n.cat||null),[c,u]=h(e?e.from:Fs(t,"exp","from",t.accounts[0]&&t.accounts[0].id)),[d,f]=h(e?e.date:A()),[m,p]=h(e?e.note:n.note||""),$=lt(()=>{let w={};for(let g of t.txns)g.t==="exp"&&(w[g.cat]=(w[g.cat]||0)+1);return[...t.cats.exp].sort((g,b)=>(w[b.id]||0)-(w[g.id]||0))},[t.cats.exp]),v=nt(a)&&i&&c!==void 0,k=()=>{let w={t:"exp",amt:D(a),cat:i,from:c,date:d,note:m};e?(Yt(e.id,w),O("Updated","\u2713")):(At(w),Wo(i,c)),s()};return l`
    <${Se} value=${a} onInput=${o} cur=${W(t,c)} label=${`${_.addExp} \xB7 ${W(t,c)}`} />
    <div class="catgrid" style="margin-bottom:14px">
      ${$.map(w=>l`<button class=${`cat ${i===w.id?"on":""}`} onClick=${()=>{Mt(),r(w.id)}}><span class="e">${w.icon}</span>${w.name}</button>`)}
    </div>
    <${C} label="Paid with"><${ee} s=${t} value=${c} onChange=${u} /><//>
    <${Ce} ...${{date:d,setDate:f,note:m,setNote:p}} />
    <${Ne} edit=${e} ok=${v} onSave=${w=>w?s():k()} />`}function Xo({s:t,edit:e,done:n}){let[s,a]=h(e?String(e.amt):""),[o,i]=h(e?e.cat:"salary"),[r,c]=h(e?e.to:Fs(t,"inc","to",t.accounts[0]&&t.accounts[0].id)),[u,d]=h(e?e.date:A()),[f,m]=h(e?e.note:""),p=nt(s)&&o&&r,$=()=>{let v={t:"inc",amt:D(s),cat:o,to:r,date:u,note:f};e?Yt(e.id,v):At(v),O(e?"Updated":"Income saved","\u2713"),n()};return l`
    <${Se} value=${s} onInput=${a} label=${`${_.addInc} \xB7 ${W(t,r)}`} />
    <${C} label="What kind"><div class="chips">${t.cats.inc.map(v=>l`<button class=${`chip ${o===v.id?"on":""}`} onClick=${()=>i(v.id)}>${v.icon} ${v.name}</button>`)}</div><//>
    <${C} label="Landed in"><${ee} s=${t} value=${r} onChange=${c} card=${!1} /><//>
    <${Ce} ...${{date:u,setDate:d,note:f,setNote:m}} />
    <${Ne} edit=${e} ok=${p} onSave=${v=>v?n():$()} />`}function Jo({s:t,edit:e,preset:n,done:s}){let[a,o]=h(e?String(e.amt):n.amt?String(n.amt):""),[i,r]=h(e&&e.amt2!=null?String(e.amt2):""),[c,u]=h(e?e.from:n.from||t.accounts[0]&&t.accounts[0].id),[d,f]=h(e?e.to:n.to||t.accounts[1]&&t.accounts[1].id),[m,p]=h(e?e.date:A()),[$,v]=h(e?e.note:n.note||""),k=W(t,c),w=W(t,d),g=k!==w,b=nt(a)&&c&&d&&c!==d&&c!==R&&(!g||nt(i)),S=()=>{let P={t:"xfer",amt:D(a),amt2:g?D(i):null,from:c,to:d,date:m,note:$||(d===R?"Card bill paid":"")};e?Yt(e.id,P):At(P),O(d===R?"Card bill payment saved":"Transfer saved","\u2713"),s()};return l`
    <${Se} value=${a} onInput=${o} label=${`${_.addXfer} \xB7 ${k}`} />
    <${C} label="From"><${ee} s=${t} value=${c} onChange=${u} card=${!1} /><//>
    <${C} label="To (pick the card to pay its bill)"><${ee} s=${t} value=${d} onChange=${f} /><//>
    ${g&&l`<${C} label=${`Amount received in ${w}`}><${L} value=${i} onInput=${r} /><//>`}
    <div class="note" style="margin:-4px 4px 12px">Moving money isn't spending. Your totals stay honest.</div>
    <${Ce} ...${{date:m,setDate:p,note:$,setNote:v}} />
    <${Ne} edit=${e} ok=${b} onSave=${P=>P?s():S()} />`}function Hs({s:t,value:e,onChange:n,newName:s,setNewName:a}){return l`<div>
    <div class="chips">
      ${t.friends.map(o=>l`<button class=${`chip ${e===o.id?"on":""}`} onClick=${()=>n(o.id)}>${o.emoji||"\u{1F9D1}"} ${o.name}</button>`)}
      <button class=${`chip ${e==="new"?"on":""}`} onClick=${()=>n("new")}>＋ New person</button>
    </div>
    ${e==="new"&&l`<input class="input" style="margin-top:8px" placeholder="Their name" value=${s} onInput=${o=>a(o.target.value)} />`}
  </div>`}function zs(t,e){if(t!=="new")return t;let n=bt();return G(s=>({...s,friends:[...s.friends,{id:n,name:e.trim(),emoji:"\u{1F9D1}"}]})),n}function Vo({s:t,done:e}){let[n,s]=h(""),[a,o]=h(""),[i,r]=h(2),[c,u]=h(t.friends[0]?t.friends[0].id:"new"),[d,f]=h(""),[m,p]=h("dining"),[$,v]=h(t.accounts[0]&&t.accounts[0].id),[k,w]=h(A()),[g,b]=h(""),S=D(n),P=a?D(a):S/i,N=S-P,y=nt(n)&&Number.isFinite(P)&&P>=0&&N>0&&(c!=="new"||d.trim())&&$,M=()=>{let I=zs(c,d),F=At({t:"exp",amt:P,cat:m,from:$,date:k,note:g||"Split bill (my share)"});At({t:"fout",amt:N,from:$,friend:I,date:k,note:g||"Split bill (their share)",pair:F.id}),O(`Split saved. They owe you ${V(N)}`,"\u2713"),e()};return l`
    <${Se} value=${n} onInput=${s} label="Total bill you paid" />
    <${C} label="Split between"><div class="chips">${[2,3,4,5,6].map(I=>l`<button class=${`chip ${i===I&&!a?"on":""}`} onClick=${()=>{r(I),o("")}}>${I} people</button>`)}</div><//>
    <${C} label="Or my exact share"><${L} value=${a} onInput=${o} placeholder=${Number.isFinite(S)?(S/i).toFixed(2):"0"} /><//>
    <${C} label="Who owes you the rest"><${Hs} ...${{s:t,value:c,onChange:u,newName:d,setNewName:f}} /><//>
    <${C} label="Category"><div class="chips">${t.cats.exp.slice(0,12).map(I=>l`<button class=${`chip ${m===I.id?"on":""}`} onClick=${()=>p(I.id)}>${I.icon} ${I.name}</button>`)}</div><//>
    <${C} label="Paid with"><${ee} s=${t} value=${$} onChange=${v} /><//>
    ${nt(n)&&l`<div class="card" style="padding:12px"><div class="kv"><span>Your share (spending)</span><span>${V(P)}</span><span>They owe you</span><span class="up">${V(N)}</span></div></div>`}
    <${Ce} ...${{date:k,setDate:w,note:g,setNote:b}} />
    <${Ne} ok=${y} onSave=${M} label="Split it" />`}var Ls=[["lend","I lent them","fout","They owe you more"],["borrow","I borrowed","fin","You owe them more"],["repaid","They paid me back","fin","They owe you less"],["repay","I paid them back","fout","You owe them less"]];function Ko({s:t,edit:e,preset:n,done:s}){let[a,o]=h(e?e.kind||(e.t==="fout"?"lend":"borrow"):n.kind||"lend"),[i,r]=h(e?e.friend:n.friend||(t.friends[0]?t.friends[0].id:"new")),[c,u]=h(""),[d,f]=h(e?String(e.amt):n.amt?String(n.amt):""),m=Ls.find(N=>N[0]===a),[p,$]=h(e?m[2]==="fout"?e.from:e.to:null),[v,k]=h(e?e.date:A()),[w,g]=h(e?e.note:""),b=_t(t),S=nt(d)&&(i!=="new"||c.trim()),P=()=>{let N=zs(i,c),y=m[2],M={t:y,kind:a,amt:D(d),friend:N,from:y==="fout"?p:null,to:y==="fin"?p:null,date:v,note:w||m[1]};e?Yt(e.id,M):At(M),O(m[3],"\u{1F91D}"),s()};return l`
    <${Se} value=${d} onInput=${f} label=${_.addFriend} />
    <${C} label="What happened"><div class="chips">${Ls.map(([N,y])=>l`<button class=${`chip ${a===N?"on":""}`} onClick=${()=>o(N)}>${y}</button>`)}</div><//>
    <${C} label="Who"><${Hs} ...${{s:t,value:i,onChange:r,newName:c,setNewName:u}} /><//>
    ${i&&i!=="new"&&l`<div class="note" style="margin:-4px 4px 12px">Right now: ${(()=>{let N=b.get(i)||0;return N>0?`they owe you ${V(N)}`:N<0?`you owe them ${V(-N)}`:"all square"})()}</div>`}
    <${C} label=${m[2]==="fout"?"Money came out of":"Money went into"}><${ee} s=${t} value=${p} onChange=${$} card=${m[2]==="fout"} none /><//>
    <${Ce} ...${{date:v,setDate:k,note:w,setNote:g}} />
    <${Ne} edit=${e} ok=${S} onSave=${N=>N?s():P()} />`}function Rs(){let t=B(),e=Ut(),n=Ye(),s=e.price||Rt(),[a,o]=h("1M"),[i,r]=h(null),[c,u]=h(null);j(()=>{xe().then(u)},[]);let d=Xt(t,s),f=d.avgPremium!=null?d.avgPremium:.1,m=lt(()=>ys(a,n,s),[a,n.length,a==="1D"?e.ticks:Math.round(s||0)]),p=bs(m.pts),$=lt(()=>Xe(n,s,d.avgMarket),[n.length,Math.round((s||0)*2),d.avgMarket]),v=lt(()=>xs(n),[n.length]),k=lt(()=>_s(n),[n.length]),w=lt(()=>ws(n,8).slice(0,6),[n.length]),g=lt(()=>s?kn(n,s,1826):null,[n.length,Math.round(s||0)]),b=e.dayOpen&&s?(s-e.dayOpen)/e.dayOpen*100:null,S=e.at?Math.max(0,Math.round((Date.now()-e.at)/1e3)):null,P=[...v].filter(y=>y.n).sort((y,M)=>y.avg-M.avg).slice(0,3),N=t.gold.goalGrams;return l`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">${_.nGold}</div><div class="hint">${_.goldLive}</div></div>
      <button class=${`iconbtn ${t.gold.alertsOn?"on":""}`} onClick=${()=>r("alerts")}>🔔</button></div>

    <div class="card hero" style="text-align:center">
      <div class="scan" style="background:linear-gradient(to bottom,transparent,rgba(255,201,77,.08),transparent)"></div>
      <div class="label"><span class=${`livedot ${e.price&&!e.err?"":"off"}`}></span>${e.err&&!e.price?"Offline: last known":"Live spot \xB7 z\u0142 per gram"}</div>
      <div class="ticker">${s?T(s):"\u2026"}</div>
      <div class="row" style="justify-content:center;gap:10px;font-size:13px">
        ${b!=null&&l`<span class=${`mono ${b>=0?"up":"down"}`}>${b>=0?"\u25B2":"\u25BC"} ${T(Math.abs(s-e.dayOpen))} (${Nt(b,2)})</span><span class="hint">vs yesterday's NBP price</span>`}
      </div>
      <div class="hint" style="margin-top:6px">${e.usdOz?`$${T(e.usdOz)}/oz \xB7 `:""}${S!=null?`updated ${S}s ago`:"connecting\u2026"} · refreshes every second</div>
      <div class="sep"></div>
      <div class="row between" style="font-size:13px">
        <span class="dim">Shop price estimate<div class="hint">spot + your ${T(f*100,1)}% premium</div></span>
        <span class="mono gold" style="font-weight:800;font-size:18px">${s?T(s*(1+f))+" z\u0142":"\u2026"}</span>
      </div>
    </div>

    ${$&&l`<div class=${`signal ${$.level}`} style="margin-bottom:12px">
      <div class="row between"><b style="font-size:16px">${$.level==="good"?_.buyGood:$.level==="ok"?_.buyOk:_.buyWait}</b></div>
      <div class="gauge"><i style=${{left:`${He(100-($.score+3)/8*100,3,97)}%`}}></i></div>
      <div class="row between hint"><span>Cheap</span><span>Pricey</span></div>
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
        ${$.reasons.map(y=>l`<div style="font-size:13px"><span class=${y.good?"up":y.good===!1?"down":"gold"}>${y.good?"\u2714":y.good===!1?"\u2716":"\u25CF"}</span> ${y.text}</div>`)}
        ${g!=null&&l`<div style="font-size:13px"><span class="cyan">◆</span> Over 5 years, gold was cheaper than today on ${g.toFixed(0)}% of days</div>`}
      </div>
      <div class="note" style="margin-top:8px">Based on price history only. A guide, not financial advice.</div>
    </div>`}

    <div class="card">
      <${It} options=${wn.map(([y])=>[y,y])} value=${a} onChange=${o} />
      <div style="margin-top:10px"><${cs} pts=${m.pts} time=${m.time} color="#a87414" fmt=${y=>T(y)+" z\u0142/g"} refLine=${d.avgMarket||null} /></div>
      ${d.avgMarket?l`<div class="hint"><span class="cyan">- - -</span> market price at your buys (${T(d.avgMarket)} zł) · <span class="up">●</span> low · <span class="down">●</span> high</div>`:l`<div class="hint"><span class="up">●</span> lowest · <span class="down">●</span> highest</div>`}
      ${p&&l`<div class="stat3" style="margin-top:10px">
        <div><div class="l">Low</div><div class="v up">${T(p.lo[1])}</div><div class="d">${Us(p.lo[0],m.time)}</div></div>
        <div><div class="l">High</div><div class="v down">${T(p.hi[1])}</div><div class="d">${Us(p.hi[0],m.time)}</div></div>
        <div><div class="l">Change</div><div class=${`v ${p.change>=0?"up":"down"}`}>${Nt(p.changePct)}</div><div class="d">${a}</div></div>
      </div>`}
      ${a==="1D"&&m.pts.length<5&&l`<div class="note" style="margin-top:8px">The 1-day chart builds while the app is open. Older ranges use the official NBP price.</div>`}
    </div>

    <div class="sect"><span class="h-title">Your gold 🪙</span><button class="more" onClick=${()=>r({buy:{}})}>＋ ${_.boughtGold}</button></div>
    <div class="card">
      ${d.grams?l`
        <div class="row between"><div><div class="hint">You own</div><div class="mono gold" style="font-size:26px;font-weight:700">${T(d.grams,2)} g</div></div>
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
        ${N>0&&l`<div style="margin-top:12px"><div class="row between hint"><span>Goal: ${T(N,0)} g</span><span>${Math.round(d.grams/N*100)}%</span></div><${yt} v=${d.grams/N} cls="gold" /></div>`}
      `:l`<div class="empty"><span class="e">🪙</span>No gold logged yet.<div style="margin-top:12px"><button class="btn goldbtn" onClick=${()=>r({buy:{}})}>${_.boughtGold}</button></div></div>`}
    </div>
    ${t.gold.buys.length>0&&l`<div class="card" style="padding:4px 12px">
      ${[...t.gold.buys].sort((y,M)=>M.date.localeCompare(y.date)).map(y=>{let M=s?(s-y.paid)/y.paid*100:0;return l`<button class="item" onClick=${()=>r({buy:y})}>
          <span class="em">🪙</span>
          <div class="grow"><div class="t1">${T(y.g,2)} g at ${T(y.paid)} zł/g</div><div class="t2">${J(y.date)} · market was ${T(y.market||0)} · premium ${y.market?T((y.paid-y.market)/y.market*100,1)+"%":"\u2014"}</div></div>
          <span class=${`amt mono ${M>=0?"up":"down"}`}>${Nt(M)}</span>
        </button>`})}
    </div>`}

    <div class="sect"><span class="h-title">Gold news</span><button class="more" onClick=${()=>kt("news")}>All news →</button></div>
    <div class="card" style="padding:6px 14px"><${Gs} news=${c} max=${3} /></div>

    <div class="sect"><span class="h-title">When was it cheapest?</span></div>
    ${P.length>0&&l`<div class="card">
      <b>Historically cheaper months</b>
      <div class="hint" style="margin-bottom:8px">How each month's average price compared with its year (${v[0].n} full years of NBP data). Green = cheaper than usual.</div>
      <${ps} rows=${v.map(y=>({v:y.avg,label:Fe(y.m)[0]+Fe(y.m)[1],hl:P.includes(y)}))} />
      <div style="font-size:13px;margin-top:6px">Usually cheapest: ${P.map(y=>l`<span class="tag up" style="margin:2px">${Fe(y.m)} ${Nt(y.avg)}</span>`)}</div>
      <div class="note" style="margin-top:6px">Gold has mostly risen year after year, so early months often look "cheap". Patterns don't always repeat.</div>
    </div>`}
    ${w.length>0&&l`<div class="card">
      <b>Biggest dips: the best times to have bought</b>
      <div class="list" style="margin-top:6px">${w.map(y=>l`<div class="item">
        <span class="em">📉</span>
        <div class="grow"><div class="t1">−${y.pct.toFixed(1)}% ${y.ongoing?l`<span class="tag watch">ongoing</span>`:""}</div>
          <div class="t2">${J(y.peak[0])} ${T(y.peak[1])} → ${J(y.trough[0])} ${T(y.trough[1])} zł</div></div>
      </div>`)}</div>
    </div>`}
    ${k.length>0&&l`<div class="card">
      <b>Lowest & highest price each year</b>
      <div class="list" style="margin-top:6px">${k.map(y=>l`<div class="item" style="padding:8px 2px">
        <span class="mono" style="width:48px;font-weight:700">${y.y}</span>
        <div class="grow t2"><span class="up">▼ ${T(y.lo[1])}</span> ${J(y.lo[0]).replace(" "+y.y,"")} · <span class="down">▲ ${T(y.hi[1])}</span> ${J(y.hi[0]).replace(" "+y.y,"")}</div>
      </div>`)}</div>
      <div class="note">NBP official gold price (zł per gram), since 2013.</div>
    </div>`}

    ${i==="alerts"&&l`<${qo} onClose=${()=>r(null)} price=${s} />`}
    ${i&&i.buy&&l`<${Zo} buy=${i.buy} price=${s} onClose=${()=>r(null)} />`}
  </div>`}var Us=(t,e)=>{let n=new Date(t);return e?n.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):n.toLocaleDateString([],{day:"numeric",month:"short",year:"2-digit"})};function Gs({news:t,max:e=50}){return t?!t.items||!t.items.length?l`<div class="empty" style="padding:16px">No news right now.</div>`:t.items.slice(0,e).map(n=>l`<a class="news" href=${n.link} target="_blank" rel="noopener">
    <div class="row" style="gap:6px;margin-bottom:4px">
      <span class=${`tag ${n.impact}`}>${n.impact==="up"?"\u25B2 may rise":n.impact==="down"?"\u25BC may fall":"\u25CF watch"}</span>
      <span class="hint">${n.source} · ${js(n.date)}</span>
    </div>
    <div style="font-weight:600;font-size:14px">${n.title}</div>
    ${n.why&&l`<div class="hint" style="margin-top:2px">${n.why}</div>`}
  </a>`):l`<div class="empty" style="padding:16px">Loading news…</div>`}var js=t=>{let e=Math.round((Date.now()-Date.parse(t))/6e4);return e<60?`${Math.max(1,e)}m ago`:e<1440?`${Math.round(e/60)}h ago`:`${Math.round(e/1440)}d ago`};function Ws(){let[t,e]=h(null);j(()=>{xe().then(o=>e(o||{items:[]}))},[]);let n=t&&t.items?t.items.filter(o=>o.impact==="up").length:0,s=t&&t.items?t.items.filter(o=>o.impact==="down").length:0,a=n>s*1.3?["up","News leans positive: things that usually push gold up"]:s>n*1.3?["down","News leans negative: things that usually pull gold down"]:["watch","Mixed news"];return l`<div>
    ${t&&t.items&&t.items.length>0&&l`<div class=${`signal ${a[0]==="up"?"good":a[0]==="down"?"wait":"ok"}`} style="margin-bottom:12px">
      <b>${a[1]}</b>
      <div class="row" style="gap:6px;margin-top:8px"><span class="tag up">▲ ${n}</span><span class="tag down">▼ ${s}</span><span class="tag watch">● ${t.items.length-n-s}</span><span class="hint">last ${t.hours||48}h</span></div>
      <div class="note" style="margin-top:6px">Tags are automatic, based on keywords (rate cuts, war, dollar…). News moves gold, but nobody can predict it for sure.</div>
    </div>`}
    <div class="card" style="padding:6px 14px"><${Gs} news=${t} /></div>
    ${t&&t.updated&&l`<div class="hint" style="text-align:center">Updated ${js(t.updated)} · Google News</div>`}
  </div>`}function qo({onClose:t,price:e}){let n=B(),s=n.gold,[a,o]=h(s.below?String(s.below):""),[i,r]=h(null),c=()=>{E("gold",{below:nt(a)?D(a):null}),O("Alerts saved","\u{1F514}")},u=async()=>{r("\u2026");let f=await Je();r(f),f==="ok"&&O("Notifications on \u{1F514}","\u2705")},d={"install-first":"On iPhone, first add the app to your Home Screen (Share \u2192 Add to Home Screen), then open it from there and tap this again.",unsupported:"This browser can't do background alerts.",denied:"Notifications were blocked. Allow them in Settings \u2192 Notifications.","relay-failed":"Saved on the phone but couldn't reach the alert server. I'll retry automatically.","\u2026":"Setting up\u2026"};return l`<${rt} title="🔔 Gold alerts" onClose=${t}>${f=>l`
    <${st} title="Gold alerts" hint="Price drops & big moves"><${dt} on=${s.alertsOn} onChange=${m=>E("gold",{alertsOn:m})} /><//>
    <${C} label="Ping me when price per gram falls below">
      <${L} value=${a} onInput=${o} placeholder=${e?(e*.98).toFixed(0):"480"} />
      ${e&&l`<div class="chips" style="margin-top:8px">${[1,2,3,5].map(m=>l`<button class="chip" onClick=${()=>o((e*(1-m/100)).toFixed(0))}>−${m}% (${(e*(1-m/100)).toFixed(0)})</button>`)}</div>`}
    <//>
    <${C} label="Also alert on a drop within 24h of"><div class="chips">${[1,1.5,2,3,5].map(m=>l`<button class=${`chip gold ${s.dropPct===m?"on":""}`} onClick=${()=>E("gold",{dropPct:m})}>${m}%</button>`)}<button class=${`chip ${s.dropPct?"":"on"}`} onClick=${()=>E("gold",{dropPct:null})}>Off</button></div><//>
    <${st} title="News alerts" hint="Big headlines that could move gold"><${dt} on=${s.newsOn} onChange=${m=>E("gold",{newsOn:m})} /><//>
    <${C} label="Gold goal (grams)"><${L} value=${s.goalGrams?String(s.goalGrams):""} onInput=${m=>E("gold",{goalGrams:D(m)||0})} placeholder="e.g. 10" /><//>
    <div class="card" style="margin-top:6px">
      <b>Alerts when the app is closed</b>
      <div class="note" style="margin:6px 0 10px">${Pt()?"The Android app checks gold in the background about every 15 minutes.":we()?"On iPhone, an online helper checks gold about every 10 minutes and pings you.":"An online helper checks gold about every 10 minutes and pings you."}</div>
      <button class=${`btn block ${n.settings.alertsSetup?"":"primary"}`} onClick=${u}>${n.settings.alertsSetup?"\u2705 Notifications on. Tap to re-check":"\u{1F514} Turn on notifications"}</button>
      ${i&&i!=="ok"&&l`<div class="note warn" style="margin-top:8px">${d[i]||i}</div>`}
    </div>
    <button class="btn primary block" style="margin-top:8px" onClick=${()=>{c(),f()}}>Save</button>
  `}<//>`}function Zo({buy:t,price:e,onClose:n}){let s=B(),a=!!t.id,[o,i]=h(t.date||A()),[r,c]=h(t.g?String(t.g):""),[u,d]=h("pg"),[f,m]=h(t.paid?String(t.paid):""),[p,$]=h(t.market?String(t.market):e?e.toFixed(2):""),[v,k]=h(a&&(s.txns.find(M=>M.id===t.txn)||{}).from||null),[w,g]=h(t.note||"");j(()=>{if(a)return;if(o===A()){e&&$(e.toFixed(2));return}let M=Y.data,I=null;for(let F of M)if(F[0]<=o)I=F;else break;I&&$(String(I[1]))},[o]);let b=D(r),S=u==="pg"?D(f):D(f)/b,P=nt(r)&&Number.isFinite(S)&&S>0,N=P&&nt(p)?(S-D(p))/D(p)*100:null,y=M=>{let I=+(b*S).toFixed(2),F=t.txn;F&&!v?(me(F),F=null):F&&v?Yt(F,{amt:I,from:v,date:o}):!F&&v&&(F=At({t:"gold",amt:I,from:v,date:o,note:`${T(b,2)} g gold`}).id),as({...a?{id:t.id}:{},date:o,g:b,paid:+S.toFixed(2),market:nt(p)?D(p):null,note:w,txn:F}),O(a?"Updated":`${T(b,2)} g gold added`,"\u2713"),M()};return l`<${rt} title=${a?"Edit gold buy":"\u{1FA99} "+_.boughtGold} onClose=${n}>${M=>l`
    <div class="row" style="gap:8px">
      <div style="flex:1"><${C} label="Grams"><${L} value=${r} onInput=${c} autofocus placeholder="1" /><//></div>
      <div style="flex:1"><${C} label="Date"><input class="input" type="date" value=${o} onInput=${I=>i(I.target.value||A())} /><//></div>
    </div>
    <${C} label="What you paid (bought at)">
      <div style="margin-bottom:8px"><${It} options=${[["pg","per gram"],["total","total"]]} value=${u} onChange=${d} /></div>
      <${L} value=${f} onInput=${m} placeholder=${u==="pg"?"544":"1072"} />
    <//>
    <${C} label="Market price per gram that day (actual price)"><${L} value=${p} onInput=${$} /><div class="hint" style="margin:4px">Filled in automatically (live today, NBP for past dates). Change it if your receipt says otherwise.</div><//>
    ${N!=null&&l`<div class="card" style="padding:12px"><div class="kv"><span>Total paid</span><span>${V(b*S)}</span><span>Premium over market</span><span class=${N>12?"down":N>8?"warn":"up"}>${T(N,1)}%</span></div></div>`}
    <${C} label="Paid from (optional, deducts from that account)"><div class="chips">
      ${s.accounts.map(I=>l`<button class=${`chip ${v===I.id?"on":""}`} onClick=${()=>k(I.id)}>${I.icon} ${I.name}</button>`)}
      ${s.card.on&&l`<button class=${`chip ${v==="card"?"on":""}`} onClick=${()=>k("card")}>💳 ${s.card.name}</button>`}
      <button class=${`chip ${v?"":"on"}`} onClick=${()=>k(null)}>Don't deduct</button>
    </div><//>
    <${C} label="Note"><input class="input" value=${w} onInput=${I=>g(I.target.value)} placeholder="shop, coin, bar…" /><//>
    <div class="btns">
      ${a&&l`<button class="btn danger" onClick=${()=>{confirm("Delete this purchase?")&&(t.txn&&me(t.txn),is(t.id),M())}}>Delete</button>`}
      <button class="btn goldbtn grow" disabled=${!P} style=${{opacity:P?1:.4}} onClick=${()=>P&&y(M)}>Save</button>
    </div>
  `}<//>`}var Ve=()=>history.back(),Qo=["\u{1F3E6}","\u{1F512}","\u{1F4B5}","\u{1F4B6}","\u{1FAAA}","\u{1F7E3}","\u{1F7E0}","\u{1F535}","\u{1F437}","\u{1F48E}","\u{1F9E7}","\u{1F3E7}"];function Ys(){let t=B(),n=Ut().price||Rt(),s=Ge(t,n),a=[{label:"Cash & bank",v:Math.max(0,s.cash),color:"#2f6fa3"},{label:"Gold",v:s.gold,color:"#c8963e"},{label:"Owed to you",v:s.fOwedMe,color:"#1f6b57"}].filter(o=>o.v>0);return l`<div class="screen">
    <div class="top"><div class="grow"><div class="h-title">${_.nWealth}</div><div class="hint">Everything you own and owe</div></div></div>
    <div class="card hero">
      <div class="label">${_.netWorth} · ${_.netWorthHint}</div>
      <div class="big"><${x} v=${s.total} /></div>
      <div class="row" style="margin-top:12px;gap:16px">
        <${We} data=${a} size=${120} />
        <div class="legend grow">
          ${a.map(o=>l`<div class="li"><i class="sw" style=${{background:o.color}}></i><span class="grow">${o.label}</span><${x} v=${o.v} d=${0} /></div>`)}
          ${s.card>0&&l`<div class="li"><i class="sw" style="background:#c2392f"></i><span class="grow">Card debt</span><${x} v=${-s.card} d=${0} cls="down" /></div>`}
          ${s.fIOwe>0&&l`<div class="li"><i class="sw" style="background:#c2392f"></i><span class="grow">You owe friends</span><${x} v=${-s.fIOwe} d=${0} cls="down" /></div>`}
        </div>
      </div>
    </div>
    <div class="tiles">
      ${[["\u{1F4B0}",_.accounts,_.accountsHint,"accounts","",l`<${x} v=${s.cash} />`],["\u{1F4B3}",_.card,_.cardHint,"card","",l`<${x} v=${-s.card} />`],["\u{1F91D}",_.friends,_.friendsHint,"friends","",l`<${x} v=${s.fOwedMe-s.fIOwe} sign />`],["\u{1F3AF}",_.goals,_.goalsHint,"goals","",`${t.goals.length} goal${t.goals.length===1?"":"s"}`],["\u{1FA99}",_.nGold,"Live value","gold","",l`<${x} v=${s.gold} />`],["\u{1F54B}",_.zakat,_.zakatHint,"zakat","","Calculate"]].map(([o,i,r,c,u,d])=>l`
        <button class="tile" style=${{"--accent":u}} onClick=${()=>kt(c)}><div class="ic">${o}</div><div><div class="nm">${i}</div><div class="val">${d}</div><div class="hint">${r}</div></div></button>`)}
    </div>
  </div>`}function Xs(){let t=B(),[e,n]=h(null),s=t.accounts.reduce((a,o)=>a+Ht(t,xt(t,o.id),o.cur),0);return l`<div class="screen">
    <${et} title=${_.accounts} hint="Bank accounts, savings & cash" onBack=${Ve} right=${l`<button class="iconbtn" onClick=${()=>n({})}>＋</button>`} />
    <div class="card hero"><div class="label">All together (in zł)</div><div class="big"><${x} v=${s} /></div></div>
    <div class="card" style="padding:4px 12px">
      ${t.accounts.map(a=>{let o=xt(t,a.id);return l`<button class="item" onClick=${()=>n(a)}>
        <span class="em">${a.icon||"\u{1F3E6}"}</span>
        <div class="grow"><div class="t1">${a.name}</div><div class="t2">${pe[a.kind]} · ${a.cur}${a.cur!=="PLN"?` \xB7 \u2248 ${V(Ht(t,o,a.cur))}`:""}</div></div>
        <${x} v=${o} cur=${a.cur} cls=${`amt ${o<0?"down":""}`} />
      </button>`})}
    </div>
    <div class="note" style="padding:0 6px">Tap an account to fix its balance if it doesn't match your banking app. Balances move automatically when you log spending, income and moves.</div>
    <div class="btns" style="margin-top:12px"><button class="btn grow" onClick=${()=>$t.open({mode:"xfer"})}>🔀 Move money</button><button class="btn grow" onClick=${()=>n({})}>＋ Add account</button></div>
    ${e&&l`<${ta} a=${e} onClose=${()=>n(null)} />`}
  </div>`}function ta({a:t,onClose:e}){let n=B(),s=!t.id,[a,o]=h(t.name||""),[i,r]=h(t.icon||"\u{1F3E6}"),[c,u]=h(t.cur||"PLN"),[d,f]=h(t.kind||"bank"),m=s?0:xt(n,t.id),[p,$]=h(s?"":String(+m.toFixed(2))),v=!s&&n.txns.some(w=>w.from===t.id||w.to===t.id),k=w=>{let g=D(p)||0;if(s)G(b=>({...b,accounts:[...b.accounts,{id:bt(),name:a.trim()||"Account",icon:i,cur:c,kind:d,opening:g}]}));else{let b=(t.opening||0)+(g-m);G(S=>({...S,accounts:S.accounts.map(P=>P.id===t.id?{...P,name:a.trim()||P.name,icon:i,cur:c,kind:d,opening:b}:P)}))}O("Saved"),w()};return l`<${rt} title=${s?"New account":"Edit account"} onClose=${e}>${w=>l`
    <${C} label="Name"><input class="input" value=${a} onInput=${g=>o(g.target.value)} placeholder="ING, Revolut, Wallet…" /><//>
    <${C} label="Icon"><div class="chips">${Qo.map(g=>l`<button class=${`chip ${i===g?"on":""}`} onClick=${()=>r(g)}>${g}</button>`)}</div><//>
    <${C} label="Type"><div class="chips">${Object.entries(pe).map(([g,b])=>l`<button class=${`chip ${d===g?"on":""}`} onClick=${()=>f(g)}>${b}</button>`)}</div><//>
    <${C} label="Currency"><div class="chips">${["PLN","EUR","USD","AED","GBP","INR"].map(g=>l`<button class=${`chip ${c===g?"on":""}`} onClick=${()=>u(g)}>${g}</button>`)}</div><//>
    <${C} label=${`Balance right now (${c})`}><${L} value=${p} onInput=${$} /><//>
    <div class="btns">
      ${!s&&l`<button class="btn danger" onClick=${()=>{v&&!confirm("This account has entries. Delete it anyway? Its entries stay in your history.")||!v&&!confirm("Delete this account?")||(ve("accounts",t.id),w())}}>Delete</button>`}
      <button class="btn primary grow" onClick=${()=>k(w)}>Save</button>
    </div>
  `}<//>`}function Js(){let t=B(),[e,n]=h(!1),s=t.card,a=tt(t),o=s.limit-a,i=s.limit?a/s.limit:0,r=le(s.dueDay),c=t.txns.filter(u=>u.from===R||u.to===R).sort((u,d)=>(d.date+d.id).localeCompare(u.date+u.id)).slice(0,30);return l`<div class="screen">
    <${et} title=${_.card} hint=${_.cardHint} onBack=${Ve} right=${l`<button class="iconbtn" onClick=${()=>n(!0)} aria-label="Card settings">⚙️</button>`} />
    <div class="card hero">
      <div class="row between"><b>${s.name}</b><span style="font-size:22px">💳</span></div>
      <div class="label" style="margin-top:12px">Available to spend</div>
      <div class=${`big ${o<0?"down":""}`}><${x} v=${o} /></div>
      <div style="margin:10px 0 6px"><${yt} v=${i} cls=${i>=.8?"hot":""} /></div>
      <div class="row between sub"><span>Owed: <${x} v=${a} /></span><span>Limit: <${x} v=${s.limit} d=${0} /></span></div>
      ${i>=.8&&l`<div class="warn" style="margin-top:8px;font-weight:600">${Math.round(i*100)}% of your limit is used.</div>`}
    </div>
    ${!s.limit&&l`<div class="card tap" onClick=${()=>n(!0)}><b>Set your limit and bill day</b><div class="hint">So the app can warn you before you reach it</div></div>`}

    <${ea} s=${t} onSetTarget=${()=>n(!0)} />

    <div class="stat3" style="margin-top:12px">
      <div><div class="l">Bill due</div><div class="v">${r?J(r):"\u2014"}</div><div class="d">${r?`in ${St(A(),r)} days`:"set a day"}</div></div>
      <div><div class="l">To pay</div><div class="v"><${x} v=${Math.max(0,a)} d=${0} /></div><div class="d">full amount</div></div>
      <div><div class="l">Used</div><div class="v">${s.limit?Math.round(i*100)+"%":"\u2014"}</div><div class="d">of limit</div></div>
    </div>
    <button class="btn primary block" style="margin-top:12px" disabled=${a<=0} onClick=${()=>$t.open({mode:"xfer",preset:{to:R,amt:+a.toFixed(2)}})}>Pay the card bill</button>
    <div class="note" style="padding:8px 6px">Paying the bill moves money from your bank to the card. It isn't counted as spending again, because each purchase already was.</div>
    <div class="sect"><span class="h-title">Card activity</span></div>
    <div class="card" style="padding:4px 12px">${c.length?c.map(u=>l`<${te} t=${u} s=${t} key=${u.id} />`):l`<${Ot} e="💳" text="Nothing on the card yet." />`}</div>
    ${e&&l`<${sa} onClose=${()=>n(!1)} />`}
  </div>`}function ea({s:t,onSetTarget:e}){let n=Qt(t),s=Ct(n.ym).split(" ")[0],a=n.target||0,o=a&&n.projected>a;return l`<div class="card">
    <div class="row between"><b>Month-end projection</b><span class="hint">${Ct(n.ym,!0)}</span></div>
    <div class="hint" style="margin-top:2px">If you keep spending on the card at the same pace</div>
    <div class=${`mono ${o?"down":""}`} style="font-size:32px;font-weight:700;margin:10px 0 2px"><${x} v=${n.projected} d=${0} /></div>
    <div class="hint">expected card spending by ${n.dim} ${s}</div>
    <${na} p=${n} />
    <div class="kv" style="margin-top:6px">
      <span>Spent on card (1–${n.day} ${s})</span><${x} v=${n.spent} />
      <span>Daily average (÷ ${n.day} day${n.day===1?"":"s"})</span><${x} v=${n.perDay} />
      <span>Days left in month</span><span>${n.daysLeft}</span>
      <span>Expected in remaining days</span><${x} v=${n.extra} />
      <span class="total">Projected month total</span><span class="total"><${x} v=${n.projected} /></span>
    </div>
    ${a?l`<div class=${`callout ${o?"bad":"good"}`} style="margin-top:12px">
      ${o?l`<b>Over your target by <${x} v=${n.projected-a} d=${0} /></b><div style="margin-top:4px">Target <${x} v=${a} d=${0} />. ${n.safePerDay!=null?l`To stay within it, keep card spending under <b><${x} v=${n.safePerDay} d=${0} /> a day</b> for the next ${n.daysLeft} days.`:""}${n.spent>=a?" You have already reached it. Try to stop using the card this month.":""}</div>`:l`<b>On track</b><div style="margin-top:4px">Target <${x} v=${a} d=${0} />. ${n.safePerDay!=null?l`You can spend up to <b><${x} v=${n.safePerDay} d=${0} /> a day</b> on the card and stay within it.`:""}</div>`}
    </div>`:l`<button class="btn block" style="margin-top:12px" onClick=${e}>Set a monthly card target</button>`}
    ${t.card.limit>0&&n.owedEnd>t.card.limit&&l`<div class="callout bad" style="margin-top:8px">At this pace you would owe <b><${x} v=${n.owedEnd} d=${0} /></b> by month end, over your <${x} v=${t.card.limit} d=${0} /> limit.</div>`}
  </div>`}function na({p:t}){let a=0,o=t.days.slice(0,t.day).map(d=>a+=d),i=Math.max(t.projected,t.target||0,1)*1.08,r=d=>4+d/t.dim*312,c=d=>106-d/i*102,u=[`M${r(0)},${c(0)}`,...o.map((d,f)=>`L${r(f+1).toFixed(1)},${c(d).toFixed(1)}`)].join("");return l`<svg viewBox=${"0 0 320 124"} class="chart" style="height:124px;margin-top:10px">
    ${t.target?l`<line x1=${4} x2=${316} y1=${c(t.target)} y2=${c(t.target)} stroke="#b86e00" stroke-dasharray="3 3" />
      <text x=${316} y=${c(t.target)-4} text-anchor="end" font-size="10" fill="#b86e00">target</text>`:""}
    <line x1=${r(t.day)} x2=${r(t.dim)} y1=${c(t.spent)} y2=${c(t.projected)} stroke="#8d8c85" stroke-width="2" stroke-dasharray="5 4" />
    <path d=${u} fill="none" stroke="#1f6b57" stroke-width="2.5" stroke-linejoin="round" />
    <circle cx=${r(t.day)} cy=${c(t.spent)} r="3.5" fill="#1f6b57" />
    <circle cx=${r(t.dim)} cy=${c(t.projected)} r="3.5" fill="#8d8c85" />
    <text x=${4} y=${122} font-size="10" fill="#8d8c85">1</text>
    <text x=${r(t.day)} y=${122} font-size="10" fill="#8d8c85" text-anchor="middle">today</text>
    <text x=${316} y=${122} font-size="10" fill="#8d8c85" text-anchor="end">${t.dim}</text>
  </svg>
  <div class="hint"><span style="color:#1f6b57">━</span> actual · <span>┅</span> projected${t.target?" \xB7 ":""}${t.target?l`<span class="warn">┅ target</span>`:""}</div>`}function sa({onClose:t}){let e=B(),n=e.card,s=tt(e),[a,o]=h(n.name),[i,r]=h(n.limit?String(n.limit):""),[c,u]=h(String(+s.toFixed(2))),[d,f]=h(n.dueDay?String(n.dueDay):""),[m,p]=h(n.target?String(n.target):"");return l`<${rt} title="Card settings" onClose=${t}>${$=>l`
    <${st} title="I have a credit card"><${dt} on=${n.on} onChange=${v=>E("card",{on:v})} /><//>
    <${C} label="Card name"><input class="input" value=${a} onInput=${v=>o(v.target.value)} /><//>
    <${C} label="Credit limit (zł)"><${L} value=${i} onInput=${r} placeholder="5000" /><//>
    <${C} label="Amount owed right now (zł)"><${L} value=${c} onInput=${u} /><//>
    <${C} label="Bill payment day of month"><${L} value=${d} onInput=${f} placeholder="e.g. 25" /><//>
    <${C} label="Monthly card spending target (zł, optional)"><${L} value=${m} onInput=${p} placeholder="e.g. 1500" /><div class="hint" style="margin:4px">The projection warns you when your pace would go over this.</div><//>
    <${st} title="Bill reminders" hint="3 days before, 1 day before & on the day"><${dt} on=${e.settings.cardRemind} onChange=${v=>E("settings",{cardRemind:v})} /><//>
    <button class="btn primary block" onClick=${()=>{let v=D(c)||0;E("card",{name:a.trim()||"Credit card",limit:D(i)||0,target:D(m)||0,opening:(n.opening||0)+(v-s),dueDay:Math.min(31,Math.max(0,Math.round(D(d)||0)))}),O("Card saved"),$()}}>Save</button>
  `}<//>`}function Vs(){let t=B(),[e,n]=h(null),s=_t(t),a=[...s.values()].filter(r=>r>0).reduce((r,c)=>r+c,0),o=-[...s.values()].filter(r=>r<0).reduce((r,c)=>r+c,0),i=[...t.friends].sort((r,c)=>Math.abs(s.get(c.id)||0)-Math.abs(s.get(r.id)||0));return l`<div class="screen">
    <${et} title=${_.friends} hint="Who owes who" onBack=${Ve} right=${l`<button class="iconbtn" onClick=${()=>$t.open({mode:"friend"})}>＋</button>`} />
    <div class="stat3" style="grid-template-columns:1fr 1fr;margin-bottom:12px">
      <div><div class="l">Owed to you</div><div class="v up" style="font-size:18px"><${x} v=${a} /></div></div>
      <div><div class="l">You owe</div><div class="v down" style="font-size:18px"><${x} v=${o} /></div></div>
    </div>
    <div class="card" style="padding:4px 12px">
      ${i.length?i.map(r=>{let c=s.get(r.id)||0;return l`<button class="item" onClick=${()=>n(r)}>
        <span class="em">${r.emoji||"\u{1F9D1}"}</span>
        <div class="grow"><div class="t1">${r.name}</div><div class="t2">${c>0?"owes you":c<0?"you owe them":"all square \u2728"}</div></div>
        <${x} v=${Math.abs(c)} cls=${`amt ${c>0?"up":c<0?"down":"dim"}`} />
      </button>`}):l`<${Ot} e="🤝" text="Nobody owes anybody." />`}
    </div>
    <div class="btns" style="margin-top:12px"><button class="btn grow" onClick=${()=>$t.open({mode:"friend"})}>🤝 Lend / borrow</button><button class="btn grow" onClick=${()=>$t.open({mode:"split"})}>🍕 Split a bill</button></div>
    ${e&&l`<${oa} f=${e} onClose=${()=>n(null)} />`}
  </div>`}function oa({f:t,onClose:e}){let n=B(),s=_t(n).get(t.id)||0,[a,o]=h(t.name),i=n.txns.filter(c=>c.friend===t.id).sort((c,u)=>(u.date+u.id).localeCompare(c.date+c.id)),r=i.length?St(i[i.length-1].date,A()):0;return l`<${rt} title=${`${t.emoji||"\u{1F9D1}"} ${t.name}`} onClose=${e}>${c=>l`
    <div class="card" style="text-align:center">
      <div class="hint">${s>0?"Owes you":s<0?"You owe them":"All square"}</div>
      <div class=${`mono ${s>0?"up":s<0?"down":""}`} style="font-size:28px;font-weight:700"><${x} v=${Math.abs(s)} /></div>
      ${s!==0&&r>0&&l`<div class="hint">open for ${r} days</div>`}
    </div>
    <div class="btns" style="margin-bottom:12px">
      ${s>0&&l`<button class="btn primary grow" onClick=${()=>{c(),setTimeout(()=>$t.open({mode:"friend",preset:{kind:"repaid",friend:t.id,amt:+s.toFixed(2)}}),50)}}>They paid me back</button>`}
      ${s<0&&l`<button class="btn primary grow" onClick=${()=>{c(),setTimeout(()=>$t.open({mode:"friend",preset:{kind:"repay",friend:t.id,amt:+(-s).toFixed(2)}}),50)}}>I paid them back</button>`}
      <button class="btn grow" onClick=${()=>{c(),setTimeout(()=>$t.open({mode:"friend",preset:{friend:t.id}}),50)}}>＋ New entry</button>
    </div>
    <div class="card" style="padding:4px 12px">${i.length?i.map(u=>l`<${te} t=${u} s=${n} key=${u.id} />`):l`<div class="empty">No history</div>`}</div>
    <${C} label="Name"><input class="input" value=${a} onInput=${u=>o(u.target.value)} onBlur=${()=>a.trim()&&G(u=>({...u,friends:u.friends.map(d=>d.id===t.id?{...d,name:a.trim()}:d)}))} /><//>
    <button class="btn danger block" onClick=${()=>{confirm(`Remove ${t.name} and all their entries?`)&&(G(u=>({...u,friends:u.friends.filter(d=>d.id!==t.id),txns:u.txns.filter(d=>d.friend!==t.id)})),c())}}>Remove person</button>
  `}<//>`}var aa=["\u{1F3AF}","\u{1F4BB}","\u{1F4F1}","\u2708\uFE0F","\u{1F697}","\u{1F3E0}","\u{1F48D}","\u{1F54B}","\u{1F393}","\u{1FA99}","\u{1F45F}","\u{1F6E1}\uFE0F"];function Ks(){let t=B(),[e,n]=h(null),[s,a]=h(null);return l`<div class="screen">
    <${et} title=${_.goals} hint="Savings goals" onBack=${Ve} right=${l`<button class="iconbtn" onClick=${()=>n({})}>＋</button>`} />
    ${t.goals.length?t.goals.map(o=>{let i=o.target?o.saved/o.target:0,r=o.target-o.saved,c=o.by?Math.max(1,Math.round(St(A(),o.by)/30.4)):null;return l`<div class="card tap" onClick=${()=>a(o)}>
        <div class="row"><span style="font-size:30px">${o.emoji}</span>
          <div class="grow"><b>${o.name}</b><div class="hint">${o.by?`by ${J(o.by)}`:"no deadline"}${c&&r>0?` \xB7 ${V(r/c,"PLN",0)}/month needed`:""}</div></div>
          <button class="iconbtn" onClick=${u=>{u.stopPropagation(),n(o)}}>✏️</button></div>
        <div style="margin:12px 0 6px"><${yt} v=${i} cls=${i>=1?"ok":""} /></div>
        <div class="row between"><span><${x} v=${o.saved} d=${0} /> of <${x} v=${o.target} d=${0} /></span><b class=${i>=1?"up":"pink"}>${i>=1?"Done":Math.round(i*100)+"%"}</b></div>
      </div>`}):l`<${Ot} e="🎯" text="Saving it for something special? Add a goal." />`}
    <button class="btn primary block" onClick=${()=>n({})}>＋ New goal</button>
    ${e&&l`<${ia} g=${e} onClose=${()=>n(null)} />`}
    ${s&&l`<${ra} g=${s} onClose=${()=>a(null)} />`}
  </div>`}function ia({g:t,onClose:e}){let[n,s]=h(t.name||""),[a,o]=h(t.emoji||"\u{1F3AF}"),[i,r]=h(t.target?String(t.target):""),[c,u]=h(t.saved?String(t.saved):""),[d,f]=h(t.by||"");return l`<${rt} title=${t.id?"Edit goal":"New goal"} onClose=${e}>${m=>l`
    <${C} label="What for"><input class="input" value=${n} onInput=${p=>s(p.target.value)} placeholder="New laptop, Umrah, car…" /><//>
    <${C} label="Icon"><div class="chips">${aa.map(p=>l`<button class=${`chip ${a===p?"on":""}`} onClick=${()=>o(p)}>${p}</button>`)}</div><//>
    <div class="row" style="gap:8px"><div class="grow"><${C} label="Target (zł)"><${L} value=${i} onInput=${r} /><//></div><div class="grow"><${C} label="Saved so far"><${L} value=${c} onInput=${u} /><//></div></div>
    <${C} label="Deadline (optional)"><input class="input" type="date" value=${d} onInput=${p=>f(p.target.value)} /><//>
    <div class="btns">
      ${t.id&&l`<button class="btn danger" onClick=${()=>{confirm("Delete goal?")&&(ve("goals",t.id),m())}}>Delete</button>`}
      <button class="btn primary grow" disabled=${!n.trim()||!nt(i)} onClick=${()=>{$e("goals",{...t.id?{id:t.id}:{},name:n.trim(),emoji:a,target:D(i),saved:D(c)||0,by:d}),m()}}>Save</button>
    </div>
  `}<//>`}function ra({g:t,onClose:e}){let[n,s]=h("");return l`<${rt} title=${`${t.emoji} ${t.name}`} onClose=${e}>${a=>l`
    <div class="amount"><div class="cur">Put some in (or take out with −)</div><${L} cls="" value=${n} onInput=${s} autofocus /></div>
    <div class="note" style="margin-bottom:10px">This only tracks progress. To actually move money into savings, use "Move money".</div>
    <button class="btn primary block" disabled=${!Number.isFinite(D(n))} onClick=${()=>{$e("goals",{id:t.id,saved:Math.max(0,(t.saved||0)+D(n))}),O("Goal updated","\u2713"),a()}}>Add to goal</button>
  `}<//>`}var Ke=()=>history.back();function qs({s:t,ms:e,max:n=8}){let s=Object.entries(e.byCat).sort((i,r)=>r[1]-i[1]);if(!s.length)return l`<${Ot} text=${_.empty} />`;let a=s.slice(0,n).map(([i,r],c)=>({id:i,v:r,color:fe[c%fe.length]})),o=s.slice(n).reduce((i,r)=>i+r[1],0);return o&&a.push({id:"rest",v:o,color:"#555"}),l`<div class="row" style="gap:14px;align-items:center">
    <${We} data=${a} size=${130} center=${["SPENT",t.settings.privacy?"\u2022\u2022\u2022\u2022":T(e.spend,0)]} />
    <div class="legend grow">${a.map(i=>l`<div class="li"><i class="sw" style=${{background:i.color}}></i><span class="grow" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.id==="rest"?"Other":`${q(t,i.id).icon} ${q(t,i.id).name}`}</span><span class="mono dim" style="font-size:12px">${Math.round(i.v/e.spend*100)}%</span></div>`)}</div>
  </div>`}function Zs(){let t=B(),e=ct(t,U()),n=zt(t),[s,a]=h(t.budget.monthly?String(t.budget.monthly):""),[o,i]=h(null),r=Object.entries(t.budget.cats).filter(([,c])=>c>0);return l`<div class="screen">
    <${et} title=${_.budget} hint="Monthly limit & category limits" onBack=${Ke} />
    <div class="card">
      <${C} label="My monthly spending limit (zł)">
        <div class="row"><${L} value=${s} onInput=${a} placeholder="e.g. 4000" /><button class="btn primary" onClick=${()=>{E("budget",{monthly:D(s)||0}),O("Monthly limit saved")}}>Set</button></div>
      <//>
      ${n&&l`<div class="kv" style="margin-top:6px">
        <span>Spent this month</span><${x} v=${e.spend} />
        <span>Left this month</span><${x} v=${n.monthLeft} cls=${n.monthLeft<0?"down":"up"} />
        <span>Daily allowance (${n.daysLeft} days left)</span><${x} v=${n.allowance} />
      </div>
      <div style="margin-top:10px"><${yt} v=${e.spend/n.budget} cls=${e.spend>n.budget?"hot":""} /></div>`}
      <div class="note" style="margin-top:8px">Your daily limit = money left this month ÷ days left. Spend less today and tomorrow's limit grows.</div>
    </div>
    <div class="sect"><span class="h-title">This month by category</span></div>
    <div class="card"><${qs} s=${t} ms=${e} /></div>
    <div class="sect"><span class="h-title">Category limits</span><button class="more" onClick=${()=>i("pick")}>＋ Add limit</button></div>
    <div class="card" style="padding:6px 14px">
      ${r.length?r.map(([c,u])=>{let d=e.byCat[c]||0,f=d/u,m=q(t,c);return l`<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)" onClick=${()=>i(c)}>
          <div class="row between" style="margin-bottom:6px"><span>${m.icon} ${m.name}</span><span class="mono" style="font-size:13px"><span class=${f>=1?"down":f>=.8?"warn":""}>${t.settings.privacy?"\u2022\u2022":T(d,0)}</span> / ${t.settings.privacy?"\u2022\u2022":T(u,0)}</span></div>
          <${yt} v=${f} cls=${f>=1||f>=.8?"hot":"ok"} />
        </div>`}):l`<div class="empty" style="padding:16px">No limits yet. E.g. Dining out max 400 zł. I'll warn you at 80%.</div>`}
    </div>
    ${o&&l`<${la} id=${o} onClose=${()=>i(null)} />`}
  </div>`}function la({id:t,onClose:e}){let n=B(),[s,a]=h(t==="pick"?null:t),[o,i]=h(s&&n.budget.cats[s]?String(n.budget.cats[s]):"");return l`<${rt} title="Category limit" onClose=${e}>${r=>l`
    ${t==="pick"&&l`<div class="catgrid" style="margin-bottom:12px">${n.cats.exp.map(c=>l`<button class=${`cat ${s===c.id?"on":""}`} onClick=${()=>{a(c.id),i(n.budget.cats[c.id]?String(n.budget.cats[c.id]):"")}}><span class="e">${c.icon}</span>${c.name}</button>`)}</div>`}
    ${s&&l`<${C} label=${`${q(n,s).name}: max per month (z\u0142)`}><${L} value=${o} onInput=${i} autofocus /><//>`}
    <div class="btns">
      ${t!=="pick"&&l`<button class="btn danger" onClick=${()=>{let c={...n.budget.cats};delete c[s],E("budget",{cats:c}),r()}}>Remove</button>`}
      <button class="btn primary grow" disabled=${!s||!nt(o)} onClick=${()=>{E("budget",{cats:{...n.budget.cats,[s]:D(o)}}),r()}}>Save</button>
    </div>
  `}<//>`}function Qs(){let t=B(),[e,n]=h(null),s=je(t,35),a=t.recurring.filter(o=>!o.paused).reduce((o,i)=>o+i.amt,0);return l`<div class="screen">
    <${et} title=${_.bills} hint="Rent, phone, subscriptions: added automatically" onBack=${Ke} right=${l`<button class="iconbtn" onClick=${()=>n({})}>＋</button>`} />
    <div class="card hero"><div class="label">Fixed costs every month</div><div class="big"><${x} v=${a} /></div><div class="sub">${t.recurring.length} repeating bill${t.recurring.length===1?"":"s"}</div></div>
    <div class="sect"><span class="h-title">Coming up 📅</span></div>
    <div class="card" style="padding:4px 12px">
      ${s.length?s.map(o=>{let i=St(A(),o.date);return l`<div class="item">
        <span class="em">${o.icon}</span>
        <div class="grow"><div class="t1">${o.name}</div><div class="t2">${J(o.date)} · ${i===0?"today":`in ${i} day${i===1?"":"s"}`}${o.kind==="card"?" \xB7 pay manually":" \xB7 auto-added"}</div></div>
        <${x} v=${o.amt} cur=${o.cur} cls=${`amt ${i<=3?"warn":""}`} />
      </div>`}):l`<div class="empty" style="padding:16px">Nothing due in the next 5 weeks</div>`}
    </div>
    <div class="sect"><span class="h-title">Your repeating bills</span></div>
    <div class="card" style="padding:4px 12px">
      ${t.recurring.length?t.recurring.map(o=>l`<button class="item" onClick=${()=>n(o)} style=${{opacity:o.paused?.5:1}}>
        <span class="em">${q(t,o.cat).icon}</span>
        <div class="grow"><div class="t1">${o.name}</div><div class="t2">every month on day ${o.day}${o.paused?" \xB7 paused":""}</div></div>
        <${x} v=${o.amt} cur=${W(t,o.from)} cls="amt" />
      </button>`):l`<${Ot} e="🔁" text="Add rent, phone, gym… they'll log themselves every month." />`}
    </div>
    ${e&&l`<${ca} r=${e} onClose=${()=>n(null)} />`}
  </div>`}function ca({r:t,onClose:e}){let n=B(),[s,a]=h(t.name||""),[o,i]=h(t.amt?String(t.amt):""),[r,c]=h(t.cat||"rent"),[u,d]=h(t.from||n.accounts[0]&&n.accounts[0].id),[f,m]=h(t.day?String(t.day):""),[p,$]=h(!!t.paused),v=Math.round(D(f)),k=s.trim()&&nt(o)&&v>=1&&v<=31;return l`<${rt} title=${t.id?"Edit bill":"New repeating bill"} onClose=${e}>${w=>l`
    <${C} label="Name"><input class="input" value=${s} onInput=${g=>a(g.target.value)} placeholder="Rent, Play, Netflix, Gym…" /><//>
    <div class="row" style="gap:8px"><div class="grow"><${C} label="Amount"><${L} value=${o} onInput=${i} /><//></div><div style="flex:0 0 40%"><${C} label="Day of month"><${L} value=${f} onInput=${m} placeholder="1–31" /><//></div></div>
    <${C} label="Category"><div class="chips">${n.cats.exp.map(g=>l`<button class=${`chip ${r===g.id?"on":""}`} onClick=${()=>c(g.id)}>${g.icon} ${g.name}</button>`)}</div><//>
    <${C} label="Paid with"><div class="chips">
      ${n.accounts.map(g=>l`<button class=${`chip ${u===g.id?"on":""}`} onClick=${()=>d(g.id)}>${g.icon} ${g.name}</button>`)}
      ${n.card.on&&l`<button class=${`chip ${u===R?"on":""}`} onClick=${()=>d(R)}>💳 ${n.card.name}</button>`}
    </div><//>
    ${t.id&&l`<${st} title="Paused" hint="Stop adding it for now"><${dt} on=${p} onChange=${$} /><//>`}
    <div class="btns">
      ${t.id&&l`<button class="btn danger" onClick=${()=>{confirm("Delete this bill? Past entries stay.")&&(ve("recurring",t.id),w())}}>Delete</button>`}
      <button class="btn primary grow" disabled=${!k} onClick=${()=>{$e("recurring",{...t.id?{id:t.id}:{last:rs(v)},name:s.trim(),amt:D(o),cat:r,from:u,day:v,paused:p}),O(t.id?"Bill updated":"Added. It'll log itself every month \u{1F501}","\u2705"),w()}}>Save</button>
    </div>
  `}<//>`}function to(){let t=B(),e=[],n=U(),s=t.txns.reduce((i,r)=>vt(r.date)<i?vt(r.date):i,U());for(let i=0;i<24&&n>=s;i++)e.push(ct(t,n)),n=ht(n);let a=[...e].slice(0,12).reverse().map(i=>({a:i.income,b:i.spend,label:Ct(i.ym).slice(0,3)})),o=e.length?e.reduce((i,r)=>i+r.spend,0)/e.length:0;return l`<div class="screen">
    <${et} title=${_.history} hint="Month by month" onBack=${Ke} />
    <div class="card"><${ds} rows=${a} /><div class="hint"><span class="up">■</span> income <span class="pink">■</span> spending · average spend <${x} v=${o} d=${0} />/month</div></div>
    <div class="card" style="padding:4px 12px">
      ${e.map(i=>l`<button class="item" onClick=${()=>{location.hash="#/summary/"+i.ym}}>
        <span class="em">📅</span>
        <div class="grow"><div class="t1">${Ct(i.ym,!0)}</div><div class="t2">in <${x} v=${i.income} d=${0} /> · out <${x} v=${i.spend} d=${0} />${i.saved?l` · saved <${x} v=${i.saved} d=${0} />`:""}</div></div>
        <${x} v=${i.net} sign d=${0} cls=${`amt ${i.net>=0?"up":"down"}`} />
      </button>`)}
    </div>
  </div>`}function eo({ym:t}){let e=B(),[n,s]=h(t||U()),a=ct(e,n),o=ct(e,ht(n)),i=e.txns.filter(v=>v.t==="exp"&&vt(v.date)===n),r=i.reduce((v,k)=>!v||gt(e,k)>gt(e,v)?k:v,null),c=n===U()?Number(A().slice(8)):Ft(n),u=new Set(i.map(v=>v.date)).size,d=Math.max(0,c-u),f=a.income?(a.income-a.spend)/a.income*100:null,m=Object.entries(a.byCat).sort((v,k)=>k[1]-v[1]).slice(0,3),p=Object.keys({...a.byCat,...o.byCat}).map(v=>({id:v,now:a.byCat[v]||0,before:o.byCat[v]||0})).filter(v=>v.before>0||v.now>0).map(v=>({...v,d:v.now-v.before})).sort((v,k)=>Math.abs(k.d)-Math.abs(v.d)).slice(0,5),$=a.spend?a.net>0&&f>20?`Great month. You kept ${T(f,0)}% of your income.`:a.net>0?"You spent less than you earned.":"You spent more than you earned this month.":"No spending recorded this month.";return l`<div class="screen">
    <${et} title=${_.summary} hint="Month summary" onBack=${Ke} />
    <div class="row between" style="margin:0 2px 12px">
      <button class="iconbtn" onClick=${()=>s(ht(n))}>‹</button>
      <div class="h-big" style="font-size:16px">${Ct(n,!0)}</div>
      <button class="iconbtn" onClick=${()=>n<U()&&s(Tt(n))} style=${{opacity:n>=U()?.3:1}}>›</button>
    </div>
    <div class="card"><div class="h-big" style="font-size:17px;line-height:1.3">${$}</div></div>
    <div class="stat3">
      <div><div class="l">Spent</div><div class="v"><${x} v=${a.spend} d=${0} /></div><div class="d">${o.spend?Nt((a.spend-o.spend)/o.spend*100,0)+" vs last":""}</div></div>
      <div><div class="l">Came in</div><div class="v up"><${x} v=${a.income} d=${0} /></div></div>
      <div><div class="l">Saved</div><div class="v cyan"><${x} v=${a.saved} d=${0} /></div><div class="d">${f!=null?`${T(f,0)}% kept`:""}</div></div>
    </div>
    <div class="card" style="margin-top:12px"><div class="kv">
      <span>Daily average</span><${x} v=${a.spend/c} />
      <span>No-spend days</span><span>${d} / ${c}</span>
      <span>Biggest expense</span><span>${r?l`<${x} v=${gt(e,r)} /> <span class="hint">${q(e,r.cat).icon}</span>`:"\u2014"}</span>
      <span>On the card</span><${x} v=${a.card} />
    </div></div>
    ${m.length>0&&l`<div class="sect"><span class="h-title">Top 3 categories</span></div>
    <div class="card">${m.map(([v,k],w)=>l`<div class="row" style="padding:6px 0"><span class="mute" style="width:22px;font-weight:700">${w+1}</span><span class="grow">${q(e,v).icon} ${q(e,v).name}</span><${x} v=${k} /></div>`)}</div>`}
    ${p.length>0&&o.spend>0&&l`<div class="sect"><span class="h-title">vs ${Ct(ht(n))}</span></div>
    <div class="card">${p.map(v=>l`<div class="row" style="padding:6px 0"><span class="grow">${q(e,v.id).icon} ${q(e,v.id).name}</span>
      <span class=${`mono ${v.d>0?"down":"up"}`} style="font-size:13px">${v.d>0?"\u25B2":"\u25BC"} ${e.settings.privacy?"\u2022\u2022":T(Math.abs(v.d),0)} zł${v.before?` (${Nt(v.d/v.before*100,0)})`:" (new)"}</span></div>`)}</div>`}
    <div class="sect"><span class="h-title">Breakdown</span></div>
    <div class="card"><${qs} s=${e} ms=${a} /></div>
  </div>`}var no=new TextEncoder,da=(()=>{let t=new Uint32Array(256);for(let e=0;e<256;e++){let n=e;for(let s=0;s<8;s++)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n>>>0}return t})(),pa=t=>{let e=4294967295;for(let n=0;n<t.length;n++)e=da[(e^t[n])&255]^e>>>8;return(e^4294967295)>>>0};function ua(t){let e=[],n=[],s=0;for(let[u,d]of t){let f=no.encode(d),m=no.encode(u),p=pa(f),$=new DataView(new ArrayBuffer(30));$.setUint32(0,67324752,!0),$.setUint16(4,20,!0),$.setUint16(6,2048,!0),$.setUint16(8,0,!0),$.setUint32(14,p,!0),$.setUint32(18,f.length,!0),$.setUint32(22,f.length,!0),$.setUint16(26,m.length,!0),e.push(new Uint8Array($.buffer),m,f);let v=new DataView(new ArrayBuffer(46));v.setUint32(0,33639248,!0),v.setUint16(4,20,!0),v.setUint16(6,20,!0),v.setUint16(8,2048,!0),v.setUint32(16,p,!0),v.setUint32(20,f.length,!0),v.setUint32(24,f.length,!0),v.setUint16(28,m.length,!0),v.setUint32(42,s,!0),n.push(new Uint8Array(v.buffer),m),s+=30+m.length+f.length}let a=n.reduce((u,d)=>u+d.length,0),o=new DataView(new ArrayBuffer(22));o.setUint32(0,101010256,!0),o.setUint16(8,t.length,!0),o.setUint16(10,t.length,!0),o.setUint32(12,a,!0),o.setUint32(16,s,!0);let i=[...e,...n,new Uint8Array(o.buffer)],r=new Uint8Array(i.reduce((u,d)=>u+d.length,0)),c=0;for(let u of i)r.set(u,c),c+=u.length;return r}var so=t=>String(t).replace(/[<>&"]/g,e=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"})[e]).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,""),ma=t=>{let e="";for(t++;t;){let n=(t-1)%26;e=String.fromCharCode(65+n)+e,t=Math.floor((t-1)/26)}return e};function $a(t){let e=t.map((s,a)=>`<row r="${a+1}">${s.map((o,i)=>{let r=ma(i)+(a+1);return o==null||o===""?"":typeof o=="number"&&Number.isFinite(o)?`<c r="${r}"${a===0?' s="1"':""}><v>${Math.round(o*100)/100}</v></c>`:`<c r="${r}" t="inlineStr"${a===0?' s="1"':""}><is><t xml:space="preserve">${so(o)}</t></is></c>`}).join("")}</row>`).join("");return`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${t[0]?`<cols>${t[0].map((s,a)=>`<col min="${a+1}" max="${a+1}" width="${a===0?14:18}" customWidth="1"/>`).join("")}</cols>`:""}<sheetData>${e}</sheetData></worksheet>`}function oo(t){let e=t.map(s=>s.name.replace(/[\\/?*[\]:]/g,"").slice(0,31)),n=[["[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${e.map((s,a)=>`<Override PartName="/xl/worksheets/sheet${a+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`],["_rels/.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],["xl/workbook.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${e.map((s,a)=>`<sheet name="${so(s)}" sheetId="${a+1}" r:id="rId${a+1}"/>`).join("")}</sheets></workbook>`],["xl/_rels/workbook.xml.rels",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${e.map((s,a)=>`<Relationship Id="rId${a+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${a+1}.xml"/>`).join("")}<Relationship Id="rId${e.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],["xl/styles.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>'],...t.map((s,a)=>[`xl/worksheets/sheet${a+1}.xml`,$a(s.rows)])];return ua(n)}var Pe=()=>history.back();function io(){let t=B(),n=Ut().price||Rt(),[s,a]=h(null),[o,i]=h(!1);j(()=>{Vt().then(()=>ks()).then(H=>{a(H),i(!0)})},[]);let r=t.zakat,[c,u]=h(r.other?String(r.other):""),[d,f]=h(r.debts?String(r.debts):""),m=Math.max(0,he(t)),p=Xt(t,n),$=p.value,v=0,k=0;for(let H of _t(t).values())H>0?v+=H:k-=H;let w=r.other||0,g=m+$+(r.countOwed?v:0)+w,b=t.card.on?Math.max(0,tt(t)):0,S=r.debts||0,P=b+k+S,N=Math.max(0,g-P),y=n?n*85:0,M=s?s*595:0,I=r.nisab==="silver",F=I?M:y,ot=F>0,at=ot&&N>=F,it=at?N*.025:0,ne=r.hawl?Dt(r.hawl,354):null,Kt=ne?St(A(),ne):null;return l`<div class="screen">
    <${et} title="Zakat" hint="2.5% of savings held for one lunar year above nisab" onBack=${Pe} />

    <div class="card hero" style="text-align:center">
      ${ot?at?l`<div class="label">Zakat to pay</div><div class="big up"><${x} v=${it} /></div><div class="sub">2.5% of <${x} v=${N} d=${0} /></div>`:l`<div class="label">No zakat due</div><div class="big"><${x} v=${0} d=${0} /></div><div class="sub">Your net savings <${x} v=${N} d=${0} /> are below the nisab <${x} v=${F} d=${0} /></div>`:l`<div class="label">Getting today's ${I?"silver":"gold"} price…</div><div class="hint" style="margin-top:6px">${I&&o?"Could not load the silver price. Check internet or use the gold nisab.":"Needed to work out the nisab."}</div>`}
    </div>

    <div class="card">
      <b>What you own</b>
      <div class="kv" style="margin-top:8px">
        <span>Cash, bank & savings</span><${x} v=${m} />
        <span>Gold: ${T(p.grams,2)} g × ${n?T(n):"\u2026"} zł</span><${x} v=${$} />
        <span>Money friends owe you${r.countOwed?"":" (not counted)"}</span><span class=${r.countOwed?"":"mute"}><${x} v=${v} /></span>
        <span>Other assets</span><${x} v=${w} />
        <span class="total">Total</span><span class="total"><${x} v=${g} /></span>
      </div>
      <div class="sep"></div>
      <b>Minus what you owe now</b>
      <div class="kv" style="margin-top:8px">
        <span>Credit card balance</span><${x} v=${b} />
        <span>Money you owe friends</span><${x} v=${k} />
        <span>Other debts due now</span><${x} v=${S} />
        <span class="total">Total</span><span class="total"><${x} v=${P} /></span>
      </div>
      <div class="sep"></div>
      <div class="kv">
        <span class="total">Net zakatable wealth</span><span class="total"><${x} v=${N} /></span>
        <span>Nisab (${I?"595 g silver":"85 g gold"})</span><span>${ot?l`<${x} v=${F} d=${0} />`:"\u2026"}</span>
        <span class="total">Zakat (2.5%)</span><span class="total up"><${x} v=${it} /></span>
      </div>
      ${ot&&l`<div style="margin-top:12px"><${yt} v=${N/F} cls=${at?"ok":""} /><div class="hint" style="margin-top:4px">${at?"Above nisab":`${T(Math.min(100,N/F*100),0)}% of nisab`}</div></div>`}
    </div>

    <div class="card">
      <b>Nisab</b>
      <div class="hint" style="margin:2px 0 10px">The minimum amount before zakat applies</div>
      <${It} options=${[["gold","Gold \xB7 85 g"],["silver","Silver \xB7 595 g"]]} value=${r.nisab} onChange=${H=>E("zakat",{nisab:H})} />
      <div class="kv" style="margin-top:10px;font-size:13.5px">
        <span>Gold price today</span><span>${n?T(n)+" z\u0142/g":"\u2026"}</span>
        <span>85 g gold</span><span>${y?l`<${x} v=${y} d=${0} />`:"\u2026"}</span>
        <span>Silver price today</span><span>${s?T(s)+" z\u0142/g":o?"unavailable":"\u2026"}</span>
        <span>595 g silver</span><span>${M?l`<${x} v=${M} d=${0} />`:"\u2026"}</span>
      </div>
    </div>

    <div class="card">
      <${st} title="Count money friends owe me" hint="Only if you expect to get it back"><${dt} on=${r.countOwed} onChange=${H=>E("zakat",{countOwed:H})} /><//>
      <div class="sep"></div>
      <${C} label="Other assets (zł): shares, crypto, business stock, cash at home not in the app"><${L} value=${c} onInput=${H=>{u(H),E("zakat",{other:D(H)||0})}} placeholder="0" /><//>
      <${C} label="Other debts due now (zł): rent owed, loan instalment due"><${L} value=${d} onInput=${H=>{f(H),E("zakat",{debts:D(H)||0})}} placeholder="0" /><//>
      <${C} label="My zakat year started on"><input class="input" type="date" value=${r.hawl} onInput=${H=>E("zakat",{hawl:H.target.value})} /><//>
      ${ne&&l`<div class="note">Next zakat date (1 lunar year = 354 days): <b>${J(ne)}</b>${Kt>0?` \xB7 in ${Kt} days`:Kt===0?" \xB7 today":" \xB7 already passed. Pay now and set a new start date."}</div>`}
    </div>
    <div class="note" style="padding:0 6px">Gold is valued at today's live market price. This is a helper, not a fatwa. Jewellery worn personally, business assets and long-term loans have different rulings, so ask a scholar for your case.</div>
  </div>`}var Cn=["PLN","EUR","USD","AED","GBP","INR"],ao={PLN:"Polish z\u0142oty",EUR:"Euro",USD:"US dollar",AED:"UAE dirham",GBP:"British pound",INR:"Indian rupee"};function ro(){let t=B(),[e,n]=h(!1),s=async()=>{n(!0),await Vt(!0),n(!1)};j(()=>{s()},[]);let[a,o]=h("100"),[i,r]=h("EUR"),c=D(a)||0,u=m=>m==="PLN"?1:t.rates[m]||NaN,d=c*u(i),f=t.rates.src||{};return l`<div class="screen">
    <${et} title=${_.convert} hint="Today's official rates" onBack=${Pe} right=${l`<button class="iconbtn" onClick=${s} aria-label="Refresh">${e?"\u2026":"\u21BB"}</button>`} />
    <div class="card">
      <div class="amount"><div class="cur">${ao[i]} (${i})</div><${L} cls="" value=${a} onInput=${o} /></div>
      <div class="chips" style="justify-content:center">${Cn.map(m=>l`<button class=${`chip ${i===m?"on":""}`} onClick=${()=>r(m)}>${m}</button>`)}</div>
    </div>
    <div class="card" style="padding:4px 14px">
      ${Cn.filter(m=>m!==i).map(m=>{let p=d/u(m),$=u(i)/u(m);return l`<div class="item">
        <span class="em" style="font-size:12px;font-weight:700">${m}</span>
        <div class="grow"><div class="t1" style="font-weight:500">${ao[m]}</div><div class="t2">1 ${i} = ${Number.isFinite($)?T($,$<.1?5:4):"\u2026"} ${m}</div></div>
        <span class="amt" style="font-size:17px">${Number.isFinite(p)?V(p,m):"\u2026"}</span>
      </div>`})}
    </div>
    <div class="hint" style="text-align:center;line-height:1.6">
      ${t.rates.date?l`Latest official rates: <b>${J(t.rates.date)}</b> · `:""}checked ${t.rates.at?new Date(t.rates.at).toLocaleString([],{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"\u2026"}<br/>
      ${Cn.filter(m=>m!=="PLN").map(m=>`${m}: ${f[m]==="nbp"?"NBP":f[m]==="er"?"open.er-api":"\u2026"}`).join(" \xB7 ")}<br/>
      Official mid-market rates, updated once per working day. Banks and exchange shops add their own margin.
    </div>
  </div>`}function lo(){let t=B(),e=A(),n=async()=>{await mn(`creampie-backup-${e}.json`,"application/json",new TextEncoder().encode(JSON.stringify(Q(),null,1)))!=="cancelled"&&(E("settings",{lastBackup:e}),O("Backup saved"))},s=async()=>{let o=Q(),i=$=>(o.friends.find(v=>v.id===$)||{}).name||"",r={exp:"Expense",inc:"Income",xfer:"Transfer",fout:"To friend",fin:"From friend",gold:"Gold purchase",adj:"Correction"},c=[...o.txns].sort(($,v)=>$.date.localeCompare(v.date)),u=[],d=U(),f=c.length?vt(c[0].date):d;for(;d>=f&&u.length<60;)u.push(ct(o,d)),d=ht(d);let m=oo([{name:"Transactions",rows:[["Date","Type","Category","Amount","Currency","Amount (PLN)","From","To","Friend","Note"],...c.map($=>[$.date,r[$.t]||$.t,$.cat?q(o,$.cat).name:"",$.amt,W(o,$.from||$.to),gt(o,$),$.from?mt(o,$.from):"",$.to?mt(o,$.to):"",$.friend?i($.friend):"",$.note||""])]},{name:"Monthly",rows:[["Month","Income","Spending","Net","Saved","On card"],...u.map($=>[$.ym,$.income,$.spend,$.net,$.saved,$.card])]},{name:"Accounts",rows:[["Account","Type","Currency","Balance","Balance (PLN)"],...o.accounts.map($=>[$.name,pe[$.kind],$.cur,xt(o,$.id),Ht(o,xt(o,$.id),$.cur)]),[],["Credit card","Limit",o.card.limit,"Owed",tt(o)]]},{name:"Gold",rows:[["Date","Grams","Bought at (z\u0142/g)","Market price (z\u0142/g)","Premium %","Total paid","Note"],...o.gold.buys.map($=>[$.date,$.g,$.paid,$.market||"",$.market?($.paid-$.market)/$.market*100:"",$.g*$.paid,$.note||""])]},{name:"Friends",rows:[["Person","Balance (+ owes me / \u2212 I owe)"],...o.friends.map($=>[$.name,_t(o).get($.id)||0])]},{name:"Bills",rows:[["Bill","Amount","Day","Paid with","Paused"],...o.recurring.map($=>[$.name,$.amt,$.day,mt(o,$.from),$.paused?"yes":""])]},{name:"Goals",rows:[["Goal","Target","Saved","Deadline"],...o.goals.map($=>[$.name,$.target,$.saved,$.by||""])]}]);await mn(`creampie-holdings-${e}.xlsx`,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",m)!=="cancelled"&&O("Excel exported \u{1F4CA}","\u2705")},a=o=>{let i=o.target.files&&o.target.files[0];i&&(i.text().then(r=>{try{let c=JSON.parse(r);if(!c||!Array.isArray(c.txns)||!Array.isArray(c.accounts))throw new Error("bad");if(!confirm(`Replace everything on this phone with the backup (${c.txns.length} entries)?`))return;ss(c),O("Backup restored")}catch{O("That file isn't a backup from this app","\u26A0\uFE0F")}}),o.target.value="")};return l`<div class="screen">
    <${et} title=${_.backup} hint="Backup, restore & Excel" onBack=${Pe} />
    <div class="card">
      <b>Backup</b>
      <div class="note" style="margin:6px 0 12px">Your data lives only on this phone. Save a backup now and then (to Google Drive, iCloud Files or email it to yourself). Use it to move to a new phone too.</div>
      <div class="hint" style="margin-bottom:10px">Last backup: ${t.settings.lastBackup?J(t.settings.lastBackup):"never"}</div>
      <button class="btn primary block" onClick=${n}>💾 Save backup file</button>
      <label class="btn block" style="margin-top:8px">📂 Restore from backup<input type="file" accept=".json,application/json" style="display:none" onChange=${a} /></label>
    </div>
    <div class="card">
      <b>Excel export 📊</b>
      <div class="note" style="margin:6px 0 12px">Everything in a spreadsheet: transactions, months, accounts, gold, friends, bills, goals.</div>
      <button class="btn block" onClick=${s}>Export to Excel (.xlsx)</button>
    </div>
  </div>`}function co(){let t=B(),[e,n]=h(!1),[s,a]=h(!1),[o,i]=h(null),r=t.settings;return l`<div class="screen">
    <${et} title=${_.settings} hint="Settings" onBack=${Pe} />
    <div class="card">
      <${st} title=${_.discreet} hint=${_.discreetHint}><${dt} on=${r.privacy} onChange=${c=>E("settings",{privacy:c})} /><//>
      <div class="sep"></div>
      <${st} title=${_.members} hint=${r.pin?"PIN lock is on":"Lock the app with a PIN"} onClick=${()=>n(!0)}><span class="pink">${r.pin?"Change":"Set up"} →</span><//>
    </div>
    <div class="card">
      <div class="h-title" style="margin-bottom:6px">Notifications</div>
      <${st} title="9 pm reminder" hint="Reminds you to add today's spending"><${dt} on=${r.remind9pm} onChange=${c=>E("settings",{remind9pm:c})} /><//>
      <${st} title="Card bill reminders"><${dt} on=${r.cardRemind} onChange=${c=>E("settings",{cardRemind:c})} /><//>
      <${st} title="Gold price & news alerts" hint="Set targets on the Gold screen"><${dt} on=${t.gold.alertsOn} onChange=${c=>E("gold",{alertsOn:c})} /><//>
      <button class=${`btn block ${r.alertsSetup?"":"primary"}`} style="margin-top:8px" onClick=${async()=>{i("\u2026");let c=await Je();i(c)}}>${r.alertsSetup?"\u2705 Notifications on. Re-check":"\u{1F514} Turn on notifications"}</button>
      ${o==="install-first"&&l`<div class="note warn" style="margin-top:8px">iPhone: tap Share ⬆️ → “Add to Home Screen”, open the app from your Home Screen, then tap this again.</div>`}
      ${o==="denied"&&l`<div class="note warn" style="margin-top:8px">Blocked. Allow notifications for this app in your phone's Settings.</div>`}
      ${o==="relay-failed"&&l`<div class="note warn" style="margin-top:8px">Couldn't reach the alert helper. Check internet and try again.</div>`}
    </div>
    <div class="card">
      <${st} title="Categories" hint="Add your own spending categories" onClick=${()=>a(!0)}><span class="pink">Edit →</span><//>
      <div class="sep"></div>
      <${st} title="Run setup again" hint="Balances, card, monthly limit" onClick=${()=>location.hash="#/setup"}><span class="pink">→</span><//>
      <div class="sep"></div>
      <${C} label="Gold sell-back discount (%)"><${L} value=${String(t.gold.sellSpread)} onInput=${c=>E("gold",{sellSpread:D(c)||0})} /><//>
    </div>
    ${we()&&!Sn()&&l`<div class="card"><b>Install on iPhone</b><div class="note" style="margin-top:6px">In Safari tap Share ⬆️ → “Add to Home Screen”. It opens full-screen like a real app and can send you alerts.</div></div>`}
    <div class="card">
      <button class="btn danger block" onClick=${()=>{confirm("Delete ALL data on this phone? This cannot be undone. Save a backup first!")&&confirm("Are you sure? Everything will be deleted.")&&(os(),O("All data deleted","\u{1F5D1}\uFE0F"),location.hash="#/home")}}>Delete all data</button>
    </div>
    <div class="hint" style="text-align:center;margin-top:10px">${_.app} · v1.1<br/>Your data never leaves this phone (except encrypted alert settings).</div>
    ${e&&l`<${va} onClose=${()=>n(!1)} />`}
    ${s&&l`<${fa} onClose=${()=>a(!1)} />`}
  </div>`}function va({onClose:t}){let e=B(),[n,s]=h(""),[a,o]=h(""),i=/^\d{4,6}$/.test(n)&&n===a;return l`<${rt} title=${_.members} onClose=${t}>${r=>l`
    <div class="note" style="margin-bottom:12px">Choose a 4–6 digit PIN. You'll need it every time you open the app.${Pt()?" You can also use your fingerprint.":""} If you forget it, you'll have to reinstall and restore a backup.</div>
    <${C} label="New PIN"><input class="input mono" type="password" inputmode="numeric" maxlength="6" value=${n} onInput=${c=>s(c.target.value.replace(/\D/g,""))} /><//>
    <${C} label="Again"><input class="input mono" type="password" inputmode="numeric" maxlength="6" value=${a} onInput=${c=>o(c.target.value.replace(/\D/g,""))} /><//>
    <div class="btns">
      ${e.settings.pin&&l`<button class="btn danger" onClick=${()=>{E("settings",{pin:null}),O("PIN removed","\u{1F513}"),r()}}>Remove PIN</button>`}
      <button class="btn primary grow" disabled=${!i} style=${{opacity:i?1:.4}} onClick=${async()=>{E("settings",{pin:await ze("cph:"+n)}),O("PIN saved","\u{1F512}"),r()}}>Save PIN</button>
    </div>
  `}<//>`}var ha=["\u{1F354}","\u{1F355}","\u{1F959}","\u{1F6CD}\uFE0F","\u{1F3AE}","\u{1F3AC}","\u{1F37A}","\u{1F6AC}","\u{1F48A}","\u{1F436}","\u{1F476}","\u{1F3CB}\uFE0F","\u{1F4E6}","\u{1F9FE}","\u{1F484}","\u{1F389}","\u26FD","\u{1F17F}\uFE0F","\u{1F9FA}","\u{1F6E0}\uFE0F"];function fa({onClose:t}){let e=B(),[n,s]=h(""),[a,o]=h("\u{1F6CD}\uFE0F"),i=new Set(e.txns.map(r=>r.cat));return l`<${rt} title="Categories" onClose=${t}>${r=>l`
    <div class="chips" style="margin-bottom:14px">${e.cats.exp.map(c=>l`<button class="chip" onClick=${()=>{if(i.has(c.id))return O("Used by entries, so it can't be removed","\u26A0\uFE0F");confirm(`Remove \u201C${c.name}\u201D?`)&&G(u=>({...u,cats:{...u.cats,exp:u.cats.exp.filter(d=>d.id!==c.id)}}))}}>${c.icon} ${c.name} ✕</button>`)}</div>
    <${C} label="New category"><input class="input" value=${n} onInput=${c=>s(c.target.value)} placeholder="e.g. Shisha, Gaming, Pets" /><//>
    <div class="chips" style="margin-bottom:12px">${ha.map(c=>l`<button class=${`chip ${a===c?"on":""}`} onClick=${()=>o(c)}>${c}</button>`)}</div>
    <button class="btn primary block" disabled=${!n.trim()} onClick=${()=>{G(c=>({...c,cats:{...c.cats,exp:[...c.cats.exp,{id:"c_"+bt(),name:n.trim(),icon:a,group:"Custom"}]}})),s(""),O("Category added","\u{1F3F7}\uFE0F")}}>Add category</button>
  `}<//>`}function po(){let t=B(),[e,n]=h(0),[s,a]=h(()=>Object.fromEntries(t.accounts.map(b=>[b.id,xt(t,b.id)?String(+xt(t,b.id).toFixed(2)):""]))),[o,i]=h(()=>Object.fromEntries(t.accounts.map(b=>[b.id,b.name]))),[r,c]=h(t.card.on),[u,d]=h(t.card.limit?String(t.card.limit):""),[f,m]=h(tt(t)?String(+tt(t).toFixed(2)):""),[p,$]=h(t.card.dueDay?String(t.card.dueDay):""),[v,k]=h(t.budget.monthly?String(t.budget.monthly):""),w=()=>{G(b=>{let S=b.accounts.map(y=>{let M=D(s[y.id])||0,I=xt(b,y.id);return{...y,name:(o[y.id]||y.name).trim()||y.name,opening:(y.opening||0)+(M-I)}}),P=tt(b),N={...b.card,on:r,limit:D(u)||0,opening:(b.card.opening||0)+((D(f)||0)-P),dueDay:Math.min(31,Math.round(D(p)||0))};return{...b,accounts:S,card:N,budget:{...b.budget,monthly:D(v)||0},settings:{...b.settings,onboarded:!0}}}),O("All set"),location.hash="#/home"},g=[l`<div>
      <div class="h-big" style="margin-bottom:6px">Your money right now</div>
      <div class="note" style="margin-bottom:14px">Rename these to your real accounts (ING, Revolut…) and type what's in each today. You can add more later.</div>
      ${t.accounts.map(b=>l`<div class="card" style="padding:12px">
        <div class="row" style="gap:8px"><span style="font-size:22px">${b.icon}</span><input class="input" style="flex:1" value=${o[b.id]} onInput=${S=>i({...o,[b.id]:S.target.value})} /></div>
        <div style="margin-top:8px"><${L} value=${s[b.id]} onInput=${S=>a({...s,[b.id]:S})} placeholder=${`Balance in ${b.cur}`} /></div>
      </div>`)}
    </div>`,l`<div>
      <div class="h-big" style="margin-bottom:6px">Credit card</div>
      <${st} title="I have a credit card"><${dt} on=${r} onChange=${c} /><//>
      ${r&&l`
        <${C} label="Credit limit (zł)"><${L} value=${u} onInput=${d} placeholder="5000" /><//>
        <${C} label="How much you owe on it now (zł)"><${L} value=${f} onInput=${m} placeholder="0" /><//>
        <${C} label="Bill payment day of the month"><${L} value=${p} onInput=${$} placeholder="e.g. 25" /><//>`}
    </div>`,l`<div>
      <div class="h-big" style="margin-bottom:6px">Monthly limit</div>
      <div class="note" style="margin-bottom:14px">How much do you want to spend per month max (excluding savings)? I'll turn it into a daily limit. Leave empty to skip.</div>
      <${C} label="Monthly limit (zł)"><${L} value=${v} onInput=${k} placeholder="e.g. 4000" /><//>
    </div>`];return l`<div class="screen">
    <${et} title="Setup" hint=${`Step ${e+1} of ${g.length}`} onBack=${()=>e?n(e-1):Pe()} />
    <div class="row" style="gap:6px;margin-bottom:16px">${g.map((b,S)=>l`<div class="grow" style=${{height:"4px",borderRadius:"4px",background:S<=e?"var(--accent)":"var(--line)"}}></div>`)}</div>
    ${g[e]}
    <button class="btn primary block" style="margin-top:12px" onClick=${()=>e<g.length-1?n(e+1):w()}>${e<g.length-1?"Next \u2192":"Finish"}</button>
  </div>`}var uo=["home","activity","gold","wealth"],Nn=()=>{let t=(location.hash.replace(/^#\/?/,"")||"home").split("/");return{name:t[0],arg:t[1]}};function ga(){let[t,e]=h(Nn());return j(()=>{let n=()=>{e(Nn()),window.scrollTo(0,0)};return window.addEventListener("hashchange",n),()=>window.removeEventListener("hashchange",n)},[]),t}function ya({onOpen:t}){let e=B(),[n,s]=h(""),[a,o]=h(!1),i=async c=>{c.length<4||(await ze("cph:"+c)===e.settings.pin?(Mt(20),t()):c.length>=6&&(o(!0),Mt(200),setTimeout(()=>{o(!1),s("")},450)))},r=c=>{Mt(8);let u=c==="\u232B"?n.slice(0,-1):(n+c).slice(0,6);s(u),i(u)};return j(()=>{Pt()&&window.CPNative.canBiometric&&window.CPNative.canBiometric()&&(window.cpBio=c=>c&&t(),setTimeout(()=>window.CPNative.biometric(),300))},[]),l`<div class="lock">
    <img class="logo" src="icons/icon-192.png" alt="" />
    <div class="h-big">${_.app}</div>
    <div class="dim">${a?_.pinWrong:_.pinAsk}</div>
    <div class=${`dots ${a?"shake":""}`}>${[0,1,2,3,4,5].map(c=>l`<i class=${c<n.length?"on":""} style=${{opacity:c<4||c<n.length?1:.3}}></i>`)}</div>
    <div class="pad">
      ${["1","2","3","4","5","6","7","8","9"].map(c=>l`<button onClick=${()=>r(c)}>${c}</button>`)}
      ${Pt()&&window.CPNative.canBiometric&&window.CPNative.canBiometric()?l`<button class="k" onClick=${()=>window.CPNative.biometric()}>👆</button>`:l`<span></span>`}
      <button onClick=${()=>r("0")}>0</button>
      <button class="k" onClick=${()=>r("\u232B")}>⌫</button>
    </div>
  </div>`}function ba({tab:t,onAdd:e}){let n=a=>{Mt(6),Nn().name!==a&&location.replace("#/"+a)},s=(a,o,i)=>l`<button class=${t===a?"on":""} onClick=${()=>n(a)}><span class="i">${o}</span>${i}</button>`;return l`<nav class="dock">
    ${s("home","\u{1F3E0}",_.nHome)}
    ${s("activity","\u{1F9FE}",_.nActivity)}
    <button class="plus" onClick=${e} aria-label="Add">＋</button>
    ${s("gold","\u{1FA99}",_.nGold)}
    ${s("wealth","\u{1F4CA}",_.nWealth)}
  </nav>`}function xa(){let t=B(),e=ga(),[n,s]=h(!!t.settings.pin),[a,o]=h(null);if($t.open=d=>o(d||{}),j(()=>{hn(),Vt().then(()=>xn()),_n().catch(()=>{}),ke();let d=p=>{O(p.text,"\u{1F4C9}",6e3),Ms("Gold price alert",p.text)};be.add(d);let f=0,m=()=>{document.visibilityState==="hidden"?f=Date.now():(hn(),ke(),Q().settings.pin&&f&&Date.now()-f>6e4&&s(!0))};return document.addEventListener("visibilitychange",m),window.cpOpen=p=>{p==="add"?o({mode:"exp"}):location.hash="#/"+p},location.hash==="#/add"&&(history.replaceState(null,"","#/home"),o({mode:"exp"})),()=>{be.delete(d),document.removeEventListener("visibilitychange",m)}},[]),n&&t.settings.pin)return l`<${ya} onOpen=${()=>s(!1)} />`;let i=uo.includes(e.name)?e.name:null,r=(d="exp")=>o({mode:d}),c={home:()=>l`<${Bs} openAdd=${r} />`,activity:()=>l`<${Os} />`,gold:()=>l`<${Rs} />`,wealth:()=>l`<${Ys} />`,news:()=>l`<div class="screen"><${et} title=${_.news} hint="Gold news & what it might mean" onBack=${()=>history.back()} /><${Ws} /></div>`,accounts:()=>l`<${Xs} />`,card:()=>l`<${Js} />`,friends:()=>l`<${Vs} />`,goals:()=>l`<${Ks} />`,budget:()=>l`<${Zs} />`,bills:()=>l`<${Qs} />`,history:()=>l`<${to} />`,summary:()=>l`<${eo} ym=${e.arg} key=${e.arg} />`,zakat:()=>l`<${io} />`,convert:()=>l`<${ro} />`,backup:()=>l`<${lo} />`,settings:()=>l`<${co} />`,setup:()=>l`<${po} />`},u=c[e.name]||c.home;return l`<div>
    <div key=${e.name}>${u()}</div>
    <${ba} tab=${i||(uo.includes(e.name)?e.name:"")} onAdd=${()=>{Mt(15),r("exp")}} />
    ${a&&l`<${Es} ...${a} onClose=${()=>o(null)} />`}
    <${ls} />
  </div>`}zn(l`<${xa} />`,document.getElementById("app"));"serviceWorker"in navigator&&location.protocol==="https:"&&navigator.serviceWorker.register("sw.js").catch(()=>{});
