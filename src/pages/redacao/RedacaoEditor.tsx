import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../db/storage';
import { EssayTopic, Essay } from '../../types';
import { AiEssayEvaluator } from '../../services/aiEssayEvaluator';
import {
  PenTool,
  Clock,
  Sparkles,
  ArrowLeft,
  Save,
  Send,
  BookOpen,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Camera,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RedacaoEditorProps {
  topicId: string;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

type SubmissionMode = 'TYPED' | 'PHOTO' | 'PDF';

export const RedacaoEditor: React.FC<RedacaoEditorProps> = ({ topicId, onNavigate }) => {
  const currentUser = db.getCurrentUser();
  const topic = db.getEssayTopicById(topicId) || db.getEssayTopics()[0];

  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('TYPED');
  const [text, setText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);

  const [showMotivating, setShowMotivating] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Line counter calculation
  const paragraphs = text.split('\n').filter((p) => p.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean).length;
  const estimatedLines = Math.max(paragraphs.length, Math.ceil(words / 11));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFilePreview(reader.result as string);
      // Se for texto/OCR simulado
      if (!text) {
        setText(`[Arquivo ${file.name} anexado para transcrição e correção pedagógica]\n\nNa contemporaneidade brasileira, o debate sobre "${topic?.theme || 'o tema proposto'}" revela desafios estruturais que demandam enfrentamento institucional e mobilização cívica. Com efeito, constata-se a permanência de entraves sócio-históricos que vulnerabilizam parcelas significativas da sociedade.\n\nNesse sentido, faz-se imperiosa a atuação do Poder Público em consonância com a sociedade civil.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDraft = () => {
    if (!currentUser || !topic) return;

    const draftEssay: Essay = {
      id: `ess-draft-${currentUser.id}-${topic.id}`,
      userId: currentUser.id,
      topicId: topic.id,
      topicTheme: topic.theme,
      text,
      submissionType: submissionMode,
      fileName: uploadedFileName || undefined,
      fileUrl: uploadedFilePreview || undefined,
      lineCount: estimatedLines,
      timeSpentMinutes: Math.ceil(timeSpentSeconds / 60),
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveEssay(draftEssay);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSubmitForCorrection = async () => {
    if (!currentUser || !topic) return;

    if (submissionMode === 'TYPED' && words < 20) {
      alert('Sua redação está muito curta. Escreva pelo menos alguns parágrafos para que a Inteligência Artificial possa realizar a avaliação nas 5 competências.');
      return;
    }

    if ((submissionMode === 'PHOTO' || submissionMode === 'PDF') && !uploadedFileName && words < 10) {
      alert('Por favor, selecione um arquivo de imagem ou PDF da sua redação manuscrita antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const correction = await AiEssayEvaluator.evaluate(
        text || `Redação manuscrita transcrita via OCR a partir do arquivo ${uploadedFileName}`,
        topic.theme
      );

      const finalEssay: Essay = {
        id: `ess-${Date.now()}`,
        userId: currentUser.id,
        topicId: topic.id,
        topicTheme: topic.theme,
        text: text || `[Redação submetida por upload: ${uploadedFileName}]`,
        submissionType: submissionMode,
        fileName: uploadedFileName || undefined,
        fileUrl: uploadedFilePreview || undefined,
        lineCount: estimatedLines,
        timeSpentMinutes: Math.ceil(timeSpentSeconds / 60),
        status: 'CORRECTED',
        correction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.saveEssay(finalEssay);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
      });

      onNavigate('redacao-report', { essayId: finalEssay.id });
    } catch (e) {
      console.error(e);
      alert('Erro ao processar correção pedagógica da redação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('redacao')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Temas de Redação
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Tempo: {formatTimer(timeSpentSeconds)}</span>
          </div>

          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{draftSaved ? 'Salvo!' : 'Salvar Rascunho'}</span>
          </button>

          <button
            disabled={isSubmitting}
            onClick={handleSubmitForCorrection}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Avaliando...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Enviar para Correção</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mandatory AI Disclaimer Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-center gap-2.5 text-amber-900 dark:text-amber-200 text-xs font-semibold">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Aviso pedagógico: <strong>Nota estimada para fins de estudo. Não corresponde à correção oficial do ENEM.</strong>
        </span>
      </div>

      {/* Theme Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-md">
          Proposta de Redação • ENEM 2026
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
          {topic?.theme}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          A partir da leitura dos textos motivadores e com base nos conhecimentos construídos ao longo de sua formação, redija um texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa.
        </p>

        {/* Toggle Motivating Texts and Guide */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setShowMotivating(!showMotivating)}
            className="font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showMotivating ? 'Ocultar Textos Motivadores' : 'Ver Textos Motivadores'}</span>
          </button>

          <span className="text-slate-300">•</span>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{showGuide ? 'Ocultar Guia Nota 1000' : 'Abrir Guia Estrutural da Redação Nota 1000'}</span>
          </button>
        </div>
      </div>

      {/* GUIA ESTRUTURAL DA REDAÇÃO NOTA 1000 */}
      {showGuide && (
        <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-800/60 shadow-md space-y-5 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-200/60 dark:border-purple-800/40">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <h3 className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                Guia Estrutural da Redação Nota 1000 no ENEM
              </h3>
            </div>
            <span className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded-full">
              4 Parágrafos • 30 Linhas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Introdução */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-black text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] flex items-center justify-center font-bold">1</span>
                Introdução (6 a 7 linhas)
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                • <strong>Contextualização / Repertório:</strong> Alusão histórica, filosófica, literária ou legislativa (ex: CF/88, Cidadãos de Papel).<br />
                • <strong>Apresentação do Tema:</strong> Palavras-chave do comando da proposta.<br />
                • <strong>Tese Bifurcada:</strong> Tese 1 (Argumento A) e Tese 2 (Argumento B).
              </p>
            </div>

            {/* Desenvolvimento 1 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-black text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] flex items-center justify-center font-bold">2</span>
                Desenvolvimento 1 (7 a 8 linhas)
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                • <strong>Conectivo interparágrafo:</strong> "Em primeiro lugar...", "De início...".<br />
                • <strong>Tópico frasal:</strong> Afirmação direta do Argumento A.<br />
                • <strong>Fundamentação:</strong> Repertório sociocultural legitimado e produtivo.<br />
                • <strong>Desfecho crítico:</strong> Consequência lógica no tecido social.
              </p>
            </div>

            {/* Desenvolvimento 2 */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-black text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] flex items-center justify-center font-bold">3</span>
                Desenvolvimento 2 (7 a 8 linhas)
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                • <strong>Conectivo:</strong> "Ademais...", "Outrossim...", "Por outro lado...".<br />
                • <strong>Tópico frasal:</strong> Aprofundamento do Argumento B.<br />
                • <strong>Análise de causa/efeito:</strong> Por que esse obstáculo persiste?<br />
                • <strong>Fechamento articulado:</strong> Ponte para a intervenção.
              </p>
            </div>

            {/* Proposta de Intervenção (5 elementos) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="font-black text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] flex items-center justify-center font-bold">4</span>
                Proposta de Intervenção (5 Elementos Obrigatórios)
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                • <strong>Agente:</strong> Quem executará? (Ex: Ministério da Educação, Governo Federal).<br />
                • <strong>Ação:</strong> O que será feito? (Verbo de ação claro).<br />
                • <strong>Modo/Meio:</strong> Por meio de quê? (Ex: mediante parcerias, criação de programas).<br />
                • <strong>Efeito/Finalidade:</strong> A fim de quê? (Ex: com o fito de mitigar as desigualdades).<br />
                • <strong>Detalhamento:</strong> Explicação adicional ou exemplo de um dos 4 anteriores.
              </p>
            </div>
          </div>

          {/* Conectivos Recomendados */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-xs space-y-2">
            <span className="font-black text-purple-900 dark:text-purple-200">
              Conectivos Recomendados para Nota 200 na Competência 4:
            </span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold">
                Adição: Ademais, Outrossim, Além disso
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
                Conclusão: Portanto, Dessarte, Urge, pois
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                Oposição: Todavia, Contudo, Não obstante
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                Conformidade: Consoante, Segundo, De acordo com
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Motivating Texts Accordion */}
      {showMotivating && topic?.motivatingTexts && (
        <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
            Textos Motivadores de Apoio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topic.motivatingTexts.map((textItem) => (
              <div
                key={textItem.id}
                className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs"
              >
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  {textItem.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  {textItem.content}
                </p>
                <div className="text-[10px] text-slate-400 font-semibold pt-1">
                  Fonte: {textItem.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campo de Envio: 3 Formas (Digitar, Foto, PDF) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Forma de Submissão da Redação
            </h3>
            <p className="text-xs text-slate-500">
              Escolha como deseja enviar o seu texto para correção pedagógica
            </p>
          </div>

          {/* Submission Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs">
            <button
              onClick={() => setSubmissionMode('TYPED')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                submissionMode === 'TYPED'
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Digitar Redação
            </button>
            <button
              onClick={() => setSubmissionMode('PHOTO')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                submissionMode === 'PHOTO'
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Enviar Foto
            </button>
            <button
              onClick={() => setSubmissionMode('PDF')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                submissionMode === 'PDF'
                  ? 'bg-purple-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Enviar PDF
            </button>
          </div>
        </div>

        {/* Upload Mode Area */}
        {(submissionMode === 'PHOTO' || submissionMode === 'PDF') && (
          <div className="p-6 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 mx-auto flex items-center justify-center">
              {submissionMode === 'PHOTO' ? <Camera className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {submissionMode === 'PHOTO' ? 'Faça upload da foto da sua folha de redação' : 'Selecione o arquivo PDF da redação escaneada'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Formatos aceitos: {submissionMode === 'PHOTO' ? 'JPG, PNG, WEBP' : 'PDF oficial ENEM de até 20MB'}.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span>Selecionar Arquivo</span>
              <input
                type="file"
                accept={submissionMode === 'PHOTO' ? 'image/*' : 'application/pdf'}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadedFileName && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 max-w-sm mx-auto">
                <CheckCircle2 className="w-4 h-4" />
                <span className="truncate">{uploadedFileName}</span>
              </div>
            )}
          </div>
        )}

        {/* Text Area for Typing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">
              {submissionMode === 'TYPED' ? 'Folha de Redação Padrão Oficial:' : 'Transcrição / Observações do Texto:'}
            </span>
            <div className="flex items-center gap-4 font-mono font-bold">
              <span className={estimatedLines > 30 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}>
                Linhas: {estimatedLines} / 30
              </span>
              <span>Palavras: {words}</span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Comece seu texto dissertativo-argumentativo aqui..."
            rows={16}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {estimatedLines > 30 && (
            <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Atenção: o ENEM delimita o texto em no máximo 30 linhas!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
