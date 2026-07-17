"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Moon, Sun, Menu, X, Star, Users, ArrowRight, 
  FileText, Image as ImageIcon, Zap, QrCode, FileArchive,
  Code, Shield, Video, Music, Share2, Palette, Calculator, Lock, LayoutGrid, Heart, Sparkles, Command
} from 'lucide-react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: 'PDF Tools', icon: <FileText className="w-4 h-4 text-violet-600" /> },
    { name: 'Image Tools', icon: <ImageIcon className="w-4 h-4 text-violet-600" /> },
    { name: 'AI Tools', icon: <Zap className="w-4 h-4 text-violet-600" /> },
    { name: 'Developer', icon: <Code className="w-4 h-4 text-violet-600" /> },
    { name: 'SEO Tools', icon: <Search className="w-4 h-4 text-violet-600" /> },
    { name: 'Colors', icon: <Palette className="w-4 h-4 text-violet-600" /> },
    { name: 'Security', icon: <Shield className="w-4 h-4 text-violet-600" /> },
    { name: 'Video', icon: <Video className="w-4 h-4 text-violet-600" /> },
  ];

  const tools = [
    { id: 1, name: 'Merge PDF', desc: 'Combine multiple PDFs into one seamlessly with zero quality loss.', icon: <FileArchive className="w-6 h-6 text-indigo-600" />, users: '1.2M', rating: 4.9, isNew: false },
    { id: 2, name: 'Background Remover', desc: 'Extract subjects from any image using advanced AI in 1 click.', icon: <ImageIcon className="w-6 h-6 text-fuchsia-600" />, users: '850K', rating: 4.8, isNew: true },
    { id: 3, name: 'QR Code Generator', desc: 'Create custom, trackable QR codes with premium brand logos.', icon: <QrCode className="w-6 h-6 text-slate-700" />, users: '2.1M', rating: 4.9, isNew: false },
    { id: 4, name: 'AI Text Summarizer', desc: 'Instantly summarize long articles into digestible bullet points.', icon: <Zap className="w-6 h-6 text-amber-500" />, users: '500K', rating: 4.7, isNew: true },
    { id: 5, name: 'PDF to Word', desc: 'Convert PDF files to perfectly editable Word documents.', icon: <FileText className="w-6 h-6 text-blue-600" />, users: '3.4M', rating: 4.9, isNew: false },
    { id: 6, name: 'Password Generator', desc: 'Create highly secure, encrypted & random passwords instantly.', icon: <Lock className="w-6 h-6 text-emerald-600" />, users: '920K', rating: 4.8, isNew: false },
  ];

  const ToolCard = ({ tool }) => (
    <div className="group bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative cursor-pointer overflow-hidden">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {tool.isNew && (
        <span className="absolute top-5 right-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-sm">
          New
        </span>
      )}
      
      <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-white transition-all duration-300 shadow-sm">
        {tool.icon}
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{tool.name}</h3>
      <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-2 leading-relaxed">{tool.desc}</p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/80">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {tool.users}</span>
          <span className="flex items-center gap-1.5 text-amber-500"><Star className="w-3.5 h-3.5 fill-current" /> {tool.rating}</span>
        </div>
        <Link 
          href={tool.id === 3 ? "/qr-code" : "#"} 
          className="text-indigo-600 bg-indigo-50/80 group-hover:bg-indigo-600 group-hover:text-white px-3 py-1.5 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-1"
        >
          Open <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans bg-white text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      
      {/* 🚀 Floating Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'top-4 px-4' : 'top-0 px-0'}`}>
        <div className={`max-w-7xl mx-auto transition-all duration-500 flex justify-between items-center ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/50 rounded-full px-6 py-3' 
            : 'bg-transparent py-5 px-4 sm:px-6 lg:px-8 border-b border-transparent'
        }`}>
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-all">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Rootixa<span className="text-indigo-600">.</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <a href="#" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all">Categories</a>
            <a href="#" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-violet-500" /> AI Tools
            </a>
            <a href="#" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all">Pricing</a>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <a href="#" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-2">Log In</a>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transform hover:-translate-y-px">
              Get Started
            </button>
          </div>

          <button className="md:hidden p-2 text-slate-600 bg-slate-50 rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* 🚀 Hero Section (Pure White Base) */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-28 overflow-hidden px-4 bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-20"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-gradient-to-b from-indigo-500/15 via-purple-500/5 to-transparent rounded-full blur-3xl -z-10"></div>
        
        {/* Subtle Bottom Faded Line Divider */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold mb-8 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Introducing Rootixa AI 2.0</span>
            <span className="text-slate-300">|</span>
            Explore Now &rarr;
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
            All Your Digital Tasks, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600">Solved in Seconds.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Your 100% free, all-in-one digital workspace. Edit PDFs, generate QR codes, and automate workflows with AI instantly.
          </p>
          
          {/* Search Bar with depth */}
          <div className="relative max-w-2xl mx-auto group mb-8">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-14 pr-32 py-5 rounded-3xl border-2 border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus:border-indigo-500 focus:shadow-[0_8px_30px_rgba(79,70,229,0.1)] text-lg outline-none transition-all placeholder:text-slate-400 font-medium" 
              placeholder="Search for any tool..."
            />
            <div className="absolute inset-y-2.5 right-2.5 flex items-center">
              <div className="hidden md:flex items-center gap-1 mr-3 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                <Command className="w-3 h-3" /> K
              </div>
              <button className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl hover:bg-slate-800 transition-colors font-bold text-sm shadow-md">
                Search
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-4 justify-start md:justify-center items-center gap-3 text-sm no-scrollbar px-2 max-w-3xl mx-auto fade-edges">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5 transition-all whitespace-nowrap shadow-sm group">
                <div className="bg-slate-50 p-1.5 rounded-lg group-hover:bg-violet-50 transition-colors">{cat.icon}</div>
                <span className="font-semibold text-slate-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 Tools & Ad Section (Off-White Background for Contrast) */}
      <section className="bg-slate-50/80 py-20 px-4 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Leaderboard Ad */}
          <div className="w-full max-w-4xl mx-auto h-[90px] bg-white border border-slate-200 border-dashed rounded-3xl flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            Advertisement Space
          </div>

          {/* Tools Grid Section */}
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Most Popular Tools</h2>
                <p className="text-slate-500 text-base mt-2 font-medium">The utilities our community relies on daily.</p>
              </div>
              <a href="#" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors flex items-center gap-1 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl">
                View All Tools <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Advanced AI CTA Section (Pure White Base) */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[2.5rem] bg-slate-900 text-white shadow-2xl overflow-hidden p-10 md:p-16 border border-slate-800">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-violet-600/30 via-indigo-600/10 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-violet-300 text-xs font-bold mb-6 backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" /> Rootixa Smart Assistant
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                  Work at the speed <br className="hidden md:block"/> of thought.
                </h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed font-medium">
                  Just type what you want to achieve. E.g., <span className="text-white">"Convert this PDF to Word and translate to Spanish."</span> Our AI chains the right tools automatically.
                </p>
                <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-extrabold hover:bg-slate-100 transition-all w-full md:w-auto shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex justify-center items-center gap-2 transform hover:-translate-y-1">
                  Try AI Beta <Sparkles className="w-5 h-5 text-violet-600" />
                </button>
              </div>
              
              <div className="hidden lg:block w-1/3">
                 <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl relative">
                   <div className="absolute -left-4 top-1/2 w-8 h-8 bg-violet-500 rounded-full blur-xl animate-pulse"></div>
                   <div className="space-y-4">
                     <div className="h-3 w-1/2 bg-white/20 rounded-full"></div>
                     <div className="h-3 w-3/4 bg-white/10 rounded-full"></div>
                     <div className="h-3 w-5/6 bg-white/10 rounded-full"></div>
                     <div className="pt-4 mt-4 border-t border-white/10">
                       <div className="bg-violet-600/20 text-violet-200 text-xs font-bold px-3 py-2 rounded-lg border border-violet-500/30 inline-block">
                         ✓ PDF Converted & Translated
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 Ultra Clean Footer (Slightly different background for separation) */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5 group">
                <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Rootixa<span className="text-violet-600">.</span></span>
              </div>
              <p className="text-slate-500 text-sm mb-6 max-w-sm leading-relaxed font-medium">
                The ultimate free digital workspace designed for speed, privacy, and simplicity. No paywalls, no nonsense.
              </p>
            </div>
            
            <div>
              <h4 className="font-extrabold text-slate-900 mb-5 text-sm">Top Tools</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-violet-600 transition-colors">Merge PDF</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Background Remover</a></li>
                <li><a href="/qr-code" className="hover:text-violet-600 transition-colors flex items-center gap-2">QR Generator <span className="bg-violet-100 text-violet-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Hot</span></a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-extrabold text-slate-900 mb-5 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-violet-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Suggest Tool</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 mb-5 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-violet-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-semibold text-slate-400">
            <p>&copy; {new Date().getFullYear()} Rootixa. All rights reserved.</p>
            <p className="flex items-center gap-1.5">Designed with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> for creators.</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .fade-edges { mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); }
      `}} />
    </div>
  );
}