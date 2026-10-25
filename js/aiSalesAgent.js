/**
 * AI Sales Rep Engine (সেলস এজেন্ট)
 * Bilingual (Bengali + Banglish) consultative sales closer.
 * Handles pricing queries, catalog recommendations, stock checks,
 * objections, cash on delivery (COD) orders, and in-chat conversion closing cards.
 */

class AISalesAgent {
  constructor(catalogEngine) {
    this.catalog = catalogEngine;
    this.interactionCount = 0;
    this.hasSentProposal = false;
    this.currentOrderState = {
      inProgress: false,
      product: null,
      customerName: '',
      phone: '',
      address: '',
      sizeOrColor: ''
    };
  }

  reset() {
    this.interactionCount = 0;
    this.hasSentProposal = false;
    this.currentOrderState = {
      inProgress: false,
      product: null,
      customerName: '',
      phone: '',
      address: '',
      sizeOrColor: ''
    };
  }

  // Convert Bengali numerals to English digits
  normalizeBengaliNumerals(str) {
    if (!str) return '';
    const map = { '০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9' };
    return str.replace(/[০-৯]/g, d => map[d] || d);
  }

  processUserMessage(userText) {
    this.interactionCount++;
    const rawText = (userText || '').trim();
    const text = this.normalizeBengaliNumerals(rawText);
    const store = this.catalog.getCurrentStore();
    const policy = store.deliveryPolicy || { dhakaCost: 60, outsideCost: 120, dhakaTime: '২৪-৪৮ ঘণ্টা', outsideTime: '২-৩ দিন' };

    let reply = {
      text: '',
      productCard: null,
      voiceNote: null,
      showClosingProposal: false,
      isOrderSummary: false
    };

    // 1. Check if user is inside COD Order flow
    if (this.currentOrderState.inProgress) {
      const orderResult = this.handleOrderStep(text, rawText, store);
      if (orderResult) {
        reply = { ...reply, ...orderResult };
        this.checkClosingTrigger(reply);
        return reply;
      }
    }

    // 2. Direct Order Intent Trigger (e.g. from Order Button or order keywords)
    if (/order|অর্ডার|নিতে চাই|কিনতে চাই|পাঠিয়ে দেন|বুকিং|cod|cash on delivery|nite chai|kinte chai|order korbo|order korte chai|pathiye den|nibo|kinbo|order now/i.test(text)) {
      // Find matching product or keep current
      let matched = this.catalog.findProducts(text);
      let targetProduct = matched.length > 0 ? matched[0] : (this.currentOrderState.product || this.catalog.getAllProducts()[0]);

      this.currentOrderState.inProgress = true;
      this.currentOrderState.product = targetProduct;

      reply.text = `চমৎকার পছন্দ! 🎉 **${targetProduct.titleBn || targetProduct.title}** ক্যাশ অন ডেলিভারিতে অর্ডার করতে আপনার:\n\n১. **আপনার নাম**\n২. **মোবাইল নম্বর**\n৩. **সম্পূর্ণ ডেলিভারি ঠিকানা** (ঢাকা অথবা ঢাকার বাইরে)\n৪. সাইজ/কালার (যদি থাকে)\n\nলিখে পাঠিয়ে দিন, আমরা এখনই পার্সেলটি বুক করে দিচ্ছি! 📦`;
      reply.productCard = targetProduct;

      this.checkClosingTrigger(reply);
      return reply;
    }

    // 3. Greeting / Opening
    if (/^(hi|hello|hey|সালাম|আসসালামু|আলাইকুম|কেমন আছেন|শুনুন|sunun|shunun|halo|salam|slaam|vai|bhai|apu)/i.test(text) && text.length < 30) {
      const topProducts = this.catalog.getAllProducts();
      reply.text = `ওয়ালাইকুমুস সালাম! **${store.name}**-এ আপনাকে স্বাগতম! 🌸\n\nআমাদের আজকের হট-সেলিং কালেকশনগুলো রেডি আছে। আপনি কোনো নির্দিষ্ট প্রোডাক্ট খুঁজছেন, নাকি আমাদের বেস্টসেলারগুলো দেখতে চান?`;
      if (topProducts.length > 0) {
        reply.productCard = topProducts[0];
        this.currentOrderState.product = topProducts[0];
      }
      this.checkClosingTrigger(reply);
      return reply;
    }

    // 4. Delivery Cost & Delivery Time Inquiry
    if (/ডেলিভারি|শিপিং|চার্জ|খরচ|কখন পাব|কয় দিন|কয়দিন|কতদিন|shipping|delivery|time|charge|khoroch|koto din|koydin|kobe pabo/i.test(text)) {
      const p = this.currentOrderState.product || this.catalog.getAllProducts()[0];
      reply.text = `আমাদের ডেলিভারি পলিসি অত্যন্ত দ্রুত ও নির্ভরযোগ্য! 🚚💨\n\n📍 **ঢাকা সিটির ভেতরে:** মাত্র ৳${policy.dhakaCost} (সময়: ${policy.dhakaTime})\n📍 **ঢাকার বাইরে (সারা বাংলাদেশ):** মাত্র ৳${policy.outsideCost} (সময়: ${policy.outsideTime})\n\n✅ **ক্যাশ অন ডেলিভারি (COD):** ডেলিভারিম্যানের সামনে পার্সেল চেক করে টাকা দেওয়ার ১০০% নিরাপদ সুবিধা রয়েছে।`;
      if (this.currentOrderState.inProgress && p) {
        reply.text += `\n\n👉 **${p.titleBn || p.title}** অর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার **নাম, মোবাইল নম্বর ও ঠিকানা** লিখে পাঠিয়ে দিন! 📦`;
      } else {
        reply.text += `\n\nআপনি কোন এলাকা থেকে অর্ডার করতে চাইছেন?`;
      }
      if (p) reply.productCard = p;
      this.checkClosingTrigger(reply);
      return reply;
    }

    // 5. Discount & Price Negotiation / Objection Handling
    if (/কম|ডিসকাউন্ট|ছাড়|বেশি দাম|দামে ছাড়|offer|discount|price high|কম রাখা|কিছু কম|দাম বেশি|dam kom|dam besi|kom hobe|koto rakhba|kicu kom|koto dam|dam koto|price koto/i.test(text)) {
      const matched = this.catalog.findProducts(text);
      const p = matched.length > 0 ? matched[0] : (this.currentOrderState.product || this.catalog.getAllProducts()[0]);
      this.currentOrderState.product = p;

      reply.text = `আপনার আগ্রহের জন্য ধন্যবাদ! 😊 **${store.name}**-এ আমরা সবসময় কোয়ালিটির সাথে আপস না করে সবচেয়ে রিজনেবল প্রাইস দেওয়ার চেষ্টা করি।\n\nবর্তমানে আমাদের সাইটে অলরেডি **${p.discountPercent || 20}% স্পেশাল ডিসকাউন্ট** চলছে! নিয়মিত মূল্য ৳${p.originalPrice}, তবে আজকের অফারে পাচ্ছেন মাত্র **৳${p.price}**-এ!\n\n💡 এছাড়া আপনি যদি ২টি আইটেম একসাথে অর্ডার করেন, তাহলে আমরা ডেলিভারিতে বিশেষ সুবিধা দেওয়ার ব্যবস্থা করতে পারব! আজই কি বুক করে দিব?`;
      reply.productCard = p;
      this.checkClosingTrigger(reply);
      return reply;
    }

    // 6. Return / Warranty / Trust Inquiry
    if (/রিটার্ন|এক্সচেঞ্জ|গ্যারান্টি|ওয়ারেন্টি|আসল|নকল|authenticity|fake|check|return|warranty|guarantee|original to|asol/i.test(text)) {
      reply.text = `একদম নিশ্চিত থাকুন! 🛡️\n\n১. **১০০% অরিজিনাল ও অথেনটিক গ্যারান্টি:** আমরা সরাসরি ফ্যাক্টরি/অথোরাইজড সোর্স থেকে সংগ্রহ করি।\n২. **হাতে পেয়ে চেক করার সুবিধা:** ডেলিভারিম্যান উপস্থিত থাকা অবস্থায় আপনি প্রোডাক্ট দেখে নিশ্চিত হতে পারবেন।\n৩. **${policy.returnPolicy || '৭ দিনের রিটার্ন ও সাইজ এক্সচেঞ্জ সুবিধা'}**।\n\nআপনার কেনাকাটা যাতে সম্পূর্ণ ঝুঁকিমুক্ত থাকে, আমরা সেভাবেই কাজ করি! 💯`;
      this.checkClosingTrigger(reply);
      return reply;
    }

    // 7. Specific Size, Color & Stock Inquiries
    if (/সাইজ|কালার|রং|স্টক|স্টকে আছে|পাব কি|অ্যাভেইলেবল|size|color|colour|stock|available/i.test(text)) {
      const matched = this.catalog.findProducts(text);
      const p = matched.length > 0 ? matched[0] : (this.currentOrderState.product || this.catalog.getAllProducts()[0]);
      this.currentOrderState.product = p;

      const sizesList = p.sizes && p.sizes.length ? p.sizes.join(', ') : 'স্ট্যান্ডার্ড রেগুলার ফিট';
      const colorsList = p.colors && p.colors.length ? p.colors.join(', ') : 'অরিজিনাল কালার';

      reply.text = `জি, অবশ্যই! আমাদের **${p.titleBn || p.title}** একদম ফ্রেশ স্টকে রয়েছে! 🔥\n\n📏 **অ্যাভেইলেবল সাইজ:** ${sizesList}\n🎨 **রং/কালার:** ${colorsList}\n📦 **স্টক স্ট্যাটাস:** ${p.inStock ? `ইন-স্টক (${p.stockCount || 25} টি রেডি টু ডিসপ্যাচ)` : 'স্টক সীমিত'}\n\nআপনার কোন সাইজ ও কালার পছন্দ হয়েছে? জানিয়ে দিন, আমরা এখনই অর্ডার প্রসেস এগিয়ে নিচ্ছি! 😊`;
      reply.productCard = p;
      this.checkClosingTrigger(reply);
      return reply;
    }

    // 8. Catalog / Product Search
    const matchedProducts = this.catalog.findProducts(text);
    if (matchedProducts.length > 0) {
      const selected = matchedProducts[0];
      this.currentOrderState.product = selected;

      let extraInfo = '';
      if (selected.sizes && selected.sizes.length > 0) {
        extraInfo += `\n📏 **অ্যাভেইলেবল সাইজ:** ${selected.sizes.join(', ')}`;
      }
      if (selected.colors && selected.colors.length > 0) {
        extraInfo += `\n🎨 **রং/কালার:** ${selected.colors.join(', ')}`;
      }

      reply.text = `জি, অবশ্যই! আমাদের **${selected.titleBn || selected.title}** একদম ফ্রেশ স্টকে রয়েছে! 🔥\n\n💰 **বর্তমান অফার প্রাইস:** ৳${selected.price} (আসল মূল্য ৳${selected.originalPrice} - ${selected.discountPercent}% ছাড়!)\n📦 **স্টক স্ট্যাটাস:** ${selected.inStock ? 'ইন-স্টক (রেডি টু ডিসপ্যাচ)' : 'স্টক সীমিত'}${extraInfo}\n\n✨ **ফিচার:** ${selected.shortDesc || selected.specs}\n\nআপনি চাইলে এখনই ক্যাশ অন ডেলিভারিতে অর্ডার কনফার্ম করে ফেলতে পারেন!`;
      reply.productCard = selected;

      // Voice note preview simulation on product queries
      if (this.interactionCount % 2 === 0) {
        reply.voiceNote = {
          duration: '0:14',
          previewText: 'AI Sales Rep Voice Note: প্রোডাক্টের ফেব্রিক ও সাইজিং সম্পর্কে অডিও গাইড'
        };
      }

      this.checkClosingTrigger(reply);
      return reply;
    }

    // 9. General Catalog Request
    if (/সব|লিস্ট|প্রোডাক্ট|কালেকশন|catalog|all|list/i.test(text)) {
      const all = this.catalog.getAllProducts().slice(0, 3);
      const productLines = all.map((it, idx) => `${idx + 1}. 🛍️ **${it.titleBn || it.title}** — মাত্র ৳${it.price.toLocaleString()} (${it.discountPercent}% OFF)`).join('\n');
      reply.text = `আমাদের বর্তমান হট-লিস্টিং ক্যাটালগ থেকে সেরা আইটেমগুলো নিচে দেওয়া হলো:\n\n${productLines}\n\nআপনার যেটা পছন্দ হবে তার নাম লিখলেই বিস্তারিত সাইজ ও স্টক জানিয়ে দিচ্ছি! 👇`;
      reply.productCard = all[0];
      this.checkClosingTrigger(reply);
      return reply;
    }

    // 10. Fallback Consultative Response
    const fallbackProduct = this.currentOrderState.product || this.catalog.getAllProducts()[0];
    reply.text = `জি! আপনার মেসেজের জন্য আন্তরিক ধন্যবাদ। **${store.name}**-এর সেলস টিম হিসেবে আমি আপনাকে আমাদের সেরা প্রোডাক্ট, অফার এবং হোম ডেলিভারি সম্পর্কিত যেকোনো তথ্যে সহায়তা করতে প্রস্তুত।\n\nযেমন আমাদের হট-সেলার **${fallbackProduct.titleBn || fallbackProduct.title}** এখন স্পেশাল অফারে মাত্র **৳${fallbackProduct.price}**-এ পেয়ে যাচ্ছেন!\n\nআপনি কি এই প্রোডাক্টটি সম্পর্কে জানতে চান, নাকি অন্য কোনো আইটেম খুঁজছেন?`;
    reply.productCard = fallbackProduct;

    this.checkClosingTrigger(reply);
    return reply;
  }

  handleOrderStep(text, rawText, store) {
    const policy = store.deliveryPolicy || { dhakaCost: 60, outsideCost: 120 };
    const p = this.currentOrderState.product || this.catalog.getAllProducts()[0];

    // Clean text for phone extraction (handle spaces, dashes, +88 prefix)
    const normalizedDigits = text.replace(/[\s\-()]/g, '');
    const phoneRawMatch = normalizedDigits.match(/(?:\+?88)?(01[3-9]\d{8})/);
    const phone = phoneRawMatch ? phoneRawMatch[1] : null;

    // Detect if customer is asking a question instead of submitting address/order
    const isQuestion = /[?]|কত|কখন|কবে|কোথায়|কোথায়|চার্জ|ডেলিভারি|ছাড়|ডিসকাউন্ট|সাইজ|কালার|রং|স্টক|দোকান|শপ|শোরুম|কেমন|আসল|নকল|ফেরত|চেক|koto|kobe|charge|delivery|discount|size|color|colour|stock|shop|showroom/i.test(text);
    const hasExplicitContact = /(?:নাম|name)\s*[:=]|(?:ঠিকানা|address)\s*[:=]|(?:ফোন|মোবাইল|phone)\s*[:=]|(?:রোড|road)\s*\d+|(?:বাসা|বাড়ি|বাড়ি|house)\s*\d+/i.test(text);

    // If it's a question and lacks a phone number, route back to question handlers
    if (isQuestion && !phone) {
      return null;
    }

    const hasAddressMarkers = /(?:নাম|ফোন|মোবাইল|ঠিকানা|রোড|বাসা|বাড়ি|বাড়ি|হাউজ|সেক্টর|গ্রাম|উপজেলা|থানা|জেলা|মিরপুর|ধানমন্ডি|উত্তরা|বনানী|গুলশান|মোহাম্মদপুর|বসুন্ধরা|address|road|house|sector|village)/i.test(text);

    // If genuine phone number is present with address/contact markers or structured details
    if (phone && (hasExplicitContact || hasAddressMarkers || text.length >= 10)) {
      const isOutside = /(চট্টগ্রাম|সিলেট|রাজশাহী|খুলনা|বরিশাল|রংপুর|কুমিল্লা|বগুড়া|বগুড়া|ময়মনসিংহ|ময়মনসিংহ|গাজীপুর|নারায়ণগঞ্জ|নারায়ণগঞ্জ|বাইরে|outside|district|village|গ্রাম)/i.test(text);
      const deliveryCharge = isOutside ? policy.outsideCost : policy.dhakaCost;
      const totalAmount = p.price + deliveryCharge;
      const orderId = 'BSW-' + Math.floor(100000 + Math.random() * 900000);

      this.currentOrderState.inProgress = false; // Order completed successfully!

      return {
        text: `আলহামদুলিল্লাহ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে! 🎊\n\n📋 **অর্ডার রসিদ / সামারি:**\n━━━━━━━━━━━━━━━━━━\n🆔 **অর্ডার আইডি:** #${orderId}\n🛍️ **পণ্য:** ${p.titleBn || p.title}\n💰 **মূল্য:** ৳${p.price.toLocaleString()}\n🚚 **ডেলিভারি চার্জ:** ৳${deliveryCharge} (${isOutside ? 'ঢাকার বাইরে' : 'ঢাকা সিটি'})\n💵 **সর্বমোট প্রদেয় (COD):** ৳${totalAmount.toLocaleString()} (পণ্য হাতে পেয়ে পরিশোধ করবেন)\n📱 **যোগাযোগ:** ${phone}\n━━━━━━━━━━━━━━━━━━\nআমাদের লজিস্টিক টিম পার্সেলটি প্যাক করে ট্র্যাকিং আইডি সহ আপনাকে মেসেজ পাঠাবে। ধন্যবাদ! 🌸`,
        productCard: null,
        isOrderSummary: true
      };
    }

    // If user provided an address or name but forgot their phone number
    if (hasExplicitContact || (hasAddressMarkers && text.length >= 12 && !isQuestion)) {
      return {
        text: `ধন্যবাদ! আপনার ডেলিভারি তথ্য পেয়েছি। ক্যাশ অন ডেলিভারি অর্ডারটি কনফার্ম করতে অনুগ্রহ করে আপনার **১১ ডিজিটের মোবাইল নম্বরটি** (যেমন: ০১৭১১২২৩৩৪৪) লিখে পাঠিয়ে দিন! 📱`,
        productCard: p,
        isOrderSummary: false
      };
    }

    return null;
  }

  checkClosingTrigger(reply) {
    // Deliver in-chat conversion proposal after 3 or more interactions or right after order
    if ((this.interactionCount >= 3 || reply.isOrderSummary) && !this.hasSentProposal) {
      reply.showClosingProposal = true;
      this.hasSentProposal = true;
    }
  }
}

// Attach to window and module
if (typeof window !== 'undefined') {
  window.AISalesAgent = AISalesAgent;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AISalesAgent };
}
