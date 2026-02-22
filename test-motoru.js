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
                if (currentQ.type === 'likert_3' && ['1','2','3'].includes(e.key)) {
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

            // --- AB-CTE (CÜMLE TAMAMLAMA) SONUÇ EKRANI ---
            else if (testData.id === 'ab-cte') {
                content = (
                    <div className="space-y-6 mb-8 text-center">
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm">
                            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-md mb-6">
                                <span className="text-5xl">🧠</span>
                            </div>
                            <h3 className="text-2xl font-black text-indigo-900 mb-4">Bilinçaltı Verilerin Güvende!</h3>
                            <p className="text-indigo-700 font-medium leading-relaxed mb-6">
                                Bu analizin sayısal bir puanı veya geçme/kalma notu yoktur. İç dünyanı, sansürsüz düşüncelerini ve beklentilerini doğrudan veri tabanına aktardın. 
                            </p>
                            <div className="bg-white p-5 rounded-2xl border border-indigo-100 text-left">
                                <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                                    <span className="text-indigo-600">🔍</span> Şimdi Ne Olacak?
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Cevapların, senin "öğrenme psikolojini" anlamak için yapay zeka ve koçun tarafından bir bütün olarak incelenecek. Detaylı analizleri, gizli dirençlerini ve sana özel içgörüleri görmek için <strong>FocusON Asistan'a</strong> veya koçuna danışabilirsin.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            }

            // --- APK-S (SINAV KAYGISI) SONUÇ EKRANI ---
            else if (testData.id === 'apk-s') {
                let scoreA = 0, scoreB = 0, scoreC = 0;
                
                Object.keys(answers).forEach(key => {
                    let val = parseInt(answers[key] || 0);
                    if (key.startsWith('apks_a')) scoreA += val;
                    if (key.startsWith('apks_b')) scoreB += val;
                    if (key.startsWith('apks_c')) scoreC += val;
                });
                
                const totalScore = scoreA + scoreB + scoreC;

                let profile = {};
                if (totalScore >= 97) {
                    profile = { title: "PANİK DÜZEYİ (Kırmızı Bölge)", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", desc: "Sınav anında kilitlenme (donma) yaşanıyor. Bu seviyedeki kaygı performansı tamamen bloke eder." };
                } else if (totalScore >= 73) {
                    profile = { title: "YÜKSEK KAYGI (Alarm)", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", desc: "Performansın ciddi şekilde etkileniyor. Fiziksel ve zihinsel belirtiler başlamış, acil müdahale şart." };
                } else if (totalScore >= 49) {
                    profile = { title: "ORTA KAYGI (Yönetilebilir)", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Streslisin ama kontrol edebilirsin. Doğru koçluk teknikleri, nefes egzersizleri ve planlama ile bu kaygıyı itici bir güce dönüştürebiliriz." };
                } else {
                    profile = { title: "DÜŞÜK KAYGI (Sağlıklı)", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Harika! Sınav ciddiyetinin farkındasın ama kaygın seni yönetmiyor. Sağlıklı ve optimum bir stres seviyesindesin." };
                }

                // En baskın boyutu bul
                let maxDimScore = Math.max(scoreA, scoreB, scoreC);
                let dominantDim = "";
                let adviceTitle = "";
                let adviceDesc = "";
                let icon = "";

                if (maxDimScore === scoreA) {
                    dominantDim = "BİLİŞSEL (Zihinsel Kaygı)";
                    icon = "🧠";
                    adviceTitle = "Yeniden Çerçeveleme (Reframing)";
                    adviceDesc = "Zihnindeki 'Kazanamazsam biterim' senaryosunu 'Kazanamazsam B planım var, hayat devam ediyor' şeklinde değiştirmeliyiz. Felaketleştirme yapıyorsun.";
                } else if (maxDimScore === scoreB) {
                    dominantDim = "FİZİKSEL (Bedensel Kaygı)";
                    icon = "🫀";
                    adviceTitle = "Nefes ve Gevşeme (4-7-8 Tekniği)";
                    adviceDesc = "Sınav başlamadan önce veya blokaj anında: 4 saniye nefes al, 7 saniye tut, 8 saniye yavaşça ver. Bedenini sakinleştirirsen zihnin de sakinleşir.";
                } else {
                    dominantDim = "DAVRANIŞSAL (Kaçınma)";
                    icon = "🏃";
                    adviceTitle = "Sistematik Duyarsızlaştırma";
                    adviceDesc = "Kaygıdan kaçarak kurtulamazsın. Deneme sınavlarını evinin konforunda değil, kütüphane gibi sessiz ve stresli 'gerçek sınav simülasyonu' ortamlarında çözmelisin.";
                }

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${profile.bg} ${profile.border} text-center shadow-sm`}>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Genel Kaygı Skorun</div>
                            <div className={`text-6xl font-black ${profile.color} mb-3`}>{totalScore}<span className="text-2xl opacity-50">/120</span></div>
                            <div className={`text-xl font-extrabold ${profile.color} mb-2`}>{profile.title}</div>
                            <p className={`${profile.color} font-medium leading-relaxed opacity-90`}>{profile.desc}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            <div className={`bg-white p-3 rounded-xl border ${maxDimScore === scoreA ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-100'} shadow-sm text-center`}>
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Zihinsel</div>
                                <div className="text-xl font-bold text-slate-700">{scoreA}<span className="text-xs text-slate-400">/40</span></div>
                            </div>
                            <div className={`bg-white p-3 rounded-xl border ${maxDimScore === scoreB ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-100'} shadow-sm text-center`}>
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Bedensel</div>
                                <div className="text-xl font-bold text-slate-700">{scoreB}<span className="text-xs text-slate-400">/40</span></div>
                            </div>
                            <div className={`bg-white p-3 rounded-xl border ${maxDimScore === scoreC ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-100'} shadow-sm text-center`}>
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Davranışsal</div>
                                <div className="text-xl font-bold text-slate-700">{scoreC}<span className="text-xs text-slate-400">/40</span></div>
                            </div>
                        </div>

                        {totalScore >= 49 && (
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm mt-4">
                                <h4 className="font-extrabold text-slate-800 mb-2 flex items-center gap-2">
                                    {icon} Baskın Kaygı Alanı: {dominantDim}
                                </h4>
                                <p className="text-slate-600 text-sm font-medium mb-3">Senin stresin daha çok bu kanaldan dışarı çıkıyor. Çözüm reçeten:</p>
                                <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                                    <strong className="text-indigo-700 block mb-1">{adviceTitle}</strong>
                                    <span className="text-indigo-900 text-sm">{adviceDesc}</span>
                                </div>
                            </div>
                        )}

                        {totalScore >= 97 && scoreB >= 30 && (
                            <div className="p-4 bg-slate-800 text-white rounded-xl text-sm font-medium leading-relaxed mt-4">
                                🩺 <strong>Önemli Uyarı:</strong> Fiziksel belirtilerin (kalp çarpıntısı, mide bulantısı, nefes darlığı vb.) çok yüksek seviyede. Bedenin sürekli bir tehlike alarmı çalıyor. Bu durum sadece koçlukla çözülemez. Bir psikiyatrist veya klinik psikologdan destek alman sağlığın için son derece önemlidir.
                            </div>
                        )}
                    </div>
                );
            }

            // --- ZS-ODÖ (ZİHİNSEL SABOTAJ) SONUÇ EKRANI ---
            else if (testData.id === 'zs-odo') {
                let scores = {
                    'Ya Hep Ya Hiç': 0,
                    'Felaketleştirme': 0,
                    'Zihin Okuma': 0,
                    'Etiketleme': 0,
                    '-Meli / -Malı': 0
                };
                
                Object.keys(answers).forEach(key => {
                    let val = parseInt(answers[key] || 0);
                    if (key.startsWith('zs_1')) scores['Ya Hep Ya Hiç'] += val;
                    if (key.startsWith('zs_2')) scores['Felaketleştirme'] += val;
                    if (key.startsWith('zs_3')) scores['Zihin Okuma'] += val;
                    if (key.startsWith('zs_4')) scores['Etiketleme'] += val;
                    if (key.startsWith('zs_5')) scores['-Meli / -Malı'] += val;
                });

                // En yüksek puanlı tuzağı bul (Baskın Düşünce Virüsü)
                let traps = [
                    { 
                        name: 'Ya Hep Ya Hiç', score: scores['Ya Hep Ya Hiç'], icon: '⚫⚪',
                        desc: 'Mükemmeliyetçilik sorunu. "Gri alanları" görmüyorsun.',
                        fake: '"100 alamazsam başarısızım."',
                        real: '"85 almak başarısızlık değil, sadece gelişmesi gereken bir sonuçtur. Mükemmel olmasa da yeterince iyidir."'
                    },
                    { 
                        name: 'Felaketleştirme', score: scores['Felaketleştirme'], icon: '🌋',
                        desc: 'Kaygı bozukluğu eğilimi. Geleceği her zaman karanlık görüyorsun.',
                        fake: '"Sınavda kesin bayılacağım veya her şeyi unutacağım."',
                        real: '"Daha önce girdiğim denemelerde bayılmadım. Heyecanlanabilirim ama bu, sınavı yönetemeyeceğim anlamına gelmez."'
                    },
                    { 
                        name: 'Zihin Okuma', score: scores['Zihin Okuma'], icon: '🔮',
                        desc: 'Sosyal onay ihtiyacı ve özgüven eksikliği yaşıyorsun.',
                        fake: '"Hoca veya ailem benim aptal/tembel olduğumu düşünüyor."',
                        real: '"İnsanların zihnini okuyamam. Muhtemelen benimle değil, kendi işleriyle meşguller. Bu sadece benim kuruntum."'
                    },
                    { 
                        name: 'Etiketleme', score: scores['Etiketleme'], icon: '🏷️',
                        desc: 'Öz-şefkat eksikliği. Kendine düşmanca davranıyorsun.',
                        fake: '"Ben aptalım, tembelim, yeteneksizim."',
                        real: '"Ben aptal değilim, sadece bu konuda hata yapan akıllı biriyim. Davranışım hatalı olabilir ama kişiliğim değil."'
                    },
                    { 
                        name: '-Meli / -Malı (Zorunluluklar)', score: scores['-Meli / -Malı'], icon: '⛓️',
                        desc: 'Yüksek baskı ve tükenmişlik riski. Kendine esnemez kurallar dayatıyorsun.',
                        fake: '"Asla yorulmamalıyım, hep birinci olmalıyım."',
                        real: '"Ben bir insanım, robot değilim. Yorulmak suç değil, dinlenmek haktır. Dinlenirsem daha iyi çalışırım."'
                    }
                ];

                // Puanlara göre büyükten küçüğe sırala
                traps.sort((a, b) => b.score - a.score);
                let dominantTrap = traps[0];

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className="p-6 rounded-2xl border bg-indigo-50 border-indigo-200 text-center shadow-sm">
                            <div className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Baskın Düşünce Virüsün</div>
                            <div className="text-5xl mb-2">{dominantTrap.icon}</div>
                            <div className="text-2xl font-black text-indigo-700 mb-3">{dominantTrap.name}</div>
                            <p className="text-indigo-900 font-medium leading-relaxed opacity-90">{dominantTrap.desc}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {traps.map(t => (
                                <div key={t.name} className={`bg-white p-2 rounded-xl border ${t.name === dominantTrap.name ? 'border-indigo-400 ring-2 ring-indigo-100 bg-indigo-50/50' : 'border-slate-100'} shadow-sm text-center flex flex-col justify-center`}>
                                    <div className="text-[10px] font-bold text-slate-500 mb-1 leading-tight">{t.name}</div>
                                    <div className={`text-xl font-bold ${t.name === dominantTrap.name ? 'text-indigo-600' : 'text-slate-700'}`}>{t.score}<span className="text-[10px] text-slate-400">/15</span></div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm mt-4">
                            <h4 className="font-extrabold text-emerald-700 mb-3 flex items-center gap-2">
                                💊 Zihin Hackleme: Panzehir Cümlesi
                            </h4>
                            <div className="space-y-3">
                                <div className="p-3 bg-rose-50 rounded-lg border-l-4 border-rose-400">
                                    <div className="text-xs font-bold text-rose-600 mb-1 uppercase tracking-wider">İçindeki Yalan Ses:</div>
                                    <div className="text-sm text-rose-900 line-through opacity-70">{dominantTrap.fake}</div>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
                                    <div className="text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wider">Gerçek ve Sağlıklı Ses:</div>
                                    <div className="text-sm text-emerald-900 font-medium">{dominantTrap.real}</div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 italic text-center">Bu panzehir cümlesini bir post-it'e yaz ve masana yapıştır. İçindeki o acımasız ses konuştuğunda bu cümleyi ona yüksek sesle oku.</p>
                        </div>
                    </div>
                );
            }

// --- B-AVO (ANTİ-VİRÜS OPERASYONU) SONUÇ EKRANI ---
            else if (testData.id === 'b-avo') {
                const preBelief = parseInt(answers['bavo_pre_belief'] || 0);
                const postBelief = parseInt(answers['bavo_post_belief'] || 0);
                const virusType = answers['bavo_type'] || 'Bilinmeyen Virüs';
                const antiVirusText = answers['bavo_antivirus'] || '';
                
                const isSuccessful = postBelief < preBelief;
                const dropAmount = preBelief - postBelief;

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${isSuccessful ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} text-center shadow-sm`}>
                            <div className="text-5xl mb-3">{isSuccessful ? '🛡️' : '⚠️'}</div>
                            <div className={`text-2xl font-black ${isSuccessful ? 'text-emerald-700' : 'text-amber-700'} mb-2`}>
                                {isSuccessful ? 'Sistem Başarıyla Temizlendi!' : 'Dirençli Virüs Tespit Edildi!'}
                            </div>
                            <p className={`${isSuccessful ? 'text-emerald-900' : 'text-amber-900'} font-medium leading-relaxed opacity-90`}>
                                {isSuccessful 
                                    ? `Harika bir iş çıkardın! Kendi iç görünü kullanarak "${virusType}" virüsünün etkisini zihninde ${dropAmount} puan kadar zayıflattın.` 
                                    : `Virüs hala arka planda çalışmaya devam ediyor. Bu düşünce sana fayda sağlamadığı halde ona inanmaya devam ediyorsun. Koçunla bu "Dirençli Karamsarlığı" konuşmalısın.`}
                            </p>
                        </div>
                        
                        <div className="flex justify-around items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Önceki Kaygı</div>
                                <div className="text-3xl font-black text-rose-500">{preBelief}<span className="text-sm opacity-50">/10</span></div>
                            </div>
                            <div className="text-2xl text-slate-300">➡️</div>
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Sonraki Kaygı</div>
                                <div className="text-3xl font-black text-emerald-500">{postBelief}<span className="text-sm opacity-50">/10</span></div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm mt-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 text-5xl">💻</div>
                            <h4 className="font-extrabold text-emerald-400 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                🟢 Aktif Anti-Virüs Yazılımın
                            </h4>
                            <p className="text-slate-200 text-sm italic border-l-2 border-emerald-500 pl-3 py-1">
                                "{antiVirusText}"
                            </p>
                            <p className="text-xs text-slate-500 mt-4 mt-4">
                                Ne zaman o eski düşünce (Virüs) zihnine girmeye çalışsa, bu ekranı hatırla ve kendi yazdığın bu şifreyi (Anti-Virüs'ü) tekrar et. Olaylar bizi üzmez, olaylara yüklediğimiz anlamlar bizi üzer.
                            </p>
                        </div>
                    </div>
                );
            }

// --- Sİ-GÖZ (SİHİRLİ GÖZLÜKLER) SONUÇ EKRANI ---
            else if (testData.id === 'si-goz') {
                const eventText = answers['sg_event'] || 'Belirtilmedi';
                const blackText = answers['sg_black'] || 'Belirtilmedi';
                const clearText = answers['sg_clear'] || 'Belirtilmedi';
                const magicText = answers['sg_magic'] || 'Belirtilmedi';

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 text-center shadow-sm">
                            <div className="text-4xl mb-3">🌈</div>
                            <h3 className="text-2xl font-black text-violet-800 mb-2">Bakış Açın Değişti!</h3>
                            <p className="text-violet-900 font-medium leading-relaxed opacity-90 text-sm">
                                Aynı olaya baktın ama farklı bir anlam çıkardın. Olayı değiştiremeyiz ama ona vereceğimiz tepkiyi biz seçeriz. İşte zihnindeki o muazzam dönüşüm:
                            </p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative">
                            <div className="absolute top-0 right-0 p-3 text-2xl opacity-50">📌</div>
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Yaşanan Olay</h4>
                            <p className="text-slate-600 text-sm italic">"{eventText}"</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-2 right-2 text-4xl opacity-10">🕶️</div>
                                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">Siyah Gözlük <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Problem</span></h4>
                                <p className="text-slate-600 text-sm line-through opacity-70">"{blackText}"</p>
                            </div>

                            <div className="bg-fuchsia-50 p-5 rounded-xl border border-fuchsia-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-2 right-2 text-4xl opacity-10">🌈</div>
                                <h4 className="font-bold text-fuchsia-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">Sihirli Gözlük <span className="text-[10px] bg-fuchsia-200 text-fuchsia-800 px-2 py-0.5 rounded-full">Fırsat</span></h4>
                                <p className="text-fuchsia-900 text-sm font-semibold">"{magicText}"</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm mt-4">
                            <h4 className="font-extrabold text-emerald-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                🔑 FocusON Sihirli Soruları
                            </h4>
                            <p className="text-slate-600 text-sm mb-3">Bir dahaki sefere kendini karanlıkta hissettiğinde, hemen bu soruları kendine sor:</p>
                            <ul className="space-y-2 text-sm text-slate-700">
                                <li>🎁 <strong>Hediye Sorusu:</strong> "Bu kötü olayın içinde paketlenmiş gizli hediye ne olabilir?"</li>
                                <li>🧑‍🏫 <strong>Öğretmen Sorusu:</strong> "Bu sorun bana ne öğretmeye geldi? (Sabır mı, dikkat mi?)"</li>
                                <li>⏳ <strong>Zaman Makinesi:</strong> "Bu olay sayesinde gelecekteki hangi büyük hatayı önlemiş oldum?"</li>
                            </ul>
                        </div>
                    </div>
                );
            }

            // --- AMİD (İNANÇ DEĞİŞİM PROTOKOLÜ) SONUÇ EKRANI ---
            else if (testData.id === 'amid') {
                const oldBelief = answers['amid_old'] || 'Belirtilmedi';
                const newBelief = answers['amid_new'] || 'Belirtilmedi';
                const preScore = parseInt(answers['amid_pre_score'] || 10);
                const postScore = parseInt(answers['amid_post_score'] || 10);
                const nlpResult = answers['amid_nlp'] || 'Direnç';
                
                const isSuccessful = postScore < 5 && postScore < preScore;
                const dropAmount = preScore - postScore;

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${isSuccessful ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'} text-center shadow-sm`}>
                            <div className="text-5xl mb-3">{isSuccessful ? '🧬' : '⚙️'}</div>
                            <div className={`text-2xl font-black ${isSuccessful ? 'text-indigo-700' : 'text-slate-700'} mb-2`}>
                                {isSuccessful ? 'Nörolojik Bağ Koptu!' : 'Sürücü Direnci Tespit Edildi'}
                            </div>
                            <p className={`${isSuccessful ? 'text-indigo-900' : 'text-slate-600'} font-medium leading-relaxed opacity-90 text-sm`}>
                                {isSuccessful 
                                    ? `Muazzam bir zihin kontrolü! Eski kısıtlayıcı inancının beynindeki görüntü kodlarını değiştirerek, onun sana verdiği korku hissini ${dropAmount} puan kadar yok ettin. Yeni yazılım başarıyla yüklendi.` 
                                    : `İnancında bir miktar düşüş olsa da hala tam olarak kırılmamış (Puanın 5'in altına düşmeliydi). Demek ki senin beynini değiştiren 'Sürücü (Driver)' görsel değil, belki de işitsel veya dokunsal bir kanal. Bunu koçunla seansta detaylıca çözeceğiz.`}
                            </p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-rose-400"></div>
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 ml-3">🗑️ Silinen Eski Yazılım</h4>
                            <p className="text-slate-500 text-sm italic line-through ml-3">"{oldBelief}"</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-400"></div>
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 ml-3">✨ Yüklenen Yeni Yazılım</h4>
                            <p className="text-emerald-700 text-lg font-bold ml-3">"{newBelief}"</p>
                        </div>

                        <div className="flex justify-around items-center bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm text-white">
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Eski İnanç Gücü</div>
                                <div className="text-3xl font-black text-rose-500">{preScore}<span className="text-sm opacity-50 text-slate-500">/10</span></div>
                            </div>
                            <div className="text-2xl text-slate-600">➡️</div>
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Yeni İnanç Gücü</div>
                                <div className="text-3xl font-black text-emerald-400">{postScore}<span className="text-sm opacity-50 text-slate-500">/10</span></div>
                            </div>
                        </div>
                    </div>
                );
            }

            // --- AİD-Y (ZİHİNSEL YENİDEN YAPILANDIRMA) SONUÇ EKRANI ---
            else if (testData.id === 'aid-y') {
                const oldBelief = answers['aid_old_belief'] || 'Belirtilmedi';
                const newBelief = answers['aid_new_belief'] || 'Belirtilmedi';
                const actionPlan = answers['aid_action'] || 'Plan yok';
                const preScore = parseInt(answers['aid_pre_score'] || 10);
                const postScore = parseInt(answers['aid_post_score'] || 10);
                
                const isSuccessful = postScore < 5 && postScore < preScore;
                const dropAmount = preScore - postScore;

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${isSuccessful ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} text-center shadow-sm`}>
                            <div className="text-5xl mb-3">⚖️</div>
                            <div className={`text-2xl font-black ${isSuccessful ? 'text-emerald-700' : 'text-amber-700'} mb-2`}>
                                {isSuccessful ? 'Davayı Kazandın!' : 'Direnç Devam Ediyor'}
                            </div>
                            <p className={`${isSuccessful ? 'text-emerald-900' : 'text-amber-900'} font-medium leading-relaxed opacity-90 text-sm`}>
                                {isSuccessful 
                                    ? `Mükemmel bir zihinsel savunma! Kendi içindeki o negatif sesi çapraz sorguya aldın ve onun yalan olduğunu kanıtladın. İnancını ${dropAmount} puan kadar kırdın.` 
                                    : `Eski inancının gücünde bir miktar sarsılma olsa da hala ona tutunmaya devam ediyorsun (Puanın 5'in altına düşmeliydi). Koçunla bu 'Sabit Zihniyet' bariyerini seanslarda daha derinlemesine konuşmalısın.`}
                            </p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">📝 Mahkeme Tutanakları (Dönüşüm)</h4>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-1 rounded">İptal Edilen İnanç:</span>
                                    <p className="text-slate-500 text-sm italic line-through mt-1">"{oldBelief}"</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded">Kabul Edilen Yeni İnanç:</span>
                                    <p className="text-slate-800 text-base font-bold mt-1">"{newBelief}"</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">Bugünkü Eylem Hükmü:</span>
                                    <p className="text-indigo-800 text-sm font-semibold mt-1">"👉 {actionPlan}"</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white mt-4">
                            <h4 className="font-extrabold text-indigo-400 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                💬 FocusON Dil Kalıpları
                            </h4>
                            <p className="text-slate-300 text-sm mb-4">Sözcükler beyni programlar. Bugünden itibaren bu kelimeleri lügatından çıkarıyoruz:</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between items-center border-b border-slate-700 pb-2">
                                    <span className="text-rose-400 line-through">"Yapamıyorum"</span>
                                    <span>➡️</span>
                                    <span className="text-emerald-400 font-bold">"HENÜZ yapamıyorum"</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-slate-700 pb-2">
                                    <span className="text-rose-400 line-through">"Hata yaptım, bittim"</span>
                                    <span>➡️</span>
                                    <span className="text-emerald-400 font-bold">"Hata yaptım, ÖĞRENİYORUM"</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-rose-400 line-through">"Ben böyleyim"</span>
                                    <span>➡️</span>
                                    <span className="text-emerald-400 font-bold">"Ben GELİŞİYORUM"</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                );
            }

            // --- MÇ-ZP (MÜKEMMELLİK ÇEMBERİ) SONUÇ EKRANI ---
            else if (testData.id === 'mc-zp') {
                const emotion = answers['mczp_emotion'] || 'Özgüven';
                const circle = answers['mczp_circle'] || 'Parlak Çember';
                const anchor = answers['mczp_anchor'] || 'Fiziksel Çapa';
                const postScore = parseInt(answers['mczp_test'] || 10);

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 text-center shadow-sm">
                            <div className="text-5xl mb-3">⭕</div>
                            <h3 className="text-2xl font-black text-amber-800 mb-2">Çapa Başarıyla Kuruldu!</h3>
                            <p className="text-amber-900 font-medium leading-relaxed opacity-90 text-sm">
                                Muazzam bir zihin kontrolü! Beynine yeni bir nörolojik kısayol ekledin. Artık sınav anında çaresiz değilsin; kendi kurduğun bu "Özgüven Butonu" her zaman yanında.
                            </p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 text-4xl opacity-10">⚓</div>
                            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4">Senin Zirve Profilin</h4>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Çağrılan Duygu</div>
                                        <div className="text-sm font-bold text-slate-700 capitalize">{emotion}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">2</div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Koruma Kalkanı</div>
                                        <div className="text-sm font-semibold text-slate-700 italic">"{circle}"</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">3</div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Ateşleme Butonu (Tetikleyici)</div>
                                        <div className="text-sm font-black text-emerald-700 uppercase">{anchor}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white mt-4">
                            <h4 className="font-extrabold text-amber-400 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                📌 Ev Ödevi: Çapayı Güçlendir
                            </h4>
                            <p className="text-slate-300 text-xs leading-relaxed">
                                Nörolojik bağlar tekrar edildikçe bir kas gibi güçlenir. Gerçek sınava girene kadar, evdeki her deneme sınavı öncesinde zihninde o <strong>{circle}</strong> çemberini hayal et ve <strong>{anchor}</strong> hareketini yap. Sen bu hareketi yaptıkça, beynin o zirve anındaki <strong>{emotion}</strong> duygusunu otomatik olarak kanına pompalayacaktır! [cite: 1341-1344]
                            </p>
                        </div>
                    </div>
                );
            }

            // --- AT-ÇM (AKILLI TUŞ / ÇIPALAMA) SONUÇ EKRANI ---
            else if (testData.id === 'at-cm') {
                const emotion = answers['atcm_emotion'] || 'Pozitif Duygu';
                const button = answers['atcm_button'] || 'Fiziksel Tuş';
                const testResult = answers['atcm_test'] || 'Basarisiz';

                let isSuccessful = testResult === 'Basarili';
                
                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${isSuccessful ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200'} text-center shadow-sm`}>
                            <div className="text-5xl mb-3">{isSuccessful ? '🔌' : '🛠️'}</div>
                            <h3 className={`text-2xl font-black ${isSuccessful ? 'text-emerald-800' : 'text-rose-800'} mb-2`}>
                                {isSuccessful ? 'Akıllı Tuş Aktif Edildi!' : 'Kurulum Tamamlanamadı'}
                            </h3>
                            <p className={`${isSuccessful ? 'text-emerald-900' : 'text-rose-900'} font-medium leading-relaxed opacity-90 text-sm`}>
                                {isSuccessful 
                                    ? `Muazzam bir nörolojik bağ kurdun. Artık ne zaman "${button}" hareketini yapsan, beynin sana otomatik olarak "${emotion}" hissini pompalayacak.` 
                                    : `Sistem "Tuş" ile "Duygu" arasındaki bağlantıyı kuramadı. Bu çok normaldir, ilk denemede beynin bu yeni kısayolu öğrenememiş olabilir.`}
                            </p>
                        </div>
                        
                        {!isSuccessful && (
                            <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden">
                                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">🔍 Hata Ayıklama (Neden Olmadı?)</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-rose-500 font-bold">1.</span> 
                                        <div><strong>Zamanlama Hatası:</strong> Tuşa duygu tam tepe noktasındayken (Zirvede) değil, duygu sönmeye başladığında basmış olabilirsin. Zamanlama her şeydir.</div>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-rose-500 font-bold">2.</span> 
                                        <div><strong>Duygu Yetersizliği:</strong> Anıyı sadece kafanda bir film gibi "düşündün", ancak bedeninde gerçekten "hissetmedin".</div>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-rose-500 font-bold">3.</span> 
                                        <div><strong>Sıradan Hareket:</strong> Seçtiğin tuş günlük hayatta çok yaptığın (örn: çeneni kaşımak gibi) bir hareketse, beyin bunu yeni bir şifre olarak algılamaz.</div>
                                    </li>
                                </ul>
                                <p className="text-xs text-rose-600 font-bold mt-4 text-center">Lütfen testi baştan başlatarak bu kurallara dikkat edip tekrar dene.</p>
                            </div>
                        )}

                        {isSuccessful && (
                            <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white mt-4">
                                <h4 className="font-extrabold text-teal-400 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                    🔋 Batarya Kullanım Kılavuzu
                                </h4>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex gap-2"><span>🔄</span> <div><strong>Şarj Etme:</strong> Bu tuş kullanıldıkça gücünü yitirir. Haftada bir kez gözlerini kapatıp o güzel anıyı düşünerek tuşa tekrar bas ve sistemi şarj et.</div></li>
                                    <li className="flex gap-2"><span>➕</span> <div><strong>Duygu Yığma:</strong> Aynı tuşa sadece odaklanmayı değil, cesareti ve neşeyi de yükleyebilirsin (Süper Kahraman Kokteyli).</div></li>
                                    <li className="flex gap-2"><span>⚠️</span> <div><strong>Uyarı:</strong> Gerçekten üzgün veya depresif olduğun anlarda bu tuşa basma, yoksa sisteme virüs bulaşır ve tuş bozulur. Sadece sınavlarda kullan.</div></li>
                                </ul>
                            </div>
                        )}
                    </div>
                );
            }

            // --- DART (HEDEF YÖNETİMİ) SONUÇ EKRANI ---
            else if (testData.id === 'dart') {
                const macro = answers['dart_macro'] || 'Belirtilmedi';
                const mezo = answers['dart_mezo'] || 'Belirtilmedi';
                const micro = answers['dart_micro'] || 'Belirtilmedi';
                const obstacle = answers['dart_woop_obs'] || 'Belirtilmedi';
                const bPlan = answers['dart_woop_plan'] || 'Belirtilmedi';
                
                const targetQ = parseInt(answers['dart_target_q']) || 0;
                const realQ = parseInt(answers['dart_realized_q']) || 0;
                
                let kpi = 0;
                if (targetQ > 0) {
                    kpi = Math.round((realQ / targetQ) * 100);
                } else if (realQ > 0) {
                    kpi = 100;
                }

                let kpiZone = {};
                if (kpi >= 100) {
                    kpiZone = { title: "ŞAMPİYON MODU", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", desc: "Mükemmel! Ancak tükenmişlik riskine karşı dinlenmeyi ve hedeflerini kademeli artırmayı unutma." };
                } else if (kpi >= 80) {
                    kpiZone = { title: "İDEAL BÖLGE", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Sürdürülebilir başarı seviyesi. Plan tıkır tıkır işliyor, bu tempoyu koru." };
                } else if (kpi >= 50) {
                    kpiZone = { title: "RİSKLİ BÖLGE", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Planlama hatası veya dikkat dağınıklığı var. Hedefleri küçültüp daha ulaşılabilir hale getirmeliyiz." };
                } else {
                    kpiZone = { title: "ALARM BÖLGESİ", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", desc: "Hedefler şu an senin için hiç gerçekçi değil veya eyleme geçemiyorsun. Büyük resmi bırak, sadece bugüne odaklan." };
                }

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        {targetQ > 0 && (
                            <div className={`p-6 rounded-2xl border ${kpiZone.bg} ${kpiZone.border} text-center shadow-sm flex flex-col md:flex-row items-center justify-between gap-4`}>
                                <div className="text-left">
                                    <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Haftalık Hedef Tutturma Oranı</div>
                                    <div className={`text-xl font-black ${kpiZone.color}`}>{kpiZone.title}</div>
                                    <div className={`text-sm font-medium opacity-90 mt-1 ${kpiZone.color}`}>{kpiZone.desc}</div>
                                </div>
                                <div className={`text-6xl font-black ${kpiZone.color}`}>%{kpi}</div>
                            </div>
                        )}
                        
                        <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white relative overflow-hidden">
                            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 p-4 text-8xl opacity-5">🎯</div>
                            <h4 className="font-extrabold text-blue-400 mb-4 text-sm uppercase tracking-wider">Senin Dart Tahtan</h4>
                            
                            <div className="space-y-4">
                                <div className="border-l-2 border-blue-500 pl-3">
                                    <div className="text-[10px] text-blue-300 uppercase font-bold tracking-widest">Dış Halka (Vizyon)</div>
                                    <div className="text-sm font-medium mt-1">"{macro}"</div>
                                </div>
                                <div className="border-l-2 border-amber-500 pl-3">
                                    <div className="text-[10px] text-amber-300 uppercase font-bold tracking-widest">Orta Halka (Aylık)</div>
                                    <div className="text-sm font-medium mt-1">"{mezo}"</div>
                                </div>
                                <div className="border-l-4 border-rose-500 pl-3 bg-slate-800/50 py-2 rounded-r-lg">
                                    <div className="text-[10px] text-rose-400 uppercase font-bold tracking-widest">🎯 Tam Merkez (Bugün)</div>
                                    <div className="text-base font-bold mt-1 text-white">"{micro}"</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mt-4">
                            <h4 className="font-extrabold text-slate-800 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                🛡️ Güvenlik Protokolü (WOOP)
                            </h4>
                            <div className="bg-rose-50 p-3 rounded-lg mb-2 border border-rose-100">
                                <span className="text-[10px] font-bold text-rose-600 uppercase">Tehdit:</span>
                                <p className="text-sm text-rose-900 mt-1">"{obstacle}"</p>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Savunma (B Planı):</span>
                                <p className="text-sm text-emerald-900 font-bold mt-1">"{bPlan}"</p>
                            </div>
                        </div>
                    </div>
                );
            }

            // --- WD-3D (WALT DISNEY PLANLAMA) SONUÇ EKRANI ---
            else if (testData.id === 'wd-3d') {
                const dreamer = answers['wd_dreamer'] || 'Belirtilmedi';
                const realist = answers['wd_realist'] || 'Belirtilmedi';
                const critic = answers['wd_critic'] || 'Belirtilmedi';
                const decision = answers['wd_decision'] || 'Revize';

                const isApproved = decision === 'Onay';

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${isApproved ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'} text-center shadow-sm`}>
                            <div className="text-5xl mb-3">{isApproved ? '🎬' : '🔄'}</div>
                            <h3 className={`text-2xl font-black ${isApproved ? 'text-emerald-800' : 'text-blue-800'} mb-2`}>
                                {isApproved ? 'Motor! Plan Onaylandı' : 'Plan Revizyon Döngüsünde'}
                            </h3>
                            <p className={`${isApproved ? 'text-emerald-900' : 'text-blue-900'} font-medium leading-relaxed opacity-90 text-sm`}>
                                {isApproved 
                                    ? 'Harika! Hayalperest vizyonu çizdi, Gerçekçi adımları belirledi, Eleştirmen ise riskleri onayladı. Artık kusursuz bir yol haritan var, eyleme geçme vakti!' 
                                    : 'Eleştirmen bu planın zayıf yönlerini buldu. Bu harika bir şey! Plan iptal olmadı, sadece güçlenmesi için "Gerçekçi" masasına geri gönderildi. Koçunla bu riskleri çözerek planı güncelleyin.'}
                            </p>
                        </div>
                        
                        <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white relative overflow-hidden">
                            <h4 className="font-extrabold text-slate-100 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                🏰 Walt Disney Yönetim Kurulu Özeti
                            </h4>
                            
                            <div className="space-y-4 relative z-10">
                                <div className="border-l-2 border-fuchsia-500 pl-3">
                                    <div className="text-[10px] text-fuchsia-300 uppercase font-bold tracking-widest flex items-center gap-1"><span>💭</span> Hayalperestin Vizyonu</div>
                                    <div className="text-sm font-medium mt-1 text-slate-300 italic">"{dreamer}"</div>
                                </div>
                                <div className="border-l-2 border-amber-500 pl-3">
                                    <div className="text-[10px] text-amber-300 uppercase font-bold tracking-widest flex items-center gap-1"><span>📝</span> Gerçekçinin Planı</div>
                                    <div className="text-sm font-medium mt-1 text-slate-300">"{realist}"</div>
                                </div>
                                <div className="border-l-2 border-rose-500 pl-3 bg-slate-800/50 py-2 rounded-r-lg">
                                    <div className="text-[10px] text-rose-400 uppercase font-bold tracking-widest flex items-center gap-1"><span>🔍</span> Eleştirmenin Raporu</div>
                                    <div className="text-sm font-medium mt-1 text-slate-300">"{critic}"</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // --- T-LINE (ZAMAN ÇİZGİSİ) SONUÇ EKRANI ---
            else if (testData.id === 't-line') {
                const futureVision = answers['tl_future_vision'] || 'Belirtilmedi';
                const pastSuccess = answers['tl_past_success'] || 'Belirtilmedi';
                const presentAction = answers['tl_present_action'] || 'Belirtilmedi';
                const profileCheck = answers['tl_profile_check'] || 'Dengeli';

                let profileZone = {};

                if (profileCheck === 'GecmisOdakli') {
                    profileZone = { title: "GEÇMİŞ ODAKLI (Bataklık Riski)", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", desc: "Zihinsel enerjinin büyük kısmını geçmişteki hatalarına veya eksiklerine harcıyorsun. Geçmiş sadece ders almak içindir, yaşamak için değil. Geçmişindeki başarılarına odaklan." };
                } else if (profileCheck === 'GelecekOdakli') {
                    profileZone = { title: "GELECEK ODAKLI (Sisli Yol Riski)", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Gelecekle ilgili sürekli kaygı yaşıyorsun. Korku filmi izlemeyi bırakıp kendi hayatının belgeselini çekmeye başlamalısın. Gelecekteki vizyonunu netleştir." };
                } else if (profileCheck === 'SimdiOdakli') {
                    profileZone = { title: "ŞİMDİ ODAKLI (Kör Nokta Riski)", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "Anlık hedeflere ve keyiflere yöneliyor, uzun vadeli vizyonunu kaçırıyorsun. Hedeflerinin bedelini ve ödülünü bugüne taşıyarak motivasyonunu tazelemelisin." };
                } else {
                    profileZone = { title: "DENGELİ ZAMAN ALGISI", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Harika! Geçmişten güç alıyor, geleceğin ışığına doğru yürüyor ve bugünün eylemlerini kontrol edebiliyorsun. Bu zihinsel dengeyi koru." };
                }

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${profileZone.bg} ${profileZone.border} text-center shadow-sm`}>
                            <div className="text-4xl mb-3">⏳</div>
                            <div className={`text-xs font-bold uppercase tracking-widest opacity-70 mb-1`}>Zaman Algısı Profilin</div>
                            <h3 className={`text-xl font-black ${profileZone.color} mb-2`}>{profileZone.title}</h3>
                            <p className={`${profileZone.color} font-medium leading-relaxed opacity-90 text-sm`}>
                                {profileZone.desc}
                            </p>
                        </div>
                        
                        <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white relative overflow-hidden">
                            <h4 className="font-extrabold text-slate-100 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                🌲 Senin Zaman Ağacın
                            </h4>
                            
                            <div className="space-y-4 relative z-10">
                                <div className="border-l-2 border-emerald-500 pl-3">
                                    <div className="text-[10px] text-emerald-300 uppercase font-bold tracking-widest flex items-center gap-1"><span>🍎</span> Meyveler (Gelecek Vizyonun)</div>
                                    <div className="text-sm font-medium mt-1 text-slate-300 italic">"{futureVision}"</div>
                                </div>
                                <div className="border-l-2 border-amber-500 pl-3">
                                    <div className="text-[10px] text-amber-300 uppercase font-bold tracking-widest flex items-center gap-1"><span>🪵</span> Kökler (Geçmiş Gücün)</div>
                                    <div className="text-sm font-medium mt-1 text-slate-300">"{pastSuccess}"</div>
                                </div>
                                <div className="border-l-4 border-indigo-500 pl-3 bg-slate-800/50 py-2 rounded-r-lg">
                                    <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest flex items-center gap-1"><span>🌳</span> Gövde (Bugünkü Eylemin)</div>
                                    <div className="text-sm font-bold mt-1 text-white">"{presentAction}"</div>
                                </div>
                            </div>
                        </div>

                        {profileCheck !== 'Dengeli' && (
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4 text-sm">
                                <span className="font-bold text-slate-800 uppercase text-xs">💡 Koçluk Notu:</span>
                                <p className="text-slate-600 mt-2">
                                     Zihnin, o anki ihtiyacına göre zaman algını değiştirebilir. Ancak geçmişte kaybolmak veya gelecekte kaygılanmak bugünü kaçırmana neden olur. Kendi oluşturduğun vizyon ve eylem planına sadık kal.
                                </p>
                             </div>
                        )}
                    </div>
                );
            }

            // --- MPÇ (MERCEK) SONUÇ EKRANI ---
            else if (testData.id === 'mpc') {
                const problem = answers['mpc_problem'] || 'Belirtilmedi';
                const preScore = parseInt(answers['mpc_pre_score'] || 10);
                const postScore = parseInt(answers['mpc_post_score'] || 10);
                
                const dropAmount = preScore - postScore;
                const isSuccessful = dropAmount >= 3;

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${isSuccessful ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} text-center shadow-sm`}>
                            <div className="text-5xl mb-3">{isSuccessful ? '🧠' : '👁️'}</div>
                            <h3 className={`text-2xl font-black ${isSuccessful ? 'text-emerald-800' : 'text-amber-800'} mb-2`}>
                                {isSuccessful ? 'Bakış Açın Esnedi!' : 'Tünel Bakışı Devam Ediyor'}
                            </h3>
                            <p className={`${isSuccessful ? 'text-emerald-900' : 'text-amber-900'} font-medium leading-relaxed opacity-90 text-sm`}>
                                {isSuccessful 
                                    ? `Muazzam bir bilişsel esneklik gösterdin! Soruna farklı merceklerden bakmak, omuzlarındaki stres yükünü ${dropAmount} puan hafifletti. Sorunu değiştirmedin ama ona verdiğin tepkiyi değiştirdin.` 
                                    : `Stres puanında yeterli bir düşüş sağlanamadı (En az 3 puanlık bir düşüş bekliyorduk). Soruna çok yakından bakmaya ve duygusal olarak ona tutunmaya devam ediyorsun. Bu konuyu koçunla daha derinlemesine konuşmalısın.`}
                            </p>
                        </div>

                        <div className="flex justify-around items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">İlk Stres Yükü</div>
                                <div className="text-4xl font-black text-rose-500">{preScore}<span className="text-base opacity-50 text-slate-400">/10</span></div>
                            </div>
                            <div className="text-3xl text-slate-200">➡️</div>
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Son Stres Yükü</div>
                                <div className="text-4xl font-black text-emerald-500">{postScore}<span className="text-base opacity-50 text-slate-400">/10</span></div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white relative overflow-hidden mt-4">
                            <h4 className="font-extrabold text-blue-400 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                🔍 Zihinsel Optik Raporun
                            </h4>
                            <div className="space-y-4 relative z-10">
                                <div className="border-l-2 border-rose-500 pl-3">
                                    <div className="text-[10px] text-rose-300 uppercase font-bold tracking-widest">İncelenen Problem</div>
                                    <div className="text-sm font-medium mt-1 text-slate-300 italic">"{problem}"</div>
                                </div>
                                <div className="border-l-2 border-emerald-500 pl-3">
                                    <div className="text-[10px] text-emerald-300 uppercase font-bold tracking-widest">Fırsat (Gelecek) Çıktısı</div>
                                    <div className="text-sm font-bold mt-1 text-white">"{answers['mpc_filter'] || 'Belirtilmedi'}"</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // --- Ç-MOD (ÇİKOLATA MODELİ) SONUÇ EKRANI ---
            else if (testData.id === 'c-mod') {
                const incName = answers['cmod_inc1'] || 'Belirtilmedi';
                const incVal = answers['cmod_inc1_val'] || '0';
                const expName = answers['cmod_exp1'] || 'Belirtilmedi';
                const expVal = answers['cmod_exp1_val'] || '0';
                
                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-center shadow-sm">
                            <div className="text-5xl mb-3">🏦</div>
                            <h3 className="text-2xl font-black text-amber-800 mb-2">
                                Ödül Bankan Aktif Edildi!
                            </h3>
                            <p className="text-amber-900 font-medium leading-relaxed opacity-90 text-sm">
                                Harika bir anlaşma! Artık kendi iradeni kendin yönetiyorsun. Hazzı erteleyenler, geleceği yönetirler. Sistemine hoş geldin, Patron!
                            </p>
                        </div>
                        
                        <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white relative overflow-hidden">
                            <h4 className="font-extrabold text-amber-400 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                📜 FocusON Çikolata Borsası Fiyat Listesi
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="border border-emerald-500/30 bg-emerald-900/20 p-3 rounded-lg">
                                    <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest flex items-center gap-1 mb-2"><span>📈</span> Gelir Kapısı</div>
                                    <div className="text-sm font-medium text-slate-300">"{incName}"</div>
                                    <div className="mt-2 text-xl font-black text-emerald-400">+ {incVal} ÇP</div>
                                </div>
                                <div className="border border-rose-500/30 bg-rose-900/20 p-3 rounded-lg">
                                    <div className="text-[10px] text-rose-400 uppercase font-bold tracking-widest flex items-center gap-1 mb-2"><span>📉</span> Lüks Gideri</div>
                                    <div className="text-sm font-medium text-slate-300">"{expName}"</div>
                                    <div className="mt-2 text-xl font-black text-rose-400">- {expVal} ÇP</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4 text-sm">
                            <span className="font-bold text-slate-800 uppercase text-xs flex items-center gap-2 mb-2">⚠️ Kırmızı Çizgilerimiz</span>
                            <ul className="space-y-2 text-slate-600">
                                <li>• Bakiye sıfırsa veya yetersizse, o ödül <strong>ASLA</strong> alınamaz.</li>
                                <li>• "Yarın çalışıp öderim" diyerek eksiye düşmek (Kredi Çekmek) kesinlikle yasaktır. Önce hak edilecek.</li>
                                <li>• Eğer hile yaparsan, gerçek sınavda sahte paralar geçmez ve iflas edersin. Tek denetçi kendi vicdanındır.</li>
                            </ul>
                        </div>
                    </div>
                );
            }

            // --- K-E-A (KARTOPU ETKİSİ) SONUÇ EKRANI ---
            else if (testData.id === 'k-e-a') {
                const mat = answers['kea_mat'] || 'Sadece 1 soru çözmek';
                const par = answers['kea_par'] || 'Sadece 1 paragraf okumak';
                const vid = answers['kea_vid'] || 'Sadece ilk 2 dakikayı izlemek';

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 text-center shadow-sm">
                            <div className="text-5xl mb-3">⛄</div>
                            <h3 className="text-2xl font-black text-blue-800 mb-2">
                                Kartopu Yuvarlanmaya Başladı!
                            </h3>
                            <p className="text-blue-900 font-medium leading-relaxed opacity-90 text-sm">
                                Harika bir başlangıç! Artık hedeflerin beynini korkutamayacak kadar küçük. Amacımız soru çözmek değil, iradeni eğitmek ve eylemsizliği yenmek. 
                            </p>
                        </div>
                        
                        <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white relative overflow-hidden">
                            <h4 className="font-extrabold text-cyan-400 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                🎯 Senin Mikro Görevlerin
                            </h4>
                            <div className="space-y-3 relative z-10">
                                <div className="bg-slate-800/50 p-3 rounded-lg border-l-4 border-blue-500">
                                    <div className="text-[10px] text-blue-300 uppercase font-bold tracking-widest">Matematik</div>
                                    <div className="text-sm font-bold text-white mt-1">"{mat}"</div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg border-l-4 border-emerald-500">
                                    <div className="text-[10px] text-emerald-300 uppercase font-bold tracking-widest">Türkçe / Paragraf</div>
                                    <div className="text-sm font-bold text-white mt-1">"{par}"</div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg border-l-4 border-amber-500">
                                    <div className="text-[10px] text-amber-300 uppercase font-bold tracking-widest">Konu Çalışması</div>
                                    <div className="text-sm font-bold text-white mt-1">"{vid}"</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mt-4">
                            <h4 className="font-bold text-slate-800 uppercase text-xs flex items-center gap-2 mb-4">
                                🔗 Zinciri Kırma Puan Sistemi
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-sm font-semibold text-slate-600">1 Günlük Zincir</span>
                                    <span className="text-sm font-black text-indigo-600">+10 Puan</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-sm font-semibold text-slate-600">3 Günlük Zincir (Bonus)</span>
                                    <span className="text-sm font-black text-emerald-600">+50 Puan</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="text-sm font-semibold text-slate-600">7 Günlük Zincir (Haftanın Yıldızı)</span>
                                    <span className="text-sm font-black text-amber-500">+150 Puan</span>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-rose-50 rounded-lg text-rose-700 text-xs font-bold text-center border border-rose-100">
                                ⚠️ DİKKAT: Zincir koparsa puan sıfırlanır ve 1. günden başlanır!
                            </div>
                        </div>
                    </div>
                );
            }

            // --- İ-PKÖ (İLKÖĞRETİM ÇOKLU ZEKÂ) SONUÇ EKRANI ---
            else if (testData.id === 'i-pko') {
                const scores = {
                    'Sözel': parseInt(answers['ipko_soz_1']||0) + parseInt(answers['ipko_soz_2']||0) + parseInt(answers['ipko_soz_3']||0),
                    'Mantıksal': parseInt(answers['ipko_man_1']||0) + parseInt(answers['ipko_man_2']||0) + parseInt(answers['ipko_man_3']||0),
                    'Görsel': parseInt(answers['ipko_gor_1']||0) + parseInt(answers['ipko_gor_2']||0) + parseInt(answers['ipko_gor_3']||0),
                    'Bedensel': parseInt(answers['ipko_bed_1']||0) + parseInt(answers['ipko_bed_2']||0) + parseInt(answers['ipko_bed_3']||0),
                    'Müziksel': parseInt(answers['ipko_muz_1']||0) + parseInt(answers['ipko_muz_2']||0) + parseInt(answers['ipko_muz_3']||0),
                    'Sosyal': parseInt(answers['ipko_sos_1']||0) + parseInt(answers['ipko_sos_2']||0) + parseInt(answers['ipko_sos_3']||0),
                    'İçsel': parseInt(answers['ipko_ics_1']||0) + parseInt(answers['ipko_ics_2']||0) + parseInt(answers['ipko_ics_3']||0),
                    'Doğacı': parseInt(answers['ipko_dog_1']||0) + parseInt(answers['ipko_dog_2']||0) + parseInt(answers['ipko_dog_3']||0)
                };

                const profiles = {
                    'Sözel': { icon: '📚', tipsEv: 'Ona bol bol sesli kitap okutun. Kelime oyunları oynayın.', tipsDers: 'Konuları hikayeleştirerek çalışmalı.' },
                    'Mantıksal': { icon: '🔢', tipsEv: 'Mutfakta ölçüm yaptırın, bloklarla örüntü kurun.', tipsDers: 'Adım adım listeler yaparak öğrenmeli.' },
                    'Görsel': { icon: '🎨', tipsEv: 'Notlarını resimleyerek tutmasını isteyin.', tipsDers: 'Renkli kalemler ve zihin haritaları kullanmalı.' },
                    'Bedensel': { icon: '⚽', tipsEv: 'Çalışırken hareket etmesine (ayakta durma, yürüme) izin verin.', tipsDers: 'Sayı sayarken zıplamak gibi oyunlarla öğrenmeli.' },
                    'Müziksel': { icon: '🎵', tipsEv: 'Bilgileri tekerleme veya şarkı haline getirin.', tipsDers: 'Ritim tutarak veya arka planda müzikle çalışabilir.' },
                    'Sosyal': { icon: '👥', tipsEv: 'Arkadaşlarıyla birlikte ders çalışmasını teşvik edin.', tipsDers: 'Bir başkasına anlatarak (öğretmencilik oynayarak) öğrenmeli.' },
                    'İçsel': { icon: '🧘', tipsEv: 'Kendini ifade etmesi için ona bir günlük alın.', tipsDers: 'Sessiz ve kendi belirlediği bir köşede çalışmalı.' },
                    'Doğacı': { icon: '🌿', tipsEv: 'Bahçede veya balkonda bitki yetiştirmesini sağlayın.', tipsDers: 'Fen derslerini doğada gözlem yaparak çalışmalı.' }
                };

                let sortedAreas = Object.entries(scores).sort((a, b) => b[1] - a[1]);
                let topArea = sortedAreas[0];
                let topProfile = profiles[topArea[0]];

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 text-center shadow-sm">
                            <div className="text-5xl mb-3">{topProfile.icon}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Baskın Öğrenme Stili</div>
                            <h3 className="text-2xl font-black text-indigo-800 mb-2">{topArea[0]} Zekâ</h3>
                            <p className="text-indigo-900 font-medium leading-relaxed opacity-90 text-sm">
                                Çocuğunuz dünyayı daha çok bu pencereden algılıyor. Bu onun süper gücü. Zorlandığı dersleri bu dile çevirdiğinizde harikalar yaratacaktır.
                            </p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-extrabold text-slate-800 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                                💡 {topArea[0]} Zekâ İçin Taktikler
                            </h4>
                            <div className="space-y-3">
                                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Evde Ne Yapmalı? (Veliye)</span>
                                    <p className="text-sm text-amber-900 font-medium mt-1">{topProfile.tipsEv}</p>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Nasıl Çalışmalı? (Öğrenciye)</span>
                                    <p className="text-sm text-emerald-900 font-bold mt-1">{topProfile.tipsDers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                            {sortedAreas.map((area, idx) => (
                                <div key={area[0]} className={`p-2 rounded-xl border text-center ${idx === 0 ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100'}`}>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">{area[0]}</div>
                                    <div className={`text-lg font-black ${idx === 0 ? 'text-indigo-600' : 'text-slate-700'}`}>{area[1]}<span className="text-[10px] text-slate-400 font-normal">/9</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            // --- ADDE-20 (AİLE DESTEK ÖLÇEĞİ) SONUÇ EKRANI ---
            else if (testData.id === 'adde-20') {
                let scoreA = 0; // Duygusal
                let scoreB = 0; // Akademik
                
                Object.keys(answers).forEach(key => {
                    let val = parseInt(answers[key] || 0);
                    if (key.startsWith('adde_a')) scoreA += val;
                    if (key.startsWith('adde_b')) scoreB += val;
                });

                let profile = {};
                if (scoreA >= 40 && scoreB >= 40) {
                    profile = { title: "İDEAL DENGELİ DESTEK", icon: "🏰", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Harika! Evin senin için bir 'kale' gibi. Ailen hem fiziksel imkanlarını sağlıyor hem de seni koşulsuz destekliyor. Bu ortamda başarı kaçınılmazdır." };
                } else if (scoreA < 25 && scoreB >= 40) {
                    profile = { title: "PROJE ÇOCUK SENDROMU", icon: "📊", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Ailen sana her türlü maddi imkanı (kitap, oda, ders) sağlıyor ama duygusal bağ zayıf. Üzerinde 'Ya emeklerini boşa çıkarırsam' baskısı var. Bu durumu koçun ailenle diplomatik bir şekilde konuşacak." };
                } else if (scoreA >= 40 && scoreB < 25) {
                    profile = { title: "SEVGİ DOLU AMA YETERSİZ", icon: "❤️", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "Ailen seni çok seviyor ve değer veriyor ama evde akademik bir çalışma ortamı (sessizlik, planlama) kurmakta zorlanıyorsunuz. Koçunla evdeki fiziksel düzeni yeniden tasarlamalısınız." };
                } else if (scoreA < 25 && scoreB < 25) {
                    profile = { title: "KOPUK / İHMALKAR İLETİŞİM", icon: "🧊", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", desc: "Evde kendini yalnız veya baskı altında hissediyorsun. Hem fiziksel çalışma ortamı eksik hem de iletişim zayıf. Motivasyonunu dışarıdan değil, içinden (kendi hedeflerinden) almak zorundasın." };
                } else {
                    profile = { title: "GELİŞİME AÇIK DESTEK", icon: "⚖️", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", desc: "Ailen genel olarak yanında ama bazı noktalarda (iletişim veya çalışma ortamı) ince ayarlar yapılması gerekiyor. Koçun sana bu sınırları nasıl çizeceğini öğretecek." };
                }

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${profile.bg} ${profile.border} text-center shadow-sm`}>
                            <div className="text-5xl mb-3">{profile.icon}</div>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">AİLE ORTAMI PROFİLİ</div>
                            <h3 className={`text-2xl font-black ${profile.color} mb-2`}>{profile.title}</h3>
                            <p className={`${profile.color} font-medium leading-relaxed opacity-90 text-sm`}>
                                {profile.desc}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center items-center">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Duygusal Destek (Sevgi/Güven)</div>
                                <div className={`text-4xl font-black ${scoreA >= 40 ? 'text-emerald-500' : scoreA < 25 ? 'text-rose-500' : 'text-amber-500'}`}>{scoreA}<span className="text-lg opacity-50 text-slate-400">/50</span></div>
                                <div className="text-xs text-slate-500 mt-2 text-center">
                                    {scoreA >= 40 ? 'Seni koşulsuz seviyorlar.' : scoreA < 25 ? 'İletişim kopuklukları var.' : 'İletişim dalgalı.'}
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center items-center">
                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Akademik Destek (İmkan/Ortam)</div>
                                <div className={`text-4xl font-black ${scoreB >= 40 ? 'text-emerald-500' : scoreB < 25 ? 'text-rose-500' : 'text-amber-500'}`}>{scoreB}<span className="text-lg opacity-50 text-slate-400">/50</span></div>
                                <div className="text-xs text-slate-500 mt-2 text-center">
                                    {scoreB >= 40 ? 'Her türlü imkanı sağlıyorlar.' : scoreB < 25 ? 'Çalışma ortamı yetersiz.' : 'Ortam iyileştirilebilir.'}
                                </div>
                            </div>
                        </div>

                        {parseInt(answers['adde_a_6'] || 0) <= 2 && (
                            <div className="p-4 bg-slate-800 text-white rounded-xl text-sm font-medium mt-4">
                                🛡️ <strong>Kalkan Protokolü:</strong> Başkalarıyla kıyaslandığını hissediyorsun. Ailen kıyaslama yaptığında öfkelenmek yerine, <em>"Herkesin yolu farklı, ben kendi hedefime odaklıyım"</em> cümlesini sakin bir şekilde kurarak kendi sınırını çizmeyi unutma. [cite: 3195-3197]
                            </div>
                        )}
                    </div>
                );
            }

            // --- GTS-36 (TERCİH SİMÜLASYONU) SONUÇ EKRANI ---
            else if (testData.id === 'gts-36') {
                const target = answers['gts_target'] || 'Belirtilmedi';
                const quality = answers['gts_quality'] || 'B';
                const veto = answers['gts_veto'] || 'Destek';
                
                const interest = parseInt(answers['gts_interest'] || 0);
                const talent = parseInt(answers['gts_talent'] || 0);
                const value = parseInt(answers['gts_value'] || 0);
                const market = parseInt(answers['gts_market'] || 0);
                
                const average = (interest + talent + value + market) / 4;
                const isApproved = average >= 7;

                content = (
                    <div className="space-y-6 mb-8 text-left">
                        <div className={`p-6 rounded-2xl border ${isApproved ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'} text-center shadow-sm`}>
                            <div className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Hedef: {target}</div>
                            <div className={`text-6xl font-black ${isApproved ? 'text-emerald-600' : 'text-rose-600'} mb-3`}>{average.toFixed(1)}<span className="text-2xl opacity-50">/10</span></div>
                            <div className={`text-xl font-extrabold ${isApproved ? 'text-emerald-700' : 'text-rose-700'} mb-2`}>
                                {isApproved ? '✅ Güçlü Eşleşme (Onaylandı)' : '🚨 Ölü Tercih Riski!'}
                            </div>
                            <p className={`${isApproved ? 'text-emerald-900' : 'text-rose-900'} font-medium leading-relaxed opacity-90 text-sm`}>
                                {isApproved 
                                    ? `Harika bir seçim! İlgi alanın, yeteneğin ve piyasa gerçekleri bu meslekle örtüşüyor. Bu bölüm kesinlikle tercih listende baş köşede olmalı.` 
                                    : `Dikkat! Ortalaman 7'nin altında kaldı. Puanın bu bölüme yetse bile, okurken veya mezun olduğunda mutsuz olma ihtimalin çok yüksek. Bu bölümü listene almadan önce koçunla tekrar düşün.`}
                            </p>
                        </div>
                        
                        <div className="bg-slate-900 p-5 rounded-xl shadow-sm text-white relative overflow-hidden">
                            <h4 className="font-extrabold text-amber-400 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                📊 FocusON Akordeon Stratejisi
                            </h4>
                            <p className="text-slate-300 text-xs mb-4">Tercih listen 24 haktan oluşur. Açıkta kalmamak için listeni şu matematiksel kurala göre dizeceğiz:</p>
                            
                            <div className="space-y-3 relative z-10">
                                <div className="border-l-2 border-fuchsia-500 pl-3">
                                    <div className="text-[10px] text-fuchsia-300 uppercase font-bold tracking-widest flex items-center gap-1">✈️ 1. Bölge: Uçuş Hattı (%10)</div>
                                    <div className="text-xs font-medium mt-1 text-slate-300">"Puanım yetmez ama ya gelirse?" dediğimiz hayal bölgesidir. Listenin en başına yazılır.</div>
                                </div>
                                <div className="border-l-4 border-emerald-500 pl-3 bg-slate-800/50 py-2 rounded-r-lg">
                                    <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest flex items-center gap-1">🎯 2. Bölge: Gerçekçi Hat (%50)</div>
                                    <div className="text-xs font-bold mt-1 text-white">Senin asıl yerleşeceğin, kendi sıralamana denk düşen bölgedir. En çok tercih buraya girilir.</div>
                                </div>
                                <div className="border-l-2 border-amber-500 pl-3">
                                    <div className="text-[10px] text-amber-300 uppercase font-bold tracking-widest flex items-center gap-1">🛡️ 3. Bölge: Güvenlik Hattı (%40)</div>
                                    <div className="text-xs font-medium mt-1 text-slate-300">Sıralamanın çok altındaki, "Kesin gelir" dediğimiz sigorta bölgesidir. Kazandığında üzülmeyeceksen yazılır. [cite: 3288-3299]</div>
                                </div>
                            </div>
                        </div>

                        {veto !== 'Destek' && (
                            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium mt-4">
                                ⚠️ <strong>Aile Konseyi Uyarısı:</strong> Ailenle bu hedef konusunda çatışma (maddi veya mesleki) yaşıyorsun. Koçun, aile ile "arabuluculuk" yaparak, senin potansiyelini onlara diplomatik bir dille anlatacaktır. [cite: 3300-3304]
                            </div>
                        )}
                        
                        <div className="mt-6 text-center text-xs text-slate-400 italic">
                            "Üniversite bir amaç değil, sadece bir araçtır. Asıl başarı diplomanın üzerinde yazan değil, o diplomayı tutan elin ne kadar yetenekli olduğudur." [cite: 3308]
                        </div>
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

                        {/* LİKERT 3'LÜ EMOJİ (İ-PKÖ İÇİN) */}
                        {currentQ.type === 'likert_3' && (
                            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                {['1: ☹️ Hiç Uygun Değil', '2: 😐 Biraz Uygun', '3: 🙂 Tam Anlatıyor'].map((opt, i) => {
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
