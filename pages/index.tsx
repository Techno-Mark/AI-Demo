// pages/index.js
import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faComments,
  faNotesMedical,
  faLightbulb,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center text-center py-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-10">Services</h1>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/resume-matching" passHref>
          <button className="flex items-center bg-white rounded-full px-4 py-2 shadow-md hover:scale-105 transform transition duration-200 ease-in-out cursor-pointer border border-gray-200">
            <FontAwesomeIcon
              icon={faFileAlt}
              size="2xl"
              className="text-green-500 mr-2"
            />
            <span className="text-base font-medium text-gray-700">
              Resume Match Making
            </span>
          </button>
        </Link>

        <Link href="/medical-history" passHref>
          <button className="flex items-center bg-white rounded-full px-4 py-2 shadow-md hover:scale-105 transform transition duration-200 ease-in-out cursor-pointer border border-gray-200">
            <FontAwesomeIcon
              icon={faNotesMedical}
              size="2xl"
              className="text-green-500 mr-2"
            />
            <span className="text-base font-medium text-gray-700">
              Medical History
            </span>
          </button>
        </Link>

        <Link href="/chatbot-bi" passHref>
          <button className="flex items-center bg-white rounded-full px-4 py-2 shadow-md hover:scale-105 transform transition duration-200 ease-in-out cursor-pointer border border-gray-200">
            <FontAwesomeIcon
              icon={faComments}
              size="2xl"
              className="text-green-500 mr-2"
            />
            <span className="text-base font-medium text-gray-700">Chatbot</span>
          </button>
        </Link>

        <Link href="/product-recommendation" passHref>
          <button className="flex items-center bg-white rounded-full px-4 py-2 shadow-md hover:scale-105 transform transition duration-200 ease-in-out cursor-pointer border border-gray-200">
            <FontAwesomeIcon
              icon={faLightbulb}
              size="2xl"
              className="text-green-500 mr-2"
            />
            <span className="text-base font-medium text-gray-700">
              Product Recommendation
            </span>
          </button>
        </Link>

        <Link href="/chat-summary" passHref>
          <button className="flex items-center bg-white rounded-full px-4 py-2 shadow-md hover:scale-105 transform transition duration-200 ease-in-out cursor-pointer border border-gray-200">
            <FontAwesomeIcon
              icon={faClipboardList}
              size="2xl"
              className="text-green-500 mr-2"
            />
            <span className="text-base font-medium text-gray-700">
              Chat Summary
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
