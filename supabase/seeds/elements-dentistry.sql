-- Existing admin schema and the office_breaks migration must already exist.
-- Only for a dedicated Elements Dentistry database. Never run on Leto Bakers.
-- Idempotent: existing matching rows are preserved, not reset.
begin;
do $$ begin
 if exists (select 1 from public.business_settings where lower(coalesce(business_name,'')) <> 'elements dentistry') then
   raise exception 'STOP: database belongs to another business. Use a dedicated Elements Dentistry database.';
 end if;
 if (select count(*) from public.business_settings)>1 then raise exception 'Expected a single business.'; end if;
end $$;
insert into public.business_settings(business_name,short_name,theme_color,contact_phone,address,timezone,social_links)
select 'Elements Dentistry','Elements','#264d40','+17147161155','18952 Brookhurst St, Fountain Valley, CA 92708','America/Los_Angeles',
'{"instagram":"https://www.instagram.com/elementsdentistry/","facebook":"https://www.facebook.com/profile.php?id=61553396636194","tiktok":"https://www.tiktok.com/@elementsdentistry","zocdoc":"https://www.zocdoc.com/practice/elements-dentistry-132998"}'::jsonb
where not exists(select 1 from public.business_settings);
-- Set the timezone for this verified business, including a previously seeded row.
update public.business_settings set timezone='America/Los_Angeles' where lower(business_name)='elements dentistry';
insert into public.business_hours(day_of_week,day_name,opens_at,closes_at,break_starts_at,break_ends_at,is_closed,is_24h) values
(0,'Sunday',null,null,null,null,true,false),
(1,'Monday','10:00','18:00','14:00','15:00',false,false),
(2,'Tuesday','09:00','18:00','13:00','14:00',false,false),
(3,'Wednesday',null,null,null,null,true,false),
(4,'Thursday','09:00','18:00','13:00','14:00',false,false),
(5,'Friday','08:00','16:00','12:00','13:00',false,false),
(6,'Saturday',null,null,null,null,true,false)
on conflict(day_of_week) do nothing;
-- 30 minutes is an initial request-slot placeholder, not a clinical duration.
-- The practice MUST review duration_minutes and resource capacity before launch.
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Family & preventive care','Dental examinations, cleanings and preventive visits for children, adults and older patients.',30,true,true,0 where not exists(select 1 from public.services where name='Family & preventive care');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Special care dentistry','Individualized visits for patients with developmental, cognitive or complex medical needs. Call us to discuss accommodations.',30,true,true,1 where not exists(select 1 from public.services where name='Special care dentistry');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Cosmetic dentistry','Discuss veneers, crowns and cosmetic treatment options with a consultation tailored to your goals.',30,true,true,2 where not exists(select 1 from public.services where name='Cosmetic dentistry');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'KöR teeth whitening','Ask about the KöR Whitening System and whether professional whitening is appropriate for your smile.',30,true,true,3 where not exists(select 1 from public.services where name='KöR teeth whitening');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Dental implants','Explore implant placement and restoration for missing teeth. Your dentist will assess suitability and explain your options.',30,true,true,4 where not exists(select 1 from public.services where name='Dental implants');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Orthosnap clear aligners','Explore Orthosnap clear aligner treatment with our team, starting with a conversation about your smile.',30,true,true,5 where not exists(select 1 from public.services where name='Orthosnap clear aligners');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Emergency dental care','Contact our office about tooth pain, a broken tooth or an urgent dental concern. Call during office hours to ask about availability.',30,true,true,6 where not exists(select 1 from public.services where name='Emergency dental care');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Sedation dentistry','Discuss dental anxiety, your health history and sedation options with our team before treatment.',30,true,true,7 where not exists(select 1 from public.services where name='Sedation dentistry');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Solea laser dentistry','Our office offers Solea laser technology. Ask your dentist whether it is suitable for your planned treatment.',30,true,true,8 where not exists(select 1 from public.services where name='Solea laser dentistry');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'GentleWave root canals','Our practice offers GentleWave technology for root canal care. Your dentist will explain the recommended approach.',30,true,true,9 where not exists(select 1 from public.services where name='GentleWave root canals');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Oral surgery','Meet Dr. Kalvyn Ngo to discuss oral surgery, including wisdom teeth removal and implant placement.',30,true,true,10 where not exists(select 1 from public.services where name='Oral surgery');
insert into public.services(name,description,duration_minutes,show_on_website,is_active,sort_order) select 'Dentures & restorative care','Discuss dentures and restorative options with a plan centered on your needs and daily comfort.',30,true,true,11 where not exists(select 1 from public.services where name='Dentures & restorative care');
insert into public.faqs(question,answer,sort_order,is_active) select 'How do I request an appointment?','Choose a preferred date and time on our appointment form, or call (714) 716-1155. Online requests are reviewed by our team; your appointment is confirmed only after we contact you.',0,true where not exists(select 1 from public.faqs where question='How do I request an appointment?');
insert into public.faqs(question,answer,sort_order,is_active) select 'Where is the office?','Find us at 18952 Brookhurst St, Fountain Valley, CA 92708, near Brookhurst Street and Garfield Avenue.',1,true where not exists(select 1 from public.faqs where question='Where is the office?');
insert into public.faqs(question,answer,sort_order,is_active) select 'Do you welcome patients with special care needs?','Yes. Please call so we can discuss accommodations and plan a suitable visit.',2,true where not exists(select 1 from public.faqs where question='Do you welcome patients with special care needs?');
insert into public.faqs(question,answer,sort_order,is_active) select 'What if I do not have dental insurance?','Ask about our membership plan. Current benefits and pricing are available through our membership provider.',3,true where not exists(select 1 from public.faqs where question='What if I do not have dental insurance?');
insert into public.faqs(question,answer,sort_order,is_active) select 'Can I request an emergency appointment?','Call (714) 716-1155 during office hours and describe your concern. Our team can advise on appointment availability.',4,true where not exists(select 1 from public.faqs where question='Can I request an emergency appointment?');
insert into public.faqs(question,answer,sort_order,is_active) select 'What should I bring to my first visit?','Bring your identification, insurance information if applicable, and information requested by our office. Call ahead to discuss records or accessibility needs.',5,true where not exists(select 1 from public.faqs where question='What should I bring to my first visit?');
insert into public.service_areas(area_name,city,is_active) select 'Fountain Valley','Fountain Valley',true where not exists(select 1 from public.service_areas where area_name='Fountain Valley');
insert into public.custom_forms(name,slug,description,fields,is_active) values ('Office question','office-question','General questions for the Elements Dentistry team.','[{"name": "name", "label": "Full name", "type": "text", "required": true}, {"name": "phone", "label": "Phone number", "type": "tel", "required": true}, {"name": "email", "label": "Email", "type": "email", "required": false}, {"name": "message", "label": "Question for the office (no medical details)", "type": "textarea", "required": true}]'::jsonb,true) on conflict(slug) do nothing;
commit;
