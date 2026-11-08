-- =============================================================================
-- GIFTORA DATABASE SEED SCRIPT (DEVELOPMENT / DEMO ONLY)
-- Clearly labelled illustrative development records
-- NEVER represents live marketplace inventory
-- =============================================================================

USE `giftora_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Demo User
-- Password for demo user is "SecretGift123!" (Argon2 hashed)
-- Hash generated with argon2id
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `is_active`, `is_verified`, `created_at`, `updated_at`)
VALUES (
  'usr-demo-001',
  'Ananya Sharma',
  'ananya.sharma@example.com',
  '$argon2id$v=19$m=65536,t=3,p=4$2q1H5w8M6tK3xL9v$Hq8U3z2b4Y6w8J0k1L3n5P7r9T1v3X5z7B9d1F3h5J7',
  1,
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

INSERT INTO `user_preferences` (`id`, `user_id`, `preferred_currency`, `preferred_language`, `preferred_gift_style`, `created_at`, `updated_at`)
VALUES (
  'pref-demo-001',
  'usr-demo-001',
  'INR',
  'en',
  'thoughtful',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE `preferred_currency` = VALUES(`preferred_currency`);

-- 2. Demo Recipients
INSERT INTO `recipients` (`id`, `user_id`, `name`, `relationship`, `date_of_birth`, `notes`, `created_at`, `updated_at`)
VALUES
(
  'rec-demo-001',
  'usr-demo-001',
  'Pooja',
  'Sister',
  '1998-04-18',
  'Appreciates artisanal botanical scents, handmade pottery, and quiet reading evenings. Avoid harsh synthetic fragrances.',
  NOW(),
  NOW()
),
(
  'rec-demo-002',
  'usr-demo-001',
  'Arjun',
  'Best Friend',
  '1995-11-24',
  'Upgrading his minimalist remote desk. Enjoys mechanical keyboards and single-estate pour-over beans.',
  NOW(),
  NOW()
),
(
  'rec-demo-003',
  'usr-demo-001',
  'Meera (Mom)',
  'Mom',
  '1968-08-12',
  'Cherishes authentic Ayurvedic heritage skincare and pure handloom textiles.',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Recipient Interests
INSERT INTO `recipient_interests` (`id`, `recipient_id`, `interest_name`, `interest_category`)
VALUES
('int-001', 'rec-demo-001', 'Aromatherapy & Candles', 'Wellness'),
('int-002', 'rec-demo-001', 'Ceramics & Pottery', 'Home & Living'),
('int-003', 'rec-demo-001', 'Minimalist Fashion', 'Apparel'),
('int-004', 'rec-demo-002', 'Specialty Coffee', 'Gourmet'),
('int-005', 'rec-demo-002', 'Mechanical Keyboards', 'Technology'),
('int-006', 'rec-demo-003', 'Ayurveda & Wellness', 'Personal Care'),
('int-007', 'rec-demo-003', 'Handloom Textiles', 'Heritage')
ON DUPLICATE KEY UPDATE `interest_name` = VALUES(`interest_name`);

-- 4. Gift Preferences
INSERT INTO `gift_preferences` (`id`, `recipient_id`, `minimum_budget`, `maximum_budget`, `currency`, `preferred_categories`, `disliked_categories`, `preferred_styles`, `additional_notes`)
VALUES
('gpref-001', 'rec-demo-001', 500.00, 3000.00, 'INR', '["Home & Living", "Wellness"]', '["Plastic gadgets"]', '["Artisanal", "Botanical"]', 'Prefers handmade items with sustainable packaging'),
('gpref-002', 'rec-demo-002', 1000.00, 8000.00, 'INR', '["Technology", "Coffee"]', '["Fast fashion"]', '["Minimalist", "Tactile"]', 'High quality industrial design'),
('gpref-003', 'rec-demo-003', 2000.00, 20000.00, 'INR', '["Ayurveda", "Handloom"]', '["Mass electronics"]', '["Traditional Luxury"]', 'Authentic ingredients and GI-tagged crafts')
ON DUPLICATE KEY UPDATE `currency` = VALUES(`currency`);

-- 5. Upcoming Occasions
INSERT INTO `occasions` (`id`, `user_id`, `recipient_id`, `occasion_name`, `occasion_date`, `reminder_enabled`, `created_at`)
VALUES
('occ-001', 'usr-demo-001', 'rec-demo-001', 'Pooja\'s Birthday', '2026-04-18', 1, NOW()),
('occ-002', 'usr-demo-001', 'rec-demo-002', 'Arjun\'s Birthday', '2026-11-24', 1, NOW()),
('occ-003', 'usr-demo-001', 'rec-demo-003', 'Mother\'s Day Celebration', '2026-05-10', 1, NOW())
ON DUPLICATE KEY UPDATE `occasion_name` = VALUES(`occasion_name`);

-- 6. Canonical Products (Illustrative Development Data)
INSERT INTO `products` (`id`, `canonical_name`, `brand`, `description`, `category`, `subcategory`, `image_url`, `created_at`, `updated_at`)
VALUES
(
  'prod-demo-001',
  'Handmade Botanical Soy Wax Scented Candle',
  'Wild Fig Studios',
  'Artisanal hand-poured candle made from 100% natural soy wax, infused with wild fig and cedar essential oils in an amber apothecary jar.',
  'Home & Living',
  'Aromatherapy',
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  NOW(),
  NOW()
),
(
  'prod-demo-002',
  'Pure Mulberry Silk Sleep Mask & Pillowcase Set',
  'Nirvana Silk',
  'Grade 6A 22 Momme pure mulberry silk set in soft rose quartz. Reduces friction and temperature fluctuations during rest.',
  'Wellness & Sleep',
  'Bedding',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  NOW(),
  NOW()
),
(
  'prod-demo-003',
  'Walnut & Matte Aluminum MagSafe Dual Wireless Charger',
  'NordicCraft',
  'Solid sustainably sourced American walnut base with aerospace aluminum accents. Charges phone and wireless earbuds simultaneously.',
  'Technology',
  'Desk Accessories',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
  NOW(),
  NOW()
),
(
  'prod-demo-004',
  'Soundarya Radiance Ritual Gift Coffret',
  'Forest Essentials',
  'Heritage Ayurvedic beauty ritual with 24K gold bhasma and pure saffron cold-pressed herb extracts.',
  'Ayurvedic Luxury',
  'Skincare',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE `canonical_name` = VALUES(`canonical_name`);

-- 7. Product Sources (Marketplace integrations)
INSERT INTO `product_sources` (`id`, `product_id`, `marketplace_name`, `marketplace_product_id`, `product_title`, `product_url`, `image_url`, `current_price`, `original_price`, `currency`, `availability_status`, `source_rating`, `source_review_count`, `last_verified_at`, `created_at`, `updated_at`)
VALUES
(
  'src-demo-001',
  'prod-demo-001',
  'Etsy',
  'ETSY-FIG-CANDLE-01',
  'Handmade Botanical Soy Wax Scented Candle (Wild Fig & Cedar)',
  'https://www.etsy.com/sample/botanical-candle',
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  449.00,
  599.00,
  'INR',
  'IN_STOCK',
  4.80,
  312,
  NOW(),
  NOW(),
  NOW()
),
(
  'src-demo-002',
  'prod-demo-002',
  'Tata CLiQ Luxury',
  'TATA-SILK-SET-02',
  'Pure Mulberry Silk Sleep Mask & Pillowcase Set (Rose Quartz)',
  'https://luxury.tatacliq.com/sample/silk-sleep-set',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  2450.00,
  2999.00,
  'INR',
  'IN_STOCK',
  4.90,
  420,
  NOW(),
  NOW(),
  NOW()
),
(
  'src-demo-003',
  'prod-demo-003',
  'Amazon India',
  'AMZN-WALNUT-STAND-03',
  'Walnut & Matte Aluminum MagSafe Dual Wireless Charging Stand',
  'https://www.amazon.in/sample/walnut-charger',
  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
  3499.00,
  4299.00,
  'INR',
  'IN_STOCK',
  4.80,
  390,
  NOW(),
  NOW(),
  NOW()
),
(
  'src-demo-004',
  'prod-demo-004',
  'Forest Essentials',
  'FE-SOUNDARYA-SET-04',
  'Forest Essentials Soundarya Radiance Ritual Gift Coffret',
  'https://www.forestessentialsindia.com/sample/soundarya-ritual',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  3850.00,
  4200.00,
  'INR',
  'IN_STOCK',
  4.90,
  680,
  NOW(),
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE `current_price` = VALUES(`current_price`);

-- 8. Price Snapshots
INSERT INTO `price_snapshots` (`id`, `product_source_id`, `price`, `availability_status`, `captured_at`)
VALUES
('snap-001', 'src-demo-001', 449.00, 'IN_STOCK', NOW()),
('snap-002', 'src-demo-002', 2450.00, 'IN_STOCK', NOW()),
('snap-003', 'src-demo-003', 3499.00, 'IN_STOCK', NOW()),
('snap-004', 'src-demo-004', 3850.00, 'IN_STOCK', NOW())
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);

-- 9. Wishlists
INSERT INTO `wishlists` (`id`, `user_id`, `name`, `created_at`)
VALUES
('wsh-demo-001', 'usr-demo-001', 'Sister Pooja Birthday Ideas', NOW())
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `wishlist_items` (`id`, `wishlist_id`, `product_source_id`, `added_at`)
VALUES
('witem-001', 'wsh-demo-001', 'src-demo-001', NOW()),
('witem-002', 'wsh-demo-001', 'src-demo-002', NOW())
ON DUPLICATE KEY UPDATE `added_at` = VALUES(`added_at`);

SET FOREIGN_KEY_CHECKS = 1;
