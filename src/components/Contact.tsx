"use client";

import { useState } from "react";

export default function Contact() {
  return (
    <section id="contact" className="relative w-full min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-4">Contact</h2>
          <div className="w-24 h-px bg-foreground/20 mt-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
              meredithvf@gmail.com
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
