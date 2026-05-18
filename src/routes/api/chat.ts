import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { messages } = (await request.json()) as {
            messages: Msg[];
          };

          if (!Array.isArray(messages)) {
            return new Response("messages required", {
              status: 400,
            });
          }

          const userMessage =
            messages[messages.length - 1]?.content?.toLowerCase() || "";

          let reply =
            "Sorry, I don't have that information. Please contact hostel@sunriseresidency.in.";

          // GATE TIMINGS
          if (
            userMessage.includes("gate") ||
            userMessage.includes("curfew")
          ) {
            reply =
              "Main gate closes at 10:00 PM (Mon-Sat) and 9:00 PM (Sunday).";
          }

          // MESS TIMINGS
          else if (
            userMessage.includes("mess") ||
            userMessage.includes("food") ||
            userMessage.includes("breakfast") ||
            userMessage.includes("dinner")
          ) {
            reply = `
Breakfast: 7:30 AM – 9:30 AM
Lunch: 12:30 PM – 2:30 PM
Snacks: 5:00 PM – 6:00 PM
Dinner: 7:30 PM – 9:30 PM
            `;
          }

          // OUTPASS
          else if (
            userMessage.includes("outpass") ||
            userMessage.includes("leave")
          ) {
            reply =
              "You can apply for a day outpass one day in advance through the hostel app.";
          }

          // ROOM FEES
          else if (
            userMessage.includes("fee") ||
            userMessage.includes("rent") ||
            userMessage.includes("room")
          ) {
            reply = `
Single Room: ₹8,000/month
Double Sharing: ₹5,500/month
Triple Sharing: ₹4,000/month
Security Deposit: ₹10,000
            `;
          }

          // WIFI
          else if (
            userMessage.includes("wifi") ||
            userMessage.includes("wi-fi") ||
            userMessage.includes("internet") ||
            userMessage.includes("network") ||
            userMessage.includes("password") ||
            userMessage.includes("amenities")
          ) {
            reply = `
🌐 **Wi-Fi Details — Sunrise Residency Hostel**

Free high-speed Wi-Fi is available **24/7** on all floors.

📶 **Network Names & Password:**
• Floor 1 → **Hostel-Floor-1**
• Floor 2 → **Hostel-Floor-2**
• Floor 3 → **Hostel-Floor-3**
• Floor 4 → **Hostel-Floor-4**
• Floor 5 → **Hostel-Floor-5**

🔑 **Password:** Hostel@123456789

⚡ Connect to the floor you're on for the best signal.
For connectivity issues, contact the IT desk at reception.
            `;
          }

          // VISITORS
          else if (
            userMessage.includes("visitor") ||
            userMessage.includes("parents")
          ) {
            reply =
              "Visitors are allowed in the common lounge from 10:00 AM to 7:00 PM with valid ID.";
          }

          // LAUNDRY
          else if (
            userMessage.includes("laundry") ||
            userMessage.includes("washing")
          ) {
            reply =
              "Laundry pickup is available every Monday and Thursday morning.";
          }

          // COMPLAINTS
          else if (
            userMessage.includes("complaint") ||
            userMessage.includes("maintenance")
          ) {
            reply =
              "You can raise complaints through the hostel app or reception register.";
          }

          // WARDEN
          else if (
            userMessage.includes("warden") ||
            userMessage.includes("contact")
          ) {
            reply = `
Warden (Boys): +91-9876500011
Warden (Girls): +91-9876500022
Hostel Office: hostel@sunriseresidency.in
            `;
          }

          // RULES
          else if (
            userMessage.includes("rules") ||
            userMessage.includes("ragging")
          ) {
            reply =
              "Smoking, alcohol, drugs, and ragging are strictly prohibited inside the hostel.";
          }

          return Response.json({ reply });
        } catch (e) {
          return new Response((e as Error).message, {
            status: 500,
          });
        }
      },
    },
  },
});