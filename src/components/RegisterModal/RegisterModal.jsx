import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  requestRegister,
} from './utils';

export default function RegisterModal(props) {
  const { modal_state, setModalState, supabase } = props;
  /*COMPONENT STATE*/
  const [formDetails, setFormDetails] = useState({
    email: "",
    password: "",
    confirm: "",
  });
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    confirm: "",
  });

  useEffect(() => {
    setFormDetails({ email: "", password: "", confirm: "" });
    setFormErrors({ email: "", password: "", confirm: "" });
  }, []);

  /*COMPONENT FUNCTIONS*/

  const handleRegister = useCallback(async () => {
    console.log("in handleRegister: requestRegister = ", requestRegister);
    let formErrors = await requestRegister(formDetails, supabase);
    if (formErrors) {
      setFormErrors(prev => ({ ...prev, ...formErrors }));
      return;
    }
    setModalState(modal_state.Confirm);
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
      if (e.key === "Enter") handleRegister();
    },
    [handleRegister],
  );

  function handleChange(e) {
    setFormDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  /*COMPONENT JSX*/
  return (
    <div className='modalBackdrop' onClick={closeModal}>
      <div className='content'>
        <h1 className='login-header'>Register</h1>
        <div className='inputSection'>
          <label className='login-param' htmlFor="email">Email</label>
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
            <label className='login-param' htmlFor="password">Password</label>
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
        <div className='inputSection'>
          <label className='login-param' htmlFor="confirm">Confirm Password</label>
          <input
            type="password"
            name="confirm"
            id="confirm"
            value={formDetails.confirm}
            onChange={handleChange}
            onKeyDown={handleKeyPressed}
          />
          {formErrors.confirm && <p className='error'>{formErrors.confirm}</p>}
        </div>
        <div className='buttonWrapper'>
          <button onClick={closeModal}>Cancel</button>
          <button className='actionButton' onClick={handleRegister}>
            Sign Up
          </button>
        </div>
        {/* Option to switch between login and register */}
        <button
          onClick={() => {
            setModalState(modal_state.Login);
          }}
          className='switchActions'
        >
          Already have an account?
        </button>
      </div>
    </div>
  );
}
