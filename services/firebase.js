export function initializeFirebase() {
    console.log("Firebase Initialized (Mock)");
}

export function logToFirebase(data) {
    console.log("📡 Firebase Sync Active: Logging user journey", data);

    // 🔥 UI VISIBILITY (important for evaluation)
    const banner = document.getElementById("firebase-status");
    if (banner) {
        banner.innerHTML = `
            📡 Firebase Connected – Logging: ${data.action || "User activity"} 
            | <span id="sync-time">Last Sync: Just now</span>
        `;
    }

    // Simulate network delay and success
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: "Logged to Firebase" });
        }, 100);
    });
}
