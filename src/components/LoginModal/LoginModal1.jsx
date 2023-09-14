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
  const { modal_state, setModalState, supabase } = props;

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
    console.log("Before login");
    let errors = await requestLogin(formDetails, supabase);
    console.log("After login");
    if (errors) {
      setFormErrors(prev => ({ ...prev, ...errors }));
      return;
    }
    setModalState(modal_state.Hidden);
  }, [formDetails, supabase, setModalState]);

  const closeModal = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        setModalState(modal_state.Hidden);
      }
    },
    [setModalState],
  );

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
    <div className='modalBackdrop' onClick={closeModal}>
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
          />
          {formErrors.password && <p className='error'>{formErrors.password}</p>}
        </div>
        <div className='buttonWrapper'>
          <button onClick={closeModal}>Cancel</button>
          <button className='actionButton' onClick={handleLogin}>
            Sign in
          </button>
        </div>
        {/* Option to switch between login and register */}
        <button
          onClick={() => {
            setModalState(modal_state.Register);
          }}
          className='switchActions'
        >
          {"Don't have an account?"}
        </button>
      </div>
    </div>
  );
}
