const KEY='finance-ledger-v1';
const $=id=>document.getElementById(id);
let data=load(),tab='expected',editingId=null;
function load(){try{const d=JSON.parse(localStorage.getItem(KEY)||'null');return d&&Array.isArray(d.expected)&&Array.isArray(d.reality)?d:{expected:[],reality:[]}}catch{return {expected:[],reality:[]}}}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function euro(n){return new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR'}).format(n)}
function parseAmount(s){const v=String(s).trim().replace(/\s/g,'').replace(/[€]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.');const n=Number(v);return Number.isFinite(n)&&n>0?n:null}
function dateText(s){if(!s)return '';const [y,m,d]=s.split('-');return `${d}.${m}.${y}`}
function total(list){return list.reduce((a,x)=>a+x.amount,0)}
function current(){return data[tab]}
function matchedRealityIds(){return new Set(data.reality.filter(x=>x.matchId).map(x=>x.matchId))}
function render(){
 const q=$('search').value.trim().toLocaleLowerCase(),from=$('fromDate').value,to=$('toDate').value,mode=$('sortMode').value;
 $('expectedTotal').textContent=euro(total(data.expected));$('realityTotal').textContent=euro(total(data.reality));
 $('unmatchedTotal').textContent=euro(total(data.reality.filter(x=>!x.matchId)));
 $('expectedCount').textContent=data.expected.length;$('realityCount').textContent=data.reality.length;
 document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 let list=current().filter(x=>(x.description+' '+x.amount).toLocaleLowerCase().includes(q)&&(!from||x.date>=from)&&(!to||x.date<=to));
 if(mode==='date-asc')list.sort((a,b)=>a.date.localeCompare(b.date));
 else if(mode==='description')list.sort((a,b)=>a.description.localeCompare(b.description,'de',{sensitivity:'base'})||a.date.localeCompare(b.date));
 else list.sort((a,b)=>b.date.localeCompare(a.date));
 const root=$('entries');root.innerHTML='';
 if(mode==='description'){
  const groups=new Map();list.forEach(x=>{const k=x.description.trim().toLocaleLowerCase();if(!groups.has(k))groups.set(k,[]);groups.get(k).push(x)});
  [...groups.values()].forEach(items=>{const head=document.createElement('div');head.className='group-heading';const name=document.createElement('span');name.textContent=items[0].description;const sum=document.createElement('span');sum.className='group-total';sum.textContent=euro(total(items));head.append(name,sum);root.append(head);items.forEach(x=>root.append(makeEntry(x)))});
 }else list.forEach(x=>root.append(makeEntry(x)));
 $('empty').hidden=list.length!==0;
}
function makeEntry(x){
 const row=document.createElement('article');row.className='entry';
 const main=document.createElement('div');main.className='entry-main';
 const desc=document.createElement('div');desc.className='entry-desc';desc.textContent=x.description;
 const meta=document.createElement('div');meta.className='entry-meta';meta.textContent=dateText(x.date);
 main.append(desc,meta);
 const amount=document.createElement('div');amount.className='entry-amount';amount.textContent=euro(x.amount);
 const status=document.createElement('span');status.className='status';
 const linkedReality = tab==='expected' ? data.reality.find(r=>r.matchId===x.id) : null;
 const linkedExpected = tab==='reality' ? data.expected.find(e=>e.id===x.matchId) : null;
 const isMatched = tab==='expected' ? Boolean(linkedReality) : Boolean(linkedExpected);
 if(isMatched){
  row.classList.add('matched-entry');
  row.style.backgroundColor='#edf5eb';
  row.style.borderColor='#a9c5a5';
  row.style.boxShadow='0 5px 18px rgba(91,132,87,.09)';
 }
 if(tab==='expected'){
  status.textContent=isMatched?'Matched':(x.done?'Completed':'Pending');
  if(isMatched) status.title='Matched with a Reality entry';
  else if(x.done) status.classList.add('done');
 } else {
  status.textContent=linkedExpected?'Matched':'Unexpected';
  if(!linkedExpected)status.classList.add('unmatched');
  else status.title='Matched with: '+linkedExpected.description;
 }
 const actions=document.createElement('div');actions.className='entry-actions';
 if(tab==='expected'){const done=document.createElement('button');done.className='small-btn';done.textContent=x.done?'Undo':'Done';done.onclick=()=>{x.done=!x.done;save();render()};actions.append(done)}
 const edit=document.createElement('button');edit.className='small-btn';edit.textContent='Edit';edit.onclick=()=>openEditor(x.id);actions.append(edit);
 const del=document.createElement('button');del.className='small-btn delete';del.textContent='×';del.setAttribute('aria-label','Delete');del.onclick=()=>{if(confirm('Delete this entry?')){data[tab]=data[tab].filter(z=>z.id!==x.id);if(tab==='expected')data.reality.forEach(r=>{if(r.matchId===x.id)r.matchId=null});save();render()}};actions.append(del);
 row.append(main,amount,status,actions);return row;
}
function openEditor(id=null){
 editingId=id;const x=id?current().find(z=>z.id===id):null;
 $('dialogTitle').textContent=x?'Edit entry':'New '+(tab==='expected'?'expected':'reality')+' entry';
 $('amount').value=x?x.amount.toFixed(2).replace('.',','):'';
 $('description').value=x?.description||'';$('date').value=x?.date||new Date().toISOString().slice(0,10);
 $('matchField').hidden=tab!=='reality';
 if(tab==='reality'){
  const sel=$('matchTo');sel.innerHTML='<option value="">Not matched / unexpected</option>';
  data.expected.forEach(e=>{const opt=document.createElement('option');opt.value=e.id;opt.textContent=`${dateText(e.date)} · ${e.description} · ${euro(e.amount)}`;sel.append(opt)});
  sel.value=x?.matchId||'';
 }
 $('editor').showModal();$('amount').focus();
}
$('addBtn').onclick=()=>openEditor();
$('closeBtn').onclick=$('cancelBtn').onclick=()=>$('editor').close();
$('entryForm').addEventListener('submit',e=>{
 e.preventDefault();const amount=parseAmount($('amount').value),description=$('description').value.trim(),date=$('date').value;
 if(!amount||!description||!date){alert('Please enter a valid amount, description and date.');return}
 const matchId=tab==='reality'?($('matchTo').value||null):null;
 if(matchId){const expected=data.expected.find(z=>z.id===matchId);if(!expected){alert('That Expected entry no longer exists.');return}
  const already=data.reality.some(r=>r.id!==editingId&&r.matchId===matchId);if(already&&!confirm('Another Reality entry is already linked to this Expected entry. Link it anyway?'))return;
 }
 if(editingId){const x=current().find(z=>z.id===editingId);if(x){x.amount=amount;x.description=description;x.date=date;if(tab==='reality')x.matchId=matchId}}
 else current().unshift({id:crypto.randomUUID(),amount,description,date,...(tab==='expected'?{done:false}:{matchId})});
 save();$('editor').close();render();
});
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
['search','fromDate','toDate','sortMode'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));
$('clearFilters').onclick=()=>{$('search').value='';$('fromDate').value='';$('toDate').value='';$('sortMode').value='date-desc';render()};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
