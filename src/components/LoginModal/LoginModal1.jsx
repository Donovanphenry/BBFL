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
import { createClient } from "@supabase/supabase-js";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const api_key = import.meta.env.VITE_REACT_APP_SUPABASE_API_KEY;
const api_url = import.meta.env.VITE_REACT_APP_SUPABASE_API_URL;
const supabase = createClient(api_url, api_key);

export default function LoginModal(props) {
  const { modal_state, setModalState, setUserId } = props;
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN") {
        navigate('/');
      } else {
        navigate('/login');
      }
    });
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
