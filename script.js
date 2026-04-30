/* ==========================================================================
   የአባ ሙሴ ጸሊም የተማሪዎች ህብረት - ዲጂታል መተግበሪያ
   ዋና የጃቫስክሪፕት ፋይል (JS) - መተግበሪያውን ከቴሌግራም ጋር ማገናኛ
   ========================================================================== */

// 1. የቴሌግራም ዌብ አፕ ጀማሪ (Initialize Telegram Web App)
const tg = window.Telegram.WebApp;
tg.expand(); // መተግበሪያው ሙሉ ስክሪን (Full Screen) እንዲከፈት ያደርጋል
tg.ready();  // መተግበሪያው ለመስራት ዝግጁ መሆኑን ለቴሌግራም ያሳውቃል

// =====================================================================
// ⚠️ የአድሚን መለያ (ADMIN CONFIGURATION) ⚠️
// እዚህ ጋር የራስህን እና የሌሎች አድሚኖችን የቴሌግራም ID አስገባ
// (የቴሌግራም IDህን ለማወቅ @userinfobot ን መጠቀም ትችላለህ)
// =====================================================================
const ADMIN_TELEGRAM_IDS =[8777926366, ]; 


// 2. ቀላል ዳታቤዝ (Local Storage Mock Database) 
// ይህ ያለ ሪል ዳታቤዝ አፑ እንዲሰራ ይረዳል። (ፋይል ሲጫን ወዲያው እንዲታይ ወዘተ)
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

// 3. የገጽ ዳሰሳ መቆጣጠሪያ (Navigation Controller)
const appNavigation = {
    history: ['screen-dashboard'],
    
    openScreen: function(screenId) {
        // ሁሉንም ገጾች ደብቅ
        document.querySelectorAll('.app-screen').forEach(screen => {
            screen.classList.remove('active-screen');
            screen.classList.add('hidden-screen');
        });
        
        // የተመረጠውን ገጽ አሳይ
        const targetScreen = document.getElementById(screenId);
        targetScreen.classList.remove('hidden-screen');
        targetScreen.classList.add('active-screen');

        // ወደ ኋላ ለመመለስ ሂስትሪ ሴቭ አድርግ
        if(this.history[this.history.length - 1] !== screenId) {
            this.history.push(screenId);
        }
    },

    goBack: function() {
        if(this.history.length > 1) {
            this.history.pop(); // የአሁኑን ገጽ አውጣ
            const previousScreen = this.history[this.history.length - 1];
            
            document.querySelectorAll('.app-screen').forEach(screen => {
                screen.classList.remove('active-screen');
                screen.classList.add('hidden-screen');
            });
            
            document.getElementById(previousScreen).classList.remove('hidden-screen');
            document.getElementById(previousScreen).classList.add('active-screen');
        }
    },

    switchTab: function(screenId) {
        this.history = ['screen-dashboard']; // ሂስትሪ አጽዳ
        this.openScreen(screenId);
        
        // ከታች ያሉትን በተኖች ከለር ቀይር
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active-nav-item'));
        if(event && event.currentTarget) {
            event.currentTarget.classList.add('active-nav-item');
        }
    }
};

// 4. አፕሊኬሽኑ ሲከፈት መረጃዎችን ማምጣት (Initialization)
function initializeApp() {
    // የተጠቃሚውን መረጃ ከቴሌግራም መውሰድ
    const user = tg.initDataUnsafe?.user || {
        id: 000000,
        first_name: "የእግዚአብሔር",
        last_name: "ልጅ",
        photo_url: ""
    };

    // ስም እና አይዲ ማስተካከል
    const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
    document.getElementById('display-user-name').textContent = fullName;
    document.getElementById('card-member-name').textContent = fullName;
    document.getElementById('card-member-id').textContent = user.id;

    // ፎቶ ካለው ፎቶውን ማሳየት
    if (user.photo_url) {
        const profileImg = document.getElementById('user-profile-image');
        profileImg.src = user.photo_url;
        profileImg.classList.remove('hidden-element');
        document.querySelector('.placeholder-avatar').classList.add('hidden-element');
    }

    // በሰዓቱ መሰረት ሰላምታ መስጠት
    const currentHour = new Date().getHours();
    let greeting = "እንደምን ዋሉ፣";
    if (currentHour >= 5 && currentHour < 12) greeting = "እንደምን አደሩ፣";
    else if (currentHour >= 18 || currentHour < 5) greeting = "እንደምን አመሹ፣";
    document.getElementById('time-based-greeting').textContent = greeting;

    // 🌟 አድሚን መሆኑን ማረጋገጥ 🌟
    if (ADMIN_TELEGRAM_IDS.includes(user.id)) {
        document.getElementById('admin-access-container').classList.remove('hidden-element');
        adminPanel.init();
    }

    // ዳታዎችን መጫን
    loadDocuments();
    loadNotifications();
}

// 5. የአስተዳዳሪ ማዕከል መቆጣጠሪያ (Admin Panel Logic)
const adminPanel = {
    init: function() {
        this.updateStats();
        this.loadMessages();
    },

    switchTab: function(tabName) {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active-tab'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden-element'));
        
        event.currentTarget.classList.add('active-tab');
        document.getElementById(`admin-tab-${tabName}`).classList.remove('hidden-element');
        document.getElementById(`admin-tab-${tabName}`).classList.add('active-content');
    },

    updateStats: function() {
        document.getElementById('admin-total-users').textContent = "150+"; // የቴሌግራም ግሩፕ ሜምበር ብዛት መስሎ እንዲታይ
        document.getElementById('admin-total-messages').textContent = AppDatabase.getMessages().length;
    },

    loadMessages: function() {
        const msgs = AppDatabase.getMessages();
        const container = document.getElementById('admin-inbox-list');
        
        if(msgs.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:30px; color:#666;"><i class="fa-solid fa-inbox" style="font-size:30px; margin-bottom:10px;"></i><br>ምንም አዲስ መልእክት የለም</div>';
            return;
        }

        container.innerHTML = msgs.reverse().map(m => `
            <div style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 12px; border-left: 4px solid var(--brand-orange); box-shadow: var(--shadow-soft);">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                    <strong style="color:var(--brand-black); font-size:14px;">${m.sender} <span style="background:#eee; padding:2px 8px; border-radius:10px; font-size:11px; margin-left:5px;">${m.type}</span></strong>
                    <small style="color:#888;">${m.date}</small>
                </div>
                <p style="font-size:13px; color:#444; line-height:1.5;">${m.text}</p>
            </div>
        `).join('');
    }
};

// 6. ዳታዎችን ማሳያ ፈንክሽኖች (Display Data Functions)
function loadDocuments() {
    const docs = AppDatabase.getDocs();
    const container = document.getElementById('student-docs-list');
    
    // መጀመሪያ ላይ ዲፎልት ዶክመንቶች እንዲታዩ
    let displayDocs = docs;
    if(displayDocs.length === 0) {
        displayDocs =[
            { title: "የባዮሎጂ ዩኒት 1 ማጠቃለያ", grade: "12", url: "#" },
            { title: "የሂሳብ (Maths) ቀመሮች", grade: "10", url: "#" }
        ];
    }

    container.innerHTML = `<h3 class="list-heading" style="margin-bottom:15px; font-size:14px;">የተጫኑ የትምህርት መርጃዎች</h3>` + 
    displayDocs.reverse().map(d => `
        <article class="document-item">
            <div class="document-icon"><i class="fa-solid fa-file-pdf"></i></div>
            <div class="document-details">
                <h4 class="document-title">${d.title}</h4>
                <span class="document-meta">${d.grade}ኛ ክፍል • አዲስ</span>
            </div>
            <a href="${d.url}" target="_blank" class="download-button" style="display:flex; align-items:center; justify-content:center; text-decoration:none;">
                <i class="fa-solid fa-download"></i>
            </a>
        </article>
    `).join('');
}

function loadNotifications() {
    const notifs = AppDatabase.getNotifs();
    const container = document.getElementById('user-notifications-list');
    
    let displayNotifs = notifs;
    if(displayNotifs.length === 0) {
        displayNotifs =[
            { title: "እንኳን ደህና መጡ", message: "ወደ አባ ሙሴ ጸሊም የዲጂታል መተግበሪያ በሰላም መጡ!", date: "ዛሬ" }
        ];
    }

    document.getElementById('unread-notifications-count').textContent = displayNotifs.length;

    container.innerHTML = displayNotifs.reverse().map(n => `
        <div class="notification-item unread-notification" style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 12px; border-left: 4px solid var(--brand-orange); display:flex; gap:15px; box-shadow: var(--shadow-soft);">
            <div class="notification-icon-wrapper info-type" style="color: var(--brand-orange); font-size:24px; display:flex; align-items:center;">
                <i class="fa-solid fa-bell"></i>
            </div>
            <div class="notification-content">
                <h4 class="notification-heading" style="margin-bottom:5px; font-size:14px; color:var(--brand-black);">${n.title}</h4>
                <p class="notification-detail" style="font-size:12px; color: var(--text-secondary); line-height:1.4;">${n.message}</p>
                <span class="notification-time" style="font-size:10px; color:#aaa; margin-top:5px; display:block;">${n.date}</span>
            </div>
        </div>
    `).join('');
}

// 7. የቅጾች ምላሽ (Form Submissions)

// ሀ. የጸሎት/ምስጢር ሳጥን ቅጽ
document.getElementById('prayer-request-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('message-type').options[document.getElementById('message-type').selectedIndex].text;
    const text = document.getElementById('secret-message').value;
    const userName = tg.initDataUnsafe?.user?.first_name || "ያልታወቀ አባል";
    
    AppDatabase.saveMessage({ 
        type: type, 
        text: text, 
        date: new Date().toLocaleDateString('am-ET'), 
        sender: userName 
    });
    
    tg.showAlert('መልእክትዎ በተሳካ ሁኔታ ተልኳል! በሚስጥር ተጠብቆ ለአስተዳዳሪዎች ይደርሳል።');
    e.target.reset();
    appNavigation.goBack();
});

// ለ. የቱቶሪያል ጥያቄ ቅጽ
document.getElementById('tutoring-request-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = document.getElementById('subject-select').options[document.getElementById('subject-select').selectedIndex].text;
    const topic = document.getElementById('specific-topic').value;
    const userName = tg.initDataUnsafe?.user?.first_name || "ያልታወቀ አባል";
    
    AppDatabase.saveMessage({ 
        type: 'ቱቶሪያል ጥያቄ', 
        text: `የትምህርት አይነት: ${subject}\nየሚከብደው ርዕስ: ${topic}`, 
        date: new Date().toLocaleDateString('am-ET'), 
        sender: userName 
    });
    
    tg.showAlert('የጥናት ድጋፍ ጥያቄዎ ተመዝግቧል። ተገቢውን ሰው ፈልገን እናሳውቅዎታለን!');
    e.target.reset();
    appNavigation.goBack();
});

// ሐ. አድሚን - ፋይል መጫኛ
document.getElementById('admin-upload-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('doc-title').value;
    const grade = document.getElementById('doc-grade').value;
    const url = document.getElementById('doc-url').value;
    
    AppDatabase.saveDoc({title, grade, url});
    tg.showAlert('የትምህርት መርጃው በተሳካ ሁኔታ ተጭኗል!');
    e.target.reset();
    loadDocuments(); // ወዲያውኑ ገጹን አፕዴት ለማድረግ
});

// መ. አድሚን - ማሳወቂያ መላኪያ
document.getElementById('admin-broadcast-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('broadcast-title').value;
    const message = document.getElementById('broadcast-message').value;
    
    AppDatabase.saveNotif({
        title: title, 
        message: message, 
        date: new Date().toLocaleDateString('am-ET')
    });
    
    tg.showAlert('ማሳወቂያው ለሁሉም አባላት ተልኳል!');
    e.target.reset();
    loadNotifications(); // ማሳወቂያዎቹን ወዲያው ለማሳየት
});

// 8. አፕሊኬሽኑ ሲከፈት አስነሳ
window.addEventListener('DOMContentLoaded', initializeApp);
