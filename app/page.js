"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Moon, Sun, Menu, X, Star, Users, ArrowRight, 
  FileText, Image as ImageIcon, Zap, QrCode, FileArchive,
  Calculator, LayoutGrid, Heart, Sparkles, Command,
  Home, Wrench, Phone, User, ChevronDown
} from 'lucide-react';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePopularOpen, setMobilePopularOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.title = "Rootixa - All Your Digital Tasks, Solved in Seconds";

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check initial local storage for theme
    const savedTheme = localStorage.getItem('rootixa_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rootixa_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rootixa_theme', 'light');
    }
  };

  const marqueeTools = [
    { name: 'Merge PDF', icon: <FileArchive className="w-4 h-4 text-violet-600 dark:text-violet-400" /> },
    { name: 'Background Remover', icon: <ImageIcon className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" /> },
    { name: 'QR Generator', icon: <QrCode className="w-4 h-4 text-slate-700 dark:text-slate-300" /> },
    { name: 'CV Maker', icon: <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> },
    { name: 'Invoice Generator', icon: <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
    { name: 'AI Text Summarizer', icon: <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" /> },
    { name: 'Photo Resizer', icon: <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> },
  ];

  const tools = [
    { id: 1, name: 'QR & BAR Code Generator', desc: 'Create custom, trackable QR and Bar codes with premium brand logos.', icon: <QrCode className="w-6 h-6 text-slate-700 dark:text-slate-300" />, users: '2.1M', rating: 4.9, isNew: false, link: '/qr-code' },
    { id: 2, name: 'Pro CV Builder', desc: 'Build professional, ATS-friendly resumes in minutes to land your dream job.', icon: <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />, users: '1.5M', rating: 4.8, isNew: true, link: '#' },
    { id: 3, name: 'Image Resizer & Crop', desc: 'Resize, crop, and optimize images for any social media platform effortlessly.', icon: <ImageIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, users: '3.2M', rating: 4.9, isNew: false, link: '#' },
    { id: 4, name: 'AI Background Remover & Enhancer', desc: 'Extract subjects and enhance photo quality using advanced AI in 1 click.', icon: <Sparkles className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />, users: '850K', rating: 4.9, isNew: true, link: '#' },
    { id: 5, name: 'Image & PDF Converter', desc: 'Convert images to PDF or extract images from PDF documents seamlessly.', icon: <FileArchive className="w-6 h-6 text-violet-600 dark:text-violet-400" />, users: '4.1M', rating: 4.7, isNew: false, link: '#' },
    { id: 6, name: 'Invoice Generator', desc: 'Generate professional invoices and receipts on the go for your clients.', icon: <Calculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />, users: '920K', rating: 4.8, isNew: false, link: '#' },
  ];

  const ToolCard = ({ tool }) => (
    <div className="group bg-white dark:bg-slate-800/90 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full relative cursor-pointer overflow-hidden">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 dark:from-indigo-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-0 pointer-events-none"></div>

      {tool.isNew && (
        <span className="absolute top-5 right-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-sm z-10">
          New
        </span>
      )}
      
      <div className="relative z-10 w-14 h-14 bg-slate-50 dark:bg-slate-700/80 border border-slate-100 dark:border-slate-600/50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-700 transition-transform duration-500 shadow-sm group-hover:shadow-md">
        {tool.icon}
      </div>
      
      <h3 className="relative z-10 text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{tool.name}</h3>
      <p className="relative z-10 text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow line-clamp-2 leading-relaxed">{tool.desc}</p>
      
      <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 group-hover:border-indigo-100 dark:group-hover:border-indigo-500/20 transition-colors duration-300">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {tool.users}</span>
          <span className="flex items-center gap-1.5 text-amber-500"><Star className="w-3.5 h-3.5 fill-current" /> {tool.rating}</span>
        </div>
        <a 
          href={tool.link} 
          className="text-indigo-600 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-1.5 shadow-sm group-hover:shadow-indigo-500/30"
        >
          Open <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </a>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-500 ${darkMode ? 'dark bg-[#090E17] text-slate-200' : 'bg-white text-slate-800'}`}>
      
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'top-4 px-4' : 'top-0 px-0'}`}>
        <div className={`max-w-7xl mx-auto transition-all duration-500 flex justify-between items-center ${
          isScrolled 
            ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-full px-6 py-3' 
            : 'bg-transparent py-5 px-4 sm:px-6 lg:px-8 border-b border-transparent'
        }`}>
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 group-hover:shadow-indigo-300 group-hover:scale-105 transition-all duration-300">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span></span>
          </div>

          {/* Desktop Menu - Properly Ordered with Hover Effects */}
          <div className="hidden lg:flex items-center space-x-1.5">
            <a href="/" className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800/60 rounded-full transition-all duration-300 flex items-center gap-1.5">
              <Home className="w-4 h-4" /> Home
            </a>
            
            {/* Desktop Dropdown for Popular Tools - All 6 tools */}
            <div className="relative group/dropdown">
              <button className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800/60 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer">
                <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Popular Tools <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover/dropdown:rotate-180 transition-transform duration-300" />
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-50">
                <div className="w-[360px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/10 dark:shadow-black/50 rounded-2xl overflow-hidden transform translate-y-2 group-hover/dropdown:translate-y-0 transition-transform duration-300">
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Trending Tools</p>
                  </div>
                  {/* All 6 tools shown in dropdown */}
                  <div className="p-2 flex flex-col max-h-[350px] overflow-y-auto no-scrollbar">
                    {tools.map(tool => (
                      <a key={tool.id} href={tool.link} className="flex items-center gap-3 p-3 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors group/item">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover/item:bg-white dark:group-hover/item:bg-slate-600 shadow-sm transition-colors flex-shrink-0">
                          {React.cloneElement(tool.icon, { className: "w-5 h-5 text-indigo-500" })}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 line-clamp-1">{tool.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{tool.desc}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 text-center border-t border-slate-100 dark:border-slate-800">
                    <a href="#" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1">Explore all tools <ArrowRight className="w-3 h-3" /></a>
                  </div>
                </div>
              </div>
            </div>

            <a href="#" className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800/60 rounded-full transition-all duration-300 flex items-center gap-1.5">
              <Wrench className="w-4 h-4" /> All Tools
            </a>

            <a href="#" className="px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800/60 rounded-full transition-all duration-300 flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> Feedback
            </a>
          </div>

          <div className="hidden lg:flex items-center space-x-5">
            
            {/* Cute sliding pill Dark Mode toggle */}
            <button 
              onClick={toggleDarkMode}
              className="relative w-14 h-7.5 flex items-center bg-slate-200 dark:bg-slate-700/80 rounded-full p-1 cursor-pointer transition-colors duration-500 border border-slate-300/50 dark:border-slate-600/50 shadow-inner group hover:bg-slate-300 dark:hover:bg-slate-600"
              aria-label="Toggle Dark Mode"
            >
              <div className="flex justify-between w-full px-1.5 absolute inset-0 items-center z-0">
                 <Moon className="w-3.5 h-3.5 text-slate-400 dark:text-indigo-300 transition-colors" />
                 <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-slate-500 transition-colors" />
              </div>
              <div className={`w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-transform duration-500 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] flex items-center justify-center z-10 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}>
                {darkMode ? <Moon className="w-3 h-3 text-indigo-500" /> : <Sun className="w-3 h-3 text-amber-500" />}
              </div>
            </button>
            
            {/* Soft Indigo Login Button */}
            <button className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 border border-indigo-100 dark:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/10">
              <User className="w-4 h-4" /> Login / Sign Up
            </button>
          </div>

          <button className="lg:hidden p-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Layout */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl p-5 flex flex-col space-y-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <a href="/" className="text-slate-800 dark:text-slate-200 font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 px-4 py-3 rounded-xl flex items-center gap-3 transition-colors"><Home className="w-5 h-5 text-indigo-500" /> Home</a>
            
            {/* Mobile Dropdown Expander (Shows all 6) */}
            <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={() => setMobilePopularOpen(!mobilePopularOpen)} 
                className="w-full text-slate-800 dark:text-slate-200 font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 px-4 py-3 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3"><Star className="w-5 h-5 text-amber-500" /> Popular Tools</div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobilePopularOpen ? 'rotate-180 text-indigo-500' : ''}`} />
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${mobilePopularOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-y-auto no-scrollbar`}>
                <div className="p-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-2 bg-white dark:bg-slate-900">
                   {tools.map(tool => (
                     <a key={tool.id} href={tool.link} className="flex items-center gap-3 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors">
                       <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">{React.cloneElement(tool.icon, { className: "w-4 h-4 text-indigo-500" })}</div>
                       <span className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{tool.name}</span>
                     </a>
                   ))}
                </div>
              </div>
            </div>

            <a href="#" className="text-slate-800 dark:text-slate-200 font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 px-4 py-3 rounded-xl flex items-center gap-3 transition-colors"><Wrench className="w-5 h-5 text-indigo-500" /> All Tools</a>
            
            <a href="#" className="text-slate-800 dark:text-slate-200 font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 px-4 py-3 rounded-xl flex items-center gap-3 transition-colors"><Phone className="w-5 h-5 text-indigo-500" /> Feedback</a>
            
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl cursor-pointer" onClick={toggleDarkMode}>
               <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2">
                 {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />} Theme Mode
               </span>
               <button className="relative w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full p-1 transition-colors pointer-events-none">
                  <div className={`w-4 h-4 bg-white dark:bg-slate-900 rounded-full shadow-sm transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
               </button>
            </div>
            
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-2"></div>
            <button className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/30 px-5 py-4 rounded-2xl font-extrabold w-full flex justify-center items-center gap-2 transition-all shadow-sm">
              <User className="w-5 h-5" /> Login / Sign Up
            </button>
          </div>
        )}
      </nav>

      <section className="relative pt-36 pb-16 md:pt-48 md:pb-24 overflow-hidden px-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] -z-20"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-gradient-to-b from-indigo-500/15 via-purple-500/5 to-transparent dark:from-indigo-500/15 dark:via-purple-500/5 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-bold mb-8 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md transition-all backdrop-blur-sm group">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 group-hover:animate-pulse" />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">Introducing Rootixa 2.0</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="group-hover:translate-x-1 transition-transform">Explore Now &rarr;</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.1]">
            All Your Digital Tasks, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 dark:from-violet-400 dark:via-indigo-400 dark:to-blue-400">Solved in Seconds.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Your 100% free, all-in-one digital workspace. Edit PDFs, generate QR codes, and automate workflows with AI instantly.
          </p>
          
          {/* Animated Search Area */}
          <div className="relative max-w-2xl mx-auto group mb-10">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors duration-300" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-16 pr-32 py-5 rounded-full border border-slate-200 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/80 backdrop-blur-md shadow-xl shadow-slate-200/50 dark:shadow-black/20 focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 text-lg outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 dark:text-white" 
              placeholder="Search for any tool..."
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <div className="hidden md:flex items-center gap-1.5 mr-3 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600/50">
                <Command className="w-3 h-3" /> K
              </div>
              <button className="bg-indigo-600 dark:bg-indigo-500 text-white px-7 py-3 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-bold text-sm cursor-pointer">
                Search
              </button>
            </div>
          </div>

          {/* Marquee Animated Categories */}
          <div className="w-full max-w-3xl mx-auto overflow-hidden fade-edges relative px-2">
            <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap py-4">
              {[...marqueeTools, ...marqueeTools, ...marqueeTools].map((tool, idx) => (
                <a key={idx} href="#" className="mx-3 flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/20 hover:-translate-y-1 transition-all shadow-sm group">
                  <div className="bg-slate-50 dark:bg-slate-700/80 p-1.5 rounded-xl group-hover:bg-violet-50 dark:group-hover:bg-violet-500/20 transition-colors">{tool.icon}</div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors text-sm">{tool.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50/80 dark:bg-slate-900/50 py-20 px-4 border-b border-slate-200/60 dark:border-slate-800/80 flex-grow transition-colors duration-500 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 dark:from-indigo-900/10 via-transparent to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          
          <div className="w-full max-w-4xl mx-auto h-[90px] bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 border-dashed rounded-3xl flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            Advertisement Space
          </div>

          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Star className="w-8 h-8 text-amber-500 fill-amber-500" /> Most Popular Tools
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-base mt-2 font-medium">The most trending utilities our community is using right now.</p>
              </div>
              <a href="#" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md px-5 py-2.5 rounded-xl group">
                View All Tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-[#090E17] border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 px-4 mt-auto transition-colors duration-500 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5 group cursor-pointer">
                <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-md">
                  <LayoutGrid className="w-4 h-4 text-white dark:text-slate-900" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span></span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm leading-relaxed font-medium">
                The ultimate free digital workspace designed for speed, privacy, and simplicity. No paywalls, no nonsense.
              </p>
            </div>
            
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-5 text-sm uppercase tracking-wider">Top Tools</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Merge PDF</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Background Remover</a></li>
                <li><a href="/qr-code" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">QR Generator <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold border border-indigo-200 dark:border-indigo-700/50">Hot</span></a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-5 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Suggest Tool</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-5 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-semibold text-slate-400 dark:text-slate-500 text-center">
            <p>&copy; {new Date().getFullYear()} Rootixa. All rights reserved.</p>
            {/* Fixed Mobile Formatting for Footer Credit */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p>A product Of <span className="text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wide">SW-IT</span></p>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
              <p className="flex items-center gap-1.5">Designed with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> for creators.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Global styling for hiding scrollbar & animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .fade-edges { 
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); 
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); 
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); } 
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          width: max-content;
        }
      `}} />
    </div>
  );
}