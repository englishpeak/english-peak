-- Treat Test Prep and Other as independent class categories.
alter table public.ep_classes drop constraint if exists ep_classes_class_type_values;

update public.ep_classes
set class_type = array(
  select distinct category
  from unnest(class_type) as existing(value)
  cross join lateral unnest(
    case when existing.value = 'Test Prep & Other'
      then array['Test Prep', 'Other']
      else array[existing.value]
    end
  ) as expanded(category)
)
where class_type @> array['Test Prep & Other'];

alter table public.ep_classes
 add constraint ep_classes_class_type_values check (
  cardinality(class_type) > 0
  and class_type <@ array[
   'General English',
   'Conversational',
   'Business English',
   'Test Prep',
   'Other'
  ]::text[]
 );

notify pgrst, 'reload schema';
