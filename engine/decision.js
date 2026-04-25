import { getNextStep } from './flow.js';
import { validateUserState } from './utils.js';

export function getDecision(userState) {
    if (!validateUserState(userState)) {
        return {
            nextStep: 'error',
            explanation: 'Invalid state provided.',
            timeline: 'unknown'
        };
    }

    const nextStep = getNextStep(userState);
    let explanation = '';
    let timeline = '';
    let confidence = 0.95; // Default high confidence for rule-based flow

    switch (nextStep) {
        case "register_voter":
            explanation = "Based on your current state (Not Registered), this is the required next step. You must register to vote to participate in the election.";
            timeline = "registration";
            confidence = 0.99;
            break;
        case "verify_details":
            explanation = "Based on your registered status, the next critical step is ensuring your details are correct on the electoral roll.";
            timeline = "campaign";
            confidence = 0.90;
            break;
        case "ready_to_vote":
            explanation = "Your details are fully verified. This is the final step; get ready for election day!";
            timeline = "voting";
            confidence = 0.98;
            break;
        case "vote":
            explanation = "It is Election Day! Please proceed to your designated polling station to cast your vote.";
            timeline = "voting";
            confidence = 0.99;
            break;
        case "view_results":
            explanation = "The voting phase has concluded. You can now view the election results.";
            timeline = "results";
            confidence = 0.95;
            break;
        case "completed":
            explanation = "You have completed the entire voting process. No further actions are required.";
            timeline = "results";
            confidence = 1.0;
            break;
        case "registered":
            explanation = "You have successfully submitted registration details. Verification is pending.";
            timeline = "registration";
            confidence = 0.85;
            break;
        case "verified":
             explanation = "Your details have been successfully verified by the authorities.";
             timeline = "campaign";
             confidence = 0.92;
             break;
        default:
            explanation = "Unknown step. Unable to determine the precise next action.";
            timeline = "unknown";
            confidence = 0.40;
    }

    return {
        nextStep,
        explanation,
        timeline,
        confidence
    };
}
