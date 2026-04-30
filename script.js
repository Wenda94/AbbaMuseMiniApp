/* ==========================================================================
   የአባ ሙሴ ጸሊም - JS Logic
   ========================================================================== */

const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ⚠️ የራስህን የቴሌግራም ID እዚህ አስገባ
const ADMIN_TELEGRAM_IDS =[7237816050, 987654321]; 

// Local Storage DB
const AppDatabase = {
    getMessages: () => JSON.parse(localStorage.getItem('abba_muse_msgs') || '[]'),
    saveMessage: (msg) => {
        const msgs = AppDatabase.getMessages();
        msgs.push(msg);
        localStorage.setItem('abba_muse_msgs', JSON.stringify(msgs));
    },
    getDocs: () => JSON.parse(localStorage.getItem('abba_muse_docs') || '[]'),
    saveDoc: (doc) => {
        const docs = AppDatabase.getDocs();
        docs.push(doc);
        localStorage.setItem('abba_muse_docs', JSON.stringify(docs));
    },
    getNotifs: () => JSON.parse(localStorage.getItem('abba_muse_notifs') || '[]'),
    saveNotif: (notif) => {
        const notifs = AppDatabase.getNotifs();
        notifs.push(notif);
        localStorage.setItem('abba_muse_notifs', JSON.stringify(notifs));
    }
};

// የተጠቃሚውን ሙሉ ስም በትክክል ለማውጣት (Full Name Fix)
function getFullUserName() {
    const user = tg.initDataUnsafe?.user;
    if (user && user.first_name) {
        let fullName = user.first_name;
        if (user.last_name) fullName += " " + user.last_name;
        return fullName;
    }
    // ቴሌግራም ላይ ካልሆነ (Web Browser)
    return "ያልታወቀ አባል";
}

// Navigation
const appNavigation = {
    history: ['screen-dashboard'],
    openScreen: function(screenId) {
        document.querySelectorAll('.app-screen').forEach(screen => {
            screen.classList.remove('active-screen');
            screen.classList.add('hidden-screen');
        });
        document.getElementById(screenId).classList.remove('hidden-screen');
        document.getElementById(screenId).classList.add('active-screen');

        if(this.history[this.history.length - 1] !== screenId) {
            this.history.push(screenId);
        }
    },
    goBack: function() {
        if(this.history.length > 1) {
            this.history.pop();
            const prevScreen = this.history[this.history.length - 1];
            this.openScreen(prevScreen);
            this.history.pop(); // Prevent duplicate push
        }
    },
    switchTab: function(screenId) {
        this.history = ['screen-dashboard'];
        this.openScreen(screenId);
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active-nav-item'));
        if(event && event.currentTarget) event.currentTarget.classList.add('active-nav-item');
    }
};

function initializeApp() {
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

// Admin Panel Logic
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
        if(msgs.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">ምንም አዲስ መልእክት የለም</div>'; return;
        }
        container.innerHTML = msgs.reverse().map(m => `
            <div style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--border-color); border-left: 4px solid var(--brand-orange);">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                    <strong style="color:var(--brand-black); font-size:14px;">${m.sender} <span style="background:var(--brand-cream); padding:2px 8px; border-radius:10px; font-size:11px;">${m.type}</span></strong>
                    <small style="color:#888;">${m.date}</small>
                </div>
                <p style="font-size:13px; color:#222;">${m.text}</p>
            </div>
        `).join('');
    }
};

function loadDocuments() {
    const docs = AppDatabase.getDocs();
    const container = document.getElementById('student-docs-list');
    if(docs.length === 0) {
        container.innerHTML = "<p style='text-align:center; margin-top:20px;'>ገና ፋይል አልተጫነም!</p>"; return;
    }
    container.innerHTML = docs.reverse().map(d => `
        <article class="document-item">
            <div class="document-icon"><i class="fa-solid fa-file-pdf"></i></div>
            <div style="flex:1;">
                <h4 class="document-title">${d.title}</h4>
                <span class="document-meta">${d.grade}ኛ ክፍል • ከቴሌግራም አውርድ</span>
            </div>
            <button onclick="tg.showAlert('ፋይሉን ከቴሌግራም ቻናላችን ያውርዱ!')" class="nav-button" style="color:var(--brand-orange);">
                <i class="fa-solid fa-download"></i>
            </button>
        </article>
    `).join('');
}

function loadNotifications() {
    const notifs = AppDatabase.getNotifs();
    document.getElementById('unread-notifications-count').textContent = notifs.length;
    const container = document.getElementById('user-notifications-list');
    if(notifs.length === 0) { container.innerHTML = "<p style='text-align:center; padding:20px;'>ምንም ማሳወቂያ የለም</p>"; return; }
    
    container.innerHTML = notifs.reverse().map(n => `
        <div style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 12px; border-left: 4px solid var(--brand-black); box-shadow: var(--shadow-soft);">
            <h4 style="font-size:14px; margin-bottom:5px;">${n.title}</h4>
            <p style="font-size:12px; color:#555;">${n.message}</p>
            <small style="color:#999; font-size:10px;">${n.date}</small>
        </div>
    `).join('');
}

// Forms Submission
document.getElementById('prayer-request-form').addEventListener('submit', (e) => {
    e.preventDefault();
    AppDatabase.saveMessage({ 
        type: document.getElementById('message-type').options[document.getElementById('message-type').selectedIndex].text, 
        text: document.getElementById('secret-message').value, 
        date: new Date().toLocaleDateString('am-ET'), 
        sender: getFullUserName() // ሙሉ ስም ተጠቀመ
    });
    tg.showAlert('መልእክትዎ ተልኳል!'); e.target.reset(); appNavigation.goBack(); adminPanel.loadMessages();
});

document.getElementById('tutoring-request-form').addEventListener('submit', (e) => {
    e.preventDefault();
    AppDatabase.saveMessage({ 
        type: 'ቱቶሪያል ጥያቄ', 
        text: `ትምህርት: ${document.getElementById('subject-select').value}\nርዕስ: ${document.getElementById('specific-topic').value}`, 
        date: new Date().toLocaleDateString('am-ET'), 
        sender: getFullUserName() // ሙሉ ስም
    });
    tg.showAlert('ጥያቄዎ ተመዝግቧል!'); e.target.reset(); appNavigation.goBack(); adminPanel.loadMessages();
});

// Admin File Manager Upload 
document.getElementById('admin-upload-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('doc-title').value;
    const grade = document.getElementById('doc-grade').value;
    
    // ከስልክ የተመረጠውን ፋይል ስም ማንበብ
    const fileInput = document.getElementById('doc-file');
    const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : "ያልታወቀ ፋይል";
    
    // (ማስታወሻ፡ እዚህ ጋር ሚኒ አፕሊኬሽን ፋይሉን ቀጥታ ወደ ቴሌግራም ቻናል ለመላክ BOT API Backend ይፈልጋል።
    // ለጊዜው ስሙን ሴቭ አድርገን UI ላይ እናሳየዋለን)
    
    AppDatabase.saveDoc({ title: title + ` (${fileName})`, grade: grade });
    
    tg.showAlert('ፋይሉ ወደ ሲስተሙ ገብቷል! (እውነተኛ አፕሎድ ለመስራት Bot Backend ያስፈልጋል)');
    e.target.reset(); loadDocuments();
});

document.getElementById('admin-broadcast-form').addEventListener('submit', (e) => {
    e.preventDefault();
    AppDatabase.saveNotif({
        title: document.getElementById('broadcast-title').value, 
        message: document.getElementById('broadcast-message').value, 
        date: new Date().toLocaleDateString('am-ET')
    });
    tg.showAlert('ማሳወቂያው ተልኳል!'); e.target.reset(); loadNotifications();
});

window.addEventListener('DOMContentLoaded', initializeApp);
