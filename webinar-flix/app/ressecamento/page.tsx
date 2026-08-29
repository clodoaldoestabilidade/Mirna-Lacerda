"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROBLEMAS = [
  { id: "incontinencia", label: "Incontinência Urinária", icon: "💧" },
  { id: "ressecamento", label: "Ressecamento Íntimo", icon: "🌿" },
  { id: "desejo", label: "Falta de Desejo", icon: "🔥" },
  { id: "relacionamento", label: "Problema no Relacionamento", icon: "💔" },
  { id: "outro", label: "Outro", icon: "✦" },
];

type Step = 1 | 2 | 3;

export default function RessecamentoQuiz() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [problema, setProblema] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tentou, setTentou] = useState<"sim" | "nao" | "">("");
  const [oQueTentou, setOQueTentou] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const problemaLabel = PROBLEMAS.find((p) => p.id === problema)?.label ?? problema;

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Informe seu nome";
    if (!email.trim() || !email.includes("@")) e.email = "E-mail inválido";
    if (!whatsapp.replace(/\D/g, "").match(/^\d{10,11}$/))
      e.whatsapp = "WhatsApp inválido (DDD + número)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!tentou) return;
    setLoading(true);
    try {
      await fetch("/api/ressecamento/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, whatsapp, problema, tentou, oQueTentou }),
      });
    } catch {
      // falha silenciosa — redirecionar mesmo assim
    }
    if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "Lead", { content_name: problema });
    }
    const primeiroNome = nome.trim().split(" ")[0];
    router.push(`/ressecamento/vendas?nome=${encodeURIComponent(primeiroNome)}`);
  }

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Work+Sans:wght@400;500;600;700&display=swap');

        :root {
          --ink: #1C0B12;
          --wine: #3D1420;
          --wine-soft: #4E1B29;
          --rose: #C98C86;
          --gold: #C9A15A;
          --gold-light: #E7C888;
          --cream: #F6ECE4;
          --cream-dim: #D9C4BB;
          --focus: #E7C888;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          background: var(--ink);
          color: var(--cream);
          font-family: 'Work Sans', -apple-system, 'Segoe UI', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
        }

        .quiz-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px 64px;
        }

        .quiz-card {
          width: 100%;
          max-width: 560px;
          background: var(--wine);
          border: 1px solid rgba(201,161,90,0.2);
          border-radius: 24px;
          padding: clamp(28px, 6vw, 48px);
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6);
        }

        .logo {
          text-align: center;
          margin-bottom: 28px;
          font-family: 'Fraunces', serif;
          font-size: 15px;
          letter-spacing: 0.06em;
          color: var(--gold-light);
          opacity: 0.85;
        }

        .progress-track {
          height: 3px;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          margin-bottom: 32px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gold-light), var(--gold));
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        .step-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 10px;
        }

        .quiz-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 600;
          color: var(--cream);
          line-height: 1.25;
          margin-bottom: 28px;
        }
        .quiz-title em {
          font-style: italic;
          color: var(--gold-light);
        }

        .prob-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
        }

        .prob-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border: 1.5px solid rgba(201,161,90,0.2);
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          font-size: 15px;
          color: var(--cream-dim);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .prob-card:hover {
          border-color: rgba(201,161,90,0.5);
          background: rgba(201,161,90,0.06);
        }
        .prob-card.selected {
          border-color: var(--gold);
          background: rgba(201,161,90,0.12);
          color: var(--cream);
        }
        .prob-icon {
          font-size: 20px;
          flex-shrink: 0;
          width: 32px;
          text-align: center;
        }
        .prob-check {
          margin-left: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid rgba(201,161,90,0.4);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          transition: background 0.2s, border-color 0.2s;
        }
        .prob-card.selected .prob-check {
          background: var(--gold);
          border-color: var(--gold);
          color: var(--ink);
          font-weight: 700;
        }

        .field { margin-bottom: 18px; }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 8px;
        }
        .field input, .field textarea {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(201,161,90,0.2);
          border-radius: 12px;
          color: var(--cream);
          font-family: 'Work Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
          -webkit-appearance: none;
        }
        .field input::placeholder, .field textarea::placeholder {
          color: rgba(246,236,228,0.3);
        }
        .field input:focus, .field textarea:focus {
          border-color: var(--gold);
        }
        .field input.err, .field textarea.err {
          border-color: #E07070;
        }
        .field .errmsg {
          font-size: 12px;
          color: #E07070;
          margin-top: 5px;
        }
        .field textarea { resize: vertical; min-height: 90px; }

        .yn-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 28px;
        }
        .yn-btn {
          padding: 18px;
          border: 1.5px solid rgba(201,161,90,0.2);
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          color: var(--cream-dim);
          font-family: 'Work Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          transition: border-color 0.2s, background 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .yn-btn:hover { border-color: rgba(201,161,90,0.5); }
        .yn-btn.selected {
          border-color: var(--gold);
          background: rgba(201,161,90,0.12);
          color: var(--cream);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 17px 24px;
          background: linear-gradient(135deg, var(--gold-light), var(--gold));
          color: var(--ink);
          font-family: 'Work Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s;
          box-shadow: 0 14px 30px -12px rgba(201,161,90,0.55);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 36px -12px rgba(201,161,90,0.7);
        }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-back {
          display: block;
          margin: 16px auto 0;
          background: none;
          border: none;
          color: rgba(246,236,228,0.4);
          font-size: 13px;
          cursor: pointer;
          padding: 8px;
        }
        .btn-back:hover { color: rgba(246,236,228,0.7); }

        .privacy-note {
          margin-top: 16px;
          text-align: center;
          font-size: 12px;
          color: rgba(246,236,228,0.3);
        }

        .problema-destaque {
          font-style: italic;
          color: var(--gold-light);
        }
      `}</style>

      <div className="quiz-wrap">
        <div className="quiz-card">
          <p className="logo">O Código da Mulher Desejante</p>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {step === 1 && (
            <>
              <p className="step-label">Etapa 1 de 3</p>
              <h1 className="quiz-title">
                Qual desses desafios <em>mais se parece</em> com o que você está vivendo?
              </h1>
              <div className="prob-grid">
                {PROBLEMAS.map((p) => (
                  <button
                    key={p.id}
                    className={`prob-card${problema === p.id ? " selected" : ""}`}
                    onClick={() => setProblema(p.id)}
                  >
                    <span className="prob-icon">{p.icon}</span>
                    <span>{p.label}</span>
                    <span className="prob-check">{problema === p.id ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
              <button
                className="btn-primary"
                disabled={!problema}
                onClick={() => setStep(2)}
              >
                Continuar →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="step-label">Etapa 2 de 3</p>
              <h1 className="quiz-title">
                Para onde podemos enviar <em>suas recomendações</em>?
              </h1>

              <div className="field">
                <label>Seu nome</label>
                <input
                  type="text"
                  placeholder="Como você se chama?"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={errors.nome ? "err" : ""}
                  autoComplete="given-name"
                />
                {errors.nome && <p className="errmsg">{errors.nome}</p>}
              </div>

              <div className="field">
                <label>E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "err" : ""}
                  autoComplete="email"
                />
                {errors.email && <p className="errmsg">{errors.email}</p>}
              </div>

              <div className="field">
                <label>WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={errors.whatsapp ? "err" : ""}
                  autoComplete="tel"
                />
                {errors.whatsapp && <p className="errmsg">{errors.whatsapp}</p>}
              </div>

              <button
                className="btn-primary"
                onClick={() => { if (validateStep2()) setStep(3); }}
              >
                Continuar →
              </button>
              <button className="btn-back" onClick={() => setStep(1)}>← Voltar</button>
            </>
          )}

          {step === 3 && (
            <>
              <p className="step-label">Etapa 3 de 3</p>
              <h1 className="quiz-title">
                Você já tentou resolver{" "}
                <span className="problema-destaque">{problemaLabel}</span>{" "}
                de alguma forma antes?
              </h1>

              <div className="yn-row">
                <button
                  className={`yn-btn${tentou === "sim" ? " selected" : ""}`}
                  onClick={() => setTentou("sim")}
                >
                  ✓ Sim
                </button>
                <button
                  className={`yn-btn${tentou === "nao" ? " selected" : ""}`}
                  onClick={() => setTentou("nao")}
                >
                  ✕ Não
                </button>
              </div>

              {tentou === "sim" && (
                <div className="field">
                  <label>O que você já tentou?</label>
                  <textarea
                    placeholder="Conta um pouquinho o que você já tentou fazer..."
                    value={oQueTentou}
                    onChange={(e) => setOQueTentou(e.target.value)}
                  />
                </div>
              )}

              <button
                className="btn-primary"
                disabled={!tentou || loading}
                onClick={submit}
              >
                {loading ? "Aguarde..." : "Ver minha recomendação →"}
              </button>
              <button className="btn-back" onClick={() => setStep(2)}>← Voltar</button>

              <p className="privacy-note">
                🔒 Seus dados são protegidos e nunca serão compartilhados com terceiros.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
