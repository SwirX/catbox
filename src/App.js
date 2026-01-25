import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LyraBuilder from "./pages/LyraApiBuilder";
import ImageRichTextExporter from "./pages/ImageExporter";
import ImageRichTextExporterHEXRLE from "./pages/ImageExporterV2";
import ImageRichTextExporterHEXRLEV2 from "./pages/ImageExporterV3";
import ListImporter from "./pages/ListImporterV3";
import JsonCleaner from "./pages/JsonCleaner";
import Layout from "./components/Layout";
import ScriptEditor from "./pages/ScriptEditor";
import RichTextEditor from "./pages/RichtextEditor";
import AIDocsPage from "./pages/AIDocsPage";
import FigmaExporter from "./pages/FigmaExporter";

export default function App() {
  return (
    <Routes>
      {/* Script Editor with its own layout handling for fullscreen */}
      <Route path="/script-editor" element={<ScriptEditor />} />

      {/* All other routes with Layout */}
      <Route path="*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lyra-api-builder" element={<LyraBuilder />} />
            <Route path="/list-importer" element={<ListImporter />} />
            <Route path="/image-exporter" element={<ImageRichTextExporter />} />
            <Route path="/image-exporter-v2" element={<ImageRichTextExporterHEXRLE />} />
            <Route path="/image-exporter-v3" element={<ImageRichTextExporterHEXRLEV2 />} />
            <Route path="/json-cleaner" element={<JsonCleaner />} />
            <Route path="/rich-text-editor" element={<RichTextEditor />} />
            <Route path="/ai-docs" element={<AIDocsPage />} />
            <Route path="/figma-exporter" element={<FigmaExporter />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
}