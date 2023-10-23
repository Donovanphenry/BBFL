import { useState } from "react";
import { ConfirmModal } from '../ConfirmModal';
import { LoginModal } from '../LoginModal';
import { RegisterModal } from '../RegisterModal';

export default function AuthModal(props) {
  const { modal_state, setUserId, supabase, modalState, setModalState } = props;

  return (
    <>
      {modalState === modal_state.Confirm && <ConfirmModal
        modal_state={modal_state}
        setModalState={setModalState}
      />}
      {modalState === modal_state.Login && <LoginModal
        modal_state={modal_state}
        setModalState={setModalState}
        setUserId={setUserId}
        supabase={supabase}
      />}
      {modalState === modal_state.Register && <RegisterModal
        modal_state={modal_state}
        setModalState={setModalState}
        setUserId={setUserId}
        supabase={supabase}
      />}
    </>
  );
}
