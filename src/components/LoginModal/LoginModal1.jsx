import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  useLocation,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import './LoginModal.css';
import {
  requestLogin
} from './utils';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '/src/Utils/supabase-helpers';

export default function LoginModal(props) {
  const { modal_state, setModalState, setUserId } = props;
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const { data: { subscription : authListener } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        navigate(loc.state?.from?.pathname || '/');
      }

      if (event === "INITIAL_SESSION") {
        if (session) {
          navigate(loc.state?.from?.pathname || '/');
        }
      }

      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const REDIRECT_URL = window.location.origin + '/';

  return (
    <div className='modalBackdrop'>
      <header>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google']}
          redirectTo={REDIRECT_URL}
        />
      </header>
    </div>
  );
}
