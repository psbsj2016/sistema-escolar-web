
import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

// Params
const params = new URLSearchParams(window.location.search);
const role = params.get('role') || 'professor';
const roomRaw = params.get('room') || 'global';
const locked = params.get('locked') === 'true';
const turmaId = roomRaw;
const yjsRoom = `ptt-lousa-${turmaId}`; // sala Yjs única por turma

console.log('[LOUSA COLLAB] role=', role, 'room=', turmaId, 'locked=', locked, 'yjsRoom=', yjsRoom);

// Guard para aluno
const overlay = document.getElementById('waiting-overlay');
const waitingRoom = document.getElementById('waiting-room');

async function checkAccess(){
  if(role !== 'aluno'){
    if(overlay) overlay.style.display='none';
    return true;
  }
  try{
    const res = await fetch(`/api/workspace/sala/workspace-lousa/status/${encodeURIComponent(turmaId)}`, {credentials:'include'});
    const data = await res.json();
    console.log('[GUARD]', data);
    if(!data?.success || !data.ativa){
      if(overlay){
        overlay.style.display='flex';
        if(waitingRoom) waitingRoom.innerHTML = `Turma <b>${turmaId}</b> ainda não liberada.<br>Aguardando professor clicar em "Ativar Visualização".`;
      }
      setTimeout(checkAccess, 3000);
      return false;
    }
    if(data.recursos === false && !locked){
      // Professor só liberou visualização, força locked
      const url = new URL(window.location.href);
      url.searchParams.set('locked','true');
      window.location.href = url.toString();
      return false;
    }
    if(overlay) overlay.style.display='none';
    return true;
  }catch(e){
    console.warn('guard erro', e);
    if(overlay) overlay.style.display='none';
    return true;
  }
}
checkAccess();
setInterval(()=> checkAccess(), 5000);

// Hook Yjs
function useYjsStore(roomId){
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils, bindingUtils: defaultBindingUtils }));
  const [provider, setProvider] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(()=>{
    const doc = new Y.Doc();
    const yMap = doc.getMap('tldraw');
    
    // WebRTC com servidores públicos (funciona sem backend)
    const prov = new WebrtcProvider(roomId, doc, {
      signaling: [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com'
      ]
    });

    prov.on('synced', () => {
      console.log('[YJS] synced');
      setConnected(true);
    });

    // Yjs -> Tldraw (remoto -> local)
    const handleY = (event) => {
      if(event.transaction.local) return; // ignora mudanças locais
      try{
        store.mergeRemoteChanges(()=>{
          yMap.forEach((val, key)=>{
            if(val) {
              try { store.put([val]); } catch{}
            }
          });
          // Remove: se algo foi deletado no Yjs, remove no store
          // Precisa tracking, simplificado: não remove tudo
        });
      }catch(e){ console.warn('mergeRemote erro', e); }
    };
    yMap.observe(handleY);

    // Tldraw -> Yjs (local -> remoto)
    const unsub = store.listen((entry)=>{
      if(entry.source !== 'user') return;
      doc.transact(()=>{
        for(const [id, rec] of Object.entries(entry.changes.added)) yMap.set(id, rec);
        for(const [id, rec] of Object.entries(entry.changes.updated)){
          const [, to] = rec;
          yMap.set(id, to);
        }
        for(const [id] of Object.entries(entry.changes.removed)) yMap.delete(id);
      }, 'local');
    }, {scope:'document', source:'user'});

    // Carrega estado inicial se já tem dados
    if(yMap.size > 0){
      const recs = [];
      yMap.forEach(v=>{ if(v) recs.push(v); });
      if(recs.length) store.mergeRemoteChanges(()=> store.put(recs));
    }

    setProvider(prov);
    return ()=>{
      yMap.unobserve(handleY);
      unsub();
      prov.destroy();
      doc.destroy();
    };
  }, [roomId]);

  return { store, provider, connected };
}

function App(){
  const { store, provider, connected } = useYjsStore(yjsRoom);
  const [editor, setEditor] = useState(null);
  const [peers, setPeers] = useState(1);

  useEffect(()=>{
    if(!provider) return;
    const upd = () => {
      try{ setPeers(provider.awareness.getStates().size); }catch{ setPeers(1); }
    };
    const iv = setInterval(upd, 2000);
    provider.awareness.on('change', upd);
    return ()=>{ clearInterval(iv); provider.awareness.off('change', upd); };
  }, [provider]);

  const onMount = useCallback((ed)=>{
    setEditor(ed);
    const isLocked = role==='aluno' && locked;
    ed.updateInstanceState({ isReadonly: isLocked });
    console.log('[LOUSA] editor mount locked=', isLocked);
  }, []);

  useEffect(()=>{
    if(!editor) return;
    editor.updateInstanceState({ isReadonly: role==='aluno' && locked });
  }, [editor]);

  const isAluno = role==='aluno';
  const isLocked = isAluno && locked;

  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column'}}>
      <div style={{height:48, background:'#0F172A', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px'}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div style={{width:28,height:28,borderRadius:8,background:'#14B8A6',display:'grid',placeItems:'center'}}>🖍️</div>
          <div style={{fontWeight:700, fontSize:13}}>Lousa {turmaId} {isLocked ? '🔒 Visualização' : ''}</div>
          <div style={{fontSize:11, background:'rgba(255,255,255,0.1)', padding:'3px 8px', borderRadius:12, display:'flex', gap:6, alignItems:'center'}}>
            <div style={{width:8,height:8,borderRadius:'50%', background: connected ? '#34d399' : '#fbbf24'}}></div>
            {connected ? 'Ao vivo' : 'Conectando...'} • {peers}
          </div>
        </div>
        <div style={{fontSize:10, opacity:0.6}}>{role} • {yjsRoom}</div>
      </div>
      <div style={{flex:1}}>
        <Tldraw store={store} onMount={onMount} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
