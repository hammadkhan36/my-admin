import {createAdminClient} from "@/lib/supabase-admin";
import {validDate,validTime,minutes,businessNow,fitsHours,overlaps} from "./schedule";
export async function loadAvailability(date:string,serviceId?:string|null,ignoreId?:string|null){
 const db=createAdminClient();const day=new Date(date+"T12:00:00Z").getUTCDay();
 let bookings=db.from("appointments").select("appointment_time").eq("appointment_date",date).in("status",["pending","approved"]);if(serviceId)bookings=bookings.eq("service_id",serviceId);if(ignoreId)bookings=bookings.neq("id",ignoreId);
 const [hours,settings,service,booked]=await Promise.all([db.from("business_hours").select("opens_at,closes_at,is_closed,is_24h,break_starts_at,break_ends_at").eq("day_of_week",day).maybeSingle(),db.from("business_settings").select("timezone").limit(1).maybeSingle(),serviceId?db.from("services").select("duration_minutes,is_active,show_on_website").eq("id",serviceId).maybeSingle():Promise.resolve({data:null,error:null}),serviceId?bookings:Promise.resolve({data:[],error:null})]);
 if(hours.error||settings.error||service.error||booked.error)throw new Error("Availability could not be loaded. Please call the office.");
 if(serviceId&&(!service.data||!service.data.is_active))throw new Error("This service is not available.");
 return {hours:hours.data,timezone:settings.data?.timezone||"UTC",duration:Math.max(1,service.data?.duration_minutes||30),websiteVisible:service.data?.show_on_website??false,booked:(booked.data||[]).map(b=>b.appointment_time as string)};
}
export async function checkAppointmentAvailability(input:{appointmentDate:string;appointmentTime:string;serviceId?:string|null;ignoreAppointmentId?:string|null}):Promise<{available:boolean;reason?:string}>{
 if(!validDate(input.appointmentDate)||!validTime(input.appointmentTime))return {available:false,reason:"Choose a valid date and time."};
 try{const data=await loadAvailability(input.appointmentDate,input.serviceId,input.ignoreAppointmentId);const now=businessNow(data.timezone);const start=minutes(input.appointmentTime);if(input.appointmentDate<now.date||(input.appointmentDate===now.date&&start<=now.minutes))return {available:false,reason:"Please choose a future appointment time."};if(!data.hours||!fitsHours(data.hours,start,data.duration))return {available:false,reason:"Choose a time within office hours with enough time for your visit. Lunch breaks and closed days are unavailable."};if(overlaps(start,data.duration,data.booked))return {available:false,reason:"This time is no longer available. Please choose another time."};return {available:true}}catch(error){return {available:false,reason:error instanceof Error?error.message:"Availability is temporarily unavailable."}}
}
