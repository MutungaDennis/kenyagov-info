-- Seed the progressive referral-hospital service catalogue for Kenyatta National Hospital.
-- The JSON shape is also the shape used by the guided admin template editor.
update public.institutions
set template_data = jsonb_set(
  coalesce(template_data, '{}'::jsonb),
  '{services}',
  $$[
    {"name":"Eye care and surgery","category":"Surgical services","description":"Medical and surgical care for vision problems, eye injuries, cataracts, glaucoma and other eye conditions.","location":"Clinic 35","referralRequired":"Yes"},
    {"name":"Ear, nose and throat","category":"Surgical services","description":"Care for hearing, nasal passages, sinuses, throat and related problems, including speech therapy and hearing tests.","location":"Clinic 34; Mon–Fri 9am–1pm; emergency clinic 8am–5pm","referralRequired":"Yes"},
    {"name":"Bone, joint and fracture care","category":"Surgical services","description":"Surgical repair of broken bones, joint problems, dislocations and related injuries.","location":"Clinic 5","referralRequired":"Yes"},
    {"name":"Brain, spine and nerve surgery","category":"Surgical services","description":"Surgery for conditions affecting the brain, spinal cord and nerves, including head injuries.","referralRequired":"Yes"},
    {"name":"Dental care and oral surgery","category":"Surgical services","description":"General and specialised dental care, children’s dentistry, braces, gum disease, artificial teeth and surgery for the face and jaws.","location":"Ground floor, old hospital building","referralRequired":"Yes"},
    {"name":"Heart health and blood pressure","category":"Medical and long-term care","description":"Non-surgical care for heart disease, high blood pressure and related problems.","referralRequired":"Yes"},
    {"name":"Kidney care and dialysis","category":"Medical and long-term care","description":"Treatment for kidney disease, dialysis and kidney transplant follow-up.","location":"Transplant Wing; clinics Monday, Tuesday and Friday","referralRequired":"Yes"},
    {"name":"Diabetes and hormone care","category":"Medical and long-term care","description":"Care for diabetes, blood sugar problems and hormone-related conditions.","referralRequired":"Yes"},
    {"name":"Mental health and counselling","category":"Medical and long-term care","description":"Assessment, treatment and support for mental health conditions, including child and adolescent services.","location":"Old hospital, ground floor","referralRequired":"Yes"},
    {"name":"HIV care","category":"Medical and long-term care","description":"Specialist care, treatment and support for people living with HIV.","location":"Rahimtulla Wing; Monday to Friday","referralRequired":"Yes"},
    {"name":"Cancer drug treatment","category":"Cancer care","description":"Chemotherapy and other drug treatments for cancer.","location":"Cancer Treatment Centre","referralRequired":"Yes"},
    {"name":"Radiation treatment","category":"Cancer care","description":"High-energy radiation treatment for cancer.","location":"Cancer Treatment Centre","referralRequired":"Yes"},
    {"name":"Pain relief and comfort care","category":"Cancer care","description":"Support to reduce pain and improve quality of life for people with advanced illness.","referralRequired":"Yes"},
    {"name":"Scans and X-rays","category":"Diagnostics, scans and laboratories","description":"X-rays, CT scans, MRI, ultrasound, mammography and other imaging tests.","location":"Open 24 hours for emergencies","referralRequired":"Yes"},
    {"name":"Blood sample collection","category":"Diagnostics, scans and laboratories","description":"Where blood samples are taken for laboratory tests.","referralRequired":"Yes"},
    {"name":"Maternity and women’s health","category":"Maternity, women’s health and children","description":"Antenatal care, labour and delivery, and care for women’s reproductive health.","location":"Clinic 18","referralRequired":"Yes"},
    {"name":"Children’s health clinic","category":"Maternity, women’s health and children","description":"Medical care for children from birth to 12 years, including specialist clinics.","referralRequired":"Yes"},
    {"name":"Physiotherapy","category":"Rehabilitation and recovery","description":"Physical therapy to help recovery after injury, surgery or illness.","location":"Ground floor, main tower; also at Day Care Centre","referralRequired":"Yes"},
    {"name":"Pharmacy and medicine safety","category":"Pharmacy and medicines","description":"Dispensing of medicines and advice on safe use of medicines for inpatients and outpatients.","referralRequired":"No"},
    {"name":"Accident & Emergency","category":"Accident & Emergency","description":"24-hour emergency care. Walk-in emergencies are accepted without a referral.","location":"Open 24/7","referralRequired":"No","emergencyNote":"For emergencies, go directly to A&E or call the emergency number shown at the top of every page."},
    {"name":"Prime Care Centre","category":"Prime Care Centre (private wing)","description":"Private outpatient and inpatient services. Many outpatient clinics do not need a referral letter.","location":"1st floor, Accident & Emergency building; contact 0785 405 591","referralRequired":"No"}
  ]$$::jsonb
)
where slug = 'kenyatta-national-hospital'
  and template_key = 'healthcare-referral-hospital';
