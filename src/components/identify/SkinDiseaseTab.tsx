'use client';

import { useState, useRef, useCallback } from 'react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { identifyStrings, type Language } from '@/locales/identify';
import {
  translateDiseaseName,
  translateDiseaseDescription,
  type Language as TranslateLanguage,
} from '@/lib/translate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  ScanLine,
  AlertTriangle,
  X,
  TrendingUp,
  FileImage,
} from 'lucide-react';

interface SkinResult {
  disease: string;
  confidence: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function SkinDiseaseTab() {
  const { language } = useChatLanguage();
  const lang = language as Language;
  const t = identifyStrings[lang] || identifyStrings.en;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SkinResult | null>(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or WEBP images.');
      return;
    }
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setError('');
    setResult(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyse = async () => {
    if (!selectedFile) {
      setError(t.noImage);
      return;
    }

    setError('');
    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/skin-disease', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || t.errorGeneric);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileImage className="h-5 w-5 text-purple-500" />
            {t.detectedDisease}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            className="hidden"
            id="skin-image-upload"
          />

          {!previewUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-purple-500 bg-purple-50 scale-[1.02]'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
              }`}
            >
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                isDragOver ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <Upload className={`h-8 w-8 transition-colors ${isDragOver ? 'text-purple-500' : 'text-gray-400'}`} />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-1">{t.uploadZoneText}</p>
              <p className="text-sm text-gray-500 mb-3">{t.uploadZoneSubtext}</p>
              <p className="text-xs text-gray-400">{t.uploadFormats}</p>
              <Button variant="outline" size="sm" className="mt-4 pointer-events-none">
                <Upload className="mr-2 h-4 w-4" />
                {t.browseFiles}
              </Button>
            </div>
          ) : (
            <div className="relative group">
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                <img
                  src={previewUrl}
                  alt={t.imagePreview}
                  className="w-full max-h-80 object-contain mx-auto"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {t.changeImage}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearImage}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Analyse Button */}
      <Button
        id="analyse-skin-button"
        onClick={handleAnalyse}
        disabled={isLoading || !selectedFile}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t.analysing}
          </>
        ) : (
          <>
            <ScanLine className="mr-2 h-5 w-5" />
            {t.analyseButton}
          </>
        )}
      </Button>

      {/* Result Card */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                {t.resultTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Disease Name */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t.detectedDisease}</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {translateDiseaseName(result.disease, lang as TranslateLanguage, 'skin')}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t.confidence}</p>
                  <span className={`text-2xl font-bold ${getConfidenceColor(result.confidence)}`}>
                    {result.confidence.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getConfidenceBarColor(result.confidence)}`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              {translateDiseaseDescription(result.disease, lang as TranslateLanguage) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{t.description}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {translateDiseaseDescription(result.disease, lang as TranslateLanguage)}
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 leading-relaxed">{t.disclaimer}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
