import React from "react";
import "../css/Modal.css";

const Modal = ({ show, onClose, title, children, onConfirm, confirmText = "Save" }) => {
  return (
    <div className={`modal-backdrop ${show ? "show" : ""}`}>
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
         
        </div>

        <div className="modal-body">
          {children}
        </div>

        <div className="modal-footer">
          <button className="modal-action secondary" onClick={onClose}>Cancel</button>
          {onConfirm && <button className="modal-action primary" onClick={onConfirm}>{confirmText}</button>}
        </div>
      </div>
    </div>
  );
};

export default Modal;
