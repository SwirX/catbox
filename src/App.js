import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LyraBuilder from "./pages/LyraApiBuilder";
import ImageRichTextExporter from "./pages/ImageExporter";
import ImageRichTextExporterHEXRLE from "./pages/ImageExporterV2";
import ImageRichTextExporterHEXRLEV2 from "./pages/ImageExporterV3";
import ListImporter from "./pages/ListImporterV2";
import JsonCleaner from "./pages/JsonCleaner";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lyra-api-builder" element={<LyraBuilder />} />
        <Route path="/list-importer" element={<ListImporter />} />
        <Route path="/image-exporter" element={<ImageRichTextExporter />} />
        <Route path="/image-exporter-v2" element={<ImageRichTextExporterHEXRLE />} />
        <Route path="/image-exporter-v3" element={<ImageRichTextExporterHEXRLEV2 />} />
        <Route path="/json-cleaner" element={<JsonCleaner />} />
      </Routes>
    </Layout>
  );
}