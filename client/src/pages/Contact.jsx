//Contact Page
import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import ExternalNavBar from "../components/ExternalNavBar";

function Contact() {
  return (
    <div className="min-h-screen h-full bg-[#201e26] w-full overflow-hidden">
      <ExternalNavBar />

      <main className="h-full min-h-screen lg:h-[calc(100vh-70px)] flex lg:flex-row flex-col max-w-[1640px] mx-auto relative lg:static gap-5 pt-20 lg:pt-1">
        <div className="absolute bottom-0 left-0 pointer-events-none">
          <img
            className="max-w-150 lg:max-w-225 h-auto"
            src="../src/assets/gradient.png"
            alt="gradient"
          />
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
          <img
            className="w-full max-w-md h-auto"
            src="../src/assets/contact.png"
            alt="signup picture"
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-1">
          <div className="w-full p-8 space-y-5">
            <h2 className="text-[#F9B71E] font-bold text-5xl">Get in touch!</h2>
            <p className="text-gray-300">
              If you have any question, you can check our{" "}
              <Link
                to="/faq"
                className="text-[#F9B71E] underline decoration-[#F9B71E]"
              >
                Frequently Asked Questions (FAQs)
              </Link>
              or create a new Support Ticket using the form displayed at the
              bottom right.
            </p>
            <p className="text-gray-300">
              Our player Support Team will get back to you as soon as possible.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Contact;
