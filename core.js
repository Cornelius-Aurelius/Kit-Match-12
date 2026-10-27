/* Kit Match 12 — Matchday Academy. Original game by Cornelius Aurelius. */
(function(root,factory){const game=factory();if(typeof module==='object'&&module.exports)module.exports=game;root.KitMatch12=game;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TOTAL=30;
const FIELDS=['pattern','shortsMark','sockBand','badge','sleeve'];
const VALUES={
 pattern:['stripes','hoops','sash','checks','solid'],
 shortsMark:['side stripe','chevron','double stripe','plain'],
 sockBand:['top band','double band','hoops','plain'],
 badge:['shield','star','diamond','circle'],
 sleeve:['stripe','double stripe','block','plain']
};
const COLORS=[['#ed4d6a','#14cfb8'],['#468fff','#ad7cff'],['#f6ad45','#69b86b'],['#d8e8f6','#4d6a9a'],['#f0df6f','#d9a4df'],['#e66c6c','#7bc9cc']];
function seeded(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;}}
function pick(arr,rng){return arr[Math.floor(rng()*arr.length)];}
function shuffle(arr,rng){for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function same(a,b){return FIELDS.every(k=>a[k]===b[k])&&a.shirt===b.shirt;}
function difference(a,b){return FIELDS.filter(k=>a[k]!==b[k]);}
function pretty(field){return {pattern:'shirt pattern',shortsMark:'shorts marking',sockBand:'sock marking',badge:'club badge',sleeve:'sleeve marking'}[field]||field;}
function count(stage){return stage<=3?3:stage<=7?4:stage<=12?5:stage<=18?6:stage<=24?7:8;}
function seconds(stage){return Math.max(14,27-Math.floor((stage-1)*0.43));}
function makeLevel(stage,salt=0){
 if(!Number.isInteger(stage)||stage<1||stage>TOTAL)throw Error('Stage must be 1 to 30');
 const rng=seeded((stage*98751+salt*15485863+0xa5b378dc)>>>0);
 const colours=COLORS[Math.floor((stage-1)/5)];
 const base={shirt:colours[0],accent:colours[1]};
 FIELDS.forEach(k=>{base[k]=pick(VALUES[k],rng)});
 const correct={id:'match',number:pick([4,5,6,7,8,9,10,11,14,16,17,19,21,23],rng),kit:{...base},correct:true};
 const choices=[correct],usedNumbers=new Set([correct.number,12]);
 const usedKeys=new Set([signature(base)]);
 for(let i=0;i<count(stage)-1;i++){
  let candidate,changes;
  for(let attempt=0;attempt<50;attempt++){
   candidate={...base};
   const width=stage<=7?Math.min(3,2+Math.floor(rng()*2)):stage<=17?(i%3===0?2:1):1;
   changes=shuffle([...FIELDS],rng).slice(0,width);
   changes.forEach(k=>{candidate[k]=pick(VALUES[k].filter(x=>x!==base[k]),rng)});
   if(!usedKeys.has(signature(candidate)))break;
  }
  if(usedKeys.has(signature(candidate)))throw Error('Could not make unique decoy');
  usedKeys.add(signature(candidate));
  let number;do{number=2+Math.floor(rng()*27)}while(usedNumbers.has(number));usedNumbers.add(number);
  choices.push({id:'option-'+i,number,kit:candidate,correct:false});
 }
 shuffle(choices,rng);
 const distinct=choices.filter(x=>same(base,x.kit));
 if(distinct.length!==1||!distinct[0].correct)throw Error('Level uniqueness failure');
 return {stage,reference:base,choices,correctId:correct.id,par:seconds(stage),count:count(stage),chapter:Math.ceil(stage/5),hintField:pick(FIELDS,rng)};
}
function signature(k){return [k.shirt,...FIELDS.map(f=>k[f])].join('|');}
function correctAnswer(level,id){return level.choices.find(x=>x.id===id)?.correct===true;}
function points(streak,remaining,hintUsed,mode){if(mode==='practice')return 0;return Math.max(20,100+Math.min(10,streak)*12+Math.round(Math.max(0,remaining)*3)-(hintUsed?35:0));}
function title(stage){return ['First Touch','Read the Stripes','Spot the Detail','Full Kit Vision','Under Pressure','Hidden Number 12'][Math.ceil(stage/5)-1]}
return {TOTAL,FIELDS,VALUES,makeLevel,same,difference,pretty,correctAnswer,points,seconds,count,title};
});