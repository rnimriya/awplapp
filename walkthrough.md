# Walkthrough - AWPL Social CRM, Segmentation & Recruitment PWA

The application has been successfully upgraded with a **fully integrated Social CRM platform** designed for mobile, global theme refresh to Vibrant Orange, Forgot/Reset password flows, and custom profile photo uploads with offline persistence.

---

## 🎨 Visual Concepts & Design Theme
* **Modern Orange-Glass**: Migrated the visual theme from emerald green (`#10b981`) to a premium vibrant orange (`#ff5722`). All panels, gradients, shadows, text highlight links, and buttons reflect this new brand color.
* **Forgot & Reset Password Views**: Added clean recovery screens built directly into the authentication overlay, allowing agents to simulate password updates via a mock OTP (`1234`).
* **Profile Customization Modal**: Integrated an overlay that triggers from the dashboard to edit the agent's name, phone, and upload a profile photo.
* **Base64 Photo Persistence**: Uploaded images are serialized into Base64 strings, saved directly to `state.agent`, and synced offline, allowing the app to render the agent's image on the dashboard instead of generic initials even while completely disconnected.
* **Official AWPL Brand Logo & Clean Header**: Replaced the text "A" placeholders in the authentication overlay header and the dashboard header panel with the official AWPL brand logo image (`logo.png`), styled with transparent container backgrounds and responsive aspect ratio sizing. Additionally, removed the text label "AWPL SaaS Agent" from the top header to let the new branding stand alone cleanly.

---

## 🌿 Core Features Implemented

### 1. Social CRM & Segmentation
* **Tagging System**: Segment contacts into **Retail Customers** (blue/emerald badge - buying for health) vs. **Business Prospects** (purple badge - interested in the income plan).
* **Manual Entry**: Quick form to register a name, phone, segment tag, and custom interest notes.
* **Unified Database**: Filter, search, and manage all prospects, customers, and active downline agents in a single dashboard.

### 2. Repurchase Reminders (Day 25 Alert)
* **Automatic Scheduler**: When simulating a sale (via catalog checkout or affiliate click checkouts), the system logs a purchase and schedules a repurchase reminder for **Day 25** (for a 30-day product supply).
* **Alert Status**: Pending reminders display a progress bar and a days-remaining countdown. Once Day 25 is reached, the alert card lights up red as *"DAY 25 reached"* and enables the WhatsApp button.
* **Simulation Fast-Forward**: A **"⚡ Trigger Day 25"** button allows testing the alerts instantly without waiting 25 calendar days.
* **Agent Notifications Modal & Header Dot**:
  * On Day 25, the **Agent** is notified via a glowing **notification dot** in the app header.
  * Clicking the notification button opens the **Agent Notifications** modal, displaying a list of active reorder alerts (e.g. *"⚠️ Day 25 Reorder Alert: Customer Sunita Roy has reached Day 25..."*).
  * Direct action buttons inside the notification list allow the agent to launch the prefilled WhatsApp overlay instantly.
* **Prefilled WhatsApp Template**:
  * Clicking "Send WhatsApp" opens a preview modal displaying the recipient phone number and a pre-composed message.
  * The message automatically merges the customer's name, product details (name and size), a custom discount checkout referral link, and the agent's signature.
  * Clicking "Open Official WhatsApp URL" opens the official WhatsApp API link in a new tab and marks the alert status as **SENT** in the CRM.

### 3. Visual Recruitment Pipeline (Fighter Placement)
* **Recruit Prospect**: Clicking **"Recruit as Agent"** on a CRM contact initiates the downline placement process.
* **MLM View Sync**: Switches automatically to the **My Network** tab and displays a purple guidance banner: *"Recruiting: [Name]. Select a vacant (+) slot in the tree."*
* **Auto-Prefill Node Registration**: Clicking a vacant `(+)` slot opens the downline placement modal with the candidate's name pre-filled and locked.
* **MLM Tree Placements**: Successfully positions the prospect in the visual binary tree, adds their starting SP to the upline volumes, clears the banner, and updates their CRM status to **Agent** with their new generated AWPL ID.

### 4. Custom Product Creator
* **➕ Add Product Dialog**: Clicking the button in the **Products** tab opens the creation form.
* **Catalog Extension**: Custom products are dynamically appended to the master catalog list and persisted offline using `localStorage.customProducts`.
* **Universal Feature Support**: Once created, custom products are instantly selectable in the Affiliate Link Generator, Flyer Customizer dropdown, and CRM contact purchase flows (complete with automated Day 25 reorder alert timers calculated from the product's custom supply duration).

### 5. Advanced Flyer Customizer Extensions
* **Theme Styles Dropdown**: Allows choosing from 4 radial background gradients: *Orange Glow*, *Golden Luxury*, *Ocean Sapphire*, and *Midnight Emerald*. Accent border rings, promoter text highlights, and phone labels adjust color to match the selected theme.
* **Ribbon Badge Banner**: Add a promotional tagline (e.g. "15% OFF", "BOGO OFFER") drawn inside a rounded pill banner in the top-right corner.
* **Referral QR Code Box**: Generates a stylized mock QR code inside a clean white card overlay in the bottom right, encouraging viewers to scan the flyer to buy.

---

## 📂 Project Files Updated

* **[index.html](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/index.html)**: Integrated sub-tabs inside Affiliate section, CRM forms, contacts list cards, reminders panel, recruitment header guide banner, and WhatsApp preview modal.
* **[style.css](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/style.css)**: Implemented styles for subtab buttons, CRM contact cards, tag pills, alert reminders, progress bars, and the floating recruitment banner.
* **[app.js](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/app.js)**: Wired CRM state, initialized mock contacts, implemented sub-tab switching, CRM manual contacts, automatic checkout reminder registrations, simulated day 25 time-fast-forwarding, WhatsApp URI builders, and the prospect placement tree linkage.

---

## 🛠️ Step-by-Step Test Guide

### 1. Navigating to the Social CRM
1. Open the PWA in your browser: **`http://localhost:8080`** (Login with `AWPL99827` / `admin123`).
2. Go to the **Links** tab (3rd icon in bottom navigation).
3. Toggle the sub-tab header at the top to **Social CRM**.
4. You will see the **Add Contact** form, the **Repurchase Alerts Hub** (showing one active alert for *Sunita Roy*), and the **CRM Network Contacts** list (showing *Harish Gupta* and *Kiran Dev*).

### 2. Testing Day 25 Repurchase Reminders
1. Under **CRM Network Contacts**, find *Harish Gupta* (Retail Customer) and click **🛒 Buy Product**.
2. This redirects you to the catalog view. Select any product (e.g. **Diabodoc Ras**), open its modal, and click **💵 Simulate Sale (Ref)**.
3. Return to the **Social CRM** tab:
   * A new pending reminder is scheduled for *Harish Gupta - Diabodoc Ras* showing 25 days remaining.
   * Click **⚡ Trigger Day 25** on Harish's reminder card.
   * The card will highlight red with the alert *"DAY 25 reached"*.
4. Click **Send WhatsApp**:
   * A modal previewing the template will open.
   * Review the prefilled text containing their name, product, and referral discount link.
   * Click **Open Official WhatsApp URL** to trigger the WhatsApp API call and mark the reminder as **SENT**.

### 3. Testing Prospect MLM Placement (Recruitment)
1. In the **CRM Network Contacts** list, find *Kiran Dev* (Business Prospect) and click **Recruit as Agent**.
2. The tab will automatically switch to **My Network**, showing the banner: *"Recruiting: Kiran Dev. Select a vacant (+) slot..."*
3. Click the vacant `(+)` slot under *Sanjay Sharma (Left Side)* or *Amit Patel*.
4. The downline member modal will open with *Kiran Dev* pre-filled. Select starting SP (e.g., `100` SP) and click **Position Member in Tree**.
5. Kiran Dev will be positioned in the visual SVG network tree, adding 100 SP to Sanjay Sharma and Ramesh Kumar's left volumes.
6. Go back to **Links** -> **Social CRM**. Filter by "Agents". You will see *Kiran Dev* is now tagged as **Agent (ID: AWPLXXXXX)** and their recruit button has changed to **Placed in Network**.

---

## ⚡ Full Stack & PWA Upgrades Implemented

To make this app fully production-ready, we have upgraded it to a Progressive Web App (PWA) with a local Node.js Express server backend:

### 1. PWA Features (Manifest & Service Worker)
* **[manifest.json](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/manifest.json)**: Declares application name, standalone full-screen display mode, deep-slate theme colors, portrait orientation lock, and maskable shortcut launch icons.
* **[sw.js](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/sw.js)**: Regulates asset fetching. It intercepts HTTP calls and implements offline caching for core assets (HTML, CSS, JS, Google fonts). This lets the app run instantly and work entirely offline without internet.

### 2. Node.js / Express Backend Setup
* **[package.json](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/package.json)**: NPM configuration declaring server launch entry points and core development dependencies.
* **[server.js](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/server.js)**: Programmed an Express web server hosting the static site on `http://localhost:8080` alongside mock REST API endpoints for:
  * Authentication login & signup validation.
  * CRM contact registration, updates, and segments.
  * Reorder reminders scheduling and sent status tracking.
  * MLM Downline Tree retrievals.

---

## 🚀 Vercel Deployment & Serverless Configuration

The project is fully configured for a one-click deployment on **Vercel** as a serverless application:

### 1. Serverless Adapter (`server.js`)
* The Express server has been refactored to check `process.env.NODE_ENV !== 'production'`.
* In production (on Vercel), it bypasses the `app.listen()` call and exports the raw Express app instance via `module.exports = app;`. This allows Vercel's serverless handler to execute the server as a lightweight function.

### 2. Vercel Rules Routing (`vercel.json`)
* The routing configuration utilizes Vercel's native `"handle": "filesystem"` directive. This automatically instructs Vercel to serve all static assets placed inside the `public/` directory (like HTML, CSS, JS, logos) directly from the Vercel edge CDN.
* Any other dynamic requests that do not match a static file in the `public/` folder are cleanly falling back and routed to `server.js` (Express).

### 3. Project Directory Relocation (`public/`)
* To ensure Vercel compiles and hosts the application files correctly, all frontend files (`index.html`, `style.css`, `app.js`, `products.js`, `logo.png`, `manifest.json`, `sw.js`) have been relocated into the `/public` folder.
* The Express server (`server.js`) has been updated to serve static assets from the `public` directory: `app.use(express.static(path.join(__dirname, 'public')))` and `res.sendFile(path.join(__dirname, 'public', 'index.html'))`.

---

## 🛠️ Step-by-Step Test Guide (PWA Edition)

### 4. Running the Full Stack App & Caching Verification
1. Run the Express server by launching `npm start` in your project folder. The server binds to port `8080`.
2. Navigate to **`http://localhost:8080`** in Google Chrome.
3. Open DevTools (**F12**) and go to the **Application** tab:
   * Select **Manifest**: You will see the PWA parameters (App Name, Icons, Theme colors) parsed successfully.
   * Select **Service Workers**: You will see `sw.js` activated and running in the background.
4. Check the **Offline** checkbox in Chrome DevTools network tab, or disconnect your computer from the network.
5. Reload the page at `http://localhost:8080`. **Verify that the app loads immediately and is fully interactive even in offline mode!**

