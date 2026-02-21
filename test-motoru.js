// --- TAM EKRAN BUTONU ---
const FullscreenToggle = () => {
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    React.useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(err));
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    return (
        <button onClick={toggleFullscreen} className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 p-3 rounded-xl shadow-sm border border-slate-200 transition-all duration-200 group">
            {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            )}
        </button>
    );
};

// --- YENİ: DİJİTAL DOPA GÖREVİ (DİKKAT TESTİ) ---
const DopaInteractiveTask = ({ onComplete }) => {
    const [grid, setGrid] = React.useState([]);
    const [selected, setSelected] = React.useState(new Set());
    const [started, setStarted] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState(60); // 60 Saniye Süre
    const cols = 10; // Mobil uyum için 10 sütun (toplam 20 satır = 200 harf)

    React.useEffect(() => {
        const targets = ['a', 'b', 'd', 'g'];
        const distractors = ['p', 'q', 'o', 'c', 'e', 'h', 'n', 'u', 'v', 'y'];
        const newGrid = Array.from({length: 200}, () => {
            return Math.random() < 0.25 ? targets[Math.floor(Math.random() * targets.length)] : distractors[Math.floor(Math.random() * distractors.length)];
        });
        setGrid(newGrid);
    }, []);

    React.useEffect(() => {
        if (started && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (started && timeLeft === 0) {
            finishTask();
        }
    }, [started, timeLeft]);

    const toggleLetter = (index) => {
        if (!started || timeLeft === 0) return;
        const newSelected = new Set(selected);
        if (newSelected.has(index)) newSelected.delete(index);
        else newSelected.add(index);
        setSelected(newSelected);
    };

    const finishTask = () => {
        const targets = ['a', 'b', 'd', 'g'];
        let lastClickedIndex = -1;
        selected.forEach(idx => { if(idx > lastClickedIndex) lastClickedIndex = idx; });

        let rowsCompleted = Math.ceil((lastClickedIndex + 1) / cols); 
        if(rowsCompleted === 0) rowsCompleted = 1; 

        let errors = 0;
        let maxIndexToCheck = rowsCompleted * cols;
        for(let i=0; i < maxIndexToCheck; i++) {
            const isTarget = targets.includes(grid[i]);
            const isSelected = selected.has(i);
            if (isTarget && !isSelected) errors++; // Kaçırılanlar (False Negative)
            if (!isTarget && isSelected) errors++; // Yanlış tıklananlar (False Positive)
        }

        onComplete({ speed: rowsCompleted, errors: errors });
    };

    if (!started) {
        return (
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⏱️</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Dikkat Testi Başlıyor</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">Karşına harflerden oluşan bir tablo çıkacak. Sadece <strong>a, b, d, g</strong> harflerini bulup üzerlerine tıklamalısın. <br/><br/>Hızlı ama dikkatli ol. Süren: <strong className="text-rose-600">60 Saniye</strong>.</p>
                <button onClick={() => setStarted(true)} className="bg-indigo-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-indigo-700 transition-transform hover:scale-105 shadow-xl">Testi Başlat</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            <div className="text-2xl font-black text-rose-600 mb-6 flex items-center gap-2 bg-rose-50 px-6 py-2 rounded-full border border-rose-100 shadow-sm">
                ⏱️ {timeLeft} Saniye
            </div>
            <div className="bg-white p-3 md:p-6 rounded-2xl shadow-inner border border-slate-200 w-full max-w-lg overflow-y-auto max-h-[50vh] overscroll-contain pb-10">
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '6px' }} className="select-none">
                    {grid.map((char, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => toggleLetter(idx)}
                            className={`flex items-center justify-center rounded-lg cursor-pointer text-lg md:text-xl font-semibold transition-all duration-200 aspect-square
                                ${selected.has(idx) ? 'bg-indigo-600 text-white shadow-md transform scale-110' : 'bg-slate-100 text-slate-600 hover:bg-indigo-100'}
                            `}
                        >
                            {char}
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={finishTask} className="mt-8 bg-slate-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-900 transition-colors">Testi Erken Bitir</button>
        </div>
    );
};

// --- ANA TEST MOTORU ---
const FocusON_Engine = () => {
    const testData = window.CURRENT_TEST_DATA;
    
    // Her testin başına otomatik olarak Öğrenci No sorusunu ekliyoruz
    if (!testData.questions.some(q => q.id === 'student_id')) {
        testData.questions.unshift({
            id: 'student_id',
            type: 'text',
            section: 'Öğrenci Doğrulama',
            text: 'Lütfen sana özel tanımlanan FocusON Numaranı gir.',
            placeholder: 'Örn: FO-1234'
        });
    }

    const [step, setStep] = React.useState(-1);
    const [answers, setAnswers] = React.useState({});
    const [animating, setAnimating] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitStatus, setSubmitStatus] = React.useState(null);

    const totalQuestions = testData.questions.length;
    const currentQ = testData.questions[step];

    // --- SUPABASE GÖNDERİM FONKSİYONU ---
    const submitToSupabase = async (finalAnswers) => {
        setIsSubmitting(true);
        
        const studentId = finalAnswers['student_id'];
        const testAnswers = { ...finalAnswers };
        delete testAnswers['student_id'];

        const SUPABASE_URL = "https://hlegbaflvfdpmcodfuew.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZWdiYWZsdmZkcG1jb2RmdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzIyNjAsImV4cCI6MjA4MzQwODI2MH0.siothqmKdww-IfMS4jLXMKswyvASUkBVWnhLwWDC8mg";

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/test_results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal',
                    'Content-Profile': 'focuson' 
                },
                body: JSON.stringify({
                    student_id: studentId, 
                    test_code: testData.id,
                    answers: testAnswers
                })
            });

            if (!response.ok) throw new Error("Ağ hatası oluştu.");
            setSubmitStatus('success');
        } catch (error) {
            console.error("Gönderim Hatası:", error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Klavye kontrolleri
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (animating || step === totalQuestions) return;
            if (step === -1 && e.key === 'Enter') return nextStep();
            if (step >= 0 && step < totalQuestions) {
                const isTextInput = currentQ.type === 'text' || currentQ.type === 'textarea' || currentQ.type === 'number';
                
                if (e.key === 'Enter') {
                    if (isTextInput && !e.shiftKey) {
                        e.preventDefault();
                        if(answers[currentQ.id]) nextStep();
                    } else if (!isTextInput && answers[currentQ.id]) {
                        nextStep();
                    }
                }
                if (currentQ.type === 'likert' && ['1','2','3','4','5'].includes(e.key)) {
                    handleAnswer(parseInt(e.key));
                    setTimeout(nextStep, 300); 
                }
                if (currentQ.type === 'likert_0_3' && ['0','1','2','3'].includes(e.key)) {
                    handleAnswer(parseInt(e.key));
                    setTimeout(nextStep, 300); 
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step, answers, currentQ, animating, totalQuestions]);

    const nextStep = () => {
        setAnimating(true);
        setTimeout(() => { 
            const nextStepNum = step + 1;
            setStep(nextStepNum); 
            setAnimating(false);
            
            if (nextStepNum === totalQuestions) {
                submitToSupabase(answers);
            }
        }, 300);
    };

    const handleAnswer = (val) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
    };

    // Karşılama Ekranı
    if (step === -1) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in relative">
                <FullscreenToggle />
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">{testData.title}</h1>
                <p className="text-lg text-slate-500 max-w-xl mb-12 leading-relaxed">{testData.description}</p>
                <button onClick={nextStep} className="bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-xl flex items-center gap-3">
                    Başla <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            </div>
        );
    }

    // Sonuç Ekranı
    if (step === totalQuestions) {
        let content = <p className="text-slate-500 mb-8">Lütfen bekle, veriler işleniyor...</p>;
        
        if (isSubmitting) {
            content = (
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Veriler şifrelenerek koçuna iletiliyor...</p>
                </div>
            );
        } else if (submitStatus === 'error') {
            content = <p className="text-rose-500 font-medium mb-8">Gönderim sırasında bir hata oluştu. Lütfen bağlantını kontrol edip sayfayı yenile.</p>;
        } else if (submitStatus === 'success') {
            
            // --- ÖTİ-A SONUÇ EKRANI ---
            if(testData.id === 'oti-a') {
                let likertScore = 0;
                testData.questions.filter(q => q.type === 'likert').forEach(q => likertScore += parseInt(answers[q.id] || 0));
                
                let resultZone = likertScore <= 25 ? { color: 'text-rose-600', bg: 'bg-rose-50', border:'border-rose-200', text: 'Kırmızı Bölge', msg: 'Temel çalışma disiplinini baştan kurgulamalıyız.' } :
                                 likertScore <= 39 ? { color: 'text-amber-600', bg: 'bg-amber-50', border:'border-amber-200', text: 'Sarı Bölge', msg: 'Çalışıyorsun ama istikrar sorunun var. Beraber çözeceğiz.' } :
                                 { color: 'text-emerald-600', bg: 'bg-emerald-50', border:'border-emerald-200', text: 'Yeşil Bölge', msg: 'Harika bir öz disiplinin var. Sadece ince ayar yapacağız.' };

                content = (
                    <div className={`p-6 rounded-2xl border ${resultZone.bg} ${resultZone.border} mb-8`}>
                        <div className={`text-sm font-bold uppercase tracking-widest mb-2 ${resultZone.color}`}>Çalışma Disiplini Skorun</div>
                        <div className={`text-6xl font-extrabold mb-4 ${resultZone.color}`}>{likertScore}</div>
                        <p className={`font-medium ${resultZone.color}`}>{resultZone.text}: {resultZone.msg}</p>
                    </div>
                );
            } 
            // --- VAK SONUÇ EKRANI ---
            else if (testData.id === 'vak') {
                let counts = { G: 0, I: 0, K: 0 };
                Object.keys(answers).forEach(key => {
                    if (key.startsWith('v') && counts[answers[key]] !== undefined) {
                        counts[answers[key]]++;
                    }
                });
                let maxStyle = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                let strategies = {
                    G: { title: "GÖRSEL ÖĞRENCİ", icon: "👁️", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "Dünyayı gözlerinle algılıyorsun.", tips: ["Renkli kodlama yap.", "Zihin Haritası kullan."] },
                    I: { title: "İŞİTSEL ÖĞRENCİ", icon: "👂", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Dünyayı kulaklarınla algılıyorsun.", tips: ["Sesli anlat.", "Fısıldayarak oku."] },
                    K: { title: "KİNESTETİK ÖĞRENCİ", icon: "🏃", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Dünyayı bedeninle algılıyorsun.", tips: ["Hareketli çalış.", "Sık mola ver."] }
                };
                let resultZone = strategies[maxStyle];
                content = (
                    <div className={`p-6 rounded-2xl border ${resultZone.bg} ${resultZone.border} mb-8 text-left`}>
                        <div className="flex items-center gap-3 mb-4 justify-center"><span className="text-4xl">{resultZone.icon}</span><h3 className={`text-2xl font-extrabold ${resultZone.color}`}>{resultZone.title}</h3></div>
                        <p className="text-center font-medium mb-4 text-slate-600">{resultZone.desc}</p>
                    </div>
                );
            }
            // --- KOLB SONUÇ EKRANI ---
            else if (testData.id === 'kolb') {
                let counts = { SY: 0, YG: 0, SK: 0, AY: 0 };
                Object.keys(answers).forEach(key => { if (key.startsWith('k') && counts[answers[key]] !== undefined) counts[answers[key]]++; });
                const algilama = counts.SK - counts.SY; const isleme = counts.AY - counts.YG;   
                let profile = {};
                if(algilama >= 0 && isleme >= 0) profile = { title: "AYRIŞTIRAN", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
                else if(algilama >= 0 && isleme < 0) profile = { title: "ÖZÜMSEYEN", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
                else if(algilama < 0 && isleme >= 0) profile = { title: "YERLEŞTİREN", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
                else profile = { title: "DEĞİŞTİREN", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" };
                content = (
                    <div className={`p-6 rounded-2xl border ${profile.bg} ${profile.border} mb-8 text-center`}>
                        <h3 className={`text-2xl font-extrabold ${profile.color}`}>{profile.title}</h3>
                    </div>
                );
            }
            // --- ÇZ-8 SONUÇ EKRANI ---
            else if (testData.id === 'cz-8') {
                let scores = {
                    'Sözel': parseInt(answers['cz1']||0) + parseInt(answers['cz2']||0) + parseInt(answers['cz3']||0),
                    'Mantıksal': parseInt(answers['cz4']||0) + parseInt(answers['cz5']||0) + parseInt(answers['cz6']||0),
                    'Görsel': parseInt(answers['cz7']||0) + parseInt(answers['cz8']||0) + parseInt(answers['cz9']||0)
                };
                let sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
                content = (
                    <div className="p-6 rounded-2xl border bg-indigo-50 border-indigo-200 mb-8 text-center">
                        <h3 className="text-2xl font-extrabold text-indigo-600">BASKIN: {sorted[0][0].toUpperCase()} ZEKÂ</h3>
                    </div>
                );
            }
            // --- DOPA SONUÇ EKRANI ---
            else if (testData.id === 'dopa') {
                let dopaSelf = 0;
                Object.keys(answers).forEach(key => { if (key.startsWith('dopa_s')) dopaSelf += parseInt(answers[key] || 0); });
                
                // Dijital görevden gelen veriler
                const perfSpeed = answers['dopa_perf']?.speed || 0;
                const perfErr = answers['dopa_perf']?.errors || 0;
                
                let profile = {};
                if (perfErr > 5) {
                    profile = { title: "TAVŞAN (Hızlı/Hatalı)", icon: "🐇", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", desc: "Hız felakettir, bilinçli yavaşlamalısın." };
                } else if (perfSpeed < 10) {
                    profile = { title: "KAPLUMBAĞA (Yavaş/Dikkatli)", icon: "🐢", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Zaman baskısı altında test çözme pratiği yap." };
                } else {
                    profile = { title: "DENGELİ ODAK", icon: "⚖️", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Dikkat ve hız dengen mükemmel." };
                }

                content = (
                    <div className={`p-6 rounded-2xl border ${profile.bg} ${profile.border} mb-8 text-center`}>
                        <div className="text-4xl mb-2">{profile.icon}</div>
                        <h3 className={`text-2xl font-extrabold ${profile.color} mb-4`}>{profile.title}</h3>
                        
                        <div className="flex justify-around text-sm font-bold text-slate-700 bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                            <div className="text-center text-slate-400 text-xs">HIZ (Satır)<br/><span className="text-indigo-600 text-2xl">{perfSpeed}</span></div>
                            <div className="text-center text-slate-400 text-xs">HATA<br/><span className="text-rose-600 text-2xl">{perfErr}</span></div>
                            <div className="text-center text-slate-400 text-xs">ÖZ-ALGI<br/><span className="text-emerald-600 text-2xl">{dopaSelf}</span></div>
                        </div>
                        <p className="text-slate-600 font-medium">{profile.desc}</p>
                    </div>
                );
            }
            // --- ADTE-20 SONUÇ EKRANI ---
            else if (testData.id === 'adte-20') {
                let scoreA = 0, scoreB = 0;
                Object.keys(answers).forEach(key => {
                    if (key.startsWith('adte_a')) scoreA += parseInt(answers[key] || 0);
                    if (key.startsWith('adte_b')) scoreB += parseInt(answers[key] || 0);
                });

                const getZone = (s) => {
                    if (s >= 20) return { title: "YÜKSEK RİSK", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
                    if (s >= 11) return { title: "RİSKLİ", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
                    return { title: "NORMAL", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
                };

                const zoneA = getZone(scoreA);
                const zoneB = getZone(scoreB);

                content = (
                    <div className="space-y-4 mb-8">
                        <div className={`p-5 rounded-2xl border ${zoneA.bg} ${zoneA.border} flex justify-between items-center`}>
                            <div className="text-left">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Dalgınlık Modülü</div>
                                <div className={`font-extrabold text-lg ${zoneA.color}`}>{zoneA.title}</div>
                            </div>
                            <div className={`text-4xl font-black ${zoneA.color}`}>{scoreA}<span className="text-lg opacity-50">/30</span></div>
                        </div>
                        <div className={`p-5 rounded-2xl border ${zoneB.bg} ${zoneB.border} flex justify-between items-center`}>
                            <div className="text-left">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hareketlilik Modülü</div>
                                <div className={`font-extrabold text-lg ${zoneB.color}`}>{zoneB.title}</div>
                            </div>
                            <div className={`text-4xl font-black ${zoneB.color}`}>{scoreB}<span className="text-lg opacity-50">/30</span></div>
                        </div>
                        {(scoreA >= 20 || scoreB >= 20) && (
                            <div className="p-4 bg-slate-800 text-white rounded-xl text-sm font-medium leading-relaxed">
                                ⚠️ <strong>Uyarı:</strong> Puanlarından bazıları klinik şüphe sınırının üzerinde. Eğitim koçluğunu desteklemek amacıyla bir Çocuk ve Ergen Psikiyatristi'nden görüş alman akademik geleceğin için çok faydalı olacaktır.
                            </div>
                        )}
                    </div>
                );
            }

            // --- VGF-E SONUÇ EKRANI ---
            else if (testData.id === 'vgf-e') {
                let scoreA = 0, scoreB = 0, scoreC = 0;
                Object.keys(answers).forEach(key => {
                    if (key.startsWith('vgf_a')) scoreA += parseInt(answers[key] || 0);
                    if (key.startsWith('vgf_b')) scoreB += parseInt(answers[key] || 0);
                    if (key.startsWith('vgf_c')) scoreC += parseInt(answers[key] || 0);
                });
                const totalScore = scoreA + scoreB + scoreC;

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className="p-6 rounded-2xl border bg-indigo-50 border-indigo-200 text-center shadow-sm">
                            <div className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-2">Genel Gözlem Puanınız</div>
                            <div className="text-6xl font-black text-indigo-700">{totalScore}<span className="text-2xl opacity-50">/100</span></div>
                            <p className="mt-4 text-indigo-800 font-medium text-sm leading-relaxed">
                                Katkılarınız ve dürüst cevaplarınız için teşekkür ederiz. Bu veriler, öğrencimizin öz-değerlendirmesiyle karşılaştırılarak (Boşluk Analizi) size ve öğrencimize özel bir koçluk stratejisi oluşturmak için titizlikle kullanılacaktır.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                                <div className="text-xs font-bold text-slate-400 mb-1">AKADEMİK DİSİPLİN</div>
                                <div className="text-2xl font-bold text-slate-700">{scoreA}<span className="text-sm text-slate-400">/35</span></div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                                <div className="text-xs font-bold text-slate-400 mb-1">DUYGUSAL DURUM</div>
                                <div className="text-2xl font-bold text-slate-700">{scoreB}<span className="text-sm text-slate-400">/35</span></div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                                <div className="text-xs font-bold text-slate-400 mb-1">YAŞAM BECERİLERİ</div>
                                <div className="text-2xl font-bold text-slate-700">{scoreC}<span className="text-sm text-slate-400">/30</span></div>
                            </div>
                        </div>
                    </div>
                );
            }

            // --- ÖZ-AF SONUÇ EKRANI ---
            else if (testData.id === 'oz-af') {
                const wheelScores = {
                    'Ders Başarısı': parseInt(answers['wheel_1'] || 0),
                    'Uyku Düzeni': parseInt(answers['wheel_2'] || 0),
                    'Aile İlişkileri': parseInt(answers['wheel_3'] || 0),
                    'Arkadaş İlişkileri': parseInt(answers['wheel_4'] || 0),
                    'Motivasyon/Ruh Hali': parseInt(answers['wheel_5'] || 0),
                    'Fiziksel Sağlık/Beslenme': parseInt(answers['wheel_6'] || 0)
                };
                
                let lowestArea = Object.keys(wheelScores).reduce((a, b) => wheelScores[a] < wheelScores[b] ? a : b);
                let lowestScore = wheelScores[lowestArea];
                let average = (Object.values(wheelScores).reduce((a, b) => a + b, 0) / 6).toFixed(1);

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className="p-6 rounded-2xl border bg-indigo-50 border-indigo-200 text-center shadow-sm">
                            <div className="text-sm font-bold uppercase tracking-widest text-indigo-500 mb-2">Yaşam Çarkı Ortalaman</div>
                            <div className="text-6xl font-black text-indigo-700">{average}<span className="text-2xl opacity-50">/10</span></div>
                            <p className="mt-4 text-indigo-800 font-medium text-sm leading-relaxed">
                                Kendine ayna tuttun ve dürüst davrandın. Gelişimin ilk şartı mevcut durumu kabul etmektir. Kırmızı ışıkta (DUR) bıraktığın alışkanlıklar ve yeşil ışıkta (BAŞLA) aldığın yeni kararlar koçun tarafından titizlikle takip edilecek.
                            </p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm">
                            <h4 className="font-extrabold text-rose-600 mb-2 flex items-center gap-2">⚠️ Gelişim Alanın: {lowestArea} ({lowestScore}/10)</h4>
                            <p className="text-slate-600 text-sm font-medium">Bu alanı güçlendirmek için kendi belirlediğin eylem planı:</p>
                            <div className="mt-3 p-3 bg-rose-50 rounded-lg text-rose-800 italic text-sm border-l-4 border-rose-400">
                                "{answers['wheel_action'] || 'Plan belirtilmedi.'}"
                            </div>
                        </div>
                    </div>
                );
            }

            // --- ADT-Ö SONUÇ EKRANI ---
            else if (testData.id === 'adt-o') {
                // Kritik dersleri bul (5 ve altı puan)
                const lessons = {
                    'Matematik': parseInt(answers['adt_m1'] || 10),
                    'Geometri': parseInt(answers['adt_m2'] || 10),
                    'Türkçe': parseInt(answers['adt_t1'] || 10),
                    'Fizik': parseInt(answers['adt_f1'] || 10),
                    'Kimya': parseInt(answers['adt_f2'] || 10),
                    'Biyoloji': parseInt(answers['adt_f3'] || 10),
                    'Tarih': parseInt(answers['adt_s1'] || 10),
                    'Coğrafya': parseInt(answers['adt_s2'] || 10)
                };

                const criticalLessons = Object.keys(lessons).filter(k => lessons[k] <= 5);
                
                // Teşhis Puanları (4 veya 5 verilen cevaplar 'Katılıyorum' sayılır)
                const isAgree = (id) => parseInt(answers[id] || 0) >= 4 ? 1 : 0;
                
                const temelEksikligi = isAgree('adt_b1_4') + isAgree('adt_b1_5'); // Max 2
                const ogretmenOnyargi = isAgree('adt_b1_1') + isAgree('adt_b2_5'); // Max 2
                const kacinmaKorku = isAgree('adt_b1_3') + isAgree('adt_b2_1') + isAgree('adt_b3_1'); // Max 3

                let teshisTitle = "GENEL İSTEKSİZLİK";
                let teshisDesc = "Belirgin bir fobi veya temel eksikliği yok ancak ders çalışma disiplininde motivasyon artışına ihtiyaç var.";
                let bgColor = "bg-slate-50"; let borderColor = "border-slate-200"; let textColor = "text-slate-700";

                if (temelEksikligi >= ogretmenOnyargi && temelEksikligi >= kacinmaKorku && temelEksikligi > 0) {
                    teshisTitle = "TEMEL EKSİKLİĞİ (Anlamıyorum)";
                    teshisDesc = "Dersi sevmiyor değilsin, sadece aradaki basamaklar eksik. Koçunla birlikte derhal bir alt seviyeden, daha kolay kaynaklarla temel atma kampına başlamalısın.";
                    bgColor = "bg-blue-50"; borderColor = "border-blue-200"; textColor = "text-blue-700";
                } else if (ogretmenOnyargi > temelEksikligi && ogretmenOnyargi >= kacinmaKorku) {
                    teshisTitle = "ÖĞRETMEN / ÖNYARGI (Soğudum)";
                    teshisDesc = "Senin kavgan dersin kendisiyle değil, onu anlatan kişiyle veya dersin imajıyla. O derse farklı bir hocadan (örn: alternatif YouTube kanallarından) sıfırdan bir şans vermelisin.";
                    bgColor = "bg-amber-50"; borderColor = "border-amber-200"; textColor = "text-amber-700";
                } else if (kacinmaKorku > temelEksikligi && kacinmaKorku > ogretmenOnyargi) {
                    teshisTitle = "KAÇINMA / KORKU (Yapamıyorum)";
                    teshisDesc = "Ders sana bir fobiye dönüşmüş ve 'öğrenilmiş çaresizlik' yaşıyorsun. İnanç kalıplarını yıkmak için koçunla 'İnanç ve Zihniyet Çalışması' yapmalısın.";
                    bgColor = "bg-rose-50"; borderColor = "border-rose-200"; textColor = "text-rose-700";
                }

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        {criticalLessons.length > 0 ? (
                            <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-sm">
                                <h4 className="font-bold text-rose-600 mb-2 flex items-center gap-2">🚨 Direnç Gösterdiğin Dersler</h4>
                                <div className="flex flex-wrap gap-2">
                                    {criticalLessons.map(l => (
                                        <span key={l} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm font-semibold border border-rose-200">{l} ({lessons[l]}/10)</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold shadow-sm text-center">
                                Harika! Bariz bir şekilde direnç gösterdiğin veya nefret ettiğin bir branş yok.
                            </div>
                        )}

                        <div className={`p-6 rounded-2xl border ${bgColor} ${borderColor} shadow-sm`}>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Gizli Direnç Teşhisi</div>
                            <div className={`text-2xl font-black ${textColor} mb-3`}>{teshisTitle}</div>
                            <p className={`${textColor} font-medium leading-relaxed opacity-90`}>{teshisDesc}</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                            <h4 className="font-extrabold text-slate-800 mb-4 uppercase tracking-wider text-sm">💡 FocusON Taktik Odası</h4>
                            <ul className="space-y-3">
                                {criticalLessons.includes('Matematik') || criticalLessons.includes('Geometri') ? (
                                    <li className="flex gap-3 text-sm text-slate-700"><span className="text-xl">📐</span> <div><strong>Matematik/Geometri:</strong> Sloganımız "Kalemle düşün". Soruyu zihinden çözmeye çalışma, sadece verilenleri yaz ve şekli çiz.</div></li>
                                ) : null}
                                {criticalLessons.includes('Fizik') || criticalLessons.includes('Kimya') ? (
                                    <li className="flex gap-3 text-sm text-slate-700"><span className="text-xl">🧪</span> <div><strong>Fizik/Kimya:</strong> Sloganımız "Formülü değil, olayı anla". Olayı günlük hayatla (arabanın freni, çayın kaynaması) bağdaştır.</div></li>
                                ) : null}
                                {criticalLessons.includes('Tarih') || criticalLessons.includes('Coğrafya') ? (
                                    <li className="flex gap-3 text-sm text-slate-700"><span className="text-xl">🌍</span> <div><strong>Sosyal Bilimler:</strong> Sloganımız "Hikayeleştir". Ezber yapma, olayları film senaryosu gibi anlat.</div></li>
                                ) : null}
                                {criticalLessons.includes('Türkçe') ? (
                                    <li className="flex gap-3 text-sm text-slate-700"><span className="text-xl">📖</span> <div><strong>Türkçe/Paragraf:</strong> Sloganımız "Dedektiflik yap". Metni okurken yazarın hatasını veya sana verdiği gizli mesajı bulmaya çalış.</div></li>
                                ) : null}
                                {criticalLessons.length === 0 ? (
                                    <li className="text-sm text-slate-500 italic">Dirençli dersin olmadığı için mevcut temponda genel tekrarlara devam edebilirsin.</li>
                                ) : null}
                            </ul>
                        </div>
                    </div>
                );
            }

            // --- AS-EQ (DUYGUSAL ZEKÂ) SONUÇ EKRANI ---
            else if (testData.id === 'as-eq') {
                let scores = {
                    'Öz-Bilinç': 0, 'Öz-Yönetim': 0, 'Motivasyon': 0, 'Empati': 0, 'Sosyal Beceriler': 0
                };
                
                Object.keys(answers).forEach(key => {
                    let val = parseInt(answers[key] || 0);
                    if (key.startsWith('aseq_1')) scores['Öz-Bilinç'] += val;
                    if (key.startsWith('aseq_2')) scores['Öz-Yönetim'] += val;
                    if (key.startsWith('aseq_3')) scores['Motivasyon'] += val;
                    if (key.startsWith('aseq_4')) scores['Empati'] += val;
                    if (key.startsWith('aseq_5')) scores['Sosyal Beceriler'] += val;
                });

                const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

                let profile = {};
                if (totalScore >= 100) {
                    profile = { title: "YÜKSEK DUYGUSAL ZEKÂ", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Harika! Lider ruhlusun, stres yönetimin çok iyi. Akademik başarı potansiyelin oldukça yüksek çünkü duyguların seni değil, sen onları yönetiyorsun." };
                } else if (totalScore >= 75) {
                    profile = { title: "ORTA DUYGUSAL ZEKÂ", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "İyi yoldasın ama gelişime açıksın. Duygusal zekâ bir kas gibidir ve bazı alt boyutlarda (örneğin stres anında) bu kasını biraz daha güçlendirmen gerekiyor." };
                } else {
                    profile = { title: "DÜŞÜK DUYGUSAL ZEKÂ", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", desc: "Duyguların sık sık mantığının önüne geçiyor. Sınav kaygısı veya sosyal uyumsuzluk nedeniyle akademik potansiyelini harcama riskin var. Hemen aksiyon almalıyız." };
                }

                // En düşük boyutu ve tavsiyesini bul
                let lowestDim = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b);
                let exerciseTitle = "";
                let exerciseDesc = "";

                if (lowestDim === 'Öz-Yönetim' || lowestDim === 'Öz-Bilinç') {
                    exerciseTitle = "Trafik Işığı Tekniği";
                    exerciseDesc = "Kırmızı: Dur! (Duyguyu hisset ama tepki verme). Sarı: Düşün! (Bu duygu bana ne söylüyor?). Yeşil: Yap! (En mantıklı ve yapıcı seçeneği uygula).";
                } else if (lowestDim === 'Motivasyon') {
                    exerciseTitle = "Başarı Günlüğü";
                    exerciseDesc = "Her akşam o gün başardığın en küçük şeyi bile not al (Örn: Bugün 10 sayfa okudum). Bu beynindeki dopamin salgısını artırarak pes etmeni engelleyecek.";
                } else {
                    exerciseTitle = "Onun Ayakkabıları";
                    exerciseDesc = "Bir dahaki sefere biriyle tartıştığında onun yerine geç ve olayı 'Ben' diliyle değil, 'O' diliyle (onun gözünden) içinden tekrar anlat.";
                }

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${profile.bg} ${profile.border} text-center shadow-sm`}>
                            <div className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Genel EQ Skorun</div>
                            <div className={`text-6xl font-black ${profile.color}`}>{totalScore}<span className="text-2xl opacity-50">/125</span></div>
                            <div className={`text-xl font-extrabold ${profile.color} mt-2`}>{profile.title}</div>
                            <p className="mt-4 text-slate-700 font-medium text-sm leading-relaxed">{profile.desc}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(scores).map(([name, score]) => (
                                <div key={name} className={`bg-white p-3 rounded-xl border ${name === lowestDim ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-100'} shadow-sm text-center`}>
                                    <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">{name}</div>
                                    <div className={`text-xl font-bold ${name === lowestDim ? 'text-rose-600' : 'text-slate-700'}`}>{score}<span className="text-xs text-slate-400">/25</span></div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm mt-4">
                            <h4 className="font-extrabold text-slate-800 mb-2 flex items-center gap-2">
                                🎯 Antrenman: {lowestDim} Alanı
                            </h4>
                            <p className="text-slate-600 text-sm font-medium mb-3">En düşük puanı bu alandan aldın. Duygusal kasını güçlendirmek için koçunun sana önerisi:</p>
                            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                                <strong className="text-indigo-700 block mb-1">{exerciseTitle}</strong>
                                <span className="text-indigo-900 text-sm">{exerciseDesc}</span>
                            </div>
                        </div>
                    </div>
                );
            }

            // --- ABBA (AİLE VE BENLİK) SONUÇ EKRANI ---
            else if (testData.id === 'abba') {
                // Soru sıralamasına göre ters puanlanacak (olumsuz) maddelerin ID'leri
                const reverseIds = [
                    'abba_a_2', 'abba_a_3', 'abba_a_6', 'abba_a_7', 'abba_a_8', 'abba_a_10',
                    'abba_b_2', 'abba_b_3', 'abba_b_4', 'abba_b_7', 'abba_b_9',
                    'abba_c_2', 'abba_c_3', 'abba_c_4'
                ];
                
                let scoreA = 0, scoreB = 0, scoreC = 0;
                
                Object.keys(answers).forEach(key => {
                    let val = parseInt(answers[key] || 0);
                    // Ters puanlama matematiği (5->1, 4->2, 3->3, 2->4, 1->5)
                    if (reverseIds.includes(key) && val > 0) {
                        val = 6 - val; 
                    }
                    
                    if (key.startsWith('abba_a')) scoreA += val;
                    if (key.startsWith('abba_b')) scoreB += val;
                    if (key.startsWith('abba_c')) scoreC += val;
                });

                // 30 Puanı eşik değer (nötr) kabul ediyoruz. Altı riskli, üstü olumlu.
                let profile = { 
                    title: "DENGELİ VE SAĞLIKLI BÜTÜNLÜK", 
                    desc: "Aile desteğin, öz değerin ve akademik inancın genel olarak çok sağlıklı bir dengede. Bu sağlam psikolojik zemin, sınav sürecinde en büyük gücün olacak.", 
                    alert: false, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" 
                };

                if (scoreA < 30 && scoreB < 30) {
                    profile = { 
                        title: "🚩 CAM KULE SENDROMU", 
                        desc: "Ailenin beklentisi/baskısı yüksekken, sende hata yapma korkusu ve öz değer eksikliği var. Sınavı bir 'sevilme veya onaylanma' aracı olarak görüyorsun, bu da sınav anı blokajı riskini artırıyor.", 
                        alert: true, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" 
                    };
                } else if (scoreA < 30 && scoreC >= 30) {
                    profile = { 
                        title: "🚩 GİZLİ CEVHER", 
                        desc: "Kendine ve akademik kapasitene güveniyorsun ama evde yeterli desteği veya huzuru bulamıyorsun. Evdeki iletişim kopuklukları veya baskı, motivasyonunu düşürebilir.", 
                        alert: true, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" 
                    };
                } else if (scoreA >= 30 && scoreC < 30) {
                    profile = { 
                        title: "🚩 SABİT ZİHNİYET", 
                        desc: "Ailen seni çok destekliyor ve seviyor ama sen içten içe 'Ben yapamam, kafam basmıyor' diyerek kendini sınırlıyorsun. Destekleyici ortama rağmen kendi potansiyeline haksızlık ediyorsun.", 
                        alert: true, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" 
                    };
                }

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${profile.bg} ${profile.border} text-center shadow-sm`}>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Bütüncül Analiz Teşhisi</div>
                            <div className={`text-2xl font-black ${profile.color} mb-3`}>{profile.title}</div>
                            <p className={`${profile.color} font-medium leading-relaxed opacity-90`}>{profile.desc}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                                <div className="text-xs font-bold text-slate-400 mb-1">AİLE DESTEĞİ</div>
                                <div className={`text-3xl font-black ${scoreA >= 30 ? 'text-emerald-600' : 'text-rose-600'}`}>{scoreA}<span className="text-sm text-slate-400">/50</span></div>
                                <div className="text-[10px] text-slate-400 mt-1 uppercase">{scoreA >= 30 ? 'Destekleyici' : 'Baskıcı/Otoriter'}</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                                <div className="text-xs font-bold text-slate-400 mb-1">BENLİK SAYGISI</div>
                                <div className={`text-3xl font-black ${scoreB >= 30 ? 'text-emerald-600' : 'text-rose-600'}`}>{scoreB}<span className="text-sm text-slate-400">/50</span></div>
                                <div className="text-[10px] text-slate-400 mt-1 uppercase">{scoreB >= 30 ? 'Yüksek Öz Değer' : 'Değersizlik Hissi'}</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                                <div className="text-xs font-bold text-slate-400 mb-1">AKADEMİK İNANÇ</div>
                                <div className={`text-3xl font-black ${scoreC >= 30 ? 'text-emerald-600' : 'text-rose-600'}`}>{scoreC}<span className="text-sm text-slate-400">/50</span></div>
                                <div className="text-[10px] text-slate-400 mt-1 uppercase">{scoreC >= 30 ? 'Gelişim Zihniyeti' : 'Çaresizlik İnancı'}</div>
                            </div>
                        </div>
                        
                        {profile.alert && (
                            <div className="p-4 bg-slate-800 text-white rounded-xl text-sm font-medium leading-relaxed">
                                💡 <strong>Koçluk Notu:</strong> Bu sonuçlar senin kişisel değerini değil, şu anki "inanç ve ev ortamı" dengeni gösterir. Koçunla birlikte hedeflerini, dışarıdan gelen baskıdan uzaklaştırıp tamamen senin potansiyeline uygun şekilde yeniden tasarlayacağız.
                            </div>
                        )}
                    </div>
                );
            }

            // --- AG-MOT (GELECEK VE MOTİVASYON) SONUÇ EKRANI ---
            else if (testData.id === 'ag-mot') {
                const reverseIds = ['ag_mot_16', 'ag_mot_17', 'ag_mot_18', 'ag_mot_19', 'ag_mot_20'];
                let totalScore = 0;
                
                Object.keys(answers).forEach(key => {
                    if (key.startsWith('ag_mot_')) {
                        let val = parseInt(answers[key] || 0);
                        if (reverseIds.includes(key) && val > 0) {
                            val = 6 - val; // Ters puanlama (5->1, 1->5)
                        }
                        totalScore += val;
                    }
                });

                let profile = {};
                if (totalScore >= 70) {
                    profile = {
                        title: "🚨 YÜKSEK RİSK (Kırmızı Alarm)",
                        desc: "Şu an zihnen 'şalteri indirmiş' durumdasın. Mükemmeliyetçilik ve felaket senaryoları seni öylesine dondurmuş ki, masaya otursan bile içindeki ses 'Zaten olmayacak' diyor. Bu bir öğrenilmiş çaresizlik hali.",
                        color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200"
                    };
                } else if (totalScore >= 46) {
                    profile = {
                        title: "⚠️ ORTA RİSK (Sarı Alarm)",
                        desc: "Sınava çok fazla 'hayat memat' anlamı yüklüyorsun. 'Ya hep ya hiç' tarzı düşünceler yavaş yavaş motivasyonunu kemirmeye başlamış. Koçunla hemen alternatif 'B Planlarını' konuşmalısın.",
                        color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200"
                    };
                } else {
                    profile = {
                        title: "✅ NORMAL DÜZEY",
                        desc: "Harika! Sınav kaygın son derece gerçekçi ve sağlıklı bir seviyede. Hedeflerin var ama sınavı hayatının tek anlamı haline getirmemişsin. Dayanıklılığın (Resilience) çok yüksek.",
                        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200"
                    };
                }

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${profile.bg} ${profile.border} text-center shadow-sm`}>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Bilişsel Çarpıtma ve Umutsuzluk Puanın</div>
                            <div className={`text-6xl font-black ${profile.color} mb-3`}>{totalScore}<span className="text-2xl opacity-50">/100</span></div>
                            <div className={`text-xl font-extrabold ${profile.color} mb-2`}>{profile.title}</div>
                            <p className={`${profile.color} font-medium leading-relaxed opacity-90`}>{profile.desc}</p>
                        </div>
                        
                        {(totalScore >= 46) && (
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                <h4 className="font-extrabold text-slate-800 mb-3 text-sm uppercase tracking-wider">💡 Zihin Hackleme: Bakış Açısını Değiştir</h4>
                                <ul className="space-y-3">
                                    <li className="flex gap-3 text-sm text-slate-700"><span>🔄</span> <div><strong>Ya Hep Ya Hiç Yerine:</strong> "İlk 10.000 harika olur ama 50.000 gelirse de bu bir başarısızlık değil, farklı ve güzel bir yoldur."</div></li>
                                    <li className="flex gap-3 text-sm text-slate-700"><span>📉</span> <div><strong>Genelleme Yerine:</strong> "Bugün çalışamadın veya denemen kötü geçti diye yıl bitmedi. Önümüzde telafi edebileceğin kocaman bir zaman var."</div></li>
                                    <li className="flex gap-3 text-sm text-slate-700"><span>🎭</span> <div><strong>Etiketleme Yerine:</strong> "Sen aptal veya tembel değilsin; sadece bu soruyu 'henüz' nasıl çözeceğini keşfetmedin."</div></li>
                                </ul>
                            </div>
                        )}

                        {totalScore >= 70 && parseInt(answers['ag_mot_1'] || 0) >= 4 && parseInt(answers['ag_mot_5'] || 0) >= 4 && (
                            <div className="p-4 bg-slate-800 text-white rounded-xl text-sm font-medium leading-relaxed mt-4">
                                🩺 <strong>Klinik Uyarı:</strong> Geleceğe dair bu kadar yoğun karanlık ve çaresizlik hissetmen sadece basit bir sınav stresi olmayabilir. Lütfen bu hislerini güvendiğin bir uzmana (psikolog/psikiyatrist) veya bize dürüstçe aç. Yalnız değilsin.
                            </div>
                        )}
                    </div>
                );
            }

            // --- DİĞER GENEL SONUÇ ---
            else {
                content = <p className="text-emerald-600 font-medium mb-8">Verilerin başarıyla koçuna iletildi!</p>;
            }
        }

        return (
            <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in relative">
                <FullscreenToggle />
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100 relative z-10">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-6">{isSubmitting ? 'Kaydediliyor...' : 'Analiz Tamamlandı! 🎉'}</h2>
                    {content}
                    {!isSubmitting && (
                        <a href="index.html" className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg transition-colors">Ana Ekrana Dön</a>
                    )}
                </div>
            </div>
        );
    }

    // Sorular Ekranı
    const progress = ((step) / totalQuestions) * 100;

    return (
        <div className="h-full flex flex-col relative">
            <FullscreenToggle />
            <div className="h-1.5 w-full bg-slate-100 fixed top-0 left-0 z-40">
                <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full p-6 md:p-12 relative z-10">
                <div className={`transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100 question-enter'}`}>
                    
                    <div className="flex items-center gap-3 text-indigo-600 font-bold tracking-widest uppercase text-xs mb-6">
                        <span>{currentQ.section}</span>
                        <span className="w-1 h-1 rounded-full bg-indigo-300"></span>
                        <span className="text-slate-400">{step + 1} / {totalQuestions}</span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 mb-10 leading-tight">{currentQ.text}</h2>

                    <div className="w-full">
                        {/* YENİ: DİJİTAL DOPA GÖREVİ */}
                        {currentQ.type === 'dopa_task' && (
                            <DopaInteractiveTask onComplete={(result) => {
                                handleAnswer(result);
                                setTimeout(nextStep, 500);
                            }} />
                        )}

                        {/* TEXT / NUMBER */}
                        {(currentQ.type === 'text' || currentQ.type === 'number') && (
                            <input type={currentQ.type} autoFocus value={answers[currentQ.id] || ''} onChange={(e) => handleAnswer(e.target.value)} placeholder={currentQ.placeholder} className="w-full text-2xl md:text-3xl text-indigo-900 placeholder-slate-300 bg-transparent border-b-2 border-slate-200 focus:border-indigo-600 outline-none pb-4 transition-colors" />
                        )}

                        {/* TEXTAREA */}
                        {currentQ.type === 'textarea' && (
                            <textarea autoFocus value={answers[currentQ.id] || ''} onChange={(e) => handleAnswer(e.target.value)} placeholder={currentQ.placeholder} className="w-full h-32 text-xl md:text-2xl text-indigo-900 placeholder-slate-300 bg-transparent border-b-2 border-slate-200 focus:border-indigo-600 outline-none pb-4 transition-colors resize-none"></textarea>
                        )}

                        {/* LIKERT */}
                        {currentQ.type === 'likert' && (
                            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                {['1: Hiç', '2: Nadiren', '3: Bazen', '4: Sıklıkla', '5: Her Zaman'].map((opt, i) => {
                                    const val = i + 1;
                                    const isSelected = answers[currentQ.id] === val;
                                    return (
                                        <button key={val} onClick={() => { handleAnswer(val); setTimeout(nextStep, 400); }} className={`flex-1 py-4 px-2 rounded-xl border-2 font-bold text-sm md:text-base transition-all transform hover:-translate-y-1 flex flex-col items-center gap-2 ${isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300'}`}>
                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{val}</div>
                                            {opt.split(': ')[1]}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* LİKERT 0-3 (ADTE-20 İÇİN) */}
                        {currentQ.type === 'likert_0_3' && (
                            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                {['0: Hiçbir Zaman', '1: Bazen', '2: Sık Sık', '3: Çok Sık'].map((opt, i) => {
                                    const val = i; 
                                    const isSelected = answers[currentQ.id] === val;
                                    return (
                                        <button key={val} onClick={() => { handleAnswer(val); setTimeout(nextStep, 400); }} className={`flex-1 py-4 px-2 rounded-xl border-2 font-bold text-sm md:text-base transition-all transform hover:-translate-y-1 flex flex-col items-center gap-2 ${isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300'}`}>
                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{val}</div>
                                            {opt.split(': ')[1]}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* ÇOKTAN SEÇMELİ */}
                        {currentQ.type === 'multiple_choice' && (
                            <div className="flex flex-col gap-3 md:gap-4">
                                {currentQ.options.map((opt, i) => {
                                    const isSelected = answers[currentQ.id] === opt.value;
                                    return (
                                        <label key={i} className={`cursor-pointer p-4 rounded-xl border-2 font-semibold text-base md:text-lg transition-all transform hover:-translate-y-1 flex items-center gap-4 ${isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>
                                            <input type="radio" name={currentQ.id} value={opt.value} onChange={() => { handleAnswer(opt.value); setTimeout(nextStep, 400); }} checked={isSelected} className="hidden" />
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-indigo-600' : 'border-slate-300'}`}>
                                                {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                                            </div>
                                            {opt.label}
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {/* 1-10 SCALE */}
                        {currentQ.type === 'scale10' && (
                            <div className="flex flex-wrap gap-2">
                                {[1,2,3,4,5,6,7,8,9,10].map(val => (
                                    <button key={val} onClick={() => { handleAnswer(val); setTimeout(nextStep, 400); }} className={`w-12 h-14 md:w-14 md:h-16 rounded-xl border-2 font-bold text-lg transition-all transform hover:-translate-y-1 ${answers[currentQ.id] === val ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>{val}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dopa Görevi sırasında "İleri" butonu gizlenir, çünkü testin kendi akışı var */}
                    {currentQ.type !== 'dopa_task' && (
                        <div className="mt-12 flex items-center gap-4">
                            <button onClick={nextStep} disabled={answers[currentQ.id] === undefined || answers[currentQ.id] === ''} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all flex items-center gap-2">
                                İleri <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<FocusON_Engine />);
