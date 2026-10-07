export function initializeWordFamilies(families) {
'use strict';

const categories = ['Verb','Noun','Adjective 1','Adjective 2','Adverb'];
const rows = document.getElementById('practice-rows');
const feedback = document.getElementById('feedback');
const lockIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="6" y="10" width="12" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v2"/></svg>';
let deck = [], round = [], roundNumber = 0, seen = new Set(), revealed = false;
function shuffled(items) { const result = items.slice(); for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; } return result; }
function normalize(value) { return value.trim().toLowerCase().replace(/[\u2010-\u2015]/g,'-').replace(/\s+/g,' '); }
function equivalentGroup(form, value) { return form && form.some(word=>normalize(word)===normalize(value)); }
function inputFor(rowIndex,colIndex) { return document.getElementById('answer-'+rowIndex+'-'+colIndex); }
function clearState(input) { clearNotes(input); input.parentElement.className='cell'; const mark=input.parentElement.querySelector('.mark'); if(mark)mark.remove(); input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
function setState(input,state,message) {
  clearState(input); input.parentElement.classList.add(state);
  if(state==='incorrect'||state==='missing') input.setAttribute('aria-invalid','true');
  const mark=document.createElement('span'); mark.className='mark';mark.textContent=state==='correct'?'✓':state==='answer'?'':state==='missing'?'·':'!';mark.setAttribute('aria-hidden','true');input.parentElement.appendChild(mark);
  const note=document.createElement('span');note.className='sr-only';note.id=input.id+'-note';note.textContent=message;input.parentElement.appendChild(note);input.setAttribute('aria-describedby',note.id);
}
function clearNotes(input) { input.parentElement.querySelectorAll('.sr-only').forEach(note=>note.remove()); }
function newRound() {
  round = [];
  while(round.length<1) {
    if(!deck.length) deck=shuffled(families);
    const family=deck.shift();
    if(round.some(item=>item.family.id===family.id)) { deck.push(family); continue; }
    const available=family.forms.map((form,i)=>form?i:-1).filter(i=>i!==-1);
    const clue=available[Math.floor(Math.random()*available.length)];
    round.push({family,clue}); seen.add(family.id);
  }
  roundNumber++; revealed=false; rows.replaceChildren();
  round.forEach(({family,clue},rowIndex)=> {
    const tr=document.createElement('tr');tr.dataset.family=family.id;
    const number=document.createElement('th');number.scope='row';number.textContent=String(rowIndex+1).padStart(2,'0');tr.appendChild(number);
    family.forms.forEach((form,colIndex)=> {
      const td=document.createElement('td');
      if(!form) { const block=document.createElement('div');block.className='blocked';block.innerHTML=lockIcon;block.title=categories[colIndex]+' is not tested in this family';const note=document.createElement('span');note.className='sr-only';note.textContent=block.title;block.appendChild(note);td.appendChild(block); }
      else if(colIndex===clue) { const given=document.createElement('div');given.className='given';const word=document.createElement('span');word.textContent=form[0];given.appendChild(word);const label=document.createElement('span');label.className='given-label';label.textContent='given';given.appendChild(label);const sr=document.createElement('span');sr.className='sr-only';sr.textContent=' (revealed word)';given.appendChild(sr);td.appendChild(given); }
      else { const cell=document.createElement('div');cell.className='cell';const input=document.createElement('input');input.type='text';input.id='answer-'+rowIndex+'-'+colIndex;input.dataset.row=rowIndex;input.dataset.col=colIndex;input.autocomplete='off';input.spellcheck=false;input.autocapitalize='none';input.setAttribute('autocorrect','off');input.placeholder='Your word';input.setAttribute('aria-label','Row '+(rowIndex+1)+', '+categories[colIndex]+', related to '+family.forms[clue][0]);input.addEventListener('input',()=>{clearNotes(input);clearState(input);if(!revealed)feedback.textContent='Answer updated.';});input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();checkAnswers();}});cell.appendChild(input);td.appendChild(cell); }
      tr.appendChild(td);
    });rows.appendChild(tr);
  });
  document.getElementById('round-number').textContent='Round '+String(roundNumber).padStart(2,'0');
  document.getElementById('coverage').textContent=seen.size+' / '+families.length;
  document.getElementById('check').disabled=false;document.getElementById('reveal').disabled=false;
  feedback.textContent='';
}
function assess() {
  const results=[];
  round.forEach(({family,clue},rowIndex)=> {
    const adjectiveColumns=[2,3].filter(col=>family.forms[col]);
    const adjectiveForms=adjectiveColumns.map(col=>family.forms[col]);
    // Each adjective slot can hold either target group. Spelling variants belong to one group.
    const usedGroups=new Set();
    if(clue===2||clue===3) usedGroups.add(adjectiveColumns.indexOf(clue));
    family.forms.forEach((form,colIndex)=> {
      const input=inputFor(rowIndex,colIndex); if(!input)return;
      const value=normalize(input.value); let valid=false;
      if(colIndex===2||colIndex===3) {
        const group=adjectiveForms.findIndex(forms=>equivalentGroup(forms,value));
        valid=group>=0&&!usedGroups.has(group);
        if(valid)usedGroups.add(group);
      } else valid=equivalentGroup(form,value);
      results.push({input,rowIndex,colIndex,valid,empty:!value});
    });
  });return results;
}
function checkAnswers() {
  if(revealed)return;
  const results=assess();const correct=results.filter(r=>r.valid).length;
  results.forEach(({input,valid,empty})=> {clearNotes(input);setState(input,valid?'correct':empty?'missing':'incorrect',valid?'Correct':empty?'Missing answer':'Review this form; use a different adjective group in each slot.');});
  feedback.replaceChildren();const strong=document.createElement('strong');strong.textContent=correct+' / '+results.length+' correct';feedback.appendChild(strong);

}
function showAnswers() {
  if(revealed)return;
  const results=assess();const correct=results.filter(r=>r.valid).length;
  round.forEach(({family,clue},rowIndex)=> {
    const adjectiveColumns=[2,3].filter(col=>family.forms[col]);
    const adjectiveForms=adjectiveColumns.map(col=>family.forms[col]);const used=new Set();
    if(clue===2||clue===3)used.add(adjectiveColumns.indexOf(clue));
    // Preserve all valid student adjectives before assigning the remaining answer.
    results.filter(r=>r.rowIndex===rowIndex&&r.valid&&(r.colIndex===2||r.colIndex===3)).forEach(r=>used.add(adjectiveForms.findIndex(forms=>equivalentGroup(forms,r.input.value))));
    results.filter(r=>r.rowIndex===rowIndex).forEach(({input,colIndex,valid})=> {
      clearNotes(input);
      if(!valid) {
        if(colIndex===2||colIndex===3) {const group=adjectiveForms.findIndex((_,i)=>!used.has(i));input.value=adjectiveForms[group][0];used.add(group);}
        else input.value=family.forms[colIndex][0];
      }
      input.readOnly=true;setState(input,valid?'correct':'answer',valid?'Your correct answer':'Answer from the word bank');
    });
  });
  revealed=true;document.getElementById('check').disabled=true;document.getElementById('reveal').disabled=true;
  feedback.textContent='Answers shown · '+correct+' / '+results.length+' correct before reveal.';
}
function renderBank() {
  const body=document.getElementById('bank-rows');if(body.children.length)return;
  const fragment=document.createDocumentFragment();
  families.forEach(family=>{const tr=document.createElement('tr');const number=document.createElement('th');number.scope='row';number.textContent=family.id;tr.appendChild(number);family.forms.forEach(form=>{const td=document.createElement('td');td.textContent=form?form.join(' / '):'—';if(!form){td.className='empty';td.setAttribute('aria-label','Not tested in this family');}tr.appendChild(td);});fragment.appendChild(tr);});body.appendChild(fragment);
}
document.getElementById('check').addEventListener('click',checkAnswers);
document.getElementById('reveal').addEventListener('click',showAnswers);
document.getElementById('next').addEventListener('click',()=>{newRound();const input=rows.querySelector('input');if(input)input.focus({preventScroll:true});});
document.getElementById('bank').addEventListener('toggle',event=>{if(event.currentTarget.open)renderBank();});
// Fail early if an edited bank has malformed or overlapping target groups.
function validateFamilies(bank) {
  if(bank.length!==300)throw new Error('The word bank must contain 300 families.');
  const ids=new Set();
  bank.forEach(({id,forms})=> {
    if(!Number.isInteger(id)||ids.has(id)||!Array.isArray(forms)||forms.length!==5)
      throw new Error('Invalid family record: '+id);
    ids.add(id);
    if(forms.filter(Boolean).length<2)throw new Error('A family needs a clue and an answer: '+id);
    forms.forEach(group=> {
      if(group===null)return;
      if(!Array.isArray(group)||!group.length||group.some(word=>typeof word!=='string'||!word.trim()))
        throw new Error('Invalid answer group: '+id);
      if(new Set(group.map(normalize)).size!==group.length)throw new Error('Duplicate answer: '+id);
    });
    if(forms[2]&&forms[3]&&forms[2].some(word=>equivalentGroup(forms[3],word)))
      throw new Error('Adjective groups overlap: '+id);
  });
}
validateFamilies(families);
newRound();
const easyPanel=document.getElementById('easy-workspace');
const hardPanel=document.querySelector('[aria-labelledby="round-title"]');
const hardNote=document.querySelector('.under-table');
const intro=document.querySelector('.instructions');
const hardIntro=intro.innerHTML;
const hardInstructionNote=document.querySelector('.instruction-note');
const easyFeedback=document.getElementById('easy-feedback');
const cloud=document.getElementById('word-cloud');
const targets=document.getElementById('easy-targets');
const easyCategories=['Verb','Noun','Adjective','Adverb'];
const easyDescriptions=['an action or state','a person, thing or idea','a describing word','how, when or to what extent'];
const colors=['#e8def9','#d9eee5','#ffe5d5','#dceafa','#fae0ea','#f8efce'];
let easyDeck=[],easySeen=new Set(),easyCount=0,easyWords=[],selectedWord=null,easyRevealed=false;
function selectWord(id){
  selectedWord=selectedWord===id?null:id;
  document.querySelectorAll('.word-card').forEach(card=>card.setAttribute('aria-pressed',String(Number(card.dataset.word)===selectedWord)));
  easyFeedback.textContent=selectedWord===null?'Select a word to move it.':'Selected '+easyWords[id].word+'. Choose a category.';
}
function placeWord(id,category){
  if(easyRevealed||!easyWords[id])return;
  easyWords[id].placed=category;selectedWord=null;
  drawEasy();easyFeedback.textContent='Word moved.';
}
function drawEasy(){
  easyPanel.classList.remove('is-complete');
  cloud.replaceChildren();targets.replaceChildren();
  easyCategories.forEach((name,category)=>{
    const target=document.createElement('div');target.className='word-target';
    const label=document.createElement('button');label.type='button';label.className='target-label';label.textContent=name;
    label.disabled=easyRevealed;label.setAttribute('aria-label','Place selected word in '+name);
    const small=document.createElement('small');small.textContent=easyDescriptions[category];label.appendChild(small);
    target.appendChild(label);const cards=document.createElement('div');cards.className='target-cards';target.appendChild(cards);
    target.addEventListener('click',event=>{if(!event.target.closest('.word-card')&&selectedWord!==null)placeWord(selectedWord,category);});
    target.addEventListener('dragover',event=>{if(!easyRevealed){event.preventDefault();target.classList.add('over');}});
    target.addEventListener('dragleave',()=>target.classList.remove('over'));
    target.addEventListener('drop',event=>{event.preventDefault();target.classList.remove('over');const raw=event.dataTransfer.getData('text/plain');if(/^word-\d+$/.test(raw))placeWord(Number(raw.slice(5)),category);});
    targets.appendChild(target);
  });
  easyWords.forEach((item,id)=>{
    const card=document.createElement('button');card.type='button';card.className='word-card';card.textContent=item.word;card.dataset.word=id;
    card.style.setProperty('--success-delay',Math.min(id*45,270)+'ms');
    card.style.setProperty('--tint',colors[id%colors.length]);card.style.setProperty('--delay',(-id*.65)+'s');
    card.draggable=!easyRevealed;card.disabled=easyRevealed;card.setAttribute('aria-pressed',String(id===selectedWord));
    card.addEventListener('click',()=>selectWord(id));
    card.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain','word-'+id);event.dataTransfer.effectAllowed='move';});
    if(item.placed===null)cloud.appendChild(card);else targets.children[item.placed].querySelector('.target-cards').appendChild(card);
  });
  if(!cloud.children.length){const note=document.createElement('span');note.className='empty-cloud';note.textContent='All words placed. Ready to check?';cloud.appendChild(note);}
}
function newEasyFamily(){
  if(!easyDeck.length)easyDeck=shuffled(families);
  const family=easyDeck.shift();easySeen.add(family.id);easyCount++;selectedWord=null;easyRevealed=false;
  // Pick once per target group; movements, checks and level switches reuse these cards.
  const words=family.forms.flatMap(forms=>{
    if(!forms)return [];
    const word=forms[Math.floor(Math.random()*forms.length)];
    // A representative shared by parts of speech still accepts any valid category.
    const allowed=[];
    family.forms.forEach((group,col)=>{
      if(equivalentGroup(group,word)){
        const category=col<2?col:col<4?2:3;
        if(!allowed.includes(category))allowed.push(category);
      }
    });
    return [{word,allowed,placed:null}];
  });
  easyWords=shuffled(words);drawEasy();
  document.getElementById('easy-round').textContent='Family '+String(easyCount).padStart(2,'0');
  document.getElementById('easy-coverage').textContent=easySeen.size+' of 300 families seen';
  document.getElementById('easy-check').disabled=false;document.getElementById('easy-reveal').disabled=false;
  easyFeedback.textContent='';
}
function checkEasy(){
  let correct=0;let remaining=0;
  easyWords.forEach((item,id)=>{const valid=item.allowed.includes(item.placed);if(valid)correct++;if(item.placed===null)remaining++;const card=document.querySelector('[data-word="'+id+'"]');card.classList.remove('good','wrong');card.classList.add(valid?'good':'wrong');card.setAttribute('aria-label',item.word+(valid?', correct':item.placed===null?', not placed':', try another category'));});
  if(correct===easyWords.length&&easyWords.length){
    easyPanel.classList.add('is-complete');
    const note=cloud.querySelector('.empty-cloud');if(note)note.textContent='Every word is in the right place.';
  }else easyPanel.classList.remove('is-complete');
  easyFeedback.textContent=correct+' / '+easyWords.length+' correct'+(correct===easyWords.length?' — Complete! Ready for the next family?':' — '+remaining+' unplaced. Move any highlighted words and check again.');
}
function setLevel(level){
  const easy=level==='easy';easyPanel.hidden=!easy;hardPanel.hidden=easy;hardNote.hidden=easy;hardInstructionNote.hidden=easy;
  document.getElementById('level-easy').setAttribute('aria-pressed',String(easy));document.getElementById('level-hard').setAttribute('aria-pressed',String(!easy));
  intro.innerHTML=easy?'Sort the words by their part of speech.':hardIntro;
}
document.getElementById('level-easy').addEventListener('click',()=>setLevel('easy'));
document.getElementById('level-hard').addEventListener('click',()=>setLevel('hard'));
document.getElementById('easy-next').addEventListener('click',newEasyFamily);
document.getElementById('easy-check').addEventListener('click',checkEasy);
document.getElementById('easy-reveal').addEventListener('click',()=>{easyWords.forEach(item=>{if(!item.allowed.includes(item.placed))item.placed=item.allowed[0];});selectedWord=null;easyRevealed=true;drawEasy();document.getElementById('easy-check').disabled=true;document.getElementById('easy-reveal').disabled=true;easyFeedback.textContent='Answers shown. Each word is in a matching category.';});
newEasyFamily();setLevel('easy');
}
