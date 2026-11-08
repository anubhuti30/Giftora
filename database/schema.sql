-- =============================================================================
-- GIFTORA DATABASE SCHEMA
-- Target Database: MySQL 8.0+
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- Importable directly in MySQL Workbench or via MySQL Command Line
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `giftora_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `giftora_db`;

-- Disable foreign key checks during schema execution
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. USER MANAGEMENT
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `user_preferences`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_preferences` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `preferred_currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `preferred_language` VARCHAR(10) NOT NULL DEFAULT 'en',
  `preferred_gift_style` VARCHAR(50) NOT NULL DEFAULT 'thoughtful',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_preferences_user_id` (`user_id`),
  CONSTRAINT `fk_user_preferences_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. RECIPIENT MANAGEMENT
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `occasions`;
DROP TABLE IF EXISTS `gift_preferences`;
DROP TABLE IF EXISTS `recipient_interests`;
DROP TABLE IF EXISTS `recipients`;

CREATE TABLE `recipients` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `relationship` VARCHAR(100) NOT NULL,
  `date_of_birth` DATE NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipients_user_id` (`user_id`),
  CONSTRAINT `fk_recipients_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `recipient_interests` (
  `id` VARCHAR(36) NOT NULL,
  `recipient_id` VARCHAR(36) NOT NULL,
  `interest_name` VARCHAR(150) NOT NULL,
  `interest_category` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_recipient_interests_recipient_id` (`recipient_id`),
  KEY `idx_recipient_interests_name` (`interest_name`),
  CONSTRAINT `fk_recipient_interests_recipient` FOREIGN KEY (`recipient_id`)
    REFERENCES `recipients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `gift_preferences` (
  `id` VARCHAR(36) NOT NULL,
  `recipient_id` VARCHAR(36) NOT NULL,
  `minimum_budget` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `maximum_budget` DECIMAL(10, 2) NOT NULL DEFAULT 25000.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `preferred_categories` JSON NULL,
  `disliked_categories` JSON NULL,
  `preferred_styles` JSON NULL,
  `additional_notes` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gift_preferences_recipient_id` (`recipient_id`),
  CONSTRAINT `fk_gift_preferences_recipient` FOREIGN KEY (`recipient_id`)
    REFERENCES `recipients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `occasions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `recipient_id` VARCHAR(36) NULL,
  `occasion_name` VARCHAR(150) NOT NULL,
  `occasion_date` DATE NOT NULL,
  `reminder_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_occasions_user_id` (`user_id`),
  KEY `idx_occasions_recipient_id` (`recipient_id`),
  KEY `idx_occasions_date` (`occasion_date`),
  CONSTRAINT `fk_occasions_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_occasions_recipient` FOREIGN KEY (`recipient_id`)
    REFERENCES `recipients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. AI CONVERSATIONS AND SEARCH SESSIONS
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `search_sessions`;
DROP TABLE IF EXISTS `conversations`;

CREATE TABLE `conversations` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `recipient_id` VARCHAR(36) NULL,
  `title` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversations_user_id` (`user_id`),
  KEY `idx_conversations_recipient_id` (`recipient_id`),
  CONSTRAINT `fk_conversations_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversations_recipient` FOREIGN KEY (`recipient_id`)
    REFERENCES `recipients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `messages` (
  `id` VARCHAR(36) NOT NULL,
  `conversation_id` VARCHAR(36) NOT NULL,
  `sender_type` ENUM('user', 'assistant', 'system') NOT NULL,
  `message_content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation_id` (`conversation_id`),
  KEY `idx_messages_created_at` (`created_at`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`)
    REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `search_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `recipient_id` VARCHAR(36) NULL,
  `conversation_id` VARCHAR(36) NULL,
  `occasion` VARCHAR(100) NULL,
  `original_query` TEXT NOT NULL,
  `extracted_preferences` JSON NULL,
  `minimum_budget` DECIMAL(10, 2) NULL,
  `maximum_budget` DECIMAL(10, 2) NULL,
  `search_status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_search_sessions_user_id` (`user_id`),
  KEY `idx_search_sessions_recipient_id` (`recipient_id`),
  KEY `idx_search_sessions_status` (`search_status`),
  KEY `idx_search_sessions_created_at` (`created_at`),
  CONSTRAINT `fk_search_sessions_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_search_sessions_recipient` FOREIGN KEY (`recipient_id`)
    REFERENCES `recipients` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_search_sessions_conversation` FOREIGN KEY (`conversation_id`)
    REFERENCES `conversations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. PRODUCT CATALOGUE AND MARKETPLACE INTEGRATIONS
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `recommendations`;
DROP TABLE IF EXISTS `price_snapshots`;
DROP TABLE IF EXISTS `product_sources`;
DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
  `id` VARCHAR(36) NOT NULL,
  `canonical_name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(150) NULL,
  `description` TEXT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100) NULL,
  `image_url` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category`),
  KEY `idx_products_canonical_name` (`canonical_name`),
  KEY `idx_products_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_sources` (
  `id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `marketplace_name` VARCHAR(100) NOT NULL,
  `marketplace_product_id` VARCHAR(150) NOT NULL,
  `product_title` VARCHAR(300) NOT NULL,
  `product_url` TEXT NOT NULL,
  `image_url` TEXT NOT NULL,
  `current_price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2) NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `availability_status` VARCHAR(50) NOT NULL DEFAULT 'IN_STOCK',
  `source_rating` DECIMAL(3, 2) NULL,
  `source_review_count` INT NULL,
  `last_verified_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_marketplace_product` (`marketplace_name`, `marketplace_product_id`),
  KEY `idx_product_sources_product_id` (`product_id`),
  KEY `idx_product_sources_marketplace` (`marketplace_name`),
  KEY `idx_product_sources_price` (`current_price`),
  KEY `idx_product_sources_verified` (`last_verified_at`),
  CONSTRAINT `fk_product_sources_product` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `price_snapshots` (
  `id` VARCHAR(36) NOT NULL,
  `product_source_id` VARCHAR(36) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `availability_status` VARCHAR(50) NOT NULL,
  `captured_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_price_snapshots_source_id` (`product_source_id`),
  KEY `idx_price_snapshots_captured` (`captured_at`),
  CONSTRAINT `fk_price_snapshots_source` FOREIGN KEY (`product_source_id`)
    REFERENCES `product_sources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `recommendations` (
  `id` VARCHAR(36) NOT NULL,
  `search_session_id` VARCHAR(36) NOT NULL,
  `product_source_id` VARCHAR(36) NOT NULL,
  `relevance_score` DECIMAL(5, 2) NOT NULL,
  `match_explanation` TEXT NOT NULL,
  `ranking_position` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recommendations_session_id` (`search_session_id`),
  KEY `idx_recommendations_source_id` (`product_source_id`),
  KEY `idx_recommendations_score` (`relevance_score`),
  CONSTRAINT `fk_recommendations_session` FOREIGN KEY (`search_session_id`)
    REFERENCES `search_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recommendations_source` FOREIGN KEY (`product_source_id`)
    REFERENCES `product_sources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. USER SHOPPING FUNCTIONALITY
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `feedback`;
DROP TABLE IF EXISTS `comparison_items`;
DROP TABLE IF EXISTS `comparisons`;
DROP TABLE IF EXISTS `wishlist_items`;
DROP TABLE IF EXISTS `wishlists`;

CREATE TABLE `wishlists` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL DEFAULT 'My Saved Gifts',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wishlists_user_id` (`user_id`),
  CONSTRAINT `fk_wishlists_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `wishlist_items` (
  `id` VARCHAR(36) NOT NULL,
  `wishlist_id` VARCHAR(36) NOT NULL,
  `product_source_id` VARCHAR(36) NOT NULL,
  `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist_product` (`wishlist_id`, `product_source_id`),
  KEY `idx_wishlist_items_wishlist_id` (`wishlist_id`),
  KEY `idx_wishlist_items_source_id` (`product_source_id`),
  CONSTRAINT `fk_wishlist_items_wishlist` FOREIGN KEY (`wishlist_id`)
    REFERENCES `wishlists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_items_source` FOREIGN KEY (`product_source_id`)
    REFERENCES `product_sources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comparisons` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `search_session_id` VARCHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comparisons_user_id` (`user_id`),
  KEY `idx_comparisons_session_id` (`search_session_id`),
  CONSTRAINT `fk_comparisons_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comparisons_session` FOREIGN KEY (`search_session_id`)
    REFERENCES `search_sessions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comparison_items` (
  `id` VARCHAR(36) NOT NULL,
  `comparison_id` VARCHAR(36) NOT NULL,
  `product_source_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_comparison_product` (`comparison_id`, `product_source_id`),
  KEY `idx_comparison_items_comp_id` (`comparison_id`),
  KEY `idx_comparison_items_source_id` (`product_source_id`),
  CONSTRAINT `fk_comparison_items_comparison` FOREIGN KEY (`comparison_id`)
    REFERENCES `comparisons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comparison_items_source` FOREIGN KEY (`product_source_id`)
    REFERENCES `product_sources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `feedback` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `recommendation_id` VARCHAR(36) NOT NULL,
  `feedback_type` VARCHAR(50) NOT NULL,
  `feedback_text` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_feedback_user_id` (`user_id`),
  KEY `idx_feedback_recommendation_id` (`recommendation_id`),
  CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feedback_recommendation` FOREIGN KEY (`recommendation_id`)
    REFERENCES `recommendations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
