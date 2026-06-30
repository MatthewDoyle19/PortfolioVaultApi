// --- 1. عداد الضغطات ---
let systemClickCount = 0;
let clickTimer;

// --- 2. ننتظر حتى يكتمل تحميل الـ HTML بالكامل ---
document.addEventListener('DOMContentLoaded', () => {
    const systemBadge = document.getElementById('system-badge');

    // إذا وجد الزر، نبدأ الاستماع للضغطات
    if (systemBadge) {
        systemBadge.addEventListener('click', () => {
            systemClickCount++;
            clearTimeout(clickTimer);

            // إذا لم يضغط مجدداً خلال ثانيتين، يصفر العداد
            clickTimer = setTimeout(() => { systemClickCount = 0; }, 2000);

            // إذا وصلت الضغطات إلى 3، نشغل المفاجأة!
            if (systemClickCount === 3) {
                systemClickCount = 0;
                trigger100DaysSurprise();
            }
        });
    } else {
        console.error("System badge button not found in HTML!"); // رسالة مساعدة لك في الـ Console
    }
});

// --- 3. دالة المفاجأة (الكود الذي وافقت عليه) ---
const trigger100DaysSurprise = () => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[999999] bg-[#050508] flex flex-col items-center justify-center p-6 opacity-0 transition-opacity duration-[2000ms] ease-in-out';

    overlay.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-tr from-rose-950/20 via-transparent to-indigo-950/20 opacity-70 pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-rose-500/5 blur-[120px] rounded-full animate-pulse" style="animation-duration: 4s;"></div>
        
        <div class="w-full max-w-lg text-center relative z-10 flex flex-col items-center">
            <div class="text-5xl md:text-6xl mb-8 select-none opacity-0 transition-all duration-[1500ms] transform translate-y-4 filter drop-shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse" id="egg-icon" style="animation-duration: 3s;">
                ♾️
            </div>
            
            <div dir="rtl" id="typewriter-text" class="text-xl md:text-2xl text-slate-100 font-poetic text-right md:text-center leading-[2.3] tracking-wide min-h-[200px] px-4 md:px-8 drop-shadow-md select-none">
            </div>
            
            <button id="close-egg-btn" class="mt-12 opacity-0 scale-95 transition-all duration-1000 bg-white/5 border border-white/10 text-slate-400 hover:text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white/10 active:scale-95 shadow-lg backdrop-blur-md">
                Continue Our Journey
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        setTimeout(() => {
            document.getElementById('egg-icon').classList.remove('opacity-0', 'translate-y-4');
            startTypewriter();
        }, 1500);
    }, 100);

    const fullText = "في غيابكِ تعلّمتُ كيف أنتظر، وفي وجودكِ تعلّمتُ كيف أطمئن..\n\n١٠٠ يوم مَضت، لم تكن مجرد أرقامٍ تتراكم في صفحات هذا العالم، بل كانت عُمراً حقيقياً بدأ بالتشكّل منذ اللحظة الأولى التي عبرتِ فيها إلى تفاصيلي.\n\nكنتِ دائمًا الهدوء الذي يُضيء عتمتي، والنقاء الذي أستندُ إليه وسط زحام الحياة وفوضاها. واليوم، وبعد مئة ليلة شهدت على صدق ما بيننا، أقولها لكِ بملء قلبي، وثبات روحي، وبأعمق ما يمكن للكلمة أن تحمل من معنى:\n\nأنا بحبّكِ.. فوق ما تتخيلين، وأكثر مما يتسع له الوقت ❤️.";

    let index = 0;
    const startTypewriter = () => {
        const textContainer = document.getElementById('typewriter-text');

        function type() {
            if (index < fullText.length) {
                const char = fullText.charAt(index);
                if (char === '\n') {
                    textContainer.innerHTML += '<br>';
                } else {
                    textContainer.innerHTML += char;
                }
                index++;
                setTimeout(type, 65);
            } else {
                const closeBtn = document.getElementById('close-egg-btn');
                closeBtn.classList.remove('opacity-0', 'scale-95');
                closeBtn.onclick = () => {
                    overlay.classList.add('opacity-0');
                    setTimeout(() => overlay.remove(), 2000);
                };
            }
        }
        type();
    };
};