import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const LandingCTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ready to Simplify Your Institute Management?
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Join educational leaders using IMS Cloud to automate batch schedules, conduct online CBT exams, and provide students with a modern learning experience.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>Access Universal Login</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};
