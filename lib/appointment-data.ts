export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "No-show";

export type Appointment = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  service: string;
  staff: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  status: AppointmentStatus;
  notes?: string;
};

export const appointments: Appointment[] = [
  {
    id: "1",
    customer: "Ali Raza",
    email: "ali@example.com",
    phone: "+92 300 1234567",
    service: "Haircut",
    staff: "Ahmed",
    date: "2024-06-01",
    time: "10:00",
    duration: 30,
    status: "Confirmed",
    notes: "Regular customer",
  },
  {
    id: "2",
    customer: "Sana Khan",
    email: "sana@example.com",
    phone: "+92 321 9876543",
    service: "Hair Coloring",
    staff: "Sara",
    date: "2024-06-01",
    time: "11:30",
    duration: 90,
    status: "Pending",
  },
  {
    id: "3",
    customer: "Usman Tariq",
    email: "usman@example.com",
    phone: "+92 333 1112223",
    service: "Consultation",
    staff: "Ahmed",
    date: "2024-06-02",
    time: "14:00",
    duration: 45,
    status: "Completed",
  },
  {
    id: "4",
    customer: "Ayesha Malik",
    email: "ayesha@example.com",
    phone: "+92 345 4445556",
    service: "Haircut",
    staff: "Sara",
    date: "2024-06-03",
    time: "16:30",
    duration: 30,
    status: "Cancelled",
  },
  {
    id: "5",
    customer: "Bilal Ahmed",
    email: "bilal@example.com",
    phone: "+92 300 7778889",
    service: "Hair Coloring",
    staff: "Ahmed",
    date: "2024-06-04",
    time: "12:00",
    duration: 90,
    status: "No-show",
  },
];

export type AppointmentService = {
  id: string;
  name: string;
  duration: number;
  price: number;
  staff: string;
  availability: string;
  bufferTime: number;
  bookingStatus: "Active" | "Disabled";
};

export const appointmentServices: AppointmentService[] = [
  {
    id: "1",
    name: "Haircut",
    duration: 30,
    price: 1500,
    staff: "Ahmed, Sara",
    availability: "All days",
    bufferTime: 10,
    bookingStatus: "Active",
  },
  {
    id: "2",
    name: "Hair Coloring",
    duration: 90,
    price: 5000,
    staff: "Sara",
    availability: "Mon-Sat",
    bufferTime: 15,
    bookingStatus: "Active",
  },
  {
    id: "3",
    name: "Consultation",
    duration: 45,
    price: 2000,
    staff: "Ahmed",
    availability: "Tue-Thu",
    bufferTime: 5,
    bookingStatus: "Disabled",
  },
];

export type AvailabilitySettings = {
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  breakTimes: { start: string; end: string }[];
  staffAvailability: { staff: string; days: string[]; start: string; end: string }[];
  holidays: string[];
  blockedDates: string[];
  slotDuration: number;
  bufferTime: number;
};

export const availabilitySettings: AvailabilitySettings = {
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  openingTime: "09:00",
  closingTime: "18:00",
  breakTimes: [{ start: "12:00", end: "13:00" }],
  staffAvailability: [
    { staff: "Ahmed", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], start: "09:00", end: "17:00" },
    { staff: "Sara", days: ["Monday", "Wednesday", "Friday", "Saturday"], start: "10:00", end: "18:00" },
  ],
  holidays: ["2024-08-14"],
  blockedDates: ["2024-07-01"],
  slotDuration: 30,
  bufferTime: 10,
};