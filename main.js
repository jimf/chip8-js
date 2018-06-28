(function(){function b(d,e,g){function a(j,i){if(!e[j]){if(!d[j]){var f="function"==typeof require&&require;if(!i&&f)return f(j,!0);if(h)return h(j,!0);var c=new Error("Cannot find module '"+j+"'");throw c.code="MODULE_NOT_FOUND",c}var k=e[j]={exports:{}};d[j][0].call(k.exports,function(b){var c=d[j][1][b];return a(c||b)},k,k.exports,b,d,e,g)}return e[j].exports}for(var h="function"==typeof require&&require,c=0;c<g.length;c++)a(g[c]);return a}return b})()({1:[function(a,b){b.exports=`
; Loads into the CHIP-8 emulator if there is no ROM/C8 specified.
;
; Written by Jeffrey Massung as an example.
; Hack away and have fun!
;

            ld          i, logo

            ; where to draw the logo
            ld          v0, 11
            ld          v1, 3
            ld          v2, 7

            ; C
            drw         v0, v1, 7
            add         v0, 7
            add         i, v2

            ; H
            drw         v0, v1, 7
            add         v0, 7
            add         i, v2

            ; I
            drw         v0, v1, 7
            add         v0, 7
            add         i, v2

            ; P
            drw         v0, v1, 7
            add         v0, 7
            add         i, v2

            ; -
            drw         v0, v1, 7
            add         v0, 5
            add         i, v2

            ; 8
            drw         v0, v1, 7
            add         i, v2

            ; move a ball around the board
            ld          i, ball

            ; randomly pick a starting location
            rnd         v0, #3f
            rnd         v1, #1f

            ; initial direction of travel
            ld          v2, 1
            ld          v3, 1

            ; draw the initial ball
            drw         v0, v1, 1

            ; update 30 times per second
loop        ld          v4, 2
            ld          dt, v4
wait        ld          v4, dt
            se          v4, 0
            jp          wait

            ; erase the ball
            drw         v0, v1, 1

            ; move it
            add         v0, v2
            add         v1, v3

            ; draw it again in the new position
            drw         v0, v1, 1

            ; is it at the top?
            sne         v1, 0
            ld          v3, 1

            ; is it at the bottom?
            sne         v1, #1f
            ld          v3, -1

            ; is it at the left?
            sne         v0, 0
            ld          v2, 1

            ; is it at the right?
            sne         v0, #3f
            ld          v2, -1

            ; repeat forever
            jp          loop


ball        byte        %1.......

logo        byte        %.1111...
            byte        %11..11..
            byte        %11......
            byte        %11......
            byte        %11......
            byte        %11..11..
            byte        %.1111...

            byte        %11..11..
            byte        %11..11..
            byte        %11..11..
            byte        %111111..
            byte        %11..11..
            byte        %11..11..
            byte        %11..11..

            byte        %111111..
            byte        %..11....
            byte        %..11....
            byte        %..11....
            byte        %..11....
            byte        %..11....
            byte        %111111..

            byte        %11111...
            byte        %11..11..
            byte        %11..11..
            byte        %11111...
            byte        %11......
            byte        %11......
            byte        %11......

            byte        %........
            byte        %........
            byte        %........
            byte        %1111....
            byte        %........
            byte        %........
            byte        %........

            byte        %.1111...
            byte        %11..11..
            byte        %11..11..
            byte        %.1111...
            byte        %11..11..
            byte        %11..11..
            byte        %.1111...
`},{}],2:[function(a){function b(a,b){let c=!1;return function(){c||(a.apply(null,arguments),c=!0,setTimeout(()=>{c=!1},b))}}function c(a){return new Promise((b,c)=>{const d=new window.XMLHttpRequest;d.open("GET",`/roms/${a}`,!0),d.responseType="arraybuffer",d.onload=function(){const a=d.response;a?b(new Uint8Array(a)):c(new Error("Failed"))},d.send(null)})}function d(a){function b(a){var b=Math.round;if(!a)return void e.clearRect(0,0,f,g);e.clearRect(0,0,f,g);const c=b(f/64),d=b(g/32);for(let b=0,f=a.vm.display.length;b<f;b+=1){if(0===a.vm.display[b])continue;const f=b%64,g=Math.floor(b/64);e.fillRect(f*c,g*d,c,d)}}function c(){const b=a.clientWidth,c=a.clientHeight,i=2.14>b/c?b:c,j=h(i-i%64,64);j===f||(f=j,g=f/2,d.setAttribute("width",f),d.setAttribute("height",g),d.style.width=f+"px",d.style.height=g+"px",e.fillStyle="#8F9185",e.strokeStyle="#8F9185")}const d=a.querySelector("canvas"),e=d.getContext("2d");let f,g;return c(),{render:b,resize:c}}function e(a){function b(b){if(!b)return void(a.textContent="");let e=h(512,b.vm.pc-2),f=Math.min(b.vm.pc+28,4096);c<b.vm.pc&&b.vm.pc<d&&(e=c,f=d),c=e,d=f;const g=[];for(let a=e;a<=f;a+=2)g.push((a===b.vm.pc?">":" ")+b.disassemble(a));a.textContent=g.join("\n")}let c,d;return{render:b}}function f(a){function b(){d.style.display="block",f.textContent=""}function c(a){const{romInfo:b,rom:c,kb:e}=a,g=Object.keys(b.keys).map(a=>{const c=b.keys[a].toUpperCase(),d=e.keyNames(a);return`  ${d.join("/")}: ${c}`}).join("\n");d.style.display="none",f.textContent=`
LOADING ${b.name}
${c.byteLength} BYTES

KEYS:
${g}

STARTING PROGRAM;
`.trim()}const d=a.querySelector(".output-pane__nav"),e=a.querySelector(".output-pane__navlist"),f=a.querySelector(".output-pane__output");return Object.keys(l).forEach(b=>{const c=document.createElement("li"),d=document.createElement("a");d.setAttribute("href",`#/${b}`),d.textContent=b,c.appendChild(d),e.appendChild(c)}),{render:function(a){a&&a.romInfo?c(a):b()}}}function g(a){function b(a){return"#"+("0"+a.toString(16).toUpperCase()).slice(-2)}function c(a){return"#"+("000"+a.toString(16).toUpperCase()).slice(-4)}return{render:function(d){return d?void(a.textContent=`
V0 = ${b(d.vm.V[0])}      DT = ${b(d.vm.dt)}
V1 = ${b(d.vm.V[1])}      ST = ${b(d.vm.st)}
V2 = ${b(d.vm.V[2])}
V3 = ${b(d.vm.V[3])}       I = ${c(d.vm.I)}
V4 = ${b(d.vm.V[4])}
V5 = ${b(d.vm.V[5])}      PC = ${c(d.vm.pc)}
V6 = ${b(d.vm.V[6])}      SP = ${b(d.vm.sp)}
V7 = ${b(d.vm.V[7])}
V8 = ${b(d.vm.V[8])}
V9 = ${b(d.vm.V[9])}
VA = ${b(d.vm.V[10])}
VB = ${b(d.vm.V[11])}
VC = ${b(d.vm.V[12])}
VD = ${b(d.vm.V[13])}
VE = ${b(d.vm.V[14])}
VF = ${b(d.vm.V[15])}
`.trim()):void(a.textContent="")}}}var h=Math.max;const i=a("../"),j=a("./keyboard_input"),k=a("./router"),l=a("./rom_data"),m=a("./c8/boot.c8"),n=i.assemble(m),o=function(){function a(a,c){function d(){h.render(r),k(r)}function e(a){if(!f){{const b=a-g;for(i+=540/1e3*b,j+=60/1e3*b;1<=i;)r.step(),i-=1;for(;1<=j;)r.vm.decrementTimers(),j-=1;d(),g=a}window.requestAnimationFrame(e)}}let f=!1,g=window.performance.now(),i=0,j=0;const k=b(()=>{m.render(r),p.render(r)},200);return t.onkeydown=a=>{s.onKeydown(a),32===a.which&&(r.step(),d())},t.onkeyup=a=>{s.onKeyup(a)},t.onresize=()=>{h.resize()},c.then(b=>{r.vm.reset(),r.load(b),d(),o.render({romInfo:a,rom:b,kb:s}),window.requestAnimationFrame(e)}),function(){f=!0,delete t.onkeyup,delete t.onkeydown}}const h=d(document.querySelector(".display-pane")),m=e(document.querySelector(".memory-pane")),o=f(document.querySelector(".output-pane")),p=g(document.querySelector(".state-pane")),q=k(),r=i(),s=j(r),t={handleEvent(a){const b=this[`on${a.type}`];b&&b(a)},handleResize:b(a=>{t.onresize&&t.onresize(a)},250)};return q.route(new RegExp(`^/(${Object.keys(l).join("|")})$`),function(b){return a(l[b],c(b))}),q.route(/^.*$/,function(){return a(void 0,Promise.resolve(n))}),{start:function(){document.addEventListener("keydown",t),document.addEventListener("keyup",t),window.addEventListener("resize",t.handleResize),q.start()},chip8:r}}();o.start(),window.app=o},{"../":8,"./c8/boot.c8":1,"./keyboard_input":3,"./rom_data":4,"./router":5}],3:[function(a,b){const c={[49]:1,[50]:2,[51]:3,[52]:12,[81]:4,[87]:5,[69]:6,[82]:13,[65]:7,[83]:8,[68]:9,[70]:14,[90]:10,[88]:0,[67]:11,[86]:15},d=Object.keys(c).reduce((a,b)=>{const d=c[b];return a[d]=a[d]||[],a[d].push(b),a},{});b.exports=function(a){return{onKeydown(b){if(b.which in c){const d=c[b.which];return a.keyDown(d),d}},onKeyup(b){if(b.which in c){const d=c[b.which];return a.keyUp(d),d}},keyNames(a){return d[a].map(a=>String.fromCharCode(+a))}}}},{}],4:[function(a,b){b.exports={"15PUZZLE":{name:"15PUZZLE",keys:{}},BLINKY:{name:"BLINKY",keys:{1:"Reset",3:"Up",6:"Down",7:"Left",8:"Right"}},BLITZ:{name:"BLITZ",keys:{5:"Drop"}},BRIX:{name:"BRIX",keys:{4:"Left",6:"Right"}},CONNECT4:{name:"CONNECT4",keys:{4:"Left",5:"Drop",6:"Right"}},GUESS:{name:"GUESS",keys:{4:"No",5:"Yes"}},HIDDEN:{name:"HIDDEN",keys:{2:"Up",4:"Left",5:"Pick",6:"Right",8:"Down"}},INVADERS:{name:"INVADERS",keys:{4:"Left",5:"Fire",6:"Right"}},KALEID:{name:"KALEID",keys:{2:"Up",4:"Left",6:"Right",8:"Down",0:"Finish"}},MAZE:{name:"MAZE",keys:{}},MERLIN:{name:"MERLIN",keys:{4:"Left",6:"Right"}},MISSILE:{name:"MISSILE",keys:{8:"Fire"}},PONG:{name:"PONG",keys:{1:"Left paddle up",4:"Left paddle down",12:"Right paddle up",13:"Right paddle down"}},PONG2:{name:"PONG2",keys:{1:"Left paddle up",4:"Left paddle down",12:"Right paddle up",13:"Right paddle down"}},PUZZLE:{name:"PUZZLE",keys:{}},SYZYGY:{name:"SYZYGY",keys:{3:"Up",6:"Down",7:"Left",8:"Right",11:"Show score",14:"No border",15:"Border"}},TANK:{name:"TANK",keys:{2:"Down",4:"Left",5:"Fire",6:"Right",8:"Up"}},TETRIS:{name:"TETRIS",keys:{4:"Rotate",5:"Move left",6:"Move right",7:"Drop"}},TICTAC:{name:"TICTAC",keys:{1:"Select top left",2:"Select top middle",3:"Select top right",4:"Select middle left",5:"Select middle middle",6:"Select middle right",7:"Select bottom left",8:"Select bottom middle",9:"Select bottom right"}},UFO:{name:"UFO",keys:{4:"Left",5:"Up",6:"Right"}},VBRIX:{name:"VBRIX",keys:{1:"Up",4:"Down",7:"Start"}},VERS:{name:"VERS",keys:{1:"Player 1 left",2:"Player 1 right",7:"Player 1 up",10:"Player 1 down",12:"Player 2 up",13:"Player 2 down",11:"Player 2 left",15:"Player 2 right"}},WIPEOFF:{name:"WIPEOFF",keys:{4:"Left",6:"Right"}}}},{}],5:[function(a,b){b.exports=function(){function a(a){a=a.slice(1);const d=b.find(b=>b.route.test(a));d&&(c&&c(),c=d.callback(a.match(d.route).slice(1)))}const b=[];let c;return{route(a,c){b.push({route:a,callback:c})},go(a){window.location.hash="#"+a},start(){window.addEventListener("hashchange",b=>{a(b.newURL.slice(b.newURL.lastIndexOf("#")))}),a(window.location.hash||"#/")}}}},{}],6:[function(a,b){function c(){this.symbols={},this.unresolved={}}const d=a("./scanner");c.prototype.has=function(a){return Object.prototype.hasOwnProperty.call(this.symbols,a)},c.prototype.add=function(a,b){if(this.has(a))throw new Error(`Symbol ${a} already defined`);this.symbols[a]=b,Object.prototype.hasOwnProperty.call(this.unresolved,a)&&(this.unresolved[a].forEach(a=>{a(b)}),delete this.unresolved[a])},c.prototype.lookup=function(a,b){this.has(a)?b(this.symbols[a]):(this.unresolved[a]=this.unresolved[a]||[],this.unresolved[a].push(b))},c.prototype.unresolvedSymbols=function(){return Object.keys(this.unresolved)},b.exports=function(a){function b(){const a=p[q];return q+=1,a}function e(a){return!!(p[q]&&p[q].type===a)&&b()}function f(a){a.forEach(a=>{n[r]=a,r+=1})}function g(a,b){const c=r;f([0,0]),o.lookup(a,a=>{const d=b(a);n[c]=d[0],n[c+1]=d[1]})}function h(){i();const a=o.unresolvedSymbols();if(a.length)throw new Error(`Unresolved symbols: ${a.join(", ")}`);return n.slice(0,r)}function i(){for(;q<p.length;)j()}function j(){k();const a=e("Instruction"),b=l(),c=b[0]&&b[0].value,d=b[1]&&b[1].value,h=b[2]&&b[2].value,i=`${a.value} ${b.map(b=>b.type).join(", ")}`.trim();switch(i){case"CLS":f([0,224]);break;case"RET":f([0,238]);break;case"SYS Literal":f([c>>8,255&c]);break;case"SYS Identifier":g(c,a=>[a>>8,255&a]);break;case"JP Literal":f([16|c>>8,255&c]);break;case"JP Identifier":g(c,a=>[16|a>>8,255&a]);break;case"JP V, Literal":if(0!==c)throw new Error("Parse error: unexpected token");f([176|d>>8,255&d]);break;case"JP V, Identifier":{if(0!==c)throw new Error("Parse error: unexpected token");g(d,a=>[176|a>>8,255&a]);break}case"CALL Literal":f([32|c>>8,255&c]);break;case"CALL Identifier":g(c,a=>[32|a>>8,255&a]);break;case"SE V, Literal":f([48|c,d]);break;case"SE V, V":f([80|c,d<<4]);break;case"SNE V, Literal":f([64|c,d]);break;case"SNE V, V":f([144|c,d<<4]);break;case"LD V, Literal":f([96|c,d]);break;case"LD V, V":f([128|c,d<<4]);break;case"LD I, Literal":f([160|d>>8,255&d]);break;case"LD I, Identifier":g(d,a=>[160|a>>8,255&a]);break;case"LD V, DT":f([240|c,7]);break;case"LD V, K":f([240|c,10]);break;case"LD DT, V":f([240|d,21]);break;case"LD ST, V":f([240|d,24]);break;case"LD F, V":f([240|d,41]);break;case"LD B, V":f([240|d,51]);break;case"LD EffectiveAddress, V":f([240|d,85]);break;case"LD V, EffectiveAddress":f([240|c,101]);break;case"ADD V, Literal":f([112|c,d]);break;case"ADD V, V":f([128|c,4|d<<4]);break;case"ADD I, V":f([240|d,30]);break;case"OR V, V":f([128|c,1|d<<4]);break;case"AND V, V":f([128|c,2|d<<4]);break;case"XOR V, V":f([128|c,3|d<<4]);break;case"SUB V, V":f([128|c,5|d<<4]);break;case"SHR V":f([128|c,6]);break;case"SUBN V, V":f([128|c,7|d<<4]);break;case"SHL V":f([128|c,14]);break;case"RND V, Literal":f([192|c,d]);break;case"DRW V, V, Literal":f([208|c,d<<4|h]);break;case"SKP V":f([224|c,158]);break;case"SKNP V":f([224|c,161]);break;case"BYTE Literal":if(255<c)throw new Error("Byte out of range");f([c]);break;default:throw new Error("Parse error: unexpected token");}}function k(){const a=e("Label");return!!a&&void o.add(a.value,512|r)}function l(){const a=[];for(let b=m();b;)a.push(b),b=e("Comma")&&m();return a}function m(){const a=p[q];return!(!a||["Label","Instruction","Comma"].includes(a.type))&&b()}const n=new Uint8Array(3584),o=new c,p=function(){const b=d(a),c=[];for(let a=b.nextToken();null!==a;)c.push(a),a=b.nextToken();return c}();let q=0,r=0;return h()}},{"./scanner":9}],7:[function(a,b){function c(){this.reset()}const d=[240,144,144,144,240,32,96,32,32,112,240,16,240,128,240,240,16,240,16,240,144,144,240,16,16,240,128,240,16,240,240,128,240,144,240,240,16,32,64,64,240,144,240,144,240,240,144,240,16,240,240,144,240,144,144,224,144,224,144,224,240,128,128,128,240,224,144,144,144,224,240,128,240,128,240,240,128,240,128,128];c.prototype.reset=function(){this.memory=new Uint8Array(4096),this.V=new Uint8Array(16),this.stack=Array(16),this.display=Array(2048).fill(0),this.keys=Array(16).fill(!1),this.I=0,this.pc=512,this.sp=0,this.dt=0,this.st=0,this.wait=null,d.forEach((a,b)=>{this.memory[b]=a})},c.prototype.load=function(a){if(a.length>3584)throw new Error("Program too large to fit in memory");for(let b=0,c=a.length;b<c;b+=1)this.memory[b+512]=a[b]},c.prototype.next=function(){const a=this.memory[this.pc]<<8|this.memory[this.pc+1];return this.pc+=2,a},c.prototype.decrementTimers=function(){0<this.dt&&(this.dt-=1),0<this.st&&(this.st-=1)},c.prototype.keyDown=function(a){this.keys[a]=!0,null!==this.wait&&(this.V[this.wait]=a,this.wait=null)},c.prototype.keyUp=function(a){this.keys[a]=!1},c.prototype.sys=function(){throw new Error("stop")},c.prototype.clear=function(){for(let a=0;a<this.display.length;a+=1)this.display[a]=0},c.prototype.ret=function(){if(0===this.sp)throw new Error("Stack underflow error");this.sp-=1,this.pc=this.stack[this.sp]},c.prototype.jump=function(a){this.pc=a},c.prototype.call=function(a){if(this.sp>=this.stack.length)throw new Error("Stack overflow error");this.stack[this.sp]=this.pc,this.sp+=1,this.pc=a},c.prototype.skipIfEqual=function(a,b){this.V[a]===b&&(this.pc+=2)},c.prototype.skipIfNotEqual=function(a,b){this.V[a]!==b&&(this.pc+=2)},c.prototype.skipIfXY=function(a,b){this.V[a]===this.V[b]&&(this.pc+=2)},c.prototype.loadVx=function(a,b){this.V[a]=b},c.prototype.add=function(a,b){this.V[a]+=b},c.prototype.loadVxVy=function(a,b){this.V[a]=this.V[b]},c.prototype.orVxVy=function(a,b){this.V[a]|=this.V[b]},c.prototype.andVxVy=function(a,b){this.V[a]&=this.V[b]},c.prototype.xorVxVy=function(a,b){this.V[a]^=this.V[b]},c.prototype.addVxVy=function(a,b){this.V[15]=255<this.V[a]+this.V[b]?1:0,this.V[a]+=this.V[b]},c.prototype.subVxVy=function(a,b){this.V[15]=this.V[a]>this.V[b]?1:0,this.V[a]-=this.V[b]},c.prototype.shiftRight=function(a){this.V[15]=1&this.V[a],this.V[a]>>=1},c.prototype.subnVxVy=function(a,b){this.V[15]=this.V[b]>this.V[a]?1:0,this.V[a]=this.V[b]-this.V[a]},c.prototype.shiftLeft=function(a){this.V[15]=this.V[a]>>7,this.V[a]<<=1},c.prototype.skipIfNotEqualVxVy=function(a,b){this.V[a]!==this.V[b]&&(this.pc+=2)},c.prototype.loadI=function(a){this.I=a},c.prototype.jumpV0=function(a){this.pc=a+this.V[0]},c.prototype.random=function(a,b){this.V[a]=Math.floor(256*Math.random())&b},c.prototype.draw=function(a,b,c){this.V[15]=0;for(let d=0;d<c;d+=1){const c=this.memory[this.I+d];for(let e=0;8>e;e+=1)if(0!=(c&128>>e)){const c=this.V[a]+e+64*(this.V[b]+d);1===this.display[c]&&(this.V[15]=1),this.display[c]^=1}}},c.prototype.skipIfPressed=function(a){!0===this.keys[this.V[a]]&&(this.pc+=2)},c.prototype.skipIfNotPressed=function(a){!0!==this.keys[this.V[a]]&&(this.pc+=2)},c.prototype.loadVxDt=function(a){this.V[a]=this.dt},c.prototype.loadVxK=function(a){this.wait=a},c.prototype.delay=function(a){this.dt=this.V[a]},c.prototype.loadSoundTimer=function(a){this.st=this.V[a]},c.prototype.addI=function(a){this.I+=this.V[a]},c.prototype.loadF=function(a){this.I=5*this.V[a]},c.prototype.bcd=function(a){const b=this.V[a]%10,c=this.V[a]%100;this.memory[this.I]=(this.V[a]%1e3-c)/100,this.memory[this.I+1]=(c-b)/10,this.memory[this.I+2]=b},c.prototype.saveRegs=function(a){for(let b=0;b<=a;b+=1)this.memory[this.I+b]=this.V[b]},c.prototype.loadRegs=function(a){for(let b=0;b<=a;b+=1)this.V[b]=this.memory[this.I+b]},b.exports=c},{}],8:[function(a,b){function c(a){return a.toString(16).toUpperCase()}function d(a){return"0x"+("000"+c(a)).slice(-4)}function e(a){return`V${c(a)}`}function f(a){return`#${("0"+c(a)).slice(-2)}`}function g(a){return`#${("00"+c(a)).slice(-3)}`}function h(a,b){const h=a.memory[b]<<8|a.memory[b+1],i=4095&h,j=15&h>>8,k=15&h>>4,l=255&h,m=61440&h,n=61455&h,o=61695&h;switch(!0){case 224===o:return`${d(b)} - CLS`;case 238===o:return`${d(b)} - RET`;case 0===m:return`${d(b)} - SYS  ${g(i)}`;case 4096===m:return`${d(b)} - JP   ${g(i)}`;case 8192===m:return`${d(b)} - CALL ${g(i)}`;case 12288===m:return`${d(b)} - SE   ${e(j)}, ${f(l)}`;case 16384===m:return`${d(b)} - SNE  ${e(j)}, ${f(l)}`;case 20480===n:return`${d(b)} - SE   ${e(j)}, ${e(k)}`;case 24576===m:return`${d(b)} - LD   ${e(j)}, ${f(l)}`;case 28672===m:return`${d(b)} - ADD  ${e(j)}, ${f(l)}`;case 32768===n:return`${d(b)} - LD   ${e(j)}, ${e(k)}`;case 32769===n:return`${d(b)} - OR   ${e(j)}, ${e(k)}`;case 32770===n:return`${d(b)} - AND  ${e(j)}, ${e(k)}`;case 32771===n:return`${d(b)} - XOR  ${e(j)}, ${e(k)}`;case 32772===n:return`${d(b)} - ADD  ${e(j)}, ${e(k)}`;case 32773===n:return`${d(b)} - SUB  ${e(j)}, ${e(k)}`;case 32774===n:return`${d(b)} - SHR  ${e(j)}`;case 32775===n:return`${d(b)} - SUBN ${e(j)}, ${e(k)}`;case 32782===n:return`${d(b)} - SHL  ${e(j)}`;case 36864===n:return`${d(b)} - SNE  ${e(j)}, ${e(k)}`;case 40960===m:return`${d(b)} - LD   I, ${g(i)}`;case 45056===m:return`${d(b)} - JP   V0, ${g(i)}`;case 49152===m:return`${d(b)} - RND  ${e(j)}, ${f(l)}`;case 53248===m:return`${d(b)} - DRW  ${e(j)}, ${e(k)}, ${c(15&h)}`;case 57502===o:return`${d(b)} - SKP  ${e(j)}`;case 57505===o:return`${d(b)} - SKNP ${e(j)}`;case 61447===o:return`${d(b)} - LD   ${e(j)}, DT`;case 61450===o:return`${d(b)} - LD   ${e(j)}, K`;case 61461===o:return`${d(b)} - LD   DT, ${e(j)}`;case 61464===o:return`${d(b)} - LD   ST, ${e(j)}`;case 61470===o:return`${d(b)} - ADD  I, ${e(j)}`;case 61481===o:return`${d(b)} - LD   F, ${e(j)}`;case 61491===o:return`${d(b)} - LD   B, ${e(j)}`;case 61525===o:return`${d(b)} - LD   [I], ${e(j)}`;case 61541===o:return`${d(b)} - LD   ${e(j)}, [I]`;default:return`${d(b)} - ???`;}}const i=a("./chip8"),j=a("./assembler");b.exports=function(){const a=new i;return{vm:a,step:function(){if(null!==a.wait)return;const b=a.next(),c=4095&b,e=15&b,f=15&b>>8,g=15&b>>4,h=255&b;switch(61440&b){case 0:224===h?a.clear():238===h?a.ret():a.sys(c);break;case 4096:a.jump(c);break;case 8192:a.call(c);break;case 12288:a.skipIfEqual(f,h);break;case 16384:a.skipIfNotEqual(f,h);break;case 20480:switch(e){case 0:a.skipIfXY(f,g);break;default:throw new Error(`Invalid opcode: ${d(b)}`);}break;case 24576:a.loadVx(f,h);break;case 28672:a.add(f,h);break;case 32768:switch(e){case 0:a.loadVxVy(f,g);break;case 1:a.orVxVy(f,g);break;case 2:a.andVxVy(f,g);break;case 3:a.xorVxVy(f,g);break;case 4:a.addVxVy(f,g);break;case 5:a.subVxVy(f,g);break;case 6:a.shiftRight(f);break;case 7:a.subnVxVy(f,g);break;case 14:a.shiftLeft(f,g);break;default:throw new Error(`Invalid opcode: ${d(b)}`);}break;case 36864:switch(e){case 0:a.skipIfNotEqualVxVy(f,g);break;default:throw new Error(`Invalid opcode: ${d(b)}`);}break;case 40960:a.loadI(c);break;case 45056:a.jumpV0(c);break;case 49152:a.random(f,h);break;case 53248:a.draw(f,g,e);break;case 57344:switch(h){case 158:a.skipIfPressed(f);break;case 161:a.skipIfNotPressed(f);break;default:throw new Error(`Invalid opcode: ${d(b)}`);}break;case 61440:switch(h){case 7:a.loadVxDt(f);break;case 10:a.loadVxK(f);break;case 21:a.delay(f);break;case 24:a.loadSoundTimer(f);break;case 30:a.addI(f);break;case 41:a.loadF(f);break;case 51:a.bcd(f);break;case 85:a.saveRegs(f);break;case 101:a.loadRegs(f);break;default:throw new Error(`Invalid opcode: ${d(b)}`);}break;default:throw new Error(`Invalid opcode: ${d(b)}`);}},load:function(b){a.load(b)},assemble:j,disassemble:h.bind(null,a),keyDown(b){a.keyDown(b)},keyUp(b){a.keyUp(b)}}},b.exports.assemble=j},{"./assembler":6,"./chip8":7}],9:[function(a,b){function d(a,b){this.type=a,this.value=b}const c=new Set(["ADD","AND","BYTE","CALL","CLS","DRW","JP","LD","OR","RET","RND","SE","SHL","SHR","SKNP","SKP","SNE","SUB","SUBN","SYS","XOR"]);b.exports=function(a){function b(){const b=s;return q+=1,"\n"===s&&(r=0),r+=1,s=a.charAt(q),b}function e(a){return"a"<=a&&"z">=a}function f(a){return"A"<=a&&"Z">=a}function g(a){return"0"<=a&&"9">=a}function h(){for(;q<a.length&&(" "===s||"\t"===s||"\n"===s);)b()}function i(){for(;q<a.length&&"\n"!==s;)b()}function j(){b();let a="";for(;g(s)||"A"<=s&&"F">=s||"a"<=s&&"f">=s;)a+=b();const c=parseInt(a,16);if(!isNaN(c))return new d("Literal",c);throw new Error("Syntax error: Expected hex literal")}function k(){b();let a="";for(;"."===s||"0"===s||"1"===s;)a+="1"===s?"1":"0",b();const c=parseInt(a,2);if(!isNaN(c))return new d("Literal",c);throw new Error("Syntax error: Expected binary literal")}function l(){let a="";for("-"===s&&(a+=b());g(s);)a+=b();const c=parseInt(a,10);if(!isNaN(c))return new d("Literal",c);throw new Error("Syntax error: Expected decimal literal")}function m(){const c=s;let e="";for(b();;){if(s===c)return new d("String",e);if(q>=a.length||"\n"===s)throw new Error("Parse error: unexpected newline before string terminator");e+=b()}}function n(){if("["===s&&(b(),("I"===s||"i"===s)&&(b(),"]"===s)))return b(),new d("EffectiveAddress",null);throw new Error("Parse error: Illegal effective address")}function o(){let a="";const h=r;if(f(s)||e(s)){for(a+=b();f(s)||e(s)||g(s)||"_"===s;)a+=b();const i=a.toUpperCase();switch(!0){case 1==h:return new d("Label",a);case"B"===i:case"F"===i:case"I"===i:case"K"===i:case"DT"===i:case"ST"===i:return new d(i,null);case c.has(i):return new d("Instruction",i);case /^V[0-9A-F]$/.test(i):return new d("V",parseInt(a.slice(1),16));default:return new d("Identifier",a);}}throw new Error(`Parse error: unexpected character ${s}`)}function p(){if(h(),q>=a.length)return null;switch(!0){case";"===s:return i(),p();case","===s:return b(1),new d("Comma",null);case"#"===s:return j();case"%"===s:return k();case"-"===s||"0"<=s&&"9">=s:return l();case"\""===s||"`"===s||"'"===s:return m();case"["===s:return n();default:return o();}}let q=0,r=1,s=a.charAt(q);return{nextToken:p}}},{}]},{},[2]);