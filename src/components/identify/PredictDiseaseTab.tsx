'use client';

import { useState, useMemo, useRef } from 'react';
import { useChatLanguage } from '@/hooks/use-chat-language';
import { identifyStrings, type Language } from '@/locales/identify';
import {
  translateDiseaseName,
  translateDiseaseDescription,
  type Language as TranslateLanguage,
} from '@/lib/translate';
import symptomsData from '@/data/symptoms.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  X,
  Trash2,
  Loader2,
  Stethoscope,
  AlertTriangle,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';

interface Symptom {
  id: string;
  en: string;
  hi: string;
  mr: string;
}

interface PredictionResult {
  top_disease: string;
  confidence: number;
  description: string;
  other_possible: { disease: string; probability: number }[];
}

export default function PredictDiseaseTab() {
  const { language } = useChatLanguage();
  const lang = language as Language;
  const t = identifyStrings[lang] || identifyStrings.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const symptoms: Symptom[] = symptomsData as Symptom[];

  // Filter symptoms based on search query in the user's language
  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return symptoms;
    const q = searchQuery.toLowerCase();
    return symptoms.filter((s) => {
      const localName = s[lang] || s.en;
      return (
        localName.toLowerCase().includes(q) ||
        s.en.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, lang, symptoms]);

  // Remove already selected symptoms from dropdown
  const availableSymptoms = useMemo(() => {
    const selectedIds = new Set(selectedSymptoms.map((s) => s.id));
    return filteredSymptoms.filter((s) => !selectedIds.has(s.id));
  }, [filteredSymptoms, selectedSymptoms]);

  const addSymptom = (symptom: Symptom) => {
    if (!selectedSymptoms.find((s) => s.id === symptom.id)) {
      setSelectedSymptoms((prev) => [...prev, symptom]);
    }
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const removeSymptom = (id: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAll = () => {
    setSelectedSymptoms([]);
    setResult(null);
    setError('');
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError(t.noSymptoms);
      return;
    }

    setError('');
    setIsLoading(true);
    setResult(null);

    try {
      const symptomIds = selectedSymptoms.map((s) => s.id);
      const response = await fetch('/api/predict-disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomIds }),
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
      {/* Symptom Search */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            {t.searchPlaceholder}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="symptom-search"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="pl-10 pr-10 h-12 text-base border-2 focus:border-blue-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {availableSymptoms.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    {searchQuery ? 'No matching symptoms found' : 'All symptoms selected'}
                  </div>
                ) : (
                  availableSymptoms.slice(0, 30).map((symptom) => (
                    <button
                      key={symptom.id}
                      onClick={() => addSymptom(symptom)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between"
                    >
                      <span>{symptom[lang] || symptom.en}</span>
                      {lang !== 'en' && (
                        <span className="text-xs text-gray-400 ml-2">{symptom.en}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Symptoms */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {t.selectedSymptoms} ({selectedSymptoms.length})
              </h3>
              {selectedSymptoms.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t.clearAll}
                </Button>
              )}
            </div>

            {selectedSymptoms.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <Stethoscope className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{t.noSymptomsSelected}</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <Badge
                    key={symptom.id}
                    variant="secondary"
                    className="pl-3 pr-1 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-default group"
                  >
                    {symptom[lang] || symptom.en}
                    <button
                      onClick={() => removeSymptom(symptom.id)}
                      className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                      aria-label={`${t.removeSymptom} ${symptom[lang] || symptom.en}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Predict Button */}
      <Button
        id="predict-disease-button"
        onClick={handlePredict}
        disabled={isLoading || selectedSymptoms.length === 0}
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t.predicting}
          </>
        ) : (
          <>
            <Stethoscope className="mr-2 h-5 w-5" />
            {t.predictButton}
          </>
        )}
      </Button>

      {/* Result Card */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Prediction */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                {t.topPrediction}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Disease Name */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t.disease}</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {translateDiseaseName(result.top_disease, lang as TranslateLanguage)}
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
              {(result.description || translateDiseaseDescription(result.top_disease, lang as TranslateLanguage)) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">{t.description}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {translateDiseaseDescription(result.top_disease, lang as TranslateLanguage) || result.description}
                  </p>
                </div>
              )}

              {/* Other Possible Diseases */}
              {result.other_possible && result.other_possible.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    {t.alternativeDiagnoses}
                  </p>
                  <div className="space-y-2.5">
                    {result.other_possible.map((alt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3 hover:shadow-sm transition-shadow"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {translateDiseaseName(alt.disease, lang as TranslateLanguage)}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-400 transition-all duration-700"
                              style={{ width: `${alt.probability}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-500 min-w-[3.5rem] text-right">
                            {alt.probability.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
                <p className="text-sm text-amber-800 leading-relaxed">{t.disclaimer}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
