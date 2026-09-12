import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full min-h-screen overflow-hidden text-[#f4e9dc] font-sans bg-gradient-to-r from-[#21242d] from-50% to-[#2d3037] to-50% px-6 py-8 md:px-12 md:py-8">
      {/* Ghosted background text, right side */}
      <div
        aria-hidden="true"
        className="hidden md:flex absolute top-0 right-0 w-1/2 flex-col items-end leading-[0.75] font-bold text-[9vw] tracking-tighter text-[#282b32] select-none pointer-events-none gap-5"
      >
        <span className="self-start">Workflow</span>
        <span className="self-start">Orchestrator</span>
      </div>

      {/* Top navigation */}
      <header className="relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-[13px] tracking-wide">
          <span className="text-[#f47a3d] text-xs">♦</span>ROTOM
        </div>
        <button
          aria-label="Open menu"
          className="flex flex-col gap-[5px] p-2 bg-transparent border-0 cursor-pointer"
        >
          <span className="block w-5 h-0.5 bg-[#f4e9dc]" />
          <span className="block w-5 h-0.5 bg-[#f4e9dc]" />
          <span className="block w-5 h-0.5 bg-[#f4e9dc]" />
        </button>
      </header>

      {/* Hero headline */}
      <h1 className="relative md:absolute md:left-[25%] md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20 mt-14 md:mt-0 max-w-[420px] text-5xl md:text-6xl lg:text-[80px] font-bold leading-[1.1] text-[#efdfc9] text-center md:text-left">
        Workflow
        <br />
        Orchestrator
      </h1>

      {/* Scroll / next arrow */}
      <button
        aria-label="Next"
        className="hidden md:block absolute top-[48%] right-[60px] bg-transparent border-0 text-[#f4e9dc] text-2xl cursor-pointer opacity-80 transition-all duration-200 hover:opacity-100 hover:translate-x-1"
      >
        →
      </button>

      {/* Bottom-left info panel */}
      <div className="relative md:absolute md:bottom-[90px] md:left-0 z-20 mt-6 md:mt-0 max-w-[280px] bg-[#2d3037] border-t border-white/10 px-7 py-5">
        <h2 className="text-[15px] font-semibold mb-2.5">
          Black Lifestyle Lovers.
        </h2>
        <p className="text-[12.5px] leading-relaxed text-[#9a99a3]">
          Experience what it feels like drinking your favourite beverage out
          of our premium, all-black mug that are designed with youth in mind.
        </p>
      </div>

      {/* Bottom-right info panel with play button */}
      <div className="relative md:absolute md:bottom-[90px] md:right-0 z-20 mt-6 md:mt-0 flex items-center gap-4 max-w-full md:max-w-[340px] bg-[#21242d] border-t border-white/10 px-7 py-5">
        <div>
          <h2 className="text-[15px] font-semibold mb-2.5">The design.</h2>
          <p className="text-[12.5px] leading-relaxed text-[#9a99a3]">
            Learn more what makes our Black Tumbler unique and different.
            Let&apos;s watch the video.
          </p>
        </div>
        <button
          aria-label="Play video"
          className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f47a3d] text-[#202027] text-[13px] flex items-center justify-center border-0 cursor-pointer transition-transform duration-200 hover:scale-110"
        >
          ▶
        </button>
      </div>

      {/* Workflows button (left section) */}
      <div className="relative md:absolute md:bottom-[200px] md:right-[calc(50%+16px)] z-20 mt-6 md:mt-0 flex justify-center md:justify-end">
        <button 
          onClick={() => navigate('/workflows')}
          className="px-8 py-3 bg-[#f47a3d] text-[#202027] text-[14px] font-semibold rounded-full transition-transform duration-200 hover:scale-105 shadow-lg"
        >
          Workflows
        </button>
      </div>

      {/* Dashboard button (right section) */}
      <div className="relative md:absolute md:bottom-[200px] md:left-[calc(50%+16px)] z-20 mt-6 md:mt-0 flex justify-center md:justify-start">
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-[#2d3037] text-[#f4e9dc] text-[14px] font-semibold rounded-full transition-transform duration-200 hover:scale-105 border border-white/10 shadow-lg hover:bg-[#383c45]"
        >
          Dashboard
        </button>
      </div>

      {/* Bottom-left CTA */}
      <div className="relative md:absolute md:bottom-7 md:left-0 mt-6 md:mt-0 flex items-center">
        <span aria-hidden="true" className="w-[60px] h-[3px] bg-[#f47a3d] inline-block" />
        <a
          href="#explore"
          className="ml-4 text-[#f4e9dc] no-underline text-[11px] font-semibold tracking-[1.5px] uppercase"
        >
          Explore Now
        </a>
      </div>

      {/* Bottom-right credit */}
      <div className="relative md:absolute md:bottom-7 md:right-12 mt-4 md:mt-0 text-[10px] tracking-[1.5px] uppercase text-[#9a99a3]">
        Credit
      </div>
    </div>
  );
}