import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { db } from './db/storage';
import { authRepository } from './services/repositories/authRepository';
import { User, StudentProfile } from './types';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, ApprovedOnlyRoute, AdminOnlyRoute } from './components/auth/RouteGuards';

// Eager loaded public pages
import { LandingPage } from './pages/public/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PendingApproval } from './pages/auth/PendingApproval';
import { Onboarding } from './pages/auth/Onboarding';
import { PaymentSuccess } from './pages/public/PaymentSuccess';
import { PaymentPending } from './pages/public/PaymentPending';

// Student Core Pages
import { Dashboard } from './pages/student/Dashboard';
import { MateriasHome } from './pages/estudos/MateriasHome';
import { MateriaDetalhe } from './pages/estudos/MateriaDetalhe';
import { EtecHome } from './pages/etec/EtecHome';
import { BancoQuestoes } from './pages/questoes/BancoQuestoes';
import { SimuladosList } from './pages/simulados/SimuladosList';
import { OutrosVestibulares } from './pages/vestibulares/OutrosVestibulares';
import { SimuladoResult } from './pages/simulados/SimuladoResult';
import { RedacaoHome } from './pages/redacao/RedacaoHome';
import { RedacaoReport } from './pages/redacao/RedacaoReport';
import { PlanoEstudos } from './pages/estudos/PlanoEstudos';
import { CadernoErros } from './pages/questoes/CadernoErros';
import { MeuDesempenho } from './pages/estudos/MeuDesempenho';
import { MetasEstudos } from './pages/estudos/MetasEstudos';
import { Evolucao } from './pages/estudos/Evolucao';
import { PomodoroTimer } from './pages/estudos/PomodoroTimer';
import { Conquistas } from './pages/estudos/Conquistas';
import { Favoritos } from './pages/estudos/Favoritos';
import { Perfil } from './pages/estudos/Perfil';

// Lazy-loaded heavy modules (Code-splitting para performance e chunk admin isolado)
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const BibliotecaDrive = lazy(() =>
  import('./pages/estudos/BibliotecaDrive').then((m) => ({ default: m.BibliotecaDrive }))
);
const SimuladoExam = lazy(() =>
  import('./pages/simulados/SimuladoExam').then((m) => ({ default: m.SimuladoExam }))
);
const RedacaoEditor = lazy(() =>
  import('./pages/redacao/RedacaoEditor').then((m) => ({ default: m.RedacaoEditor }))
);

// Route Param Adapters
const SimuladoExamRoute = ({ onNavigate }: { onNavigate: (route: string, params?: Record<string, string>) => void }) => {
  const { simuladoId } = useParams<{ simuladoId?: string }>();
  return <SimuladoExam simuladoId={simuladoId || 'sim-sas-2026-d1'} onNavigate={onNavigate} />;
};

const SimuladoResultRoute = ({ onNavigate }: { onNavigate: (route: string, params?: Record<string, string>) => void }) => {
  const { attemptId } = useParams<{ attemptId?: string }>();
  return <SimuladoResult attemptId={attemptId || ''} onNavigate={onNavigate} />;
};

const RedacaoEditorRoute = ({ onNavigate }: { onNavigate: (route: string, params?: Record<string, string>) => void }) => {
  const { topicId } = useParams<{ topicId?: string }>();
  return <RedacaoEditor topicId={topicId || 'top-1'} onNavigate={onNavigate} />;
};

const RedacaoReportRoute = ({ onNavigate }: { onNavigate: (route: string, params?: Record<string, string>) => void }) => {
  const { essayId } = useParams<{ essayId?: string }>();
  return <RedacaoReport essayId={essayId || ''} onNavigate={onNavigate} />;
};

// Loading Fallback Component
const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
    <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
    <span className="text-xs font-bold text-slate-400">Carregando ambiente...</span>
  </div>
);

// 404 Not Found Page
const NotFoundPage = ({ onNavigate }: { onNavigate: (route: string) => void }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
    <div className="text-5xl font-black text-brand-500">404</div>
    <h2 className="text-xl font-bold text-white">Página Não Encontrada</h2>
    <p className="text-xs text-slate-400 max-w-sm">
      O endereço que você tentou acessar não existe ou mudou de local.
    </p>
    <button
      onClick={() => onNavigate('dashboard')}
      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-brand-600/20"
    >
      Voltar para o Início
    </button>
  </div>
);

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getCurrentUser());
  const [profile, setProfile] = useState<StudentProfile | null>(() =>
    currentUser ? db.getStudentProfile(currentUser.id) : null
  );

  useEffect(() => {
    // Redireciona qualquer acesso vindo de domínios preview/temporários para o domínio oficial de produção
    if (
      typeof window !== 'undefined' &&
      window.location.hostname.includes('vercel.app') &&
      window.location.hostname !== 'enem-2026-pro.vercel.app'
    ) {
      window.location.replace(`https://enem-2026-pro.vercel.app${window.location.pathname}${window.location.search}`);
      return;
    }

    // Sincroniza sessão inicial via authRepository
    authRepository.getCurrentSessionUser().then((user) => {
      if (user) {
        db.setCurrentUser(user, true);
        setCurrentUser(user);
        setProfile(db.getStudentProfile(user.id));
      }
    });

    // Carrega tema preferido
    const savedTheme = localStorage.getItem('enem2026_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return db.subscribe(() => {
      const user = db.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setProfile(db.getStudentProfile(user.id));
      }
    });
  }, []);

  // Mapeia caminho atual da URL para a rota legada para compatibilidade com Layout/Sidebar
  const getLegacyRouteName = (pathname: string): string => {
    if (pathname === '/' || pathname === '') return 'landing';
    if (pathname === '/login') return 'login';
    if (pathname === '/cadastro') return 'cadastro';
    if (pathname === '/aguardando-aprovacao') return 'pending-approval';
    if (pathname === '/onboarding') return 'onboarding';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname === '/app' || pathname === '/app/') return 'dashboard';
    if (pathname.includes('/materias') || pathname.includes('/biblioteca')) return 'materias';
    if (pathname.includes('/etec')) return 'etec';
    if (pathname.includes('/vestibulares')) return 'vestibulares';
    if (pathname.includes('/questoes')) return 'questoes';
    if (pathname.includes('/caderno-erros')) return 'erros';
    if (pathname.includes('/simulados')) return 'simulados';
    if (pathname.includes('/redacao')) return 'redacao';
    if (pathname.includes('/plano')) return 'plano';
    if (pathname.includes('/desempenho')) return 'desempenho';
    if (pathname.includes('/metas')) return 'metas';
    if (pathname.includes('/evolucao')) return 'evolucao';
    if (pathname.includes('/pomodoro')) return 'pomodoro';
    if (pathname.includes('/conquistas')) return 'conquistas';
    if (pathname.includes('/favoritos')) return 'favoritos';
    if (pathname.includes('/perfil')) return 'perfil';
    return 'dashboard';
  };

  const currentRouteName = getLegacyRouteName(location.pathname);

  // Navegador universal mantendo 100% de retrocompatibilidade com todas as chamadas legadas onNavigate
  const handleNavigate = (route: string, params?: Record<string, string>) => {
    const p = params || {};
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (route) {
      case 'landing':
        navigate('/');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'cadastro':
        navigate('/cadastro');
        break;
      case 'pending-approval':
        navigate('/aguardando-aprovacao');
        break;
      case 'onboarding':
        navigate('/onboarding');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'dashboard':
        navigate('/app');
        break;
      case 'materias':
      case 'estudos':
      case 'estudar':
      case 'biblioteca':
      case 'drive':
      case 'apostilas':
        navigate('/app/biblioteca');
        break;
      case 'etec':
        navigate('/app/etec');
        break;
      case 'vestibulares':
        navigate('/app/vestibulares');
        break;
      case 'questoes':
        navigate('/app/questoes');
        break;
      case 'erros':
        navigate('/app/caderno-erros');
        break;
      case 'simulados':
        navigate('/app/simulados');
        break;
      case 'simulado_run':
      case 'simulado-exam':
        navigate(`/app/simulados/${p.simuladoId || 'sim-sas-2026-d1'}/fazer`);
        break;
      case 'simulado_result':
      case 'simulado-result':
        navigate(`/app/simulados/${p.attemptId || 'default'}/resultado`);
        break;
      case 'redacao':
        navigate('/app/redacao');
        break;
      case 'redacao_write':
      case 'redacao-editor':
        navigate('/app/redacao/editor');
        break;
      case 'redacao_report':
      case 'redacao-report':
        navigate('/app/redacao/relatorio');
        break;
      case 'plano':
        navigate('/app/plano');
        break;
      case 'desempenho':
      case 'evolucao':
        navigate('/app/desempenho');
        break;
      case 'metas':
        navigate('/app/metas');
        break;
      case 'pomodoro':
        navigate('/app/pomodoro');
        break;
      case 'conquistas':
        navigate('/app/conquistas');
        break;
      case 'favoritos':
        navigate('/app/favoritos');
        break;
      case 'perfil':
        navigate('/app/perfil');
        break;
      default:
        navigate('/app');
        break;
    }
  };

  const handleLoginSuccess = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    if (!user) {
      navigate('/login');
    } else if (user.role === 'ADMINISTRADOR' && user.status === 'APROVADO') {
      navigate('/admin');
    } else if (user.status === 'PENDENTE_APROVACAO' || user.status === 'REPROVADO') {
      navigate('/aguardando-aprovacao');
    } else {
      // Aluno: destino padrão até validação de pagamento é /aguardando-aprovacao
      navigate('/aguardando-aprovacao');
    }
  };

  return (
    <AppLayout
      currentUser={currentUser}
      currentRoute={currentRouteName}
      onNavigate={handleNavigate}
    >
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
          <Route
            path="/login"
            element={
              currentUser && currentUser.role === 'ADMINISTRADOR' && currentUser.status === 'APROVADO' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/cadastro"
            element={
              currentUser && currentUser.role === 'ADMINISTRADOR' && currentUser.status === 'APROVADO' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Register onNavigate={handleNavigate} onRegisterSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/aguardando-aprovacao"
            element={
              <PendingApproval currentUser={currentUser} onNavigate={handleNavigate} />
            }
          />

          {/* Rotas Públicas de Retorno de Pagamento (Gate 10) */}
          <Route
            path="/payment/success"
            element={<PaymentSuccess />}
          />
          <Route
            path="/payment/pending"
            element={<PaymentPending />}
          />

          {/* Onboarding do Aluno (Exige pagamento confirmado via ApprovedOnlyRoute) */}
          <Route
            path="/onboarding"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <Onboarding currentUser={currentUser} onComplete={() => handleNavigate('dashboard')} />
              </ApprovedOnlyRoute>
            }
          />

          {/* Painel Administrativo Protegido (Chunk isolado sob demanda) */}
          <Route
            path="/admin"
            element={
              <AdminOnlyRoute currentUser={currentUser}>
                <AdminDashboard currentUser={currentUser} onNavigate={handleNavigate} />
              </AdminOnlyRoute>
            }
          />

          {/* Rotas Protegidas do Aluno Aprovado */}
          <Route
            path="/app"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <Dashboard currentUser={currentUser} onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/materias"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <MateriasHome onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/materias/:id"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <MateriaDetalhe onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/biblioteca"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <BibliotecaDrive onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/etec"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <EtecHome onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/vestibulares"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <OutrosVestibulares onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/questoes"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <BancoQuestoes onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/caderno-erros"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <CadernoErros onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/simulados"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <SimuladosList onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/simulados/:simuladoId/fazer"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <SimuladoExamRoute onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/simulados/:attemptId/resultado"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <SimuladoResultRoute onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/redacao"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <RedacaoHome onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/redacao/editor"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <RedacaoEditorRoute onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/redacao/relatorio"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <RedacaoReportRoute onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/plano"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <PlanoEstudos onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/desempenho"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <MeuDesempenho onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/metas"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <MetasEstudos onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/evolucao"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <Evolucao />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/pomodoro"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <PomodoroTimer onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/conquistas"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <Conquistas currentUser={currentUser} onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/favoritos"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <Favoritos currentUser={currentUser} onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />
          <Route
            path="/app/perfil"
            element={
              <ApprovedOnlyRoute currentUser={currentUser} profile={profile}>
                <Perfil currentUser={currentUser} onNavigate={handleNavigate} />
              </ApprovedOnlyRoute>
            }
          />

          {/* Rota 404 */}
          <Route path="*" element={<NotFoundPage onNavigate={handleNavigate} />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
