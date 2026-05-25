// AWPL Agent PWA - Main Logic
// Manages app state, authentication, routing, downline network tree, affiliate tracking, simulations, canvas flyers, and local storage persistence

// --- Default Initial State ---
const DEFAULT_STATE = {
  isAuthenticated: false,
  currentTab: 'dashboard',
  agent: {
    id: "AWPL99827",
    name: "Ramesh Kumar",
    rank: "Emerald Director",
    phone: "+91 98765 43210",
    personalSp: 120,
    leftSp: 42500,
    rightSp: 38200,
    totalEarnings: 154280.00,
    weeklyCommission: 12850.00,
    photo: null
  },
  network: {
    id: "AWPL99827",
    name: "Ramesh Kumar",
    rank: "Emerald Director",
    sp: 120,
    status: "active",
    side: "root",
    left: {
      id: "AWPL77162",
      name: "Sanjay Sharma",
      rank: "Gold Director",
      sp: 80,
      status: "active",
      side: "left",
      left: {
        id: "AWPL88301",
        name: "Vijay Singh",
        rank: "Bronze Director",
        sp: 50,
        status: "active",
        side: "left",
        left: null,
        right: null
      },
      right: {
        id: "AWPL88492",
        name: "Amit Patel",
        rank: "Distributor",
        sp: 12,
        status: "inactive",
        side: "right",
        left: null,
        right: null
      }
    },
    right: {
      id: "AWPL77902",
      name: "Priya Patel",
      rank: "Silver Director",
      sp: 100,
      status: "active",
      side: "right",
      left: {
        id: "AWPL88931",
        name: "Neha Gupta",
        rank: "Distributor",
        sp: 25,
        status: "active",
        side: "left",
        left: null,
        right: null
      },
      right: {
        id: "AWPL88102",
        name: "Rajesh Sen",
        rank: "Distributor",
        sp: 0,
        status: "blocked",
        side: "right",
        left: null,
        right: null
      }
    }
  },
  affiliate: {
    clicks: 148,
    leads: 24,
    sales: 11,
    conversionRate: 7.4,
    totalCommission: 24890.00,
    logs: [
      { id: 1, name: "Anonymous", product: "DIABODOC RAS", source: "WhatsApp", type: "click", time: "2 mins ago" },
      { id: 2, name: "Harish Gupta", product: "IMMUNODOC RAS", source: "WhatsApp", type: "sale", amount: 1789.00, commission: 250.00, time: "15 mins ago" },
      { id: 3, name: "Anonymous", product: "EXE PANCH TULSI OIL", source: "Facebook", type: "click", time: "1 hour ago" },
      { id: 4, name: "Kiran Dev", product: "ORTHODOC PRAVAHI KWATH", source: "Instagram", type: "lead", email: "kiran@gmail.com", time: "2 hours ago" },
      { id: 5, name: "Anonymous", product: "THUNDERBLAST RAS", source: "Telegram", type: "click", time: "4 hours ago" },
      { id: 6, name: "Sunita Roy", product: "GYNEDOC RAS", source: "WhatsApp", type: "sale", amount: 1244.00, commission: 180.00, time: "1 day ago" }
    ]
  },
  crm: {
    activeSubtab: "links",
    contacts: [
      { id: "C1", name: "Harish Gupta", phone: "+91 98123 45678", segment: "retail", notes: "Bought Immunodoc Ras for health reasons.", status: "customer", agentId: null },
      { id: "C2", name: "Kiran Dev", phone: "+91 95432 10987", segment: "business", notes: "Interested in the matching bonus and income plan.", status: "prospect", agentId: null },
      { id: "C3", name: "Sunita Roy", phone: "+91 91234 56789", segment: "retail", notes: "Prefers Ayurvedic supplements for digestion.", status: "customer", agentId: null }
    ],
    purchases: [
      { id: "P1", contactId: "C1", productId: "immunodoc-ras", purchaseDate: Date.now() - 5 * 24 * 60 * 60 * 1000, supplyDays: 30 },
      { id: "P2", contactId: "C3", productId: "gynedoc-ras", purchaseDate: Date.now() - 25 * 24 * 60 * 60 * 1000, supplyDays: 30 }
    ],
    reminders: [
      { id: "R1", contactId: "C1", productId: "immunodoc-ras", purchaseDate: Date.now() - 5 * 24 * 60 * 60 * 1000, status: "pending", simulatedDay25: false },
      { id: "R2", contactId: "C3", productId: "gynedoc-ras", purchaseDate: Date.now() - 25 * 24 * 60 * 60 * 1000, status: "pending", simulatedDay25: true }
    ]
  },
  activeBannerProductId: "exe-panch-tulsi-oil",
  selectedProduct: null,
  pendingPlacement: null,
  pendingRecruitContactId: null,
  registeredAgents: [], // Database of registered sellers
  customProducts: []
};

// Global State
let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

const STORAGE_KEY = "awpl_agent_pwa_state_v1";

// --- Local Storage Helpers ---
function loadState() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      state = JSON.parse(data);
      if (!state.currentTab) state.currentTab = 'dashboard';
      if (!state.customProducts) {
        state.customProducts = [];
      }
      if (!state.activeBannerProductId) state.activeBannerProductId = getActiveProducts()[0].id;
      if (!state.crm) {
        state.crm = JSON.parse(JSON.stringify(DEFAULT_STATE.crm));
      }
      if (state.pendingRecruitContactId === undefined) {
        state.pendingRecruitContactId = null;
      }
      if (state.agent && state.agent.photo === undefined) {
        state.agent.photo = null;
      }
      if (!state.registeredAgents || state.registeredAgents.length === 0) {
        initDefaultRegisteredAgents();
      }
      return true;
    } catch (e) {
      console.error("Failed to parse storage, loading defaults", e);
    }
  }
  
  // No data exists, initialize defaults
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  initDefaultRegisteredAgents();
  saveState();
  return false;
}

function initDefaultRegisteredAgents() {
  state.registeredAgents = [
    {
      id: "AWPL99827",
      name: "Ramesh Kumar",
      rank: "Emerald Director",
      phone: "+91 98765 43210",
      personalSp: 120,
      leftSp: 42500,
      rightSp: 38200,
      totalEarnings: 154280.00,
      weeklyCommission: 12850.00,
      password: "admin123",
      photo: null,
      network: JSON.parse(JSON.stringify(DEFAULT_STATE.network)),
      affiliate: JSON.parse(JSON.stringify(DEFAULT_STATE.affiliate)),
      crm: JSON.parse(JSON.stringify(DEFAULT_STATE.crm))
    }
  ];
}

function saveState() {
  // Sync the current active agent details back into the registered database
  if (state.isAuthenticated && state.agent) {
    const idx = state.registeredAgents.findIndex(a => a.id === state.agent.id);
    if (idx !== -1) {
      state.registeredAgents[idx] = {
        ...state.registeredAgents[idx], // maintain password
        ...state.agent,
        network: state.network,
        affiliate: state.affiliate,
        crm: state.crm
      };
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveProducts() {
  return [...AWPL_PRODUCTS, ...(state.customProducts || [])];
}

function getActiveBannerProduct() {
  return getActiveProducts().find(p => p.id === state.activeBannerProductId) || getActiveProducts()[0];
}

// --- Custom Toast Alert System ---
function showToast(message, type = 'success') {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.position = "absolute";
    container.style.top = "70px";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.zIndex = "200";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    container.style.width = "calc(100% - 32px)";
    container.style.maxWidth = "398px";
    document.querySelector(".app-wrapper").appendChild(container);
  }
  
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.style.background = "rgba(13, 20, 38, 0.95)";
  toast.style.backdropFilter = "blur(12px)";
  toast.style.border = `1px solid ${type === 'success' ? 'var(--primary)' : 'var(--accent-gold)'}`;
  toast.style.borderRadius = "12px";
  toast.style.padding = "12px 16px";
  toast.style.fontSize = "12px";
  toast.style.color = "#fff";
  toast.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "10px";
  toast.style.animation = "toastIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards";
  
  const icon = type === 'success' ? '⚡' : '🔔';
  toast.innerHTML = `
    <span style="font-size:14px">${icon}</span>
    <span style="flex:1; font-weight:500">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// --- Initializer ---
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initAuthFlow();
  initRouter();
  updateAuthUI();
  setupResetHook();
  initProfileUpdate();
  initCustomProductFeature();
});

// --- Authentication Login/Signup Flow ---
function initAuthFlow() {
  const authTabBtns = document.querySelectorAll(".auth-tab-btn");
  const authForms = document.querySelectorAll(".auth-form");

  // Auth Tab Switcher
  authTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      authTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetForm = btn.getAttribute("data-form");
      authForms.forEach(f => {
        f.classList.remove("active");
        if (f.id === `${targetForm}Form`) {
          f.classList.add("active");
        }
      });
    });
  });

  // Login Submit Handler
  document.getElementById("btnSubmitLogin").addEventListener("click", () => {
    const idVal = document.getElementById("loginId").value.trim().toUpperCase();
    const passVal = document.getElementById("loginPass").value;

    if (!idVal || !passVal) {
      showToast("Please enter both ID and Password", "error");
      return;
    }

    // Find agent in registered database
    const matchingAgent = state.registeredAgents.find(a => a.id.toUpperCase() === idVal);
    
    if (matchingAgent) {
      if (matchingAgent.password === passVal) {
        // Authenticate agent
        state.isAuthenticated = true;
        
        // Copy to active agent slot
        state.agent = {
          id: matchingAgent.id,
          name: matchingAgent.name,
          rank: matchingAgent.rank,
          phone: matchingAgent.phone,
          personalSp: matchingAgent.personalSp,
          leftSp: matchingAgent.leftSp,
          rightSp: matchingAgent.rightSp,
          totalEarnings: matchingAgent.totalEarnings,
          weeklyCommission: matchingAgent.weeklyCommission,
          photo: matchingAgent.photo || null
        };
        state.network = matchingAgent.network;
        state.affiliate = matchingAgent.affiliate;
        
        saveState();
        updateAuthUI();
        showToast(`Welcome back, ${state.agent.name}!`);
      } else {
        showToast("Incorrect password. Please try again.", "error");
      }
    } else {
      showToast("AWPL ID not registered. Try the demo ID: AWPL99827", "error");
    }
  });

  // Signup Submit Handler
  document.getElementById("btnSubmitSignup").addEventListener("click", () => {
    const nameVal = document.getElementById("signupName").value.trim();
    const phoneVal = document.getElementById("signupPhone").value.trim();
    const sponsorVal = document.getElementById("signupSponsor").value.trim().toUpperCase();
    const sideVal = document.getElementById("signupSide").value;
    const passVal = document.getElementById("signupPass").value;

    if (!nameVal || !phoneVal || !passVal) {
      showToast("Please fill Name, Phone, and Password", "error");
      return;
    }

    // Generate New unique AWPL ID
    const randId = "AWPL" + Math.floor(20000 + Math.random() * 79000);
    
    // Create new network tree structure
    const newNetwork = {
      id: randId,
      name: nameVal,
      rank: "Distributor",
      sp: 0,
      status: "active",
      side: "root",
      left: null,
      right: null
    };

    // Create New Agent
    const newAgent = {
      id: randId,
      name: nameVal,
      rank: "Distributor",
      phone: phoneVal,
      personalSp: 0,
      leftSp: 0,
      rightSp: 0,
      totalEarnings: 0,
      weeklyCommission: 0,
      password: passVal,
      photo: null,
      network: newNetwork,
      affiliate: {
        clicks: 0,
        leads: 0,
        sales: 0,
        conversionRate: 0,
        totalCommission: 0,
        logs: []
      }
    };

    // Placement logic in Sponsor network (if sponsor ID exists in system)
    if (sponsorVal) {
      const sponsorAgent = state.registeredAgents.find(a => a.id.toUpperCase() === sponsorVal);
      if (sponsorAgent) {
        // Place new user as downline under sponsor's visual tree
        const placed = findNodeAndInsert(sponsorAgent.network, sponsorAgent.id, sideVal, {
          id: randId,
          name: nameVal,
          rank: "Distributor",
          sp: 0,
          status: "active",
          side: sideVal,
          left: null,
          right: null
        });

        if (placed) {
          // Add placement side volume to sponsor
          if (sideVal === 'left') sponsorAgent.leftSp += 0; // Starts at 0 SP
          else sponsorAgent.rightSp += 0;
        }
      } else {
        showToast("Sponsor ID not found. Registered as independent root.", "info");
      }
    }

    // Save to database list
    state.registeredAgents.push(newAgent);
    
    // Set as active
    state.isAuthenticated = true;
    state.agent = {
      id: newAgent.id,
      name: newAgent.name,
      rank: newAgent.rank,
      phone: newAgent.phone,
      personalSp: newAgent.personalSp,
      leftSp: newAgent.leftSp,
      rightSp: newAgent.rightSp,
      totalEarnings: newAgent.totalEarnings,
      weeklyCommission: newAgent.weeklyCommission,
      photo: null
    };
    state.network = newNetwork;
    state.affiliate = newAgent.affiliate;

    saveState();
    updateAuthUI();
    showToast(`Account Created! Your ID is ${randId}`);
  });

  // Logout Click Handler
  document.getElementById("btnLogout").addEventListener("click", () => {
    state.isAuthenticated = false;
    saveState();
    updateAuthUI();
    showToast("Logged out successfully.", "info");
  });

  // Forgot Password click
  document.getElementById("linkForgotPass").addEventListener("click", () => {
    showAuthForm("forgot");
  });

  document.getElementById("linkBackToLoginFromForgot").addEventListener("click", () => {
    showAuthForm("login");
  });

  document.getElementById("linkBackToLoginFromReset").addEventListener("click", () => {
    showAuthForm("login");
  });

  // Request Reset OTP Submit Handler
  document.getElementById("btnSubmitForgot").addEventListener("click", () => {
    const idVal = document.getElementById("forgotAgentId").value.trim().toUpperCase();
    if (!idVal) {
      showToast("Please enter your Agent ID", "error");
      return;
    }

    const matchingAgent = state.registeredAgents.find(a => a.id.toUpperCase() === idVal);
    if (matchingAgent) {
      document.getElementById("resetAgentId").value = matchingAgent.id;
      document.getElementById("resetNewPass").value = '';
      showAuthForm("reset");
      showToast("Verification code generated: 1234 (Simulated OTP)", "info");
    } else {
      showToast("AWPL ID not registered in local database", "error");
    }
  });

  // Save New Password Submit Handler
  document.getElementById("btnSubmitReset").addEventListener("click", () => {
    const idVal = document.getElementById("resetAgentId").value;
    const otpVal = document.getElementById("resetOtp").value.trim();
    const newPassVal = document.getElementById("resetNewPass").value;

    if (!otpVal || !newPassVal) {
      showToast("Please enter both the OTP and new password", "error");
      return;
    }

    if (otpVal !== "1234") {
      showToast("Invalid verification code (must be 1234)", "error");
      return;
    }

    const idx = state.registeredAgents.findIndex(a => a.id === idVal);
    if (idx !== -1) {
      state.registeredAgents[idx].password = newPassVal;
      saveState();
      showToast("Password updated successfully! Please log in.");
      showAuthForm("login");
    } else {
      showToast("An error occurred during reset.", "error");
    }
  });
}

function showAuthForm(formName) {
  const forms = document.querySelectorAll(".auth-form");
  const tabs = document.querySelector(".auth-tabs");
  
  // Hide all forms
  forms.forEach(f => f.classList.remove("active"));
  
  // Show target form
  const target = document.getElementById(`${formName}Form`);
  if (target) target.classList.add("active");
  
  // Manage tabs visibility
  if (formName === 'forgot' || formName === 'reset') {
    tabs.style.display = "none";
  } else {
    tabs.style.display = "flex";
  }
}

function updateAuthUI() {
  const authOverlay = document.getElementById("authOverlay");
  const mainAppShell = document.getElementById("mainAppShell");

  if (state.isAuthenticated) {
    authOverlay.style.display = "none";
    mainAppShell.style.display = "flex";
    
    // Initialize Dashboard UI components
    initDashboard();
    initNetworkTree();
    initAffiliateTracker();
    initCatalog();
    initMarketingHub();
    initCrm();
    
    // Switch to Dashboard Tab by default
    document.querySelector(".nav-item[data-tab='dashboard']").click();
  } else {
    authOverlay.style.display = "flex";
    mainAppShell.style.display = "none";
  }
}

// --- Simple SPA Router ---
function initRouter() {
  const navItems = document.querySelectorAll(".nav-item");
  const tabViews = document.querySelectorAll(".tab-view");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      if (!state.isAuthenticated) return;
      
      const targetTab = item.getAttribute("data-tab");
      state.currentTab = targetTab;
      
      // Update active nav button
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");
      
      // Update active view
      tabViews.forEach(view => {
        view.classList.remove("active");
        if (view.id === `${targetTab}View`) {
          view.classList.add("active");
        }
      });

      // Triggers on view change
      if (targetTab === 'network') {
        renderNetworkTree(state.network);
        updateRecruitmentBanner();
      } else if (targetTab === 'marketing') {
        renderBannerCanvas();
      } else if (targetTab === 'affiliate') {
        if (state.crm && state.crm.activeSubtab === 'crm') {
          switchSubTab('crm');
        } else {
          switchSubTab('links');
        }
      }
    });
  });
}

// --- Dashboard Screen ---
function initDashboard() {
  if (!state.agent) return;
  document.getElementById("agentName").innerText = state.agent.name;
  document.getElementById("agentRank").innerText = state.agent.rank;
  document.getElementById("agentId").innerText = `ID: ${state.agent.id}`;
  document.getElementById("personalSp").innerText = `${state.agent.personalSp} SP`;
  document.getElementById("leftSp").innerText = `${state.agent.leftSp.toLocaleString()} SP`;
  document.getElementById("rightSp").innerText = `${state.agent.rightSp.toLocaleString()} SP`;
  document.getElementById("weeklyCommission").innerText = `₹${state.agent.weeklyCommission.toLocaleString()}`;
  document.getElementById("totalEarnings").innerText = `₹${state.agent.totalEarnings.toLocaleString()}`;
  
  // Set avatar initials or image
  const avatarDiv = document.getElementById("agentAvatar");
  if (state.agent.photo) {
    avatarDiv.innerHTML = `<img src="${state.agent.photo}" style="width: 100%; height: 100%; object-fit: cover;">`;
  } else {
    const initials = state.agent.name.split(" ").map(n => n[0]).join("").toUpperCase();
    avatarDiv.innerText = initials.substring(0, 2);
  }
}

// --- Network Downline Tree ---
function initNetworkTree() {
  // Zoom and pan buttons
  document.getElementById("btnZoomIn").addEventListener("click", () => {
    const svg = document.getElementById("downlineSvg");
    svg.style.transform = svg.style.transform === "" ? "scale(1.15)" : `scale(${parseFloat(svg.style.transform.replace("scale(", "").replace(")", "")) * 1.15})`;
  });

  document.getElementById("btnZoomOut").addEventListener("click", () => {
    const svg = document.getElementById("downlineSvg");
    svg.style.transform = svg.style.transform === "" ? "scale(0.85)" : `scale(${parseFloat(svg.style.transform.replace("scale(", "").replace(")", "")) * 0.85})`;
  });

  document.getElementById("btnZoomReset").addEventListener("click", () => {
    document.getElementById("downlineSvg").style.transform = "scale(1)";
  });

  // Close Detail Drawer
  document.getElementById("closeDrawerBtn").addEventListener("click", () => {
    document.getElementById("detailDrawer").classList.remove("open");
  });

  // Add Member Modal cancel button
  document.getElementById("closeAddMemberBtn").addEventListener("click", () => {
    document.getElementById("addMemberModal").classList.remove("open");
  });

  // Add Member Submit
  document.getElementById("btnSubmitAddMember").addEventListener("click", () => {
    submitAddMember();
  });
}

function renderNetworkTree(rootNode) {
  const svg = document.getElementById("downlineSvg");
  svg.innerHTML = ''; // Clear SVG
  
  const nodes = [];
  const links = [];
  
  function traverse(node, depth, x, y, parentX, parentY) {
    if (!node) return;
    
    if (parentX !== undefined) {
      links.push({ x1: parentX, y1: parentY, x2: x, y2: y, side: node.side, placeholder: false });
    }
    
    nodes.push({ x, y, data: node, placeholder: false });
    
    const nextDepthY = y + 90;
    const horizontalSpread = 160 / Math.pow(2, depth);
    
    if (depth < 2) {
      // Left side slot
      if (node.left) {
        traverse(node.left, depth + 1, x - horizontalSpread, nextDepthY, x, y);
      } else {
        nodes.push({ x: x - horizontalSpread, y: nextDepthY, placeholder: true, parentId: node.id, parentName: node.name, side: "left" });
        links.push({ x1: x, y1: y, x2: x - horizontalSpread, y2: nextDepthY, side: "left", placeholder: true });
      }
      
      // Right side slot
      if (node.right) {
        traverse(node.right, depth + 1, x + horizontalSpread, nextDepthY, x, y);
      } else {
        nodes.push({ x: x + horizontalSpread, y: nextDepthY, placeholder: true, parentId: node.id, parentName: node.name, side: "right" });
        links.push({ x1: x, y1: y, x2: x + horizontalSpread, y2: nextDepthY, side: "right", placeholder: true });
      }
    }
  }
  
  traverse(rootNode, 0, 200, 40);
  
  // Render Links
  links.forEach(l => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const dx = l.x2 - l.x1;
    const dy = l.y2 - l.y1;
    const d = `M ${l.x1} ${l.y1} C ${l.x1} ${l.y1 + dy/2}, ${l.x2} ${l.y2 - dy/2}, ${l.x2} ${l.y2}`;
    
    path.setAttribute("d", d);
    if (l.placeholder) {
      path.setAttribute("class", "tree-link placeholder-link");
    } else {
      path.setAttribute("class", `tree-link active-link`);
      path.style.stroke = l.side === 'left' ? "var(--accent-blue)" : "var(--accent-purple)";
    }
    svg.appendChild(path);
  });
  
  // Render Nodes
  nodes.forEach(n => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "tree-node-group");
    group.style.cursor = "pointer";
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", n.x);
    circle.setAttribute("cy", n.y);
    circle.setAttribute("r", 20);
    
    if (n.placeholder) {
      circle.setAttribute("class", "tree-node-circle placeholder-slot");
      
      const textPlus = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textPlus.setAttribute("x", n.x);
      textPlus.setAttribute("y", n.y + 4);
      textPlus.setAttribute("class", "node-label");
      textPlus.setAttribute("fill", "var(--text-muted)");
      textPlus.textContent = "+";
      
      const textVacant = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textVacant.setAttribute("x", n.x);
      textVacant.setAttribute("y", n.y + 32);
      textVacant.setAttribute("class", "node-sublabel");
      textVacant.textContent = "VACANT";
      
      group.appendChild(circle);
      group.appendChild(textPlus);
      group.appendChild(textVacant);
      
      group.addEventListener("click", () => {
        openAddMemberModal(n.parentId, n.parentName, n.side);
      });
      
    } else {
      let statusClass = "tree-node-circle";
      if (n.data.status === 'inactive') statusClass += " inactive";
      if (n.data.id === state.agent.id) statusClass += " active-node";
      circle.setAttribute("class", statusClass);
      
      if (n.data.status === 'active' && n.data.id !== state.agent.id) {
        circle.style.stroke = n.data.side === 'left' ? "var(--accent-blue)" : "var(--accent-purple)";
      } else if (n.data.status === 'blocked') {
        circle.style.stroke = "#ef4444";
      }
      
      const textInitials = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textInitials.setAttribute("x", n.x);
      textInitials.setAttribute("y", n.y + 4);
      textInitials.setAttribute("class", "node-label");
      const names = n.data.name.split(" ");
      const initials = names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
      textInitials.textContent = initials.toUpperCase();
      
      const textName = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textName.setAttribute("x", n.x);
      textName.setAttribute("y", n.y + 32);
      textName.setAttribute("class", "node-sublabel");
      textName.textContent = n.data.name;
      
      const textRank = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textRank.setAttribute("x", n.x);
      textRank.setAttribute("y", n.y + 42);
      textRank.setAttribute("class", "node-sublabel");
      textRank.setAttribute("fill", "var(--accent-gold)");
      textRank.textContent = `${n.data.sp} SP`;
      
      group.appendChild(circle);
      group.appendChild(textInitials);
      group.appendChild(textName);
      group.appendChild(textRank);
      
      group.addEventListener("click", () => {
        openDetailDrawer(n.data);
      });
    }
    
    svg.appendChild(group);
  });
}

function openAddMemberModal(parentId, parentName, side) {
  state.pendingPlacement = { parentId, side };
  
  const modal = document.getElementById("addMemberModal");
  document.getElementById("placementTargetText").innerText = `Under: ${parentName} (${side.toUpperCase()} Side)`;
  
  const nameInput = document.getElementById("newMemberName");
  if (state.pendingRecruitContactId) {
    const contact = state.crm.contacts.find(c => c.id === state.pendingRecruitContactId);
    if (contact) {
      nameInput.value = contact.name;
      nameInput.readOnly = true;
    } else {
      nameInput.value = '';
      nameInput.readOnly = false;
    }
  } else {
    nameInput.value = '';
    nameInput.readOnly = false;
  }
  
  document.getElementById("newMemberSp").value = '50';
  document.getElementById("newMemberRank").value = 'Distributor';
  
  modal.classList.add("open");
}

function submitAddMember() {
  const name = document.getElementById("newMemberName").value.trim();
  const rank = document.getElementById("newMemberRank").value;
  const sp = parseInt(document.getElementById("newMemberSp").value) || 0;
  
  if (!name) {
    showToast("Please enter a valid member name", "error");
    return;
  }
  
  const parentId = state.pendingPlacement.parentId;
  const side = state.pendingPlacement.side;
  
  const randId = "AWPL" + Math.floor(10000 + Math.random() * 90000);
  
  const newNode = {
    id: randId,
    name: name,
    rank: rank,
    sp: sp,
    status: "active",
    side: side,
    left: null,
    right: null
  };
  
  const inserted = findNodeAndInsert(state.network, parentId, side, newNode);
  
  if (inserted) {
    let pathSide = side;
    if (parentId !== state.agent.id) {
      pathSide = findPathSide(state.network, parentId);
    }
    
    if (pathSide === 'left') {
      state.agent.leftSp += sp;
    } else if (pathSide === 'right') {
      state.agent.rightSp += sp;
    }
    
    // CRM recruitment pipeline linkage
    if (state.pendingRecruitContactId) {
      const contact = state.crm.contacts.find(c => c.id === state.pendingRecruitContactId);
      if (contact) {
        contact.status = "agent";
        contact.agentId = randId;
        showToast(`Recruited ${contact.name} as an active downline agent!`);
      }
      state.pendingRecruitContactId = null;
      updateRecruitmentBanner();
    }
    
    saveState();
    initDashboard();
    renderNetworkTree(state.network);
    
    document.getElementById("addMemberModal").classList.remove("open");
    showToast(`Placed ${name} (${randId}) successfully! Added ${sp} SP to your upline.`);
  } else {
    showToast("Error locating parent placement path", "error");
  }
}

function findNodeAndInsert(currentNode, parentId, side, newNode) {
  if (!currentNode) return false;
  
  if (currentNode.id === parentId) {
    if (side === 'left') {
      currentNode.left = newNode;
    } else {
      currentNode.right = newNode;
    }
    return true;
  }
  
  if (findNodeAndInsert(currentNode.left, parentId, side, newNode)) return true;
  if (findNodeAndInsert(currentNode.right, parentId, side, newNode)) return true;
  
  return false;
}

function findPathSide(currentNode, targetId) {
  if (checkNodeExists(currentNode.left, targetId)) return 'left';
  if (checkNodeExists(currentNode.right, targetId)) return 'right';
  return 'left';
}

function checkNodeExists(node, targetId) {
  if (!node) return false;
  if (node.id === targetId) return true;
  return checkNodeExists(node.left, targetId) || checkNodeExists(node.right, targetId);
}

// --- Affiliate Link Generator ---
function initAffiliateTracker() {
  const productSelect = document.getElementById("affProductSelect");
  productSelect.innerHTML = '';
  
  getActiveProducts().forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.innerText = `${p.name} (₹${p.dp})`;
    productSelect.appendChild(opt);
  });
  
  document.getElementById("btnGenLink").addEventListener("click", () => {
    const prodId = productSelect.value;
    const utmSource = document.getElementById("utmSource").value;
    const customPrice = document.getElementById("customPriceCheckbox").checked;
    
    const selectedProd = getActiveProducts().find(p => p.id === prodId);
    if (!selectedProd) return;
    
    const baseUrl = `https://asclepiuswellness.com/product/${selectedProd.id}`;
    const affUrl = `${baseUrl}?ref=${state.agent.id}&utm=${utmSource}${customPrice ? '&promo=dp' : ''}`;
    
    document.getElementById("linkOutputBox").style.display = "flex";
    document.getElementById("generatedUrlText").innerText = affUrl;
    
    const testBtn = document.getElementById("btnSimulateClick");
    testBtn.style.display = "block";
  });
  
  document.getElementById("btnCopyLink").addEventListener("click", () => {
    const urlText = document.getElementById("generatedUrlText").innerText;
    navigator.clipboard.writeText(urlText).then(() => {
      showToast("Affiliate tracking link copied!");
    }).catch(err => {
      showToast("Link copied to clipboard.");
    });
  });

  document.getElementById("btnSimulateClick").addEventListener("click", () => {
    simulateManualLinkClick();
  });
  
  renderAffiliateStats();
  renderAffiliateLogs();
}

function simulateManualLinkClick() {
  const prodId = document.getElementById("affProductSelect").value;
  const utmSource = document.getElementById("utmSource").value;
  const p = getActiveProducts().find(x => x.id === prodId);
  if (!p) return;
  
  state.affiliate.clicks += 1;
  showToast("⚡ Customer clicked your shared link!");
  
  const newLog = {
    id: state.affiliate.logs.length + 1,
    name: "Anonymous",
    product: p.name,
    source: utmSource.toUpperCase(),
    type: "click",
    time: "Just now"
  };
  state.affiliate.logs.unshift(newLog);
  
  setTimeout(() => {
    if (Math.random() < 0.50) {
      state.affiliate.leads += 1;
      newLog.type = "lead";
      const names = ["Anil Verma", "Karan Johar", "Preeti Sharma", "Suraj Bhan", "Manish Paul"];
      const leadName = names[Math.floor(Math.random() * names.length)];
      newLog.name = leadName;
      newLog.email = `${leadName.toLowerCase().replace(" ", "")}@gmail.com`;
      
      showToast(`📝 ${leadName} converted to a Lead (filled inquiry form)!`, "info");
      
      // Register Lead in CRM
      let contact = state.crm.contacts.find(c => c.name.toLowerCase() === leadName.toLowerCase());
      if (!contact) {
        const contactId = "C" + Math.floor(10000 + Math.random() * 90000);
        contact = {
          id: contactId,
          name: leadName,
          phone: "+91 9" + Math.floor(100000000 + Math.random() * 900000000),
          segment: Math.random() < 0.5 ? "retail" : "business",
          notes: `Lead from affiliate link via ${utmSource.toUpperCase()}`,
          status: "prospect",
          agentId: null
        };
        state.crm.contacts.push(contact);
      }
      
      if (state.currentTab === 'affiliate' && state.crm.activeSubtab === 'crm') {
        renderCrmContacts();
      }
      
      setTimeout(() => {
        if (Math.random() < 0.40) {
          state.affiliate.sales += 1;
          newLog.type = "sale";
          newLog.amount = p.dp;
          
          const commission = Math.round(p.dp * 0.15);
          newLog.commission = commission;
          
          state.affiliate.totalCommission += commission;
          state.agent.totalEarnings += commission;
          state.agent.weeklyCommission += commission;
          
          const side = Math.random() < 0.5 ? 'left' : 'right';
          if (side === 'left') state.agent.leftSp += p.sp;
          else state.agent.rightSp += p.sp;
          
          showToast(`💰 ORDER PLACED! Customer bought ${p.name}. Earned ₹${commission} and +${p.sp} SP!`);
          
          // Promote CRM status to Customer & Add Purchase Record
          if (contact) {
            contact.status = "customer";
            addPurchaseRecord(contact.id, p.id);
          }
          
          state.affiliate.conversionRate = parseFloat(((state.affiliate.sales / state.affiliate.clicks) * 100).toFixed(1));
          
          saveState();
          initDashboard();
          renderAffiliateStats();
          renderAffiliateLogs();
          
          if (state.currentTab === 'affiliate' && state.crm.activeSubtab === 'crm') {
            renderCrmContacts();
            renderCrmReminders();
          }
        } else {
          saveState();
          initDashboard();
          renderAffiliateStats();
          renderAffiliateLogs();
        }
      }, 1500);
      
    } else {
      saveState();
      initDashboard();
      renderAffiliateStats();
      renderAffiliateLogs();
    }
  }, 1000);
}

function renderAffiliateStats() {
  document.getElementById("affClicks").innerText = state.affiliate.clicks;
  document.getElementById("affLeads").innerText = state.affiliate.leads;
  document.getElementById("affSales").innerText = state.affiliate.sales;
  document.getElementById("affConvRate").innerText = `${state.affiliate.conversionRate}%`;
  document.getElementById("affEarnings").innerText = `₹${state.affiliate.totalCommission.toLocaleString()}`;
}

function renderAffiliateLogs() {
  const logContainer = document.getElementById("logContainer");
  logContainer.innerHTML = '';
  
  state.affiliate.logs.forEach(log => {
    const item = document.createElement("div");
    item.className = "log-item";
    
    let typeBadge = '';
    if (log.type === 'click') {
      typeBadge = `<span class="badge badge-blue">Click</span>`;
    } else if (log.type === 'lead') {
      typeBadge = `<span class="badge badge-gold">Lead</span>`;
    } else {
      typeBadge = `<span class="badge badge-primary">Sale</span>`;
    }
    
    let detailText = log.source;
    if (log.type === 'sale') {
      detailText = `Earned ₹${log.commission}`;
    } else if (log.type === 'lead') {
      detailText = log.email;
    }
    
    item.innerHTML = `
      <div class="log-left">
        <h4>${log.name} - ${log.product}</h4>
        <p>${detailText}</p>
      </div>
      <div class="log-right">
        ${typeBadge}
        <div class="log-time">${log.time}</div>
      </div>
    `;
    logContainer.appendChild(item);
  });
}

// --- Product Catalog Screen ---
function initCatalog() {
  const searchInput = document.getElementById("productSearch");
  
  renderProductGrid(getActiveProducts());
  
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = getActiveProducts().filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.benefits.toLowerCase().includes(query)
    );
    renderProductGrid(filtered);
  });
  
  document.getElementById("closeModalBtn").addEventListener("click", () => {
    document.getElementById("productModal").classList.remove("open");
  });

  document.getElementById("btnSimulatePersonalBuy").addEventListener("click", () => {
    simulatePersonalPurchase();
  });
  
  document.getElementById("btnSimulateCustomerBuy").addEventListener("click", () => {
    simulateCustomerPurchase();
  });
}

function renderProductGrid(productsList) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = '';
  
  productsList.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-img-wrapper">
        <img class="product-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/category/2B.jpeg'">
        <span class="product-badge-sp">+${p.sp} SP</span>
      </div>
      <div class="product-details">
        <h3 class="product-name">${p.name}</h3>
        <div class="product-pricing">
          <span class="pricing-dp">₹${p.dp}</span>
          <span class="pricing-mrp">₹${p.mrp}</span>
        </div>
        <button class="product-card-btn">Share & Promote</button>
      </div>
    `;
    
    card.addEventListener("click", (e) => {
      if (e.target.tagName !== 'BUTTON') {
        openProductModal(p);
      }
    });
    
    card.querySelector(".product-card-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openAffiliateGeneratorTab(p);
    });
    
    grid.appendChild(card);
  });
}

function openProductModal(product) {
  state.selectedProduct = product;
  
  const modal = document.getElementById("productModal");
  document.getElementById("modalProdName").innerText = product.name;
  document.getElementById("modalProdImg").src = product.image;
  document.getElementById("modalProdSize").innerText = `Size: ${product.size}`;
  document.getElementById("modalProdSp").innerText = `Sales Points: ${product.sp} SP`;
  document.getElementById("modalProdDp").innerText = `Distributor Price (DP): ₹${product.dp}`;
  document.getElementById("modalProdMrp").innerText = `MRP: ₹${product.mrp}`;
  document.getElementById("modalProdBenefits").innerText = product.benefits;
  
  modal.classList.add("open");
}

function simulatePersonalPurchase() {
  const p = state.selectedProduct;
  if (!p) return;
  
  state.agent.personalSp += p.sp;
  saveState();
  initDashboard();
  
  document.getElementById("productModal").classList.remove("open");
  showToast(`Personal order processed! Added +${p.sp} SP to your Personal Volume.`);
}

function simulateCustomerPurchase() {
  const p = state.selectedProduct;
  if (!p) return;
  
  const side = Math.random() < 0.5 ? 'left' : 'right';
  const commission = Math.round(p.dp * 0.15);
  
  if (side === 'left') {
    state.agent.leftSp += p.sp;
  } else {
    state.agent.rightSp += p.sp;
  }
  
  state.affiliate.clicks += 1;
  state.affiliate.leads += 1;
  state.affiliate.sales += 1;
  state.affiliate.totalCommission += commission;
  state.agent.totalEarnings += commission;
  state.agent.weeklyCommission += commission;
  
  const names = ["Aakash Jain", "Meena Sharma", "Sonal Kapoor", "Devendra Yadav", "Kavita Pal"];
  let custName = names[Math.floor(Math.random() * names.length)];
  let pendingContactId = state.pendingSaleContactId;
  
  if (pendingContactId) {
    const pContact = state.crm.contacts.find(c => c.id === pendingContactId);
    if (pContact) {
      custName = pContact.name;
    }
    state.pendingSaleContactId = null;
  }
  
  const newLog = {
    id: state.affiliate.logs.length + 1,
    name: custName,
    product: p.name,
    source: "SHOP SIMULATION",
    type: "sale",
    amount: p.dp,
    commission: commission,
    time: "Just now"
  };
  state.affiliate.logs.unshift(newLog);
  
  // Register in CRM
  let contact = state.crm.contacts.find(c => c.name.toLowerCase() === custName.toLowerCase());
  if (!contact) {
    const contactId = "C" + Math.floor(10000 + Math.random() * 90000);
    contact = {
      id: contactId,
      name: custName,
      phone: "+91 9" + Math.floor(100000000 + Math.random() * 900000000),
      segment: "retail",
      notes: `Bought ${p.name} via shop simulation`,
      status: "customer",
      agentId: null
    };
    state.crm.contacts.push(contact);
  } else {
    contact.status = "customer";
    if (pendingContactId) {
      contact.notes += `; Bought ${p.name} manually`;
    }
  }
  
  addPurchaseRecord(contact.id, p.id);
  
  state.affiliate.conversionRate = parseFloat(((state.affiliate.sales / state.affiliate.clicks) * 100).toFixed(1));
  
  saveState();
  initDashboard();
  renderAffiliateStats();
  renderAffiliateLogs();
  
  // Refresh CRM list if visible
  if (state.currentTab === 'affiliate' && state.crm.activeSubtab === 'crm') {
    renderCrmContacts();
    renderCrmReminders();
  }
  
  document.getElementById("productModal").classList.remove("open");
  showToast(`Simulated customer purchase! Earned ₹${commission} commission & added +${p.sp} SP to your ${side.toUpperCase()} team.`);
}

function openAffiliateGeneratorTab(product) {
  document.getElementById("productModal").classList.remove("open");
  document.querySelector(".nav-item[data-tab='affiliate']").click();
  document.getElementById("affProductSelect").value = product.id;
  document.getElementById("btnGenLink").click();
}

// --- Marketing Hub (Canvas Customizer) ---
function initMarketingHub() {
  const canvas = document.getElementById("bannerCanvas");
  canvas.width = 800;
  canvas.height = 800;
  
  const customSelect = document.getElementById("canvasProductSelect");
  customSelect.innerHTML = '';
  
  getActiveProducts().forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.innerText = p.name;
    customSelect.appendChild(opt);
  });
  
  customSelect.value = state.activeBannerProductId;
  
  customSelect.addEventListener("change", (e) => {
    selectProductForBanner(e.target.value);
  });
  document.getElementById("canvasAgentName").addEventListener("input", renderBannerCanvas);
  document.getElementById("canvasAgentPhone").addEventListener("input", renderBannerCanvas);
  document.getElementById("canvasShowPrice").addEventListener("change", renderBannerCanvas);
  
  // Customizer extensions
  document.getElementById("canvasThemeSelect").addEventListener("change", renderBannerCanvas);
  document.getElementById("canvasBadgeText").addEventListener("input", renderBannerCanvas);
  document.getElementById("canvasShowQr").addEventListener("change", renderBannerCanvas);
  
  document.getElementById("btnDownloadBanner").addEventListener("click", () => {
    const link = document.createElement('a');
    link.download = `${state.activeBannerProductId}-seller-promotion.png`;
    link.href = canvas.toDataURL();
    link.click();
    showToast("Promo flyer downloaded successfully!");
  });
  
  document.getElementById("btnShareWa").addEventListener("click", () => shareToPlatform('whatsapp'));
  document.getElementById("btnShareFb").addEventListener("click", () => shareToPlatform('facebook'));
  document.getElementById("btnShareIg").addEventListener("click", () => shareToPlatform('instagram'));
  document.getElementById("btnShareTg").addEventListener("click", () => shareToPlatform('telegram'));
}

function selectProductForBanner(productId) {
  state.activeBannerProductId = productId;
  saveState();
  
  const customSelect = document.getElementById("canvasProductSelect");
  if (customSelect) {
    customSelect.value = productId;
  }
  
  renderBannerCanvas();
}

function renderBannerCanvas() {
  const canvas = document.getElementById("bannerCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  const p = getActiveBannerProduct();
  if (!p) return;
  
  const themeVal = document.getElementById("canvasThemeSelect") ? document.getElementById("canvasThemeSelect").value : "orange";
  const gradient = ctx.createRadialGradient(400, 400, 50, 400, 400, 500);
  
  let accentColor = "#ff5722";
  let borderStroke = "rgba(255, 87, 34, 0.18)";
  
  if (themeVal === "gold") {
    gradient.addColorStop(0, '#2d230f');
    gradient.addColorStop(1, '#0e0b04');
    accentColor = "#d4af37";
    borderStroke = "rgba(212, 175, 55, 0.18)";
  } else if (themeVal === "blue") {
    gradient.addColorStop(0, '#0a2340');
    gradient.addColorStop(1, '#020b14');
    accentColor = "#3b82f6";
    borderStroke = "rgba(59, 130, 246, 0.18)";
  } else if (themeVal === "green") {
    gradient.addColorStop(0, '#06301f');
    gradient.addColorStop(1, '#010f0a');
    accentColor = "#10b981";
    borderStroke = "rgba(16, 185, 129, 0.18)";
  } else {
    gradient.addColorStop(0, '#2d1108');
    gradient.addColorStop(1, '#0f0502');
    accentColor = "#ff5722";
    borderStroke = "rgba(255, 87, 34, 0.18)";
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 800);

  ctx.fillStyle = "#ffffff";
  ctx.font = "italic 20px Inter";
  ctx.textAlign = "center";
  ctx.fillText("Loading flyer assets...", 400, 400);
  
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = `https://images.weserv.nl/?url=${encodeURIComponent(p.image)}`;
  
  img.onload = () => {
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);
    
    ctx.strokeStyle = borderStroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(400, 400, 360, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(400, 400, 385, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.font = "bold 20px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("ASCLEPIUS WELLNESS PRIVATE LIMITED", 400, 60);
    
    ctx.drawImage(img, 200, 150, 400, 400);
    drawBannerDetails(ctx, p, accentColor);
  };
  
  img.onerror = () => {
    const backupImg = new Image();
    backupImg.crossOrigin = "anonymous";
    backupImg.src = `https://images.weserv.nl/?url=${encodeURIComponent("https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/category/2B.jpeg")}`;
    backupImg.onload = () => {
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 800);
      
      ctx.strokeStyle = borderStroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(400, 400, 360, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(400, 400, 385, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = accentColor;
      ctx.font = "bold 20px Poppins";
      ctx.textAlign = "center";
      ctx.fillText("ASCLEPIUS WELLNESS PRIVATE LIMITED", 400, 60);

      ctx.drawImage(backupImg, 220, 170, 360, 360);
      drawBannerDetails(ctx, p, accentColor);
    };
  };
}

function drawBannerDetails(ctx, p, accentColor) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Poppins";
  ctx.textAlign = "center";
  ctx.fillText(p.name, 400, 600);
  
  ctx.fillStyle = "#9ca3af";
  ctx.font = "16px Inter";
  ctx.fillText(`Ayurvedic Wellness Product • ${p.size}`, 400, 632);
  
  const showPrice = document.getElementById("canvasShowPrice").checked;
  if (showPrice) {
    ctx.fillStyle = accentColor;
    ctx.font = "800 32px Poppins";
    ctx.fillText(`₹${p.dp}`, 400, 682);
    
    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px Inter";
    ctx.fillText(`MRP ₹${p.mrp}`, 400, 712);
  }
  
  ctx.fillStyle = "rgba(17, 24, 43, 0.9)";
  ctx.fillRect(0, 740, 800, 60);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px Inter";
  ctx.textAlign = "left";
  
  const customAgentName = document.getElementById("canvasAgentName").value || state.agent.name;
  const customAgentPhone = document.getElementById("canvasAgentPhone").value || state.agent.phone;
  
  ctx.fillText(`Authorized Seller: ${customAgentName} (${state.agent.rank})`, 40, 775);
  
  ctx.textAlign = "right";
  ctx.fillStyle = accentColor;
  ctx.fillText(`📞 Direct Call: ${customAgentPhone}`, 760, 775);

  function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  const badgeInput = document.getElementById("canvasBadgeText");
  const badgeText = badgeInput ? badgeInput.value.trim().toUpperCase() : "";
  if (badgeText) {
    drawRoundedRect(ctx, 510, 110, 200, 42, 21, accentColor);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Poppins";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, 610, 131);
    ctx.textBaseline = "alphabetic";
  }

  const showQrInput = document.getElementById("canvasShowQr");
  const showQr = showQrInput ? showQrInput.checked : false;
  if (showQr) {
    drawRoundedRect(ctx, 650, 595, 110, 110, 12, "#ffffff");
    ctx.fillStyle = "#111827";
    ctx.fillRect(660, 605, 26, 26);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(663, 608, 20, 20);
    ctx.fillStyle = "#111827";
    ctx.fillRect(666, 611, 14, 14);
    
    ctx.fillRect(724, 605, 26, 26);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(727, 608, 20, 20);
    ctx.fillStyle = "#111827";
    ctx.fillRect(730, 611, 14, 14);
    
    ctx.fillRect(660, 669, 26, 26);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(663, 672, 20, 20);
    ctx.fillStyle = "#111827";
    ctx.fillRect(666, 675, 14, 14);
    
    ctx.fillStyle = accentColor;
    const qrPixels = [
      [2, 0], [3, 0], [4, 0], [5, 0],
      [0, 2], [1, 2], [5, 2], [6, 2],
      [0, 3], [3, 3], [4, 3], [6, 3],
      [0, 4], [1, 4], [2, 4], [4, 4], [5, 4],
      [2, 5], [3, 5], [6, 5],
      [2, 6], [3, 6], [4, 6], [5, 6]
    ];
    qrPixels.forEach(([px, py]) => {
      ctx.fillRect(660 + px * 9, 605 + py * 9, 9, 9);
    });
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px Inter";
    ctx.textAlign = "center";
    ctx.fillText("SCAN TO ORDER", 705, 725);
  }
}

// --- Data Reset Hook ---
function setupResetHook() {
  document.getElementById("btnResetAllData").addEventListener("click", () => {
    if (confirm("Reset database state and log out?")) {
      localStorage.removeItem(STORAGE_KEY);
      loadState();
      updateAuthUI();
      showToast("Database reset successful!", "info");
    }
  });
}

// --- Background Simulated Activity ---
function setupSimulation() {
  const products = getActiveProducts();
  const sources = ["WhatsApp", "Instagram", "Facebook", "Telegram"];
  const names = ["Rohan Roy", "Amit Verma", "Lalita Devi", "Karan Johar", "Preeti Sharma", "Suraj Bhan", "Manish Paul"];
  
  setInterval(() => {
    if (!state.isAuthenticated) return;
    
    if (Math.random() < 0.35) {
      const p = products[Math.floor(Math.random() * products.length)];
      const src = sources[Math.floor(Math.random() * sources.length)];
      
      state.affiliate.clicks += 1;
      
      const newLog = {
        id: state.affiliate.logs.length + 1,
        name: "Anonymous",
        product: p.name,
        source: src,
        type: "click",
        time: "Just now"
      };
      
      state.affiliate.logs.forEach(log => {
        if (log.time === "Just now") log.time = "1 min ago";
        else if (log.time === "1 min ago") log.time = "3 mins ago";
      });
      
      state.affiliate.logs.unshift(newLog);
      if (state.affiliate.logs.length > 20) state.affiliate.logs.pop();
      
      if (Math.random() < 0.15) {
        state.affiliate.leads += 1;
        newLog.type = "lead";
        const lName = names[Math.floor(Math.random() * names.length)];
        newLog.name = lName;
        newLog.email = `${lName.toLowerCase().replace(" ", "")}@gmail.com`;
        
        // Add Lead to CRM
        let contact = state.crm.contacts.find(c => c.name.toLowerCase() === lName.toLowerCase());
        if (!contact) {
          const contactId = "C" + Math.floor(10000 + Math.random() * 90000);
          contact = {
            id: contactId,
            name: lName,
            phone: "+91 9" + Math.floor(100000000 + Math.random() * 900000000),
            segment: Math.random() < 0.5 ? "retail" : "business",
            notes: `Lead from auto-simulation via ${src.toUpperCase()}`,
            status: "prospect",
            agentId: null
          };
          state.crm.contacts.push(contact);
        }
        
        if (Math.random() < 0.4) {
          state.affiliate.sales += 1;
          newLog.type = "sale";
          newLog.amount = p.dp;
          
          const commission = Math.round(p.dp * 0.15);
          newLog.commission = commission;
          state.affiliate.totalCommission += commission;
          state.agent.totalEarnings += commission;
          state.agent.weeklyCommission += commission;
          
          const side = Math.random() < 0.5 ? 'left' : 'right';
          if (side === 'left') state.agent.leftSp += p.sp;
          else state.agent.rightSp += p.sp;
          
          // Sale in CRM
          if (contact) {
            contact.status = "customer";
            addPurchaseRecord(contact.id, p.id);
          }
        }
      }
      
      state.affiliate.conversionRate = parseFloat(((state.affiliate.sales / state.affiliate.clicks) * 100).toFixed(1));
      
      saveState();
      
      if (state.currentTab === 'dashboard') {
        initDashboard();
      } else if (state.currentTab === 'affiliate') {
        renderAffiliateStats();
        renderAffiliateLogs();
        if (state.crm && state.crm.activeSubtab === 'crm') {
          renderCrmContacts();
          renderCrmReminders();
        }
      }
    }
  }, 14000);
}

// --- Social CRM Sub-tabs & Event Logic ---
let isCrmInitialized = false;

function switchSubTab(subtab) {
  state.crm.activeSubtab = subtab;
  saveState();
  
  const linksBtn = document.getElementById("subTabLinksBtn");
  const crmBtn = document.getElementById("subTabCrmBtn");
  const linksContent = document.getElementById("subtab-links-content");
  const crmContent = document.getElementById("subtab-crm-content");
  
  if (!linksBtn || !crmBtn || !linksContent || !crmContent) return;
  
  if (subtab === 'links') {
    linksBtn.classList.add("active");
    crmBtn.classList.remove("active");
    linksContent.classList.add("active");
    crmContent.classList.remove("active");
  } else {
    linksBtn.classList.remove("active");
    crmBtn.classList.add("active");
    linksContent.classList.remove("active");
    crmContent.classList.add("active");
    
    // Render lists on switch
    renderCrmContacts();
    renderCrmReminders();
  }
}

function initCrm() {
  if (isCrmInitialized) return;
  isCrmInitialized = true;
  
  // Add Contact Click
  document.getElementById("btnAddCrmContact").addEventListener("click", () => {
    addCrmContact();
  });
  
  // Filter & Search bindings
  document.getElementById("crmContactFilter").addEventListener("change", () => {
    renderCrmContacts();
  });
  document.getElementById("crmContactSearch").addEventListener("input", () => {
    renderCrmContacts();
  });
  
  // WhatsApp Modal bindings
  document.getElementById("closeWhatsappModalBtn").addEventListener("click", () => {
    document.getElementById("whatsappModal").classList.remove("open");
  });
  
  document.getElementById("btnSendWaTrigger").addEventListener("click", () => {
    sendWhatsappReal();
  });
  
  // Cancel Recruitment button
  document.getElementById("btnCancelRecruitPlacement").addEventListener("click", () => {
    cancelRecruitPlacement();
  });
  
  // Notifications Button click in header
  document.getElementById("btnNotifications").addEventListener("click", () => {
    document.getElementById("notificationsModal").classList.add("open");
    renderNotifications();
  });
  
  document.getElementById("closeNotificationsModalBtn").addEventListener("click", () => {
    document.getElementById("notificationsModal").classList.remove("open");
  });
  
  updateNotificationDot();
  updateRecruitmentBanner();
  setupSimulation();
}

function addCrmContact() {
  const nameVal = document.getElementById("crmContactName").value.trim();
  const phoneVal = document.getElementById("crmContactPhone").value.trim();
  const segmentVal = document.getElementById("crmContactSegment").value;
  const notesVal = document.getElementById("crmContactNotes").value.trim();
  
  if (!nameVal || !phoneVal) {
    showToast("Please enter a name and phone number", "error");
    return;
  }
  
  const newContactId = "C" + Math.floor(10000 + Math.random() * 90000);
  const newContact = {
    id: newContactId,
    name: nameVal,
    phone: phoneVal,
    segment: segmentVal,
    notes: notesVal || "Manual CRM Contact Added",
    status: segmentVal === 'retail' ? 'customer' : 'prospect',
    agentId: null
  };
  
  state.crm.contacts.unshift(newContact);
  saveState();
  
  // Reset inputs
  document.getElementById("crmContactName").value = '';
  document.getElementById("crmContactPhone").value = '';
  document.getElementById("crmContactNotes").value = '';
  
  renderCrmContacts();
  showToast(`Contact "${nameVal}" added successfully!`);
}

function renderCrmContacts() {
  const container = document.getElementById("crmContactsList");
  if (!container) return;
  
  container.innerHTML = '';
  
  const searchVal = document.getElementById("crmContactSearch").value.toLowerCase();
  const filterVal = document.getElementById("crmContactFilter").value;
  
  const filtered = state.crm.contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchVal) || c.phone.includes(searchVal);
    
    let matchesFilter = true;
    if (filterVal === 'retail') {
      matchesFilter = (c.segment === 'retail' && c.status !== 'agent');
    } else if (filterVal === 'business') {
      matchesFilter = (c.segment === 'business' && c.status !== 'agent');
    } else if (filterVal === 'agent') {
      matchesFilter = (c.status === 'agent');
    }
    
    return matchesSearch && matchesFilter;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); text-align:center; padding: 20px 0;">No contacts match search criteria.</div>`;
    return;
  }
  
  filtered.forEach(c => {
    const card = document.createElement("div");
    card.className = "crm-contact-card";
    
    let badgeHtml = '';
    let actionBtnHtml = '';
    
    if (c.status === 'agent') {
      badgeHtml = `<span class="badge tag-pill agent">Agent (ID: ${c.agentId})</span>`;
      actionBtnHtml = `<button class="crm-action-btn agent-placed-btn" disabled>Placed in Network</button>`;
    } else if (c.segment === 'business') {
      badgeHtml = `<span class="badge badge-purple" style="background: rgba(139, 92, 246, 0.15); color: var(--accent-purple); border: 1px solid rgba(139, 92, 246, 0.25);">Business Prospect</span>`;
      actionBtnHtml = `<button class="crm-action-btn recruit-btn" onclick="initiateRecruitPlacement('${c.id}')">Recruit as Agent</button>`;
    } else {
      badgeHtml = `<span class="badge badge-blue">Retail Customer</span>`;
      actionBtnHtml = `<button class="crm-action-btn recruit-btn" onclick="initiateRecruitPlacement('${c.id}')" style="border-color: rgba(59, 130, 246, 0.4); color: #60a5fa;">Place as Agent</button>`;
    }
    
    card.innerHTML = `
      <div class="crm-contact-header">
        <div>
          <div class="crm-contact-name">${c.name}</div>
          <div class="crm-contact-phone">📞 ${c.phone}</div>
        </div>
        ${badgeHtml}
      </div>
      <div class="crm-contact-notes">
        <strong>Notes:</strong> ${c.notes}
      </div>
      <div class="crm-contact-actions">
        <button class="crm-action-btn" onclick="simulateManualSaleForCrmContact('${c.id}')">🛒 Buy Product</button>
        ${actionBtnHtml}
      </div>
    `;
    
    container.appendChild(card);
  });
}

function simulateManualSaleForCrmContact(contactId) {
  const contact = state.crm.contacts.find(c => c.id === contactId);
  if (!contact) return;
  
  // Redirect to catalog view
  document.querySelector(".nav-item[data-tab='catalog']").click();
  showToast(`Select an Ayurvedic supplement for ${contact.name}`);
  
  // Set temporary global helper to bind this purchase
  state.pendingSaleContactId = contactId;
}

function addPurchaseRecord(contactId, productId, daysAgo = 0) {
  const p = getActiveProducts().find(prod => prod.id === productId);
  if (!p) return;
  
  const purchaseTime = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
  
  const purchase = {
    id: "P" + Math.floor(10000 + Math.random() * 90000),
    contactId: contactId,
    productId: productId,
    purchaseDate: purchaseTime,
    supplyDays: p.supplyDays || 30
  };
  
  state.crm.purchases.push(purchase);
  
  // Calculate reminder date (Day 25)
  const reminderTime = purchaseTime + 25 * 24 * 60 * 60 * 1000;
  
  // Remove existing pending reminders for this contact/product combo to prevent duplication
  state.crm.reminders = state.crm.reminders.filter(r => !(r.contactId === contactId && r.productId === productId && r.status === 'pending'));
  
  const reminder = {
    id: "R" + Math.floor(10000 + Math.random() * 90000),
    contactId: contactId,
    productId: productId,
    purchaseDate: purchaseTime,
    reminderDate: reminderTime,
    status: "pending",
    simulatedDay25: daysAgo >= 25
  };
  
  state.crm.reminders.unshift(reminder);
  saveState();
  updateNotificationDot();
}

function renderCrmReminders() {
  const container = document.getElementById("crmRemindersList");
  if (!container) return;
  
  container.innerHTML = '';
  
  const activeReminders = state.crm.reminders;
  
  if (activeReminders.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); text-align:center; padding: 20px 0;">No active repurchase reminders.</div>`;
    return;
  }
  
  activeReminders.forEach(r => {
    const contact = state.crm.contacts.find(c => c.id === r.contactId);
    const product = getActiveProducts().find(p => p.id === r.productId);
    
    if (!contact || !product) return;
    
    // Calculate elapsed time
    const elapsedMs = Date.now() - r.purchaseDate;
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    
    const isTriggered = (elapsedDays >= 25 || r.simulatedDay25);
    const daysRemaining = Math.max(0, 25 - elapsedDays);
    const progressPercent = Math.min(100, Math.round(((r.simulatedDay25 ? 25 : elapsedDays) / 25) * 100));
    
    const card = document.createElement("div");
    card.className = "reminder-card";
    if (isTriggered && r.status === 'pending') {
      card.style.borderColor = "#ef4444";
      card.style.background = "rgba(239, 68, 68, 0.03)";
    }
    
    let badgeHtml = '';
    let actionBtnHtml = '';
    
    if (r.status === 'sent') {
      badgeHtml = `<span class="reminder-badge-days" style="background: rgba(255, 87, 34, 0.15); color: var(--primary); border: 1px solid rgba(255, 87, 34, 0.25);">SENT</span>`;
      actionBtnHtml = `<span style="font-size:10px; color:var(--primary); font-weight:600; display:flex; align-items:center; gap:4px;">✓ Shared on WA</span>`;
    } else if (isTriggered) {
      badgeHtml = `<span class="reminder-badge-days alert">DAY 25 reached</span>`;
      actionBtnHtml = `<button class="btn-reminder-action" onclick="openWhatsappReminderModal('${r.id}')" style="background:linear-gradient(135deg, #ff5722, #e64a19)">Send WhatsApp</button>`;
    } else {
      badgeHtml = `<span class="reminder-badge-days soon">Day ${elapsedDays}/25 (${daysRemaining}d left)</span>`;
      actionBtnHtml = `<button class="btn-reminder-action" onclick="fastForwardReminder('${r.id}')" style="background:rgba(245, 158, 11, 0.15); border:1px solid rgba(245, 158, 11, 0.3); color:var(--accent-gold); box-shadow:none;">⚡ Trigger Day 25</button>`;
    }
    
    const progressBarColorClass = r.status === 'sent' ? '' : (isTriggered ? 'danger' : 'warning');
    
    card.innerHTML = `
      <div style="flex: 1; margin-right: 8px;">
        <div class="reminder-card-info" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <h4>${contact.name} - ${product.name}</h4>
          ${badgeHtml}
        </div>
        <p>Purchased: ${new Date(r.purchaseDate).toLocaleDateString()} (${product.size})</p>
        <div class="reminder-progress-bar-container">
          <div class="reminder-progress-bar ${progressBarColorClass}" style="width: ${progressPercent}%;"></div>
        </div>
      </div>
      <div style="display:flex; align-items:center;">
        ${actionBtnHtml}
      </div>
    `;
    
    container.appendChild(card);
  });
}

function fastForwardReminder(reminderId) {
  const reminder = state.crm.reminders.find(r => r.id === reminderId);
  if (!reminder) return;
  
  reminder.simulatedDay25 = true;
  reminder.purchaseDate = Date.now() - 25 * 24 * 60 * 60 * 1000;
  saveState();
  updateNotificationDot();
  renderCrmReminders();
  showToast("Reminder time-lapsed to Day 25 successfully!");
}

function initiateRecruitPlacement(contactId) {
  const contact = state.crm.contacts.find(c => c.id === contactId);
  if (!contact) return;
  
  if (contact.status === 'agent') {
    showToast("This contact is already a placed downline agent.", "error");
    return;
  }
  
  state.pendingRecruitContactId = contactId;
  saveState();
  
  updateRecruitmentBanner();
  
  // Transition to Network View
  document.querySelector(".nav-item[data-tab='network']").click();
  showToast(`Recruitment active. Click a vacant (+) slot to place ${contact.name}.`);
}

function cancelRecruitPlacement() {
  state.pendingRecruitContactId = null;
  saveState();
  updateRecruitmentBanner();
  showToast("Recruitment placement cancelled.", "info");
}

function updateRecruitmentBanner() {
  const banner = document.getElementById("recruitmentGuideBanner");
  const text = document.getElementById("recruitmentGuideText");
  
  if (!banner) return;
  
  if (state.isAuthenticated && state.pendingRecruitContactId) {
    const contact = state.crm.contacts.find(c => c.id === state.pendingRecruitContactId);
    if (contact) {
      text.innerText = `Recruiting: ${contact.name}. Select a vacant (+) slot in the tree.`;
      banner.style.display = "flex";
      return;
    }
  }
  
  banner.style.display = "none";
}

function openWhatsappReminderModal(reminderId) {
  const r = state.crm.reminders.find(rem => rem.id === reminderId);
  if (!r) return;
  
  const contact = state.crm.contacts.find(c => c.id === r.contactId);
  const product = getActiveProducts().find(p => p.id === r.productId);
  if (!contact || !product) return;
  
  state.activeReminderId = reminderId;
  
  // Generate referral link for product
  const baseUrl = `https://asclepiuswellness.com/product/${product.id}`;
  const affUrl = `${baseUrl}?ref=${state.agent.id}&utm=whatsapp&promo=dp`;
  
  const prefilledText = `Hello ${contact.name}, hope you are doing well! 🌿

It's Day 25 since you started taking your 30-day supply of AWPL ${product.name} (${product.size}).

To keep up your health routine without interruption, it's a great time to place a reorder.

You can place your order directly using my discount price link:
${affUrl}

Let me know if you need any assistance!

Best regards,
${state.agent.name}
AWPL Authorized Wellness Advisor
📞 ${state.agent.phone}`;

  document.getElementById("waToNumber").value = contact.phone;
  document.getElementById("waMsgText").value = prefilledText;
  
  document.getElementById("whatsappModal").classList.add("open");
}

function sendWhatsappReal() {
  const phone = document.getElementById("waToNumber").value;
  const text = document.getElementById("waMsgText").value;
  
  const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
  
  // Mark reminder as sent
  if (state.activeReminderId) {
    const reminder = state.crm.reminders.find(r => r.id === state.activeReminderId);
    if (reminder) {
      reminder.status = "sent";
      saveState();
    }
    state.activeReminderId = null;
  }
  
  document.getElementById("whatsappModal").classList.remove("open");
  showToast("WhatsApp reminder opened and sent!");
  
  updateNotificationDot();
  renderCrmReminders();
}

function updateNotificationDot() {
  const dot = document.querySelector(".notification-dot");
  if (!dot) return;
  
  // Find any active Day 25 reorder alerts that are pending
  const hasAlerts = state.crm.reminders.some(r => {
    if (r.status !== 'pending') return false;
    const elapsedDays = Math.floor((Date.now() - r.purchaseDate) / (1000 * 60 * 60 * 24));
    return (elapsedDays >= 25 || r.simulatedDay25);
  });
  
  if (hasAlerts) {
    dot.style.display = "block";
  } else {
    dot.style.display = "none";
  }
}

function renderNotifications() {
  const container = document.getElementById("notificationsList");
  if (!container) return;
  
  container.innerHTML = '';
  
  const items = [];
  
  // Get active reorder alerts
  state.crm.reminders.forEach(r => {
    const contact = state.crm.contacts.find(c => c.id === r.contactId);
    const product = getActiveProducts().find(p => p.id === r.productId);
    
    if (!contact || !product) return;
    
    const elapsedDays = Math.floor((Date.now() - r.purchaseDate) / (1000 * 60 * 60 * 24));
    const isTriggered = (elapsedDays >= 25 || r.simulatedDay25);
    
    if (isTriggered && r.status === 'pending') {
      items.push({
        id: r.id,
        type: 'reorder',
        title: `⚠️ Day 25 Reorder Alert`,
        message: `Customer <strong>${contact.name}</strong> has reached Day 25 of their 30-day supply of <strong>${product.name}</strong>. Send a WhatsApp reminder to encourage a reorder.`,
        time: `${elapsedDays} days elapsed`,
        action: `openWhatsappReminderFromNoti('${r.id}')`
      });
    }
  });
  
  // Get general system alerts
  if (state.affiliate && state.affiliate.logs) {
    state.affiliate.logs.slice(0, 3).forEach(log => {
      let icon = '🔔';
      if (log.type === 'sale') icon = '💰';
      if (log.type === 'lead') icon = '📝';
      
      let msg = '';
      if (log.type === 'sale') msg = `${log.name} purchased ${log.product}. Commission of ₹${log.commission} added.`;
      else if (log.type === 'lead') msg = `New lead ${log.name} has shown interest in ${log.product}.`;
      else msg = `Anonymous click tracked on ${log.product} via ${log.source}.`;
      
      items.push({
        id: "L" + log.id,
        type: 'info',
        title: `${icon} ${log.type.toUpperCase()}`,
        message: msg,
        time: log.time,
        action: null
      });
    });
  }
  
  if (items.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); text-align:center; padding: 20px 0;">No active notifications.</div>`;
    return;
  }
  
  items.forEach(item => {
    const card = document.createElement("div");
    card.className = `notification-item-card ${item.type === 'reorder' ? 'alert-reorder' : 'alert-info'}`;
    
    let buttonHtml = '';
    if (item.action) {
      buttonHtml = `<button class="btn-reminder-action" onclick="${item.action}" style="margin-top: 8px; width: 100%;">Send WhatsApp Reminder</button>`;
    }
    
    card.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.message}</p>
      ${buttonHtml}
      <div class="noti-time">${item.time}</div>
    `;
    container.appendChild(card);
  });
}

function openWhatsappReminderFromNoti(reminderId) {
  // Close notifications modal
  document.getElementById("notificationsModal").classList.remove("open");
  // Open WhatsApp reminder modal
  openWhatsappReminderModal(reminderId);
}

// --- Profile Customization (Upload & Sync Settings) ---
function initProfileUpdate() {
  const btnEditProfile = document.getElementById("btnEditProfile");
  const modal = document.getElementById("updateProfileModal");
  const closeBtn = document.getElementById("closeUpdateProfileBtn");
  const fileTrigger = document.getElementById("btnUploadPhotoTrigger");
  const fileInput = document.getElementById("profilePhotoInput");
  const saveBtn = document.getElementById("btnSaveProfile");
  const previewImg = document.getElementById("profilePhotoPreview");
  const placeholderDiv = document.getElementById("profilePhotoPlaceholder");

  if (!btnEditProfile || !modal) return;

  // Open Edit Profile Modal
  btnEditProfile.addEventListener("click", () => {
    document.getElementById("profileName").value = state.agent.name || "";
    document.getElementById("profilePhone").value = state.agent.phone || "";

    if (state.agent.photo) {
      previewImg.src = state.agent.photo;
      previewImg.style.display = "block";
      placeholderDiv.style.display = "none";
    } else {
      previewImg.src = "";
      previewImg.style.display = "none";
      placeholderDiv.style.display = "flex";
    }

    modal.classList.add("open");
  });

  // Close Modal
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  // Trigger hidden photo input click
  fileTrigger.addEventListener("click", () => {
    fileInput.click();
  });

  // Photo Input change handler (File to Base64)
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast("Please choose an image under 2MB.", "error");
        fileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
        placeholderDiv.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });

  // Save profile modifications
  saveBtn.addEventListener("click", () => {
    const nameVal = document.getElementById("profileName").value.trim();
    const phoneVal = document.getElementById("profilePhone").value.trim();

    if (!nameVal || !phoneVal) {
      showToast("Name and Phone fields are required.", "error");
      return;
    }

    let photoData = null;
    if (previewImg.style.display === "block" && previewImg.src.startsWith("data:image")) {
      photoData = previewImg.src;
    } else if (state.agent.photo) {
      photoData = state.agent.photo;
    }

    state.agent.name = nameVal;
    state.agent.phone = phoneVal;
    state.agent.photo = photoData;

    // Sync back name to network root node if it matches
    if (state.network && state.network.id === state.agent.id) {
      state.network.name = nameVal;
    }

    saveState();
    initDashboard();

    // Re-render network tree if currently viewing network tab
    if (state.currentTab === 'network') {
      renderNetworkTree(state.network);
    }

    modal.classList.remove("open");
    showToast("Profile settings updated!");
  });
}

// --- Add Custom Product Feature ---
function initCustomProductFeature() {
  const btnOpen = document.getElementById("btnOpenAddProduct");
  const modal = document.getElementById("addProductModal");
  const btnClose = document.getElementById("closeAddProductBtn");
  const btnSave = document.getElementById("btnSaveCustomProduct");

  if (!btnOpen || !modal) return;

  btnOpen.addEventListener("click", () => {
    document.getElementById("addProdName").value = "";
    document.getElementById("addProdDp").value = "";
    document.getElementById("addProdMrp").value = "";
    document.getElementById("addProdSp").value = "";
    document.getElementById("addProdSize").value = "";
    document.getElementById("addProdSupply").value = "30";
    document.getElementById("addProdBenefits").value = "";
    modal.classList.add("open");
  });

  btnClose.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  btnSave.addEventListener("click", () => {
    const name = document.getElementById("addProdName").value.trim();
    const dp = parseFloat(document.getElementById("addProdDp").value);
    const mrp = parseFloat(document.getElementById("addProdMrp").value);
    const sp = parseFloat(document.getElementById("addProdSp").value);
    const size = document.getElementById("addProdSize").value.trim();
    const supply = parseInt(document.getElementById("addProdSupply").value) || 30;
    const benefits = document.getElementById("addProdBenefits").value.trim();

    if (!name || isNaN(dp) || isNaN(mrp) || isNaN(sp) || !size) {
      showToast("Please fill all required fields correctly.", "error");
      return;
    }

    const prodId = "custom-" + name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(100 + Math.random() * 900);

    const newProduct = {
      id: prodId,
      name: name.toUpperCase(),
      mrp: mrp,
      dp: dp,
      sp: sp,
      size: size,
      supplyDays: supply,
      benefits: benefits || "Premium Ayurvedic wellness formula.",
      image: "https://awpl-kycdocs.s3.ap-south-1.amazonaws.com/upload1/category/2B.jpeg"
    };

    if (!state.customProducts) {
      state.customProducts = [];
    }

    state.customProducts.push(newProduct);
    saveState();

    renderProductGrid(getActiveProducts());
    initAffiliateTracker();
    initMarketingHub();

    modal.classList.remove("open");
    showToast(`Added ${name} to Catalog!`);
  });
}
