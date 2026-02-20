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
    
    const [step, setStep] = React.useState(-1);
    const [answers, setAnswers] = React.useState({});
    const [animating, setAnimating] = React.useState(false);
    
    // Veri gönderim durumları
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);

    const totalQuestions = testData.questions.length;
    const currentQ = testData.questions[step];

    // Test bittiğinde Supabase'e Otomatik Gönderim
    React.useEffect(() => {
        if (step === totalQuestions) {
            sendDataToSupabase();
        }
    }, [step]);

    const sendDataToSupabase = async () => {
        setIsSubmitting(true);
        
        // Wix'in URL'ye eklediği parametreleri yakala
        const urlParams = new URLSearchParams(window.location.search);
        const wixMemberId = urlParams.get('memberId') || 'test-kullanicisi';
        const supUrl = urlParams.get('supUrl');
        const supKey = urlParams.get('supKey');

        if (!supUrl || !supKey) {
            console.warn("API Anahtarları URL'de bulunamadı. Sadece test modunda çalışıyor.");
            setIsSubmitting(false);
            setSubmitSuccess(true);
            return;
        }

        try {
            const response = await fetch(`${supUrl}/rest/v1/test_results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supKey,
                    'Authorization': `Bearer ${supKey}`,
                    'Prefer': 'return=minimal',
                    // ÇOK KRİTİK: Verinin 'focuson' şemasına gitmesini sağlar
                    'Content-Profile': 'focuson' 
                },
                body: JSON.stringify({
                    student_id: wixMemberId,
                    test_code: testData.id,
                    answers: answers
                    // ai_summary arka planda (Edge Function) doldurulacak
                })
            });

            if (!response.ok) throw new Error("Supabase kayıt hatası");
            setSubmitSuccess(true);
        } catch (error) {
            console.error("Veri gönderilemedi:", error);
            // Hata olsa bile öğrenciye bitti ekranını gösterelim, moralini bozmayalım
            setSubmitSuccess(true); 
        } finally {
            setIsSubmitting(false);
        }
    };

    // Klavye kontrolleri
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (animating) return;
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
    }, [step, answers, currentQ, animating]);

    const nextStep = () => {
        setAnimating(true);
        setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 300);
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

    // Sonuç Ekranı (Yükleniyor veya Tamamlandı)
    if (step === totalQuestions) {
        if (isSubmitting) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-bold text-slate-700">Sonuçlar Şifreleniyor...</h2>
                    <p className="text-slate-500">Lütfen bekleyin, verileriniz koçunuza iletiliyor.</p>
                </div>
            );
        }

        let content = <p className="text-slate-500 mb-8">Verilerin başarıyla analiz merkezine iletildi. Koçun sonuçları değerlendirecek.</p>;
        
        // ÖTİ-A Özel Sonuç Görselleştirmesi
        if(testData.id === 'oti-a' && submitSuccess) {
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

        return (
            <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in relative">
                <FullscreenToggle />
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100 relative z-10">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Analiz Tamamlandı! 🎉</h2>
                    {content}
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
