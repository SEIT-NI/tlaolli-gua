import { useEffect, useRef, useState, useLayoutEffect } from 'react';

function useScript(src) {
  const [status, setStatus] = useState(src ? 'loading' : 'idle');

  useEffect(() => {
    if (!src) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('idle');
      return;
    }

    let script = document.querySelector(`script[src="${src}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.setAttribute('data-status', 'loading');
      document.body.appendChild(script);

      const setAttributeFromEvent = (event) => {
        script.setAttribute('data-status', event.type === 'load' ? 'ready' : 'error');
      };
      script.addEventListener('load', setAttributeFromEvent);
      script.addEventListener('error', setAttributeFromEvent);
    } else {
      setStatus(script.getAttribute('data-status') || 'loading');
    }

    const setStateFromEvent = (event) => {
      setStatus(event.type === 'load' ? 'ready' : 'error');
    };

    script.addEventListener('load', setStateFromEvent);
    script.addEventListener('error', setStateFromEvent);

    return () => {
      if (script) {
        script.removeEventListener('load', setStateFromEvent);
        script.removeEventListener('error', setStateFromEvent);
      }
    };
  }, [src]);

  return status;
}

export function ReactCusdis(props) {
  const divRef = useRef(null);
  const host = props.attrs.host || 'https://cusdis.com';

  const scriptStatus = useScript(`${host}/js/cusdis.es.js`);
  const langStatus = useScript(props.lang ? `${host}/js/widget/lang/${props.lang}.js` : null);

  useLayoutEffect(() => {
    const render = window.renderCusdis;
    
    // Si se especificó un idioma, esperar a que su script cargue primero
    const isLangReady = !props.lang || langStatus === 'ready';
    
    if (render && divRef.current && isLangReady) {
      render(divRef.current);
    }
  }, [
    props.attrs.appId,
    props.attrs.host,
    props.attrs.pageId,
    props.attrs.pageTitle,
    props.attrs.pageUrl,
    props.lang,
    scriptStatus,
    langStatus
  ]);

  return (
    <div
      id="cusdis_thread"
      data-host={host}
      data-page-id={props.attrs.pageId}
      data-app-id={props.attrs.appId}
      data-page-title={props.attrs.pageTitle}
      data-page-url={props.attrs.pageUrl}
      data-theme={props.attrs.theme}
      style={props.style}
      ref={divRef}
    />
  );
}
