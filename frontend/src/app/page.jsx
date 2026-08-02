'use client'

import { useState } from 'react';

import './MFA.css'
import Register from '@/components/register';
import Login from '@/components/login';


export default function Home() {
  const [action, setAction] = useState(1)
  return (
    <>
    <div className="mfa-general-container">
      {action == 1 &&(<Login onAction={(a)=> setAction(a)}/>)}
      {action == 2 &&(<Register onAction={(a)=> setAction(a)}/>)}
    </div>
    </>
  );
}
