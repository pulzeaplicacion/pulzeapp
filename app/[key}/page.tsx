"use client";

import { useEffect } from "react";

export default function Landing({ params }: { params: { key: string } }) {
  const LANDING_KEY = params.key;

  useEffect(() => {
    // partículas
    for (let i = 0; i < 60; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.top = Math.random() * 100 + "vh";
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = 6 + Math.random() * 8 + "s";
      document.body.appendChild(p);
    }

    const visitKey = "visit_counted_" + LANDING_KEY;
    const clickKey = "click_counted_" + LANDING_KEY;

    // visita
    if (!sessionStorage.getItem(visitKey)) {
      fetch(`/api/track/visit?key=${LANDING_KEY}`, { method: "POST" });
      sessionStorage.setItem(visitKey, "true");
    }

    let redirected = false;

    const handleClick = (e: any) => {
      if (e.target.closest("#cta-btn") && !redirected) {
        redirected = true;

        if (!sessionStorage.getItem(clickKey)) {
          fetch(`/api/track/click?key=${LANDING_KEY}`, {
            method: "POST",
          });
          sessionStorage.setItem(clickKey, "true");
        }

        if ((window as any).fbq) {
          (window as any).fbq("track", "Contact");
          (window as any).fbq("trackCustom", "WAclick");
        }

        setTimeout(() => {
          window.location.href = `/api/resolve/${LANDING_KEY}`;
        }, 300);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [LANDING_KEY]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
        ${documentHTML()}
      `,
      }}
    />
  );
}

function documentHTML() {
  return \`
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      min-height:100svh;
      background:radial-gradient(circle at 20% 20%, #2a004d, #000 90%);
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:"Montserrat",sans-serif;
      color:#fff;
      overflow:hidden;
      position:relative;
    }
    .particle{
      position:absolute;
      width:2px;height:2px;
      background:rgba(177,124,255,.85);
      border-radius:50%;
      animation:float linear infinite, shimmer 4s ease-in-out infinite;
    }
    @keyframes float{
      from{transform:translateX(0);opacity:.2}
      to{transform:translateX(100vw);opacity:.9}
    }
    @keyframes shimmer{
      0%,100%{opacity:.2}
      50%{opacity:.9}
    }
    .card-wrapper{display:flex;align-items:center;justify-content:center;width:100%}
    .card{
      width:min(92vw,420px);
      background:rgba(9,9,22,.45);
      border-radius:20px;
      padding:18px;
      backdrop-filter:blur(6px);
    }
    .card-inner{display:flex;flex-direction:column;align-items:center;gap:8px}
    .cta-btn{
      margin-top:20px;
      width:100%;
      padding:14px;
      border:none;
      border-radius:50px;
      font-weight:700;
      background:linear-gradient(135deg,#3aff97,#17c45b);
      color:#fff;
      cursor:pointer;
    }
  </style>

  <div class="card-wrapper">
    <div class="card">
      <div class="card-inner">
        <img src="/logo-home.png" style="width:200px" />
        <h1>AHORA ES TU MOMENTO</h1>
        <button id="cta-btn" class="cta-btn">CREAR USUARIO</button>
      </div>
    </div>
  </div>
  \`;
}