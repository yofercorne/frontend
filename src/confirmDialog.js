import React from 'react';
import { toast } from 'react-toastify';
import './confirmDialog.css';

const ConfirmDialog = ({ onConfirm, onCancel }) => (
  <div className="confirm-dialog">
    <p className="confirm-dialog-message">Are you sure you want to delete this service?</p>
    <div className="confirm-dialog-actions">
      <button className="btn btn-primary confirm-dialog-btn" onClick={onConfirm}>Aceptar</button>
      <button className="btn btn-secondary confirm-dialog-btn" onClick={onCancel}>Cancelar</button>
    </div>
  </div>
);

export const showConfirmDialog = (onConfirm) => {
  toast.info(
    <ConfirmDialog
      onConfirm={() => {
        onConfirm();
        toast.dismiss();
      }}
      onCancel={() => toast.dismiss()}
    />,
    { autoClose: false, className: 'confirm-dialog-toast' }
  );
};

export default ConfirmDialog;
