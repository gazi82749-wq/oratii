-- 08_trainer_batches.sql
-- Oratii Academy & Trainer Hub Schema
-- Supports Coaching Institutes, Spoken English Centers, and College Placement Cells

-- 1. Academies / Institutes Table
CREATE TABLE IF NOT EXISTS public.academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  phone TEXT,
  logo_url TEXT,
  commission_rate NUMERIC DEFAULT 0.20, -- 20% affiliate kickback for student top-ups
  total_earnings NUMERIC DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_academy_owner UNIQUE (owner_id)
);

-- Ensure unique constraint exists if table was already created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_academy_owner'
  ) THEN
    ALTER TABLE public.academies ADD CONSTRAINT unique_academy_owner UNIQUE (owner_id);
  END IF;
END $$;


-- 2. Batches Table (Classrooms/Cohorts)
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID REFERENCES public.academies(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- e.g. "APEX26", "IELTS1"
  description TEXT,
  track TEXT DEFAULT 'all', -- 'speech' | 'interview' | 'presentation_viva' | 'all'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Batch Members Table (Students Enrolled in a Batch)
CREATE TABLE IF NOT EXISTS public.batch_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_student_batch UNIQUE (batch_id, student_id)
);

-- 4. Batch Assignments Table (Tasks Assigned by Trainer across the 3 Master Tracks)
CREATE TABLE IF NOT EXISTS public.batch_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  track TEXT NOT NULL DEFAULT 'speech', -- 'speech' | 'interview' | 'presentation_viva'
  instructions TEXT,
  target_wpm INTEGER DEFAULT 140,
  max_fillers INTEGER DEFAULT 2,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Batch Submissions Table (Student Completed Practice Sessions)
CREATE TABLE IF NOT EXISTS public.batch_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.batch_assignments(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  track TEXT NOT NULL DEFAULT 'speech',
  overall_score NUMERIC DEFAULT 0,
  wpm NUMERIC DEFAULT 0,
  filler_count INTEGER DEFAULT 0,
  cefr_band TEXT, -- e.g. 'C1 (Advanced)' or 'IELTS 7.5'
  session_data JSONB DEFAULT '{}'::jsonb,
  teacher_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Indexes for High-Concurrency Performance
CREATE INDEX IF NOT EXISTS idx_academies_owner ON public.academies(owner_id);
CREATE INDEX IF NOT EXISTS idx_batches_code ON public.batches(code);
CREATE INDEX IF NOT EXISTS idx_batches_academy ON public.batches(academy_id);
CREATE INDEX IF NOT EXISTS idx_batches_trainer ON public.batches(trainer_id);
CREATE INDEX IF NOT EXISTS idx_batch_members_student ON public.batch_members(student_id);
CREATE INDEX IF NOT EXISTS idx_batch_members_batch ON public.batch_members(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_submissions_batch ON public.batch_submissions(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_submissions_student ON public.batch_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_batch_assignments_batch ON public.batch_assignments(batch_id);

-- 7. Row Level Security (RLS)
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_submissions ENABLE ROW LEVEL SECURITY;

-- Academies: Owner can manage their academy; anyone can read basic academy info for co-branding
CREATE POLICY "Academies owner access" ON public.academies
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Public academy read" ON public.academies
  FOR SELECT USING (true);

-- Batches: Trainer/Academy owner can manage; enrolled students or anyone with valid code can read
CREATE POLICY "Trainer manage batches" ON public.batches
  FOR ALL USING (auth.uid() = trainer_id) WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Public batch read by code" ON public.batches
  FOR SELECT USING (true);

-- Batch Members: Students can view their enrollments; trainers can view members in their batches
CREATE POLICY "Students manage own batch enrollments" ON public.batch_members
  FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Trainers view batch members" ON public.batch_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batches
      WHERE batches.id = batch_members.batch_id
      AND batches.trainer_id = auth.uid()
    )
  );

-- Batch Assignments: Trainer can manage assignments; enrolled students can read
CREATE POLICY "Trainers manage assignments" ON public.batch_assignments
  FOR ALL USING (auth.uid() = trainer_id) WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Enrolled students view assignments" ON public.batch_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batch_members
      WHERE batch_members.batch_id = batch_assignments.batch_id
      AND batch_members.student_id = auth.uid()
    )
  );

-- Batch Submissions: Students can insert their submissions; trainers of the batch can read and update notes
CREATE POLICY "Students manage own submissions" ON public.batch_submissions
  FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Trainers view and grade submissions" ON public.batch_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.batches
      WHERE batches.id = batch_submissions.batch_id
      AND batches.trainer_id = auth.uid()
    )
  );

-- 8. Profiles: Trainers can view basic student profile info for students enrolled in their batches
DROP POLICY IF EXISTS "Trainers can view enrolled student profiles" ON public.profiles;
CREATE POLICY "Trainers can view enrolled student profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.batch_members bm
      JOIN public.batches b ON b.id = bm.batch_id
      WHERE bm.student_id = profiles.id
      AND b.trainer_id = auth.uid()
    )
  );

