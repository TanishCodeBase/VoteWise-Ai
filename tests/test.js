import { getNextStep } from '../engine/flow.js';
import { validateUserState, sanitize } from '../engine/utils.js';
import { getDecision } from '../engine/decision.js';
console.log("TEST FILE LOADED");

export function runTests() {

    const health = document.getElementById("system-health");

    if (health) {
        health.innerHTML = "🧠 System Health: Checking...";
    }
    console.log("runTests started");

    const status = document.getElementById("test-results");

    if (status) {
        status.innerHTML = "🧪 Running system diagnostics<span id='dots'>.</span>";
    }

    let dotInterval = null;

    if (status) {
        dotInterval = setInterval(() => {
            const dots = document.getElementById("dots");
            if (dots) {
                dots.textContent =
                    dots.textContent.length >= 3 ? "." : dots.textContent + ".";
            }
        }, 500);
    }

    let passed = 0;
    let failed = 0;
    let logs = [];

    function test(condition, message) {
        if (condition) {
            passed++;
            logs.push(`✔ ${message}`);
        } else {
            failed++;
            logs.push(`❌ ${message}`);
        }
    }

    // ---------------- TESTS ----------------

    // getNextStep
    test(getNextStep("not_registered") === "register_voter", "Flow: not_registered → register_voter");
    test(getNextStep("register_voter") === "registered", "Flow: register_voter → registered");
    test(getNextStep("registered") === "verify_details", "Flow: registered → verify_details");
    test(getNextStep("verify_details") === "verified", "Flow: verify_details → verified");
    test(getNextStep("verified") === "ready_to_vote", "Flow: verified → ready_to_vote");
    test(getNextStep("ready_to_vote") === "vote", "Flow: ready_to_vote → vote");
    test(getNextStep("unknown") === "completed", "Edge: unknown → completed");

    // validateUserState
    test(validateUserState("not_registered") === true, "Valid state accepted");
    test(validateUserState("invalid_state") === false, "Invalid state rejected");

    // sanitize
    test(
        sanitize("<script>alert('xss')</script>") === "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;",
        "Sanitize prevents XSS"
    );

    // getDecision
    const decision = getDecision("not_registered");
    test(decision.nextStep === "register_voter", "Decision engine next step correct");
    test(decision.timeline === "registration", "Decision timeline correct");

    // ---------------- RESULT ----------------

    console.log("Tests:", { passed, failed });

    if (status) {
        setTimeout(() => {

            // stop animation
            if (dotInterval) {
                clearInterval(dotInterval);
            }

            // update health badge
            if (health) {
                if (failed === 0) {
                    health.innerHTML = "🧠 System Health: 100% ✔";
                } else {
                    const percent = Math.round((passed / (passed + failed)) * 100);
                    health.innerHTML = `🧠 System Health: ${percent}% ⚠`;
                }
            }

            // update test results
            status.innerHTML = `
                <strong>${failed === 0 ? "✅ All Tests Passed" : "⚠️ Some Tests Failed"}</strong><br>
                Passed: ${passed} | Failed: ${failed}<br><br>
                ${logs.join("<br>")}
            `;

        }, 1000);
    }
}

runTests();

export function generateDecision(state) {
    const nextStep = getNextStep(state);

    return {
        nextStep,
        explanation: `You are currently in '${state}' stage. The next step is '${nextStep}'.`,
        confidence: nextStep === "completed" ? 1.0 : 0.92
    };
}