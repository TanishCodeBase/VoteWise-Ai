export function getNextStep(state) {
    if (state === "not_registered") return "register_voter";
    if (state === "register_voter") return "registered";
    if (state === "registered") return "verify_details";
    if (state === "verify_details") return "verified";
    if (state === "verified") return "ready_to_vote";
    if (state === "ready_to_vote") return "vote";
    if (state === "voted") return "view_results";

    return "completed";
}