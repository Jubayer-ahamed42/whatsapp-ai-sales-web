
    // Mock browser window and document
    global.window = global;
    
    // Load files
    require('./js/catalogEngine.js');
    require('./js/aiSalesAgent.js');
    
    const catalog = new CatalogEngine();
    console.log("✓ CatalogEngine loaded successfully.");
    
    // 1. Verify default store (Fabrilife)
    let store = catalog.getCurrentStore();
    if (store.id !== 'fabrilife' || catalog.getAllProducts().length < 5) {
        throw new Error("Failed default store check: " + JSON.stringify(store));
    }
    console.log(`✓ Fabrilife loaded with ${catalog.getAllProducts().length} products.`);
    
    // 2. Verify search in Bengali
    let hoodieMatches = catalog.findProducts('হুডি');
    if (hoodieMatches.length === 0 || !hoodieMatches[0].title.includes('Hoodie')) {
        throw new Error("Failed Bengali product search for 'হুডি'");
    }
    console.log("✓ Bengali search for 'হুডি' returned:", hoodieMatches[0].titleBn);
    
    // 3. Switch to Gadget & Gear
    let gngResult = catalog.setStoreByDomain('gadgetandgear.com');
    if (!gngResult.success || catalog.getCurrentStore().id !== 'gadgetandgear') {
        throw new Error("Failed switching to Gadget & Gear");
    }
    let airpods = catalog.findProducts('AirPods');
    if (airpods.length === 0) {
        throw new Error("Failed searching AirPods in Gadget & Gear");
    }
    console.log("✓ Gadget & Gear switched successfully. Found:", airpods[0].title);
    
    // 4. Test Dynamic Domain Generation
    let genResult = catalog.setStoreByDomain('apexshoes.com');
    if (!genResult.isSynthesized || catalog.getAllProducts().length === 0) {
        throw new Error("Failed dynamic domain synthesis for apexshoes.com");
    }
    console.log("✓ Dynamic domain synthesis passed for apexshoes.com. Found:", catalog.getAllProducts()[0].title);
    
    // 5. Test Manual Product Ingestion
    const manualP = catalog.setManualProduct({
        title: 'টেস্ট কাস্টম জ্যাকেট',
        titleBn: 'টেস্ট কাস্টম জ্যাকেট',
        price: 1850,
        originalPrice: 2450,
        category: 'Jacket',
        specs: 'Waterproof Winter Jacket'
    });
    if (catalog.getAllProducts()[0].id !== manualP.id) {
        throw new Error("Manual product not placed at top of inventory");
    }
    console.log("✓ Manual custom product ingestion verified:", manualP.titleBn);
    
    // 6. Test AISalesAgent
    const agent = new AISalesAgent(catalog);
    console.log("✓ AISalesAgent initialized.");
    
    // Test Greeting
    let r1 = agent.processUserMessage("আসসালামু আলাইকুম");
    console.log("✓ Agent Greeting:", r1.text.slice(0, 45) + "...");
    
    // Test Product Query
    let r2 = agent.processUserMessage("জ্যাকেট সম্পর্কে জানতে চাই");
    if (!r2.productCard) {
        throw new Error("Product card missing in product query response");
    }
    console.log("✓ Product query returned card for:", r2.productCard.title);
    
    // Test Delivery Query
    let r3 = agent.processUserMessage("ডেলিভারি চার্জ কত?");
    if (!r3.text.includes('ডেলিভারি') || !r3.text.includes('ঢাকা')) {
        throw new Error("Delivery response missing key info");
    }
    console.log("✓ Delivery query verified.");
    
    // Test 3-4 Interaction Closing Proposal Card
    console.log("Interaction count before message 4:", agent.interactionCount);
    let r4 = agent.processUserMessage("আমি ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই");
    if (!r4.showClosingProposal && !agent.hasSentProposal) {
        throw new Error("Closing proposal card was NOT triggered after 3-4 interactions!");
    }
    console.log("✓ In-Chat Conversion / Closing Proposal Card triggered successfully! (showClosingProposal: " + r4.showClosingProposal + ")");
    
    // Test COD Order completion flow
    let r5 = agent.processUserMessage("নাম: করিম, মোবাইল: 01711223344, ঠিকানা: ধানমন্ডি ২৭, ঢাকা");
    if (!r5.isOrderSummary || !r5.text.includes('অর্ডার আইডি') || !r5.text.includes('01711223344')) {
        throw new Error("Failed COD order confirmation receipt generation");
    }
    console.log("✓ COD Order Confirmation Receipt generated successfully!");
    
    console.log("\n>>> ALL JAVASCRIPT LOGIC TESTS PASSED PERFECTLY! <<<\n");
    