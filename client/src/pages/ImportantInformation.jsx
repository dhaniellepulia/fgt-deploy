//Page for Important Information
import React from "react";
import NavBar from "../components/ExternalNavBar.jsx";
import { useNavigate } from "react-router-dom";

const ImportantInformation = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-[#1F1F1F]">
      <header className="mb-0">
        <div className="bg-[#4152B3] text-white">
          <NavBar />
        </div>
      </header>

      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-[#252525] mx-auto my-20">
        <div className="bg-[#323232] py-4 text-center">
          <h2 className="text-xl font-bold tracking-wider text-[#FFB400]">
            IMPORTANT INFORMATION
          </h2>
        </div>

        <div className="space-y-8 p-8 text-gray-300 leading-relaxed">
          <p className="text-[15px]">
            By creating an account on our platform you will be part of the
            creation process of the next generation of video games. Thus, you
            agree to our{" "}
            <span
              onClick={() => navigate("/playerterms")}
              className="cursor-pointer text-[#FFB400] underline hover:text-yellow-500"
            >
              terms of service
            </span>{" "}
            and engage yourself to respect some important rules:
          </p>

          <div className="space-y-10 px-4">
            <p className="text-[15px]">
              Respect the work of the developers:{" "}
              <span className="font-semibold text-[#FFB400]">
                don't disclose
              </span>{" "}
              or publish any information (gameplays, screen captures, etc) about
              the games you play on our platform.
            </p>

            <p className="text-[15px]">
              Help us to protect and honor the{" "}
              <span className="font-semibold text-[#FFB400]">
                trustful relation
              </span>{" "}
              we build between gaming studios and gamers.
            </p>

            <p className="text-[15px]">
              <span className="font-semibold text-[#FFB400]">
                Enjoy and help
              </span>{" "}
              videogame designers to create the very best experiences ever for
              us, gamers.
            </p>
          </div>
        </div>

        {/* <div className="flex justify-end p-8 pt-0">
          <button className="rounded-md bg-[#3B82F6] px-10 py-2 font-semibold text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Understood
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ImportantInformation;
