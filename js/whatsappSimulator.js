/**
 * WhatsApp Web Simulator UI Engine
 * Features:
 * - 0ms Single Grey Tick (✓)
 * - 200ms Double Grey Tick (✓✓)
 * - 400ms Double Blue Tick (✓✓ read receipt)
 * - Header typing... and 3-dot jumping typing indicator bubble
 * - 1.0s - 1.2s AI response bubble with Web Audio notification tone
 * - In-chat Product Cards with COD button
 * - In-chat Voice Note Player with animated audio waveform
 * - High-converting Jubayer WhatsApp closing proposal card
 */

class WhatsAppSimulator {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.messagesContainer = null;
    this.statusElement = null;
    this.options = options;
    this.audioEnabled = true;
    this.audioCtx = null;
    this.currentStore = null;
    this.onUserSend = options.onUserSend || null;
    this.isBotTyping = false;
  }

  init(store) {
    this.currentStore = store;
    this.renderSimulatorFrame();
    this.sendInitialWelcomeMessage();
  }

  sanitizeUrl(url) {
    if (!url) return '';
    const cleaned = String(url).replace(/[\x00-\x1f\x7f-\x9f]/g, '').trim();
    if (/^(?:javascript|vbscript|file):/i.test(cleaned)) {
      return '';
    }
    if (/^data:/i.test(cleaned)) {
      if (!/^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,/i.test(cleaned)) {
        return '';
      }
    }
    return cleaned;
  }

  updateStore(newStore) {
    this.currentStore = newStore;
    const headerTitle = this.container.querySelector('.wa-store-title');
    const headerAvatar = this.container.querySelector('.wa-store-avatar');
    if (headerTitle) headerTitle.textContent = newStore.shortName || newStore.name;
    if (headerAvatar) {
      const safeAvatar = this.sanitizeUrl(newStore.avatar) || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150';
      headerAvatar.src = safeAvatar;
    }
    this.clearMessages();
    this.sendInitialWelcomeMessage();
  }

  clearMessages() {
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playPopSound(type = 'incoming') {
    if (!this.audioEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'incoming') {
        // Classic WhatsApp high-pitched double notification ding
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);

        // Second harmonic chime
        setTimeout(() => {
          try {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            const now2 = ctx.currentTime;
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1760, now2);
            gain2.gain.setValueAtTime(0.15, now2);
            gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.18);
            osc2.start(now2);
            osc2.stop(now2 + 0.18);
          } catch(e){}
        }, 80);
      } else if (type === 'sent') {
        // Soft outgoing whoosh/pop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  getCurrentTimeStr() {
    const d = new Date();
    let hours = d.getHours();
    let mins = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    mins = mins < 10 ? '0' + mins : mins;
    return `${hours}:${mins} ${ampm}`;
  }

  renderSimulatorFrame() {
    const store = this.currentStore;
    this.container.innerHTML = `
      <div class="wa-window flex flex-col h-[740px] max-h-[85vh] w-full bg-[#efeae2] rounded-2xl shadow-2xl overflow-hidden border border-slate-700/20 select-none relative font-sans">
        
        <!-- WhatsApp Header: Classic WhatsApp Green #075e54 / #128c7e -->
        <div class="wa-header bg-gradient-to-r from-[#075e54] to-[#128c7e] text-white px-4 py-2.5 flex items-center justify-between shadow-md z-20">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <img class="wa-store-avatar w-10 h-10 rounded-full object-cover border border-white/30 shadow-sm" 
                   src="${this.escapeHtml(this.sanitizeUrl(store.avatar) || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150')}" 
                   alt="${this.escapeHtml(store.name || 'Store')}">
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] border-2 border-[#075e54] rounded-full"></span>
            </div>
            <div class="leading-tight">
              <div class="flex items-center space-x-1.5">
                <span class="wa-store-title font-semibold text-sm tracking-wide text-white drop-shadow-sm">
                  ${this.escapeHtml(store.shortName || store.name || 'Store')}
                </span>
                <!-- Official WhatsApp Green Verified Tick Badge -->
                <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#25D366] text-white flex-shrink-0 shadow-xs" title="অফিশিয়াল ভেরিফাইড বিজনেস অ্যাকাউন্ট">
                  <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </span>
              </div>
              <p class="wa-live-status text-xs text-emerald-100 flex items-center space-x-1">
                <span class="inline-block w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse mr-1"></span>
                <span class="status-label font-medium text-emerald-100">online</span>
              </p>
            </div>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center space-x-3 text-white/90">
            <button id="waSoundToggle" class="p-1.5 hover:bg-white/10 rounded-full transition" title="সাউন্ড অন/অফ">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              </svg>
            </button>
            <button class="p-1.5 hover:bg-white/10 rounded-full transition hidden sm:inline-block">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
            <button class="p-1.5 hover:bg-white/10 rounded-full transition hidden sm:inline-block">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </button>
            <div class="h-4 w-[1px] bg-white/20"></div>
            <button class="p-1.5 hover:bg-white/10 rounded-full transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- WhatsApp Chat Body with Authentic Wallpaper Background -->
        <div id="waMessages" class="wa-messages flex-1 overflow-y-auto p-4 space-y-3 relative">
          <!-- Background doodle texture layer -->
          <div class="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#075e54_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        <!-- WhatsApp Input Bar -->
        <div class="wa-input-bar bg-[#f0f2f5] px-3 py-2.5 flex items-center space-x-2 border-t border-slate-200 z-10">
          <button class="p-1.5 text-slate-500 hover:text-slate-700 transition" title="ইমোজি">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
          
          <button class="p-1.5 text-slate-500 hover:text-slate-700 transition" title="ফাইল অ্যাটাচ">
            <svg class="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
            </svg>
          </button>

          <form id="waChatForm" class="flex-1 flex items-center m-0">
            <input 
              id="waMessageInput" 
              type="text" 
              placeholder="একটি মেসেজ লিখুন... (Type in Bengali or English)" 
              class="w-full bg-white rounded-lg px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
              autocomplete="off"
            />
          </form>

          <!-- Dynamic Mic / Send Button -->
          <button id="waSendBtn" class="bg-[#00a884] hover:bg-[#008f72] text-white p-2.5 rounded-full transition shadow-md flex items-center justify-center flex-shrink-0">
            <!-- Send Arrow Icon (default) -->
            <svg id="waSendIcon" class="w-4 h-4 ml-0.5 fill-current" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

      </div>
    `;

    this.messagesContainer = this.container.querySelector('#waMessages');
    this.statusElement = this.container.querySelector('.wa-live-status .status-label');

    // Setup Event Listeners
    const form = this.container.querySelector('#waChatForm');
    const input = this.container.querySelector('#waMessageInput');
    const sendBtn = this.container.querySelector('#waSendBtn');
    const soundToggle = this.container.querySelector('#waSoundToggle');

    const handleSend = (e) => {
      if (e) e.preventDefault();
      const val = input.value.trim();
      if (!val || this.isBotTyping) return;
      input.value = '';
      if (this.onUserSend) {
        this.onUserSend(val);
      }
    };

    form.addEventListener('submit', handleSend);
    sendBtn.addEventListener('click', handleSend);

    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.audioEnabled = !this.audioEnabled;
        soundToggle.classList.toggle('opacity-40', !this.audioEnabled);
        soundToggle.title = this.audioEnabled ? 'সাউন্ড অন' : 'সাউন্ড অফ';
      });
    }
  }

  sendInitialWelcomeMessage() {
    const store = this.currentStore;
    const timeStr = this.getCurrentTimeStr();

    // End to end encryption banner & date header
    const bannerHtml = `
      <div class="text-center my-2">
        <span class="inline-block bg-[#e1f3fb] text-[#1e3a8a] text-[11px] font-medium px-2.5 py-1 rounded-md shadow-sm border border-[#cbe7f7]">
          🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
        </span>
      </div>
      <div class="text-center my-1.5">
        <span class="inline-block bg-white/90 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
          আজ (TODAY)
        </span>
      </div>
    `;
    this.messagesContainer.insertAdjacentHTML('beforeend', bannerHtml);

    // Initial greeting bubble from store AI
    const welcomeBubble = `
      <div class="flex flex-col items-start space-y-1 mb-2">
        <div class="bg-white wa-tail-in text-slate-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[85%] shadow-sm border border-slate-200/80 relative text-[13.5px] leading-relaxed">
          <p class="font-medium text-emerald-800 mb-1">
            আসসালামু আলাইকুম! <strong>${this.escapeHtml(store.name || 'Store')}</strong>-এ আপনাকে আন্তরিক স্বাগতম! 🌸
          </p>
          <p class="text-slate-700">
            আমাদের অফিশিয়াল ক্যাটালগ থেকে যেকোনো প্রোডাক্ট, ডিসকাউন্ট অফার, সাইজ বা ডেলিভারি তথ্য জানতে এখানে সরাসরি মেসেজ করুন।
          </p>
          <p class="text-slate-700 mt-1.5 font-medium">
            আজ আপনাকে কীভাবে সাহায্য করতে পারি? 👇
          </p>
          <div class="flex items-center justify-end space-x-1 mt-1 text-[10px] text-slate-400">
            <span>${timeStr}</span>
          </div>
        </div>
      </div>
    `;
    this.messagesContainer.insertAdjacentHTML('beforeend', welcomeBubble);

    // Initial Top Product Preview Card
    const topP = (store.products && store.products[0]) ? store.products[0] : null;
    if (topP) {
      this.renderProductCardInChat(topP, false);
    }
    this.scrollToBottom();
  }

  /**
   * Post customer message with precise interaction timing:
   * 0ms: Single Grey Tick
   * 200ms: Double Grey Tick
   * 400ms: Double Blue Tick
   * 400ms: Header changes to "typing..." & jumping 3-dot animation appears
   * 1.0s - 1.2s: Typing bubble disappears, AI response bubble appears!
   */
  handleCustomerMessage(messageText, callbackTriggerAI) {
    this.playPopSound('sent');
    const msgId = 'msg-' + Date.now();
    const timeStr = this.getCurrentTimeStr();

    // 0ms: Single Grey Tick
    const bubbleHtml = `
      <div id="${msgId}" class="flex flex-col items-end space-y-1 mb-2 animate-fadeIn">
        <div class="bg-[#d9fdd3] wa-tail-out text-slate-900 rounded-2xl rounded-tr-none px-3.5 py-2 max-w-[85%] shadow-sm relative text-[13.5px] leading-relaxed border border-emerald-200/60">
          <p class="whitespace-pre-wrap select-text">${this.escapeHtml(messageText)}</p>
          <div class="flex items-center justify-end space-x-1.5 mt-0.5 text-[10px] text-slate-500">
            <span>${timeStr}</span>
            <span class="wa-ticks inline-flex items-center ml-1 text-slate-400" title="Sent">
              <!-- Single Grey Tick -->
              <svg class="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    `;

    this.messagesContainer.insertAdjacentHTML('beforeend', bubbleHtml);
    this.scrollToBottom();

    const msgElement = document.getElementById(msgId);
    const tickContainer = msgElement ? msgElement.querySelector('.wa-ticks') : null;

    // 200ms: Double Grey Tick
    setTimeout(() => {
      if (tickContainer) {
        tickContainer.innerHTML = `
          <!-- Double Grey Tick -->
          <svg class="w-4 h-3.5 stroke-current text-slate-400" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 13l3.5 3.5L14 8M9 13l3.5 3.5L20 8"/>
          </svg>
        `;
        tickContainer.title = 'Delivered';
      }
    }, 200);

    // 400ms: Double Blue Tick + Status: typing... + 3-dot jumping bubble
    setTimeout(() => {
      if (tickContainer) {
        tickContainer.innerHTML = `
          <!-- Double Blue Tick Read Receipt -->
          <svg class="w-4 h-3.5 stroke-current text-[#53bdeb]" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 13l3.5 3.5L14 8M9 13l3.5 3.5L20 8"/>
          </svg>
        `;
        tickContainer.title = 'Read';
      }

      this.showTypingIndicator();
    }, 400);

    // 1000ms - 1200ms: Remove typing indicator & reveal AI response
    const delayTime = 1000 + Math.floor(Math.random() * 200);
    setTimeout(() => {
      this.hideTypingIndicator();
      if (callbackTriggerAI) {
        callbackTriggerAI();
      }
    }, delayTime);
  }

  showTypingIndicator() {
    this.isBotTyping = true;
    if (this.statusElement) {
      this.statusElement.innerHTML = '<span class="text-[#25D366] font-semibold tracking-wide animate-pulse">typing...</span>';
    }

    const typingHtml = `
      <div id="waTypingBubble" class="flex flex-col items-start space-y-1 mb-2">
        <div class="bg-white wa-tail-in rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-200/80 flex items-center space-x-1.5">
          <div class="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div class="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div class="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    `;
    this.messagesContainer.insertAdjacentHTML('beforeend', typingHtml);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isBotTyping = false;
    if (this.statusElement) {
      this.statusElement.innerHTML = '<span class="text-emerald-100 font-medium">online</span>';
    }
    const bubble = document.getElementById('waTypingBubble');
    if (bubble) bubble.remove();
  }

  deliverAIResponse(replyData) {
    this.playPopSound('incoming');
    const timeStr = this.getCurrentTimeStr();

    // 1. Text Bubble
    if (replyData.text) {
      const formattedText = this.formatMarkdown(replyData.text);
      const aiBubbleHtml = `
        <div class="flex flex-col items-start space-y-1 mb-2 animate-fadeIn">
          <div class="bg-white wa-tail-in text-slate-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[88%] shadow-sm border border-slate-200/80 relative text-[13.5px] leading-relaxed">
            <div class="select-text space-y-1.5">${formattedText}</div>
            <div class="flex items-center justify-end space-x-1 mt-1 text-[10px] text-slate-400">
              <span>${timeStr}</span>
            </div>
          </div>
        </div>
      `;
      this.messagesContainer.insertAdjacentHTML('beforeend', aiBubbleHtml);
    }

    // 2. In-Chat Product Card
    if (replyData.productCard) {
      this.renderProductCardInChat(replyData.productCard, true);
    }

    // 3. Simulated WhatsApp Voice Note Player
    if (replyData.voiceNote) {
      this.renderVoiceNoteInChat(replyData.voiceNote);
    }

    // 4. In-Chat Conversion / Closing Card (Prompt requirement after 3-4 interactions)
    if (replyData.showClosingProposal) {
      setTimeout(() => {
        this.renderClosingProposalCard();
        this.scrollToBottom();
      }, 450);
    }

    this.scrollToBottom();
  }

  renderProductCardInChat(product, isAttached = false) {
    const cardId = 'pcard-' + Date.now() + Math.floor(Math.random()*100);
    
    // XSS sanitization
    let safeImgUrl = this.sanitizeUrl(product.image);
    if (!safeImgUrl) {
      safeImgUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600';
    }
    const safeImg = this.escapeHtml(safeImgUrl);
    const safeTitle = this.escapeHtml(product.titleBn || product.title || 'Product');
    const safeDesc = this.escapeHtml(product.shortDesc || product.specs || '');
    const safeId = this.escapeHtml(String(product.id || 'p-0'));
    const safePrice = Number(product.price || 0).toLocaleString();
    const safeOrigPrice = Number(product.originalPrice || 0).toLocaleString();
    const safeDiscount = Number(product.discountPercent || 0);
    const safeSavings = Math.max(0, Number(product.originalPrice || 0) - Number(product.price || 0)).toLocaleString();

    const cardHtml = `
      <div id="${cardId}" class="flex flex-col items-start space-y-1 mb-2 max-w-[85%] animate-fadeIn">
        <div class="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200/90 w-full transition hover:shadow-lg">
          
          <!-- Product Image & Badges -->
          <div class="relative w-full h-44 bg-slate-100 overflow-hidden group">
            <img src="${safeImg}" alt="${safeTitle}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
            <div class="absolute top-2 left-2 bg-emerald-600/95 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow backdrop-blur-xs flex items-center space-x-1">
              <span>✅ স্টকে আছে</span>
            </div>
            <div class="absolute top-2 right-2 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
              ${safeDiscount}% OFF
            </div>
          </div>

          <!-- Card Details -->
          <div class="p-3.5 space-y-2">
            <h4 class="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
              ${safeTitle}
            </h4>
            
            <p class="text-xs text-slate-500 line-clamp-2">
              ${safeDesc}
            </p>

            <!-- Price Row -->
            <div class="flex items-baseline space-x-2 pt-0.5">
              <span class="text-emerald-700 font-bold text-lg">৳ ${safePrice}</span>
              <span class="text-slate-400 line-through text-xs">৳ ${safeOrigPrice}</span>
              <span class="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                (সাশ্রয় ৳ ${safeSavings})
              </span>
            </div>

            <!-- Instant COD Order CTA Button -->
            <button 
              class="wa-order-btn w-full bg-[#00a884] hover:bg-[#008f72] text-white py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition"
              data-product-id="${safeId}"
              data-product-title="${safeTitle}"
            >
              <span>⚡ Order Now with COD</span>
              <span class="text-[11px] opacity-90">(ক্যাশ অন ডেলিভারি)</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.messagesContainer.insertAdjacentHTML('beforeend', cardHtml);

    // Attach click handler for the in-chat order button
    const cardEl = document.getElementById(cardId);
    if (cardEl) {
      const orderBtn = cardEl.querySelector('.wa-order-btn');
      if (orderBtn) {
        orderBtn.addEventListener('click', () => {
          const pTitle = orderBtn.getAttribute('data-product-title');
          if (this.onUserSend) {
            this.onUserSend(`আমি এই "${pTitle}" ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই!`);
          }
        });
      }
    }
  }

  renderVoiceNoteInChat(voiceData) {
    const vnId = 'vn-' + Date.now();
    const timeStr = this.getCurrentTimeStr();

    const vnHtml = `
      <div id="${vnId}" class="flex flex-col items-start space-y-1 mb-2 max-w-[85%] animate-fadeIn">
        <div class="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-slate-200/80 w-full">
          <div class="flex items-center space-x-3">
            
            <!-- Play/Pause Circle Button -->
            <button class="vn-play-btn w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow transition flex-shrink-0">
              <svg class="play-icon w-5 h-5 ml-0.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg class="pause-icon w-5 h-5 fill-current hidden" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>

            <!-- Waveform & Track -->
            <div class="flex-1 space-y-1">
              <div class="flex items-center space-x-1 h-6">
                <!-- SVG Waveform Bars -->
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-3 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-5 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-2 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-6 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-4 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-7 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-3 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-5 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-2 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-6 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-4 transition-all duration-150"></div>
                <div class="waveform-bar w-1 bg-slate-300 rounded-full h-5 transition-all duration-150"></div>
              </div>
              <div class="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span class="vn-time">${this.escapeHtml(voiceData.duration || '0:14')}</span>
                <span class="flex items-center space-x-1 text-emerald-600">
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  </svg>
                  <span>AI Voice Note</span>
                </span>
              </div>
            </div>

          </div>
          <p class="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-1.5 italic">
            ${this.escapeHtml(voiceData.previewText || 'AI Sales Rep ভয়েস প্রিভিউ')}
          </p>
        </div>
      </div>
    `;

    this.messagesContainer.insertAdjacentHTML('beforeend', vnHtml);

    // Audio preview interaction
    const vnEl = document.getElementById(vnId);
    if (vnEl) {
      const playBtn = vnEl.querySelector('.vn-play-btn');
      const playIcon = vnEl.querySelector('.play-icon');
      const pauseIcon = vnEl.querySelector('.pause-icon');
      const bars = vnEl.querySelectorAll('.waveform-bar');

      let isPlaying = false;
      let interval = null;

      playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
          playIcon.classList.add('hidden');
          pauseIcon.classList.remove('hidden');
          bars.forEach(b => b.classList.replace('bg-slate-300', 'bg-emerald-500'));

          // Waveform pulsation
          interval = setInterval(() => {
            bars.forEach(b => {
              const r = Math.floor(Math.random() * 24) + 6;
              b.style.height = `${r}px`;
            });
          }, 150);

          // Simulated pleasant voice frequency notes
          try {
            const ctx = this.getAudioContext();
            if (ctx) {
              const now = ctx.currentTime;
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(440, now);
              osc.frequency.linearRampToValueAtTime(587, now + 0.3);
              osc.frequency.linearRampToValueAtTime(523, now + 0.6);
              gain.gain.setValueAtTime(0.08, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now);
              osc.stop(now + 1.2);
            }
          } catch(e){}

          // Auto stop after 4s demo
          setTimeout(() => {
            if (isPlaying) playBtn.click();
          }, 4000);
        } else {
          playIcon.classList.remove('hidden');
          pauseIcon.classList.add('hidden');
          clearInterval(interval);
          bars.forEach(b => {
            b.classList.replace('bg-emerald-500', 'bg-slate-300');
            b.style.height = '';
          });
        }
      });
    }
  }

  /**
   * In-Chat Conversion / Closing Card (Prompt requirement)
   * Delivers the direct proposal to Jubayer's WhatsApp (+8801610594042)
   */
  renderClosingProposalCard() {
    const timeStr = this.getCurrentTimeStr();
    const jubayerNumber = '8801610594042';
    const storeName = this.currentStore.name || 'My Store';
    const waText = encodeURIComponent(`হ্যালো জুবায়ের ভাই, আমি সেলস ইঞ্জিন (WhatsApp AI Sales Rep Sandbox) টেস্ট করেছি এবং আমার ই-কমার্স স্টোরের (${storeName}) জন্য ২৪ ঘণ্টায় এই এআই সেলস রেপ চালু করতে আগ্রহী! বিস্তারিত আলাপ করতে চাই।`);
    const waUrl = `https://wa.me/${jubayerNumber}?text=${waText}`;

    const cardHtml = `
      <div class="flex flex-col items-start space-y-1 mb-2 max-w-[92%] animate-fadeIn">
        <div class="bg-gradient-to-br from-emerald-900 via-slate-900 to-[#075e54] text-white rounded-2xl rounded-tl-sm p-4 shadow-xl border-2 border-emerald-400/40 relative overflow-hidden">
          
          <!-- Background Glow Effect -->
          <div class="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>

          <!-- Agency Header Badge -->
          <div class="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center space-x-1">
              <span>🚀</span>
              <span>Be Smart With AI • Master Closing Engine</span>
            </span>
            <span class="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-mono">
              Live Demo Ready
            </span>
          </div>

          <!-- Main Conversion Pitch (Bengali as requested) -->
          <p class="text-[13.5px] font-medium leading-relaxed text-slate-100">
            আমি তো শুধু আপনার ১০ সেকেন্ডের ডেমো! আপনার আসল হোয়াটসঅ্যাপ নম্বরে এই এআই সেলস রেপ ২৪ ঘণ্টায় চালু করতে নিচে ক্লিক করে জুবায়েরের সাথে কথা বলুন।
          </p>

          <!-- Value Pillars -->
          <div class="my-3 space-y-1.5 text-xs text-emerald-100/90 bg-black/25 rounded-xl p-2.5 border border-white/5">
            <div class="flex items-center space-x-1.5">
              <span class="text-emerald-400">⚡</span>
              <span><strong>২৪ ঘণ্টার মধ্যে</strong> লাইভ ক্লাউড ইন্টিগ্রেশন</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="text-emerald-400">🤖</span>
              <span><strong>১০০% মেটা অফিশিয়াল ক্লাউড API</strong> — নো ব্যান রিস্ক</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <span class="text-emerald-400">📈</span>
              <span>রাতের ৩টায় আসা ইনবক্স লিডও সাথে সাথে ক্যাশ কনভার্সন!</span>
            </div>
          </div>

          <!-- Direct CTA Button to Jubayer -->
          <a 
            href="${waUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="w-full bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 group text-center"
          >
            <!-- WhatsApp SVG Icon -->
            <svg class="w-4 h-4 fill-current text-slate-950" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.846 2.791.846 3.182 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.802 0-3.486-.481-4.945-1.32l-5.055 1.32 1.353-4.928c-.947-1.516-1.488-3.3-1.488-5.202 0-5.514 4.486-10 10-10 5.514 0 10 4.486 10 10z"/>
            </svg>
            <span>জুবায়েরের সাথে সরাসরি WhatsApp-এ কানেক্ট করুন (+8801610594042)</span>
          </a>

          <div class="flex items-center justify-end space-x-1 mt-2 text-[10px] text-emerald-200/60">
            <span>${timeStr}</span>
            <span class="text-emerald-400 font-bold">✓✓</span>
          </div>

        </div>
      </div>
    `;

    this.messagesContainer.insertAdjacentHTML('beforeend', cardHtml);
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      setTimeout(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }, 50);
    }
  }

  formatMarkdown(text) {
    if (!text) return '';
    let t = this.escapeHtml(text);
    // Bold
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Line breaks
    t = t.replace(/\n/g, '<br/>');
    return t;
  }

  escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Attach to window and module
if (typeof window !== 'undefined') {
  window.WhatsAppSimulator = WhatsAppSimulator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WhatsAppSimulator };
}
