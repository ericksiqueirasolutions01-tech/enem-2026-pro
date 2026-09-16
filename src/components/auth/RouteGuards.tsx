import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User, StudentProfile } from '../../types';

interface RouteGuardProps {
  currentUser: User | null;
  profile?: StudentProfile | null;
  children: React.ReactElement;
}

/**
 * Exige que o usuário esteja autenticado.
 * Se não autenticado, redireciona para /login.
 */
export const ProtectedRoute: React.FC<RouteGuardProps> = ({ currentUser, children }) => {
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Exige que o usuário seja ALUNO e esteja APROVADO pela coordenação.
 * Se estiver pendente ou reprovado, redireciona para /aguardando-aprovacao.
 * Se ainda não tiver concluído onboarding, redireciona para /onboarding.
 */
export const ApprovedOnlyRoute: React.FC<RouteGuardProps> = ({ currentUser, profile, children }) => {
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser.status === 'PENDENTE_APROVACAO' || currentUser.status === 'REPROVADO' || currentUser.status === 'BLOQUEADO') {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  // Administrador tem livre acesso
  if (currentUser.role === 'ADMINISTRADOR') {
    return children;
  }

  // Se o aluno ainda não completou o onboarding
  if (profile && !profile.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

/**
 * Exige que o usuário seja ADMINISTRADOR e esteja APROVADO.
 * Se não for admin, redireciona para /app (dashboard do aluno).
 */
export const AdminOnlyRoute: React.FC<RouteGuardProps> = ({ currentUser, children }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'ADMINISTRADOR' || currentUser.status !== 'APROVADO') {
    return <Navigate to="/app" replace />;
  }

  return children;
};

