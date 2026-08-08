import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js';

const $=id=>document.getElementById(id);
const game=$('game');
const state={hp:100,qi:100,xp:0,level:1,attacking:false,dialogue:false,quest:0,keys:{}};
let scene,camera,renderer,player,enemy,clock,worldGroup;
const velocity=new THREE.Vector3();
const moveDir=new THREE.Vector3();

function makeMat(color,rough=.85){return new THREE.MeshStandardMaterial({color,roughness:rough});}
function box(w,h,d,c){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),makeMat(c));}
function cylinder(r,h,c){return new THREE.Mesh(new THREE.CylinderGeometry(r,r*.82,h,10),makeMat(c));}
function addTree(x,z,s=1){const g=new THREE.Group();const trunk=cylinder(.25*s,1.6*s,0x4b3326);trunk.position.y=.8*s;g.add(trunk);for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.ConeGeometry((1.25-i*.2)*s,2.2*s,8),makeMat(i===2?0x163b32:0x1d5140));crown.position.y=(2+i*1.05)*s;g.add(crown)}g.position.set(x,0,z);worldGroup.add(g);}
function addBuilding(x,z,scale=1){const g=new THREE.Group();const body=box(3.8*scale,2.4*scale,3*scale,0x75563d);body.position.y=1.2*scale;g.add(body);const roof=new THREE.Mesh(new THREE.ConeGeometry(2.8*scale,1.5*scale,4),makeMat(0x332b2b));roof.rotation.y=Math.PI/4;roof.position.y=3*scale;g.add(roof);g.position.set(x,0,z);worldGroup.add(g);}
function createWorld(){
 scene=new THREE.Scene();scene.fog=new THREE.Fog(0x0b2421,30,105);scene.background=new THREE.Color(0x102f2d);
 camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,200);camera.position.set(0,8,12);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;game.innerHTML='';game.appendChild(renderer.domElement);
 const hemi=new THREE.HemisphereLight(0xa9d8d0,0x18251f,2.1);scene.add(hemi);const moon=new THREE.DirectionalLight(0xd8e6dc,2.4);moon.position.set(-20,35,10);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);scene.add(moon);
 worldGroup=new THREE.Group();scene.add(worldGroup);
 const ground=box(100,.5,100,0x173c31);ground.position.y=-.3;ground.receiveShadow=true;worldGroup.add(ground);
 const river=box(8,.08,82,0x286d68);river.position.set(12,.01,0);river.rotation.y=-.12;worldGroup.add(river);
 const path=box(5,.1,80,0x746247);path.position.set(-2,.03,0);path.rotation.y=.18;worldGroup.add(path);
 for(let i=0;i<55;i++){const a=Math.random()*Math.PI*2,r=25+Math.random()*30;addTree(Math.cos(a)*r,Math.sin(a)*r,.7+Math.random()*.7)}
 for(let i=0;i<6;i++)addBuilding(-17+i*3.6,-9+(i%2)*4,.8);
 const shrine=box(5,.3,5,0x5c4b39);shrine.position.set(20,.2,18);worldGroup.add(shrine);const torii1=box(.45,5,.45,0x8b4939);torii1.position.set(18,2.5,18);const torii2=torii1.clone();torii2.position.x=22;const beam=box(5.5,.45,.45,0x9a4d39);beam.position.set(20,5,18);worldGroup.add(torii1,torii2,beam);
 player=createPlayer();enemy=createEnemy();
}
function createPlayer(){const g=new THREE.Group();const body=cylinder(.55,1.7,0x294d49);body.position.y=1.1;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.42,12,8),makeMat(0xd1a17e));head.position.y=2.2;g.add(head);const hair=cylinder(.46,.35,0x172322);hair.position.y=2.52;g.add(hair);const sword=box(.12,2.3,.18,0xd7d7c4);sword.position.set(.75,1.3,0);sword.rotation.z=-.35;g.add(sword);g.position.set(0,0,8);g.traverse(o=>o.castShadow=true);scene.add(g);return g;}
function createEnemy(){const g=new THREE.Group();const body=cylinder(.8,2.2,0x416e66);body.position.y=1.3;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.5,12,8),makeMat(0xc4e4d7));head.position.y=2.7;g.add(head);g.position.set(0,0,-9);g.traverse(o=>o.castShadow=true);scene.add(g);return g;}
function updateHud(){$('hpBar').style.width=state.hp+'%';$('qiBar').style.width=state.qi+'%';$('xp').textContent=state.xp;$('level').textContent=state.level;}
function attack(){if(state.attacking)return;const d=player.position.distanceTo(enemy.position);if(d>5||enemy.visible===false){toast('Move closer to the Mist Wraith');return}state.attacking=true;player.rotation.y+=.8;setTimeout(()=>{enemy.scale.multiplyScalar(.72);state.xp+=35;toast('Sword strike · +35 XP');if(state.xp>=100){state.level++;state.xp-=100;toast('Level up! Wanderer reached Lv. '+state.level)}updateHud();state.attacking=false;if(enemy.scale.x<.22){enemy.visible=false;toast('Mist Wraith defeated · quest updated');state.quest=1;$('questTitle').textContent='The Drowned Bell';$('questText').textContent='Travel to the Old Moon Shrine.'}},260)}
function dash(){if(state.qi<18){toast('Not enough Qi');return}state.qi-=18;moveDir.set(0,0,-1).applyQuaternion(player.quaternion);player.position.add(moveDir.multiplyScalar(5));updateHud();toast('Cloudstep');}
function interact(){const d=player.position.distanceTo(enemy.position);if(enemy.visible&&d<7){dialogue('Mist Wraith','A pale guardian blocks the ancient road. Something deeper beneath the shrine is calling it.',['Draw your blade','Leave it alone']);return}dialogue('Lantern Keeper','Blue lanterns appeared the night the valley bell sank. The old shrine lies beyond the river.',['I will find the bell.','What happened here?']);}
function dialogue(s,t,choices){$('speaker').textContent=s;$('dialogueText').textContent=t;$('choices').innerHTML=choices.map((c,i)=>`<button>${c}</button>`).join('');$('dialogue').classList.remove('hidden');document.querySelectorAll('#choices button').forEach((b,i)=>b.onclick=()=>{$('dialogue').classList.add('hidden');if(s==='Mist Wraith'&&i===0)attack();else toast('Quest updated')})}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>$('toast').classList.remove('show'),1800)}
function movePlayer(dt){moveDir.set(0,0,0);if(state.keys.w||state.keys.ArrowUp)moveDir.z-=1;if(state.keys.s||state.keys.ArrowDown)moveDir.z+=1;if(state.keys.a||state.keys.ArrowLeft)moveDir.x-=1;if(state.keys.d||state.keys.ArrowRight)moveDir.x+=1;if(moveDir.lengthSq()){moveDir.normalize();player.position.addScaledVector(moveDir,dt*8);player.rotation.y=Math.atan2(moveDir.x,moveDir.z);state.qi=Math.min(100,state.qi+dt*4);updateHud()}player.position.x=Math.max(-42,Math.min(42,player.position.x));player.position.z=Math.max(-42,Math.min(42,player.position.z));camera.position.lerp(new THREE.Vector3(player.position.x,player.position.y+7,player.position.z+10),.08);camera.lookAt(player.position.x,1.4,player.position.z);}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);movePlayer(dt);if(enemy.visible){enemy.position.y=0.15+Math.sin(performance.now()*.002)*.18;enemy.rotation.y+=dt*.5}renderer.render(scene,camera)}
let joy=false,lastX=0,lastY=0;
$('attack').onclick=attack;$('dash').onclick=dash;$('interact').onclick=interact;$('menuBtn').onclick=()=>$('menu').classList.remove('hidden');$('closeMenu').onclick=()=>$('menu').classList.add('hidden');$('resume').onclick=()=>$('menu').classList.add('hidden');
$('joystick').addEventListener('pointerdown',e=>{joy=true;lastX=e.clientX;lastY=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)});$('joystick').addEventListener('pointermove',e=>{if(!joy)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>5){state.keys.a=dx<0;state.keys.d=dx>0;state.keys.w=dy<0;state.keys.s=dy>0;lastX=e.clientX;lastY=e.clientY}});['pointerup','pointercancel'].forEach(ev=>$('joystick').addEventListener(ev,()=>{joy=false;state.keys.a=state.keys.d=state.keys.w=state.keys.s=false}));
window.addEventListener('keydown',e=>{state.keys[e.key]=true;if(e.key===' ')attack();if(e.key.toLowerCase()==='e')interact();if(e.key.toLowerCase()==='shift')dash()});window.addEventListener('keyup',e=>state.keys[e.key]=false);window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
createWorld();clock=new THREE.Clock();updateHud();$('locationName').textContent='Moonreed Valley';setTimeout(()=>$('loading').classList.add('gone'),900);setTimeout(()=>toast('Explore Moonreed Valley'),1200);animate();
