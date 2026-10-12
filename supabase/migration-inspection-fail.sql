-- Gap 3: Inspection failure tracking
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS correction_notes TEXT;
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS reinspection_date DATE;
ALTER TABLE inspections ADD COLUMN IF NOT EXISTS correction_photo_url TEXT;
