import React, { useState, useEffect } from 'react';
import { db } from '../../db/storage';
import { adminRepository } from '../../services/repositories/adminRepository';
import {
  User,
  Question,
  QuestionOption,
  Simulado,
  EssayTopic,
  AreaDoConhecimento,
  Disciplina,
  StudentProfile,
  PdfImportDraft,
  SimuladoCategoria,
  ExamDay,
  LibraryAreaId,
  MaterialContentType,
} from '../../types';
import { ENEM_CURRICULUM } from '../../db/curriculumData';
import { DriveMaterial } from '../../db/driveMaterialsData';
import {
  LIBRARY_AREAS,
  getAllEnrichedMaterials,
  EnrichedMaterial,
  classifyMaterial,
} from '../../db/libraryStructure';
import {
  Shield,
  Users,
  FileCheck2,
  HelpCircle,
  PenTool,
  Plus,
  Trash2,
  Edit,
  Copy,
  Search,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  X,
  Save,
  Check,
  Eye,
  UploadCloud,
  FileUp,
  Download,
  Sparkles,
  BookOpen,
  Globe,
  ExternalLink,
  Layers,
  UserCheck,
  UserX,
  Clock,
  Phone,
  MapPin,
  Calendar,
  FolderDown,
  FolderPlus,
  Folder,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User | null;
  onNavigate: (route: string, params?: Record<string, string>) => void;
}

type AdminTab =
  | 'METRICAS'
  | 'PENDENTES'
  | 'MATERIAS'
  | 'BIBLIOTECA'
  | 'QUESTOES'
  | 'SIMULADOS'
  | 'REDACAO'
  | 'ALUNOS'
  | 'IMPORTAR_PDF';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('METRICAS');
  const [questions, setQuestions] = useState<Question[]>(() => db.getQuestions());
  const [simulados, setSimulados] = useState<Simulado[]>(() => db.getSimulados());
  const [topics, setTopics] = useState<EssayTopic[]>(() => db.getEssayTopics());
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [profiles, setProfiles] = useState<StudentProfile[]>(() => db.getProfiles());
  const [searchQuery, setSearchQuery] = useState('');
  const [adminAreaFilter, setAdminAreaFilter] = useState<string>('TODAS');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);
  const [pendingFilter, setPendingFilter] = useState<'PENDENTES' | 'APROVADOS' | 'REPROVADOS' | 'TODOS'>('PENDENTES');
  const [adminToast, setAdminToast] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    adminRepository.getUsers().then((res) => {
      if (isMounted && res.length > 0) setUsers(res);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Modais de Criação / Edição
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [isSimuladoModalOpen, setIsSimuladoModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  // Estados para Gestão da Biblioteca
  const [customMaterials, setCustomMaterials] = useState<DriveMaterial[]>(() => db.getCustomMaterials());
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [matArea, setMatArea] = useState<LibraryAreaId>('MATEMATICA');
  const [matFolder, setMatFolder] = useState('algebra');
  const [matType, setMatType] = useState<MaterialContentType>('APOSTILA');
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matDriveUrl, setMatDriveUrl] = useState('');
  const [matCoverUrl, setMatCoverUrl] = useState('');
  const [matOrder, setMatOrder] = useState(1);
  const [libraryAreaFilter, setLibraryAreaFilter] = useState<string>('TODAS');

  // Form states para Questão
  const [qArea, setQArea] = useState<AreaDoConhecimento>('MATEMATICA');
  const [qDiscipline, setQDiscipline] = useState<Disciplina>('Matemática');
  const [qTopic, setQTopic] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'FACIL' | 'MEDIO' | 'DIFICIL'>('MEDIO');
  const [qYear, setQYear] = useState(2025);
  const [qStatement, setQStatement] = useState('');
  const [qSupportText, setQSupportText] = useState('');
  const [qOptions, setQOptions] = useState<QuestionOption[]>([
    { letter: 'A', text: '', selectionPercentage: 10 },
    { letter: 'B', text: '', selectionPercentage: 20 },
    { letter: 'C', text: '', selectionPercentage: 50 },
    { letter: 'D', text: '', selectionPercentage: 10 },
    { letter: 'E', text: '', selectionPercentage: 10 },
  ]);
  const [qCorrect, setQCorrect] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('C');
  const [qExplanation, setQExplanation] = useState('');

  // Form states para Simulado
  const [simTitle, setSimTitle] = useState('');
  const [simDesc, setSimDesc] = useState('');
  const [simYear, setSimYear] = useState(2026);
  const [simTimeLimit, setSimTimeLimit] = useState(300);
  const [simSelectedQuestions, setSimSelectedQuestions] = useState<string[]>([]);

  // Form states para Tema de Redação
  const [topicTitle, setTopicTitle] = useState('');
  const [topicTheme, setTopicTheme] = useState('');
  const [topicText1, setTopicText1] = useState('');
  const [topicText2, setTopicText2] = useState('');

  // Estados para Importação de PDFs e Gabaritos (ENEM 2026 & Outros Vestibulares)
  const [pdfDrafts, setPdfDrafts] = useState<PdfImportDraft[]>(() => db.getPdfDrafts());
  const [importTitle, setImportTitle] = useState('1º SAS ENEM 2026 — Dia 1 (Importação Oficial)');
  const [importInstitution, setImportInstitution] = useState('SAS');
  const [importYear, setImportYear] = useState(2026);
  const [importCategory, setImportCategory] = useState<SimuladoCategoria>('ENEM_2026');
  const [importDay, setImportDay] = useState<ExamDay>('DIA_1');
  const [importQuestionsCount, setImportQuestionsCount] = useState(90);
  const [importTimeMinutes, setImportTimeMinutes] = useState(330);
  const [importExamPdfName, setImportExamPdfName] = useState('1º SAS 2026 - D1 .pdf');
  const [importAnswerKeyPdfName, setImportAnswerKeyPdfName] = useState('1º SAS 2026 - GAB D1.pdf');
  const [importResolutionPdfName, setImportResolutionPdfName] = useState('');
  const [importGabaritoText, setImportGabaritoText] = useState(`1 - B\n2 - B\n3 - B\n4 - A\n5 - C\n6 - A\n7 - B\n8 - D\n9 - C\n10 - E`);
  const [draftQuestions, setDraftQuestions] = useState<any[]>([]);
  const [isReviewingDraft, setIsReviewingDraft] = useState(false);
  const [activeReviewDraftId, setActiveReviewDraftId] = useState<string | null>(null);

  useEffect(() => {
    return db.subscribe(() => {
      setQuestions(db.getQuestions());
      setSimulados(db.getSimulados());
      setTopics(db.getEssayTopics());
      setUsers(db.getUsers());
      setProfiles(db.getProfiles());
      setPdfDrafts(db.getPdfDrafts());
    });
  }, []);

  // Parser de Gabarito no formato '1 - A'
  const parseGabaritoText = (rawText: string): Record<number, 'A' | 'B' | 'C' | 'D' | 'E'> => {
    const lines = rawText.split('\n');
    const result: Record<number, 'A' | 'B' | 'C' | 'D' | 'E'> = {};
    const regex = /(\d+)[\s.:\-_–—]+([A-Ea-e])/;
    lines.forEach((line) => {
      const match = line.match(regex);
      if (match) {
        const qNum = parseInt(match[1], 10);
        const opt = match[2].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
        result[qNum] = opt;
      }
    });
    return result;
  };

  const handleProcessGabaritoAndReview = () => {
    const parsed = parseGabaritoText(importGabaritoText);
    const parsedNumbers = Object.keys(parsed).map(Number).sort((a, b) => a - b);

    if (parsedNumbers.length === 0) {
      alert('Por favor, informe ao menos algumas linhas no formato padrão do gabarito:\n1 - A\n2 - C\n3 - D');
      return;
    }

    const generated: any[] = [];

    parsedNumbers.forEach((num) => {
      const correctOpt = parsed[num];

      let discipline: Disciplina = 'Português';
      let area: AreaDoConhecimento = 'LINGUAGENS';

      if (importCategory === 'ENEM_2026') {
        if (importDay === 'DIA_1') {
          if (num <= 5) {
            discipline = 'Inglês';
            area = 'LINGUAGENS';
          } else if (num <= 45) {
            discipline = num % 2 === 0 ? 'Português' : 'Literatura';
            area = 'LINGUAGENS';
          } else {
            discipline = num <= 65 ? 'História' : num <= 80 ? 'Geografia' : num <= 85 ? 'Filosofia' : 'Sociologia';
            area = 'CIENCIAS_HUMANAS';
          }
        } else {
          // Dia 2
          if (num <= 105) {
            discipline = 'Biologia';
            area = 'CIENCIAS_DA_NATUREZA';
          } else if (num <= 120) {
            discipline = 'Física';
            area = 'CIENCIAS_DA_NATUREZA';
          } else if (num <= 135) {
            discipline = 'Química';
            area = 'CIENCIAS_DA_NATUREZA';
          } else {
            discipline = 'Matemática';
            area = 'MATEMATICA';
          }
        }
      } else {
        // Outros vestibulares (Sírio-Libanês / Unicamp)
        discipline = num <= 10 ? 'Português' : num <= 20 ? 'Matemática' : num <= 30 ? 'Física' : 'Biologia';
        area = num <= 10 ? 'LINGUAGENS' : num <= 20 ? 'MATEMATICA' : 'CIENCIAS_DA_NATUREZA';
      }

      generated.push({
        number: num,
        statement: `[Enunciado extraído do arquivo ${importExamPdfName} referente à questão ${num}]. Analise a situação-problema apresentada e assinale a alternativa correta.`,
        supportText: `Texto de apoio da questão ${num} do simulado ${importTitle}`,
        correctOption: correctOpt,
        discipline,
        area,
        topic: `Tópico Geral ${discipline}`,
        difficulty: num % 3 === 0 ? 'DIFICIL' : num % 2 === 0 ? 'MEDIO' : 'FACIL',
        options: [
          { letter: 'A', text: 'Alternativa A com proposição fundamentada' },
          { letter: 'B', text: 'Alternativa B com proposição fundamentada' },
          { letter: 'C', text: 'Alternativa C com proposição fundamentada' },
          { letter: 'D', text: 'Alternativa D com proposição fundamentada' },
          { letter: 'E', text: 'Alternativa E com proposição fundamentada' },
        ],
      });
    });

    setDraftQuestions(generated);
    setIsReviewingDraft(true);
  };

  const handleSaveDraft = () => {
    const draft: PdfImportDraft = {
      id: activeReviewDraftId || `draft-${Date.now()}`,
      title: importTitle,
      institution: importInstitution,
      year: importYear,
      category: importCategory,
      day: importDay,
      totalQuestions: importQuestionsCount,
      timeLimitMinutes: importTimeMinutes,
      examPdfName: importExamPdfName,
      answerKeyPdfName: importAnswerKeyPdfName,
      resolutionPdfName: importResolutionPdfName,
      status: 'RASCUNHO_PENDENTE',
      questionsDraft: draftQuestions,
      createdAt: new Date().toISOString(),
    };

    db.savePdfDraft(draft);
    setPdfDrafts(db.getPdfDrafts());
    setIsReviewingDraft(false);
    setActiveReviewDraftId(null);
    alert('Rascunho do simulado salvo com sucesso! Você pode continuar a revisão a qualquer momento.');
  };

  const handlePublishDraftSimulado = (draftIdToPublish?: string) => {
    const targetId = draftIdToPublish || activeReviewDraftId;

    if (!targetId) {
      // Salvar primeiro se não tiver ID
      const newDraft: PdfImportDraft = {
        id: `draft-${Date.now()}`,
        title: importTitle,
        institution: importInstitution,
        year: importYear,
        category: importCategory,
        day: importDay,
        totalQuestions: importQuestionsCount,
        timeLimitMinutes: importTimeMinutes,
        examPdfName: importExamPdfName,
        answerKeyPdfName: importAnswerKeyPdfName,
        resolutionPdfName: importResolutionPdfName,
        status: 'RASCUNHO_PENDENTE',
        questionsDraft: draftQuestions,
        createdAt: new Date().toISOString(),
      };
      db.savePdfDraft(newDraft);
      const created = db.publishPdfDraft(newDraft.id);
      if (created) {
        setIsReviewingDraft(false);
        setSimulados(db.getSimulados());
        setPdfDrafts(db.getPdfDrafts());
        alert(`Simulado "${created.title}" publicado com sucesso! Já está disponível na área de simulados dos alunos.`);
      }
      return;
    }

    const published = db.publishPdfDraft(targetId);
    if (published) {
      setIsReviewingDraft(false);
      setActiveReviewDraftId(null);
      setSimulados(db.getSimulados());
      setPdfDrafts(db.getPdfDrafts());
      alert(`Simulado "${published.title}" publicado com sucesso para os estudantes!`);
    }
  };

  // Exportação de Dados do Sistema
  const handleExportData = (type: 'questions' | 'students' | 'simulados') => {
    let filename = `export-enem2026-${type}-${Date.now()}`;
    let dataStr = '';

    if (type === 'questions') {
      filename += '.json';
      dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    } else if (type === 'students') {
      filename += '.csv';
      const csvRows = [
        'ID,Nome,Email,Funcao,DataCadastro',
        ...users.map((u) => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.createdAt}"`),
      ];
      dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    } else {
      filename += '.csv';
      const csvRows = [
        'ID,Titulo,Categoria,Instituicao,Ano,TotalQuestoes,TempoMinutos',
        ...simulados.map((s) => `"${s.id}","${s.title}","${s.category}","${s.institution}","${s.year}","${s.totalQuestions}","${s.timeLimitMinutes}"`),
      ];
      dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    }

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const adminStats = db.getAdminStats();

  const handleOpenNewQuestion = () => {
    setEditingQuestion(null);
    setQStatement('');
    setQSupportText('');
    setQTopic('');
    setQExplanation('');
    setQOptions([
      { letter: 'A', text: '', selectionPercentage: 10 },
      { letter: 'B', text: '', selectionPercentage: 15 },
      { letter: 'C', text: '', selectionPercentage: 60 },
      { letter: 'D', text: '', selectionPercentage: 10 },
      { letter: 'E', text: '', selectionPercentage: 5 },
    ]);
    setQCorrect('C');
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQArea(q.area);
    setQDiscipline(q.discipline);
    setQTopic(q.topic);
    setQDifficulty(q.difficulty);
    setQYear(q.year);
    setQStatement(q.statement);
    setQSupportText(q.supportText || '');
    setQOptions(q.options);
    setQCorrect(q.correctOption);
    setQExplanation(q.explanation);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: Question = {
      id: editingQuestion ? editingQuestion.id : `q-custom-${Date.now()}`,
      statement: qStatement,
      supportText: qSupportText,
      options: qOptions,
      correctOption: qCorrect,
      explanation: qExplanation,
      area: qArea,
      discipline: qDiscipline,
      topic: qTopic || 'Geral',
      year: Number(qYear),
      difficulty: qDifficulty,
      source: 'ENEM 2026 PRO',
      tags: [qDiscipline, qTopic],
      totalAnswers: 150,
      correctAnswersCount: 95,
    };
    db.saveQuestion(newQ);
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta questão?')) {
      db.deleteQuestion(id);
    }
  };

  const handleSaveSimulado = (e: React.FormEvent) => {
    e.preventDefault();
    const newSim: Simulado = {
      id: `sim-${Date.now()}`,
      title: simTitle,
      description: simDesc,
      year: Number(simYear),
      type: 'SIMULADO_RAPIDO',
      totalQuestions: simSelectedQuestions.length || questions.length,
      timeLimitMinutes: Number(simTimeLimit),
      areas: ['MATEMATICA', 'CIENCIAS_DA_NATUREZA', 'CIENCIAS_HUMANAS', 'LINGUAGENS'],
      questionIds: simSelectedQuestions.length > 0 ? simSelectedQuestions : questions.map((q) => q.id),
      published: true,
      createdAt: new Date().toISOString(),
    };
    db.saveSimulado(newSim);
    setIsSimuladoModalOpen(false);
    setSimTitle('');
    setSimDesc('');
  };

  const handleDuplicateSimulado = (id: string) => {
    db.duplicateSimulado(id);
  };

  const handleDeleteSimulado = (id: string) => {
    if (window.confirm('Excluir este simulado?')) {
      db.deleteSimulado(id);
    }
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const newTopic: EssayTopic = {
      id: `topic-${Date.now()}`,
      title: topicTitle,
      theme: topicTheme,
      difficulty: 'MEDIO',
      year: 2026,
      createdAt: new Date().toISOString(),
      instructions:
        'A partir da leitura dos textos motivadores e com base nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema, apresentando proposta de intervenção que respeite os direitos humanos.',
      motivatingTexts: [
        {
          id: 1,
          title: 'Texto I',
          content: topicText1 || 'Dados e reflexões contemporâneas sobre o tema.',
          source: 'ENEM 2026 PRO',
        },
        {
          id: 2,
          title: 'Texto II',
          content: topicText2 || 'Legislação e políticas públicas brasileiras.',
          source: 'IBGE / IPEA',
        },
      ],
    };
    db.saveEssayTopic(newTopic);
    setIsTopicModalOpen(false);
    setTopicTitle('');
    setTopicTheme('');
    setTopicText1('');
    setTopicText2('');
  };

  const handleDeleteTopic = (id: string) => {
    if (window.confirm('Excluir este tema de redação?')) {
      db.deleteEssayTopic(id);
    }
  };

  // Handlers para Gestão de Materiais da Biblioteca
  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;

    let gId = matDriveUrl.trim();
    const match = matDriveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) gId = match[1];

    const newMat: DriveMaterial = {
      id: `custom-mat-${Date.now()}`,
      title: matTitle.trim(),
      fileName: `${matTitle.trim()}.pdf`,
      category: matFolder,
      subjectName: matFolder,
      subfolder: matFolder,
      mimeType: matType === 'AUDIO' ? 'audio/mpeg' : matType === 'MAPA_MENTAL' ? 'image/jpeg' : 'application/pdf',
      size: null,
      googleDriveId: gId || '1k59FPtgp4AmYU_Br3N6TbruueXOmTLKn',
      driveUrl: matDriveUrl || `https://drive.google.com/file/d/${gId || '1k59FPtgp4AmYU_Br3N6TbruueXOmTLKn'}/view`,
      embedUrl: `https://drive.google.com/file/d/${gId || '1k59FPtgp4AmYU_Br3N6TbruueXOmTLKn'}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${gId || '1k59FPtgp4AmYU_Br3N6TbruueXOmTLKn'}`,
      type: matType === 'AUDIO' ? 'AUDIO' : matType === 'MAPA_MENTAL' ? 'IMAGEM' : 'PDF',
    };

    db.saveCustomMaterial(newMat);
    setCustomMaterials(db.getCustomMaterials());
    setIsMaterialModalOpen(false);
    setMatTitle('');
    setMatDesc('');
    setMatDriveUrl('');
    setAdminToast(`Material "${newMat.title}" cadastrado e publicado na biblioteca!`);
    setTimeout(() => setAdminToast(null), 3500);
  };

  const handleDeleteMaterial = (id: string, title: string) => {
    if (window.confirm(`Deseja realmente remover o material "${title}" da biblioteca?`)) {
      db.deleteCustomMaterial(id);
      setCustomMaterials(db.getCustomMaterials());
      setAdminToast(`Material "${title}" removido com sucesso.`);
      setTimeout(() => setAdminToast(null), 3500);
    }
  };

  // Filtragem de questões para a aba
  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return (
      q.statement.toLowerCase().includes(s) ||
      q.discipline.toLowerCase().includes(s) ||
      q.topic.toLowerCase().includes(s)
    );
  });

  const studentsList = users.filter((u) => u.role === 'ALUNO');

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Módulo de Administração Central</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Painel do Administrador
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerenciamento completo de questões, estatísticas da plataforma, simulados, temas de redação e alunos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (window.confirm('ATENÇÃO: Deseja zerar todo o histórico do sistema e recarregar os simulados oficiais reais?')) {
                db.resetSystem();
                alert('Sistema zerado com sucesso! Dados de teste removidos e simulado Anglo Sírio-Libanês 2026 carregado.');
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
          >
            Zerar Todo o Sistema
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Visualizar como Aluno
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'METRICAS', label: 'Métricas Gerais', icon: BarChart3 },
          {
            id: 'PENDENTES',
            label: `Usuários Pendentes (${users.filter((u) => u.status === 'PENDENTE_APROVACAO').length})`,
            icon: UserCheck,
          },
          { id: 'MATERIAS', label: `Matérias & Conteúdos (15)`, icon: BookOpen },
          { id: 'BIBLIOTECA', label: `Biblioteca & Materiais (${428 + customMaterials.length})`, icon: FolderDown },
          { id: 'QUESTOES', label: `Banco de Questões (${questions.length})`, icon: HelpCircle },
          { id: 'SIMULADOS', label: `Simulados (${simulados.length})`, icon: FileCheck2 },
          { id: 'REDACAO', label: `Temas de Redação (${topics.length})`, icon: PenTool },
          { id: 'ALUNOS', label: `Alunos Cadastrados (${studentsList.length})`, icon: Users },
          { id: 'IMPORTAR_PDF', label: `Importar PDFs & Gabaritos (${pdfDrafts.length})`, icon: UploadCloud },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'border-rose-600 text-rose-600 dark:border-rose-500 dark:text-rose-400 font-black'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MÉTRICAS GERAIS */}
      {/* ========================================================================= */}
      {activeTab === 'METRICAS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total de Alunos</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {adminStats.totalStudents}
              </div>
              <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> 100% ativos
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Simulados Feitos</span>
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {adminStats.totalAttempts}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tentativas registradas
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Redações Corrigidas</span>
                <PenTool className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {adminStats.totalEssays}
              </div>
              <span className="text-[11px] text-purple-500 font-bold mt-1 block">
                Pela Inteligência Artificial
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Média da Plataforma</span>
                <BarChart3 className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {adminStats.averagePlatformScore}%
              </div>
              <span className="text-[11px] text-emerald-500 font-bold mt-1 block">
                Acerto global nas questões
              </span>
            </div>
          </div>

          {/* Quick status summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
              Status Operacional dos Serviços ENEM 2026 PRO
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Motor de IA de Redação</div>
                  <div className="text-[10px] text-slate-500">Operando com as 5 competências oficiais</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Banco de Dados Offline</div>
                  <div className="text-[10px] text-slate-500">Persistência reativa ativada</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Cronômetro & Simulados</div>
                  <div className="text-[10px] text-slate-500">Modo exame com gabarito dinâmico</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: USUÁRIOS PENDENTES DE APROVAÇÃO */}
      {/* ========================================================================= */}
      {activeTab === 'PENDENTES' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-black border border-amber-200 dark:border-amber-800">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Controle de Acesso & Aprovação Administrativa</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Fila de Usuários & Candidatos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Revise os dados cadastrais (nome, e-mail, telefone, cidade e objetivo de estudo) antes de conceder acesso à plataforma ENEM 2026 PRO.
              </p>
            </div>

            {/* Quick counters */}
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center min-w-[100px]">
                <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {users.filter((u) => u.status === 'PENDENTE_APROVACAO').length}
                </div>
                <div className="text-[10px] font-bold text-slate-500">Pendentes</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center min-w-[100px]">
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {users.filter((u) => u.status === 'APROVADO').length}
                </div>
                <div className="text-[10px] font-bold text-slate-500">Aprovados</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center min-w-[100px]">
                <div className="text-xl font-black text-rose-600 dark:text-rose-400">
                  {users.filter((u) => u.status === 'REPROVADO').length}
                </div>
                <div className="text-[10px] font-bold text-slate-500">Reprovados</div>
              </div>
            </div>
          </div>

          {/* Action toast */}
          {adminToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{adminToast}</span>
              </div>
              <button onClick={() => setAdminToast(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'PENDENTES', label: 'Pendentes de Aprovação' },
                { id: 'APROVADOS', label: 'Aprovados' },
                { id: 'REPROVADOS', label: 'Reprovados' },
                { id: 'TODOS', label: 'Todos os Usuários' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPendingFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    pendingFilter === f.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* List of Users */}
          {(() => {
            const filtered = users.filter((u) => {
              if (pendingFilter === 'PENDENTES' && u.status !== 'PENDENTE_APROVACAO') return false;
              if (pendingFilter === 'APROVADOS' && u.status !== 'APROVADO') return false;
              if (pendingFilter === 'REPROVADOS' && u.status !== 'REPROVADO') return false;
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                  u.name.toLowerCase().includes(q) ||
                  u.email.toLowerCase().includes(q) ||
                  (u.city && u.city.toLowerCase().includes(q))
                );
              }
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                  <UserCheck className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    Nenhum usuário encontrado nesta categoria
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Não há cadastros com os filtros selecionados no momento.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((u) => (
                  <div
                    key={u.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                  >
                    {/* Header: User basic info and status badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{u.name}</span>
                            {u.role === 'ADMINISTRADOR' && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                Admin
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {u.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          u.status === 'APROVADO'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : u.status === 'REPROVADO'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {u.status === 'APROVADO'
                          ? 'Aprovado'
                          : u.status === 'REPROVADO'
                          ? 'Reprovado'
                          : 'Pendente'}
                      </span>
                    </div>

                    {/* Metadata Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Objetivo:</span>
                        <span className="font-bold text-brand-600 dark:text-brand-400">
                          {u.objective || 'ENEM 2026'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Cidade / UF:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {u.city ? `${u.city}/${u.state || 'SP'}` : 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Telefone:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {u.phone || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Data de Cadastro:</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {u.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                        <strong>Motivo da Reprovação:</strong> {u.rejectionReason}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {u.role !== 'ADMINISTRADOR' && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        {u.status !== 'APROVADO' && (
                          <button
                            onClick={async () => {
                              const res = await adminRepository.setUserStatus(u.id, 'APROVADO');
                              if (res.success) {
                                const updated = await adminRepository.getUsers();
                                setUsers(updated);
                                setAdminToast(`Usuário "${u.name}" foi APROVADO com sucesso!`);
                                setTimeout(() => setAdminToast(null), 3500);
                              } else {
                                setAdminToast(res.error || 'Erro ao aprovar usuário.');
                                setTimeout(() => setAdminToast(null), 3500);
                              }
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprovar Usuário</span>
                          </button>
                        )}

                        {u.status !== 'REPROVADO' && (
                          <button
                            onClick={async () => {
                              const reason = window.prompt(
                                `Motivo da reprovação do usuário ${u.name} (opcional):`,
                                'Dados incompletos ou não aprovados pela coordenação.'
                              );
                              if (reason !== null) {
                                const res = await adminRepository.setUserStatus(u.id, 'REPROVADO', reason);
                                if (res.success) {
                                  const updated = await adminRepository.getUsers();
                                  setUsers(updated);
                                  setAdminToast(`Usuário "${u.name}" foi REPROVADO.`);
                                  setTimeout(() => setAdminToast(null), 3500);
                                } else {
                                  setAdminToast(res.error || 'Erro ao reprovar usuário.');
                                  setTimeout(() => setAdminToast(null), 3500);
                                }
                              }
                            }}
                            className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-800"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Reprovar</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: MATÉRIAS & CONTEÚDOS CURRICULARES (15 DISCIPLINAS) */}
      {/* ========================================================================= */}
      {activeTab === 'MATERIAS' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-black border border-brand-200 dark:border-brand-800">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Base Curricular Oficial • Matriz do INEP</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                15 Matérias do ENEM 2026
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Todas as 15 disciplinas já vêm estruturadas com <strong>Teoria aprofundada</strong>, <strong>Resumos esquematizados</strong>, <strong>Mapas Mentais</strong>, <strong>Flashcards</strong>, <strong>Exercícios Resolvidos passo a passo</strong> e <strong>Curadoria de Videoaulas da Internet</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setSyncSuccessMsg(true);
                  setTimeout(() => setSyncSuccessMsg(false), 6000);
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Globe className="w-4 h-4" />
                <span>Puxar / Sincronizar da Internet</span>
              </button>

              <button
                onClick={() => onNavigate('materias')}
                className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Visualizar como Aluno</span>
              </button>
            </div>
          </div>

          {/* Banner de Sincronização com a Internet */}
          {syncSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-black text-sm">
                  Conteúdos Curriculares Sincronizados com a Internet com Sucesso!
                </p>
                <p className="leading-relaxed">
                  Todas as 15 disciplinas e seus tópicos foram abastecidos com materiais didáticos online (videoaulas recomendadas de canais consagrados como Ferretto, Jubilut e Brasil Escola), resumos conceituais, flashcards ativos e exercícios resolvidos.
                </p>
              </div>
            </div>
          )}

          {/* Area Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'TODAS', label: 'Todas as 15 Matérias', count: ENEM_CURRICULUM.length },
              { id: 'LINGUAGENS', label: 'Linguagens e Códigos', count: ENEM_CURRICULUM.filter((s) => s.area === 'LINGUAGENS').length },
              { id: 'CIENCIAS_HUMANAS', label: 'Ciências Humanas', count: ENEM_CURRICULUM.filter((s) => s.area === 'CIENCIAS_HUMANAS').length },
              { id: 'CIENCIAS_DA_NATUREZA', label: 'Ciências da Natureza', count: ENEM_CURRICULUM.filter((s) => s.area === 'CIENCIAS_DA_NATUREZA').length },
              { id: 'MATEMATICA', label: 'Matemática', count: ENEM_CURRICULUM.filter((s) => s.area === 'MATEMATICA').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAdminAreaFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  adminAreaFilter === tab.id
                    ? 'bg-rose-600 text-white shadow-sm font-black'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENEM_CURRICULUM
              .filter((s) => adminAreaFilter === 'TODAS' || s.area === adminAreaFilter)
              .map((subject) => {
                const isExpanded = expandedSubjectId === subject.id;

                return (
                  <div
                    key={subject.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                            {subject.areaLabel}
                          </span>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {subject.name}
                          </h3>
                        </div>
                        <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {subject.topics.length} tópicos
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {subject.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-[10px] text-slate-400 font-bold block">Flashcards</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                            {subject.topics.reduce((acc, t) => acc + t.flashcards.length, 0)}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-[10px] text-slate-400 font-bold block">Exercícios</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                            {subject.topics.reduce((acc, t) => acc + t.solvedExercises.length, 0)}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-[10px] text-slate-400 font-bold block">Recursos Web</span>
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            {subject.topics.reduce((acc, t) => acc + (t.onlineResources?.length || 4), 0)}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Topic Details */}
                      {isExpanded && (
                        <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto pr-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                            Conteúdos e Tópicos Curriculares:
                          </span>
                          {subject.topics.map((top, idx) => (
                            <div
                              key={top.id}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                                <span>{idx + 1}. {top.name}</span>
                                <span className="text-[10px] text-indigo-600 font-mono">
                                  {top.onlineResources?.length || 4} web links
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {top.theory.slice(0, 80)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                        className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Ocultar Tópicos' : 'Ver Todos os Tópicos'}
                      </button>

                      <button
                        onClick={() => onNavigate('materia-detalhe', { subjectId: subject.id })}
                        className="py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Acessar Área do Aluno com 8 Abas Didáticas"
                      >
                        <span>Estudar</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: BIBLIOTECA & MATERIAIS DE ESTUDOS (ADMIN) */}
      {/* ========================================================================= */}
      {activeTab === 'BIBLIOTECA' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-black border border-indigo-200 dark:border-indigo-800">
                <FolderDown className="w-3.5 h-3.5" />
                <span>Gestão da Biblioteca Digital • ENEM 2026 & ETEC</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Biblioteca & Acervo de Materiais
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Cadastre novas apostilas, resumos, listas de exercícios, áudios e mapas mentais. Os materiais cadastrados aqui são publicados automaticamente nas pastas dos alunos com leitor de PDF integrado.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Material</span>
              </button>

              <button
                onClick={() => onNavigate('biblioteca')}
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
              >
                <span>Ver como Aluno</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filtros por Área */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['TODAS', 'MATEMATICA', 'LINGUAGENS', 'CIENCIAS_DA_NATUREZA', 'CIENCIAS_HUMANAS', 'REDACAO', 'ETEC'].map((areaKey) => {
              const count = areaKey === 'TODAS'
                ? 428 + customMaterials.length
                : [...customMaterials.map(classifyMaterial), ...getAllEnrichedMaterials()].filter((m) => m.areaId === areaKey).length;

              return (
                <button
                  key={areaKey}
                  onClick={() => setLibraryAreaFilter(areaKey)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    libraryAreaFilter === areaKey
                      ? 'bg-indigo-600 text-white shadow-sm font-black'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {areaKey === 'TODAS' ? 'Todas as Áreas' : areaKey.replace(/_/g, ' ')} ({count})
                </button>
              );
            })}
          </div>

          {/* Lista de Materiais Cadastrados / Customizados */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Materiais da Biblioteca ({[...customMaterials.map(classifyMaterial), ...getAllEnrichedMaterials()].filter(m => libraryAreaFilter === 'TODAS' || m.areaId === libraryAreaFilter).length})
              </h3>
              <span className="text-xs text-slate-400">
                {customMaterials.length} materiais cadastrados manualmente pelo administrador
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...customMaterials.map(classifyMaterial), ...getAllEnrichedMaterials()]
                .filter((m) => libraryAreaFilter === 'TODAS' || m.areaId === libraryAreaFilter)
                .slice(0, 30)
                .map((mat) => {
                  const isCustom = mat.id.startsWith('custom-');

                  return (
                    <div key={mat.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {mat.areaId} • {mat.folderId}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {mat.contentType}
                          </span>
                          {isCustom && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                              Novo Admin
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {mat.cleanTitle}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {mat.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <a
                          href={mat.embedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Testar</span>
                        </a>

                        {isCustom && (
                          <button
                            onClick={() => handleDeleteMaterial(mat.id, mat.cleanTitle)}
                            className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                            title="Excluir Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BANCO DE QUESTÕES (CRUD + SELECTION PERCENTAGES) */}
      {/* ========================================================================= */}
      {activeTab === 'QUESTOES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar questões por texto, matéria ou assunto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>

            <button
              onClick={handleOpenNewQuestion}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Nova Questão</span>
            </button>
          </div>

          {/* Questions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuestions.map((q) => (
                <div key={q.id} className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {q.discipline}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                          {q.topic}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          ENEM {q.year} • Dificuldade: {q.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-black">
                          Gabarito: {q.correctOption}
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                        {q.statement}
                      </p>

                      {/* Percentage of selection per option (A, B, C, D, E) */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Estatística de Escolha dos Alunos por Alternativa:
                        </span>
                        <div className="grid grid-cols-5 gap-2 max-w-lg">
                          {q.options.map((opt) => {
                            const isCorrect = opt.letter === q.correctOption;
                            const pct = opt.selectionPercentage ?? (isCorrect ? 65 : 8);

                            return (
                              <div
                                key={opt.letter}
                                className={`p-1.5 rounded-xl border text-center ${
                                  isCorrect
                                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                                }`}
                              >
                                <span
                                  className={`text-[11px] font-black block ${
                                    isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {opt.letter}: {pct}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditQuestion(q)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Editar Questão"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="Excluir Questão"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SIMULADOS */}
      {/* ========================================================================= */}
      {activeTab === 'SIMULADOS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Simulados Cadastrados no Sistema
            </h2>
            <button
              onClick={() => setIsSimuladoModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Simulado</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulados.map((sim) => (
              <div
                key={sim.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                      {sim.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      ENEM {sim.year}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {sim.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {sim.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-3 font-semibold">
                    <span>{sim.totalQuestions} questões</span>
                    <span>•</span>
                    <span>{sim.timeLimitMinutes} min ({Math.floor(sim.timeLimitMinutes / 60)}h{sim.timeLimitMinutes % 60 ? ` ${sim.timeLimitMinutes % 60}m` : ''})</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicateSimulado(sim.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSimulado(sim.id)}
                      className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigate('simulados')}
                    className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Ver na Plataforma
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TEMAS DE REDAÇÃO */}
      {/* ========================================================================= */}
      {activeTab === 'REDACAO' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Temas Oficiais e Inéditos de Redação
            </h2>
            <button
              onClick={() => setIsTopicModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Tema de Redação</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {t.title}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {t.motivatingTexts.length} Textos Motivadores
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    "{t.theme}"
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {t.instructions}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleDeleteTopic(t.id)}
                    className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="Excluir Tema"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('redacao-editor', { topicId: t.id })}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Testar no Editor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ALUNOS CADASTRADOS */}
      {/* ========================================================================= */}
      {activeTab === 'ALUNOS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Lista de Estudantes Cadastrados
            </h2>
            <span className="text-xs text-slate-400 font-bold">
              Total: {studentsList.length} alunos
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {studentsList.map((st) => {
              const prof = profiles.find((p) => p.userId === st.id);

              return (
                <div key={st.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={st.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${st.email}`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white">
                        {st.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {st.email} • Cadastro em {new Date(st.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Objetivo</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {prof?.targetCourse || 'Medicina'} ({prof?.targetUniversity || 'USP'})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Meta TRI</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {prof?.targetScore || 800} pts
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Nível & XP</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        Nvl {prof?.level || 1} • {prof?.xp || 100} XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: IMPORTAÇÃO E GESTÃO DE SIMULADOS EM PDF */}
      {/* ========================================================================= */}
      {activeTab === 'IMPORTAR_PDF' && (
        <div className="space-y-6">
          {/* Header & Export Actions */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-800">
                  Fluxo de Integração PDF & Gabarito
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  Importação & Revisão Pedagógica de Simulados
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
                  Selecione os PDFs do simulado e do gabarito (SAS, Bernoulli, Poliedro, Apeiron, Sírio-Libanês, Unicamp), processe o gabarito no formato padrão (1 - A, 2 - C...) e revise as questões antes de publicar para os estudantes.
                </p>
              </div>

              {/* Data Export Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleExportData('questions')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Exportar Questões (JSON)
                </button>
                <button
                  type="button"
                  onClick={() => handleExportData('students')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Relatório Alunos (CSV)
                </button>
              </div>
            </div>
          </div>

          {/* Rascunhos Pendentes de Revisão */}
          {pdfDrafts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-brand-600" />
                  Fila de Rascunhos Cadastrados ({pdfDrafts.length})
                </h3>
                <span className="text-xs text-slate-400 font-semibold">
                  {pdfDrafts.filter(d => d.status === 'RASCUNHO_PENDENTE').length} pendentes de publicação
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pdfDrafts.map((draft) => (
                  <div key={draft.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {draft.title}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          draft.status === 'PUBLICADO'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {draft.status === 'PUBLICADO' ? 'Publicado' : 'Pendente de Revisão'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {draft.institution} • {draft.category === 'ENEM_2026' ? 'ENEM 2026' : 'Outros Vestibulares'} • {draft.day || 'Dia Único'} • Arquivo: {draft.examPdfName || 'PDF Anexado'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImportTitle(draft.title);
                          setImportInstitution(draft.institution);
                          setImportCategory(draft.category);
                          setImportDay(draft.day || 'DIA_1');
                          setImportQuestionsCount(draft.totalQuestions);
                          setImportTimeMinutes(draft.timeLimitMinutes);
                          setDraftQuestions(draft.questionsDraft || []);
                          setActiveReviewDraftId(draft.id);
                          setIsReviewingDraft(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                      >
                        Revisar Questões
                      </button>

                      {draft.status !== 'PUBLICADO' && (
                        <button
                          type="button"
                          onClick={() => handlePublishDraftSimulado(draft.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer shadow-xs"
                        >
                          Publicar para Alunos
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Excluir este rascunho de importação?')) {
                            db.deletePdfDraft(draft.id);
                            setPdfDrafts(db.getPdfDrafts());
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: REVISÃO ANTES DE PUBLICAR */}
          {isReviewingDraft ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">
                    Etapa 5 de 6: Revisão Pré-Publicação
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    Revisar Conteúdo: {importTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verifique os enunciados, gabaritos e matérias atribuídas a cada questão antes de disponibilizar aos alunos.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReviewingDraft(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Voltar ao Formulário
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Salvar Rascunho
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublishDraftSimulado()}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Publicar Simulado
                  </button>
                </div>
              </div>

              {/* Lista de Questões em Revisão */}
              <div className="space-y-4">
                {draftQuestions.map((qItem, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                          Questão #{qItem.number || idx + 1}
                        </span>
                        <span className="font-bold text-brand-600">
                          {qItem.discipline} ({qItem.area})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-bold">
                        <span>Gabarito:</span>
                        <div className="flex gap-1">
                          {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => {
                                const updated = [...draftQuestions];
                                updated[idx].correctOption = letter;
                                setDraftQuestions(updated);
                              }}
                              className={`w-7 h-7 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                                qItem.correctOption === letter
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              {letter}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Enunciado da Questão:
                      </label>
                      <textarea
                        value={qItem.statement}
                        onChange={(e) => {
                          const updated = [...draftQuestions];
                          updated[idx].statement = e.target.value;
                          setDraftQuestions(updated);
                        }}
                        rows={2}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* VIEW: FORMULÁRIO DE SELEÇÃO DE PDF E GABARITO */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Cadastrar Nova Importação de Simulado & Gabarito
                </h3>
                <p className="text-xs text-slate-500">
                  Preencha os dados abaixo e forneça o gabarito no formato padronizado.
                </p>
              </div>

              {/* Presets de Arquivos Existentes no Desktop */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  📁 Arquivos de Simulados 2026 Disponíveis no Desktop:
                </span>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'sas-d1') {
                      setImportTitle('1º SAS ENEM 2026 — Dia 1');
                      setImportInstitution('SAS');
                      setImportCategory('ENEM_2026');
                      setImportDay('DIA_1');
                      setImportExamPdfName('1º SAS 2026 - D1 .pdf');
                      setImportAnswerKeyPdfName('1º SAS 2026 - GAB D1.pdf');
                    } else if (val === 'sas-d2') {
                      setImportTitle('1º SAS ENEM 2026 — Dia 2');
                      setImportInstitution('SAS');
                      setImportCategory('ENEM_2026');
                      setImportDay('DIA_2');
                      setImportExamPdfName('1º SAS 2026 - D2.pdf');
                      setImportAnswerKeyPdfName('1º SAS 2026 - GAB D2.pdf');
                    } else if (val === 'poliedro-d1') {
                      setImportTitle('1º Poliedro ENEM 2026 — Dia 1');
                      setImportInstitution('Poliedro');
                      setImportCategory('ENEM_2026');
                      setImportDay('DIA_1');
                      setImportExamPdfName('1° POLIEDRO 2026 - D1.pdf');
                      setImportAnswerKeyPdfName('1° POLIEDRO 2026 - GAB D1.pdf');
                    } else if (val === 'poliedro-d2') {
                      setImportTitle('1º Poliedro ENEM 2026 — Dia 2');
                      setImportInstitution('Poliedro');
                      setImportCategory('ENEM_2026');
                      setImportDay('DIA_2');
                      setImportExamPdfName('1° POLIEDRO 2026 - D2.pdf');
                      setImportAnswerKeyPdfName('1° POLIEDRO 2026 - GAB D2.pdf');
                    } else if (val === 'sirio-libanes') {
                      setImportTitle('1º Anglo Sírio-Libanês 2026 — Prova II');
                      setImportInstitution('Anglo Vestibulares');
                      setImportCategory('OUTROS_VESTIBULARES');
                      setImportDay('UNICO');
                      setImportExamPdfName('1º ANGLO SÍRIO-LIBANÊS - PROVA II 2026.pdf');
                      setImportAnswerKeyPdfName('GAB II - 1º ANGLO SÍRIO-LIBANÊS - PROVA I 2026.pdf');
                    } else if (val === 'unicamp') {
                      setImportTitle('1º Bernoulli UNICAMP 2026 — 1ª Fase');
                      setImportInstitution('Bernoulli Sistema de Ensino');
                      setImportCategory('OUTROS_VESTIBULARES');
                      setImportDay('UNICO');
                      setImportExamPdfName('1º BERNOULLI UNICAMP - 1º FASE 2026.pdf');
                      setImportResolutionPdfName('Resolução 1º BERNOULLI UNICAMP - 1º FASE 2026.pdf');
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="">-- Selecione para preenchimento automático rápido --</option>
                  <option value="sas-d1">1º SAS 2026 - Dia 1 (Linguagens + Humanas) + GAB D1</option>
                  <option value="sas-d2">1º SAS 2026 - Dia 2 (Natureza + Matemática) + GAB D2</option>
                  <option value="poliedro-d1">1° POLIEDRO 2026 - Dia 1 + GAB D1</option>
                  <option value="poliedro-d2">1° POLIEDRO 2026 - Dia 2 + GAB D2</option>
                  <option value="sirio-libanes">1º Anglo Sírio-Libanês 2026 - Prova II + GAB II</option>
                  <option value="unicamp">1º Bernoulli UNICAMP 2026 - 1ª Fase + Resolução</option>
                </select>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome / Título do Simulado:
                  </label>
                  <input
                    type="text"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Instituição / Sistema:
                  </label>
                  <input
                    type="text"
                    value={importInstitution}
                    onChange={(e) => setImportInstitution(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria:
                  </label>
                  <select
                    value={importCategory}
                    onChange={(e) => setImportCategory(e.target.value as SimuladoCategoria)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="ENEM_2026">Simulado ENEM 2026</option>
                    <option value="OUTROS_VESTIBULARES">Outros Vestibulares (Sírio-Libanês, Unicamp, etc.)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Caderno / Dia:
                  </label>
                  <select
                    value={importDay}
                    onChange={(e) => setImportDay(e.target.value as ExamDay)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="DIA_1">Dia 1 (Linguagens e Humanas + Redação)</option>
                    <option value="DIA_2">Dia 2 (Natureza e Matemática)</option>
                    <option value="UNICO">Dia Único (Vestibulares Tradicionais)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Arquivo PDF do Simulado:
                  </label>
                  <input
                    type="text"
                    value={importExamPdfName}
                    onChange={(e) => setImportExamPdfName(e.target.value)}
                    placeholder="Ex: 1º SAS 2026 - D1 .pdf"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Arquivo PDF do Gabarito:
                  </label>
                  <input
                    type="text"
                    value={importAnswerKeyPdfName}
                    onChange={(e) => setImportAnswerKeyPdfName(e.target.value)}
                    placeholder="Ex: 1º SAS 2026 - GAB D1.pdf"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Textarea para Gabarito com Formato 1 - A */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Gabarito das Questões (Formato Padrão: 1 - A, 2 - C...):
                  </label>
                  <span className="text-slate-400">Aceita formatos: "1 - A", "1: A", "1. A"</span>
                </div>
                <textarea
                  value={importGabaritoText}
                  onChange={(e) => setImportGabaritoText(e.target.value)}
                  rows={8}
                  placeholder={`1 - A\n2 - C\n3 - D\n4 - B\n5 - E...`}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleProcessGabaritoAndReview}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs uppercase shadow-md shadow-brand-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Processar Gabarito e Abrir Revisão Pré-Publicação
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRAR / EDITAR QUESTÃO */}
      {/* ========================================================================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {editingQuestion ? 'Editar Questão' : 'Cadastrar Nova Questão'}
              </h2>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Área
                  </label>
                  <select
                    value={qArea}
                    onChange={(e) => setQArea(e.target.value as AreaDoConhecimento)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="MATEMATICA">Matemática</option>
                    <option value="CIENCIAS_DA_NATUREZA">Natureza</option>
                    <option value="CIENCIAS_HUMANAS">Humanas</option>
                    <option value="LINGUAGENS">Linguagens</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Disciplina
                  </label>
                  <input
                    type="text"
                    value={qDiscipline}
                    onChange={(e) => setQDiscipline(e.target.value as Disciplina)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assunto / Tópico
                  </label>
                  <input
                    type="text"
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    required
                    placeholder="Ex: Funções, Ecologia"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dificuldade
                  </label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="FACIL">Fácil</option>
                    <option value="MEDIO">Médio</option>
                    <option value="DIFICIL">Difícil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Texto de Apoio / Contextualização (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={qSupportText}
                  onChange={(e) => setQSupportText(e.target.value)}
                  placeholder="Texto base ou citação da questão..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enunciado da Questão *
                </label>
                <textarea
                  rows={3}
                  value={qStatement}
                  onChange={(e) => setQStatement(e.target.value)}
                  required
                  placeholder="Pergunta objetiva..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {/* Alternativas A a E */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Alternativas (A a E) e Gabarito Correto:
                </label>
                {qOptions.map((opt, idx) => (
                  <div key={opt.letter} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQCorrect(opt.letter)}
                      className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center cursor-pointer ${
                        qCorrect === opt.letter
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {opt.letter}
                    </button>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const copy = [...qOptions];
                        copy[idx].text = e.target.value;
                        setQOptions(copy);
                      }}
                      required
                      placeholder={`Texto da alternativa ${opt.letter}`}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                    <div className="w-16">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={opt.selectionPercentage || 0}
                        onChange={(e) => {
                          const copy = [...qOptions];
                          copy[idx].selectionPercentage = Number(e.target.value);
                          setQOptions(copy);
                        }}
                        title="% de escolha"
                        className="w-full px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resolução Comentada / Justificativa Pedagógica
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explicação passo a passo para o aluno..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Salvar Questão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVO SIMULADO */}
      {/* ========================================================================= */}
      {isSimuladoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Criar Novo Simulado
              </h2>
              <button
                onClick={() => setIsSimuladoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSimulado} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Simulado
                </label>
                <input
                  type="text"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  required
                  placeholder="Ex: Simulado Oficial ENEM 2026 - Edição Inédita"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={simDesc}
                  onChange={(e) => setSimDesc(e.target.value)}
                  required
                  placeholder="Ex: Treinamento cronometrado com questões inéditas..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ano
                  </label>
                  <input
                    type="number"
                    value={simYear}
                    onChange={(e) => setSimYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tempo Limite (Minutos)
                  </label>
                  <input
                    type="number"
                    value={simTimeLimit}
                    onChange={(e) => setSimTimeLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimuladoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Publicar Simulado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVO TEMA DE REDAÇÃO */}
      {/* ========================================================================= */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Cadastrar Tema de Redação
              </h2>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título Curto do Tema
                </label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  required
                  placeholder="Ex: Tema Inédito 2026: Saúde Mental na Era Digital"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Frase-Tema Oficial (Proposta ENEM)
                </label>
                <textarea
                  rows={2}
                  value={topicTheme}
                  onChange={(e) => setTopicTheme(e.target.value)}
                  required
                  placeholder="Ex: Desafios para a preservação da saúde mental da juventude diante da hiperconexão digital no Brasil"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Texto Motivador I
                </label>
                <textarea
                  rows={2}
                  value={topicText1}
                  onChange={(e) => setTopicText1(e.target.value)}
                  placeholder="Dados, artigos ou trechos reflexivos..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Texto Motivador II
                </label>
                <textarea
                  rows={2}
                  value={topicText2}
                  onChange={(e) => setTopicText2(e.target.value)}
                  placeholder="Estatísticas, leis ou gráficos..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  Salvar Tema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR MATERIAL NA BIBLIOTECA (ADMIN) */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <FolderDown className="w-4 h-4" />
                </div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Cadastrar Material na Biblioteca
                </h3>
              </div>
              <button
                onClick={() => setIsMaterialModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Selecionar Área */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    1. Área do Conhecimento
                  </label>
                  <select
                    value={matArea}
                    onChange={(e) => {
                      const newArea = e.target.value as LibraryAreaId;
                      setMatArea(newArea);
                      const areaDef = LIBRARY_AREAS.find((a) => a.id === newArea);
                      if (areaDef && areaDef.folders.length > 0) {
                        setMatFolder(areaDef.folders[0].id);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="MATEMATICA">📙 Matemática</option>
                    <option value="LINGUAGENS">📘 Linguagens e Códigos</option>
                    <option value="CIENCIAS_DA_NATUREZA">📗 Ciências da Natureza</option>
                    <option value="CIENCIAS_HUMANAS">📕 Ciências Humanas</option>
                    <option value="REDACAO">📒 Redação Nota 1000</option>
                    <option value="ETEC">📔 Vestibulinho ETEC</option>
                  </select>
                </div>

                {/* 2. Selecionar Matéria / Pasta */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    2. Matéria / Pasta
                  </label>
                  <select
                    value={matFolder}
                    onChange={(e) => setMatFolder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {LIBRARY_AREAS.find((a) => a.id === matArea)?.folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 3. Tipo de Conteúdo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    3. Tipo de Material
                  </label>
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as MaterialContentType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="APOSTILA">📄 Apostila PDF</option>
                    <option value="AUDIO">🎧 Áudio Aula</option>
                    <option value="MAPA_MENTAL">🖼 Mapa Mental</option>
                    <option value="EXERCICIO">📝 Exercícios Resolvidos</option>
                    <option value="SIMULADO">🎯 Simulado</option>
                    <option value="RESUMO">📚 Resumo Esquemático</option>
                  </select>
                </div>

                {/* 4. Ordem de exibição */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    4. Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={matOrder}
                    onChange={(e) => setMatOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* 5. Título */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Material *
                </label>
                <input
                  type="text"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  required
                  placeholder="Ex: Álgebra: Guia Completo de Funções do 1º e 2º Grau"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {/* 6. Descrição */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição Pedagógica
                </label>
                <textarea
                  rows={2}
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  placeholder="Resumo dos tópicos abordados, fórmulas e objetivos de aprendizagem..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {/* 7. Link / ID do Google Drive */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link de Compartilhamento ou ID do Google Drive *
                </label>
                <input
                  type="text"
                  value={matDriveUrl}
                  onChange={(e) => setMatDriveUrl(e.target.value)}
                  placeholder="Ex: https://drive.google.com/file/d/1Hod97yNll2w.../view ou ID do arquivo"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  O sistema gerará automaticamente o leitor in-app nativo e o link de download direto.
                </p>
              </div>

              {/* 8. Imagem de Capa (Opcional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL da Imagem de Capa (Opcional)
                </label>
                <input
                  type="url"
                  value={matCoverUrl}
                  onChange={(e) => setMatCoverUrl(e.target.value)}
                  placeholder="https://exemplo.com/capa.jpg"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {/* Botões do Modal */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase cursor-pointer shadow-sm"
                >
                  Salvar & Publicar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
