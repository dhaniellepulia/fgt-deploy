//FAQ Page
import React from "react";
import { useState } from "react";
import { ChevronDown, Gamepad2 } from "lucide-react";
import AccordionItem from "../components/Accordion.jsx";
import NavBar from "../components/ExternalNavBar.jsx";

//Mock data for the FAQ
const faqData = [
  {
    question: "What is PNE?",
    answer:
      "PNE is a platform designed for gamers to participate in playtests for upcoming games. It connects developers with the community to ensure high-quality gaming experiences while rewarding players for their time and feedback.",
  },
  {
    question: "How do I sign up?",
    answer:
      "Signing up is easy! Just click the 'Register' button on our homepage, fill out your gamer profile, and you'll be ready to start applying for playtests immediately.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Yes. We take security seriously. Your data is encrypted and only shared with developers when you are selected for a specific test, following our strict privacy guidelines.",
  },
  {
    question: "How do I earn rewards?",
    answer:
      "Rewards are earned by completing playtest sessions and providing detailed feedback. Once a developer verifies your session, rewards are credited to your account balance.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen space-y-10">
      <header className="mb-0">
        <div className="bg-[linear-gradient(90deg,rgba(255,189,75,0.07)_0%,#201E26_87%)] text-white">
          <NavBar />
          <div className="max-w-5xl mx-auto relative p-20 px-6 z-10 space-y-5">
            <h1 className="text-4xl md:text-5xl font-extrabold">
              Frequently Asked Questions by Players
            </h1>
            <p className="text-gray-400 text-lg ">
              Below you'll find the most common questions asked by players. If
              you don't find your answers, feel free to{" "}
              <span className="text-yellow-500 font-bold cursor-pointer hover:underline">
                contact our support team
              </span>
              , we'll be glad to assist you!
            </p>
          </div>
        </div>
      </header>

      {/* Accordion Content Section */}
      <div className="bg-white px-6 py-20 max-h-full h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <AccordionItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onClick={() => toggleAccordion(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
