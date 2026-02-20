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

// --- ANA TEST MOTORU ---
const FocusON_Engine = () => {
    const testData = window.CURRENT_TEST_DATA;
    
    // SİHİRLİ DOKUNUŞ: Her testin başına otomatik olarak Öğrenci No sorusunu ekliyoruz
    // (Eğer daha önce eklenmemişse)
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
    const [isSubmitting, setIsSubmitting] = React.useState(false); // Gönderim durumu
    const [submitStatus, setSubmitStatus] = React.useState(null); // Başarılı/Hatalı

    const totalQuestions = testData.questions.length;
    const currentQ = testData.questions[step];

    // --- SUPABASE GÖNDERİM FONKSİYONU ---
    const submitToSupabase = async (finalAnswers) => {
        setIsSubmitting(true);
        
        // 1. Öğrenci ID'sini cevaplardan ayır (Çünkü o ayrı bir sütuna gidecek)
        const studentId = finalAnswers['student_id'];
        const testAnswers = { ...finalAnswers };
        delete testAnswers['student_id'];

        // 2. Supabase Kimlik Bilgileri
        const SUPABASE_URL = "https://hlegbaflvfdpmcodfuew.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZWdiYWZsdmZkcG1jb2RmdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzIyNjAsImV4cCI6MjA4MzQwODI2MH0.siothqmKdww-IfMS4jLXMKswyvASUkBVWnhLwWDC8mg";

        // 3. Veriyi Gönder
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/test_results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
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
            
            // Eğer son soruya gelindiyse veriyi yolla
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
            // Başarılıysa ÖTİ-A skorunu göster
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
            } else {
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
                        {(currentQ.type === 'text' || currentQ.type === 'number') && (
                            <input type={currentQ.type} autoFocus value={answers[currentQ.id] || ''} onChange={(e) => handleAnswer(e.target.value)} placeholder={currentQ.placeholder} className="w-full text-2xl md:text-3xl text-indigo-900 placeholder-slate-300 bg-transparent border-b-2 border-slate-200 focus:border-indigo-600 outline-none pb-4 transition-colors" />
                        )}

                        {currentQ.type === 'textarea' && (
                            <textarea autoFocus value={answers[currentQ.id] || ''} onChange={(e) => handleAnswer(e.target.value)} placeholder={currentQ.placeholder} className="w-full h-32 text-xl md:text-2xl text-indigo-900 placeholder-slate-300 bg-transparent border-b-2 border-slate-200 focus:border-indigo-600 outline-none pb-4 transition-colors resize-none"></textarea>
                        )}

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

                        {currentQ.type === 'scale10' && (
                            <div className="flex flex-wrap gap-2">
                                {[1,2,3,4,5,6,7,8,9,10].map(val => (
                                    <button key={val} onClick={() => { handleAnswer(val); setTimeout(nextStep, 400); }} className={`w-12 h-14 md:w-14 md:h-16 rounded-xl border-2 font-bold text-lg transition-all transform hover:-translate-y-1 ${answers[currentQ.id] === val ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>{val}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-12 flex items-center gap-4">
                        <button onClick={nextStep} disabled={!answers[currentQ.id]} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all flex items-center gap-2">
                            İleri <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<FocusON_Engine />);
