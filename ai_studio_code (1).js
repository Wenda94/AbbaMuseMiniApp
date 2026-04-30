const tg = window.Telegram.WebApp;
tg.expand();
document.addEventListener("DOMContentLoaded", () => {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById("user-name").innerText = user.first_name + " " + (user.last_name || "");
        document.getElementById("user-id").innerText = "ID: " + user.id;
    }
});
function showPage(page) {
    const container = document.getElementById("page-container");
    const content = document.getElementById("page-content");
    container.classList.remove("hidden");
    if (page === 'library') content.innerHTML = "<h2>📚 የጥናት መርጃዎች</h2><p>ኖቶች በቅርቡ ይጫናሉ።</p>";
    else if (page === 'prayer') content.innerHTML = "<h2>🙏 የምስጢር ሳጥን</h2><textarea style='width:100%; height:100px;'></textarea><br><button class='back-btn'>ላክ</button>";
    else if (page === 'daily') content.innerHTML = "<h2>📖 የዕለት ስንቅ</h2><p><i>'ቅድስና ለወጣቶች የብርታት መንገድ ነውኝ።'</i></p>";
    else if (page === 'tutor') content.innerHTML = "<h2>🎓 ቱቶሪያል</h2><p>የሚፈልጉትን ትምህርት ይግለጹልን።</p>";
}
function hidePage() { document.getElementById("page-container").classList.add("hidden"); }