// src/components/LoadingSpinner.tsx
// Un componente de spinner simple y autocontenido para mostrar durante los estados de carga.

const Spinner = () => (
  <>
    <style>
      {`
        .spinner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(7, 8, 10, 1);
          z-index: 9999;
        }
        
        .loading-spinner {
          border: 4px solid #0ae98a;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #13161c;
          
          animation: spin 1s ease infinite;
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}
    </style>
    <div className="spinner-overlay">
      <div className="loading-spinner" />
    </div>
  </>
);

export default Spinner;
