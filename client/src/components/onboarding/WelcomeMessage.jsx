//page for Onboarding > Welcome Message
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import gamerProfileImg from "../../assets/gamer-profile.gif";
import gameSelectionImg from "../../assets/game-selection.gif";
import rewardsImg from "../../assets/earn-rewards.gif";
import communityImg from "../../assets/community.gif";

// Mock data for the slides
const slides = [
  {
    title: "Gamer Profile",
    description: "Playtests will be assigned to you based on your interests.",
    image: gamerProfileImg,
  },
  {
    title: "Game Selection",
    description:
      "Choose from a wide variety of genres and upcoming indie titles.",
    image: gameSelectionImg,
  },
  {
    title: "Earn Rewards",
    description:
      "Complete playtests and provide feedback to earn exclusive points.",
    image: rewardsImg,
  },
  {
    title: "Join the Community",
    description:
      "Connect with other playtesters and developers around the world.",
    image: communityImg,
  },
];

function WelcomeMessage() {
  const navigate = useNavigate();
  const { completeOnboardingStep, user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const localOnboarding = user?.onboarding || {};
    const hasProfileCompleted = Boolean(
      user?.onboardingProfileCompleted || localOnboarding.profileCompleted,
    );
    const hasQuestionnaireCompleted = Boolean(
      user?.onboardingQuestionnaireCompleted ||
      localOnboarding.questionnaireCompleted,
    );

    if (hasQuestionnaireCompleted) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (hasProfileCompleted) {
      navigate("/onboarding/questionnaire", { replace: true });
    }
  }, [navigate, user]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSkip = () => {
    setCurrentIndex(slides.length - 1);
  };

  const handleFinish = () => {
    completeOnboardingStep("welcomeSeen");
    navigate("/onboarding/additional-info");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans">
      {/* Main Card */}
      <div className="w-full max-w-2xl bg-[#252525] rounded-xl overflow-hidden flex flex-col transition-all">
        {/* Header */}
        <div className="pt-8 pb-4 text-center">
          <h2 className="text-[#f9b331] font-bold text-xl tracking-wider uppercase">
            Welcome to PNE!
          </h2>
        </div>

        {/* Carousel / Image Placeholder */}
        <div className="relative aspect-video bg-[#292d33] group overflow-hidden">
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
            key={currentIndex}
          >
            {slides[currentIndex].image ? (
              <img
                src={slides[currentIndex].image}
                alt={slides[currentIndex].title}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="absolute text-white/10 text-8xl font-black select-none">
                {currentIndex + 1}
              </span>
            )}
          </div>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#f9b331] flex items-center justify-center text-[#f9b331] hover:bg-[#f9b331] hover:text-black transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#f9b331] flex items-center justify-center text-[#f9b331] hover:bg-[#f9b331] hover:text-black transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="flex flex-col items-center px-12 py-8 text-center min-h-[220px]">
          {/* Pagination Dots */}
          <div className="flex space-x-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  currentIndex === index ? "bg-[#f9b331]" : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          <h1 className="text-white text-3xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {slides[currentIndex].title}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
            {slides[currentIndex].description}
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-8 py-8 mt-auto">
          <button
            onClick={handleSkip}
            className="text-gray-500 font-bold hover:text-gray-300 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={
              currentIndex === slides.length - 1 ? handleFinish : handleNext
            }
            className="bg-gradient-to-b from-[#4179f1] to-[#2b56cb] text-white px-10 py-2.5 rounded-lg font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            {currentIndex === slides.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeMessage;
