"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const CHECKOUT_URL = "https://chk.eduzz.com/8WPND4ON0P";
const EVENT_DATETIME = "2026-08-31T20:00:00-03:00";

function VendasContent() {
  const searchParams = useSearchParams();
  const nome = searchParams.get("nome") ?? "";
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function updateCountdown() {
      const target = new Date(EVENT_DATETIME).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const pad = (n: number) => String(n).padStart(2, "0");
      const set = (id: string, val: string) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      set("cd-days", pad(d));
      set("cd-hours", pad(h));
      set("cd-min", pad(m));
      set("cd-sec", pad(s));
    }
    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
      (window as any).fbq("trackCustom", "LeadConfirmado");
    }
  }, []);

  useEffect(() => {
    const stickyCta = document.getElementById("stickyCta");
    const hero = document.querySelector(".hero") as HTMLElement | null;
    if (!stickyCta || !hero) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          stickyCta.classList.toggle("show", !entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;
    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            ro.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, []);

  const greeting = nome
    ? `${nome}, como se livrar do`
    : "Como se livrar do";

  return (
    <>
      <style>{`
        :root {
          --ink: #1C0B12;
          --wine: #3D1420;
          --wine-soft: #4E1B29;
          --rose: #C98C86;
          --rose-dim: #9C6E6A;
          --gold: #C9A15A;
          --gold-light: #E7C888;
          --cream: #F6ECE4;
          --cream-dim: #D9C4BB;
          --ivory: #FBF3EC;
          --ivory-line: #E7D6CB;
          --ink-on-ivory: #3D1420;
          --muted-on-ivory: #8A6C68;
          --focus: #E7C888;
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        body {
          margin: 0;
          background: var(--ink);
          color: var(--cream);
          font-family: 'Work Sans', -apple-system, 'Segoe UI', sans-serif;
          font-size: 17px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        h1, h2, h3, .display {
          font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
          font-weight: 600;
          text-wrap: balance;
          margin: 0;
        }

        a { color: inherit; }
        img { max-width: 100%; display: block; }

        .wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 56px);
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Work Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold-light);
        }
        .eyebrow::before {
          content: '';
          width: 22px;
          height: 1px;
          background: var(--gold-light);
          display: inline-block;
        }

        .nav {
          padding: 26px clamp(20px, 5vw, 56px);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav .word {
          font-family: 'Fraunces', serif;
          font-size: 19px;
          letter-spacing: 0.04em;
        }
        .nav .word em { font-style: italic; color: var(--gold-light); }
        .nav .tag {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--rose);
        }

        .hero {
          position: relative;
          overflow: hidden;
          padding-top: clamp(12px, 3vw, 28px);
        }
        .hero-glow {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          max-width: 720px;
          max-height: 720px;
          background: radial-gradient(circle, rgba(201,161,90,0.20) 0%, rgba(201,161,90,0) 68%);
          pointer-events: none;
        }
        .hero-grid {
          position: relative;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(28px, 5vw, 56px);
          align-items: center;
          padding-bottom: 64px;
        }
        .hero h1 {
          font-size: clamp(34px, 4.6vw, 54px);
          line-height: 1.08;
          margin-top: 18px;
          color: var(--cream);
        }
        .hero h1 em { font-style: italic; color: var(--gold-light); font-weight: 500; }
        .hero p.sub {
          margin-top: 20px;
          max-width: 46ch;
          font-size: 18px;
          color: var(--cream-dim);
        }
        .hero-photo-frame {
          position: relative;
          aspect-ratio: 4 / 5;
          border-radius: 58% 42% 51% 49% / 46% 54% 46% 54%;
          overflow: hidden;
          box-shadow: 0 30px 70px -25px rgba(0,0,0,0.6);
          border: 1px solid rgba(231,200,136,0.25);
        }
        .hero-photo-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
        }
        .hero-photo-ring {
          position: absolute;
          inset: -14px;
          border-radius: 58% 42% 51% 49% / 46% 54% 46% 54%;
          border: 1px dashed rgba(201,161,90,0.35);
          animation: spin 60s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) { .hero-photo-ring { animation: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, var(--gold-light), var(--gold));
          color: var(--ink);
          font-family: 'Work Sans', sans-serif;
          font-weight: 700;
          font-size: 15.5px;
          letter-spacing: 0.03em;
          padding: 17px 30px;
          border-radius: 999px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 14px 30px -12px rgba(201,161,90,0.55);
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 18px 36px -12px rgba(201,161,90,0.7); }
        .cta-btn:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
        .cta-row { display: flex; flex-wrap: wrap; align-items: center; gap: 18px; margin-top: 32px; }
        .cta-note { font-size: 13.5px; color: var(--rose); letter-spacing: 0.02em; }

        section { padding: clamp(56px, 8vw, 96px) 0; }
        .divider { height: 1px; background: linear-gradient(90deg, rgba(201,161,90,0) 0%, rgba(201,161,90,0.35) 50%, rgba(201,161,90,0) 100%); }

        .section-head { max-width: 62ch; }
        .section-head h2 {
          font-size: clamp(26px, 3.2vw, 38px);
          margin-top: 16px;
          color: var(--cream);
        }
        .section-head h2 em { font-style: italic; color: var(--gold-light); font-weight: 500; }

        .pain-list { margin-top: 44px; display: grid; gap: 0; border-top: 1px solid rgba(231,200,136,0.15); }
        .pain-item {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 18px;
          padding: 22px 0;
          border-bottom: 1px solid rgba(231,200,136,0.15);
        }
        .pain-item .mark {
          width: 9px; height: 9px; border-radius: 50%;
          background: var(--rose);
          margin-top: 8px;
        }
        .pain-item p { margin: 0; font-size: 17px; color: var(--cream-dim); max-width: 58ch; }

        .bridge { background: var(--wine); }
        .bridge blockquote {
          margin: 0;
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 500;
          font-size: clamp(24px, 3.4vw, 36px);
          line-height: 1.35;
          max-width: 22ch;
          color: var(--gold-light);
        }
        .bridge p.support {
          margin-top: 28px;
          max-width: 58ch;
          color: var(--cream-dim);
          font-size: 17px;
        }

        .outcomes { margin-top: 48px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: rgba(231,200,136,0.15); border: 1px solid rgba(231,200,136,0.15); }
        .outcome {
          background: var(--ink);
          padding: 30px 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .outcome .icon {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 1px solid var(--gold);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold-light);
          flex-shrink: 0;
        }
        .outcome p { margin: 0; font-size: 16px; color: var(--cream-dim); }

        .about { background: var(--ivory); color: var(--ink-on-ivory); }
        .about .eyebrow { color: var(--rose-dim); }
        .about .eyebrow::before { background: var(--rose-dim); }
        .about-grid {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: clamp(28px, 5vw, 52px);
          align-items: center;
          margin-top: 40px;
        }
        .about-photo {
          width: 200px; height: 200px; border-radius: 50%;
          overflow: hidden;
          border: 1px solid var(--ivory-line);
          box-shadow: 0 20px 40px -20px rgba(61,20,32,0.35);
        }
        .about-photo img { width: 100%; height: 100%; object-fit: cover; }
        .about h2 { font-size: clamp(24px, 3vw, 32px); color: var(--ink-on-ivory); }
        .about p.bio { margin-top: 16px; max-width: 60ch; color: var(--muted-on-ivory); font-size: 16.5px; }

        .offer { background: var(--ink); }
        .offer-card {
          position: relative;
          margin-top: 40px;
          background: var(--wine);
          border: 1px solid rgba(231,200,136,0.3);
          border-radius: 26px;
          padding: clamp(28px, 5vw, 52px);
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
        }
        .offer-card .eyebrow { color: var(--rose); }
        .offer-card .eyebrow::before { background: var(--rose); }
        .offer-card h3 { font-size: clamp(22px, 2.6vw, 28px); margin-top: 14px; color: var(--cream); }
        .offer-list { list-style: none; margin: 22px 0 0; padding: 0; display: grid; gap: 12px; }
        .offer-list li { display: flex; gap: 12px; font-size: 15.5px; color: var(--cream-dim); }
        .offer-list li::before { content: '\\2014'; color: var(--gold-light); flex-shrink: 0; }
        .offer-list li strong { color: var(--cream); font-weight: 600; }
        .price-block { text-align: center; border-left: 1px solid rgba(231,200,136,0.25); padding-left: 40px; }
        .price-block .from { font-size: 13px; color: var(--rose); text-transform: uppercase; letter-spacing: 0.1em; }
        .price-block .price { font-family: 'Fraunces', serif; font-size: 56px; color: var(--gold-light); margin-top: 6px; }
        .price-block .price sup { font-size: 22px; top: -22px; }
        .price-block .compare { font-size: 13.5px; color: var(--cream-dim); margin-top: 4px; }
        .price-block .cta-btn { margin-top: 22px; width: 100%; }
        @media (max-width: 720px) {
          .offer-card { grid-template-columns: 1fr; }
          .price-block { border-left: none; border-top: 1px solid rgba(231,200,136,0.25); padding-left: 0; padding-top: 28px; }
        }

        .urgency { background: var(--wine-soft); text-align: center; }
        .urgency .section-head { margin: 0 auto; text-align: center; max-width: 56ch; }
        .urgency .eyebrow { justify-content: center; }
        .urgency .eyebrow::before { display: none; }
        .countdown { display: flex; justify-content: center; gap: clamp(10px, 3vw, 22px); margin-top: 40px; flex-wrap: wrap; }
        .cd-unit { min-width: 84px; }
        .cd-num {
          font-family: 'Fraunces', serif;
          font-variant-numeric: tabular-nums;
          font-size: clamp(34px, 5vw, 48px);
          color: var(--gold-light);
          background: rgba(0,0,0,0.18);
          border: 1px solid rgba(231,200,136,0.25);
          border-radius: 14px;
          padding: 14px 6px;
        }
        .cd-label { margin-top: 8px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--rose); }
        .urgency .fine { margin-top: 32px; color: var(--cream-dim); font-size: 15px; max-width: 48ch; margin-left: auto; margin-right: auto; }

        .faq { max-width: 760px; margin: 44px auto 0; display: grid; gap: 1px; background: rgba(231,200,136,0.15); border: 1px solid rgba(231,200,136,0.15); }
        .faq-item { background: var(--ink); }
        .faq-item summary {
          cursor: pointer;
          list-style: none;
          padding: 22px 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          font-family: 'Fraunces', serif;
          font-size: 17.5px;
          color: var(--cream);
        }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary .plus { color: var(--gold-light); font-size: 22px; transition: transform 0.2s ease; flex-shrink: 0; }
        .faq-item[open] summary .plus { transform: rotate(45deg); }
        .faq-item .a { padding: 0 26px 24px; color: var(--cream-dim); font-size: 15.5px; max-width: 62ch; }

        .final-cta { position: relative; text-align: center; overflow: hidden; }
        .final-glow {
          position: absolute; left: 50%; top: 0; transform: translateX(-50%);
          width: 90vw; max-width: 900px; height: 500px;
          background: radial-gradient(ellipse, rgba(201,161,90,0.18) 0%, rgba(201,161,90,0) 70%);
          pointer-events: none;
        }
        .final-cta .wrap { position: relative; }
        .final-cta h2 { font-size: clamp(28px, 4vw, 44px); max-width: 20ch; margin: 18px auto 0; }
        .final-cta p { max-width: 56ch; margin: 22px auto 0; color: var(--cream-dim); font-size: 17px; }
        .final-cta .cta-row { justify-content: center; }
        .trust-line { margin-top: 22px; font-size: 13px; color: var(--rose); letter-spacing: 0.04em; }

        footer { padding: 40px clamp(20px, 5vw, 56px) 120px; text-align: center; color: var(--rose-dim); font-size: 13px; }

        .sticky-cta {
          position: fixed; left: 0; right: 0; bottom: 0;
          background: var(--ink);
          border-top: 1px solid rgba(231,200,136,0.25);
          padding: 12px 16px;
          display: none;
          justify-content: center;
          z-index: 40;
          transform: translateY(110%);
          transition: transform 0.3s ease;
        }
        .sticky-cta.show { transform: translateY(0); }
        .sticky-cta .cta-btn { width: 100%; max-width: 420px; }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-photo-frame { max-width: 320px; margin: 0 auto; }
          .outcomes { grid-template-columns: 1fr; }
          .about-grid { grid-template-columns: 1fr; text-align: center; }
          .about-photo { margin: 0 auto; }
          .sticky-cta { display: flex; }
          body { padding-bottom: 78px; }
        }

        .reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.in { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500;1,600&family=Work+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <nav className="nav">
        <div className="word">
          Mirna <em>Lacerda</em>
        </div>
        <div className="tag">Transmiss&atilde;o ao vivo</div>
      </nav>

      <header className="hero">
        <div className="hero-glow" />
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">
              Transmiss&atilde;o exclusiva e ao vivo
            </span>
            <h1>
              {greeting}{" "}
              <em>ressecamento &iacute;ntimo</em> e restaurar seu
              relacionamento
            </h1>
            <p className="sub">
              O m&eacute;todo natural que est&aacute; ajudando mulheres a
              recuperar a lubrifica&ccedil;&atilde;o, o desejo e a intimidade
              com o parceiro &mdash; sem rem&eacute;dio, sem vergonha e sem
              esperar mais um dia.
            </p>
            <div className="cta-row">
              <a
                href={CHECKOUT_URL}
                className="cta-btn"

                target="_blank"
                rel="noopener noreferrer"
              >
                Quero garantir meu ingresso &mdash; R$47
              </a>
            </div>
            <div className="cta-note">
              Vagas limitadas para o link exclusivo &middot;{" "}
              <span>
                Segunda-feira, 31/08 &agrave;s 20h (hor&aacute;rio de
                Bras&iacute;lia)
              </span>
            </div>
          </div>
          <div>
            <div className="hero-photo-frame">
              <div className="hero-photo-ring" />
              <img
                src="/images/mirna-hero.jpg"
                alt="Mirna Lacerda"
                width={480}
                height={600}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="divider" />
      </div>

      <section id="isso-e-voce">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Isso &eacute; pra voc&ecirc; se&hellip;</span>
            <h2>
              Voc&ecirc; reconhece <em>algum</em> desses sinais?
            </h2>
          </div>
          <div className="pain-list reveal">
            <div className="pain-item">
              <span className="mark" />
              <p>
                Sente desconforto &mdash; ou at&eacute; dor &mdash; na hora da
                intimidade, e isso j&aacute; te afastou fisicamente do seu
                parceiro.
              </p>
            </div>
            <div className="pain-item">
              <span className="mark" />
              <p>
                Evita momentos de aproxima&ccedil;&atilde;o por vergonha ou pelo
                medo de &ldquo;n&atilde;o estar pronta&rdquo;.
              </p>
            </div>
            <div className="pain-item">
              <span className="mark" />
              <p>
                Sente que o desejo simplesmente sumiu, e n&atilde;o sabe se um
                dia ele volta.
              </p>
            </div>
            <div className="pain-item">
              <span className="mark" />
              <p>
                J&aacute; tentou hidratante, lubrificante, de tudo &mdash; e
                nada resolveu de verdade, porque a causa nunca foi tratada.
              </p>
            </div>
            <div className="pain-item">
              <span className="mark" />
              <p>
                Tem vergonha de falar sobre isso at&eacute; com o m&eacute;dico,
                e carrega esse peso sozinha.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bridge">
        <div className="wrap">
          <blockquote className="reveal">
            &ldquo;Ningu&eacute;m te ensinou que o corpo muda &mdash; e que isso
            n&atilde;o &eacute; o fim da sua vida &iacute;ntima. &Eacute; s&oacute;
            um sinal de que ele est&aacute; pedindo outro tipo de cuidado.&rdquo;
          </blockquote>
          <p className="support reveal">
            O ressecamento &iacute;ntimo n&atilde;o &eacute; &ldquo;coisa da
            idade&rdquo; nem falta de amor pelo parceiro. &Eacute; um
            desequil&iacute;brio real, com causa e solu&ccedil;&atilde;o &mdash;
            e quanto mais tempo voc&ecirc; espera em sil&ecirc;ncio, mais ele se
            instala na sua rela&ccedil;&atilde;o, n&atilde;o s&oacute; no seu
            corpo.
          </p>
        </div>
      </section>

      <section id="voce-vai-descobrir">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Nesse encontro ao vivo</span>
            <h2>
              O que voc&ecirc; vai <em>descobrir</em>
            </h2>
          </div>
          <div className="outcomes reveal">
            <div className="outcome">
              <span className="icon">{"◐"}</span>
              <p>
                <strong style={{ color: "var(--cream)" }}>
                  A raiz real do ressecamento &iacute;ntimo
                </strong>{" "}
                &mdash; o que a maioria das mulheres nunca ouviu de um
                m&eacute;dico.
              </p>
            </div>
            <div className="outcome">
              <span className="icon">{"✦"}</span>
              <p>
                <strong style={{ color: "var(--cream)" }}>
                  T&eacute;cnicas naturais
                </strong>{" "}
                para restaurar a lubrifica&ccedil;&atilde;o e reacender o
                desejo, sem rem&eacute;dio e sem procedimento.
              </p>
            </div>
            <div className="outcome">
              <span className="icon">{"◑"}</span>
              <p>
                <strong style={{ color: "var(--cream)" }}>
                  Como romper o ciclo de sil&ecirc;ncio
                </strong>{" "}
                e vergonha que afasta voc&ecirc; do seu parceiro.
              </p>
            </div>
            <div className="outcome">
              <span className="icon">{"✧"}</span>
              <p>
                <strong style={{ color: "var(--cream)" }}>
                  O primeiro passo pr&aacute;tico
                </strong>{" "}
                para reconstruir a intimidade e a conex&atilde;o no seu
                relacionamento, a partir de hoje.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="wrap">
          <span className="eyebrow reveal">Quem conduz esse encontro</span>
          <div className="about-grid reveal">
            <div className="about-photo">
              <img
                src="/images/mirna-about.jpg"
                alt="Mirna Lacerda"
                width={200}
                height={200}
              />
            </div>
            <div>
              <h2>Mirna Lacerda</h2>
              <p className="bio">
                Mirna &eacute; especialista em bem-estar &iacute;ntimo e
                sexualidade feminina, e j&aacute; conduziu centenas de mulheres
                em aulas sobre lubrifica&ccedil;&atilde;o, prazer e autoestima
                &mdash; sempre com um olhar acolhedor, direto e sem julgamento
                sobre um assunto que a maioria evita comentar at&eacute; com
                quem ama.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="oferta" className="offer">
        <div className="wrap">
          <div className="offer-card reveal">
            <div>
              <span className="eyebrow">Seu ingresso</span>
              <h3>
                Transmiss&atilde;o exclusiva ao vivo com Mirna Lacerda
              </h3>
              <ul className="offer-list">
                <li>
                  <span>
                    <strong>
                      Acesso &agrave; transmiss&atilde;o ao vivo e exclusiva
                    </strong>
                    , direto do link enviado s&oacute; para quem se inscrever.
                  </span>
                </li>
                <li>
                  <span>
                    <strong>
                      Segunda-feira, 31/08 &agrave;s 20h
                    </strong>{" "}
                    &mdash; hor&aacute;rio de Bras&iacute;lia.
                  </span>
                </li>
                <li>
                  <span>
                    <strong>Presente exclusivo</strong>, revelado apenas para
                    quem estiver ao vivo no hor&aacute;rio marcado.
                  </span>
                </li>
              </ul>
            </div>
            <div className="price-block">
              <div className="from">Por apenas</div>
              <div className="price">
                <sup>R$</sup>47
              </div>
              <div className="compare">menos que um jantar a dois</div>
              <a
                href={CHECKOUT_URL}
                className="cta-btn"

                target="_blank"
                rel="noopener noreferrer"
              >
                Garantir meu ingresso
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="urgency">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">As vagas s&atilde;o limitadas</span>
            <h2>Faltam para o encontro</h2>
          </div>
          <div className="countdown reveal" id="countdown">
            <div className="cd-unit">
              <div className="cd-num" id="cd-days">
                00
              </div>
              <div className="cd-label">Dias</div>
            </div>
            <div className="cd-unit">
              <div className="cd-num" id="cd-hours">
                00
              </div>
              <div className="cd-label">Horas</div>
            </div>
            <div className="cd-unit">
              <div className="cd-num" id="cd-min">
                00
              </div>
              <div className="cd-label">Min</div>
            </div>
            <div className="cd-unit">
              <div className="cd-num" id="cd-sec">
                00
              </div>
              <div className="cd-label">Seg</div>
            </div>
          </div>
          <p className="fine reveal">
            Depois desse hor&aacute;rio, o link se encerra &mdash; n&atilde;o
            h&aacute; grava&ccedil;&atilde;o dispon&iacute;vel, nem reenvio do
            acesso.
          </p>
        </div>
      </section>

      <section id="faq">
        <div className="wrap">
          <div
            className="section-head reveal"
            style={{ margin: "0 auto", textAlign: "center", maxWidth: "56ch" }}
          >
            <span
              className="eyebrow"
              style={{ justifyContent: "center" }}
            >
              D&uacute;vidas comuns
            </span>
            <h2>
              Perguntas <em>frequentes</em>
            </h2>
          </div>
          <div className="faq reveal">
            <details className="faq-item">
              <summary>
                Preciso ter experi&ecirc;ncia ou conhecimento pr&eacute;vio
                sobre o assunto?
                <span className="plus">+</span>
              </summary>
              <div className="a">
                N&atilde;o. O encontro foi pensado para qualquer mulher,
                independentemente do que voc&ecirc; j&aacute; sabe ou j&aacute;
                tentou antes.
              </div>
            </details>
            <details className="faq-item">
              <summary>
                O evento vai ficar gravado? Posso assistir depois?
                <span className="plus">+</span>
              </summary>
              <div className="a">
                N&atilde;o. O acesso &eacute; exclusivo para quem estiver ao
                vivo no hor&aacute;rio marcado &mdash; &eacute; assim que
                garantimos um espa&ccedil;o &iacute;ntimo e verdadeiro para essa
                conversa, e &eacute; por isso que o presente especial &eacute;
                s&oacute; para quem estiver presente.
              </div>
            </details>
            <details className="faq-item">
              <summary>
                Como vou receber o link de acesso?
                <span className="plus">+</span>
              </summary>
              <div className="a">
                Assim que a sua inscri&ccedil;&atilde;o for confirmada,
                voc&ecirc; recebe o link exclusivo de acesso por e-mail e/ou
                WhatsApp, antes do in&iacute;cio da transmiss&atilde;o.
              </div>
            </details>
            <details className="faq-item">
              <summary>
                &Eacute; seguro comprar meu ingresso?
                <span className="plus">+</span>
              </summary>
              <div className="a">
                Sim. O pagamento &eacute; processado em ambiente 100% seguro e
                criptografado, e voc&ecirc; recebe a confirma&ccedil;&atilde;o
                imediatamente ap&oacute;s a compra.
              </div>
            </details>
            <details className="faq-item">
              <summary>
                E se eu n&atilde;o conseguir estar presente no hor&aacute;rio
                marcado?
                <span className="plus">+</span>
              </summary>
              <div className="a">
                Recomendamos fortemente reservar esse hor&aacute;rio na sua
                agenda &mdash; como n&atilde;o h&aacute; grava&ccedil;&atilde;o
                dispon&iacute;vel depois, esse &eacute; o &uacute;nico momento
                em que voc&ecirc; ter&aacute; acesso a esse conte&uacute;do e ao
                presente exclusivo.
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-glow" />
        <div className="wrap">
          <span
            className="eyebrow reveal"
            style={{ justifyContent: "center" }}
          >
            Chegou a sua hora
          </span>
          <h2 className="reveal">
            Sua intimidade n&atilde;o precisa continuar esperando
          </h2>
          <p className="reveal">
            Voc&ecirc; j&aacute; esperou o suficiente pra sentir vergonha, pra
            evitar o toque, pra fingir que est&aacute; tudo bem. Hoje voc&ecirc;
            pode dar o primeiro passo &mdash; num encontro feito pra te devolver
            o que &eacute; seu por direito: prazer, conex&atilde;o e leveza.
          </p>
          <div className="cta-row reveal">
            <a
              href={CHECKOUT_URL}
              className="cta-btn"
              onClick={trackCheckout}
              target="_blank"
              rel="noopener noreferrer"
            >
              Garantir meu ingresso agora &mdash; R$47
            </a>
          </div>
          <div className="trust-line reveal">
            Pagamento 100% seguro &middot; Confirma&ccedil;&atilde;o imediata
          </div>
        </div>
      </section>

      <footer>
        <div>&copy; Mirna Lacerda &mdash; Todos os direitos reservados.</div>
      </footer>

      <div className="sticky-cta" id="stickyCta">
        <a
          href={CHECKOUT_URL}
          className="cta-btn"
          onClick={trackCheckout}
          target="_blank"
          rel="noopener noreferrer"
        >
          Quero garantir meu ingresso &mdash; R$47
        </a>
      </div>
    </>
  );
}

export default function VendasPage() {
  return (
    <Suspense>
      <VendasContent />
    </Suspense>
  );
}
