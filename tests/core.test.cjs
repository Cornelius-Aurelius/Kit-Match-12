const test=require('node:test'),assert=require('node:assert/strict');
const g=require('../core.js');
test('all thirty stages have exactly one full kit match across many seeds',()=>{
 for(let salt=0;salt<10;salt++)for(let stage=1;stage<=30;stage++){
  let v=g.makeLevel(stage,salt);
  assert.equal(v.choices.length,g.count(stage));
  assert.equal(v.choices.filter(x=>g.same(x.kit,v.reference)).length,1);
  assert.equal(v.choices.filter(x=>x.correct).length,1);
  assert.ok(v.choices.every(x=>x.number!==12));
  assert.equal(new Set(v.choices.map(x=>x.number)).size,v.choices.length);
  assert.equal(new Set(v.choices.map(x=>x.id)).size,v.choices.length);
  assert.ok(v.choices.filter(x=>!x.correct).every(x=>g.difference(x.kit,v.reference).length>=1));
 }
});
test('stage difficulty increases in size while time remains generous',()=>{
 assert.equal(g.count(1),3);assert.equal(g.count(30),8);
 for(let n=2;n<=30;n++){assert.ok(g.count(n)>=g.count(n-1));assert.ok(g.seconds(n)<=g.seconds(n-1));}
 assert.ok(g.seconds(30)>=14);
});
test('answers and differences are verified independently',()=>{
 for(let stage=1;stage<=30;stage++){
  const level=g.makeLevel(stage);
  for(const p of level.choices)assert.equal(g.correctAnswer(level,p.id),p.correct);
  assert.equal(g.correctAnswer(level,'bogus'),false);
 }
});
test('score rewards precision and does not pay practice or exploit hints',()=>{
 assert.equal(g.points(0,18,false,'practice'),0);
 assert.ok(g.points(5,18,false,'campaign')>g.points(1,18,false,'campaign'));
 assert.ok(g.points(5,18,true,'campaign')<g.points(5,18,false,'campaign'));
});
test('level generation deterministic, bounded and visually non-colour-only',()=>{
 assert.deepEqual(g.makeLevel(17,2),g.makeLevel(17,2));
 assert.throws(()=>g.makeLevel(0)); assert.throws(()=>g.makeLevel(31));
 assert.ok(g.makeLevel(30).choices.every(x=>x.correct||g.difference(x.kit,g.makeLevel(30).reference).length>=1));
});