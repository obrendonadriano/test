import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initMetaPixel, trackPageView } from '../lib/meta';

export default function MetaPixel() {
  const location = useLocation();

  useEffect(() => {
    initMetaPixel();
  }, []);

  useEffect(() => {
    trackPageView();
  }, [location.pathname, location.search]);

  return null;
}
