import { useState } from "react"
import { Link } from "react-router"
import reactLogo from "./assets/react.svg"
import viteLogo from "/vite.svg"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center from-slate-900 to-slate-700 text-white p-6">
      <div className="flex gap-8 mb-10">
        <a href="https://vite.dev" target="_blank">
          <img
            src={viteLogo}
            className="w-24 h-24 hover:scale-110 transition-transform duration-300"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className="w-24 h-24 hover:rotate-12 transition-transform duration-300"
            alt="React logo"
          />
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">
        Page test — Tailwind fonctionne 🎉
      </h1>

      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg text-center">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-lg font-semibold text-white transition-all shadow-md"
        >
          count is {count}
        </button>

        <p className="mt-4 text-blue-900">
          Page test = changer page d'accueil pour page utilisateur, recherche, etc.
        </p>
      </div>

      <p className="mt-10 text-slate-300 text-sm">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
