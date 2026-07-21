import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,300;1,400;1,600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{overflow-x:hidden;}
select option{background:#06021a;}
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(.55);}

@keyframes appear{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes breathe{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
@keyframes oracle-glow{
  0%{box-shadow:none;border-color:rgba(200,180,255,.08);background:rgba(20,8,55,.4);}
  40%{box-shadow:0 0 30px var(--oc),0 0 60px var(--oc-dim);border-color:var(--oc-mid);}
  100%{box-shadow:0 0 14px var(--oc-dim);border-color:var(--oc-mid);background:rgba(var(--oc-rgb),.12);}
}
@keyframes shimmer{
  0%{background-position:200% center}
  100%{background-position:-200% center}
}
@keyframes scandown{
  0%{transform:translateY(-100%);opacity:.7}
  100%{transform:translateY(100vh);opacity:0}
}
@keyframes section-reveal{
  from{opacity:0;transform:translateX(-12px)}
  to{opacity:1;transform:translateX(0)}
}
@keyframes float{
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-8px)}
}
@keyframes starPop{
  0%{opacity:0;transform:scale(0)}
  70%{opacity:1;transform:scale(1.4)}
  100%{opacity:.8;transform:scale(1)}
}

.a1{animation:appear .6s ease-out both}
.a2{animation:appear .6s .12s ease-out both}
.a3{animation:appear .6s .24s ease-out both}
.a4{animation:appear .6s .36s ease-out both}

.shimmer-text{
  background:linear-gradient(90deg,#C49A3C 0%,#FDE68A 30%,#C49A3C 50%,#FDE68A 80%,#C49A3C 100%);
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
  animation:shimmer 3s linear infinite;
}

.field-inp{
  width:100%;background:rgba(255,255,255,.055);
  border:1px solid rgba(200,180,255,.13);border-radius:10px;
  padding:11px 14px;color:#EDE8FF;font-size:14px;outline:none;
  font-family:'Crimson Text',Georgia,serif;line-height:1.6;
  transition:border-color .2s,box-shadow .2s;
}
.field-inp:focus{border-color:rgba(196,154,60,.5);box-shadow:0 0 12px rgba(196,154,60,.12);}

.oracle-tile{
  border-radius:12px;border:1px solid rgba(200,180,255,.08);
  background:rgba(20,8,55,.4);padding:14px 10px;
  display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;
  transition:all .5s cubic-bezier(.34,1.56,.64,1);
  position:relative;overflow:hidden;
}
.oracle-tile.active{animation:oracle-glow .6s ease-out forwards;}

.scan-line{
  position:fixed;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,rgba(196,154,60,.6),transparent);
  animation:scandown 2.5s ease-in-out infinite;
  pointer-events:none;z-index:10;
}

.section-card{animation:section-reveal .5s ease-out both;}
.float{animation:float 4s ease-in-out infinite;}

@media(max-width:600px){
  .oracle-grid{grid-template-columns:repeat(3,1fr)!important;gap:8px!important;}
  .result-grid{grid-template-columns:1fr!important;}
}
`;

/* ═══════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════ */
const ORACLES = [
  { symbol:"🃏", name:"タロット",    color:"#9333EA", msg:"運命のカードが舞い散る…" },
  { symbol:"♈",  name:"西洋占星術",  color:"#3B82F6", msg:"星々が整列し語り始める…" },
  { symbol:"∞",  name:"数秘術",      color:"#F59E0B", msg:"数字の真実が解読される…" },
  { symbol:"ᚱ",  name:"ルーン",      color:"#EF4444", msg:"古代文字が石に刻まれる…" },
  { symbol:"☯",  name:"易経",        color:"#10B981", msg:"64卦が銅銭で開かれる…" },
  { symbol:"柱",  name:"四柱推命",   color:"#F97316", msg:"年月日時の命式が組まれる…" },
  { symbol:"✦",  name:"九星気学",    color:"#06B6D4", msg:"九つの星気が流れ込む…" },
  { symbol:"✋", name:"手相",         color:"#D97706", msg:"生命線が語り始める…" },
  { symbol:"ॐ",  name:"ヴェーダ",   color:"#8B5CF6", msg:"カルマの糸が見え始める…" },
  { symbol:"☕", name:"コーヒー占い", color:"#A16207", msg:"運命の形が浮かび上がる…" },
  { symbol:"᚛᚜", name:"オガム",      color:"#166534", msg:"聖樹が太古の知恵を囁く…" },
  { symbol:"⛩",  name:"おみくじ",   color:"#BE123C", msg:"神のお告げが降りてくる…" }
];

const SECTION_META = [
  { key:"神託の証明",   icon:"📜", color:"#94A3B8", label:"神託の証明 — 占術の計算結果" },
  { key:"本質と使命",   icon:"💎", color:"#C49A3C", label:"あなたの本質と魂の使命" },
  { key:"過去の真実",   icon:"🌑", color:"#A78BFA", label:"過去の真実と隠された記憶" },
  { key:"現在の核心",   icon:"🔮", color:"#38BDF8", label:"現在の核心 — 今あなたに起きていること" },
  { key:"近未来の予言", icon:"🌙", color:"#FB923C", label:"近未来の予言 ─ 1〜3ヶ月以内" },
  { key:"遠未来の啓示", icon:"⭐", color:"#C084FC", label:"遠未来の啓示 ─ 半年〜1年先" },
  { key:"最後のメッセージ", icon:"💫", color:"#FDE68A", label:"12の神託が紡ぐ、あなただけへの言葉" },
];

/* ═══════════════════════════════════════════════════════════════════
   SYSTEM PROMPT
═══════════════════════════════════════════════════════════════════ */
const SYSTEM_PROMPT = `あなたは世界12の占術を完全に統合した究極の神託師です。
タロット・西洋占星術・数秘術・ルーン・易経・四柱推命・九星気学・手相・ヴェーダ占星術・コーヒー占い・オガム・おみくじ——この全てを一度に発動し、一人の人物に対して統合された神託を与えます。

【絶対に守る計算と導出】
生年月日から以下を必ず実際に計算・導出してください：

1. 数秘術：ライフパスナンバーを計算（例：1990年5月23日 → 1+9+9+0+5+2+3=29 → 2+9=11 → 1+1=2）
2. 西洋占星術：太陽星座（3/21〜4/19牡羊座、4/20〜5/20牡牛座 など正確に）
3. 中国十二支：生まれ年の干支（1984年=甲子/子年、1985年=乙丑/丑年など）
4. 四柱推命の年柱（概算で天干地支を示す）
5. 九星気学の本命星（年の九星を計算）
6. 以下をランダムに「引く」（具体的なカード名・文字名・卦名を必ず示す）：
   - タロット：大アルカナから2〜3枚（例：「愚者（正位置）」「月（逆位置）」「世界（正位置）」）
   - ルーン：エルダー・フサルクから1〜2文字（例：「ギフ（ᚷ）」）
   - 易経：64卦から1卦（例：「第29卦 坎為水（かんいすい）」）
   - おみくじ：大吉・吉・中吉・小吉・末吉から1つ

【鑑定の精度と演出】
- 「あなたは〜なはずです」「〜だったでしょう」と断言的・確信的に語る
- 「〇月頃に〜が訪れます」「〇〇の出来事が転機になります」と時期を具体的に示す
- 過去の経験（幼少期の孤独感、隠れた才能に気づかれなかった体験、人に言えなかった傷）について、まるで見てきたかのように語る
- その人の「隠れた本質」「誰にも言えない部分」に触れる
- 数字・星・カードの計算結果を根拠として読み解きに活用する
- 読んだ人が「なぜわかるの？」と鳥肌が立つほどの具体性と深さを目指す
- 詩的・神秘的な言語と具体的な内容を融合させる

【必須の出力形式】
以下の7つのセクション見出しを必ず使い、各セクションを十分な長さ（150字以上）で書いてください：

【神託の証明 — 占術の計算結果】
（計算した全ての数字・星座・引いたカード・ルーン・卦・おみくじを具体的に列挙）

【あなたの本質と魂の使命】
（性格の核心、隠れた才能、今世で果たすべき使命と生きる意味）

【過去の真実と隠された記憶】
（幼少期〜現在の転換点、カルマ、なぜ今のあなたがあるのか、過去の傷とその意味）

【現在の核心 — 今あなたに起きていること】
（今の状況の本質、見えていない真実、今の試練が何を意味するか）

【近未来の予言 ── 1〜3ヶ月以内】
（具体的な時期と出来事、チャンスの瞬間、注意すべきこと）

【遠未来の啓示 ── 半年〜1年先】
（人生の転換点、大きな変化の波、長期的な流れと理想の未来）

【12の神託が紡ぐ、あなただけへの言葉】
（全ての占術を統合した、この人だけへの究極のメッセージ。詩的かつ力強く）`;

const buildMsg = f => `
【統合神託 鑑定依頼】

お名前：${f.name || '不明'}
生年月日：${f.birthdate || '不明'}
出生時刻：${f.birthtime || '不明（省略）'}
性別：${f.gender || '不明'}
現在の状況・悩み：${f.situation || '特になし'}
神託に聞きたいこと：${f.question || '総合的な運命'}

上記の情報をもとに、12の占術を全て統合した究極の神託を与えてください。生年月日から全ての数字・星座を正確に計算し、具体的なカード・ルーン・卦を引いた上で、過去の真実と未来の予言を詳細に語ってください。`.trim();

/* ═══════════════════════════════════════════════════════════════════
   STAR FIELD
═══════════════════════════════════════════════════════════════════ */
const StarField = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); let id;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const stars = Array.from({length:260}, () => ({
      x:Math.random(), y:Math.random(),
      r:Math.random()*1.5+.15,
      a:Math.random(), da:(Math.random()*.005+.002)*(Math.random()>.5?1:-1)
    }));
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      stars.forEach(s => {
        s.a += s.da;
        if(s.a>=1){s.a=1;s.da*=-1;} if(s.a<=.04){s.a=.04;s.da*=-1;}
        ctx.globalAlpha = s.a*.8;
        ctx.beginPath(); ctx.arc(s.x*c.width,s.y*c.height,s.r,0,Math.PI*2);
        ctx.fillStyle='#C4B5FD'; ctx.fill();
      });
      ctx.globalAlpha=1; id=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize',resize); };
  }, []);
  return <canvas ref={ref} style={{position:'fixed',inset:0,width:'100vw',height:'100vh',zIndex:0,pointerEvents:'none'}} />;
};

/* ═══════════════════════════════════════════════════════════════════
   HERO PAGE
═══════════════════════════════════════════════════════════════════ */
const HeroPage = ({ onStart }) => (
  <div style={{maxWidth:780,margin:'0 auto',padding:'80px 24px 80px',textAlign:'center'}}>
    <div className="a1 float" style={{fontSize:72,marginBottom:20,filter:'drop-shadow(0 0 30px rgba(196,154,60,.6))'}}>🔮</div>

    <div className="a1" style={{fontFamily:"'Cinzel',serif",fontSize:'clamp(9px,1.5vw,11px)',letterSpacing:'.4em',color:'#C49A3C',marginBottom:14}}>
      WORLD UNIFIED ORACLE SYSTEM
    </div>

    <h1 className="a2" style={{
      fontFamily:"'Cormorant Garamond',serif",
      fontSize:'clamp(38px,7vw,80px)',
      fontWeight:700,fontStyle:'italic',
      color:'#EDE8FF',letterSpacing:'.03em',marginBottom:6,lineHeight:1.1
    }}>
      究極統合神託
    </h1>

    <div className="a2" style={{fontFamily:"'Cinzel',serif",fontSize:'clamp(11px,2vw,14px)',letterSpacing:'.25em',color:'rgba(196,182,235,.45)',marginBottom:28}}>
      THE GRAND UNIFIED DIVINATION
    </div>

    <div className="a3" style={{width:160,height:1,background:'linear-gradient(90deg,transparent,#C49A3C,transparent)',margin:'0 auto 32px'}} />

    <p className="a3" style={{fontSize:15,color:'rgba(210,200,250,.6)',lineHeight:2.1,maxWidth:560,margin:'0 auto 20px',fontFamily:"'Crimson Text',serif"}}>
      世界12の神秘的な占術——タロット、易経、ルーン、ヴェーダ、四柱推命——<br/>
      <strong style={{color:'rgba(210,200,250,.85)'}}>全てが同時に発動し、あなただけの神託を織りなします。</strong>
    </p>
    <p className="a3" style={{fontSize:14,color:'rgba(196,154,60,.7)',lineHeight:1.9,maxWidth:520,margin:'0 auto 48px',fontFamily:"'Crimson Text',serif",fontStyle:'italic'}}>
      過去の真実、現在の核心、そして未来の予言。<br/>
      なぜあなたが今ここにいるのか、その答えがここにあります。
    </p>

    {/* Oracle preview icons */}
    <div className="a3" style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:12,marginBottom:48}}>
      {ORACLES.map((o,i) => (
        <div key={i} title={o.name} style={{
          width:42,height:42,borderRadius:10,
          border:'1px solid rgba(200,180,255,.12)',
          background:'rgba(20,8,55,.5)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:20,
          transition:'all .2s',cursor:'default',
          animation:`starPop .4s ${i*.06}s ease-out both`
        }}>
          {o.symbol}
        </div>
      ))}
    </div>

    <button className="a4" onClick={onStart} style={{
      background:'linear-gradient(135deg,#7C3AED,#4F46E5)',
      border:'1px solid rgba(196,154,60,.4)',
      borderRadius:14,color:'#EDE8FF',
      fontSize:16,fontFamily:"'Cinzel',serif",fontWeight:700,
      padding:'18px 52px',cursor:'pointer',letterSpacing:'.12em',
      boxShadow:'0 0 40px rgba(124,58,237,.4),0 0 80px rgba(124,58,237,.15)',
      transition:'all .25s'
    }}
      onMouseEnter={e=>{e.target.style.transform='translateY(-3px)';e.target.style.boxShadow='0 8px 50px rgba(124,58,237,.5),0 0 100px rgba(124,58,237,.2)';}}
      onMouseLeave={e=>{e.target.style.transform='none';e.target.style.boxShadow='0 0 40px rgba(124,58,237,.4),0 0 80px rgba(124,58,237,.15)';}}
    >
      ✦ 神託を開く ✦
    </button>

    <div style={{marginTop:20,fontSize:11,color:'rgba(196,182,235,.2)',letterSpacing:'.12em'}}>
      12の占術が同時に発動します
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   FORM PAGE
═══════════════════════════════════════════════════════════════════ */
const FormPage = ({ onSubmit, onBack }) => {
  const [f, setF] = useState({name:'',birthdate:'',birthtime:'',gender:'',situation:'',question:''});
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  const fields = [
    {k:'name',      label:'お名前（フルネーム）',    type:'text',    ph:'例：山田 太郎',     required:true},
    {k:'birthdate', label:'生年月日',                type:'date',    ph:'',                   required:true},
    {k:'birthtime', label:'出生時刻（任意・精度が上がります）', type:'time', ph:'',          required:false},
    {k:'gender',    label:'性別',                    type:'select',  opts:['女性','男性','その他'], required:false},
    {k:'situation', label:'現在の状況・悩み',        type:'textarea', ph:'今どんな状況にいるか、何に悩んでいるか自由に', required:false},
    {k:'question',  label:'神託に聞きたいこと',      type:'textarea', ph:'最も知りたいこと、神様に問いかけたいことを',   required:false},
  ];

  const ready = f.name.trim() && f.birthdate;

  return (
    <div style={{maxWidth:560,margin:'0 auto',padding:'40px 20px 70px'}}>
      <button onClick={onBack} style={{background:'none',border:'none',color:'rgba(196,182,235,.4)',cursor:'pointer',fontSize:12,letterSpacing:'.12em',padding:0,marginBottom:32,fontFamily:"'Cinzel',serif"}}>
        ← 戻る
      </button>

      <div className="a1" style={{textAlign:'center',marginBottom:36}}>
        <div style={{fontSize:16,color:'#C49A3C',fontFamily:"'Cinzel',serif",letterSpacing:'.2em',marginBottom:8}}>STEP 1 OF 2</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:32,color:'#EDE8FF',marginBottom:10}}>
          あなたの情報を
        </h2>
        <p style={{fontSize:13,color:'rgba(196,182,235,.5)',lineHeight:1.8,fontFamily:"'Crimson Text',serif"}}>
          入力された情報をもとに、12の占術が一斉に発動します。<br/>
          名前と生年月日だけでも鑑定できます。
        </p>
        <div style={{width:80,height:1,background:'linear-gradient(90deg,transparent,#C49A3C44,transparent)',margin:'16px auto 0'}} />
      </div>

      <div className="a2" style={{display:'flex',flexDirection:'column',gap:18}}>
        {fields.map(fld => (
          <div key={fld.k}>
            <label style={{display:'block',fontSize:11.5,letterSpacing:'.1em',color:'rgba(196,182,235,.6)',marginBottom:6,fontFamily:"'Cinzel',serif"}}>
              {fld.label}{fld.required && <span style={{color:'#C49A3C',marginLeft:4}}>*</span>}
            </label>
            {fld.type==='select' ? (
              <select value={f[fld.k]} onChange={e=>set(fld.k,e.target.value)} className="field-inp" style={{cursor:'pointer'}}>
                <option value="">選択（任意）</option>
                {fld.opts.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            ) : fld.type==='textarea' ? (
              <textarea value={f[fld.k]} onChange={e=>set(fld.k,e.target.value)} placeholder={fld.ph} rows={3} className="field-inp" style={{resize:'vertical'}} />
            ) : (
              <input type={fld.type} value={f[fld.k]} onChange={e=>set(fld.k,e.target.value)} placeholder={fld.ph} className="field-inp" />
            )}
          </div>
        ))}

        <button
          onClick={() => ready && onSubmit(f)}
          disabled={!ready}
          style={{
            marginTop:8,
            background: ready
              ? 'linear-gradient(135deg,#9333EA,#4F46E5)'
              : 'rgba(100,80,160,.2)',
            border: ready ? '1px solid rgba(196,154,60,.5)' : '1px solid rgba(200,180,255,.1)',
            borderRadius:12, color: ready ? '#EDE8FF' : 'rgba(196,182,235,.3)',
            fontSize:15, fontFamily:"'Cinzel',serif", fontWeight:700,
            padding:'15px 32px', cursor: ready ? 'pointer' : 'not-allowed',
            letterSpacing:'.1em', transition:'all .2s',
            boxShadow: ready ? '0 0 32px rgba(147,51,234,.35)' : 'none'
          }}
        >
          {ready ? '✦ 12の神託を発動する ✦' : '名前と生年月日を入力してください'}
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   LOADING PAGE — the signature epic sequence
═══════════════════════════════════════════════════════════════════ */
const LoadingPage = ({ apiDone, result, onComplete }) => {
  const [activated, setActivated] = useState(0);
  const [synthPhase, setSynthPhase] = useState(false);
  const [ready, setReady] = useState(false);

  // Activate oracles one by one
  useEffect(() => {
    if (activated >= ORACLES.length) return;
    const t = setTimeout(() => setActivated(a => a+1), 260);
    return () => clearTimeout(t);
  }, [activated]);

  const animDone = activated >= ORACLES.length;

  // After animation, show synthesis phase
  useEffect(() => {
    if (animDone) {
      const t = setTimeout(() => setSynthPhase(true), 400);
      return () => clearTimeout(t);
    }
  }, [animDone]);

  // When both anim + api done, mark ready and trigger
  useEffect(() => {
    if (animDone && apiDone && result) {
      const t = setTimeout(() => { setReady(true); onComplete(); }, 900);
      return () => clearTimeout(t);
    }
  }, [animDone, apiDone, result]);

  return (
    <div style={{maxWidth:700,margin:'0 auto',padding:'50px 20px 70px',textAlign:'center'}}>
      <div className="scan-line" />

      <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:'.3em',color:'#C49A3C',marginBottom:20}}>
        ORACLE ACTIVATION SEQUENCE
      </div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:28,color:'#EDE8FF',marginBottom:8}}>
        12の神託が発動しています
      </h2>
      <p style={{fontSize:13,color:'rgba(196,182,235,.4)',marginBottom:36,fontFamily:"'Crimson Text',serif",letterSpacing:'.04em'}}>
        {activated < ORACLES.length
          ? ORACLES[Math.max(0,activated-1)]?.msg || '神託の扉が開かれています…'
          : synthPhase && !apiDone
            ? '全12の神託を統合しています。あなただけの予言を紡いでいます…'
            : ready ? '神託の準備が整いました…' : '最終統合を行っています…'
        }
      </p>

      {/* 4×3 Oracle Grid */}
      <div className="oracle-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:36}}>
        {ORACLES.map((o, i) => {
          const isOn = i < activated;
          const isLatest = i === activated - 1;
          return (
            <div
              key={i}
              className={`oracle-tile${isOn?' active':''}`}
              style={{
                '--oc': o.color,
                '--oc-dim': o.color+'55',
                '--oc-mid': o.color+'88',
                '--oc-rgb': `${parseInt(o.color.slice(1,3),16)},${parseInt(o.color.slice(3,5),16)},${parseInt(o.color.slice(5,7),16)}`,
                opacity: isOn ? 1 : 0.18,
                transform: isOn ? 'scale(1)' : 'scale(0.82)',
                transition: 'opacity .5s, transform .5s',
              }}
            >
              <div style={{
                fontSize:26,lineHeight:1,
                filter: isOn ? `drop-shadow(0 0 8px ${o.color})` : 'none',
                transition:'filter .4s'
              }}>{o.symbol}</div>
              <div style={{fontSize:9.5,letterSpacing:'.06em',color: isOn ? 'rgba(230,220,255,.75)' : 'rgba(180,160,240,.3)',fontFamily:"'Cinzel',serif",transition:'color .4s',lineHeight:1.3}}>
                {o.name}
              </div>
              {isOn && (
                <div style={{position:'absolute',top:6,right:7,width:5,height:5,borderRadius:'50%',background:o.color,boxShadow:`0 0 6px ${o.color}`,animation:'breathe 1.5s ease-in-out infinite'}} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{height:2,background:'rgba(200,180,255,.1)',borderRadius:2,marginBottom:20,overflow:'hidden'}}>
        <div style={{
          height:'100%',borderRadius:2,
          background:'linear-gradient(90deg,#7C3AED,#C49A3C)',
          width:`${(activated/ORACLES.length)*100}%`,
          transition:'width .3s ease',
          boxShadow:'0 0 10px rgba(196,154,60,.5)'
        }} />
      </div>
      <div style={{fontSize:11,color:'rgba(196,182,235,.3)',fontFamily:"'Cinzel',serif",letterSpacing:'.12em'}}>
        {activated} / {ORACLES.length} 神託起動完了
      </div>

      {/* Synthesis dots */}
      {synthPhase && !ready && (
        <div style={{marginTop:24,display:'flex',justifyContent:'center',gap:10,alignItems:'center',animation:'fadeIn .5s ease'}}>
          <div style={{fontSize:11,color:'rgba(196,154,60,.6)',fontFamily:"'Cinzel',serif",letterSpacing:'.15em'}}>統合中</div>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#C49A3C',animation:`breathe 1.4s ease-in-out ${i*.25}s infinite`}} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   RESULT SECTION COMPONENT
═══════════════════════════════════════════════════════════════════ */
const ResultSection = ({ meta, text, delay }) => {
  const lines = (text || '').split('\n');
  return (
    <div className="section-card" style={{
      background:`linear-gradient(135deg,rgba(${hexToRgbStr(meta.color)},.06) 0%,rgba(10,4,30,.8) 100%)`,
      border:`1px solid rgba(${hexToRgbStr(meta.color)},.2)`,
      borderRadius:14,padding:'26px 24px',
      animationDelay:`${delay}s`,
      boxShadow:`0 0 40px rgba(${hexToRgbStr(meta.color)},.04)`
    }}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <span style={{fontSize:20}}>{meta.icon}</span>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:'.12em',color:meta.color,fontWeight:700,lineHeight:1.3}}>
          {meta.label.toUpperCase()}
        </div>
      </div>
      <div style={{width:'100%',height:1,background:`linear-gradient(90deg,${meta.color}44,transparent)`,marginBottom:16}} />
      <div style={{fontSize:14.5,lineHeight:2.05,color:'#EDE8FF',fontFamily:"'Crimson Text',Georgia,serif"}}>
        {lines.map((ln,i) => {
          if (!ln.trim()) return <div key={i} style={{height:'.5em'}} />;
          const parts = ln.split(/(\*\*.*?\*\*)/);
          return (
            <div key={i} style={{marginBottom:'.15em'}}>
              {parts.map((p,j) => p.startsWith('**')
                ? <strong key={j} style={{color:meta.color}}>{p.slice(2,-2)}</strong>
                : p
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const hexToRgbStr = h => {
  try {
    return `${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)}`;
  } catch { return '200,180,255'; }
};

/* ═══════════════════════════════════════════════════════════════════
   RESULT PAGE
═══════════════════════════════════════════════════════════════════ */
const parseResult = (text) => {
  const KEYS = ['神託の証明','本質と使命','過去の真実','現在の核心','近未来の予言','遠未来の啓示','最後のメッセージ'];
  const sections = {};
  let current = null;
  const lines = text.split('\n');
  for (const line of lines) {
    const match = KEYS.find(k => line.includes(k));
    if (match) { current = match; sections[match] = ''; continue; }
    if (current) sections[current] = (sections[current] + '\n' + line).trimStart();
  }
  return sections;
};

const ResultPage = ({ result, inputs, onReset }) => {
  const sections = parseResult(result);
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard?.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{maxWidth:780,margin:'0 auto',padding:'40px 20px 80px'}}>
      {/* Header */}
      <div className="a1" style={{textAlign:'center',marginBottom:40}}>
        <div style={{fontSize:13,color:'#C49A3C',fontFamily:"'Cinzel',serif",letterSpacing:'.25em',marginBottom:10}}>
          ORACLE COMPLETE
        </div>
        <h2 style={{
          fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',
          fontSize:'clamp(28px,5vw,50px)',fontWeight:700,
          marginBottom:8,lineHeight:1.15
        }}>
          <span className="shimmer-text">統合神託</span>
          <span style={{color:'rgba(237,232,255,.8)',marginLeft:12}}>
            {inputs?.name ? `— ${inputs.name.split(' ')[0]}様へ` : ''}
          </span>
        </h2>
        <div style={{fontSize:12,color:'rgba(196,182,235,.35)',letterSpacing:'.12em',marginBottom:20}}>
          12の神託による過去・現在・未来の統合鑑定
        </div>

        {/* All 12 oracle symbols strip */}
        <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:8,marginBottom:24}}>
          {ORACLES.map((o,i) => (
            <div key={i} style={{
              width:32,height:32,borderRadius:8,
              border:`1px solid ${o.color}50`,
              background:`rgba(${hexToRgbStr(o.color)},.1)`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:16,boxShadow:`0 0 8px ${o.color}30`,
              animation:`starPop .3s ${i*.04}s ease-out both`
            }} title={o.name}>{o.symbol}</div>
          ))}
        </div>

        <div style={{width:200,height:1,background:'linear-gradient(90deg,transparent,#C49A3C,transparent)',margin:'0 auto'}} />
      </div>

      {/* Sections */}
      <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:36}}>
        {SECTION_META.map((meta, i) => {
          const text = sections[meta.key];
          if (!text?.trim()) return null;
          return <ResultSection key={meta.key} meta={meta} text={text} delay={i*.08} />;
        })}

        {/* Fallback: if parsing failed, show raw */}
        {Object.keys(sections).length === 0 && (
          <div style={{
            background:'rgba(20,8,55,.6)',border:'1px solid rgba(196,154,60,.2)',
            borderRadius:14,padding:'28px 24px',
            fontSize:14.5,lineHeight:2.1,color:'#EDE8FF',
            fontFamily:"'Crimson Text',Georgia,serif",whiteSpace:'pre-wrap'
          }}>
            {result}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="a4" style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
        <button onClick={copyAll} style={{
          background:'rgba(255,255,255,.05)',border:'1px solid rgba(200,180,255,.15)',
          borderRadius:10,color:copied?'#4ade80':'#EDE8FF',fontSize:12,
          fontFamily:"'Cinzel',serif",padding:'11px 24px',cursor:'pointer',letterSpacing:'.07em'
        }}>
          {copied ? '✓ コピー完了' : '📋 神託をコピー'}
        </button>
        <button onClick={() => onReset('form')} style={{
          background:'rgba(147,51,234,.2)',border:'1px solid rgba(147,51,234,.4)',
          borderRadius:10,color:'#EDE8FF',fontSize:12,
          fontFamily:"'Cinzel',serif",padding:'11px 24px',cursor:'pointer',letterSpacing:'.07em'
        }}>
          ✦ 別の問いで再鑑定
        </button>
        <button onClick={() => onReset('hero')} style={{
          background:'linear-gradient(135deg,#7C3AED,#4F46E5)',
          border:'1px solid rgba(196,154,60,.4)',borderRadius:10,
          color:'#EDE8FF',fontSize:12,fontFamily:"'Cinzel',serif",
          padding:'11px 24px',cursor:'pointer',letterSpacing:'.07em',
          boxShadow:'0 0 20px rgba(124,58,237,.3)'
        }}>
          ✦ 最初から
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [phase,   setPhase]   = useState('hero');
  const [inputs,  setInputs]  = useState(null);
  const [apiDone, setApiDone] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const l = document.createElement('link');
    l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,300;1,600&family=Crimson+Text:wght@400;600&display=swap';
    document.head.appendChild(l);
    return () => { try{document.head.removeChild(l);}catch{} };
  }, []);

  const handleSubmit = async (f) => {
    setInputs(f);
    setApiDone(false);
    setResult(null);
    setError(null);
    setPhase('loading');
    window.scrollTo({top:0,behavior:'smooth'});

    try {
      const res = await fetch('/api/oracle', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:8000,
          system:SYSTEM_PROMPT,
          messages:[{role:'user',content:buildMsg(f)}]
        })
      });
      const data = await res.json();
      const txt = data.content?.map(b=>b.text||'').join('') || 'エラーが発生しました。';
      setResult(txt);
      setApiDone(true);
    } catch(e) {
      setError('通信エラーが発生しました。');
      setApiDone(true);
      setResult('エラーが発生しました。もう一度お試しください。');
    }
  };

  const handleReset = (target='hero') => {
    setPhase(target);
    setResult(null);
    setApiDone(false);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'radial-gradient(ellipse at 30% 0%,#1a0840 0%,#090220 40%,#030010 100%)',
      color:'#EDE8FF',fontFamily:"'Crimson Text',Georgia,serif",
      position:'relative'
    }}>
      <style>{CSS}</style>
      <StarField />
      <div style={{position:'relative',zIndex:1}}>
        {phase==='hero' && <HeroPage onStart={()=>setPhase('form')} />}
        {phase==='form' && <FormPage onSubmit={handleSubmit} onBack={()=>setPhase('hero')} />}
        {phase==='loading' && (
          <LoadingPage
            apiDone={apiDone}
            result={result}
            onComplete={()=>{setPhase('result');window.scrollTo({top:0,behavior:'smooth'});}}
          />
        )}
        {phase==='result' && result && (
          <ResultPage result={result} inputs={inputs} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
