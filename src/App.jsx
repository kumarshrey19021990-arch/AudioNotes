import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/voice-journal.css";
import { LandingPage } from "./pages/LandingPage";
import { JournalPage } from "./pages/JournalPage";
import { RecordPage } from "./pages/RecordPage";
import { EntryPage } from "./pages/EntryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<JournalPage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/entries/:id" element={<EntryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
