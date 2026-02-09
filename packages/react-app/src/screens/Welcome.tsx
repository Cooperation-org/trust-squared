import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const slides = [
  {
    title: "What is G$?",
    description:
      "G$ is the digital token used for Universal Basic Income (UBI). Anyone can claim daily G$ and use it to support others.",
    icon: (
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-yellow-500/30">
        G
      </div>
    ),
  },
  {
    title: "What is Streaming?",
    description:
      "Send small amounts continuously over time, like a subscription. Support people you trust with a steady flow of G$.",
    icon: (
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M2 12h20" />
          </svg>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>
    ),
  },
  {
    title: "How Trust² Works",
    description:
      "Verify your identity, stream G$ to people you trust, and build your reputation score. The more diverse your support, the higher your Trust Score.",
    icon: (
      <img src="/logo2.svg" alt="Trust²" className="w-20" />
    ),
  },
];

interface WelcomeProps {
  onComplete: () => void;
}

export default function Welcome({ onComplete }: WelcomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between px-6 py-12">
      {/* Skip button */}
      <div className="w-full flex justify-end">
        <button
          onClick={onComplete}
          className="text-gray-400 text-sm flex items-center gap-1 hover:text-white transition-colors"
        >
          Skip <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-sm">
        <div className="flex items-center justify-center">{slide.icon}</div>
        <div className="space-y-4">
          <h2 className="text-white text-2xl font-bold">{slide.title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{slide.description}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full space-y-6">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentSlide ? "bg-green-500" : "bg-gray-600"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium text-base"
        >
          {currentSlide < slides.length - 1 ? "Next" : "Get Started"}
        </Button>
      </div>
    </div>
  );
}
