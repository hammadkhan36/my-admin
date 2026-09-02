
Phase 1	     Auth + roles + permissions finalize
Phase 2	     Activity logs ko real events se connect karna
Phase 3	     Customers module functional
Phase 4	     Leads module functional
Phase 5	     Notifications system
Phase 6	     Business settings + feature management polish
Phase 7	     Website tracking/analytics
Phase 8	     Docs complete







## Phase 1 Status

Feature	####

Supabase auth login	
Manual superadmin / owner	
Admin-created admin/manager/supervisor/staff	
Active/inactive members	
Password reset by allowed admin/owner	
Delete/deactivate member	
Role default permissions	
Individual permission overrides	
Sidebar permission filtering	
Direct URL route guards	
Docs basic auth guide	 
Super admin dashboard polish	




## Phase 3: Customers Module


Customers pehle banayenge kyun ke leads, appointments, notifications sab customers se link honge.


| Feature       | Kaam                                      |
| ------------- | ----------------------------------------- |
| Customer list | all customers show                        |
| Add customer  | manual customer create                    |
| Phone unique  | same phone duplicate customer nahi banega |
| Search        | name/phone/email se search                |
| Status/cards  | total customers stats                     |
| Activity log  | customer create/update log                |





## Phase 4

Phase 4 mein done:

leads table
lead notes/history tables
manual lead create
auto customer create/attach
lead list/search/delete
lead detail
status update
notes
history timeline


######  is phase maan haam na api bi ready ki ha or powershell maan test ki jo successfull ha neecha given ha 

<!-- Invoke-RestMethod `
  -Uri "http://localhost:3000/api/public/leads" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "website_key": "lbw_2026_93Kds920sdLeadKey",
    "name": "Test Website Lead",
    "phone": "03001112222",
    "email": "test@example.com",
    "service": "Website Form Test",
    "message": "This lead came from API test",
    "page_url": "https://example.com/contact",
    "referrer": "https://google.com",
    "utm_source": "google",
    "utm_medium": "organic",
    "utm_campaign": "test"
  }' -->



  