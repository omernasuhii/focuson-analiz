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

// --- DOPA CANLI OYUN BİLEŞENİ ---
const DopaGame = ({ onComplete }) => {
    const [gameState, setGameState] = React.useState('start'); // start, playing, end
    const [timeLeft, setTimeLeft] = React.useState(45);
    const [grid, setGrid] = React.useState([]);
    const [stats, setStats] = React.useState({ correct: 0, wrong: 0 });

    const targets = ['a', 'b', 'd', 'g'];
    const distractors = ['p', 'q', 'c', 'e', 'o', 'h', 'm', 'n', 'u', 'y', 'z', 'l', 'k', 't', 'f', 'r', 's', 'v'];

    const initGame = () => {
        let newGrid = [];
        for(let i=0; i<84; i++) { // 7x12 ızgara
            const isTarget = Math.random() < 0.20; // %20 ihtimalle hedef harf
            const charSet = isTarget ? targets : distractors;
            const char = charSet[Math.floor(Math.random() * charSet.length)];
            newGrid.push({ id: i, char, isTarget, status: 'idle' }); 
        }
        setGrid(newGrid);
        setStats({ correct: 0, wrong: 0 });
        setTimeLeft(45);
        setGameState('playing');
    };

    React.useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (gameState === 'playing' && timeLeft === 0) {
            endGame();
        }
        return () => clearTimeout(timer);
    }, [gameState, timeLeft]);

    const endGame = () => {
        setGameState('end');
        let missed = 0;
        grid.forEach(item => {
            if (item.isTarget && item.status === 'idle') missed++;
        });
        
        const finalSpeed = stats.correct; 
        const finalErrors = stats.wrong + missed; // Yanlış tıklamalar + gözden kaçanlar
        
        // 3 saniye sonra otomatik diğer soruya geç
        setTimeout(() => onComplete(finalSpeed, finalErrors), 3000);
    };

    const handleLetterClick = (index) => {
        if (gameState !== 'playing') return;
        let newGrid = [...grid];
        let item = newGrid[index];
        if (item.status !== 'idle') return; 

        if (item.isTarget) {
            item.status = 'correct';
            setStats(s => ({ ...s, correct: s.correct + 1 }));
        } else {
            item.status = 'wrong';
            setStats(s => ({ ...s, wrong: s.wrong + 1 }));
        }
        setGrid(newGrid);
    };

    if (gameState === 'start') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
                <div className="text-6xl mb-4">⏱️</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Süren: 45 Saniye</h3>
                <p className="text-slate-500 mb-8">Ekranda belirecek harfler arasından sadece <strong>A, B, D</strong> ve <strong>G</strong> harflerini bulup tıkla. Yanlış harfe tıklamak hata sayılır.</p>
                <button onClick={initGame} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-xl text-lg transition-transform transform hover:scale-105 shadow-lg shadow-indigo-200">
                    Süreyi Başlat
                </button>
            </div>
        );
    }

    if (gameState === 'end') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-emerald-200 shadow-sm text-center animate-fade-in">
                <div className="text-6xl mb-4">🏁</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Süre Doldu!</h3>
                <p className="text-slate-500 mb-4">Sonuçların kaydedildi, testin 2. aşamasına geçiliyor...</p>
                <div className="flex gap-4 font-mono">
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold">Doğru: {stats.correct}</div>
                    <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded-lg font-bold">Hatalı Tık: {stats.wrong}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <div className="flex justify-between w-full mb-6 px-4">
                <div className="text-xl font-bold text-slate-700">Hedef: A, B, D, G</div>
                <div className={`text-2xl font-mono font-bold ${timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`}>
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
            </div>
            
            <div className="grid grid-cols-7 sm:grid-cols-12 gap-2 sm:gap-3">
                {grid.map((item, idx) => {
                    let btnClass = "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-mono font-bold rounded-lg cursor-pointer transition-colors shadow-sm ";
                    if (item.status === 'idle') btnClass += "bg-white text-slate-700 hover:bg-indigo-100 border border-slate-200";
                    else if (item.status === 'correct') btnClass += "bg-emerald-500 text-white border-emerald-600";
                    else if (item.status === 'wrong') btnClass += "bg-rose-500 text-white border-rose-600";
                    
                    return (
                        <button key={item.id} onClick={() => handleLetterClick(idx)} className={btnClass}>
                            {item.char}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


// --- ANA TEST MOTORU ---
const FocusON_Engine = () => {
    const testData = window.CURRENT_TEST_DATA;
    
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

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (animating || step === totalQuestions) return;
            if (step === -1 && e.key === 'Enter') return nextStep();
            if (step >= 0 && step < totalQuestions) {
                // Eğer oyundaysak klavyeyi devre dışı bırak, fare ile oynamalı
                if (currentQ.type === 'dopa_game') return;

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
            
            // --- ÖTİ-A SONUCU ---
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
            // --- VAK SONUCU ---
            else if (testData.id === 'vak') {
                let counts = { G: 0, I: 0, K: 0 };
                Object.keys(answers).forEach(key => { if (key.startsWith('v') && counts[answers[key]] !== undefined) counts[answers[key]]++; });
                let maxStyle = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                let strategies = {
                    G: { title: "GÖRSEL ÖĞRENCİ", icon: "👁️", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "Dünyayı gözlerinle algılıyorsun.", tips: ["Renkli kodlama yap.", "Zihin Haritası kullan."] },
                    I: { title: "İŞİTSEL ÖĞRENCİ", icon: "👂", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Dünyayı kulaklarınla algılıyorsun.", tips: ["Sesini kaydet.", "Birine sesli anlat."] },
                    K: { title: "KİNESTETİK ÖĞRENCİ", icon: "🏃", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Dünyayı bedeninle algılıyorsun.", tips: ["Odayı turlayarak çalış.", "Sadece okuma; yaz, çiz."] }
                };
                let resultZone = strategies[maxStyle];
                content = (
                    <div className={`p-6 rounded-2xl border ${resultZone.bg} ${resultZone.border} mb-8 text-left`}>
                        <div className="flex items-center gap-3 mb-4 justify-center">
                            <span className="text-4xl">{resultZone.icon}</span>
                            <h3 className={`text-2xl font-extrabold ${resultZone.color}`}>{resultZone.title}</h3>
                        </div>
                        <p className="text-slate-600 font-medium mb-4 text-center">{resultZone.desc}</p>
                        <ul className="space-y-2 mb-4 bg-white p-4 rounded-xl">
                            {resultZone.tips.map((tip, idx) => <li key={idx} className="text-sm text-slate-700">• {tip}</li>)}
                        </ul>
                    </div>
                );
            }
            // --- KOLB SONUCU ---
            else if (testData.id === 'kolb') {
                let counts = { SY: 0, YG: 0, SK: 0, AY: 0 };
                Object.keys(answers).forEach(key => { if (key.startsWith('k') && counts[answers[key]] !== undefined) counts[answers[key]]++; });
                const algilama = counts.SK - counts.SY; 
                const isleme = counts.AY - counts.YG;   
                let profile = {};
                if(algilama >= 0 && isleme >= 0) profile = { title: "AYRIŞTIRAN (Mühendis)", icon: "⚙️", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
                else if(algilama >= 0 && isleme < 0) profile = { title: "ÖZÜMSEYEN (Teorisyen)", icon: "📚", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
                else if(algilama < 0 && isleme >= 0) profile = { title: "YERLEŞTİREN (Girişken)", icon: "🚀", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
                else profile = { title: "DEĞİŞTİREN (Yansıtan)", icon: "💡", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" };

                content = (
                    <div className={`p-6 rounded-2xl border ${profile.bg} ${profile.border} mb-8 text-center`}>
                        <span className="text-4xl block mb-2">{profile.icon}</span>
                        <h3 className={`text-2xl font-extrabold ${profile.color} mb-2`}>{profile.title}</h3>
                        <p className="text-slate-600 text-sm">Kolb öğrenme stiline göre stratejin koçun tarafından belirlenecektir.</p>
                    </div>
                );
            }
            // --- ÇZ-8 SONUCU ---
            else if (testData.id === 'cz-8') {
                let scores = {
                    'Sözel': parseInt(answers['cz1']||0) + parseInt(answers['cz2']||0) + parseInt(answers['cz3']||0),
                    'Mantıksal': parseInt(answers['cz4']||0) + parseInt(answers['cz5']||0) + parseInt(answers['cz6']||0),
                    'Görsel': parseInt(answers['cz7']||0) + parseInt(answers['cz8']||0) + parseInt(answers['cz9']||0),
                    'Müziksel': parseInt(answers['cz10']||0) + parseInt(answers['cz11']||0) + parseInt(answers['cz12']||0),
                    'Bedensel': parseInt(answers['cz13']||0) + parseInt(answers['cz14']||0) + parseInt(answers['cz15']||0),
                    'Sosyal': parseInt(answers['cz16']||0) + parseInt(answers['cz17']||0) + parseInt(answers['cz18']||0),
                    'İçsel': parseInt(answers['cz19']||0) + parseInt(answers['cz20']||0) + parseInt(answers['cz21']||0),
                    'Doğacı': parseInt(answers['cz22']||0) + parseInt(answers['cz23']||0) + parseInt(answers['cz24']||0)
                };
                let sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
                content = (
                    <div className="p-6 rounded-2xl border bg-indigo-50 border-indigo-200 mb-8 text-center">
                        <h3 className="text-2xl font-extrabold text-indigo-600 mb-2">BASKIN: {sorted[0][0].toUpperCase()} ZEKÂ</h3>
                        <p className="text-slate-600 font-medium">İkinci güçlü alanın: {sorted[1][0]} Zekâ</p>
                    </div>
                );
            }
            // --- DOPA SONUCU ---
            else if (testData.id === 'dopa') {
                let dopaSelf = 0;
                Object.keys(answers).forEach(key => {
                    if (key.startsWith('dopa_s')) dopaSelf += parseInt(answers[key] || 0);
                });
                
                const perfSpeed = parseInt(answers['dopa_speed']) || 0; // Doğru tık sayısı
                const perfErr = parseInt(answers['dopa_error']) || 0;   // Hatalı tık + Gözden kaçanlar
                
                let profile = {};
                
                // 45 saniyede ortalama 15 hedef beklenir.
                if (perfErr > 8) {
                    profile = { title: "TAVŞAN PROFİLİ", icon: "🐇", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", desc: "Sabırsızsın. Çok hızlısın ama çok fazla hata yapıyorsun veya gözden kaçırıyorsun." };
                } else if (perfSpeed < 10) {
                    profile = { title: "KAPLUMBAĞA PROFİLİ", icon: "🐢", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Mükemmeliyetçi ve garantici ilerliyorsun. Hata oranın az ama işlem hızın yavaş." };
                } else {
                    profile = { title: "DENGELİ PROFİL", icon: "⚖️", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Dikkat ve hız dengen bu testte çok başarılı sonuç verdi." };
                }

                content = (
                    <div className={`p-6 rounded-2xl border ${profile.bg} ${profile.border} mb-8 text-center`}>
                        <div className="text-4xl mb-2">{profile.icon}</div>
                        <h3 className={`text-2xl font-extrabold ${profile.color} mb-2`}>{profile.title}</h3>
                        <p className="text-slate-600 font-medium mb-6">{profile.desc}</p>
                        
                        <div className="flex justify-around text-sm font-bold text-slate-700 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="text-center text-slate-400 text-xs tracking-widest">DOĞRU<br/><span className="text-emerald-600 text-2xl">{perfSpeed}</span></div>
                            <div className="text-center text-slate-400 text-xs tracking-widest">HATA<br/><span className="text-rose-600 text-2xl">{perfErr}</span></div>
                            <div className="text-center text-slate-400 text-xs tracking-widest">ÖZ-ALGI<br/><span className="text-indigo-600 text-2xl">{dopaSelf}</span>/30</div>
                        </div>
                    </div>
                );
            }
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
                        
                        {/* YENİ EKLENEN: DOPA OYUN MODÜLÜ */}
                        {currentQ.type === 'dopa_game' && (
                            <DopaGame onComplete={(speed, errors) => {
                                handleAnswer('dopa_speed', speed);
                                handleAnswer('dopa_error', errors);
                                handleAnswer(currentQ.id, 'completed'); // Bu ekranın bittiğini işaretle
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

                    </div>

                    {currentQ.type !== 'dopa_game' && (
                        <div className="mt-12 flex items-center gap-4">
                            <button onClick={nextStep} disabled={!answers[currentQ.id]} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all flex items-center gap-2">
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
