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

const trigger100DaysSurprise = () => {
    // 1. إضافة ستايلات الحركة (Animations) مؤقتاً للشاشة السرية
    const styleBlock = document.createElement('style');
    styleBlock.innerHTML = `
        @keyframes breatheAura {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes floatUp {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            20% { opacity: 0.6; }
            80% { opacity: 0.6; }
            100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        @keyframes levitate {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
        }
    `;
    document.head.appendChild(styleBlock);

    // 2. إنشاء حاوية الشاشة الكاملة
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[999999] flex flex-col items-center justify-center p-6 opacity-0 transition-opacity duration-[2000ms] ease-in-out overflow-hidden';

    // 3. بناء البيئة الحية (السديم والمحتوى)
    overlay.innerHTML = `
        <div class="absolute inset-0 bg-[linear-gradient(45deg,#050508,#1a0b16,#0d0b1a,#050508)] bg-[length:400%_400%] opacity-95" style="animation: breatheAura 15s ease infinite;"></div>
        
        <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style="animation-duration: 8s;"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style="animation-duration: 10s;"></div>

        <div id="fireflies-container" class="absolute inset-0 pointer-events-none"></div>
        
        <div class="w-full max-w-lg text-center relative z-10 flex flex-col items-center" style="animation: levitate 8s ease-in-out infinite;">
            <div class="text-5xl md:text-6xl mb-8 select-none opacity-0 transition-all duration-[1500ms] transform translate-y-4 filter drop-shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse" id="egg-icon" style="animation-duration: 3s;">
                ♾️
            </div>
            
            <div dir="rtl" id="typewriter-text" class="text-xl md:text-2xl text-slate-100 font-poetic text-right md:text-center leading-[2.3] tracking-wide min-h-[200px] px-4 md:px-8 drop-shadow-lg select-none">
            </div>
            
            <button id="close-egg-btn" class="mt-12 opacity-0 scale-95 transition-all duration-1000 bg-white/5 border border-white/10 text-slate-400 hover:text-white px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white/10 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-xl">
                Continue Our Journey
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // 4. توليد اليراعات المضيئة (Fireflies)
    const firefliesContainer = document.getElementById('fireflies-container');
    for (let i = 0; i < 40; i++) {
        const firefly = document.createElement('div');
        const size = Math.random() * 3 + 1; // حجم الجزيء
        firefly.className = 'absolute rounded-full bg-rose-200/80';
        firefly.style.width = `${size}px`;
        firefly.style.height = `${size}px`;
        firefly.style.left = `${Math.random() * 100}%`;
        firefly.style.bottom = '-20px';
        firefly.style.boxShadow = '0 0 10px rgba(244, 63, 94, 0.6), 0 0 20px rgba(244, 63, 94, 0.4)';
        // سرعات وتأخيرات عشوائية لكل يراعة
        firefly.style.animation = `floatUp ${Math.random() * 8 + 7}s linear ${Math.random() * 5}s infinite`;
        firefliesContainer.appendChild(firefly);
    }

    // 5. تفعيل الظهور وبدء الكتابة
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
                    setTimeout(() => {
                        overlay.remove();
                        styleBlock.remove(); // تنظيف الستايلات بعد الإغلاق
                    }, 2000);
                };
            }
        }
        type();
    };
};