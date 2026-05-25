# Implementation Plan - Catalog Management, AI Voice Chat, Profile Updates & Favicon

This plan outlines the layout modifications, logic flow, and stylesheet changes required to implement AWPL product catalog editing/deletion, a voice-enabled AI Copilot chat assistant, general profile access improvements, and favicon branding.

---

## Proposed Changes

We will modify `public/index.html`, `public/style.css`, `public/app.js`, and `public/sw.js` to implement these upgrades:

### 1. Unified Catalog Management (Edit, Update, Delete)

Currently, corporate products are read-only (`AWPL_PRODUCTS`) and custom products are added to a separate list. We will unify all products into a single editable database.

#### [MODIFY] [app.js](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/public/app.js)
* **Unified State**: Initialize `state.products` with `AWPL_PRODUCTS` merged with any existing `state.customProducts` on load.
* **Catalog Functions**:
  * Update `getActiveProducts()` to return `state.products`.
  * Create `deleteProduct(productId)`: Remove the product from `state.products`, call `saveState()`, update all catalog grids, and refresh product dropdowns in the link builder and customizer.
  * Create `editProduct(product)`: Fill the product editor form (`#addProductModal`) with the selected product's values, set a state variable `state.editingProductId = product.id`, change the modal header to *"Edit Product"*, and change the save button to *"Update Product Details"*.
* **State Sync**: Adjust product addition to push to `state.products` directly (if not editing) or update the existing item (if `state.editingProductId` is set). Reset `state.editingProductId = null` when saving or canceling.

#### [MODIFY] [index.html](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/public/index.html)
* **Product Detail Modal Actions (`#productModal`)**:
  * Add **"✏️ Edit Product"** and **"🗑️ Delete Product"** buttons in the modal actions panel.
  * Style these buttons to align with the vibrant orange glassmorphism theme.
* **Rename Add Product Modal (`#addProductModal`)**:
  * Update modal headers/IDs to reflect a general **Product Form Modal** that handles both adding and editing.

---

### 2. AI Voice & Text Chat Assistant (Copilot)

We will build a fully interactive AI Copilot with speech-to-text input (voice chat) and text-to-speech output (synthesized voice response).

#### [MODIFY] [index.html](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/public/index.html)
* **Floating AI Button**: Add a floating action button (FAB) in the bottom-right corner of the app wrapper with a pulsing glowing robot/chat icon.
* **AI Copilot Panel (`#aiCopilotPanel`)**: Add a slide-up glassmorphic panel:
  * **Header**: Shows *"AWPL AI Copilot (Online)"*, a pulsing status dot, a sound toggle (mute/unmute speaker), and a close button.
  * **Chat Area**: Scrollable message log showing styled user messages and AI bubble answers.
  * **Controls**: Form with input field, a "Send" text button, and a microphone button.
  * **Waveform**: An animated glowing sound wave container that displays when the microphone is recording.

#### [MODIFY] [style.css](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/public/style.css)
* **FAB Styling**: Position absolute in the bottom-right, circular orange gradient background, and glowing animation shadows.
* **Copilot Panel**: Slide-up sheet with blur effects, text bubbles styling (user vs copilot), sound wave animation styling (pulsating flex lines), and active/glowing inputs.

#### [MODIFY] [app.js](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/public/app.js)
* **AI Engine**: Add an intelligent matching script to respond to:
  * Queries about specific products (Diabodoc, Tulsi, Thunderblast, etc.) with stats (MRP, DP, SP) and benefits.
  * Walkthroughs of CRM alerts, downline placements, marketing flyers, and matching binary points.
* **Web Speech Integration**:
  * **Speech Recognition**: Setup `SpeechRecognition` listener. When the microphone button is clicked, animate waves, transcribe voice live, and auto-submit on completion.
  * **Speech Synthesis**: Generate spoken audio response using `window.speechSynthesis` when responses are loaded (respecting the mute/unmute state).

---

### 3. Agent Profile Settings & Header Gear Icon

We will make profile customization accessible from any tab in the application.

#### [MODIFY] [index.html](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/public/index.html)
* Add a gear settings icon (`#btnHeaderSettings`) to the header action buttons, right next to the notification button.

#### [MODIFY] [app.js](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/public/app.js)
* Bind `#btnHeaderSettings` to trigger the profile update modal (`#updateProfileModal`) exactly like the edit button on the dashboard card.

---

### 4. PWA Favicon Branding

#### [MODIFY] [index.html](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/public/index.html)
* Add favicon links inside the `<head>` pointing to the new copied image assets:
  ```html
  <link rel="icon" type="image/png" href="favicon.png">
  <link rel="shortcut icon" href="favicon.ico">
  <link rel="apple-touch-icon" href="favicon.png">
  ```

#### [MODIFY] [sw.js](file:///c:/Users/rnimr/OneDrive/Desktop/awpl/public/sw.js)
* Add `'./favicon.png'` and `'./favicon.ico'` to the `ASSETS` cache list so the icons load offline.

---

## Verification Plan

### Automated/Unit Checks
* Run `node server.js` locally to verify that the server serves assets correctly without any syntax/compilation issues.

### Manual Verification
1. **Favicon Check**: Open the browser tab and verify that the tab shows the new orange network node icon.
2. **Profile Quick Access**: Click the gear icon in the top header on any tab (e.g. Products or Flyers) and verify the Update Profile modal opens and loads data correctly.
3. **Product Catalog CRUD**:
   * Open the Products catalog and click on any product card.
   * Verify the "Edit Product" and "Delete Product" buttons appear.
   * Edit a product: change its name and price. Save and verify that the changes reflect immediately in the grid and modal.
   * Create a new product. Verify it displays in the catalog.
   * Delete the product. Verify it is removed from the grid.
4. **AI Copilot Assistant**:
   * Click the floating AI robot button. Verify the Copilot window slides up.
   * Type a question (e.g., *"How do I place a downline?"* or *"What is Diabodoc?"*) and click send. Verify the AI answers correctly and speaks the answer aloud.
   * Click the microphone button. Speak a question. Verify your speech is transcribed and auto-submitted, and that the glowing waveform is visible while listening.
   * Toggle the speaker mute button to verify that speech synthesis can be muted.
