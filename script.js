/**
 * ============================================================================
 * የአባ ሙሴ ጸሊም መተግበሪያ - ዋና የጃቫስክሪፕት ፋይል (Main Application Logic)
 * ስሪት: 1.0.0
 * መዋቅር: ሞጁላር (Modular Architecture)
 * ============================================================================
 */

"use strict";

/**
 * ----------------------------------------------------------------------------
 * 1. የቴሌግራም መሠረተ ልማት (Telegram Infrastructure)
 * ----------------------------------------------------------------------------
 */
const TelegramApp = (function() {
    // የቴሌግራም ዌብ አፕ ኦብጀክትን ማግኘት
    const tg = window.Telegram.WebApp;

    return {
        init: function() {
            // አፕሊኬሽኑን ሙሉ ስክሪን ማድረግ
            tg.expand();
            
            // የአፕሊኬሽኑን ዋና ቀለም ማስተካከል
            tg.setHeaderColor('#f4f7f6');
            tg.setBackgroundColor('#f4f7f6');
            
            // አፕሊኬሽኑ ዝግጁ መሆኑን ለቴሌግራም ማሳወቅ
            tg.ready();
            
            console.log("የቴሌግራም መሠረተ ልማት በተሳካ ሁኔታ ተጀምሯል።");
        },
        getUserData: function() {
            // የተጠቃሚውን መረጃ ከቴሌግራም ማምጣት
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                return tg.initDataUnsafe.user;
            }
            // ከቴሌግራም ውጪ ለሚደረግ ሙከራ ጊዜያዊ መረጃ
            return {
                id: 123456789,
                first_name: "ክቡር",
                last_name: "ተማሪ",
                username: "student_demo"
            };
        },
        showBackButton: function(show) {
            if (show) {
                tg.BackButton.show();
            } else {
                tg.BackButton.hide();
            }
        },
        onBackButtonClicked: function(callback) {
            tg.BackButton.onClick(callback);
        },
        triggerHapticFeedback: function(style = 'light') {
            // ተጠቃሚው በተን ሲጫን የንክኪ ስሜት (Vibration) እንዲሰማው ማድረግ
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred(style);
            }
        },
        showAlert: function(message) {
            tg.showAlert(message);
        },
        closeApp: function() {
            tg.close();
        }
    };
})();

/**
 * ----------------------------------------------------------------------------
 * 2. የገጽ እና ማውጫ አስተዳደር (Navigation & Routing Management)
 * ----------------------------------------------------------------------------
 */
const appNavigation = (function() {
    // ያለፉባቸውን ገጾች ለማስታወስ (History Stack)
    let screenHistory = ['screen-dashboard'];

    /**
     * ሁሉንም ገጾች መደበቅ
     */
    function hideAllScreens() {
        const screens = document.querySelectorAll('.app-screen');
        screens.forEach(screen => {
            screen.classList.remove('active-screen');
            screen.classList.add('hidden-screen');
        });
    }

    /**
     * የታችኛውን ማውጫ ማስተካከል (Bottom Navigation Active State)
     */
    function updateBottomNav(targetScreenId) {
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.classList.remove('active-nav-item');
            // የገጹ መለያ እና የማውጫው ተግባር ከተገናኙ
            if (button.getAttribute('onclick').includes(targetScreenId)) {
                button.classList.add('active-nav-item');
            }
        });
    }

    return {
        openScreen: function(screenId) {
            TelegramApp.triggerHapticFeedback('light');
            
            // የገጹ መለያ ካልተቀየረ ምንም አታድርግ
            const currentScreen = screenHistory[screenHistory.length - 1];
            if (currentScreen === screenId) return;

            hideAllScreens();
            
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.remove('hidden-screen');
                targetScreen.classList.add('active-screen');
                
                // ታሪክ መመዝገብ
                screenHistory.push(screenId);
                
                // ወደ ዋናው ገጽ ካልሆነ የቴሌግራም መመለሻ በተን አሳይ
                if (screenId !== 'screen-dashboard') {
                    TelegramApp.showBackButton(true);
                }
                
                // በማውጫው በኩል ከሆነ ለማስተካከል
                updateBottomNav(screenId);
            } else {
                console.error("የተጠየቀው ገጽ አልተገኘም: " + screenId);
            }
        },
        
        switchTab: function(screenId) {
            TelegramApp.triggerHapticFeedback('medium');
            
            // ታሪኩን ማጽዳት እና ወደ አዲሱ ዋና ገጽ መቀየር
            screenHistory = [screenId];
            
            hideAllScreens();
            
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.remove('hidden-screen');
                targetScreen.classList.add('active-screen');
                
                // ዋና ማውጫዎች ስለሆኑ የቴሌግራም መመለሻ በተንን መደበቅ
                TelegramApp.showBackButton(false);
                
                updateBottomNav(screenId);
            }
        },

        goBack: function() {
            TelegramApp.triggerHapticFeedback('light');
            
            if (screenHistory.length > 1) {
                // የአሁኑን ገጽ ማጥፋት
                screenHistory.pop();
                // የቀድሞውን ገጽ ማግኘት
                const previousScreenId = screenHistory[screenHistory.length - 1];
                
                hideAllScreens();
                
                const targetScreen = document.getElementById(previousScreenId);
                if (targetScreen) {
                    targetScreen.classList.remove('hidden-screen');
                    targetScreen.classList.add('active-screen');
                    
                    updateBottomNav(previousScreenId);
                    
                    // ወደ ዋናው ገጽ ከተመለስን የመመለሻ በተኑን መደበቅ
                    if (previousScreenId === 'screen-dashboard') {
                        TelegramApp.showBackButton(false);
                    }
                }
            } else {
                // መመለሻ ከሌለ አፕሊኬሽኑን መዝጋት
                TelegramApp.closeApp();
            }
        }
    };
})();

/**
 * ----------------------------------------------------------------------------
 * 3. የተጠቃሚ በይነገጽ አስተዳደር (User Interface Controller)
 * ----------------------------------------------------------------------------
 */
const UIController = (function() {
    
    /**
     * በሰዓት ላይ የተመሰረተ ሰላምታ ማመንጨት
     */
    function getDynamicGreeting() {
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 12) {
            return "እንደምን አደሩ፣";
        } else if (currentHour >= 12 && currentHour < 18) {
            return "እንደምን ዋሉ፣";
        } else if (currentHour >= 18 && currentHour < 22) {
            return "እንደምን አመሹ፣";
        } else {
            return "ሰላም፣";
        }
    }

    return {
        initializeUserData: function() {
            const user = TelegramApp.getUserData();
            
            // የሰላምታ ጊዜን ማስተካከል
            document.getElementById('time-based-greeting').textContent = getDynamicGreeting();
            
            // የተጠቃሚውን ስም ማስተካከል
            const firstName = user.first_name || "ተማሪ";
            const lastName = user.last_name || "";
            const fullName = (firstName + " " + lastName).trim();
            
            document.getElementById('display-user-name').textContent = firstName;
            document.getElementById('card-member-name').textContent = fullName;
            
            // የመለያ ቁጥር (ID) ማስተካከል
            document.getElementById('card-member-id').textContent = user.id;
        }
    };
})();

/**
 * ----------------------------------------------------------------------------
 * 4. የቅጽ እና መረጃ አስተዳደር (Forms & Data Handling)
 * ----------------------------------------------------------------------------
 */
const FormManager = (function() {
    
    function handlePrayerRequest(event) {
        event.preventDefault();
        TelegramApp.triggerHapticFeedback('heavy');
        
        const messageType = document.getElementById('message-type').value;
        const secretMessage = document.getElementById('secret-message').value;
        
        if (!secretMessage.trim()) {
            TelegramApp.showAlert("እባክዎ መልእክትዎን ያስገቡ።");
            return;
        }

        // ለቴሌግራም ቦት መረጃውን ማስተላለፍ
        const dataPayload = JSON.stringify({
            action: "prayer_request",
            type: messageType,
            message: secretMessage
        });
        
        window.Telegram.WebApp.sendData(dataPayload);
        
        // ቅጹን ማጽዳት እና ማሳወቂያ ማሳየት
        document.getElementById('prayer-request-form').reset();
        TelegramApp.showAlert("መልእክትዎ በሚስጥር ለህብረቱ አስተዳዳሪዎች ተልኳል። እናመሰግናለን።");
        appNavigation.goBack();
    }

    function handleTutoringRequest(event) {
        event.preventDefault();
        TelegramApp.triggerHapticFeedback('heavy');
        
        const subject = document.getElementById('subject-select').value;
        const topic = document.getElementById('specific-topic').value;
        const time = document.getElementById('preferred-time').value;
        
        if (!subject || !topic.trim()) {
            TelegramApp.showAlert("እባክዎ ሙሉ መረጃ ያስገቡ።");
            return;
        }

        // ለቴሌግራም ቦት መረጃውን ማስተላለፍ
        const dataPayload = JSON.stringify({
            action: "tutoring_request",
            subject: subject,
            topic: topic,
            preferredTime: time
        });
        
        window.Telegram.WebApp.sendData(dataPayload);
        
        // ቅጹን ማጽዳት እና ማሳወቂያ ማሳየት
        document.getElementById('tutoring-request-form').reset();
        TelegramApp.showAlert("የቱቶሪያል ጥያቄዎ ተቀባይነት አግኝቷል። በቅርቡ እናሳውቅዎታለን።");
        appNavigation.goBack();
    }

    return {
        initializeForms: function() {
            const prayerForm = document.getElementById('prayer-request-form');
            if (prayerForm) {
                prayerForm.addEventListener('submit', handlePrayerRequest);
            }
            
            const tutoringForm = document.getElementById('tutoring-request-form');
            if (tutoringForm) {
                tutoringForm.addEventListener('submit', handleTutoringRequest);
            }
        }
    };
})();

/**
 * ----------------------------------------------------------------------------
 * 5. ዋና ማስጀመሪያ (Main Application Bootstrapper)
 * ----------------------------------------------------------------------------
 */
document.addEventListener("DOMContentLoaded", function() {
    // 1. የቴሌግራም ኤፒአይን ማስጀመር
    TelegramApp.init();
    
    // 2. የተጠቃሚውን መረጃ በይነገጹ ላይ ማሳየት
    UIController.initializeUserData();
    
    // 3. ቅጾችን ለስራ ዝግጁ ማድረግ
    FormManager.initializeForms();
    
    // 4. የቴሌግራም መመለሻ በተን ሲነካ የሚሰራውን ተግባር ማስተሳሰር
    TelegramApp.onBackButtonClicked(function() {
        appNavigation.goBack();
    });
});
