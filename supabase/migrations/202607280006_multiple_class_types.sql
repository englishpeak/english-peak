-- Allow a class to cover multiple supported teaching categories.
alter table public.ep_classes
 alter column class_type type text[]
 using case
  when class_type is null then '{}'::text[]
  when class_type = 'Conversation' then array['Conversational']
  when class_type in ('Exam preparation', 'Private class', 'Other') then array['Test Prep & Other']
  else array[class_type]
 end;

alter table public.ep_classes
 add constraint ep_classes_class_type_values check (
  cardinality(class_type) > 0
  and class_type <@ array[
   'General English',
   'Conversational',
   'Business English',
   'Test Prep & Other'
  ]::text[]
 );

notify pgrst, 'reload schema';
