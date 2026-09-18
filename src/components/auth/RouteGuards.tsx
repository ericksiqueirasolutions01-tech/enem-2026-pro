import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User, StudentProfile } from '../../types';
import { paymentRepository } from '../../services/repositories/paymentRepository';

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
 * GATE 1, 2, 3: Exige que o usuário seja ALUNO e esteja com ACESSO PREMIUM ATIVO
 * comprovado por evidência server-side de pagamento ou seja administrador oficial.
 *
 * FAIL-CLOSED:
 * - Sem login -> /login
 * - Status pendente/reprovado/bloqueado -> /aguardando-aprovacao
 * - localStorage manipulado sem pedido pago no backend -> /aguardando-aprovacao
 * - Erro de rede ou validação falha -> /aguardando-aprovacao
 */
export const ApprovedOnlyRoute: React.FC<RouteGuardProps> = ({ currentUser, profile, children }) => {
  const location = useLocation();
  const [entitlementState, setEntitlementState] = useState<'CHECKING' | 'ALLOWED' | 'DENIED'>('CHECKING');

  useEffect(() => {
    let isMounted = true;

    if (!currentUser) {
      setEntitlementState('DENIED');
      return;
    }

    // Administrador oficial tem acesso garantido
    if (currentUser.role === 'ADMINISTRADOR') {
      const emailLower = (currentUser.email || '').toLowerCase().trim();
      if (
        (emailLower === 'ericksiqueiraa@gmail.com' || emailLower === 'ericksiqueiraaa@gmail.com') &&
        currentUser.status === 'APROVADO'
      ) {
        setEntitlementState('ALLOWED');
        return;
      }
    }

    // Aluno: validação server-side obrigatória de pedido PAID
    paymentRepository
      .verifyAccessEntitlement(currentUser)
      .then((res) => {
        if (isMounted) {
          if (res.isEntitled) {
            setEntitlementState('ALLOWED');
          } else {
            setEntitlementState('DENIED');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setEntitlementState('DENIED');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, currentUser?.email, currentUser?.status, currentUser?.role]);

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    currentUser.status === 'PENDENTE_APROVACAO' ||
    currentUser.status === 'REPROVADO' ||
    currentUser.status === 'BLOQUEADO'
  ) {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  // Enquanto valida a evidência no servidor, renderiza o fallback de segurança (nunca libera por antecipação)
  if (entitlementState === 'CHECKING') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400">Verificando autorização de acesso...</span>
      </div>
    );
  }

  // Se a validação server-side negou o acesso (não há pedido pago), bloqueia imediatamente
  if (entitlementState === 'DENIED') {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  // Se o aluno ainda não completou o onboarding, redireciona estritamente para /onboarding
  const isOnboardingPending = !profile || !profile.onboardingCompleted || !profile.targetCourse;
  if (currentUser.role === 'ALUNO' && isOnboardingPending && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

/**
 * Exige que o usuário seja ADMINISTRADOR oficial e esteja APROVADO.
 * Se não for admin oficial, redireciona para /app ou /login.
 */
export const AdminOnlyRoute: React.FC<RouteGuardProps> = ({ currentUser, children }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const emailLower = (currentUser.email || '').toLowerCase().trim();
  const isAdmin =
    (emailLower === 'ericksiqueiraa@gmail.com' || emailLower === 'ericksiqueiraaa@gmail.com') &&
    currentUser.role === 'ADMINISTRADOR' &&
    currentUser.status === 'APROVADO';

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return children;
};

