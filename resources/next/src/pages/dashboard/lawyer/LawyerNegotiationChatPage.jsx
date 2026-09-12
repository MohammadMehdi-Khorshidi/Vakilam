'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileSignature, Handshake, MessageCircle, Send, ShieldAlert, X } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';
import { createNegotiationProposal, getNegotiation, sendNegotiationMessage, submitLawyerProposal } from '@/lib/api/lawyer';
import { contactWarning, containsContactInformation } from '@/lib/contactGuard';
import useNegotiationRealtime from '@/hooks/useNegotiationRealtime';
import { proposalStatusLabel } from '@/lib/proposalStatus';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400','500','600','700','800'], display: 'swap' });
const faNumber = new Intl.NumberFormat('fa-IR');
const statusLabels = {
  active: 'مذاکره فعال',
  proposal_submitted: 'در انتظار تصمیم موکل',
  closed: 'مذاکره بسته شده',
  cancelled: 'مذاکره پایان یافته',
  won: 'توافق انجام شده',
};

function formatDate(value) {
  if (!value) return '';
  try { return new Intl.DateTimeFormat('fa-IR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value)); }
  catch { return ''; }
}

function ProposalCard({ proposal }) {
  return (
    <div className="mx-auto my-4 w-full max-w-[680px] rounded-2xl border border-[#dbc58e] bg-[#fffaf0] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-bold text-[#9a7527]">پیشنهاد رسمی شما</p><h3 className="mt-1 font-black text-[#4c452f]">شرایط پیشنهادی همکاری</h3></div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-[#765819]">{proposalStatusLabel(proposal.status)}</span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#645e4c]">{proposal.summary}</p>
      {proposal.service_scope ? <div className="mt-3 rounded-xl bg-white/70 p-3"><p className="text-xs font-bold text-[#8b7440]">محدوده خدمات</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#645e4c]">{proposal.service_scope}</p></div> : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-white/80 p-3"><p className="text-[11px] font-bold text-[#9a8b67]">مبلغ</p><p className="mt-1 font-black text-[#514b39]">{proposal.proposed_fee_rial ? `${faNumber.format(proposal.proposed_fee_rial)} ریال` : 'ثبت نشده'}</p></div>
        <div className="rounded-xl bg-white/80 p-3"><p className="text-[11px] font-bold text-[#9a8b67]">زمان تقریبی</p><p className="mt-1 font-black text-[#514b39]">{proposal.estimated_days ? `${faNumber.format(proposal.estimated_days)} روز` : 'ثبت نشده'}</p></div>
      </div>
    </div>
  );
}

function AgreementBox({ engagement }) {
  const a = engagement?.agreement_snapshot;
  if (!a) return null;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="flex items-center gap-2 font-black text-emerald-800"><Handshake size={18}/>توافق با موکل</div>
      <p className="mt-2 text-xs leading-6 text-emerald-700">این توافق از Proposal پذیرفته‌شده ساخته شده و Proposal مبنا قابل تغییر نیست.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-white/80 p-3"><p className="text-xs text-slate-500">مبلغ</p><p className="mt-1 font-bold text-slate-700">{a.proposed_fee_rial ? `${faNumber.format(a.proposed_fee_rial)} ریال` : 'ثبت نشده'}</p></div>
        <div className="rounded-xl bg-white/80 p-3"><p className="text-xs text-slate-500">زمان</p><p className="mt-1 font-bold text-slate-700">{a.estimated_days ? `${faNumber.format(a.estimated_days)} روز` : 'ثبت نشده'}</p></div>
      </div>
    </div>
  );
}

export default function LawyerNegotiationChatPage({ negotiationId }) {
  const [negotiation,setNegotiation] = useState(null);
  const [currentUser,setCurrentUser] = useState(null);
  const [body,setBody] = useState('');
  const [loading,setLoading] = useState(true);
  const [sending,setSending] = useState(false);
  const [error,setError] = useState('');
  const [proposalOpen,setProposalOpen] = useState(false);
  const [proposalBusy,setProposalBusy] = useState(false);
  const [showAgreement,setShowAgreement] = useState(false);
  const [proposalForm,setProposalForm] = useState({summary:'',service_scope:'',proposed_fee_rial:'',estimated_days:''});

  const load = useCallback(async ({silent=false}={}) => {
    if (!silent) setError('');
    try {
      const [data,userPayload] = await Promise.all([getNegotiation(negotiationId), currentUser ? Promise.resolve(currentUser) : apiRequest('user')]);
      setNegotiation(data);
      if (!currentUser) setCurrentUser(unwrapData(userPayload) ?? userPayload);
    } catch (e) { if (!silent) setError(e?.message || 'دریافت اطلاعات مذاکره با خطا مواجه شد.'); }
    finally { setLoading(false); }
  },[negotiationId,currentUser]);

  useEffect(()=>{ load(); },[load]);

  const onRealtimeMessage = useCallback((message)=>{
    if (!message?.id) return;
    setNegotiation(prev => {
      if (!prev) return prev;
      const messages = prev.messages ?? [];
      if (messages.some(x=>x.id===message.id)) return prev;
      return {...prev,messages:[...messages,message]};
    });
  },[]);
  const onRealtimeState = useCallback(()=>{ load({silent:true}); },[load]);
  const {connected,connectionState,connectionError,otherOnline,otherTyping,notifyTyping} = useNegotiationRealtime({
    negotiationId,
    currentUserPublicId: currentUser?.public_id,
    onMessage:onRealtimeMessage,
    onStateChanged:onRealtimeState,
  });

  const proposals = negotiation?.proposals ?? [];
  const stream = useMemo(()=>{
    if (!negotiation) return [];
    const items = (negotiation.messages ?? []).map(message=>({type:'message',date:message.created_at,message}));
    proposals.filter(p=>p.submitted_at).forEach(proposal=>items.push({type:'proposal',date:proposal.submitted_at || proposal.created_at,proposal}));
    return items.sort((a,b)=>new Date(a.date)-new Date(b.date));
  },[negotiation,proposals]);

  const canMessage = ['active','proposal_submitted','won'].includes(negotiation?.status);
  const canCreateProposal = negotiation?.status === 'active' && !negotiation?.engagement &&
    !proposals.some(p=>['draft','submitted','shortlisted'].includes(p.status));

  async function sendMessage() {
    const trimmed = body.trim();
    if (!trimmed || sending || !canMessage) return;
    if (containsContactInformation(trimmed)) { setError(contactWarning); return; }
    setSending(true); setError('');
    try {
      const message = await sendNegotiationMessage(negotiationId, trimmed);
      setBody(''); notifyTyping(false); onRealtimeMessage(message);
    } catch(e) { setError(e?.validationMessages?.[0] || e?.message || 'ارسال پیام انجام نشد.'); }
    finally { setSending(false); }
  }

  async function submitProposal() {
    const summary = proposalForm.summary.trim();
    const serviceScope = proposalForm.service_scope.trim();
    const fee = Number(proposalForm.proposed_fee_rial);
    const days = Number(proposalForm.estimated_days);
    if (!summary || !serviceScope) return setError('خلاصه پیشنهاد و محدوده خدمات را کامل کنید.');
    if (containsContactInformation(summary) || containsContactInformation(serviceScope)) return setError(contactWarning);
    if (!Number.isInteger(fee) || fee < 1) return setError('مبلغ پیشنهادی را به ریال وارد کنید.');
    if (!Number.isInteger(days) || days < 1) return setError('زمان تقریبی را به روز وارد کنید.');

    setProposalBusy(true); setError('');
    try {
      const proposal = await createNegotiationProposal(negotiationId,{summary,service_scope:serviceScope,proposed_fee_rial:fee,estimated_days:days});
      await submitLawyerProposal(proposal.public_id);
      setProposalOpen(false);
      setProposalForm({summary:'',service_scope:'',proposed_fee_rial:'',estimated_days:''});
      await load({silent:true});
    } catch(e) { setError(e?.validationMessages?.[0] || e?.message || 'ثبت پیشنهاد رسمی با خطا مواجه شد.'); }
    finally { setProposalBusy(false); }
  }

  if (loading) return <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f5f8f6] p-8`}><div className="mx-auto max-w-[1200px] rounded-2xl border bg-white p-16 text-center text-[#81908b]">در حال دریافت مذاکره...</div></main>;
  if (!negotiation) return <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f5f8f6] p-8`}><div className="mx-auto max-w-[1200px]"><Link href="/lawyer/negotiation" className="inline-flex items-center gap-2 text-sm font-bold text-[#315f54]"><ArrowRight size={17}/>بازگشت به مذاکرات</Link><div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error || 'مذاکره پیدا نشد.'}</div></div></main>;

  return (
    <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f5f8f6] px-4 py-7 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-[1200px]">
        <Link href="/lawyer/negotiation" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#315f54]"><ArrowRight size={17}/>بازگشت به مذاکرات</Link>
        <header className="rounded-[20px] border border-[#dce6e2] bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-xs font-bold text-[#a47b2c]">مذاکره با موکل</p><h1 className="mt-2 text-xl font-black text-[#173f38] md:text-2xl">{negotiation.legal_request?.title || 'درخواست حقوقی'}</h1><div className="mt-2 flex items-center gap-2 text-xs text-[#74847e]"><span className={`h-2 w-2 rounded-full ${otherOnline?'bg-emerald-500':'bg-slate-300'}`}/><span>{otherOnline?'موکل آنلاین است':connectionState==='error'?`خطای اتصال${connectionError ? `: ${connectionError}` : ''}`:connected?'موکل آفلاین است':'در حال اتصال...'}</span></div></div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#edf5f2] px-4 py-2 text-xs font-bold text-[#315f54]">{statusLabels[negotiation.status] || negotiation.status}</span>
              {negotiation.engagement ? <button type="button" onClick={()=>setShowAgreement(v=>!v)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"><Handshake size={15}/>مشاهده توافق</button> : canCreateProposal ? <button type="button" onClick={()=>setProposalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#c7a154] px-4 py-2.5 text-sm font-bold text-[#173f38]"><FileSignature size={17}/>ثبت پیشنهاد رسمی</button> : null}
            </div>
          </div>
          {showAgreement && negotiation.engagement ? <div className="mt-4"><AgreementBox engagement={negotiation.engagement}/></div> : null}
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800"><ShieldAlert size={17} className="mt-0.5 shrink-0"/>ارسال شماره تماس، ایمیل، لینک و شناسه شبکه‌های اجتماعی مجاز نیست.</div>
        </header>
        {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
        <section className="mt-5 overflow-hidden rounded-[20px] border border-[#dce6e2] bg-white">
          <div className="flex items-center justify-between border-b border-[#e8eeeb] px-5 py-4"><div className="flex items-center gap-2 font-black text-[#173f38]"><MessageCircle size={19}/>گفت‌وگو</div>{otherTyping ? <span className="text-xs font-bold text-emerald-600">موکل در حال نوشتن است...</span>:null}</div>
          <div className="min-h-[430px] space-y-3 bg-[#f8faf9] p-5">
            {stream.length===0 ? <div className="py-20 text-center text-sm text-[#899691]">گفتگو هنوز شروع نشده است.</div> : stream.map((entry,index)=>{
              if (entry.type==='proposal') return <ProposalCard key={`proposal-${entry.proposal.public_id}`} proposal={entry.proposal}/>;
              const message=entry.message; const mine=currentUser?.public_id && message.sender?.public_id===currentUser.public_id;
              return <div key={message.id || `${message.created_at}-${index}`} className={`flex ${mine?'justify-start':'justify-end'}`}><div className={`max-w-[78%] rounded-2xl px-4 py-3 ${mine?'bg-[#174c42] text-white':'border border-[#dce5e1] bg-white text-[#405851]'}`}><p className="whitespace-pre-wrap text-sm leading-7">{message.body}</p><p className={`mt-2 text-[10px] ${mine?'text-white/60':'text-[#9aa5a1]'}`}>{formatDate(message.created_at)}</p></div></div>;
            })}
          </div>
          <div className="border-t border-[#e7ecea] bg-white p-4"><div className="flex gap-2"><textarea value={body} onChange={e=>{setBody(e.target.value);notifyTyping(Boolean(e.target.value));}} disabled={!canMessage||sending} rows={2} placeholder={canMessage?'پیام خود را بنویسید...':'این مذاکره فقط قابل مشاهده است.'} className="min-h-[52px] flex-1 resize-none rounded-xl border border-[#dbe5e1] bg-[#fbfdfc] px-4 py-3 text-sm outline-none focus:border-[#7aa096] disabled:opacity-60"/><button type="button" onClick={sendMessage} disabled={!canMessage||sending||!body.trim()} className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#174c42] text-white disabled:opacity-40"><Send size={19}/></button></div></div>
        </section>
      </div>

      {proposalOpen ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"><div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[22px] bg-white p-6 shadow-2xl"><button type="button" onClick={()=>setProposalOpen(false)} className="absolute left-4 top-4 rounded-lg p-2 text-slate-400"><X size={19}/></button><h2 className="text-xl font-black text-[#173f38]">ثبت پیشنهاد رسمی</h2><p className="mt-2 text-sm leading-7 text-[#788782]">اگر موکل نپذیرد، چت باز می‌ماند و می‌توانید Proposal جدید ثبت کنید.</p><div className="mt-5 space-y-4"><textarea rows={3} value={proposalForm.summary} onChange={e=>setProposalForm(p=>({...p,summary:e.target.value}))} className="w-full rounded-xl border p-3" placeholder="خلاصه پیشنهاد"/><textarea rows={5} value={proposalForm.service_scope} onChange={e=>setProposalForm(p=>({...p,service_scope:e.target.value}))} className="w-full rounded-xl border p-3" placeholder="محدوده خدمات"/><div className="grid gap-4 sm:grid-cols-2"><input type="number" min="1" value={proposalForm.proposed_fee_rial} onChange={e=>setProposalForm(p=>({...p,proposed_fee_rial:e.target.value}))} className="rounded-xl border p-3" placeholder="مبلغ به ریال"/><input type="number" min="1" value={proposalForm.estimated_days} onChange={e=>setProposalForm(p=>({...p,estimated_days:e.target.value}))} className="rounded-xl border p-3" placeholder="زمان تقریبی (روز)"/></div><button type="button" onClick={submitProposal} disabled={proposalBusy} className="w-full rounded-xl bg-[#174c42] px-5 py-3.5 font-bold text-white disabled:opacity-50">{proposalBusy?'در حال ثبت...':'ثبت و ارسال پیشنهاد رسمی'}</button></div></div></div> : null}
    </main>
  );
}
