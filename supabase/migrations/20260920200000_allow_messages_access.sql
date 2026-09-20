-- ============ ALLOW MESSAGES ACCESS FOR CLIENTS ============
-- RLS politikasını esneterek soru sorma ve mesajlaşma işlevlerinin anonim / istemci tarafında engelsiz çalışmasını sağlar.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_replies TO anon;

-- Messages policies for anon
DROP POLICY IF EXISTS "Anon can create messages" ON public.messages;
CREATE POLICY "Anon can create messages" ON public.messages
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can read messages" ON public.messages;
CREATE POLICY "Anon can read messages" ON public.messages
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anon can update messages" ON public.messages;
CREATE POLICY "Anon can update messages" ON public.messages
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can delete messages" ON public.messages;
CREATE POLICY "Anon can delete messages" ON public.messages
  FOR DELETE TO anon USING (true);

-- Message replies policies for anon
DROP POLICY IF EXISTS "Anon can read replies" ON public.message_replies;
CREATE POLICY "Anon can read replies" ON public.message_replies
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anon can insert replies" ON public.message_replies;
CREATE POLICY "Anon can insert replies" ON public.message_replies
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can delete replies" ON public.message_replies;
CREATE POLICY "Anon can delete replies" ON public.message_replies
  FOR DELETE TO anon USING (true);
