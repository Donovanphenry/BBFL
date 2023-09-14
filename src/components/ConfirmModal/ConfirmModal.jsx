import {
  MouseEvent
} from "react";
import { useNavigate } from 'react-router-dom';
import './ConfirmModal.css';

export default function ConfirmModal(props) {
  const navigate = useNavigate();
  const { modal_state, setModalState } = props;
  function closeModal(e) {
    if (e.target === e.currentTarget) {
      navigate.push('/');
      setModalState(modal_state.Hidden);
    }
  }

  return (
    <div className='modalBackdrop' onClick={closeModal}>
      <div className='content'>
        <h2>Confirm your email</h2>
        <p>A confirmation email has been sent to your email address.</p>
        <button className='actionButton' onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
}
