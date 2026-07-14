-- =====================================================================
-- 1. ADMINS TABLE SETUP & SECURITY
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (with no policies, enforcing default deny for all clients)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 2. HELPER FUNCTIONS
-- =====================================================================

-- Security definer function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE user_id = auth.uid()
    );
END;
$$;

-- Immutable validation function for verification column (avoids subquery in check constraint)
-- Created without SECURITY DEFINER as it does not read any tables.
CREATE OR REPLACE FUNCTION public.validate_verification_jsonb(val JSONB)
RETURNS BOOLEAN
IMMUTABLE
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    k TEXT;
    v TEXT;
BEGIN
    -- Allow null or empty verification map (defaults to self-reported)
    IF val IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Must be a JSON object
    IF jsonb_typeof(val) <> 'object' THEN
        RETURN FALSE;
    END IF;

    -- Validate each key-value pair in the object
    FOR k, v IN SELECT * FROM jsonb_each_text(val) LOOP
        -- Check for allowed claim keys
        IF k NOT IN ('cin', 'revenue', 'founders', 'funding', 'incubator') THEN
            RETURN FALSE;
        END IF;
        -- Check for allowed tiers (stakeholder-endorsed is excluded for now)
        IF v NOT IN ('self-reported', 'ai-extracted', 'document-backed', 'investor-backed') THEN
            RETURN FALSE;
        END IF;
    END LOOP;

    RETURN TRUE;
END;
$$;

-- =====================================================================
-- 3. COMPANIES TABLE MODIFICATIONS (VERIFICATION COLUMN)
-- =====================================================================

-- Add the verification column
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS verification JSONB DEFAULT '{}'::jsonb;

-- Add data integrity check constraint calling our immutable validator function
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS check_verification_format;
ALTER TABLE public.companies ADD CONSTRAINT check_verification_format
CHECK (public.validate_verification_jsonb(verification));

-- =====================================================================
-- 4. COLUMN-LEVEL UPDATE PROTECTION (BEFORE UPDATE TRIGGER)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.enforce_company_update_restrictions()
RETURNS TRIGGER
SECURITY INVOKER -- Executes with caller permissions
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- 1. Admins have unrestricted access to update any columns
    IF public.is_admin() THEN
        RETURN NEW;
    END IF;

    -- 2. Founders must own the record they are updating
    IF OLD.owner_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized to update this company profile' USING errcode = '42501';
    END IF;

    -- 3. Block modification of owner_id by founders
    IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
        RAISE EXCEPTION 'Founders cannot modify the owner_id field' USING errcode = '42501';
    END IF;

    -- 4. Block modification of admin-only fields by founders
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        RAISE EXCEPTION 'Founders cannot modify the status field' USING errcode = '42501';
    END IF;

    IF NEW.trust_score IS DISTINCT FROM OLD.trust_score THEN
        RAISE EXCEPTION 'Founders cannot modify the trust_score field' USING errcode = '42501';
    END IF;

    IF NEW.verification IS DISTINCT FROM OLD.verification THEN
        RAISE EXCEPTION 'Founders cannot modify the verification field' USING errcode = '42501';
    END IF;

    RETURN NEW;
END;
$$;

-- Bind trigger to the companies table
DROP TRIGGER IF EXISTS enforce_company_update_restrictions_trigger ON public.companies;
CREATE TRIGGER enforce_company_update_restrictions_trigger
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_company_update_restrictions();

-- =====================================================================
-- 5. RLS POLICIES FOR COMPANIES TABLE (ADMIN ACCESS ONLY)
-- =====================================================================

-- Drop existing admin-only policies to avoid conflicts when re-running
DROP POLICY IF EXISTS "Allow admins to read all companies" ON public.companies;
DROP POLICY IF EXISTS "Allow admins to update any company" ON public.companies;

-- Create policies for admin read and write operations
CREATE POLICY "Allow admins to read all companies"
ON public.companies FOR SELECT
USING (public.is_admin());

CREATE POLICY "Allow admins to update any company"
ON public.companies FOR UPDATE
USING (public.is_admin())
WITH CHECK (TRUE);
