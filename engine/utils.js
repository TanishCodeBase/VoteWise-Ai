export function validateUserState(state) {
    const validStates = ["not_registered", "register_voter", "registered", "verify_details", "verified", "ready_to_vote", "vote", "view_results", "completed", "voting_completed"];
    return validStates.includes(state);
}

export function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}
