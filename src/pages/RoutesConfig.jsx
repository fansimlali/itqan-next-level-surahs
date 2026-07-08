import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NextLevelSurahsPage from './pages/NextLevelSurahsPage';
import CurriculumDebugPage from './pages/CurriculumDebugPage';
import DiagnosticPage from './pages/DiagnosticPage';

// جزء مبسط من main.jsx يتضمن المسارات

const Routes_Content = (
  <>
    {/* خطا الصيانة والتشخيص */}
    <Route path="/next-level-surahs" element={<NextLevelSurahsPage />} />
    <Route path="/curriculum-debug" element={<CurriculumDebugPage />} />
    <Route path="/diagnostic" element={<DiagnosticPage />} />
  </>
);

export default Routes_Content;