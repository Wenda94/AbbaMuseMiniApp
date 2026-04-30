/**
 * ============================================================================
 * የአባ ሙሴ ጸሊም መተግበሪያ - የጃቫስክሪፕት መቆጣጠሪያ (Main JavaScript Logic)
 * ============================================================================
 */

"use strict";

/**
 * 1. የቴሌግራም ኤፒአይ እና መሰረታዊ መረጃዎች (Telegram API & Config)
 */
const tg = window.Telegram.WebApp;
const ADMIN_ID = 8777926366; // የእርስዎ የቴሌግራም መለያ ቁጥር

/**
 * 2. የገጽ ማውጫ አስተዳደር (Navigation Controller)
 */
const appNavigation = (function() {
    
    // ሁሉንም ገጾች የመደበቅ ተግባር
    function hideAllScreens() {
        const screens = document.querySelectorAll('.app-screen');
        screens.forEach(function(screen) {
            screen.classList.remove('active-screen');
            screen.classList.add('hidden-screen');
        });
    }

    // የታችኛውን ማውጫ የማስተካከል ተግባር
    function updateBottomNavigation(activeScreenId) {
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(function(button) {
            button.classList.remove('active-nav-item');
            if (button.getAttribute('onclick') && button.getAttribute('onclick').includes(activeScreenId)) {
                button.classList.add('active-nav-item');
            }
        });
    }

    return {
        // አዲስ ገጽ መክፈቻ
        openScreen: function(screenId) {
            // የንክኪ ስሜት (Haptic Feedback) ለሞባይል
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }

            hideAllScreens();
            
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.remove('hidden-screen');
                targetScreen.classList.add('active-screen');
                
                // ወደ ዋናው ገጽ ካልሆነ የቴሌግራምን የመመለሻ በተን ማሳየት
                if (screenId !== 'screen-dashboard' && screenId !== 'screen-admin') {
                    tg.BackButton.show();
                } else {
                    tg.BackButton.hide();
                }

                updateBottomNavigation(screenId);
            }
        },

        // በታችኛው ማውጫ አማካኝነት ገጽ መቀየሪያ
        switchTab: function(screenId) {
            this.openScreen(screenId);
        },

        // ወደ ኋላ መመለሻ
        goBack: function() {
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('medium');
            }
            this.openScreen('screen-dashboard');
        }
    };
})();

/**
 * 3. የተጠቃሚ በይነገጽ አስተዳደር (UI Controller)
 */
const uiController = (function() {
    
    // በሰዓት ላይ የተመሰረተ ሰላምታ
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "እንደምን አደሩ፣";
        if (hour >= 12 && hour < 18) return "እንደምን ዋሉ፣";
        if (hour >= 18 && hour < 22) return "እንደምን አመሹ፣";
        return "ሰላም፣";
    }

    return {
        initializeUser: function() {
            // የሰላምታ ጊዜውን ማስገባት
            const greetingElement = document.getElementById('time-based-greeting');
            if (greetingElement) {
                greetingElement.textContent = getGreeting();
            }

            // የቴሌግራም ተጠቃሚ መረጃን ማምጣት
            const user = tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user : null;
            
            if (user) {
                // ስም እና መታወቂያ ቁጥር ማስተካከል
                const firstName = user.first_name || "ተማሪ";
                const lastName = user.last_name || "";
                
                document.getElementById('display-user-name').textContent = firstName;
                document.getElementById('card-member-name').textContent = firstName + " " + lastName;
                document.getElementById('card-member-id').textContent = user.id;

                // አስተዳዳሪ (Admin) መሆኑን አረጋግጦ መቆጣጠሪያውን ማሳየት
                if (user.id === ADMIN_ID) {
                    const adminNav = document.getElementById('admin-nav-item');
                    if (adminNav) {
                        adminNav.style.display = 'flex';
                    }
                }
            } else {
                // ከቴሌግራም ውጪ ሲከፈት (ለሙከራ)
                document.getElementById('display-user-name').textContent = "እንግዳ";
                document.getElementById('card-member-name').textContent = "እንግዳ ተጠቃሚ";
                document.getElementById('card-member-id').textContent = "000000";
            }
        }
    };
})();

/**
 * 4. መረጃ ወደ ቦት መላኪያ (Data Submission Controller)
 */
const formController = (function() {
    return {
        setupListeners: function() {
            
            // ሀ. የምስጢር ሳጥን ቅጽ
            const prayerForm = document.getElementById('prayer-request-form');
            if (prayerForm) {
                prayerForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const message = document.getElementById('secret-message').value;
                    
                    if (message.trim() !== "") {
                        tg.sendData(JSON.stringify({
                            action: "prayer",
                            message: message
                        }));
                        tg.close(); // አፕሊኬሽኑን መዝጋት
                    }
                });
            }

            // ለ. የቱቶሪያል ጥያቄ ቅጽ
            const tutoringForm = document.getElementById('tutoring-request-form');
            if (tutoringForm) {
                tutoringForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const subject = document.getElementById('subject-topic').value;
                    
                    if (subject.trim() !== "") {
                        tg.sendData(JSON.stringify({
                            action: "tutor",
                            subject: subject
                        }));
                        tg.close();
                    }
                });
            }

            // ሐ. የአስተዳዳሪ መልእክት ማሰራጫ ቅጽ
            const adminForm = document.getElementById('admin-broadcast-form');
            if (adminForm) {
                adminForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const broadcastMsg = document.getElementById('broadcast-message').value;
                    
                    if (broadcastMsg.trim() !== "") {
                        tg.sendData(JSON.stringify({
                            action: "broadcast",
                            message: broadcastMsg
                        }));
                        tg.close();
                    }
                });
            }
        }
    };
})();

/**
 * 5. ዋና ማስጀመሪያ (Application Bootstrapper)
 */
document.addEventListener("DOMContentLoaded", function() {
    // ቴሌግራም አፕሊኬሽኑን ሙሉ ስክሪን ማድረግ
    tg.expand();
    tg.ready();

    // የተጠቃሚ መረጃዎችን ማዘጋጀት
    uiController.initializeUser();

    // የቅጾች ስራ ማስጀመር
    formController.setupListeners();

    // የቴሌግራም መመለሻ በተን ሲነካ ወደ ዋናው ገጽ መመለስ
    tg.BackButton.onClick(function() {
        appNavigation.goBack();
    });
});
