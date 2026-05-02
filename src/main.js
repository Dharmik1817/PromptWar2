import mockVoters from './mock_voters.json';
import mockCandidates from './mock_candidates.json';

// --- State Management ---
const state = {
  userProfile: null,
  currentScreen: 'screen-home'
};

// --- DOM Elements ---
const screens = document.querySelectorAll('.screen');
const btnJourneyDemo = document.getElementById('btn-journey-demo');
const btnCandidates = document.getElementById('btn-candidates');
const btnRecovery = document.getElementById('btn-recovery');
const profileForm = document.getElementById('profile-form');
const btnBacks = document.querySelectorAll('.btn-back');

// Scrollytelling Elements
const scrollSteps = document.querySelectorAll('.scroll-step');
const scrollImgs = document.querySelectorAll('.scroll-img');
const mainContent = document.getElementById('main-content');
const journeyDemoSection = document.getElementById('screen-journey-demo');

// Candidates
const candidatesContainer = document.getElementById('candidates-container');

// AI Widget
const aiToggle = document.getElementById('ai-toggle');
const aiChatWindow = document.getElementById('ai-chat-window');
const aiClose = document.getElementById('ai-close');
const chatInput = document.getElementById('chat-input');
const btnSendChat = document.getElementById('btn-send-chat');
const chatMessages = document.getElementById('chat-messages');
const btnUploadDoc = document.getElementById('btn-upload-doc');

// Journey / Map
const roadmapList = document.getElementById('roadmap-list');
const readinessProgress = document.getElementById('readiness-progress');
const readinessStatus = document.getElementById('readiness-status');
const lookupResults = document.getElementById('lookup-results');
const searchEpicForm = document.getElementById('search-epic-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// --- Navigation / Routing ---
function showScreen(screenId) {
  // Handle Scrollytelling Special Case
  if (screenId === 'screen-journey-demo') {
     mainContent.classList.add('hidden');
     journeyDemoSection.classList.remove('hidden');
     journeyDemoSection.classList.add('active');
     window.scrollTo(0, 0); // Start at top of journey
  } else {
     journeyDemoSection.classList.add('hidden');
     journeyDemoSection.classList.remove('active');
     mainContent.classList.remove('hidden');
     
     screens.forEach(s => {
       if(s.id !== 'screen-journey-demo') {
          s.classList.add('hidden');
          s.classList.remove('active');
       }
     });
     
     const target = document.getElementById(screenId);
     if(target) {
       target.classList.remove('hidden');
       target.classList.add('active');
       window.scrollTo(0, 0);
     }
  }
  state.currentScreen = screenId;
}

btnBacks.forEach(btn => {
  btn.addEventListener('click', () => showScreen('screen-home'));
});

// For internal button inside scrollytelling
document.querySelectorAll('.btn-back-internal').forEach(btn => {
  btn.addEventListener('click', () => showScreen('screen-home'));
});

btnRecovery.addEventListener('click', () => showScreen('screen-lookup'));
btnJourneyDemo.addEventListener('click', () => showScreen('screen-journey-demo'));
btnCandidates.addEventListener('click', () => {
   showScreen('screen-candidates');
   renderCandidates();
});

// --- Scrollytelling Engine (Intersection Observer) ---
const scrollOptions = {
  root: null,
  rootMargin: '-30% 0px -30% 0px',
  threshold: 0 // Trigger when it hits the middle 40% of the screen
};

const scrollObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
       entry.target.classList.add('is-visible');
       
       // Change Image
       const stepIndex = entry.target.getAttribute('data-step');
       scrollImgs.forEach(img => img.classList.remove('active'));
       
       if (stepIndex && stepIndex <= 4) {
          const targetImg = document.getElementById(`scroll-img-${stepIndex}`);
          if (targetImg) targetImg.classList.add('active');
       }
    } else {
       // Optional: remove class when scrolling out for re-animation
       entry.target.classList.remove('is-visible');
    }
  });
}, scrollOptions);

scrollSteps.forEach(step => scrollObserver.observe(step));


// --- Profile Form Submission ---
profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  state.userProfile = {
    age: document.getElementById('age').value,
    state: document.getElementById('state').value,
    isFirstTime: document.getElementById('first-time').checked
  };
  generateJourney(state.userProfile);
  showScreen('screen-journey');
});

function generateJourney(profile) {
  roadmapList.innerHTML = '';
  
  const steps = [];
  if (profile.isFirstTime) {
    steps.push({ title: "Register (Form 6)", status: "active" });
    steps.push({ title: "Verify EPIC", status: "pending" });
  } else {
    steps.push({ title: "Check Electoral Roll", status: "completed" });
  }
  steps.push({ title: "Deep Research Candidates", status: "pending" });
  steps.push({ title: "Find Booth", status: "pending" });
  steps.push({ title: "Cast Vote", status: "pending" });

  let completed = 0;
  steps.forEach(step => {
    const li = document.createElement('li');
    li.className = step.status;
    li.innerHTML = `<h4>${step.title}</h4>`;
    roadmapList.appendChild(li);
    if (step.status === 'completed') completed++;
  });

  const progress = (completed / steps.length) * 100;
  readinessProgress.style.width = `${progress}%`;
  
  if (progress === 100) {
     readinessStatus.innerText = "Ready to Vote!";
     readinessStatus.className = "status-text mt-2 green";
  } else {
     readinessStatus.innerText = "Action Required";
     readinessStatus.className = "status-text mt-2 yellow";
  }
}

// --- Deep Candidate Rendering ---
function renderCandidates() {
  candidatesContainer.innerHTML = '';
  mockCandidates.forEach(cand => {
    
    // Build Bullet Lists
    const buildList = (arr) => arr.map(i => `<li>${i}</li>`).join('');
    
    // Build Criminal Records HTML
    let criminalHtml = '';
    const cr = cand.criminalRecords;
    
    if (cr.proved.length > 0) {
       criminalHtml += `<div class="record-item proved">
         <h5><i class="ph ph-warning-circle"></i> Confirmed Convictions</h5>
         <ul class="record-list">${buildList(cr.proved)}</ul>
       </div>`;
    }
    if (cr.pending.length > 0) {
       criminalHtml += `<div class="record-item pending">
         <h5><i class="ph ph-file-text"></i> Pending Charges / FIRs</h5>
         <ul class="record-list">${buildList(cr.pending)}</ul>
       </div>`;
    }
    if (cr.allegations.length > 0) {
       criminalHtml += `<div class="record-item allegations">
         <h5><i class="ph ph-chat-circle"></i> Unproven Allegations</h5>
         <ul class="record-list">${buildList(cr.allegations)}</ul>
       </div>`;
    }
    
    if (!criminalHtml) {
       criminalHtml = `<p style="color: var(--status-green); font-weight: 500;"><i class="ph ph-check-circle"></i> No criminal records or pending FIRs found.</p>`;
    }

    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.innerHTML = `
      <div class="cand-header-area">
         <div class="cand-icon-wrapper"><i class="ph ${cand.symbol}"></i></div>
         <div class="cand-info">
            <h3>${cand.name} <span style="font-size:1rem; color:var(--text-secondary)">(${cand.age})</span></h3>
            <p><span class="badge blue">${cand.party}</span> | ${cand.experience}</p>
            <p class="cand-tagline">"${cand.tagline}"</p>
         </div>
      </div>
      
      <div class="cand-financials">
         <div class="fin-stat">
            <span class="fin-label">Declared Assets</span>
            <span class="fin-val" style="color: var(--status-green)">${cand.assets}</span>
         </div>
         <div class="fin-stat">
            <span class="fin-label">Liabilities</span>
            <span class="fin-val" style="color: var(--status-red)">${cand.liabilities}</span>
         </div>
      </div>

      <div class="cand-details-grid">
         <div class="cand-section manifesto">
            <h4><i class="ph ph-list-checks"></i> Manifesto Pledges</h4>
            <ul class="bullet-list">${buildList(cand.manifesto)}</ul>
         </div>
         <div class="cand-section past">
            <h4><i class="ph ph-clock-counter-clockwise"></i> Past Record</h4>
            <ul class="bullet-list">${buildList(cand.pastWork)}</ul>
         </div>
      </div>
      
      <div style="padding: 0 var(--spacing-lg) var(--spacing-lg);">
         <h4 style="margin-top: 1rem;"><i class="ph ph-gavel"></i> Criminal & Legal Records</h4>
         <div class="criminal-records-box">
            ${criminalHtml}
         </div>
      </div>
    `;
    candidatesContainer.appendChild(card);
  });
}

// --- Tabs & Lookup Simulation ---
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.remove('hidden');
    lookupResults.classList.add('hidden');
  });
});

searchEpicForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const epic = document.getElementById('epic-number').value.trim().toUpperCase();
  const found = mockVoters.find(v => v.epic === epic);
  displayLookupResult(found);
});

function displayLookupResult(voter) {
  lookupResults.classList.remove('hidden');
  if (voter) {
    lookupResults.innerHTML = `
      <h3>Voter Match Found</h3>
      <div class="mt-2" style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px;">
        <p><strong>Name:</strong> ${voter.name}</p>
        <p><strong>EPIC No:</strong> ${voter.epic}</p>
        <p><strong>Serial No:</strong> <span class="badge blue">${voter.serialNumber}</span></p>
        <hr style="margin: 1rem 0; border-color: rgba(255,255,255,0.05)">
        <p><strong>Polling Booth:</strong> ${voter.boothName}</p>
        <button id="btn-navigate" class="btn-primary mt-4 w-full"><i class="ph ph-map-pin"></i> View Route Simulation</button>
      </div>
    `;
    document.getElementById('btn-navigate').addEventListener('click', () => {
       document.getElementById('booth-name').innerText = voter.boothName;
       document.getElementById('booth-address').innerText = voter.boothAddress;
       showScreen('screen-map');
    });
  } else {
    lookupResults.innerHTML = `
      <h3 style="color:var(--status-red)"><i class="ph ph-warning-circle"></i> Details Not Found</h3>
      <p>We couldn't find a match in the simulated database. Please try ABC1234567.</p>
    `;
  }
}

// --- AI Chat Logic ---
aiToggle.addEventListener('click', () => {
  aiChatWindow.classList.remove('hidden');
  aiToggle.classList.add('hidden');
});

aiClose.addEventListener('click', () => {
  aiChatWindow.classList.add('hidden');
  aiToggle.classList.remove('hidden');
});

function addChatMessage(msg, sender) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerText = msg;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

btnSendChat.addEventListener('click', handleChat);
chatInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') handleChat();
});

function handleChat() {
  const text = chatInput.value.trim();
  if(!text) return;
  addChatMessage(text, 'user');
  chatInput.value = '';
  
  setTimeout(() => {
     let response = "I'm VoteWise AI. Since this is a demo, I'm simulating responses based on your interactions!";
     if(text.toLowerCase().includes('document')) {
        response = "Please click the camera icon. You can upload your Aadhaar Card or Voter ID and I will check its validity without saving your data.";
     } else if (text.toLowerCase().includes('criminal')) {
        response = "In the Candidate Dossiers, RED indicates proven convictions by a court, ORANGE indicates pending FIRs, and YELLOW indicates unproven allegations.";
     }
     addChatMessage(response, 'ai');
  }, 800);
}

btnUploadDoc.addEventListener('click', () => {
  addChatMessage("Mock Document Upload triggered. Analyzing...", 'ai');
  setTimeout(() => {
     addChatMessage("✅ Analysis complete. Valid Aadhaar Card detected. Identity confirmed. No PII has been stored.", 'ai');
  }, 2000);
});
