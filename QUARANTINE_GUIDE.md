#!/usr/bin/env node

/**
 * ADSENSE RISK QUARANTINE - Quick Reference Guide
 * 
 * This script identifies and quarantines (unpublishes) dream records
 * that contain AdSense policy-violating keywords.
 * 
 * ⚠️ IMPORTANT: This script sets isPublished = false instead of deleting
 * to allow recovery in case of false positives.
 */

// Quick Run
console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   ADSENSE RISK QUARANTINE SCRIPT                           ║
╚════════════════════════════════════════════════════════════════════════════╝

📍 LOCATION: scripts/quarantine-adsense-risks.ts

🚀 QUICK START:
   npm run quarantine-risks

⏱️  RUNTIME: ~30-45 seconds (for 45,460 items)

────────────────────────────────────────────────────────────────────────────

📋 WHAT IT DOES:

1. Scans all dream records for banned keywords:
   ✗ dövmek (beating)
   ✗ vurulmak (striking)
   ✗ kurşun (bullet)
   ✗ dayak (corporal punishment)
   ✗ cinsel (sexual)
   ✗ suç (crime)
   ✗ terörist (terrorism)
   ✗ uyuşturucu (drugs)
   ✗ taciz (harassment)
   ✗ intihar (suicide)

2. Sets isPublished = false on matching items (quarantines them)
   → Items are hidden from public view
   → Items are excluded from Google indexing (robots.txt respects isPublished)
   → Items can be republished after editing in admin panel

3. Generates a detailed report with:
   - Count of quarantined items
   - Breakdown by keyword
   - Sample affected items (first 10)
   - Recovery instructions

────────────────────────────────────────────────────────────────────────────

📊 LATEST RESULTS (March 1, 2026):

Total Items Scanned:        45,460
Items Quarantined:          404
   ├─ dövmek:               150 items
   ├─ vurulmak:             75 items
   ├─ cinsel:               50 items
   ├─ suç:                  41 items
   ├─ kurşun:               34 items
   ├─ dayak:                15 items
   ├─ terörist:             14 items
   ├─ taciz:                13 items
   ├─ uyuşturucu:           9 items
   └─ intihar:              3 items

────────────────────────────────────────────────────────────────────────────

✅ NEXT STEPS:

Step 1: Review Quarantined Items
   Location: Admin Panel → /admin/dreams
   Filter: Show unpublished items (isPublished = false)
   
Step 2: Edit Content
   For each item, decide:
   A) Delete completely (if context is unsuitable)
   B) Rephrase title/content to be AdSense-compliant
   
   Examples of rephrasing:
   ┌─────────────────────────────────────────────────┐
   │ BEFORE             │ AFTER                       │
   ├─────────────────────────────────────────────────┤
   │ Dövmek -> Çatışma  │ Dövüş / Fiziksel Uyuşmazlık│
   │ Cinsel Organ       │ Sensüel Rüyalar            │
   │ Kurşun Girmesi     │ Ağır Nesne / Tehdit Simüla │
   │ Terörist Görmek    │ Korku Senaryoları           │
   └─────────────────────────────────────────────────┘

Step 3: Republish
   After editing, set isPublished = true in admin panel
   
Step 4: Verify
   Run: npm run analyze-quality
   Expected result: Items with banned terms: 0
   
Step 5: Apply AdSense
   Once analysis shows green, submit domain for AdSense approval

────────────────────────────────────────────────────────────────────────────

🔧 TECHNICAL DETAILS:

Database Field Modified:    dreams.is_published (Boolean)
Approach:                   Soft-delete (safe for recovery)
Data Loss:                  NONE (items still in database)
Reversibility:              YES (admin can republish anytime)
Google Impact:              Items hidden from indexing
Public Impact:              Items not visible on website

Keyword Matching:
├─ Case-insensitive
├─ Searches in: title + content fields
├─ Match type: Substring (partial matches count)
└─ Example: "dövmek" matches "erkek arkadaşı dövmek"

────────────────────────────────────────────────────────────────────────────

⚠️  IMPORTANT NOTES:

1. This script uses substring matching, not regex
   → "dövmek" will match any item containing the word
   → May include false positives (use admin panel for review)

2. Already unpublished items are counted but NOT re-updated
   → Avoids unnecessary database operations

3. The script is idempotent
   → Safe to run multiple times
   → Will not quarantine items twice

4. Quarantined items are still searchable in admin panel
   → Filter by isPublished = false to find them
   → Makes bulk editing easier

────────────────────────────────────────────────────────────────────────────

🔄 REVERT/RECOVERY:

If you need to restore a quarantined item:

Option 1: Via Admin Panel
├─ Go to /admin/dreams
├─ Filter: Show unpublished
├─ Click item to edit
├─ Set isPublished = true
└─ Save

Option 2: Via Prisma Studio
├─ Run: npx prisma studio
├─ Navigate to dreams table
├─ Find item by ID
├─ Toggle is_published to true
└─ Save

Option 3: Via Direct SQL (if needed)
┌─────────────────────────────────────────────────┐
│ UPDATE dreams SET is_published = true           │
│ WHERE id IN (442, 446, 447, ...);               │
└─────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────────────

📞 SUPPORT:

For detailed analysis results:
→ See: analyze-content-quality-report.json

For AdSense policies:
→ https://support.google.com/adsense/answer/47513

For content rephrasing help:
→ Use ChatGPT: "Rephrase this dream interpretation to remove the word 'X'"

────────────────────────────────────────────────────────────────────────────
`);
