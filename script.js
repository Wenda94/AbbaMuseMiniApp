/* ==========================================================================
   የአባ ሙሴ ጸሊም - JS Logic (Theme Toggle Included)
   ========================================================================== */

const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ⚠️ የራስህን የቴሌግራም ID እዚህ አስገባ
const ADMIN_TELEGRAM_IDS =[7237816050, 987654321]; 

// ==========================================
// 🌟 የ Light/Dark ማብሪያ እና ማጥፊያ (Theme Engine)
// ==========================================
const themeToggleBtn = document.getElementById('theme-toggle-btn');

function initTheme() {
    // ከ LocalStorage ወይም ቴሌግራም የተመረጠውን ማንበብ
    const savedTheme = localStorage.getItem('abba_muse_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    
    // አይኮኑን መቀየር (ከጨረቃ ወደ ፀሐይ)
    themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    
    // ምርጫውን Save ማድረግ
    localStorage.setItem('abba_muse_theme', isDark ? 'dark' : 'light');
});


// Local Storage DB
const AppDatabase = {
    getMessages: () => JSON.parse(localStorage.getItem('abba_muse_msgs') || '[]'),
    saveMessage: (msg) => { const msgs = AppDatabase.getMessages(); msgs.push(msg); localStorage.setItem('abba_muse_msgs', JSON.stringify(msgs)); },
    getDocs: () => JSON.parse(localStorage.getItem('abba_muse_docs') || '[]'),
    saveDoc: (doc) => { const docs = AppDatabase.getDocs(); docs.push(doc); localStorage.setItem('abba_muse_docs', JSON.stringify(docs)); },
    getNotifs: () => JSON.parse(localStorage.getItem('abba_muse_notifs') || '[]'),
    saveNotif: (notif) => { const notifs = AppDatabase.getNotifs(); notifs.push(notif); localStorage.setItem('abba_muse_notifs', JSON.stringify(notifs)); }
};

function getFullUserName() {
    const user = tg.initDataUnsafe?.user;
    if (user && user.first_name) {
        return user.first_name + (user.last_name ? " " + user.last_name : "");
    }
    return "ያልታወቀ አባል";
}

const appNavigation = {
    history:['screen-dashboard'],
    openScreen: function(screenId) {
        document.querySelectorAll('.app-screen').forEach(s => { s.classList.remove('active-screen'); s.classList.add('hidden-screen'); });
        document.getElementById(screenId).classList.remove('hidden-screen');
        document.getElementById(screenId).classList.add('active-screen');
        if(this.history[this.history.length - 1] !== screenId) this.history.push(screenId);
    },
    goBack: function() {
        if(this.history.length > 1) {
            this.history.pop();
            this.openScreen(this.history[this.history.length - 1]);
            this.history.pop(); 
        }
    },
    switchTab: function(screenId) {
        this.history =['screen-dashboard'];
        this.openScreen(screenId);
        document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active-nav-item'));
        if(event && event.currentTarget) event.currentTarget.classList.add('active-nav-item');
    }
};

function initializeApp() {
    initTheme(); // ቴሙን አስነሳ
    
    const user = tg.initDataUnsafe?.user || { id: 000000, photo_url: "" };
    const fullName = getFullUserName();

    document.getElementById('display-user-name').textContent = fullName;
    document.getElementById('card-member-name').textContent = fullName;
    document.getElementById('card-member-id').textContent = user.id;

    if (user.photo_url) {
        const profileImg = document.getElementById('user-profile-image');
        profileImg.src = user.photo_url;
        profileImg.classList.remove('hidden-element');
        document.querySelector('.placeholder-avatar').classList.add('hidden-element');
    }

    if (ADMIN_TELEGRAM_IDS.includes(user.id)) {
        document.getElementById('admin-access-container').classList.remove('hidden-element');
        adminPanel.init();
    }

    loadDocuments();
    loadNotifications();
}

const adminPanel = {
    init: function() { this.loadMessages(); },
    switchTab: function(tabName) {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active-tab'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden-element'));
        event.currentTarget.classList.add('active-tab');
        document.getElementById(`admin-tab-${tabName}`).classList.remove('hidden-element');
        document.getElementById(`admin-tab-${tabName}`).classList.add('active-content');
    },
    loadMessages: function() {
        const msgs = AppDatabase.getMessages();
        const container = document.getElementById('admin-inbox-list');
        if(msgs.length === 0) { container.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.5;">ምንም አዲስ መልእክት የለም</div>'; return; }
        container.innerHTML = msgs.reverse().map(m => `
            <div class="glossy-effect" style="padding: 15px; margin-bottom: 10px; border-radius: 12px; border-left: 3px solid var(--brand-orange);">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong style="font-size:13px;">${m.sender} <span style="opacity:0.6; font-size:10px;">(${m.type})</span></strong>
                    <small style="opacity:0.5;">${m.date}</small>
                </div>
                <p style="font-size:13px;">${m.text}</p>
            </div>
        `).join('');
    }
};

function loadDocuments() {
    const docs = AppDatabase.getDocs();
    const container = document.getElementById('student-docs-list');
    if(docs.length === 0) { container.innerHTML = "<p style='text-align:center; opacity:0.5; margin-top:20px;'>ፋይል አልተጫነም!</p>"; return; }
    container.innerHTML = docs.reverse().map(d => `
        <article class="document-item glossy-effect">
            <div class="document-icon"><i class="fa-solid fa-file-pdf"></i></div>
            <div style="flex:1;">
                <h4 style="font-size:14px; font-weight:800;">${d.title}</h4>
                <span style="font-size:11px; opacity:0.6;">${d.grade}ኛ ክፍል • ከቴሌግራም አውርድ</span>
            </div>
            <button onclick="tg.showAlert('ፋይሉን ከቴሌግራም ቻናላችን ያውርዱ!')" style="background:transparent; border:none; color:var(--brand-orange); font-size:20px;">
                <i class="fa-solid fa-download"></i>
            </button>
        </article>
    `).join('');
}

function loadNotifications() {
    const notifs = AppDatabase.getNotifs();
    document.getElementById('unread-notifications-count').textContent = notifs.length;
    const container = document.getElementById('user-notifications-list');
    if(notifs.length === 0) { container.innerHTML = "<p style='text-align:center; opacity:0.5; padding:20px;'>ምንም ማሳወቂያ የለም</p>"; return; }
    container.innerHTML = notifs.reverse().map(n => `
        <div class="glossy-effect" style="padding: 15px; margin-bottom: 10px; border-radius: 16px;">
            <h4 style="font-size:14px; font-weight:800; margin-bottom:4px;">${n.title}</h4>
            <p style="font-size:13px; opacity:0.8;">${n.message}</p>
            <small style="opacity:0.5; font-size:10px; display:block; margin-top:5px;">${n.date}</small>
        </div>
    `).join('');
}

document.getElementById('prayer-request-form').addEventListener('submit', (e) => {
    e.preventDefault();
    AppDatabase.saveMessage({ type: document.getElementById('message-type').value, text: document.getElementById('secret-message').value, date: new Date().toLocaleDateString('am-ET'), sender: getFullUserName() });
    tg.showAlert('መልእክትዎ ተልኳል!'); e.target.reset(); appNavigation.goBack(); adminPanel.loadMessages();
});

document.getElementById('tutoring-request-form').addEventListener('submit', (e) => {
    e.preventDefault();
    AppDatabase.saveMessage({ type: 'ቱቶሪያል', text: `ትምህርት: ${document.getElementById('subject-select').value}\nርዕስ: ${document.getElementById('specific-topic').value}`, date: new Date().toLocaleDateString('am-ET'), sender: getFullUserName() });
    tg.showAlert('ጥያቄዎ ተመዝግቧል!'); e.target.reset(); appNavigation.goBack(); adminPanel.loadMessages();
});

document.getElementById('admin-upload-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fileName = document.getElementById('doc-file').files.length > 0 ? document.getElementById('doc-file').files[0].name : "ፋይል";
    AppDatabase.saveDoc({ title: document.getElementById('doc-title').value + ` (${fileName})`, grade: document.getElementById('doc-grade').value });
    tg.showAlert('ፋይሉ ተመዝግቧል!'); e.target.reset(); loadDocuments();
});

document.getElementById('admin-broadcast-form').addEventListener('submit', (e) => {
    e.preventDefault();
    AppDatabase.saveNotif({ title: document.getElementById('broadcast-title').value, message: document.getElementById('broadcast-message').value, date: new Date().toLocaleDateString('am-ET') });
    tg.showAlert('ማሳወቂያው ተልኳል!'); e.target.reset(); loadNotifications();
});

window.addEventListener('DOMContentLoaded', initializeApp);
