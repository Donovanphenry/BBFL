import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  useNavigate
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

  useEffect(() => {
    const { data: { subscription : authListener } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session) {
          navigate('/');
        }
      } else {
        navigate('/login');
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <div className='modalBackdrop'>
      <header>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google']}
        />
      </header>
    </div>
  );
}
