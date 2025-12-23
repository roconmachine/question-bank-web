import React from 'react';
import { LinkProps } from "react-router";
import { Link } from 'react-router';
import AccessProvider from './AccessProvider';

interface ProtectedLinkProps extends LinkProps {
  path: string;
}

function ProtectedLink({ path, ...linkProps }: ProtectedLinkProps) {

    //const navigate = useNavigate();


  const hasAccess = (() => {
    try {
      if(AccessProvider(path)){
        return true;
      }
    } catch (e) {
      //navigate('/');
    }
    return false;
  })();

  if (!hasAccess) {
    return null; // Return null instead of empty return
  }

  return <Link {...linkProps} />;
}

export default ProtectedLink;