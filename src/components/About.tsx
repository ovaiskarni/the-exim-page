import React from 'react';

export const About: React.FC = () => {
  return (
    <section id="about" className="w-full bg-[#fcfcfd] py-24 md:py-32 border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0047ff] mb-6">
            About REGISTREE
          </p>

          {/* Required 2 lines */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#090e1f] leading-[1.18] mb-12">
            REGISTREE helps businesses go online, automate and operate legally in India.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-gray-200 text-sm">
            <div>
              <h4 className="font-bold text-[#090e1f] text-base mb-2">Modern Digital Foundations</h4>
              <p className="text-[#090e1f]/70 leading-relaxed">
                We craft fast, conversion-focused corporate websites and bespoke digital portals for Indian and multinational businesses.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#090e1f] text-base mb-2">Autonomous Operations</h4>
              <p className="text-[#090e1f]/70 leading-relaxed">
                Deploy conversational AI voice agents and automated business pipelines that run 24/7 with zero downtime.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#090e1f] text-base mb-2">Regulatory Certainty</h4>
              <p className="text-[#090e1f]/70 leading-relaxed">
                From MCA incorporation to Trademark protection and cross-border trade, we ensure strict statutory compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
