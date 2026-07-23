// src/pages/SupportPage.tsx
import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaComments,
  FaQuestionCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";

// ---------------------------------------------------------------------------
// Canonical contact details — Shippitin Logistics Private Limited
// Keep these in sync with Footer.tsx / ContactPage.tsx. Better still: move this
// block into src/config/site.ts and import it everywhere.
// ---------------------------------------------------------------------------
const CONTACT = {
  phoneDisplay: "+91 90632 41292",
  phoneHref: "tel:+919063241292",
  supportEmail: "shippitinindia@gmail.com",
  salesEmail: "shippitinindia@gmail.com",
  hours: "Mon – Sat, 9:30 AM – 6:30 PM IST",
  responseSla: "We reply to every email within 1 business day.",
  addressLines: [
    "Shippitin Logistics Private Limited",
    "3-28-46/1, 5th Lane, Brundavan Gardens",
    "Guntur, Andhra Pradesh 522006",
    "India",
  ],
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Brundavan+Gardens+Guntur+Andhra+Pradesh+522006",
  cin: "U63000AP2022PTC122864",
  dpiit: "DIPP118326",
};

type FormStatus = "idle" | "sending" | "sent" | "error";

const SupportPage: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setErrorMsg("Add your name, email and message before sending.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/support/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        `Message could not be sent. Email us directly at ${CONTACT.supportEmail} or call ${CONTACT.phoneDisplay}.`
      );
      console.error("Support form submit failed:", err);
    }
  };

  // Opens the floating chatbot if it is mounted; otherwise sends the user to
  // the contact form rather than showing a broken-feature alert.
  const handleStartChat = () => {
    const chatbotElement = document.getElementById("floating-chatbot");
    if (chatbotElement) {
      chatbotElement.scrollIntoView({ behavior: "smooth", block: "center" });
      chatbotElement.dispatchEvent(new CustomEvent("openChatbot"));
    } else {
      document
        .getElementById("contact-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          How Can We <span className="text-yellow-300">Help You?</span>
        </h1>
        <p
          className="text-lg max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          Questions on rail indents, container bookings, customs documentation or
          tracking — our team is here to help.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
            Get In <span className="text-blue-700">Touch</span>
          </h2>
          <p
            className="text-gray-600 text-lg max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            {CONTACT.hours} · {CONTACT.responseSla}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Call Us */}
          <div
            className="group p-8 border border-gray-200 rounded-xl shadow-lg bg-white
                        hover:shadow-xl hover:border-blue-300 transform hover:-translate-y-2
                        transition duration-300 ease-in-out flex flex-col items-center text-center"
          >
            <FaPhoneAlt className="text-5xl text-blue-600 mb-4 group-hover:text-blue-700 transition-colors" />
            <h3 className="font-bold text-2xl mb-2 text-gray-800 group-hover:text-blue-700">
              Call Us
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Speak to the team directly during business hours.
            </p>
            <a
              href={CONTACT.phoneHref}
              className="mt-auto inline-block bg-brand-gradient text-white font-semibold py-2 px-6 rounded-full
                         shadow-md hover:opacity-90 transition duration-300 transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {CONTACT.phoneDisplay}
            </a>
          </div>

          {/* Email */}
          <div
            className="group p-8 border border-gray-200 rounded-xl shadow-lg bg-white
                        hover:shadow-xl hover:border-purple-300 transform hover:-translate-y-2
                        transition duration-300 ease-in-out flex flex-col items-center text-center"
          >
            <FaEnvelope className="text-5xl text-purple-600 mb-4 group-hover:text-purple-700 transition-colors" />
            <h3 className="font-bold text-2xl mb-2 text-gray-800 group-hover:text-purple-700">
              Email Support
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Send booking references or documents and we'll pick it up from
              there.
            </p>
            <a
              href={`mailto:${CONTACT.supportEmail}`}
              className="mt-auto inline-block bg-purple-600 text-white font-semibold py-2 px-5 rounded-full text-sm
                         shadow-md hover:bg-purple-700 transition duration-300 transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {CONTACT.supportEmail}
            </a>
          </div>

          {/* Live Chat */}
          <div
            className="group p-8 border border-gray-200 rounded-xl shadow-lg bg-white
                        hover:shadow-xl hover:border-green-300 transform hover:-translate-y-2
                        transition duration-300 ease-in-out flex flex-col items-center text-center"
          >
            <FaComments className="text-5xl text-green-600 mb-4 group-hover:text-green-700 transition-colors" />
            <h3 className="font-bold text-2xl mb-2 text-gray-800 group-hover:text-green-700">
              Live Chat
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Quick answers on rates, routes and lead times.
            </p>
            <button
              type="button"
              onClick={handleStartChat}
              className="mt-auto inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-full
                         shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Start Chat
            </button>
          </div>

          {/* Visit Us */}
          <div
            className="group p-8 border border-gray-200 rounded-xl shadow-lg bg-white
                        hover:shadow-xl hover:border-amber-300 transform hover:-translate-y-2
                        transition duration-300 ease-in-out flex flex-col items-center text-center"
          >
            <FaMapMarkerAlt className="text-5xl text-amber-500 mb-4 group-hover:text-amber-600 transition-colors" />
            <h3 className="font-bold text-2xl mb-2 text-gray-800 group-hover:text-amber-600">
              Visit Us
            </h3>
            <address className="text-sm text-gray-600 mb-4 not-italic leading-relaxed">
              {CONTACT.addressLines.slice(1).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-block bg-amber-500 text-white font-semibold py-2 px-6 rounded-full
                         shadow-md hover:bg-amber-600 transition duration-300 transform hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Open in Maps
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <section
          id="contact-form"
          className="mb-16 bg-white p-8 rounded-xl shadow-lg border border-gray-200"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Send Us a Message
          </h2>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ravi Kumar"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Email
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ravi@company.co.in"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rate enquiry — Hyderabad to Mumbai, 2 x 40ft"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Message
              </label>
              <textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Include your booking reference or container number if you have one."
              ></textarea>
            </div>

            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-block bg-brand-gradient text-white font-semibold py-3 px-8 rounded-full
                           shadow-lg hover:opacity-90 transition duration-300 transform hover:scale-105
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>

              <div aria-live="polite" className="mt-4 min-h-[1.5rem]">
                {status === "sent" && (
                  <p className="text-green-700 font-medium">
                    Message sent. {CONTACT.responseSla}
                  </p>
                )}
                {status === "error" && (
                  <p className="text-red-700 font-medium">{errorMsg}</p>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* FAQ */}
        <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
              <summary className="flex justify-between items-center font-semibold text-gray-800">
                How can I track my shipment?
                <FaQuestionCircle className="text-blue-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-2 pl-4 border-l-2 border-blue-200">
                Use the booking reference or container number issued at the time
                of booking on our{" "}
                <a href="/track" className="text-blue-600 hover:underline">
                  tracking page
                </a>
                .
              </p>
            </details>

            <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
              <summary className="flex justify-between items-center font-semibold text-gray-800">
                Which services can I book through Shippitin?
                <FaQuestionCircle className="text-blue-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-2 pl-4 border-l-2 border-blue-200">
                Containerised rail freight, sea and air freight, road and LCL
                movements, first and last mile, door-to-door, customs clearance
                and cargo insurance. See the{" "}
                <a href="/services" className="text-blue-600 hover:underline">
                  services page
                </a>{" "}
                for the full list.
              </p>
            </details>

            <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
              <summary className="flex justify-between items-center font-semibold text-gray-800">
                How do I get a quote?
                <FaQuestionCircle className="text-blue-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-2 pl-4 border-l-2 border-blue-200">
                Enter your origin, destination, container type and cargo details
                to get an indicative rate instantly. For contract or volume
                pricing, write to{" "}
                <a
                  href={`mailto:${CONTACT.salesEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {CONTACT.salesEmail}
                </a>
                .
              </p>
            </details>

            <details className="group border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
              <summary className="flex justify-between items-center font-semibold text-gray-800">
                What documents do I need for an export booking?
                <FaQuestionCircle className="text-blue-500 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-2 pl-4 border-l-2 border-blue-200">
                Typically your IEC, GSTIN, commercial invoice, packing list and
                shipping bill. Requirements vary by route and commodity — our
                team will confirm the exact set once your booking is raised.
              </p>
            </details>
          </div>
        </section>

        {/* Registered office / statutory strip */}
        <section className="text-center text-sm text-gray-600">
          <address className="not-italic leading-relaxed">
            <span className="font-semibold text-gray-800">
              {CONTACT.addressLines[0]}
            </span>
            <br />
            {CONTACT.addressLines.slice(1).join(", ")}
          </address>
          <p className="mt-2">
            CIN: {CONTACT.cin} &nbsp;·&nbsp; DPIIT Recognition: {CONTACT.dpiit}
          </p>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
