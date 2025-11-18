-- Fix venue_profiles to allow NULL for venue_name and address during registration
-- Users can update these later in their profile

ALTER TABLE venue_profiles 
ALTER COLUMN venue_name DROP NOT NULL,
ALTER COLUMN address DROP NOT NULL;
