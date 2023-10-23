import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import './LoginModal.css';
import {
  requestLogin
} from './utils';

export default function LoginModal(props) {
  const { modal_state, setModalState, setUserId, supabase } = props;

  /*COMPONENT STATE*/
  const [formDetails, setFormDetails] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setFormDetails({ email: "", password: "" });
    setFormErrors({ email: "", password: "" });
  }, []);

  /*COMPONENT FUNCTIONS*/

  const handleLogin = useCallback(async () => {
    let [data, errors] = await requestLogin(formDetails, supabase);
    if (errors) {
      setFormErrors(prev => ({ ...prev, ...errors }));
      return;
    }
    setModalState(modal_state.Hidden);
    setUserId(data.user.id);
  }, [formDetails, supabase, setModalState]);

  const handleKeyPressed = useCallback(
    (e) => {
      if (e.key === "Enter") handleLogin();
    },
    [handleLogin],
  );

  function handleChange(e) {
    setFormDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  /*COMPONENT JSX*/
  return (
    <div className='modalBackdrop'>
      <div className='content'>
        <h1 className = 'login-header'>Login</h1>
        <div className='inputSection'>
          <label className = 'login-param' htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formDetails.email}
            onChange={handleChange}
            onKeyDown={handleKeyPressed}
            className='login-input'
          />
          {formErrors.email && <p className='error'>{formErrors.email}</p>}
        </div>
        <div className='inputSection'>
          <div className='passwordLabels'>
            <label className = 'login-param' htmlFor="password">Password</label>
            <a href="#">Forgot Password</a>
          </div>
          <input
            type="password"
            name="password"
            id="password"
            value={formDetails.password}
            onChange={handleChange}
            onKeyDown={handleKeyPressed}
            className='login-input'
          />
          {formErrors.password && <p className='error'>{formErrors.password}</p>}
        </div>
        <div className='buttonWrapper'>
          <button className='login-button'>Cancel</button>
          <button className='actionButton' onClick={handleLogin}>
            Sign in
          </button>
        </div>
        {/* Option to switch between login and register */}
        <button
          onClick={() => {
            setModalState(modal_state.Register);
          }}
          className='login-button'
        >
          {"Don't have an account?"}
        </button>
      </div>
    </div>
  );
}
