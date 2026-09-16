import React, { useState, useEffect } from 'react';
import { db } from './db/storage';
import { User, StudentProfile } from './types';
import { AppLayout } from './components/layout/AppLayout';

// Auth & Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PendingApproval } from './pages/auth/PendingApproval';
import { Onboarding } from './pages/auth/Onboarding';

// Student Pages
import { Dashboard } from './pages/student/Dashboard';
import { MateriasHome } from './pages/estudos/MateriasHome';
import { MateriaDetalhe } from './pages/estudos/MateriaDetalhe';
import { EtecHome } from './pages/etec/EtecHome';
import { AreaEstudos } from './pages/estudos/AreaEstudos';
import { BancoQuestoes } from './pages/questoes/BancoQuestoes';
import { SimuladosList } from './pages/simulados/SimuladosList';
import { OutrosVestibulares } from './pages/vestibulares/OutrosVestibulares';
import { SimuladoExam } from './pages/simulados/SimuladoExam';
import { SimuladoResult } from './pages/simulados/SimuladoResult';
import { RedacaoHome } from './pages/redacao/RedacaoHome';
import { RedacaoEditor } from './pages/redacao/RedacaoEditor';
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
import { BibliotecaDrive } from './pages/estudos/BibliotecaDrive';

// Admin Page
import { AdminDashboard } from './pages/admin/AdminDashboard';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getCurrentUser());
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const user = db.getCurrentUser();
    if (!user) return 'landing';
    if (user.status === 'PENDENTE_APROVACAO') return 'pending-approval';
    if (user.role === 'ADMINISTRADOR') return 'admin';
    const profile = db.getStudentProfile(user.id);
    if (profile && !profile.onboardingCompleted) return 'onboarding';
    return 'dashboard';
  });
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  useEffect(() => {
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
      if (user && user.status === 'PENDENTE_APROVACAO') {
        setCurrentRoute('pending-approval');
      }
    });
  }, []);

  const handleNavigate = (route: string, params?: Record<string, string>) => {
    if (params) {
      setRouteParams(params);
    } else {
      setRouteParams({});
    }

    // Regras de guarda de rotas
    if (currentUser?.status === 'PENDENTE_APROVACAO' && route !== 'login' && route !== 'landing') {
      setCurrentRoute('pending-approval');
      return;
    }

    if (route === 'admin' && currentUser?.role !== 'ADMINISTRADOR') {
      setCurrentRoute('dashboard');
      return;
    }

    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    if (!user) {
      setCurrentRoute('landing');
    } else if (user.status === 'PENDENTE_APROVACAO') {
      setCurrentRoute('pending-approval');
    } else if (user.role === 'ADMINISTRADOR') {
      setCurrentRoute('admin');
    } else {
      setCurrentRoute('dashboard');
    }
  };

  // Se não autenticado
  if (!currentUser) {
    return (
      <AppLayout
        currentUser={null}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
      >
        {currentRoute === 'cadastro' ? (
          <Register
            onNavigate={handleNavigate}
            onRegisterSuccess={handleLoginSuccess}
          />
        ) : currentRoute === 'login' ? (
          <Login
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} />
        )}
      </AppLayout>
    );
  }

  // Usuário pendente de aprovação (Regra de segurança Seção 5 e 15)
  if (currentUser.status === 'PENDENTE_APROVACAO' && currentRoute !== 'landing') {
    return (
      <AppLayout
        currentUser={currentUser}
        currentRoute="pending-approval"
        onNavigate={handleNavigate}
      >
        <PendingApproval
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />
      </AppLayout>
    );
  }

  // Renderizador de rotas autenticadas
  const renderContent = () => {
    switch (currentRoute) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;

      case 'pending-approval':
        return (
          <PendingApproval
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'onboarding':
        return (
          <Onboarding
            currentUser={currentUser}
            onComplete={() => handleNavigate('dashboard')}
          />
        );

      case 'admin':
        if (currentUser.role !== 'ADMINISTRADOR') {
          return <Dashboard currentUser={currentUser} onNavigate={handleNavigate} />;
        }
        return (
          <AdminDashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'dashboard':
        return (
          <Dashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'materias':
      case 'estudos':
      case 'estudar':
      case 'biblioteca':
      case 'drive':
      case 'apostilas':
        return (
          <BibliotecaDrive
            onNavigate={handleNavigate}
            initialCategory={routeParams.category || 'TODAS'}
            initialArea={routeParams.areaId as any}
          />
        );

      case 'etec':
        return <EtecHome onNavigate={handleNavigate} />;

      case 'vestibulares':
        return <OutrosVestibulares onNavigate={handleNavigate} />;

      case 'questoes':
        return (
          <BancoQuestoes
            onNavigate={handleNavigate}
            initialQuestionId={routeParams.questionId}
          />
        );

      case 'simulados':
        return <SimuladosList onNavigate={handleNavigate} />;

      case 'simulado_run':
      case 'simulado-exam':
        return (
          <SimuladoExam
            simuladoId={routeParams.simuladoId || 'sim-sas-2026-d1'}
            onNavigate={handleNavigate}
          />
        );

      case 'simulado_result':
      case 'simulado-result':
        return (
          <SimuladoResult
            attemptId={routeParams.attemptId || ''}
            onNavigate={handleNavigate}
          />
        );

      case 'redacao':
        return <RedacaoHome onNavigate={handleNavigate} />;

      case 'redacao_write':
      case 'redacao-editor':
        return (
          <RedacaoEditor
            topicId={routeParams.topicId || 'top-1'}
            onNavigate={handleNavigate}
          />
        );

      case 'redacao_report':
      case 'redacao-report':
        return (
          <RedacaoReport
            essayId={routeParams.essayId || ''}
            onNavigate={handleNavigate}
          />
        );

      case 'plano':
        return <PlanoEstudos onNavigate={handleNavigate} />;

      case 'desempenho':
      case 'evolucao':
        return <MeuDesempenho onNavigate={handleNavigate} />;

      case 'erros':
        return <CadernoErros onNavigate={handleNavigate} />;

      case 'metas':
        return <MetasEstudos onNavigate={handleNavigate} />;

      case 'pomodoro':
        return <PomodoroTimer onNavigate={handleNavigate} />;

      case 'conquistas':
        return (
          <Conquistas
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'favoritos':
        return (
          <Favoritos
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case 'perfil':
        return (
          <Perfil
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <Dashboard
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <AppLayout
      currentUser={currentUser}
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </AppLayout>
  );
}

export default App;
