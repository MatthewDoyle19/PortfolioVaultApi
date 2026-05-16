document.addEventListener('DOMContentLoaded', () => {

    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const authKey = document.getElementById('auth-key');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('error-msg');

    const API_BASE_URL = ''; // السيرفر نفسه هو الذي يستضيف الملفات

    // --- 1. نظام الدخول ---
    const handleLogin = async () => {
        const key = authKey.value;
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: key })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                loginScreen.classList.add('fade-out');
                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    dashboard.style.display = 'block';
                    dashboard.classList.add('fade-in');
                    window.scrollTo(0, 0);
                }, 500);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            errorMsg.style.opacity = '1';
            authKey.value = '';
            authKey.focus();
            setTimeout(() => errorMsg.style.opacity = '0', 2000);
        }
    };

    loginBtn.addEventListener('click', handleLogin);
    authKey.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });

    // --- 2. عداد الوقت ---
    const uptimeDisplay = document.getElementById('uptime-counter');
    const startDate = new Date('2026-03-25T00:00:00');

    const updateUptime = () => {
        const now = new Date();
        const diff = now - startDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        uptimeDisplay.textContent = `${days} Days, ${hours} Hrs, ${minutes} Min`;
    };
    updateUptime();
    setInterval(updateUptime, 60000);

    // --- 3. إدارة الروابط ---
    const fetchLinks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/links`);
            const links = await response.json();
            renderLinks(links);
        } catch (error) { console.error(error); }
    };

    const renderLinks = (links) => {
        const linkGrid = document.getElementById('link-grid');
        linkGrid.innerHTML = '';
        links.forEach((link) => {
            const card = document.createElement('div');
            card.className = 'flex items-center justify-between bg-dark p-3 rounded-xl border border-slate-700 hover:border-accent hover:bg-slate-800 transition-all group';
            card.innerHTML = `
                <a href="${link.url}" target="_blank" class="flex items-center gap-3 flex-grow overflow-hidden">
                    <div class="bg-card p-2 rounded-lg text-accent group-hover:text-white transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </div>
                    <span class="text-sm font-medium text-slate-300 group-hover:text-white truncate pr-2">${link.title}</span>
                </a>
                <button onclick="deleteLink(${link.id})" class="text-slate-500 hover:text-red-400 p-2 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;
            linkGrid.appendChild(card);
        });
    };

    document.getElementById('add-link-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE_URL}/api/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: document.getElementById('link-title').value, url: document.getElementById('link-url').value })
        });
        e.target.reset();
        fetchLinks();
    });

    window.deleteLink = async (id) => {
        await fetch(`${API_BASE_URL}/api/links/${id}`, { method: 'DELETE' });
        fetchLinks();
    };

    // --- 4. ذكريات الخط الزمني ---
    const fetchCommits = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/commits`);
            const commits = await response.json();
            if (document.getElementById('commit-count')) document.getElementById('commit-count').innerText = commits.length;
            renderCommits(commits);
        } catch (error) { console.error(error); }
    };

    const renderCommits = (commits) => {
        const commitTimeline = document.getElementById('commit-timeline');
        if (!commitTimeline) return;
        commitTimeline.innerHTML = '';
        commits.forEach((commit) => {
            const item = document.createElement('div');
            item.className = 'polaroid-card group fade-in';
            const dateObj = new Date(commit.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            item.innerHTML = `
                <div class="flex justify-between items-start mb-4 mt-1">
                    <span class="text-[10px] text-accent font-extrabold tracking-widest uppercase bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20 shadow-inner shadow-accent/10">${formattedDate}</span>
                    <button onclick="deleteCommit(${commit.id})" class="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 active:scale-90">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <p class="text-sm text-slate-200 mb-2 font-medium leading-relaxed tracking-wide">${commit.message}</p>
                ${commit.imageUrl ? `<img src="${commit.imageUrl}" alt="Memory" class="polaroid-image">` : ''}
                ${commit.audioUrl ? `<audio controls src="${commit.audioUrl}"></audio>` : ''}
            `;
            commitTimeline.appendChild(item);
        });
    };

    // --- Media & Cloudinary ---
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhr6waydw/auto/upload';
    const CLOUDINARY_UPLOAD_PRESET = 'i7dhiwzb';

    let audioBlob = null;
    let mediaRecorder = null;
    let audioChunks = [];

    const recordBtn = document.getElementById('record-btn');
    recordBtn.addEventListener('click', async () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                audioChunks = [];
                mediaRecorder.addEventListener("dataavailable", e => audioChunks.push(e.data));
                mediaRecorder.addEventListener("stop", () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/mp4' });
                    recordBtn.innerHTML = '✅ Saved';
                    const preview = document.createElement('audio');
                    preview.controls = true;
                    preview.src = URL.createObjectURL(audioBlob);
                    preview.className = 'w-full mt-4 mb-2 filter drop-shadow-lg';
                    const commitForm = document.getElementById('add-commit-form');
                    commitForm.insertBefore(preview, commitForm.querySelector('button[type="submit"]'));
                });
                recordBtn.innerHTML = '🛑 Stop';
                document.getElementById('record-status').classList.remove('hidden');
            } catch (err) { alert("Mic access required."); }
        } else {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(t => t.stop());
            document.getElementById('record-status').classList.add('hidden');
        }
    });

    document.getElementById('add-commit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = 'Encrypting & Storing... ⏳';
        submitBtn.disabled = true;

        try {
            let finalImageUrl = null, finalAudioUrl = null;
            if (document.getElementById('commit-image').files[0]) {
                const fd = new FormData();
                fd.append('file', document.getElementById('commit-image').files[0]);
                fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
                const data = await res.json();
                finalImageUrl = data.secure_url;
            }
            if (audioBlob) {
                const fd = new FormData();
                fd.append('file', audioBlob, 'voice.mp4');
                fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: fd });
                const data = await res.json();
                finalAudioUrl = data.secure_url;
            }
            await fetch(`${API_BASE_URL}/api/commits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: document.getElementById('commit-date').value,
                    message: document.getElementById('commit-message').value,
                    imageUrl: finalImageUrl,
                    audioUrl: finalAudioUrl
                })
            });
            e.target.reset();
            audioBlob = null;
            recordBtn.innerHTML = '🎤 Record';
            fetchCommits();
        } catch (error) { console.error(error); }
        finally { submitBtn.innerHTML = 'Store Memory'; submitBtn.disabled = false; }
    });

    window.deleteCommit = async (id) => {
        if(confirm('Delete memory?')) {
            await fetch(`${API_BASE_URL}/api/commits/${id}`, { method: 'DELETE' });
            fetchCommits();
        }
    };

    // --- ⚖️ نظام محكمة القلوب المطور v2.0 (أحكام المسافات واللقاء الأول) ---
    // --- ⚖️ نظام محكمة القلوب v6.0 (مستوى الوحش - Hardcore Edition) ---
    // --- ⚖️ موسوعة محكمة القلوب vMax (الترسانة الشاملة والأسئلة العميقة) ---
    const penaltyVault = {
        Mohammad: [
            // 💀 عقابات بدنية قاسية (Physical)
            { title: "انهيار العضلات 💥", desc: "قم بعمل تمرين الضغط (Push-ups) حتى الانهيار التام (Failure). صوّر آخر 15 ثانية وأنت ترتجف وأرسلها." },
            { title: "جحيم البلانك 🔥", desc: "ثبات في وضعية البلانك لمدة دقيقتين كاملتين. إذا سقطت قبل الوقت، تعيد من الصفر." },
            { title: "دش الجليد 🥶", desc: "استحم بماء بارد جداً (أبرد درجة) لمدة 3 دقائق. أرسل بصمة صوتية فور خروجك لتثبت التنفيذ." },
            { title: "حرمان الدوبامين 📵", desc: "امسح أكثر تطبيق تضيع وقتك عليه (تيك توك، إنستغرام، أو لعبة) لمدة 48 ساعة وأرسل إثبات الحذف." },
            { title: "الجدار القاسي 🧱", desc: "تمرين الجلوس على الجدار (Wall Sit) لمدة دقيقة ونصف وأنت تحمل شيئاً ثقيلاً. صوّر العداد." },
            // 💻 المبرمج والمهندس
            { title: "المبرمج تحت الضغط ⏱️", desc: "افتح الـ IDE، وقم ببرمجة آلة حاسبة بسيطة أو خوارزمية ترتيب (Sorting) خلال 10 دقائق فقط وصوّر الشاشة فيديو." },
            { title: "كود الاعتراف ⌨️", desc: "اكتب Script بسيط يطبع لزينب رسالة تشرح فيها لماذا هي مختلفة عن البقية، وشغله أمامها فيديو." },
            { title: "تحليل الأخطاء 🐛", desc: "ما هو أكبر خطأ ارتكبته في علاقتكما حتى الآن؟ اشرحه كأنه 'Bug' في كود، وكيف ستقوم بعمل 'Patch' له." },
            { title: "مراجعة النظام 📊", desc: "أرسل سكرين شوت مفصلة لـ (Screen Time) الخاص بهاتفك. لا مجال لإخفاء أي تطبيق." },
            // 🕵️‍♂️ استجواب ومكاشفة (Vulnerability)
            { title: "استجواب: الخوف المدفون 🌑", desc: "ما هو أسوأ سيناريو تخاف أن يحدث عندما تلتقيان لأول مرة في الأردن؟ كن صريحاً جداً." },
            { title: "استجواب: عقدة النقص 🧩", desc: "ما هي الصفة في شخصيتك أو شكلك التي تشعر بعدم الأمان (Insecurity) تجاهها، وتخاف أن تلاحظها زينب؟" },
            { title: "استجواب: الحقيقة المرة 💊", desc: "اذكر موقفاً تصرفت فيه بـ 'أنانية' أو 'غرور' مع زينب وندمت عليه لاحقاً لكنك لم تعتذر." },
            { title: "استجواب: اختبار الرجولة 🛡️", desc: "متى كانت آخر مرة شعرت فيها بالضعف الشديد أو البكاء، ولماذا؟ (الرجال الأقوياء فقط يعترفون بضعفهم)." },
            { title: "استجواب: الـ Red Flag 🚩", desc: "بصراحة تامة، ما هو العيب الذي فيك وتعرف أنه قد يدمر علاقتكما إذا لم تصلحه؟" },
            // 🃏 مواقف وتضحيات (Acts of Service)
            { title: "رجل المهام 💼", desc: "اسأل زينب عن أكثر مهمة تكرهها اليوم (بحث، تلخيص، تجميع معلومات) وقم بإنجازها لها فوراً." },
            { title: "دفع الفاتورة 💳", desc: "قم بطلب قهوة أو وجبة خفيفة لزينب عبر تطبيق توصيل (عن بعد) كعربون محبة وإرضاء للمحكمة." },
            { title: "اعتذار علني 📢", desc: "ضع حالة (Status/Story) لمدة ساعة واحدة فقط تكتب فيها جملة تختارها زينب." },
            { title: "جولة حية 🚶‍♂️", desc: "افتح مكالمة فيديو، واخرج من غرفتك، وخذ زينب في جولة حية في شوارع إربد أو حول منزلك لترى واقعك." },
            { title: "مهمة الانضباط 🧹", desc: "غرفتك أو مكتبك.. قم بتنظيفه وترتيبه كأنه ثكنة عسكرية الآن، وأرسل صورة قبل وبعد." },
            { title: "تسجيل صوتي محرج 🎤", desc: "سجل رسالة صوتية وأنت تغني بصوت عالٍ أغنية تختارها زينب، بدون أي تعديل أو فلاتر." },
            { title: "التخلي عن السيطرة 🎮", desc: "أعطِ زينب الحق في اختيار ملابسك بالكامل في أول مرة تخرج فيها من المنزل." },
            { title: "وعد الشرف 📜", desc: "اكتب على ورقة عهداً تلتزم فيه بتغيير طبع سيء فيك، وقع عليها وصورها." },
            { title: "تحدي الهدوء 🤫", desc: "ممنوع أن تتذمر أو تعترض على أي شيء تقوله زينب لمدة 24 ساعة. 'حاضر' فقط." },
            { title: "رسالة للأب/الأم ✉️", desc: "ارسل لزينب سكرين شوت لآخر محادثة بينك وبين والدك أو والدتك." },
            { title: "السند الحقيقي 🤝", desc: "سجل بصمة صوتية تخبرها فيها كيف ستتصرف لو اتصلت بك تبكي في الثالثة فجراً." }
        ],
        Zainab: [
            // 📸 خروج من منطقة الراحة (Comfort Zone)
            { title: "سيلفي الصدمة 📸", desc: "أرسلي صورة سيلفي الآن.. بدون مكياج، بدون فلاتر، وبدون تجهيز مسبق. (تحدي الثقة المطلقة)." },
            { title: "صوت بلا تنميق 🎤", desc: "سجلي رسالة صوتية وأنتِ تصرخين بجملة يختارها محمد، لتكسري حاجز الخجل." },
            { title: "معرض الصور 📱", desc: "افتحي مشاركة الشاشة (Screen Share) ودعي محمد يختار 3 صور عشوائية من معرض صورك ليراها." },
            { title: "تحدي الاستيقاظ 🌅", desc: "اضبطي منبهك غداً لتستيقظي مع محمد في نفس الوقت، وأرسلي رسالة صوتية تثبت ذلك." },
            { title: "الملابس المقلوبة 👕", desc: "ارتدي قطعة ملابس (جاكيت/قميص) بالمقلوب لمدة ساعة، وأرسلي صورة لمحمد." },
            // 🧠 اختبارات الذاكرة والاهتمام
            { title: "اختبار الذاكرة 🕰️", desc: "ما هو بالضبط التاريخ الذي بدأتم فيه التحدث بجدية؟ وماذا كان موضوع النقاش؟" },
            { title: "خريطة إربد 🗺️", desc: "اذكري 3 مناطق أو شوارع في إربد أخبرك عنها محمد، وماذا يوجد فيها؟" },
            { title: "اختبار التفاصيل 🔍", desc: "ما هو أكثر شيء يزعج محمد في يومه؟ وما هي أكلته المفضلة؟" },
            { title: "أرشيف المحادثات 📂", desc: "ابحثي في محادثتكم عن كلمة 'آسف' أو 'آسفة'.. من قالها أكثر؟ صوري الشاشة." },
            { title: "محاكاة محمد 🤖", desc: "قلدي طريقة محمد في الكلام والعصبية في رسالة صوتية مدتها دقيقة." },
            // 🕵️‍♀️ استجواب ومكاشفة (Vulnerability)
            { title: "استجواب: الشك القاتل 🌑", desc: "ما هو الموقف أو الكلمة التي جعلتكِ تشكين في مشاعر محمد أو جديته، ولو للحظة؟" },
            { title: "استجواب: الخط الأحمر 🚫", desc: "ما هو الشيء الذي إذا فعله محمد ستنهين العلاقة فوراً وبدون نقاش؟" },
            { title: "استجواب: الغيرة المكتومة 🔥", desc: "متى كانت أكثر مرة شعرتِ فيها بالغيرة الشديدة ولكنكِ تظاهرتِ بعدم الاهتمام؟" },
            { title: "استجواب: عيب لا يُحتمل 🧩", desc: "ما هو الطبع في شخصية محمد الذي يرفع ضغطك وتحاولين التأقلم معه بصعوبة؟" },
            { title: "استجواب: السر المدفون 🤫", desc: "أخبري محمد سراً صغيراً عن نفسك لم تخبريه به من قبل لخوفك من حكمه عليك." },
            // 🃏 مواقف عاطفية وتحضير للقاء
            { title: "الاعتراف الصامت 📝", desc: "اكتبي جملة واحدة تعبر عن شعورك الحقيقي تجاهه، وصوريها." },
            { title: "تحدي اللهجة 🇯🇴", desc: "سجلي رسالة صوتية تحاولين فيها التحدث بلهجة محمد (الأردنية/الإربداوية) لمدة دقيقة." },
            { title: "أمنية المطار ✈️", desc: "ما هو أول شيء تريدين أن تسمعيه منه عندما تتقاطع أعينكما لأول مرة في الأردن؟" },
            { title: "رسالة الخمس دقائق 🎙️", desc: "تحدثي لمدة 5 دقائق متواصلة في بصمة صوتية عن توقعاتك لمستقبلكما معاً، دون توقف." },
            { title: "صورة من الماضي 👶", desc: "أرسلي أكثر صورة محرجة أو مضحكة لكِ في مرحلة الطفولة." },
            { title: "تحدي الطبخ 🥘", desc: "اشرحي لمحمد وصفة فلسطينية بالتفصيل، واعديه بأن تطبخيها له عند اللقاء." },
            { title: "هدية المستقبل 🎁", desc: "حددي لمحمد شيئاً بسيطاً (غير مكلف) تريدين منه أن يحضره لك في أول لقاء." },
            { title: "صوت الجليل 🎶", desc: "سجلي بصمة وأنتِ تدندنين أغنية تذكرك به." },
            { title: "دخول عالمه 💻", desc: "اسأليه سؤالاً تقنياً عن برمجته اليوم واجعله يشرحه لك، واستمعي باهتمام." },
            { title: "رسالة اعتذار 📜", desc: "اعتذري عن أكثر مرة كنتِ فيها 'عنيدة' ولم تستمعي لنصيحته." }
        ],
        Shared: [
            // 💀 تحديات قاسية وملزمة للطرفين معاً
            { title: "تفتيش الكاميرا 🔍", desc: "على كلاكما إرسال سكرين شوت لآخر 5 صور في الـ (Camera Roll) فوراً.. يمنع الحذف!" },
            { title: "كشف البحث 🕵️‍♂️", desc: "على كلاكما تصوير سجل البحث (Search History) في يوتيوب أو جوجل الآن وإرساله." },
            { title: "لعبة التحديق القاتلة 👀", desc: "افتحا كاميرا الفيديو.. 3 دقائق من التحديق المتواصل بصمت. أول من يضحك أو يرمش ينفذ حكماً فردياً قاسياً." },
            { title: "تبادل التطبيقات المزعجة 🗑️", desc: "كل شخص يختار تطبيقاً من هاتف الآخر، وعلى الآخر مسحه لمدة 24 ساعة." },
            { title: "صمت الحواس 📵", desc: "ممنوع استخدام الرسائل النصية لمدة ساعتين. التواصل بالبصمات الصوتية فقط." },
            // 🧠 مكاشفات العلاقة (Extreme EQ)
            { title: "المواجهة: أكبر عيب ⚖️", desc: "يخبر كل طرف الآخر بـ 'أسوأ صفة' فيه بكل صراحة، وعلى الطرف الآخر تقبلها بدون تبرير أو زعل." },
            { title: "المواجهة: متى خذلتني؟ 💔", desc: "يعترف كل طرف بموقف شعر فيه بخذلان بسيط أو نقص اهتمام من الطرف الآخر ولم يتحدث عنه." },
            { title: "المواجهة: الخوف الأكبر 🌪️", desc: "لو افترقنا غداً.. ما هو السبب الأكثر واقعية الذي قد يؤدي لذلك؟ (نقاش عقلاني ومنطقي)." },
            { title: "المواجهة: لغة الحب ❤️", desc: "يقيّم كل طرف الآخر من 1 إلى 10 في تلبية 'لغة الحب' الخاصة به، مع ذكر السبب." },
            { title: "المواجهة: النقطة العمياء 👁️", desc: "ما هو الشيء الذي يفعله الطرف الآخر وتظن أنه لا ينتبه له، ولكنه يؤثر فيك بقوة (سلبياً أو إيجابياً)؟" },
            // 🃏 مواقف متبادلة وتخاطر
            { title: "حظر الإيموجي والضحك 🚫", desc: "ممنوع استخدام أي إيموجي، وممنوع كتابة (هههه) أو ما يشابهها لمدة 6 ساعات متواصلة. كلام جدي فقط." },
            { title: "التخاطر اللحظي ⚡", desc: "اكتبا 'أكثر شيء أكرهه في نفسي' وأرسلاها في نفس الثانية بالضبط لنرَ مدى معرفتكم ببعض." },
            { title: "الخلفية الإجبارية 📱", desc: "يختار كل شخص صورة بشعة للآخر، ويجب وضعها خلفية للهاتف لمدة 24 ساعة." },
            { title: "لعبة الأدوار 🎭", desc: "لمدة 10 دقائق، يتقمص محمد شخصية زينب، وتتقمص زينب شخصية محمد في الكلام والتصرفات." },
            { title: "تبادل الاعتذارات 🤍", desc: "يسجل كل طرف بصمة صوتية يعتذر فيها بصدق عن أسوأ تصرف قام به في العلاقة." },
            // 🌠 التجهيز للقاء الواقعي
            { title: "تخيل الصدمة الأولى 🌠", desc: "يصف كل طرف بصوته: ماذا سيفعل في أول 5 ثوانٍ عندما يرى الآخر وجهاً لوجه في الأردن؟" },
            { title: "قائمة الممنوعات 🚫", desc: "يتفق الطرفان على وضع 'قاعدة واحدة صارمة' يمنع تجاوزها عند اللقاء الواقعي الأول." },
            { title: "وعد الشرف المشترك 🤝", desc: "يعد كل طرف الآخر بشيء واحد لن يتغير فيه أبداً مهما طالت المسافات." },
            { title: "تحدي الميزانية 💰", desc: "كم تتوقعان أن تدفعا في أول خروجة لكما معاً؟ اتفقا على الميزانية ومن سيدفع ماذا." },
            { title: "أغنية اللقاء 🎧", desc: "يجب أن تتفقا الآن على أغنية واحدة ستشغلانها معاً في أول مشوار بالسيارة." },
            // 🎯 تفاعلات عشوائية وممتعة
            { title: "تبادل النكت البايخة 🤡", desc: "يجب على كل طرف إرسال أسوأ وأبرد نكتة يعرفها، ومن يضحك يخسر." },
            { title: "صورة بـ 10 ثوانٍ ⏱️", desc: "افتحا الكاميرا الأمامية والتقطا صورة لما تفعلانه الآن فوراً بدون أي ترتيب." },
            { title: "تبادل كلمات السر 🔑", desc: "ابتكرا 'كلمة طوارئ' تقولانها فقط عندما يكون أحدكما في ضائقة نفسية شديدة ويحتاج الآخر فوراً." },
            { title: "جلسة تفريغ السموم 💆‍♂️", desc: "لمدة 5 دقائق، يتذمر كل شخص من يومه بأبشع العبارات، والطرف الآخر يقول 'معك حق' فقط بدون حلول." },
            { title: "سؤال المليون 💰", desc: "لو عرضوا عليكم مليون دولار لعدم التحدث لمدة سنة كاملة.. هل توافقان؟ (النقاش إجباري)." }
        ]
    };

    // --- المنطق البرمجي للمحكمة (يبقى كما هو، فقط تم تحديث المصفوفة) ---
    // (تأكد من بقاء كود الـ select الخاص بـ "Both" وكود الحفظ كما هو في رسالتي السابقة)

    const penaltyModal = document.getElementById('penalty-modal');
    const penaltyModalContent = document.getElementById('modal-content');
    const generateBtn = document.getElementById('generate-penalty-btn');
    const savePenaltyBtn = document.getElementById('save-penalty-btn');
    const penaltyText = document.getElementById('penalty-text');
    const penaltyResult = document.getElementById('penalty-result');
    const ledgerTimeline = document.getElementById('penalty-timeline');

    let currentPendingPenalty = null;

    // فتح المودال
    document.getElementById('penalty-btn').addEventListener('click', () => {
        penaltyModal.classList.remove('hidden');
        setTimeout(() => {
            penaltyModal.classList.remove('opacity-0');
            penaltyModalContent.classList.add('scale-100');
        }, 10);
    });

    // توليد العقوبة
    // إضافة خيار "تحدي مشترك" للقائمة المنسدلة برمجياً
    const punishedSelect = document.getElementById('punished');
    if (!punishedSelect.querySelector('option[value="Both"]')) {
        const bothOption = document.createElement('option');
        bothOption.value = 'Both';
        bothOption.text = 'محمد وزينب معاً (تحدي مشترك 👩‍❤️‍👨)';
        punishedSelect.appendChild(bothOption);
    }

    // توليد العقوبة المطور
    generateBtn.addEventListener('click', () => {
        const punisher = document.getElementById('punisher').value;
        const punished = document.getElementById('punished').value;

        if (punisher === punished && punished !== 'Both') {
            alert("لا يمكنك معاقبة نفسك! اختر الطرف الآخر أو تحدياً مشتركاً ⚖️");
            return;
        }

        let pool = [];
        let displayTarget = "";

        // تحديد القائمة والاسم المعروض بناءً على الاختيار
        if (punished === 'Both') {
            pool = penaltyVault.Shared;
            displayTarget = "محمد وزينب (معاً)";
        } else {
            pool = penaltyVault[punished];
            displayTarget = punished;
        }

        const randomPenalty = pool[Math.floor(Math.random() * pool.length)];

        currentPendingPenalty = {
            punisher: punisher,
            punished: displayTarget,
            penaltyText: randomPenalty.title + ": " + randomPenalty.desc,
            date: new Date().toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })
        };

        penaltyText.innerHTML = `
            <span class="text-white block text-xs mb-1">قررت محكمة القلوب إسناد المهمة إلى ${displayTarget}:</span>
            <b class="text-accent">${randomPenalty.title}</b><br>
            <span class="text-sm opacity-90 italic">${randomPenalty.desc}</span>
        `;
        penaltyResult.classList.remove('hidden');
        savePenaltyBtn.classList.remove('hidden');
        generateBtn.innerText = "تغيير الحكم؟ 🔄";
    });

    // حفظ في قاعدة البيانات
    savePenaltyBtn.addEventListener('click', async () => {
        if (!currentPendingPenalty) return;
        try {
            await fetch(`${API_BASE_URL}/api/penalties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: currentPendingPenalty.date,
                    punisher: currentPendingPenalty.punisher,
                    punished: currentPendingPenalty.punished,
                    penaltyText: currentPendingPenalty.penaltyText,
                    isCompleted: false
                })
            });
            fetchPenaltiesFromServer();
            closePenaltyModal();
        } catch (error) { console.error("Save failed", error); }
    });

    const fetchPenaltiesFromServer = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/penalties`);
            const penalties = await response.json();
            ledgerTimeline.innerHTML = penalties.map(p => `
                <div class="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center fade-in">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-accent/20 text-accent uppercase">${p.punisher} ⚖️</span>
                            <span class="text-slate-500 text-[9px]">حكم على</span>
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-white uppercase">${p.punished}</span>
                        </div>
                        <p class="text-xs text-slate-200 font-medium">${p.penaltyText}</p>
                    </div>
                    <span class="text-[8px] text-slate-600">${p.date}</span>
                </div>
            `).join('');
        } catch (error) { console.error(error); }
    };

    const closePenaltyModal = () => {
        penaltyModal.classList.add('opacity-0');
        penaltyModalContent.classList.remove('scale-100');
        setTimeout(() => {
            penaltyModal.classList.add('hidden');
            penaltyResult.classList.add('hidden');
            savePenaltyBtn.classList.add('hidden');
            generateBtn.innerText = "إصدار الحكم ⚡️";
        }, 300);
    };

    document.getElementById('close-modal-btn').addEventListener('click', closePenaltyModal);

    // Initial Load
    fetchLinks();
    fetchCommits();
    fetchPenaltiesFromServer();
});