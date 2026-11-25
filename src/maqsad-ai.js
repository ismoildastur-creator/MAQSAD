(() => {
'use strict';
const $ = id => document.getElementById(id);
const panel=$('maqsad-ai-panel'), launch=$('maqsad-ai-launch'), close=$('maqsad-ai-close');
const form=$('maqsad-ai-form'), input=$('maqsad-ai-input'), messagesEl=$('maqsad-ai-messages'), send=$('maqsad-ai-send');
if(!panel||!launch||!form)return;
const history=[];
function addMessage(text,role){const el=document.createElement('div');el.className='maqsad-ai-msg '+role;el.textContent=text;messagesEl.appendChild(el);messagesEl.scrollTop=messagesEl.scrollHeight;}
function show(){panel.classList.add('open');input.focus();}
function hide(){panel.classList.remove('open');}
launch.addEventListener('click',show);close.addEventListener('click',hide);
form.addEventListener('submit',async e=>{
 e.preventDefault();const question=input.value.trim();if(!question||send.disabled)return;
 input.value='';addMessage(question,'user');history.push({role:'user',content:question});
 send.disabled=true;send.textContent='…';
 const wait=document.createElement('div');wait.className='maqsad-ai-msg bot';wait.textContent='Ustoz javob tayyorlamoqda…';messagesEl.appendChild(wait);
 try{
  if(!window.maqsadCloud?.askAI)throw new Error('AI xizmati yuklanmagan. Ilovani yangilang.');
  const reply=await window.maqsadCloud.askAI(history.slice(-10));
  wait.remove();addMessage(reply,'bot');history.push({role:'assistant',content:reply});
  if(history.length>12)history.splice(0,history.length-12);
 }catch(err){wait.remove();const msg=err?.message||'AI xizmati hozir ishlamayapti.';addMessage(msg,'bot');}
 finally{send.disabled=false;send.textContent='Yuborish';input.focus();}
});
})();
