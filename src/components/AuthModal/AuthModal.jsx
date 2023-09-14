import { useState } from "react";
import { ConfirmModal } from '../ConfirmModal';
import { LoginModal } from '../LoginModal';
import { RegisterModal } from '../RegisterModal';

export default function AuthModal(props) {
  const { modal_state, supabase } = props;
  const [modalState, setModalState] = useState(modal_state.Login);

  return (
    <>
      {modalState === modal_state.Confirm && <ConfirmModal
        modal_state={modal_state}
        setModalState={setModalState}
      />}
      {modalState === modal_state.Login && <LoginModal
        modal_state={modal_state}
        setModalState={setModalState}
        supabase={supabase}
      />}
      {modalState === modal_state.Register && <RegisterModal
        modal_state={modal_state}
        setModalState={setModalState}
        supabase={supabase}
      />}
    </>
  );
}
