/**
 * Main Standalone Application Orchestrator
 * Connects CatalogEngine, AISalesAgent, and WhatsAppSimulator.
 * Manages URL scan animations, manual entry drawer, quick prompts, live telemetry,
 * interactive ROI calculator, FAQ accordions, and mobile navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Engines
  const catalogEngine = new CatalogEngine();
  const salesAgent = new AISalesAgent(catalogEngine);

  let simulator = null;

  // 2. Initialize WhatsApp Simulator
  simulator = new WhatsAppSimulator('waSimulatorContainer', {
    onUserSend: (userMessage) => {
      // Simulate real WhatsApp delivery sequence
      simulator.handleCustomerMessage(userMessage, () => {
        const aiResponse = salesAgent.processUserMessage(userMessage);
        simulator.deliverAIResponse(aiResponse);
        updateTelemetry();
      });
    }
  });

  simulator.init(catalogEngine.getCurrentStore());

  // 3. UI Elements - Sandbox Console
  const storeUrlInput = document.getElementById('storeUrlInput');
  const scanStoreBtn = document.getElementById('scanStoreBtn');
  const scanBtnText = document.getElementById('scanBtnText');
  const scanBtnSpinner = document.getElementById('scanBtnSpinner');
  const scanStatusMsg = document.getElementById('scanStatusMsg');

  const presetButtons = document.querySelectorAll('.preset-store-btn');
  const toggleManualBtn = document.getElementById('toggleManualBtn');
  const manualEntrySection = document.getElementById('manualEntrySection');
  const manualProductForm = document.getElementById('manualProductForm');
  const resetDemoBtn = document.getElementById('resetDemoBtn');

  const ingestedProductsList = document.getElementById('ingestedProductsList');
  const activeStoreBadge = document.getElementById('activeStoreBadge');
  const activeStoreName = document.getElementById('activeStoreName');
  const activeStoreCategory = document.getElementById('activeStoreCategory');

  const quickPromptBtns = document.querySelectorAll('.quick-prompt-btn');

  // Telemetry elements
  const telemetrySkuCount = document.getElementById('telemetrySkuCount');
  const telemetryInteractions = document.getElementById('telemetryInteractions');
  const telemetryStatus = document.getElementById('telemetryStatus');

  // Render Initial Ingested Catalog
  renderActiveStoreDetails();

  // --- Handlers: Sandbox Ingestion & Controls ---

  // Preset store pills
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const domain = btn.getAttribute('data-domain');
      if (domain) {
        storeUrlInput.value = domain;
        triggerStoreScan(domain);
      }
    });
  });

  // URL Scan Form
  const scanForm = document.getElementById('storeScanForm');
  if (scanForm) {
    scanForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = storeUrlInput.value.trim();
      if (val) {
        triggerStoreScan(val);
      }
    });
  }

  async function triggerStoreScan(url) {
    // Show progressive scanning animation
    scanStoreBtn.disabled = true;
    scanBtnSpinner.classList.remove('hidden');
    scanBtnText.textContent = 'ক্যাটালগ স্ক্যান হচ্ছে...';
    if (scanStatusMsg) {
      scanStatusMsg.classList.remove('hidden');
      scanStatusMsg.textContent = '🔍 ওয়েবসাইটের মেটাডাটা ও প্রোডাক্ট ক্যাটাগরি বিশ্লেষণ করা হচ্ছে...';
    }

    setTimeout(() => {
      if (scanStatusMsg) scanStatusMsg.textContent = '📦 ইনভেন্টরি, সাইজ ভ্যারিয়েন্ট ও বিডিটি প্রাইসিং সিন্ক হচ্ছে...';
    }, 450);

    setTimeout(() => {
      if (scanStatusMsg) scanStatusMsg.textContent = '⚡ ২৪/৭ কনভার্সেশনাল সেলস রেপ পারসোনা অ্যাক্টিভেট করা হলো!';
    }, 900);

    // Attempt live server scrape if available, with graceful fallback
    let liveData = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const scrapeEndpoint = (window.location.protocol.startsWith('http') ? '' : 'http://127.0.0.1:8085') + '/api/scrape?url=' + encodeURIComponent(url);
      const resp = await fetch(scrapeEndpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (resp.ok) {
        liveData = await resp.json();
      }
    } catch (err) {
      // Offline, file:/// protocol, or server not running - fallback seamlessly
    }

    setTimeout(() => {
      // Ingest into Catalog Engine
      const result = catalogEngine.setStoreByDomain(url);

      // If live scrape returned products or metadata, integrate them
      if (liveData && !liveData.error) {
        if (liveData.title) {
          result.store.name = liveData.title;
          result.store.shortName = liveData.title.split(/[-|•,]/)[0].trim();
        }
        if (liveData.ogImage) {
          result.store.avatar = liveData.ogImage;
        }
        if (liveData.products && liveData.products.length > 0) {
          result.store.products = liveData.products;
          catalogEngine.activeProducts = [...liveData.products];
        }
      }

      salesAgent.reset();
      simulator.updateStore(result.store);

      renderActiveStoreDetails();
      updateTelemetry();

      scanStoreBtn.disabled = false;
      scanBtnSpinner.classList.add('hidden');
      scanBtnText.textContent = '🚀 অ্যাক্টিভেট করুন';
      if (scanStatusMsg) {
        setTimeout(() => {
          scanStatusMsg.classList.add('hidden');
        }, 1500);
      }
    }, 1250);
  }

  // Toggle Manual Product Entry Form
  if (toggleManualBtn && manualEntrySection) {
    toggleManualBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = manualEntrySection.classList.contains('hidden');
      manualEntrySection.classList.toggle('hidden', !isHidden);
      toggleManualBtn.textContent = isHidden 
        ? '✕ ম্যানুয়াল ফর্ম বন্ধ করুন' 
        : 'অথবা নিজে প্রোডাক্ট ও প্রাইস লিখে টেস্ট করুন ✍️';
      if (isHidden) {
        manualEntrySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Handle Manual Product Form Submission
  if (manualProductForm) {
    manualProductForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('manualTitle').value.trim();
      const price = parseFloat(document.getElementById('manualPrice').value);
      const originalPrice = parseFloat(document.getElementById('manualOriginalPrice').value) || (price * 1.25);
      const category = document.getElementById('manualCategory').value.trim() || 'Custom Collection';
      const specs = document.getElementById('manualSpecs').value.trim();
      const colors = document.getElementById('manualColors').value.split(',').map(s => s.trim()).filter(Boolean);
      const sizes = document.getElementById('manualSizes').value.split(',').map(s => s.trim()).filter(Boolean);
      const dhakaCost = parseFloat(document.getElementById('manualDhakaCost').value) || 60;
      const outsideCost = parseFloat(document.getElementById('manualOutsideCost').value) || 120;

      if (!title || !price) {
        alert('অনুগ্রহ করে পণ্যের নাম এবং অফার মূল্য প্রদান করুন।');
        return;
      }

      const newProduct = catalogEngine.setManualProduct({
        title: title,
        titleBn: title,
        price: price,
        originalPrice: originalPrice,
        category: category,
        specs: specs,
        colors: colors.length ? colors : ['Black', 'Navy'],
        sizes: sizes.length ? sizes : ['Standard'],
        dhakaCost: dhakaCost,
        outsideCost: outsideCost
      });

      salesAgent.reset();
      simulator.updateStore(catalogEngine.getCurrentStore());
      renderActiveStoreDetails();
      updateTelemetry();

      // Close manual form
      manualEntrySection.classList.add('hidden');
      toggleManualBtn.textContent = 'অথবা নিজে প্রোডাক্ট ও প্রাইস লিখে টেস্ট করুন ✍️';

      // Send a quick prompt
      simulator.handleCustomerMessage(`আমি "${title}" সম্পর্কে জানতে চাই। স্টকে আছে কি?`, () => {
        const reply = salesAgent.processUserMessage(`আমি "${title}" সম্পর্কে জানতে চাই। স্টকে আছে কি?`);
        simulator.deliverAIResponse(reply);
        updateTelemetry();
      });
    });
  }

  // Quick Prompt Buttons (Simulate client questions)
  quickPromptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const promptText = btn.getAttribute('data-prompt') || btn.textContent.trim();
      if (promptText && !simulator.isBotTyping) {
        simulator.handleCustomerMessage(promptText, () => {
          const aiResponse = salesAgent.processUserMessage(promptText);
          simulator.deliverAIResponse(aiResponse);
          updateTelemetry();
        });
      }
    });
  });

  // Reset Demo
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      salesAgent.reset();
      simulator.clearMessages();
      simulator.sendInitialWelcomeMessage();
      updateTelemetry();
    });
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Render Active Store Details & Ingested Products List
  function renderActiveStoreDetails() {
    const store = catalogEngine.getCurrentStore();
    if (!store) return;

    if (activeStoreName) activeStoreName.textContent = store.name;
    if (activeStoreBadge) activeStoreBadge.textContent = store.badge || 'Verified Brand';
    if (activeStoreCategory) activeStoreCategory.textContent = store.category;

    if (ingestedProductsList) {
      ingestedProductsList.innerHTML = '';
      const products = catalogEngine.getAllProducts();

      products.forEach(p => {
        let safeImgUrl = String(p.image || '').replace(/[\x00-\x1f\x7f-\x9f]/g, '').trim();
        if (/^(?:javascript|vbscript|file):/i.test(safeImgUrl) || !safeImgUrl) {
          safeImgUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';
        } else if (/^data:/i.test(safeImgUrl) && !/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,/i.test(safeImgUrl)) {
          safeImgUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';
        }
        const safeImg = escapeHtml(safeImgUrl);
        const safeTitle = escapeHtml(p.titleBn || p.title || 'Product');
        const safePrice = Number(p.price || 0).toLocaleString();
        const safeOrigPrice = Number(p.originalPrice || 0).toLocaleString();
        const safeDiscount = Number(p.discountPercent || 0);

        const itemEl = document.createElement('div');
        itemEl.className = 'group p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition cursor-pointer flex items-center space-x-3';
        itemEl.innerHTML = `
          <img src="${safeImg}" alt="${safeTitle}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-600/50">
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition truncate">
              ${safeTitle}
            </h5>
            <div class="flex items-center space-x-2 mt-0.5">
              <span class="text-xs font-bold text-emerald-400">৳${safePrice}</span>
              <span class="text-[10px] text-slate-400 line-through">৳${safeOrigPrice}</span>
              <span class="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                ${safeDiscount}% OFF
              </span>
            </div>
          </div>
          <button class="text-xs text-slate-400 group-hover:text-emerald-400 p-1 flex-shrink-0" title="এই প্রোডাক্ট সম্পর্কে চ্যাটে জিজ্ঞাসা করুন">
            💬
          </button>
        `;

        itemEl.addEventListener('click', () => {
          if (!simulator.isBotTyping) {
            const prompt = `এই "${p.titleBn || p.title}"-এর সাইজ ও ডেলিভারি তথ্য জানতে চাই।`;
            simulator.handleCustomerMessage(prompt, () => {
              const reply = salesAgent.processUserMessage(prompt);
              simulator.deliverAIResponse(reply);
              updateTelemetry();
            });
          }
        });

        ingestedProductsList.appendChild(itemEl);
      });
    }

    updateTelemetry();
  }

  function updateTelemetry() {
    const products = catalogEngine.getAllProducts();
    if (telemetrySkuCount) telemetrySkuCount.textContent = products.length + ' SKUs';
    if (telemetryInteractions) telemetryInteractions.textContent = salesAgent.interactionCount;
    if (telemetryStatus) {
      telemetryStatus.textContent = salesAgent.hasSentProposal ? 'Closing Card Triggered' : 'Engaging Buyer';
    }
  }

  // --- 4. Interactive ROI Calculator ---
  const roiVisitorsInput = document.getElementById('roiVisitors');
  const roiConvRateInput = document.getElementById('roiConvRate');
  const roiAovInput = document.getElementById('roiAov');

  const roiVisitorsVal = document.getElementById('roiVisitorsVal');
  const roiConvRateVal = document.getElementById('roiConvRateVal');
  const roiAovVal = document.getElementById('roiAovVal');

  const roiCurrentRev = document.getElementById('roiCurrentRev');
  const roiProjectedRev = document.getElementById('roiProjectedRev');
  const roiExtraRev = document.getElementById('roiExtraRev');
  const roiExtraOrders = document.getElementById('roiExtraOrders');
  const roiSupportSavings = document.getElementById('roiSupportSavings');
  const roiHoursSaved = document.getElementById('roiHoursSaved');

  function calculateROI() {
    if (!roiVisitorsInput || !roiConvRateInput || !roiAovInput) return;

    const messages = parseInt(roiVisitorsInput.value, 10) || 2500;
    const currentRate = parseFloat(roiConvRateInput.value) || 5.0;
    const aov = parseInt(roiAovInput.value, 10) || 1200;

    // Update value labels
    if (roiVisitorsVal) roiVisitorsVal.textContent = messages.toLocaleString('en-US') + ' জন';
    if (roiConvRateVal) roiConvRateVal.textContent = currentRate.toFixed(1) + '%';
    if (roiAovVal) roiAovVal.textContent = '৳' + aov.toLocaleString('en-US');

    // Formulas:
    // AI response time drops from ~45 mins to 0s, conversion multiplies by 2.8x (capped at 38%)
    const aiMultiplier = 2.8;
    const projectedRate = Math.min(currentRate * aiMultiplier, 38.0);

    const currentOrders = Math.round(messages * (currentRate / 100));
    const projectedOrders = Math.round(messages * (projectedRate / 100));
    const extraOrders = Math.max(0, projectedOrders - currentOrders);

    const currentRevenue = currentOrders * aov;
    const projectedRevenue = projectedOrders * aov;
    const extraRevenue = Math.max(0, projectedRevenue - currentRevenue);

    // Support manpower saved: ~3.5 minutes per inquiry handling
    const hoursSaved = Math.round((messages * 3.5) / 60);
    // Average BD e-commerce support rep cost: ~BDT 120/hr
    const supportSavedBdt = Math.round(hoursSaved * 120);

    if (roiCurrentRev) roiCurrentRev.textContent = '৳' + currentRevenue.toLocaleString('en-US');
    if (roiProjectedRev) roiProjectedRev.textContent = '৳' + projectedRevenue.toLocaleString('en-US');
    if (roiExtraRev) roiExtraRev.textContent = '+৳' + extraRevenue.toLocaleString('en-US');
    if (roiExtraOrders) roiExtraOrders.textContent = '+' + extraOrders.toLocaleString('en-US') + ' টি';
    if (roiSupportSavings) roiSupportSavings.textContent = '-৳' + supportSavedBdt.toLocaleString('en-US') + ' (৭০% সাশ্রয়)';
    if (roiHoursSaved) roiHoursSaved.textContent = hoursSaved.toLocaleString('en-US') + '+ ঘণ্টা';
  }

  if (roiVisitorsInput && roiConvRateInput && roiAovInput) {
    [roiVisitorsInput, roiConvRateInput, roiAovInput].forEach(slider => {
      slider.addEventListener('input', calculateROI);
    });
    calculateROI();
  }

  // --- 5. Interactive FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = content.classList.contains('open');

        // Close other FAQ items
        faqItems.forEach(other => {
          const otherContent = other.querySelector('.faq-content');
          const otherIcon = other.querySelector('.faq-icon');
          if (otherContent && otherContent !== content) {
            otherContent.classList.remove('open');
            otherContent.style.maxHeight = null;
          }
          if (otherIcon && otherIcon !== icon) {
            otherIcon.classList.remove('open');
          }
        });

        // Toggle clicked item
        if (isOpen) {
          content.classList.remove('open');
          content.style.maxHeight = null;
          if (icon) icon.classList.remove('open');
        } else {
          content.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
          if (icon) icon.classList.add('open');
        }
      });
    }
  });

  // --- 6. Mobile Navigation Drawer ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuDrawer.classList.toggle('hidden');
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuDrawer.classList.add('hidden');
      });
    });
  }

  // Smooth scroll offset handling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const navHeight = 72;
          const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});
