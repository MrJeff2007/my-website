const $=id=>document.getElementById(id);
const game=$('game');
const state={x:50,y:55,hp:100,qi:100,xp:0,level:1,attacking:false,dialogue:false,enemy:{x:67,y:48,hp:100,alive:true},day:0};
const terrain=[
 {x:12,y:18,w:26,h:18,c:'#163d36'}, {x:64,y:12,w:25,h:22,c:'#183b34'}, {x:7,y:65,w:25,h:25,c:'#194238'},
 {x:69,y:65,w:23,h:24,c:'#15382f'}, {x:38,y:4,w:12,h:16,c:'#254c3e'}, {x:37,y:76,w:15,h:20,c:'#20483a'}
];
function buildWorld(){
 game.innerHTML=`<div class="sky"></div><div class="moon"></div><div class="mountains m1"></div><div class="mountains m2"></div><div class="river"></div><div class="path"></div><div class="village"><span>Moonreed Village</span><i></i><i></i><i></i></div><div class="shrine">◈</div><div class="trees"></div><div id="hero" class="hero"><div class="cloak"></div><div class="head"></div><div class="sword"></div></div><div id="enemy" class="enemy"><div></div></div><div class="lanterns"><i></i><i></i><i></i><i></i></div>`;
 $('enemy').style.left=state.enemy.x+'%';$('enemy').style.top=state.enemy.y+'%';
}
function move(dx,dy){state.x=Math.max(5,Math.min(95,state.x+dx));state.y=Math.max(10,Math.min(90,state.y+dy));$('hero').style.left=state.x+'%';$('hero').style.top=state.y+'%';updateLocation();}
function updateLocation(){let n='Whispering Fields';if(state.x<35)n='Moonreed Village';else if(state.x>68)n='Mistwood Grove';else if(state.y<35)n='Jadewater Cliffs';else if(state.y>72)n='Old Moon Shrine';$('locationName').textContent=n;}
function attack(){if(!state.enemy.alive||state.attacking)return;state.attacking=true;$('hero').classList.add('slash');setTimeout(()=>{state.enemy.hp-=34;if(state.enemy.hp<=0){state.enemy.alive=false;$('enemy').classList.add('dead');state.xp+=70;toast('Mist Wraith defeated · +70 XP');if(state.xp>=100){state.level++;state.xp-=100;toast('Level up! Wanderer reached Lv. '+state.level)}$('xp').textContent=state.xp;$('level').textContent=state.level;}else toast('Perfect strike · '+state.enemy.hp+' HP remaining');$('hero').classList.remove('slash');state.attacking=false;},260);}
function dash(){state.qi=Math.max(0,state.qi-18);$('qiBar').style.width=state.qi+'%';move(7,0);$('hero').classList.add('dash');setTimeout(()=>$('hero').classList.remove('dash'),220);}
function interact(){if(Math.hypot(state.x-state.enemy.x,state.y-state.enemy.y)<15&&state.enemy.alive){dialogue('Mist Wraith','A pale creature coils around the reeds. Its silence feels like a warning.',['Attack the wraith','Back away']);return} dialogue('Lantern Keeper','The moon has gone quiet. Three nights ago, every lantern in the valley turned blue. Find the drowned bell beneath the old shrine.',['I will find it.','Tell me more.']);}
function dialogue(s,t,choices){state.dialogue=true;$('speaker').textContent=s;$('dialogueText').textContent=t;$('choices').innerHTML=choices.map((c,i)=>`<button data-c="${i}">${c}</button>`).join('');$('dialogue').classList.remove('hidden');document.querySelectorAll('#choices button').forEach(b=>b.onclick=()=>{if(b.dataset.c==='0'&&s==='Mist Wraith')attack();else toast('Quest updated');$('dialogue').classList.add('hidden');state.dialogue=false});}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>$('toast').classList.remove('show'),1800)}
let joy=false,lastX=0,lastY=0;
$('attack').onclick=attack;$('dash').onclick=dash;$('interact').onclick=interact;
$('menuBtn').onclick=()=>$('menu').classList.remove('hidden');$('closeMenu').onclick=()=>$('menu').classList.add('hidden');$('resume').onclick=()=>$('menu').classList.add('hidden');
$('joystick').addEventListener('pointerdown',e=>{joy=true;lastX=e.clientX;lastY=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)});
$('joystick').addEventListener('pointermove',e=>{if(!joy)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>8){move(dx*.035,dy*.035);lastX=e.clientX;lastY=e.clientY}});$('joystick').addEventListener('pointerup',()=>joy=false);$('joystick').addEventListener('pointercancel',()=>joy=false);
window.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();attack()}if(e.key.toLowerCase()==='e')interact();if(e.key.toLowerCase()==='shift')dash();const k={w:[0,-2],s:[0,2],a:[-2,0],d:[2,0]}[e.key.toLowerCase()];if(k)move(...k)});
buildWorld();$('hpBar').style.width=state.hp+'%';$('qiBar').style.width=state.qi+'%';$('hero').style.left=state.x+'%';$('hero').style.top=state.y+'%';
setTimeout(()=>$('loading').classList.add('gone'),900);setTimeout(()=>toast('Explore Moonreed Valley'),1200);
