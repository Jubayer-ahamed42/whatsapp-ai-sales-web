/**
 * Catalog Intelligence Engine
 * Handles catalog ingestion, domain heuristics, preset store databases,
 * manual product entries, and fuzzy bilingual semantic search.
 */

const PRESET_STORES = {
  'fabrilife.com': {
    id: 'fabrilife',
    name: 'Fabrilife Clothing & Lifestyle',
    shortName: 'Fabrilife Official',
    domain: 'fabrilife.com',
    category: 'Fashion & Apparel',
    badge: 'Official Verified Brand',
    avatar: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150&auto=format&fit=crop&q=80',
    deliveryPolicy: {
      dhakaCost: 60,
      outsideCost: 120,
      dhakaTime: '২৪-৪৮ ঘণ্টা',
      outsideTime: '২-৩ কার্যদিবস',
      codAvailable: true,
      returnPolicy: '৭ দিনের সহজ এক্সচেঞ্জ ও রিটার্ন গ্যারান্টি'
    },
    products: [
      {
        id: 'fab-101',
        title: 'Premium Heavyweight Drop-Shoulder T-Shirt',
        titleBn: 'প্রিমিয়াম ড্রপ-শোল্ডার ওভারসাইজড টি-শার্ট',
        category: 'T-Shirts',
        price: 650,
        originalPrice: 850,
        discountPercent: 24,
        inStock: true,
        stockCount: 42,
        rating: 4.9,
        reviewsCount: 312,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
        colors: ['Jet Black', 'Off White', 'Olive Green', 'Deep Navy'],
        sizes: ['M (Chest 40)', 'L (Chest 42)', 'XL (Chest 44)', 'XXL (Chest 46)'],
        specs: '100% Combed Compact Cotton, 220+ GSM, Bio-washed, Pre-shrunk, Breathable & Ultra Soft.',
        shortDesc: 'প্রিমিয়াম ২২০+ জিএসএম পিওর কটন ড্রপ-শোল্ডার টি-শার্ট। ডেইলি ও ক্যাজুয়াল ওয়্যারের জন্য সেরা।'
      },
      {
        id: 'fab-102',
        title: 'Supima Cotton Classic Polo Shirt',
        titleBn: 'সুপিমা কটন ক্লাসিক পোলো শার্ট',
        category: 'Polo Shirts',
        price: 1150,
        originalPrice: 1450,
        discountPercent: 21,
        inStock: true,
        stockCount: 28,
        rating: 4.8,
        reviewsCount: 189,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
        colors: ['Royal Maroon', 'Charcoal Grey', 'Sky Blue', 'Forest Green'],
        sizes: ['M (Chest 39)', 'L (Chest 41)', 'XL (Chest 43)', 'XXL (Chest 45)'],
        specs: 'American Supima Cotton, Mercerized finish, Contrast collar piping, High durability buttons.',
        shortDesc: 'অফিসিয়াল ও সেমি-ফরমাল লুকের জন্য সুপিমা কটন প্রিমিয়াম পোলো শার্ট।'
      },
      {
        id: 'fab-103',
        title: 'Winter Fleece Oversized Heavy Hoodie',
        titleBn: 'উইন্টার ফ্লিস ওভারসাইজড কমফি হুডি',
        category: 'Winter Wear',
        price: 1490,
        originalPrice: 1890,
        discountPercent: 21,
        inStock: true,
        stockCount: 15,
        rating: 4.95,
        reviewsCount: 420,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
        colors: ['Matte Black', 'Heather Grey', 'Coffee Brown', 'Sage Green'],
        sizes: ['M', 'L', 'XL', 'XXL'],
        specs: '340+ GSM Brushed Fleece inside, Double-layered hood, Kangaroo pouch pocket, Anti-pilling.',
        shortDesc: 'শীতের জন্য এক্সট্রা ওয়ার্ম ৩৪০+ জিএসএম ইনার ফ্লিস হুডি। অত্যন্ত আরামদায়ক ও স্টাইলিশ।'
      },
      {
        id: 'fab-104',
        title: 'Slim Fit 4-Way Stretch Chino Pants',
        titleBn: 'স্লিম ফিট ফোর-ওয়ে স্ট্রেচ চিনো প্যান্ট',
        category: 'Bottoms',
        price: 1350,
        originalPrice: 1650,
        discountPercent: 18,
        inStock: true,
        stockCount: 34,
        rating: 4.7,
        reviewsCount: 145,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
        colors: ['Khaki', 'Dark Charcoal', 'Navy Blue', 'Beige'],
        sizes: ['30', '32', '34', '36', '38'],
        specs: '98% Twill Cotton + 2% Elastane, YKK Zip fly, Deep safety pockets, wrinkle-resistant.',
        shortDesc: 'সারা দিন পরে থাকার মতো আরামদায়ক ফোর-ওয়ে স্ট্রেচেবল চিনো ট্রাউজার।'
      },
      {
        id: 'fab-105',
        title: 'Semi-Formal Jacquard Weave Festive Panjabi',
        titleBn: 'জ্যাকার্ড উইভ ফেস্টিভ সেমি-ফরমাল পাঞ্জাবি',
        category: 'Panjabi',
        price: 2250,
        originalPrice: 2750,
        discountPercent: 18,
        inStock: true,
        stockCount: 19,
        rating: 4.85,
        reviewsCount: 98,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        colors: ['Pearl White', 'Deep Teal', 'Soft Lavender', 'Midnight Black'],
        sizes: ['40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'],
        specs: 'Fine Viscose-Cotton Jacquard, Hand-carved metal buttons, Contrast inner collar band.',
        shortDesc: 'যেকোনো উৎসব ও স্পেশাল অকেশনের জন্য মার্জিত ডিজাইনের জ্যাকার্ড পাঞ্জাবি।'
      },
      {
        id: 'fab-106',
        title: 'Velvet Oud & Amber Solid Artisan Perfume',
        titleBn: 'ভেলভেট উদ অ্যান্ড অ্যাম্বার আর্টিশান পারফিউম',
        category: 'Fragrance',
        price: 790,
        originalPrice: 990,
        discountPercent: 20,
        inStock: true,
        stockCount: 22,
        rating: 4.9,
        reviewsCount: 215,
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
        colors: ['50ml Glass Spray'],
        sizes: ['50 ml Eau De Parfum'],
        specs: 'Long-lasting 10-12 hours projection, Top notes: Bergamot & Cardamom, Base: Cambodian Oud & Warm Amber.',
        shortDesc: '১০-১২ ঘণ্টা লং লাস্টিং প্রজেকশন সহ প্রিমিয়াম কম্বোডিয়ান উদ সুবাস।'
      }
    ]
  },

  'gadgetandgear.com': {
    id: 'gadgetandgear',
    name: 'Gadget & Gear Bangladesh',
    shortName: 'Gadget & Gear Official',
    domain: 'gadgetandgear.com',
    category: 'Electronics & Gadgets',
    badge: 'Apple Authorized Reseller & Premium Tech Hub',
    avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80',
    deliveryPolicy: {
      dhakaCost: 80,
      outsideCost: 150,
      dhakaTime: 'সেম-ডে এক্সপ্রেস (১২-২৪ ঘণ্টা)',
      outsideTime: '১-২ কার্যদিবস',
      codAvailable: true,
      returnPolicy: '১০ দিনের অফিসিয়াল রিপ্লেসমেন্ট এবং ১ বছরের অফিশিয়াল ওয়ারেন্টি'
    },
    products: [
      {
        id: 'gng-201',
        title: 'Apple AirPods Pro 2nd Gen (Type-C MagSafe)',
        titleBn: 'অ্যাপল এয়ারপডস প্রো ২য় প্রজন্ম (টাইপ-সি ম্যাগসেফ)',
        category: 'Audio',
        price: 26500,
        originalPrice: 29500,
        discountPercent: 10,
        inStock: true,
        stockCount: 14,
        rating: 4.98,
        reviewsCount: 520,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
        colors: ['White Gloss'],
        sizes: ['Case + 4 Ear Tip Sizes (XS, S, M, L)'],
        specs: 'H2 Chip, 2x Stronger Active Noise Cancellation, Adaptive Audio, Transparency Mode, 30h battery life with MagSafe Case.',
        shortDesc: 'হালনাগাদ ইউএসবি-সি পোর্ট, ২ গুণ শক্তিশালী নয়েজ ক্যান্সেলেশন এবং ৩০ ঘণ্টার ব্যাকআপ।'
      },
      {
        id: 'gng-202',
        title: 'Apple Watch Ultra 2 Titanium (49mm GPS + Cellular)',
        titleBn: 'অ্যাপল ওয়াচ আল্ট্রা ২ টাইটানিয়াম (৪৯মিমি)',
        category: 'Wearables',
        price: 94500,
        originalPrice: 99000,
        discountPercent: 5,
        inStock: true,
        stockCount: 7,
        rating: 4.95,
        reviewsCount: 180,
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
        colors: ['Natural Titanium with Alpine Loop', 'Ocean Band Blue', 'Trail Loop Grey'],
        sizes: ['49mm Titanium Case'],
        specs: 'S9 SiP, 3000 nits brightest display, Double Tap gesture, 36h normal / 72h low power battery, 100m water resistant.',
        shortDesc: 'অ্যারোস্পেস গ্রেড টাইটানিয়াম বডি, ৩০০০ নিটস ডিসপ্লে ও ডাবল ট্যাপ জেসচার কন্ট্রোল।'
      },
      {
        id: 'gng-203',
        title: 'Anker 737 GaN 24,000mAh 140W Ultra Fast Power Bank',
        titleBn: 'অ্যাঙ্কার ৭৩৭ জিএএন ২৪,০০০ এমএএইচ ১৪০ ওয়াট ফাস্ট পাওয়ার ব্যাংক',
        category: 'Charging & Power',
        price: 11800,
        originalPrice: 13500,
        discountPercent: 13,
        inStock: true,
        stockCount: 25,
        rating: 4.9,
        reviewsCount: 310,
        image: 'https://images.unsplash.com/photo-1609592424368-80e927bb8c5a?w=600&auto=format&fit=crop&q=80',
        colors: ['Space Grey'],
        sizes: ['24,000 mAh Capacity'],
        specs: '140W Two-Way Fast Charging via Power Delivery 3.1, Smart Digital Display showing power in/out and remaining time, charges MacBook Pro at full speed.',
        shortDesc: 'ম্যাকবুক ও স্মার্টফোন একসাথে ফুল স্পিডে চার্জ করার জন্য ১৪০ ওয়াট পাওয়ার ডেলিভারি।'
      },
      {
        id: 'gng-204',
        title: 'MagSafe 15W Magnetic Fast Wireless Car Mount & Charger',
        titleBn: 'ম্যাগসেফ ১৫ ওয়াট ম্যাগনেটিক ফাস্ট ওয়্যারলেস কার মাউন্ট',
        category: 'Accessories',
        price: 3200,
        originalPrice: 3800,
        discountPercent: 16,
        inStock: true,
        stockCount: 40,
        rating: 4.75,
        reviewsCount: 160,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
        colors: ['Matte Black with Zinc Rim'],
        sizes: ['Universal Air Vent Clip + Suction Base'],
        specs: 'N52 Ultra-strong neodymium magnets, 15W Qi Fast Charging, 360-degree rotation, smart cooling vents.',
        shortDesc: 'গাড়িতে ফোন ড্রপ হওয়ার কোনো ভয় নেই—সুপার স্ট্রং ম্যাগনেট ও ১৫ ওয়াট ওয়্যারলেস ফাস্ট চার্জিং।'
      },
      {
        id: 'gng-205',
        title: 'Samsung Galaxy S24 Ultra 512GB (AI Edition)',
        titleBn: 'স্যামসাং গ্যালাক্সি এস২৪ আল্ট্রা ৫১২জিবি (টাইটানিয়াম গ্রে)',
        category: 'Smartphones',
        price: 154000,
        originalPrice: 162000,
        discountPercent: 5,
        inStock: true,
        stockCount: 6,
        rating: 4.99,
        reviewsCount: 240,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
        colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet'],
        sizes: ['12GB RAM + 512GB Storage'],
        specs: 'Snapdragon 8 Gen 3, Galaxy AI features, 200MP Quad Camera, 5000mAh Battery, S-Pen included, 7 years OS updates.',
        shortDesc: 'অফিসিয়াল গ্যালাক্সি এআই ক্যামেরা ও পাওয়ারফুল পারফরম্যান্স সহ ফ্ল্যাগশিপ মাস্টারপিস।'
      },
      {
        id: 'gng-206',
        title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        titleBn: 'সনি ডব্লিউএইচ-১০০০এক্সএম৫ প্রিমিয়াম ওয়্যারলেস হেডফোন',
        category: 'Audio',
        price: 34500,
        originalPrice: 38000,
        discountPercent: 9,
        inStock: true,
        stockCount: 12,
        rating: 4.92,
        reviewsCount: 198,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        colors: ['Black', 'Silver Platinum'],
        sizes: ['Over-Ear Cushion'],
        specs: 'Industry-leading Active Noise Cancellation with Auto NC Optimizer, 30-hour battery life, 3-min quick charge for 3 hours play, LDAC Hi-Res Audio.',
        shortDesc: 'বিশ্বসেরা নোয়েজ ক্যান্সেলেশন ও ৩০ ঘণ্টার ব্যাটারি ব্যাকআপ।'
      }
    ]
  },

  'aarong.com': {
    id: 'aarong',
    name: 'Aarong Bangladesh',
    shortName: 'Aarong Official',
    domain: 'aarong.com',
    category: 'Heritage Fashion & Lifestyle',
    badge: 'BRAC Social Enterprise Verified',
    avatar: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=150&auto=format&fit=crop&q=80',
    deliveryPolicy: {
      dhakaCost: 70,
      outsideCost: 130,
      dhakaTime: '২৪-৪৮ ঘণ্টা',
      outsideTime: '৩-৪ কার্যদিবস',
      codAvailable: true,
      returnPolicy: 'আড়ং-এর যেকোনো আউটলেটে ৩০ দিনের এক্সচেঞ্জ সুবিধা'
    },
    products: [
      {
        id: 'arn-301',
        title: 'Silk Blend Hand Embroidered Festive Panjabi',
        titleBn: 'সিল্ক ব্লেন্ড হ্যান্ড এমব্রয়ডারি এক্সক্লুসিভ পাঞ্জাবি',
        category: 'Mens Ethnic',
        price: 4850,
        originalPrice: 5500,
        discountPercent: 12,
        inStock: true,
        stockCount: 16,
        rating: 4.95,
        reviewsCount: 380,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        colors: ['Deep Royal Navy', 'Off-white Ivory', 'Burgundy Wine'],
        sizes: ['40 (M)', '42 (L)', '44 (XL)', '46 (XXL)'],
        specs: 'Pure Handloom Silk Blend, Zari and threadwork around placket, mandarin collar, tailored cut.',
        shortDesc: 'হাতে করা জারী ও সুতোর নিখুঁত কারুকাজ সমৃদ্ধ প্রিমিয়াম সিল্ক ব্লেন্ড পাঞ্জাবি।'
      },
      {
        id: 'arn-302',
        title: 'Traditional Handloom Pure Cotton Jamdani Saree',
        titleBn: 'ঐতিহ্যবাহী তাঁতের খাঁটি জামদানি শাড়ি',
        category: 'Sarees',
        price: 12500,
        originalPrice: 14500,
        discountPercent: 14,
        inStock: true,
        stockCount: 8,
        rating: 4.99,
        reviewsCount: 140,
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
        colors: ['Classic Red & Gold', 'Black & Silver Zari', 'Pastel Mint Green'],
        sizes: ['Standard 12 Haat with Unstitched Blouse Piece'],
        specs: '100% fine cotton yarn, 84 count thread, completely hand-woven by master weavers of Narayanganj.',
        shortDesc: 'নারায়ণগঞ্জের ঐতিহ্যবাহী তাঁতিদের হাতে বোনা ৮৪ কাউন্টের পিওর কটন জামদানি শাড়ি।'
      },
      {
        id: 'arn-303',
        title: 'Floral Block Print Designer Women’s Kurti',
        titleBn: 'ফ্লোরাল ব্লক প্রিন্ট ডিজাইনার উইমেন্স কুর্তি',
        category: 'Womenswear',
        price: 2150,
        originalPrice: 2600,
        discountPercent: 17,
        inStock: true,
        stockCount: 35,
        rating: 4.8,
        reviewsCount: 210,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
        colors: ['Mustard Yellow', 'Indigo Indigo', 'Peach Rose'],
        sizes: ['34', '36', '38', '40', '42'],
        specs: '100% Breathable Khadi Cotton, Natural vegetable dyes, Side slit cut, wooden buttons.',
        shortDesc: 'খাদি কটনের উপর প্রাকৃতিক রঙের ট্র্যাডিশনাল ব্লক প্রিন্ট কুর্তি।'
      },
      {
        id: 'arn-304',
        title: 'Handcrafted Genuine Top-Grain Leather Bifold Wallet',
        titleBn: 'হ্যান্ডক্রাফটেড টপ-গ্রেইন জেনুইন লেদার ওয়ালেট',
        category: 'Leather Goods',
        price: 1850,
        originalPrice: 2200,
        discountPercent: 16,
        inStock: true,
        stockCount: 50,
        rating: 4.9,
        reviewsCount: 460,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
        colors: ['Vintage Tan Brown', 'Midnight Black', 'Chocolate Brown'],
        sizes: ['Compact Bifold with Coin Pouch'],
        specs: 'Full top-grain cowhide leather, RFID blocking lining, 8 card slots, 2 bill compartments.',
        shortDesc: '১০০% আসল লেদারের তৈরি দীর্ঘস্থায়ী ও স্মার্ট আরএফআইডি প্রটেকশন ওয়ালেট।'
      },
      {
        id: 'arn-305',
        title: 'Artisan Nakshi Kantha Hand-Embroidered Cushion Cover',
        titleBn: 'নকশী কাঁথা হ্যান্ড-এমব্রয়ডার্ড কুশন কভার (সেট অব ২)',
        category: 'Home Decor',
        price: 850,
        originalPrice: 1100,
        discountPercent: 23,
        inStock: true,
        stockCount: 24,
        rating: 4.88,
        reviewsCount: 115,
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80',
        colors: ['Multi-color Folk Motifs', 'Monochrome Indigo'],
        sizes: ['16x16 inches (Set of 2)'],
        specs: 'Pure cotton fabric, hand-stitched running kantha motifs, hidden zipper back.',
        shortDesc: 'বাংলার ঐতিহ্যবাহী হস্তশিল্প নকশী কাঁথা মোটিফের দৃষ্টিনন্দন কুশন কভার।'
      }
    ]
  },

  'shajgoj.com': {
    id: 'shajgoj',
    name: 'Shajgoj Beauty & Cosmetics',
    shortName: 'Shajgoj Official',
    domain: 'shajgoj.com',
    category: 'Beauty, Skincare & Personal Care',
    badge: '100% Authentic Guaranteed Hub',
    avatar: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80',
    deliveryPolicy: {
      dhakaCost: 60,
      outsideCost: 110,
      dhakaTime: '২৪-৪৮ ঘণ্টা',
      outsideTime: '২-৩ কার্যদিবস',
      codAvailable: true,
      returnPolicy: 'সরাসরি ডেলিভারিম্যানের সামনে চেক করে নেওয়ার সুবিধা'
    },
    products: [
      {
        id: 'shj-401',
        title: 'COSRX Advanced Snail 96 Mucin Power Essence (100ml)',
        titleBn: 'কসরএক্স অ্যাডভান্সড স্নেল ৯৬ মিউসিন এসেন্স (১০০ মিলি)',
        category: 'Essence & Serums',
        price: 1450,
        originalPrice: 1750,
        discountPercent: 17,
        inStock: true,
        stockCount: 65,
        rating: 4.97,
        reviewsCount: 890,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
        colors: ['100ml Clear Pump Bottle'],
        sizes: ['100 ml'],
        specs: '96.3% Snail Secretion Filtrate, Hyaluronic Acid, fragrance-free, restores skin barrier and natural glow.',
        shortDesc: 'স্কিন ব্যারিয়ার রিপেয়ার ও গভীর হাইড্রেশনের জন্য কোরিয়ার এক নম্বর স্নেল এসেন্স।'
      },
      {
        id: 'shj-402',
        title: 'The Ordinary Niacinamide 10% + Zinc 1% (30ml)',
        titleBn: 'দি অর্ডিনারি নায়াসিনামাইড ১০% + জিংক ১% (৩০ মিলি)',
        category: 'Targeted Treatments',
        price: 1150,
        originalPrice: 1400,
        discountPercent: 18,
        inStock: true,
        stockCount: 48,
        rating: 4.85,
        reviewsCount: 640,
        image: 'https://images.unsplash.com/photo-1608248597359-543781255562?w=600&auto=format&fit=crop&q=80',
        colors: ['30ml Dropper Bottle'],
        sizes: ['30 ml'],
        specs: 'Reduces appearance of skin blemishes, pore congestion, balances visible sebum activity.',
        shortDesc: 'ত্বকের ব্রণ, দাগ ও বড় লোমকূপের সমস্যা দূর করতে ক্লিনিক্যাল-গ্রেড নায়াসিনামাইড।'
      },
      {
        id: 'shj-403',
        title: 'Beauty of Joseon Relief Sun : Rice + Probiotics SPF50+ PA++++',
        titleBn: 'বিউটি অব জোসন রিলিফ সান সানস্ক্রিন (৫০ মিলি)',
        category: 'Sun Protection',
        price: 1350,
        originalPrice: 1650,
        discountPercent: 18,
        inStock: true,
        stockCount: 80,
        rating: 4.99,
        reviewsCount: 1120,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        colors: ['50ml Tube'],
        sizes: ['50 ml'],
        specs: '30% Rice Extract + Grain Fermented Extracts, Chemical filter, Zero white cast, Dewy glow finish.',
        shortDesc: 'কোনো হোয়াইট কাস্ট ছাড়া হালকা ময়েশ্চারাইজারের মতো সানস্ক্রিন। ইউভি রশ্মি থেকে সর্বোচ্চ সুরক্ষা।'
      },
      {
        id: 'shj-404',
        title: 'CeraVe Foaming Facial Cleanser for Normal to Oily Skin (237ml)',
        titleBn: 'সেরাভি ফোমিং ফেসিয়াল ক্লিনজার (২৩৭ মিলি)',
        category: 'Cleansers',
        price: 1650,
        originalPrice: 1950,
        discountPercent: 15,
        inStock: true,
        stockCount: 30,
        rating: 4.9,
        reviewsCount: 430,
        image: 'https://images.unsplash.com/photo-1556228722-d0b77732a326?w=600&auto=format&fit=crop&q=80',
        colors: ['237ml Dispenser Bottle'],
        sizes: ['237 ml (8 fl oz)'],
        specs: 'Contains 3 essential ceramides, hyaluronic acid, and niacinamide. Non-comedogenic, fragrance-free.',
        shortDesc: 'ত্বকের প্রাকৃতিক আর্দ্রতা বজায় রেখে অতিরিক্ত তেল ও ধুলাবালি পরিষ্কার করে।'
      },
      {
        id: 'shj-405',
        title: 'Laneige Lip Sleeping Mask (Berry 20g)',
        titleBn: 'লানিজ লিপ স্লিপিং মাস্ক - বেরি (২০ গ্রাম)',
        category: 'Lip Care',
        price: 1250,
        originalPrice: 1500,
        discountPercent: 17,
        inStock: true,
        stockCount: 44,
        rating: 4.92,
        reviewsCount: 510,
        image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=600&auto=format&fit=crop&q=80',
        colors: ['Berry Pink'],
        sizes: ['20g Tub'],
        specs: 'Berry Fruit Complex, Vitamin C, Coconut oil, overnight melting texture leaves lips plump and soft.',
        shortDesc: 'রাতে ঘুমানোর আগে ব্যবহার করলে ঠোঁট ফাটা দূর করে ঠোঁটকে করে নরম ও গোলাপি।'
      }
    ]
  },

  'daraz.com.bd': {
    id: 'daraz',
    name: 'Daraz Verified Mall',
    shortName: 'Daraz Mall Store',
    domain: 'daraz.com.bd',
    category: 'Mega Marketplace',
    badge: '100% Genuine Mall Verified',
    avatar: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80',
    deliveryPolicy: {
      dhakaCost: 65,
      outsideCost: 125,
      dhakaTime: '২৪-৭২ ঘণ্টা',
      outsideTime: '৩-৫ কার্যদিবস',
      codAvailable: true,
      returnPolicy: '১৪ দিনের দারাজ মানি-ব্যাক পলিসি'
    },
    products: [
      {
        id: 'drz-501',
        title: 'Deep Bass RGB Portable Wireless Bluetooth Speaker',
        titleBn: 'ডিপ বাস আরজিবি পোর্টেবল ওয়্যারলেস ব্লুটুথ স্পিকার',
        category: 'Electronics',
        price: 1850,
        originalPrice: 2400,
        discountPercent: 23,
        inStock: true,
        stockCount: 38,
        rating: 4.78,
        reviewsCount: 320,
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
        colors: ['Midnight Black', 'Camouflage Green'],
        sizes: ['Compact 20W'],
        specs: '20W Dual Drivers, IPX6 Water-Resistant, 12h Battery Playtime, Bluetooth 5.3 + TF Card + AUX.',
        shortDesc: 'জোরালো বাস, কালারফুল আরজিবি লাইটিং ও ১২ ঘণ্টা পর্যন্ত টানা মিউজিক ব্যাকআপ।'
      },
      {
        id: 'drz-502',
        title: 'Ergonomic Breathable Mesh High-Back Office & Gaming Chair',
        titleBn: 'এরগনোমিক হাই-ব্যাক অফিস ও গেমিং রিভলভিং চেয়ার',
        category: 'Furniture & Workstation',
        price: 8900,
        originalPrice: 11500,
        discountPercent: 22,
        inStock: true,
        stockCount: 11,
        rating: 4.84,
        reviewsCount: 175,
        image: 'https://images.unsplash.com/photo-1580481077195-c328ad4f4f72?w=600&auto=format&fit=crop&q=80',
        colors: ['Black & Grey Mesh'],
        sizes: ['Adjustable Height 45-55cm'],
        specs: 'Adaptive Lumbar Support, 3D Adjustable Armrests, 135-degree recline with tilt lock, heavy-duty nylon base.',
        shortDesc: 'কোমরের ব্যথামুক্ত দীর্ঘ সময় বসে কাজের জন্য প্রিমিয়াম এরগনোমিক রিভলভিং চেয়ার।'
      },
      {
        id: 'drz-503',
        title: 'Vacuum Insulated Stainless Steel Tumbler Thermos (900ml)',
        titleBn: 'ভ্যাকুয়াম ইনসুলেটেড স্টেইনলেস স্টিল থার্মাস টাম্বলার (৯০০ মিলি)',
        category: 'Kitchen & Lifestyle',
        price: 1150,
        originalPrice: 1500,
        discountPercent: 23,
        inStock: true,
        stockCount: 52,
        rating: 4.89,
        reviewsCount: 290,
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
        colors: ['Matte Black', 'Emerald Green', 'Arctic White', 'Pastel Pink'],
        sizes: ['900 ml with Straw + Lid'],
        specs: 'Double-wall food grade 304 stainless steel, keeps cold for 24h and hot for 12h, leak-proof flip lid.',
        shortDesc: '২৪ ঘণ্টা বরফ ঠান্ডা এবং ১২ ঘণ্টা গরম রাখার গ্যারান্টি সহ ট্রাভেল টাম্বলার।'
      },
      {
        id: 'drz-504',
        title: 'Wireless Mechanical Keyboard (Hot-Swappable Red Switches)',
        titleBn: 'ওয়্যারলেস মেকানিক্যাল কিবোর্ড (হট-সোয়াপ রেড্রাগন সুইচ)',
        category: 'Gaming & Tech',
        price: 3650,
        originalPrice: 4400,
        discountPercent: 17,
        inStock: true,
        stockCount: 19,
        rating: 4.91,
        reviewsCount: 215,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
        colors: ['Retro White-Grey', 'Cyberpunk Neon'],
        sizes: ['75% Compact 84-Key Layout'],
        specs: 'Tri-mode: Bluetooth 5.0 / 2.4GHz Dongle / Type-C wired, Custom Sound dampening foam, RGB South-facing LEDs.',
        shortDesc: 'মসৃণ টাইপিং ও গেমিংয়ের জন্য ট্রাই-মোড হট-সোয়াপ ওয়্যারলেস মেকানিক্যাল কিবোর্ড।'
      }
    ]
  }
};

class CatalogEngine {
  constructor() {
    this.currentStore = null;
    this.activeProducts = [];
    this.customProducts = [];
    this.loadDefaultStore();
  }

  loadDefaultStore() {
    this.setStoreByDomain('fabrilife.com');
  }

  cleanDomain(input) {
    if (!input) return '';
    let domain = input.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0];
    return domain;
  }

  setStoreByDomain(inputUrl) {
    const domain = this.cleanDomain(inputUrl);

    // 1. Direct match with preset stores
    for (const key in PRESET_STORES) {
      if (domain === key || domain.includes(key.replace('.com', '').replace('.bd', ''))) {
        this.currentStore = JSON.parse(JSON.stringify(PRESET_STORES[key]));
        this.activeProducts = [...this.currentStore.products];
        return { success: true, store: this.currentStore, isSynthesized: false };
      }
    }

    // 2. Synthesize store catalog from URL heuristics
    const synthesized = this.generateCatalogForDomain(domain);
    this.currentStore = synthesized;
    this.activeProducts = [...synthesized.products];
    return { success: true, store: this.currentStore, isSynthesized: true };
  }

  setManualProduct(productData) {
    const pId = 'custom-' + Date.now();
    const newProduct = {
      id: pId,
      title: productData.title || 'কাস্টম প্রিমিয়াম আইটেম',
      titleBn: productData.titleBn || productData.title || 'কাস্টম প্রিমিয়াম আইটেম',
      category: productData.category || 'Special Collection',
      price: Number(productData.price) || 990,
      originalPrice: Number(productData.originalPrice) || (Number(productData.price) ? Math.round(Number(productData.price) * 1.25) : 1250),
      discountPercent: productData.originalPrice && productData.price ? Math.round((1 - productData.price / productData.originalPrice) * 100) : 20,
      inStock: productData.inStock !== false,
      stockCount: Number(productData.stockCount) || 25,
      rating: 4.9,
      reviewsCount: 88,
      image: productData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      colors: productData.colors || ['Black', 'Navy', 'White'],
      sizes: productData.sizes || ['Standard / Regular'],
      specs: productData.specs || 'প্রিমিয়াম কোয়ালিটি গ্যারান্টি, ১০০% অথেনটিক মেটেরিয়াল।',
      shortDesc: productData.shortDesc || productData.specs || 'গ্রাহকের দেওয়া স্পেসিফিকেশন অনুযায়ী তৈরি প্রোডাক্ট।'
    };

    if (!this.currentStore) {
      this.currentStore = {
        id: 'custom-store',
        name: 'My Custom E-Commerce Store',
        shortName: 'Store Official',
        domain: 'custom-store.local',
        category: 'Custom E-Commerce',
        badge: 'Merchant Verified',
        avatar: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80',
        deliveryPolicy: {
          dhakaCost: productData.dhakaCost || 60,
          outsideCost: productData.outsideCost || 120,
          dhakaTime: '২৪-৪৮ ঘণ্টা',
          outsideTime: '২-৩ কার্যদিবস',
          codAvailable: true,
          returnPolicy: '৭ দিনের সহজ রিটার্ন বা এক্সচেঞ্জ'
        },
        products: []
      };
    }

    // Insert at front of active products
    this.activeProducts.unshift(newProduct);
    this.currentStore.products.unshift(newProduct);
    return newProduct;
  }

  generateCatalogForDomain(domain) {
    const rawName = domain.split('.')[0] || 'MyStore';
    const storeName = rawName.charAt(0).toUpperCase() + rawName.slice(1) + ' Store';

    // Heuristics based on domain name keywords
    let category = 'Fashion & Lifestyle';
    let heroImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&auto=format&fit=crop&q=80';
    let products = [];

    if (/shoe|footwear|sneaker|kicks|apex|bata|lotto|sandal|loafer/i.test(domain)) {
      category = 'Footwear & Shoes';
      heroImg = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80';
      products = [
        {
          id: 'gen-s1',
          title: 'Air Cushion Lightweight Breathable Running Sneakers',
          titleBn: 'এয়ার কুশন লাইটওয়েট রানিং স্নিকার্স',
          category: 'Men Shoes',
          price: 2450,
          originalPrice: 3200,
          discountPercent: 23,
          inStock: true,
          stockCount: 18,
          rating: 4.85,
          reviewsCount: 110,
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
          colors: ['Crimson Red', 'All Black', 'Pure White'],
          sizes: ['40', '41', '42', '43', '44'],
          specs: 'Anti-slip rubber sole, Breathable flyknit upper, High-rebound memory insole.',
          shortDesc: 'হাঁটাহাঁটি, রানিং ও জিমের জন্য হালকা ও বাতাস চলাচল উপযোগী রানিং স্নিকার্স।'
        },
        {
          id: 'gen-s2',
          title: 'Genuine Leather Handcrafted Formal Loafers',
          titleBn: 'জেনুইন লেদার হ্যান্ডক্রাফটেড ফরমাল লোফার',
          category: 'Formal Shoes',
          price: 3850,
          originalPrice: 4600,
          discountPercent: 16,
          inStock: true,
          stockCount: 12,
          rating: 4.9,
          reviewsCount: 85,
          image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80',
          colors: ['Deep Tan Brown', 'Jet Black'],
          sizes: ['40', '41', '42', '43', '44'],
          specs: 'Full grain cowhide leather, Cushioned arch support, hand-stitched welt.',
          shortDesc: 'অফিস ও ফরমাল যে কোনো মিটিংয়ের জন্য আরামদায়ক আসল লেদারের লোফার।'
        }
      ];
    } else if (/tech|gadget|mobile|phone|electronic|computer|pc|laptop|startech|ryans|techland|gear|audio|headphone/i.test(domain)) {
      category = 'Electronics & Gadgets';
      heroImg = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80';
      products = [
        {
          id: 'gen-t1',
          title: 'ANC Wireless Bluetooth Earbuds Pro',
          titleBn: 'এএনসি ওয়্যারলেস ব্লুটুথ ইয়ারবাডস প্রো',
          category: 'Audio',
          price: 2150,
          originalPrice: 2850,
          discountPercent: 25,
          inStock: true,
          stockCount: 35,
          rating: 4.9,
          reviewsCount: 165,
          image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
          colors: ['Matte Black', 'Pearl White'],
          sizes: ['Universal In-Ear with 3-size tips'],
          specs: '35dB Active Noise Cancellation, Bluetooth 5.3, 30-hour total battery life, IPX5 waterproof.',
          shortDesc: 'ক্রিস্টাল ক্লিয়ার কল কোয়ালিটি এবং ডিপ বাস সাউন্ড সহ প্রিমিয়াম ওয়্যারলেস ইয়ারবাডস।'
        },
        {
          id: 'gen-t2',
          title: 'AMOLED Smart Calling Watch with Health Tracking',
          titleBn: 'অ্যামোলেড স্মার্ট কলিং ওয়াচ (হার্টরেট ও ফিটনেস ট্র্যাকার)',
          category: 'Smart Watches',
          price: 3450,
          originalPrice: 4500,
          discountPercent: 23,
          inStock: true,
          stockCount: 22,
          rating: 4.86,
          reviewsCount: 94,
          image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
          colors: ['Space Grey', 'Rose Gold', 'Midnight Blue'],
          sizes: ['1.43-inch AMOLED Display'],
          specs: 'Bluetooth Calling, Always-on Display, SpO2 & 24/7 Heart Rate, 7-day battery life.',
          shortDesc: 'হাই রেজোলিউশন অ্যামোলেড ডিসপ্লে ও ব্লুটুথ কলিং সুবিধা সহ আধুনিক স্মার্টওয়াচ।'
        }
      ];
    } else if (/food|grocery|organic|agro|honey|ghee|tea|chaldal|khejur|dryfruit|snack|spices/i.test(domain)) {
      category = 'Organic Food & Groceries';
      heroImg = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80';
      products = [
        {
          id: 'gen-f1',
          title: '100% Pure Sundarbans Wild Honey (১ কেজি)',
          titleBn: '১০০% খাঁটি সুন্দরবনের খলিশা ফুলের প্রাকৃতিক মধু (১ কেজি)',
          category: 'Natural Honey',
          price: 1150,
          originalPrice: 1400,
          discountPercent: 18,
          inStock: true,
          stockCount: 40,
          rating: 4.98,
          reviewsCount: 280,
          image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
          colors: ['Amber Gold Glass Jar'],
          sizes: ['1 Kg Premium Jar'],
          specs: 'Raw unpasteurized, lab tested zero added sugar, directly collected from Sundarbans mouals.',
          shortDesc: 'সুন্দরবনের গভীর জঙ্গল থেকে সংগৃহীত শতভাগ খাঁটি ও প্রাকৃতিক খলিশা ফুলের কাঁচা মধু।'
        },
        {
          id: 'gen-f2',
          title: 'Traditional Danadar Pure Bilona Cow Ghee (৫০০ গ্রাম)',
          titleBn: 'ঘানি ভাঙা প্রিমিয়াম দানাদার গাওয়া ঘি (৫০০ গ্রাম)',
          category: 'Pure Dairy',
          price: 890,
          originalPrice: 1100,
          discountPercent: 19,
          inStock: true,
          stockCount: 25,
          rating: 4.92,
          reviewsCount: 142,
          image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80',
          colors: ['Golden Yellow'],
          sizes: ['500 gm Food Grade Jar'],
          specs: 'Traditional bilona method, 100% natural grass-fed cow milk, rich aroma, no preservatives.',
          shortDesc: 'খাঁটি গাভীর দুধের মাখন থেকে ঐতিহ্যবাহী পদ্ধতিতে তৈরি সুস্বাদু ও সুগন্ধি দানাদার ঘি।'
        }
      ];
    } else if (/beauty|cosmetic|skin|makeup|glow|care|hair|lotion|serum/i.test(domain)) {
      category = 'Beauty & Skincare';
      heroImg = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80';
      products = [
        {
          id: 'gen-c1',
          title: 'Vitamin C & Niacinamide Glowing Facial Serum',
          titleBn: 'ভিটামিন সি ও নিয়াসিনামাইড গ্লোয়িং ব্রাইটেনিং সিরাম (৩০ মিলি)',
          category: 'Facial Serums',
          price: 950,
          originalPrice: 1250,
          discountPercent: 24,
          inStock: true,
          stockCount: 30,
          rating: 4.91,
          reviewsCount: 195,
          image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
          colors: ['Glass Dropper Bottle'],
          sizes: ['30 ml'],
          specs: '10% Pure Vitamin C + 2% Niacinamide + Hyaluronic Acid, Dermatologically tested, Paraben free.',
          shortDesc: 'ত্বকের কালচে দাগ দূর করে প্রাকৃতিক উজ্জ্বলতা ও মসৃণতা ফিরিয়ে আনতে বিশেষজ্ঞ সিরাম।'
        },
        {
          id: 'gen-c2',
          title: 'SPF 50+ PA++++ Ultra-Light Matte Sunscreen',
          titleBn: 'আল্ট্রা-লাইট নন-গ্রিজি ম্যাট সানস্ক্রিন (৫০ মিলি)',
          category: 'Sun Protection',
          price: 850,
          originalPrice: 1050,
          discountPercent: 19,
          inStock: true,
          stockCount: 42,
          rating: 4.88,
          reviewsCount: 160,
          image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
          colors: ['Invisible Matte Finish'],
          sizes: ['50 ml Tube'],
          specs: 'Broad spectrum UVA/UVB protection, Zero white cast, water-resistant up to 80 mins.',
          shortDesc: 'কোনো আঠালো ভাব বা সাদা দাগ ছাড়া সারাদিন রোদের ক্ষতিকর রশ্মি থেকে সর্বোচ্চ সুরক্ষা।'
        }
      ];
    } else if (/book|boi|library|rokomari|publish/i.test(domain)) {
      category = 'Books & Publications';
      heroImg = 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=150&auto=format&fit=crop&q=80';
      products = [
        {
          id: 'gen-b1',
          title: 'Atomic Habits (বাংলা অনুবাদ - জেমস ক্লিয়ার)',
          titleBn: 'অ্যাটমিক হ্যাবিটস (হার্ডকভার বেস্টসেলার)',
          category: 'Self Development',
          price: 450,
          originalPrice: 600,
          discountPercent: 25,
          inStock: true,
          stockCount: 120,
          rating: 4.99,
          reviewsCount: 420,
          image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
          colors: ['Hardcover Edition'],
          sizes: ['Standard Book Size'],
          specs: '৮০ জিএসএম প্রিমিয়াম ক্রিম পেপার, মজবুত বাঁধাই, হার্ডকভার এডিশন।',
          shortDesc: 'ভালো অভ্যাস গড়ে তোলা ও খারাপ অভ্যাস ভাঙার আন্তর্জাতিক বেস্টসেলার বই।'
        }
      ];
    } else if (/jewel|ornament|gold|diamond|watch|clock|bag|wallet|leather/i.test(domain)) {
      category = 'Watches, Bags & Luxury Accessories';
      heroImg = 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=150&auto=format&fit=crop&q=80';
      products = [
        {
          id: 'gen-w1',
          title: 'Luxury Chronograph Men Quartz Watch',
          titleBn: 'লাক্সারি ক্রোনোগ্রাফ মেনস কোয়ার্টজ ওয়াচ (ওয়াটারপ্রুফ)',
          category: 'Watches',
          price: 2650,
          originalPrice: 3500,
          discountPercent: 24,
          inStock: true,
          stockCount: 20,
          rating: 4.9,
          reviewsCount: 112,
          image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
          colors: ['Emerald Green Dial with Silver', 'All Matte Black', 'Deep Blue with Rose Gold'],
          sizes: ['42mm Case Diameter'],
          specs: 'Japanese Quartz Movement, Sapphire Crystal Glass, 30M Waterproof, Stainless Steel Strap.',
          shortDesc: 'অভিজাত লুক ও নিখুঁত টাইমিংয়ের জন্য স্যাফায়ার ক্রিস্টাল গ্লাস ক্রোনোগ্রাফ ঘড়ি।'
        },
        {
          id: 'gen-w2',
          title: 'Full Grain Leather RFID-Blocking Bifold Wallet',
          titleBn: 'আসল লেদারের আরএফআইডি ব্লকিং প্রিমিয়াম বাইফোল্ড ওয়ালেট',
          category: 'Leather Wallets',
          price: 990,
          originalPrice: 1350,
          discountPercent: 27,
          inStock: true,
          stockCount: 45,
          rating: 4.88,
          reviewsCount: 175,
          image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
          colors: ['Classic Tan Brown', 'Vintage Dark Coffee', 'Jet Black'],
          sizes: ['Compact Pocket Size'],
          specs: '100% Top-grain cowhide leather, RFID theft protection lining, 8 card slots, 2 cash chambers.',
          shortDesc: 'কার্ড ক্লোনিং প্রতিরোধক প্রযুক্তি এবং ১০০% জেনুইন লেদারে তৈরি টেকসই মানিব্যাগ।'
        }
      ];
    } else if (/furniture|decor|home|living|interior|hatil|otobi|regal/i.test(domain)) {
      category = 'Furniture & Home Decor';
      heroImg = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150&auto=format&fit=crop&q=80';
      products = [
        {
          id: 'gen-h1',
          title: 'Ergonomic High-Back Executive Mesh Office Chair',
          titleBn: 'এরগনোমিক হাই-ব্যাক এক্সিকিউটিভ মেশ অফিস চেয়ার',
          category: 'Office Furniture',
          price: 7850,
          originalPrice: 9900,
          discountPercent: 21,
          inStock: true,
          stockCount: 10,
          rating: 4.93,
          reviewsCount: 65,
          image: 'https://images.unsplash.com/photo-1580481077195-c2f82d234731?w=600&auto=format&fit=crop&q=80',
          colors: ['Charcoal Black', 'Slate Grey'],
          sizes: ['Adjustable Height with Lumbar Support'],
          specs: 'Korean breathable mesh, 3D adjustable armrests, heavy-duty nylon base, 135° recline lock.',
          shortDesc: 'দীর্ঘ সময় বসে কাজ করার জন্য মেরুদণ্ড ও কোমরের আরামদায়ক এরগনোমিক সাপোর্ট চেয়ার।'
        }
      ];
    } else {
      // General apparel & lifestyle store
      products = [
        {
          id: 'gen-p1',
          title: 'Signature Minimalist Graphic Tee',
          titleBn: 'সিগনেচার মিনিমালিস্ট গ্রাফিক টি-শার্ট',
          category: 'Casual Wear',
          price: 590,
          originalPrice: 790,
          discountPercent: 25,
          inStock: true,
          stockCount: 30,
          rating: 4.88,
          reviewsCount: 140,
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
          colors: ['Pitch Black', 'Cloud White', 'Sage Olive'],
          sizes: ['M', 'L', 'XL', 'XXL'],
          specs: '100% Ring-spun cotton, High density rubber print, Anti-fade dyes.',
          shortDesc: 'প্রিমিয়াম কম্ফোর্ট কটন মিনিমালিস্ট ডিজাইনার টি-শার্ট।'
        },
        {
          id: 'gen-p2',
          title: 'All-Day Comfort Stretch Casual Trouser',
          titleBn: 'অল-ডে কমফোর্ট স্ট্রেচ ক্যাজুয়াল ট্রাউজার',
          category: 'Bottoms',
          price: 1250,
          originalPrice: 1550,
          discountPercent: 19,
          inStock: true,
          stockCount: 22,
          rating: 4.82,
          reviewsCount: 95,
          image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
          colors: ['Navy', 'Slate Grey', 'Charcoal'],
          sizes: ['30', '32', '34', '36'],
          specs: 'Breathable lightweight cotton blend with flexible waistband.',
          shortDesc: 'দৈনন্দিন চলাচল ও অফিসের জন্য আরামদায়ক ক্যাজুয়াল প্যান্ট।'
        },
        {
          id: 'gen-p3',
          title: 'Premium Smart Water Bottle with LED Temperature Display',
          titleBn: 'স্মার্ট এলইডি টেম্পারেচার ডিসপ্লে ওয়াটার বোতল (৫০০ মিলি)',
          category: 'Accessories',
          price: 650,
          originalPrice: 890,
          discountPercent: 27,
          inStock: true,
          stockCount: 45,
          rating: 4.75,
          reviewsCount: 88,
          image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
          colors: ['Matte Black', 'Royal Blue'],
          sizes: ['500 ml'],
          specs: 'Touch LED lid shows exact water temperature, 304 food-grade stainless steel.',
          shortDesc: 'স্পর্শ করলেই পানির তাপমাত্রা ভেসে ওঠে। ১২ ঘণ্টা ঠান্ডা বা গরম রাখে।'
        }
      ];
    }

    return {
      id: 'gen-' + rawName,
      name: storeName,
      shortName: storeName,
      domain: domain,
      category: category,
      badge: 'Direct Catalog Ingested',
      avatar: heroImg,
      deliveryPolicy: {
        dhakaCost: 60,
        outsideCost: 120,
        dhakaTime: '২৪-৪৮ ঘণ্টা',
        outsideTime: '২-৩ কার্যদিবস',
        codAvailable: true,
        returnPolicy: '৭ দিনের সহজ রিটার্ন বা সাইজ এক্সচেঞ্জ'
      },
      products: products
    };
  }

  // Bengali inflection stemmer helper
  getBengaliStem(word) {
    if (!word || word.length < 3) return word;
    const suffixes = ['গুলোর', 'গুলো', 'গুলা', 'খানা', 'খানি', 'টার', 'টের', 'টির', 'টা', 'টি', 'দের', 'এর', 'কে', 'তে', 'রে', 'র'];
    for (const suf of suffixes) {
      if (word.endsWith(suf) && word.length - suf.length >= 2) {
        return word.slice(0, word.length - suf.length);
      }
    }
    return word;
  }

  findProducts(userQuery) {
    if (!userQuery || !this.activeProducts.length) return [];
    
    // Clean and normalize query text
    const cleanQ = userQuery
      .replace(/[?!.,।;:()'"\[\]{}_+\-*\/\\#@$%^&=~`]/g, ' ')
      .toLowerCase()
      .trim();

    if (!cleanQ) return [];

    // Fallback: full catalog / listing intent
    if (/^(সব|লিস্ট|ক্যাটালগ|প্রোডাক্ট|কালেকশন|দেখাও|তালিকা|all|items|catalog|list|products)$/i.test(cleanQ) || 
        /(ক্যাটালগে কি কি|সব প্রোডাক্ট|কালেকশন দেখাও|all products)/i.test(cleanQ)) {
      return this.activeProducts;
    }

    // Banglish transliteration map to boost match accuracy
    const synonyms = {
      'tshirt': 'টি-শার্ট', 't-shirt': 'টি-শার্ট', 'tee': 'টি-শার্ট',
      'shirt': 'শার্ট', 'polo': 'পোলো',
      'hoodie': 'হুডি', 'winter': 'উইন্টার',
      'pant': 'প্যান্ট', 'pants': 'প্যান্ট', 'chino': 'চিনো',
      'panjabi': 'পাঞ্জাবি', 'punjabi': 'পাঞ্জাবি',
      'perfume': 'পারফিউম', 'attar': 'আতর', 'oud': 'উদ',
      'watch': 'ঘড়ি', 'smartwatch': 'স্মার্টওয়াচ',
      'airpods': 'এয়ারপডস', 'earbuds': 'ইয়ারবাডস', 'headphone': 'হেডফোন',
      'charger': 'চার্জার', 'powerbank': 'পাওয়ার ব্যাংক',
      'shoe': 'জুতা', 'shoes': 'জুতা', 'sneaker': 'স্নিকার্স', 'loafer': 'লোফার',
      'saree': 'শাড়ি', 'jamdani': 'জামদানি',
      'honey': 'মধু', 'ghee': 'ঘি', 'khejur': 'খেজুর',
      'serum': 'সিরাম', 'sunscreen': 'সানস্ক্রিন', 'cleanser': 'ক্লিনজার',
      'chair': 'চেয়ার', 'bottle': 'বোতল', 'wallet': 'ওয়ালেট'
    };

    // Generic stop words in Bengali & Banglish that shouldn't match products on their own
    const stopWords = new Set([
      'এই', 'কি', 'কী', 'আছে', 'হবে', 'কেমন', 'বলুন', 'একটু', 'দাও', 'দেখান', 'জানতে', 
      'চাই', 'দাম', 'কত', 'কতো', 'প্রাইস', 'সম্পর্কে', 'নাকি', 'এবং', 'বা', 'না', 
      'koto', 'dam', 'price', 'ache', 'hobe', 'kemon', 'bolun', 'chai', 'dehan', 'eta', 'ei'
    ]);

    const rawTokens = cleanQ.split(/\s+/).filter(w => w.length > 1);
    const searchTokens = [];

    for (const t of rawTokens) {
      if (!stopWords.has(t)) {
        searchTokens.push(t);
        const stem = this.getBengaliStem(t);
        if (stem !== t && !stopWords.has(stem)) {
          searchTokens.push(stem);
        }
        if (synonyms[t]) {
          searchTokens.push(synonyms[t]);
        }
      }
    }

    if (searchTokens.length === 0) {
      // If only stop words existed (e.g. "দাম কত?"), return active product or empty
      return [];
    }

    // Score products based on token matching
    const scored = this.activeProducts.map(p => {
      let score = 0;
      const titleLower = (p.title || '').toLowerCase();
      const titleBnLower = (p.titleBn || '').toLowerCase();
      const catLower = (p.category || '').toLowerCase();
      const descLower = ((p.shortDesc || '') + ' ' + (p.specs || '')).toLowerCase();
      const variantsLower = [...(p.colors || []), ...(p.sizes || [])].join(' ').toLowerCase();

      for (const token of searchTokens) {
        // High weight: product title matches token or stem
        if (titleBnLower.includes(token) || titleLower.includes(token)) {
          score += 10;
        } else if (token.length >= 3 && (titleBnLower.includes(token.slice(0, -1)) || titleLower.includes(token.slice(0, -1)))) {
          score += 7;
        }

        // Bi-directional matching: does the token contain any title keyword?
        const titleWords = (titleBnLower + ' ' + titleLower).split(/\s+/).filter(w => w.length >= 3);
        if (titleWords.some(tw => token.includes(tw))) {
          score += 8;
        }

        // Medium weight: Category
        if (catLower.includes(token)) {
          score += 5;
        }

        // Variant weight: Colors, Sizes
        if (variantsLower.includes(token)) {
          score += 3;
        }

        // Description / Specs
        if (descLower.includes(token)) {
          score += 2;
        }
      }

      return { product: p, score: score };
    });

    const matches = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    return matches;
  }

  getProductById(id) {
    return this.activeProducts.find(p => p.id === id) || null;
  }

  getAllProducts() {
    return this.activeProducts;
  }

  getCurrentStore() {
    return this.currentStore;
  }
}

// Attach to window and module
if (typeof window !== 'undefined') {
  window.CatalogEngine = CatalogEngine;
  window.PRESET_STORES = PRESET_STORES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CatalogEngine, PRESET_STORES };
}
