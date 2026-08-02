// ==========================================
// 🚀 V2.0.0 EASTER EGG & SECRET DOOR MODULE
// ==========================================

/* ==========================================
   📦 THE TIME CAPSULE (LEGACY CODE - DO NOT UNCOMMENT)
   هذا هو الكود التاريخي الذي تم استخدامه ليلة 23/6/2026 لتفجير المفاجأة.
   متروك هنا للذكرى والتوثيق، لكي لا ننسى كيف تمت هندسة اللحظة.
   ==========================================
    const checkMilestone = () => {
        const targetDate = new Date('2026-06-23T00:00:00+03:00').getTime();
        const now = new Date().getTime();
        const distance = targetDate - now; 
        const triggerNow = () => {
            if (localStorage.getItem('v2_unlocked') !== 'true') {
                const loginCheckInterval = setInterval(() => {
                    const loginScreen = document.getElementById('login-screen');
                    if (loginScreen && loginScreen.classList.contains('hidden')) {
                        clearInterval(loginCheckInterval);
                        setTimeout(() => { openEasterEgg(); }, 3000);
                    }
                }, 500);
            }
        };
        if (distance <= 0) { triggerNow(); } 
        else { setTimeout(() => { triggerNow(); }, distance); }
    };
    checkMilestone();

    if (v2PromptForm) {
        v2PromptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = v2PromptForm.querySelector('button');
            const answerInput = document.getElementById('v2-answer').value;
            const questionText = "لو رجعنا بالزمن ليوم 25/3...";
            
            btn.disabled = true;
            btn.innerHTML = 'Encrypting & Saving to Vault... ⏳';

            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await fetch(`${API_BASE_URL}/api/commits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date().toISOString().split('T')[0],
                        message: `[V2.0.0 SYSTEM UPGRADE UNLOCKED] ✨\n\n💭 السؤال:\n"${questionText}"\n\n❤️ إجابة زوزو:\n"${answerInput}"`,
                        imageUrl: null, audioUrl: null
                    })
                });
                localStorage.setItem('v2_unlocked', 'true');
                btn.innerHTML = 'System Upgraded & Saved ✨';
                setTimeout(() => {
                    // Animation logic...
                }, 2500);
            } catch (error) { console.error("Failed to execute V2 save:", error); }
        });
    }
========================================== */

export const initV2EasterEgg = () => {
    // 1. الحقن التلقائي للـ HTML إذا لم يكن موجوداً
    if (!document.getElementById('easter-egg-overlay')) {
        const easterEggHtml = `
        <div id="easter-egg-overlay" class="hidden fixed inset-0 z-[9999] transition-opacity duration-[2000ms] opacity-0 v2-light-theme">
            <audio id="easter-egg-audio" loop preload="auto">
                <source src="https://res.cloudinary.com/dhr6waydw/video/upload/v1781875866/f96i0jknmbw9bx1cgpnw.mp3" type="audio/mpeg">
            </audio>

            <div class="absolute inset-0 living-bg backdrop-blur-2xl"></div>

            <div class="absolute inset-0 overflow-y-auto overflow-x-hidden z-10" style="-webkit-overflow-scrolling: touch;">
                <div class="flex min-h-full items-start justify-center p-4 py-16 md:py-24">

                    <div id="easter-egg-content" class="breathing-card relative max-w-2xl w-full bg-white/75 p-6 md:p-10 rounded-[2.5rem] border-2 shadow-[0_20px_60px_rgba(244,114,182,0.15)] backdrop-blur-xl transition-all duration-[2000ms]">

                        <h1 class="smooth-reveal text-xl md:text-3xl font-extrabold mb-8 tracking-wide text-center drop-shadow-sm" style="animation-delay: 1s;">
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
                                CRITICAL SYSTEM UPDATE:<br>VERSION 2.0.0 UNLOCKED
                            </span>
                            <svg class="inline-block w-6 h-6 md:w-8 md:h-8 text-pink-400 animate-pulse align-text-top ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" />
                            </svg>
                        </h1>

                        <div class="space-y-6">
                            <div class="smooth-reveal bg-emerald-50/60 p-5 md:p-6 rounded-2xl border border-emerald-100 shadow-sm" dir="rtl" style="animation-delay: 2s;">
                                <h2 class="text-base md:text-lg font-extrabold text-emerald-600 mb-4 flex items-center gap-2">
                                    <span class="animate-pulse">🛠️</span> Core Logic Update (تحديث الهيكلة الأساسية)
                                </h2>
                                <ul class="list-none ml-0 mr-2 text-slate-700 space-y-3 text-sm md:text-base leading-relaxed font-medium">
                                    <li class="relative pr-6">
                                        <span class="absolute right-0 top-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                                        <strong class="text-emerald-700">تحديث لوجيك (التفكير العاطفي):</strong>تم مسح الشيفرة القديمة التي كانت ترفض فكرة "الحديث مع البنات" بالكامل. النظام تلقى تحديثاً جذرياً بعد دخول (زينب)، ليتقبل الفكرة ويتمحور حولها وحدهـا؛ لأنها الأولى والوحيدة التي طابقت مواصفاتها شروط النظام العالي (واعية، خلوقة، فاهمة، طموحة، وتصنع مستقبلياً مميزاً).
                                    </li>
                                </ul>
                            </div>

                            <div class="smooth-reveal bg-pink-50/60 p-5 md:p-6 rounded-2xl border border-pink-100 shadow-sm" dir="rtl" style="animation-delay: 4s;">
                                <h2 class="text-base md:text-lg font-extrabold text-pink-600 mb-4 flex items-center gap-2">
                                    <span class="animate-pulse">❤️</span> The Safe Haven (مساحة الأمان المطلق)
                                </h2>
                                <ul class="list-none ml-0 mr-2 text-slate-700 space-y-4 text-sm md:text-base leading-relaxed font-medium">
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 5.5s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">كسر الفلاتر والتواصل العميق:</strong> مكالماتنا اللي بتوصل لـ 5 ساعات بدون ما نحس بالوقت، ومشاركتنا لأبسط التفاصيل اليومية بعفوية تامة.
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 7s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">التناغم في اللعب والمرح (Co-op Mode):</strong> مشاركتنا لحظات اللعب والضحك، وإثبات إننا فريق بيعرف كيف يخلق جو من المرح.
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 8.5s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">بيئة التطوير والدعم (The Shared Grind):</strong> كيف صرنا الداعم الأول لبعض في أوقات الضغط، ومشاريع البرمجة، وكيف كل إنجاز شخصي صار إنجاز مشترك.
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 10s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">بناء رؤية مشتركة وواعية:</strong> الانتقال من مجرد تواصل يومي لشراكة حقيقية؛ بنبني فيها علاقة صحية.
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 11.5s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">توثيق لغة الحب:</strong> من الذكريات الموجودة بالـ Vault، لعداد منسف وصل لـ 9، لطلب "كاسة الشاي من إيدي"، وتخطيطنا الدقيق لكل مكان بالـ Bucket List.
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 13s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">شفرة المصدر (The Source Code):</strong> كل سطر برمجي كُتب، وكل مشكلة (Bug) تم حلها في الكواليس، كانت مدفوعة بطاقة وإلهام منكِ.
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 14.5s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">عقلية النمو (Growing Together):</strong> نقاشاتنا العميقة وتفكيرنا في بناء عقلية ناجحة لمستقبلنا.
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 16s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">طاقة الالتزام (The Daily Routine):</strong> التزامنا بمشاركة روتيننا وتطوير أنفسنا صار لغة الحب اللي بتخلينا أقوى كل يوم.
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 17.5s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">الاستثمار المتبادل (Building Habits):</strong> كيف بنعكس الأفكار اللي بنتعلمها سوا من الكتب على علاقتنا.
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 19s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">سهر المبرمجين (Late Night Commits):</strong> الدافع الأساسي ساعات البرمجة الطويلة هو إني أطلع بنتيجة تليق بـ "زوزو".
                                    </li>
                                    <li class="smooth-reveal relative pr-6 border-r-2 border-pink-200" style="animation-delay: 20.5s;">
                                        <span class="absolute -right-[5px] top-2 w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
                                        <strong class="text-pink-700">شغف المستقبل (The Drive):</strong> سوالفنا عن تفاصيل الحياة اللي بنطمح لها بتعطينا حافز نشتغل أضعاف.
                                    </li>
                                </ul>
                            </div>

                            <div class="smooth-reveal bg-emerald-50/60 p-5 md:p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden" dir="rtl" style="animation-delay: 23s;">
                                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

                                <h2 class="text-base md:text-lg font-extrabold text-emerald-600 mb-4 flex items-center gap-2">
                                    <span class="animate-pulse">🔒</span> Memory Locked & Saved
                                </h2>

                                <p class="text-slate-600 text-sm mb-4 font-bold border-r-4 border-emerald-300 pr-3 bg-white/50 py-2 px-2 rounded-l-lg">
                                    "لو رجعنا بالزمن ليوم 25/3، يوم أن حُذفت كل الحواجز وبدأنا نصبح مقربين.. شو الكلام اللي كنتِ رح تحكيه لمحمد لو كنتِ بتعرفي إننا رح نوصل لهون؟"
                                </p>

                                <div class="w-full bg-white border border-emerald-200 rounded-xl px-5 py-4 shadow-inner mb-4 relative">
                                    <span class="absolute -top-3 left-4 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border border-emerald-200">ZoZo's Answer</span>
                                    <p class="text-emerald-900 font-poetic text-base md:text-lg leading-relaxed mt-2 whitespace-pre-wrap">
                                        لي ما أجيت مِن قبل؟
                                    </p>
                                </div>

                                <button id="proceed-to-gallery-btn" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(16,185,129,0.3)] tracking-wide flex justify-center items-center gap-2">
                                    <span>View The Secret Gallery</span>
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            </div>
                        </div>

                        <button id="close-easter-egg" class="smooth-reveal mt-8 text-slate-400 text-xs hover:text-slate-600 transition-colors underline underline-offset-4 mx-auto block uppercase tracking-widest font-bold" style="animation-delay: 24s;">Close System Logs</button>
                    </div>

                    <div id="easter-egg-gallery" class="hidden flex-col items-center max-w-5xl w-full mx-auto transition-all duration-[2000ms] opacity-0 translate-y-10 z-20 pb-10">
                        <h2 class="text-2xl md:text-3xl font-extrabold mb-10 tracking-wide text-center drop-shadow-sm">
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">The Safe Haven Archives</span> 📸
                        </h2>

                        <div class="flex flex-wrap justify-center items-center gap-4 md:gap-8 px-2 pb-10 w-full">
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1780872255/dxk4zngocczfmf2kdusx.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1780558370/rqxy8biji5zguoosncfl.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1782063654/xz3jgrjbda4xtxadmpzw.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1779225679/a5rbpql5v2ktwzmshoab.png" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1781951578/ea2f0rpfz0xbtxyc5qhm.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1782021039/mkz83cvgkcywjps7zuax.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1782021039/lxjjzwuqr6hlddvh582x.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1781952100/d7fi9ggnq2lewme1qxrx.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1781954933/hx87y28lyyzomd7o1u4t.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1782055097/wodi6xtwcw6tlyp7orhn.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1780899845/m67j4lug5tw1s8m0lk7g.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1777449817/ubfuwi1ztl7ivmouu0hm.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1782021039/jmuno5jlq9vqpcpxgbwm.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1781960313/asyo4ncudofoja60kw2j.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1781960314/iv4obkq9dxcega1f7gff.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1781967446/tfeuxqqmvnxxmlldokfd.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1782117256/qzctfkjnm0vga4igriae.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                            <div class="polaroid w-[140px] md:w-[210px] shrink-0"><div class="w-full rounded overflow-hidden"><img src="https://res.cloudinary.com/dhr6waydw/image/upload/v1782117020/ueuey87lajaessppnlx4.jpg" alt="Memory" class="w-full h-auto object-contain"></div></div>
                        </div>

                        <button id="close-gallery-btn" class="text-slate-400 text-xs hover:text-slate-600 transition-colors underline underline-offset-4 mx-auto block uppercase tracking-widest font-bold mt-4">Close System Logs</button>
                    </div>

                </div>
            </div>

            <div class="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
                <div class="particle text-2xl drop-shadow-md" style="left: 10%; animation-delay: 0s; animation-duration: 12s;">✨</div>
                <div class="particle text-3xl drop-shadow-md" style="left: 25%; animation-delay: 4s; animation-duration: 15s;">✨</div>
                <div class="particle text-xl drop-shadow-md" style="left: 40%; animation-delay: 2s; animation-duration: 10s;">✨</div>
                <div class="particle text-2xl drop-shadow-md" style="left: 60%; animation-delay: 6s; animation-duration: 14s;">✨</div>
                <div class="particle text-3xl drop-shadow-md" style="left: 75%; animation-delay: 1s; animation-duration: 13s;">✨</div>
                <div class="particle text-xl drop-shadow-md" style="left: 90%; animation-delay: 5s; animation-duration: 11s;">✨</div>
                <div class="particle text-2xl drop-shadow-md" style="left: 55%; animation-delay: 8.5s; animation-duration: 12.5s;">✨</div>

                <div class="particle text-xl drop-shadow-md" style="left: 15%; animation-delay: 3s; animation-duration: 14s;">🤍</div>
                <div class="particle text-2xl drop-shadow-md" style="left: 35%; animation-delay: 7s; animation-duration: 12s;">🤍</div>
                <div class="particle text-xl drop-shadow-md" style="left: 50%; animation-delay: 1s; animation-duration: 15s;">🤍</div>
                <div class="particle text-xl drop-shadow-md" style="left: 70%; animation-delay: 8s; animation-duration: 11s;">🤍</div>
                <div class="particle text-2xl drop-shadow-md" style="left: 85%; animation-delay: 4s; animation-duration: 13s;">🤍</div>
                <div class="particle text-xl drop-shadow-md" style="left: 5%; animation-delay: 9s; animation-duration: 16s;">🤍</div>
                <div class="particle text-3xl drop-shadow-md" style="left: 95%; animation-delay: 2s; animation-duration: 14s;">🤍</div>
                <div class="particle text-2xl drop-shadow-md" style="left: 45%; animation-delay: 10s; animation-duration: 13.5s;">🤍</div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', easterEggHtml);
    }

    // 2. منطق التشغيل وإدارة الـ Event Listeners
    const openEasterEgg = () => {
        const overlay = document.getElementById('easter-egg-overlay');
        const audio = document.getElementById('easter-egg-audio');
        const textContent = document.getElementById('easter-egg-content');
        const gallery = document.getElementById('easter-egg-gallery');

        if (overlay) {
            if (textContent) textContent.classList.remove('hidden', 'opacity-0', 'scale-95');
            if (gallery) gallery.classList.add('hidden', 'opacity-0', 'translate-y-10');

            overlay.classList.remove('hidden');
            if (audio) {
                audio.volume = 0.5;
                audio.play().catch(e => console.log("Audio play blocked", e));
            }
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
            }, 50);
        }
    };

    const closeFunctions = () => {
        const overlay = document.getElementById('easter-egg-overlay');
        const audio = document.getElementById('easter-egg-audio');

        if (overlay) overlay.classList.add('opacity-0');
        if (audio) {
            let vol = audio.volume;
            let fadeOut = setInterval(() => {
                if (vol > 0.05) {
                    vol -= 0.05;
                    audio.volume = vol;
                } else {
                    clearInterval(fadeOut);
                    audio.pause();
                    audio.currentTime = 0;
                }
            }, 100);
        }
        setTimeout(() => { if (overlay) overlay.classList.add('hidden'); }, 1000);
    };

    let easterEggClickCount = 0;
    let easterEggTimeout;

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('#version-trigger');
        if (trigger) {
            easterEggClickCount++;
            clearTimeout(easterEggTimeout);

            if (easterEggClickCount >= 3) {
                easterEggClickCount = 0;
                openEasterEgg();
            } else {
                easterEggTimeout = setTimeout(() => {
                    easterEggClickCount = 0;
                }, 800);
            }
            return;
        }

        if (e.target.id === 'close-easter-egg' || e.target.id === 'close-gallery-btn') {
            closeFunctions();
            return;
        }

        const proceedBtn = e.target.closest('#proceed-to-gallery-btn');
        if (proceedBtn) {
            const textContent = document.getElementById('easter-egg-content');
            const gallery = document.getElementById('easter-egg-gallery');

            if (textContent) textContent.classList.add('opacity-0', 'scale-95');

            setTimeout(() => {
                if (textContent) textContent.classList.add('hidden');
                if (gallery) {
                    const scrollContainer = gallery.closest('.overflow-y-auto');
                    if (scrollContainer) scrollContainer.scrollTop = 0;

                    gallery.classList.remove('hidden');

                    document.querySelectorAll('.polaroid').forEach((p, index) => {
                        p.style.animationDelay = `${index * 0.4}s`;
                        p.addEventListener('animationend', () => {
                            p.style.animation = 'none';
                            p.style.opacity = '1';
                            p.style.transform = 'rotate(var(--rot))';
                        }, { once: true });
                    });

                    setTimeout(() => gallery.classList.remove('opacity-0', 'translate-y-10'), 50);
                }
            }, 800);
            return;
        }
    });
};