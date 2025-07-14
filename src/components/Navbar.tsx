"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Login } from './Login';
import { supabase } from '../utils/supabase';

export default function Navbar({ session, onLogin, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleScrollToSubscribe = () => {
    const subscribeSection = document.getElementById('subscribe-section');
    if (subscribeSection) {
      subscribeSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-50 ">
      {isAnnouncementVisible && (
        <div className="relative isolate flex items-center gap-x-2 overflow-hidden bg-gray-100 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 md:items-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-sm/6 text-gray-800 items-center">
              <strong className="font-semibold">Remove Watermark!</strong>
              <svg viewBox="0 0 2 2" aria-hidden="true" className="mx-1 inline size-0.5 fill-current">
                <circle cx={1} cy={1} r={1} />
              </svg>
              <a
                href="#"
                onClick={handleScrollToSubscribe}
                className="flex-none rounded-full bg-blue-500 px-3.5 py-1 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Unlimited Use for $5
              </a>
            </p>
          </div>
          <div className="flex flex-1 justify-end">
            <button
              type="button"
              className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
              onClick={() => setIsAnnouncementVisible(false)}
            >
              <span className="sr-only">Dismiss</span>
              <X className="size-5 text-gray-900" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <nav className="w-full bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center space-x-2">
                {/* <img className="h-10 w-10" src='/android-chrome-192x192.png' alt='Imgsquash.com logo icon'></img> */}
                <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
  <span className="
    bg-gradient-to-r from-blue-600 to-blue-400 /* The gradient */
    text-transparent bg-clip-text       /* The clipping magic */
  ">
    img
  </span>
  <span className="tracking-tight font-black text-xl text-shadow-xs text-gray-700 ">Squash</span>
</span>              </a>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              {!session ? <Login onLogin={onLogin} /> : (
                <div className="flex items-center gap-4">
                  <p>Welcome, {session.user.email}</p>
                  <button onClick={onLogout} className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300 "
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <span className="sr-only ">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`} id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2 ">
            {!session ? <Login onLogin={onLogin} /> : (
              <button onClick={onLogout} className="mt-1 w-full rounded-md bg-red-500 px-3 py-2 text-left text-base font-medium text-white hover:bg-red-600">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}
