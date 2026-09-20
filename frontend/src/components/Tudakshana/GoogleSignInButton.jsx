import React, { useEffect, useRef, useState } from 'react';
import './GoogleSignInButton.css';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

const loadGoogleIdentityServices = () => {
  if (window.google?.accounts?.id) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const GoogleSignInButton = ({ onCredential, text = 'signin_with', disabled = false }) => {
  const buttonRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [loadError, setLoadError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) {
      setLoadError('Google Sign-In is not configured.');
      return undefined;
    }

    let active = true;
    loadGoogleIdentityServices()
      .then(() => {
        if (!active || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => callbackRef.current(response.credential),
          use_fedcm_for_prompt: true,
        });
        buttonRef.current.replaceChildren();
        const availableWidth = Math.min(buttonRef.current.clientWidth || 320, 360);
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'left',
          width: availableWidth,
        });
      })
      .catch(() => {
        if (active) setLoadError('Unable to load Google Sign-In.');
      });

    return () => {
      active = false;
    };
  }, [clientId, text]);

  if (loadError) {
    return <p className="google-auth-unavailable">{loadError}</p>;
  }

  return (
    <div className={`google-auth-button${disabled ? ' google-auth-button-disabled' : ''}`}>
      <div ref={buttonRef} />
    </div>
  );
};

export default GoogleSignInButton;
