import { getDecision } from './engine/decision.js';
import { sanitize } from './engine/utils.js';
import { electionSteps } from './config/steps.js';
import { initializeFirebase, logToFirebase } from './services/firebase.js';
import './tests/test.js';
import { runTests } from './tests/test.js';

class App {
    constructor() {
        this.currentState = '';
        this.currentDecision = null;

        // DOM Elements
        this.stateSelect = document.getElementById('user-state');
        this.stepList = document.getElementById('step-list');
        this.aiResponseContainer = document.getElementById('ai-response');
        this.actionArea = document.getElementById('action-area');
        this.timelineSteps = document.querySelectorAll('.timeline-step');
        this.firebaseStatus = document.getElementById('firebase-status');
        this.syncTimeElement = document.getElementById('sync-time');
        this.lastSyncTime = Date.now();

        this.init();
    }

    init() {
        initializeFirebase();
        this.renderStepList();
        setInterval(() => this.updateSyncTimer(), 1000);
    }

    renderStepList() {
        // Clear current list safely
        this.stepList.innerHTML = '';

        for (const [key, value] of Object.entries(electionSteps)) {
            const li = document.createElement('li');
            li.dataset.step = key;
            // Use textContent to prevent XSS
            li.textContent = `${value.title} - ${value.description}`;
            this.stepList.appendChild(li);
        }
    }

    updateSyncTimer() {
        if (!this.syncTimeElement) return;
        const secondsAgo = Math.floor((Date.now() - this.lastSyncTime) / 1000);
        this.syncTimeElement.textContent = `Last Sync: ${secondsAgo} sec ago`;
    }

    triggerFirebaseSync(actionData) {
        logToFirebase(actionData).then(() => {
            this.lastSyncTime = Date.now();
            this.updateSyncTimer();
        });
    }

    handleStateChange() {
        // Sanitize the input state just in case
        this.currentState = sanitize(this.stateSelect.value);

        if (!this.currentState) return;

        // Get AI Decision
        this.currentDecision = getDecision(this.currentState);

        this.updateUI();

        // Log state change
        this.triggerFirebaseSync({
            action: "state_changed",
            state: this.currentState,
            timestamp: new Date().toISOString()
        });

        // Log decision generation separately
        this.triggerFirebaseSync({
            action: "decision_generated",
            decision: this.currentDecision,
            timestamp: new Date().toISOString()
        });

        logToFirebase({
            action: `User moved to step: ${this.currentDecision.nextStep}`,
            timestamp: Date.now()
        });
        runTests();
    }

    updateUI() {
        if (!this.currentDecision) return;

        // 1. Update AI Assistant Response using safe methods
        this.aiResponseContainer.replaceChildren();

        const stepLabels = {
            register_voter: "Register Voter",
            registered: "Registered",
            verify_details: "Verify Details",
            verified: "Verified",
            ready_to_vote: "Ready to Vote",
            vote: "Voting Day",
            view_results: "Election Results",
            completed: "Process Completed"
        };

        console.log("NEXT STEP:", this.currentDecision.nextStep);
        const stepTitle = stepLabels[this.currentDecision.nextStep] || "Process Completed";

        let explanationText = this.currentDecision.explanation;

        if (this.currentDecision.nextStep === "completed") {
            explanationText = "You have successfully completed the entire election process.";
        }

        const h3 = document.createElement('h3');
        h3.textContent = `Next Step: ${stepTitle}`;

        const p = document.createElement('p');
        p.textContent = explanationText;

        this.aiResponseContainer.appendChild(h3);
        this.aiResponseContainer.appendChild(p);

        const conf = document.createElement('p');
        const confStrong = document.createElement('strong');
        confStrong.textContent = `🧠 AI Confidence: ${(this.currentDecision.confidence * 100).toFixed(0)}%`;
        conf.appendChild(confStrong);
        conf.style.color = 'var(--success)';
        conf.style.marginTop = '0.5rem';

        this.aiResponseContainer.appendChild(h3);
        this.aiResponseContainer.appendChild(p);
        this.aiResponseContainer.appendChild(conf);

        // 2. Show Action Area if appropriate
        if (this.currentDecision.nextStep !== 'error' && this.currentDecision.nextStep !== 'completed' && this.currentDecision.nextStep !== 'completed') {
            this.actionArea.classList.remove('hidden');
        } else {
            this.actionArea.classList.add('hidden');
        }

        // 3. Highlight Step List
        const listItems = this.stepList.querySelectorAll('li');
        listItems.forEach(li => {
            if (li.dataset.step === this.currentState) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });

        // 4. Update Timeline
        this.timelineSteps.forEach(step => {
            if (step.dataset.phase === this.currentDecision.timeline) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    proceedToNextStep() {
        if (this.currentDecision && this.currentDecision.nextStep) {
            this.triggerFirebaseSync({
                action: "proceed_clicked",
                from_state: this.currentState,
                to_step: this.currentDecision.nextStep
            });

            // Update state dropdown and trigger change
            const optionExists = Array.from(this.stateSelect.options).some(opt => opt.value === this.currentDecision.nextStep);

            if (optionExists) {
                this.stateSelect.value = this.currentDecision.nextStep;
                this.handleStateChange();
            } else {
                // For steps like register_voter that aren't in the initial dropdown
                this.currentState = this.currentDecision.nextStep;
                this.currentDecision = getDecision(this.currentState);
                this.updateUI();
            }
        }
        runTests();
    }
}

// Attach to window so HTML inline handlers can access it
window.app = new App();
