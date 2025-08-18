-- Phase 2: Add shared contacts table
CREATE TABLE public.shared_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.shared_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_contacts
CREATE POLICY "Users can view shared contacts for groups they belong to" 
ON public.shared_contacts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = shared_contacts.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can add shared contacts" 
ON public.shared_contacts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = shared_contacts.group_id 
    AND group_members.user_id = auth.uid()
  )
  AND auth.uid() = added_by
);

CREATE POLICY "Group members can update shared contacts" 
ON public.shared_contacts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = shared_contacts.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can delete shared contacts" 
ON public.shared_contacts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = shared_contacts.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates on shared_contacts
CREATE TRIGGER update_shared_contacts_updated_at
  BEFORE UPDATE ON public.shared_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();