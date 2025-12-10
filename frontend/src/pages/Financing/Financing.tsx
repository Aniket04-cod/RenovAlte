import Heading from "../../components/Heading/Heading";
import React, { useState, useEffect } from "react";
import Text from "../../components/Text/Text";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import FinancingAssistant from "../../components/FinancingAssistant/FinancingAssistant";
import { useNavigate } from "react-router-dom";

// Import ProjectContext to access selected project
import { useProject } from "../../contexts/ProjectContext";

// Import project to financing mapper
import { mapProjectToFinancingForm, hasMinimumProjectData, getAutoFillMessage } from "../../utils/projectToFinancingMapper";

// Import types
import { FormData, RAGAnalysisResult, CostEstimateResponse } from '../../types/financing.types';

// Import constants - single source of truth
import {
  RENOVATION_TYPE_OPTIONS,
  DEFAULT_FORM_DATA,
  RENOVATION_QUESTIONS,
  Question,
  RENOVATION_GOAL_QUESTIONS,
  COMMON_FIELDS_QUESTIONS,
  SHOWER_AREA_QUESTIONS,
  BATHTUB_QUESTIONS,
  TOILET_AREA_QUESTIONS,
  WASHBASIN_AREA_QUESTIONS,
  TILES_SURFACES_QUESTIONS,
  ELECTRICAL_LIGHTING_QUESTIONS,
  PLUMBING_QUESTIONS,
  WATER_PRESSURE_QUESTIONS,
  HEATING_QUESTIONS,
  VENTILATION_QUESTIONS,
  ACCESSORIES_QUESTIONS,
  WATERPROOFING_QUESTIONS
} from '../../constants/financing.constants';

// Import Gemini service for analysis
import { geminiService } from '../../services/gemini.service';

const Financing: React.FC = () => {
  // Get selected project from context
  const { selectedProject } = useProject();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<number>(1); // 1 = Area Selection, 2 = Detailed Questions

  // Auto-fill notification state
  const [autoFillMessage, setAutoFillMessage] = useState<string | null>(null);
  const [showAutoFillBanner, setShowAutoFillBanner] = useState(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RAGAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Store original prompt and cost estimate for subsequent API calls
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [costEstimateData, setCostEstimateData] = useState<CostEstimateResponse | null>(null);

  // New feature states
  const [financingOptions, setFinancingOptions] = useState<any>(null);
  const [imageDescription, setImageDescription] = useState<any>(null);

  // Loading states for each feature
  const [isLoadingFinancing, setIsLoadingFinancing] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Auto-fill form from selected project on component mount
  useEffect(() => {
    if (hasMinimumProjectData(selectedProject)) {
      console.log('Auto-filling financing form from project:', selectedProject);
      const preFilledData = mapProjectToFinancingForm(selectedProject!);
      setFormData(preFilledData);

      // Generate and show auto-fill message
      const message = getAutoFillMessage(selectedProject!);
      setAutoFillMessage(message);
      setShowAutoFillBanner(true);

      // Auto-hide banner after 8 seconds
      const timer = setTimeout(() => {
        setShowAutoFillBanner(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [selectedProject]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle multiselect changes
  const handleMultiSelectChange = (field: keyof FormData, selectedValue: string) => {
    const currentValues = (formData[field] as string[]) || [];
    const newValues = currentValues.includes(selectedValue)
      ? currentValues.filter(v => v !== selectedValue)
      : [...currentValues, selectedValue];
    setFormData(prev => ({ ...prev, [field]: newValues }));
  };

  // Get questions based on selected renovation type and current step
  const getCurrentQuestions = (): Question[] => {
    if (!formData.renovationType || formData.renovationType !== 'bathroom') {
      return [];
    }

    // STEP 1: Show area selection only
    if (currentStep === 1) {
      return RENOVATION_QUESTIONS[formData.renovationType] || [];
    }

    // STEP 2: Show detailed questions based on selected areas
    if (currentStep === 2) {
      const questions: Question[] = [];
      const selectedAreas = formData.bathroomRenovationAreas || [];

      console.log('[Form] Step 2 - Selected Areas:', selectedAreas);
      console.log('[Form] Building question list based on selections...');

      // Always show Renovation Goal and Common Fields
      console.log('[Form] Adding: Renovation Goal (always shown)');
      questions.push(...RENOVATION_GOAL_QUESTIONS);

      console.log('[Form] Adding: Common Fields (always shown)');
      questions.push(...COMMON_FIELDS_QUESTIONS);

      // Conditionally add sections based on selected areas
      if (selectedAreas.includes('shower_area')) {
        console.log('[Form] Adding: Shower Area questions');
        questions.push(...SHOWER_AREA_QUESTIONS);
      }
      if (selectedAreas.includes('bathtub')) {
        console.log('[Form] Adding: Bathtub questions');
        questions.push(...BATHTUB_QUESTIONS);
      }
      if (selectedAreas.includes('toilet_area')) {
        console.log('[Form] Adding: Toilet Area questions');
        questions.push(...TOILET_AREA_QUESTIONS);
      }
      if (selectedAreas.includes('washbasin_area')) {
        console.log('[Form] Adding: Washbasin Area questions');
        questions.push(...WASHBASIN_AREA_QUESTIONS);
      }
      if (selectedAreas.includes('tiles_surfaces')) {
        console.log('[Form] Adding: Tiles & Surfaces questions');
        questions.push(...TILES_SURFACES_QUESTIONS);
      }
      if (selectedAreas.includes('electrical_lighting')) {
        console.log('[Form] Adding: Electrical & Lighting questions');
        questions.push(...ELECTRICAL_LIGHTING_QUESTIONS);
      }
      if (selectedAreas.includes('plumbing')) {
        console.log('[Form] Adding: Plumbing questions');
        questions.push(...PLUMBING_QUESTIONS);
      }
      if (selectedAreas.includes('water_pressure')) {
        console.log('[Form] Adding: Water Pressure questions');
        questions.push(...WATER_PRESSURE_QUESTIONS);
      }
      if (selectedAreas.includes('heating')) { // NEW
        console.log('[Form] Adding: Heating questions');
        questions.push(...HEATING_QUESTIONS);
      }
      if (selectedAreas.includes('ventilation')) { // NEW
        console.log('[Form] Adding: Ventilation questions');
        questions.push(...VENTILATION_QUESTIONS);
      }
      if (selectedAreas.includes('accessories')) {
        console.log('[Form] Adding: Accessories questions');
        questions.push(...ACCESSORIES_QUESTIONS);
      }
      if (selectedAreas.includes('waterproofing')) {
        console.log('[Form] Adding: Waterproofing questions');
        questions.push(...WATERPROOFING_QUESTIONS);
      }

      console.log('[Form] Total questions to display:', questions.length);

      return questions;
    }

    return [];
  };

  const currentQuestions = getCurrentQuestions();

  // Check if form is complete enough to analyze
  const canAnalyze = () => {
    if (!formData.renovationType) return false;

    // If there are specific questions for this renovation type, check if they're answered
    if (currentQuestions && currentQuestions.length > 0) {
      const requiredQuestions = currentQuestions.filter(q => q.required);
      const allRequiredAnswered = requiredQuestions.every(q => {
        const answer = formData[q.id as keyof FormData];
        if (Array.isArray(answer)) {
          return answer.length > 0;
        }
        return answer && answer !== '';
      });
      return allRequiredAnswered;
    }

    return true;
  };

  // Handle Next button (Step 1 -> Step 2)
  const handleNextStep = () => {
    // Validate that at least one area is selected
    if (!formData.bathroomRenovationAreas || formData.bathroomRenovationAreas.length === 0) {
      alert('Please select at least one renovation area to continue.');
      return;
    }
    setCurrentStep(2);
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Back button (Step 2 -> Step 1)
  const handlePreviousStep = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle analyze budget button click
  const handleAnalyzeBudget = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      console.log('='.repeat(80));
      console.log('FRONTEND: Starting cost estimation');
      console.log('='.repeat(80));
      console.log('Form Data being sent to backend:');
      console.log(JSON.stringify(formData, null, 2));
      console.log('='.repeat(80));

      // Call cost estimation - backend will return original prompt
      const response = await geminiService.generateCostEstimate(formData);

      console.log('='.repeat(80));
      console.log('FRONTEND: Cost estimate received from backend');
      console.log('Result:', JSON.stringify(response, null, 2));
      console.log('='.repeat(80));

      // Extract original prompt and form data from response
      const originalPromptFromBackend = response._originalPrompt || '';

      // Store for subsequent API calls
      setOriginalPrompt(originalPromptFromBackend);
      setCostEstimateData(response);

      console.log('='.repeat(80));
      console.log('FRONTEND: Stored original prompt and cost estimate for future use');
      console.log('Original Prompt Length:', originalPromptFromBackend.length);
      console.log('='.repeat(80));

      // Remove the internal fields before displaying
      const { _originalPrompt, _formData, ...costEstimate } = response;

      // Set the cost estimate result
      setAnalysisResult({
        costEstimate: costEstimate,
        recommendations: [],
        summary: '',
        nextSteps: []
      });

      // Scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById('analysis-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (error) {
      console.error('[Financing] Analysis failed:', error);

      // Parse error message for better display
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (errorMessage.includes('RATE_LIMIT')) {
        // Show detailed rate limit error
        setAnalysisError(errorMessage.replace('RATE_LIMIT: ', ''));
      } else {
        // Show generic error
        setAnalysisError(errorMessage || 'Failed to analyze budget. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Get Financing Options button
  const handleGetFinancingOptions = async () => {
    try {
      setIsLoadingFinancing(true);

      console.log('='.repeat(80));
      console.log('FRONTEND: Getting financing options');
      console.log('='.repeat(80));
      console.log('Original Prompt Length:', originalPrompt.length);
      console.log('Cost Estimate Data:', costEstimateData);
      console.log('Form Data:', formData);

      // Validate we have the required data
      if (!originalPrompt || !costEstimateData) {
        throw new Error('Missing required data. Please analyze budget first.');
      }

      // Extract clean cost estimate without internal fields
      const { _originalPrompt, _formData, ...cleanCostEstimate } = costEstimateData!;

      console.log('Clean Cost Estimate:', cleanCostEstimate);
      console.log('='.repeat(80));

      const result = await geminiService.generateFinancingOptions(
        originalPrompt,
        cleanCostEstimate,
        formData
      );

      console.log('='.repeat(80));
      console.log('FRONTEND: Financing options received');
      console.log(JSON.stringify(result, null, 2));
      console.log('='.repeat(80));

      setFinancingOptions(result);

      // Scroll to financing options section
      setTimeout(() => {
        const section = document.getElementById('financing-options-results');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (error) {
      console.error('[Financing] Failed to get financing options:', error);
      alert(error instanceof Error ? error.message : 'Failed to get financing options');
    } finally {
      setIsLoadingFinancing(false);
    }
  };

  // Handle Generate Image button
  const handleGenerateImage = async () => {
    try {
      setIsLoadingImage(true);

      console.log('='.repeat(80));
      console.log('FRONTEND: Generating image description');
      console.log('='.repeat(80));

      // Extract clean cost estimate without internal fields
      const { _originalPrompt, _formData, ...cleanCostEstimate } = costEstimateData!;

      const result = await geminiService.generateImageDescription(
        originalPrompt,
        cleanCostEstimate,
        formData
      );

      console.log('='.repeat(80));
      console.log('FRONTEND: Image description received');
      console.log(JSON.stringify(result, null, 2));
      console.log('='.repeat(80));

      setImageDescription(result);

      // Scroll to image section
      setTimeout(() => {
        const section = document.getElementById('image-description-results');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (error) {
      console.error('[Financing] Failed to generate image:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate image description');
    } finally {
      setIsLoadingImage(false);
    }
  };

  // Handle Find Contractor button - Navigate to Contracting module
  const handleFindContractor = () => {
    // Navigate to contracting page
    navigate('/contracting');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Heading level={1}>Financing Your Renovation</Heading>
        <Text className="text-gray-600 mt-2">
          Find the best loans, subsidies, and grants for your renovation project based on your specific needs and financial situation.
        </Text>
      </div>

      {/* Questionnaire Form */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Auto-fill notification banner */}
        {showAutoFillBanner && autoFillMessage && selectedProject && (
          <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-sm animate-slideDown">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-1.5 rounded-full mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-900 text-sm mb-1">Auto-filled from project</h4>
                    <p className="text-emerald-700 text-sm">
                      {autoFillMessage}
                    </p>
                    <p className="text-emerald-600 text-xs mt-1">
                      From project: <span className="font-medium">{selectedProject.name}</span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAutoFillBanner(false)}
                className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-100 transition flex-shrink-0"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-emerald-800">
            Renovation Type
          </h2>
        </div>

        <div className="space-y-6">
          {/* Renovation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What type of renovation do you need? *
            </label>
            <select
              value={formData.renovationType}
              onChange={(e) => handleInputChange('renovationType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            >
              <option value="">Select renovation type...</option>
              {RENOVATION_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conditional Questions Based on Renovation Type */}
      {currentQuestions && currentQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 mt-6">
          <div className="mb-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStep === 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                Step 1
              </span>
              <span className="text-gray-400">→</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStep === 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                Step 2
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-emerald-800">
              {currentStep === 1 ? 'Select Renovation Areas' : 'Renovation Details'}
            </h2>
            <p className="text-gray-600 mt-1 text-sm">
              {currentStep === 1
                ? 'Choose all the areas you want to include in your bathroom renovation project.'
                : 'Provide details for your selected renovation areas.'}
            </p>

            {/* Show selected areas summary on Step 2 */}
            {currentStep === 2 && formData.bathroomRenovationAreas && formData.bathroomRenovationAreas.length > 0 && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {formData.bathroomRenovationAreas.map((area) => {
                    const areaLabels: Record<string, string> = {
                      shower_area: 'Shower Area',
                      bathtub: 'Bathtub',
                      toilet_area: 'Toilet Area',
                      washbasin_area: 'Washbasin Area',
                      tiles_surfaces: 'Tiles & Surfaces',
                      electrical_lighting: 'Electrical & Lighting',
                      plumbing: 'Plumbing',
                      water_pressure: 'Water Pressure',
                      heating: 'Heating',
                      ventilation: 'Ventilation',
                      accessories: 'Accessories',
                      waterproofing: 'Waterproofing'
                    };
                    return (
                      <span key={area} className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-full">
                        {areaLabels[area] || area}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {currentQuestions.map((question: Question, index) => (
              <div key={question.id}>
                {/* Section Title */}
                {question.sectionTitle && (
                  <h3 className="text-xl font-semibold text-white bg-emerald-700 px-4 py-3 mb-4 mt-6 rounded-lg shadow">
                    {question.sectionTitle}
                  </h3>
                )}

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question.label} {question.required && <span className="text-red-500">*</span>}
                </label>

                {/* Select Dropdown */}
                {question.type === 'select' && (
                  <select
                    value={(formData[question.id as keyof FormData] as string) || ''}
                    onChange={(e) => handleInputChange(question.id as keyof FormData, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  >
                    <option value="">Select an option...</option>
                    {question.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}

                {/* Radio Buttons */}
                {question.type === 'radio' && (
                  <div className="space-y-3">
                    {question.options?.map(opt => (
                      <label
                        key={opt.value}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={opt.value}
                          checked={(formData[question.id as keyof FormData] as string) === opt.value}
                          onChange={(e) => handleInputChange(question.id as keyof FormData, e.target.value)}
                          className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <div className="text-gray-700">{opt.label}</div>
                          {opt.description && (
                            <div className="text-sm text-gray-600 mt-1">{opt.description}</div>
                          )}
                          {opt.qualityDescription && (
                            <div className="text-sm text-blue-600 font-medium mt-1 italic">ℹ️ {opt.qualityDescription}</div>
                          )}
                        </div>
                      </label>
                    ))}
                    {/* "Other" option - NEW */}
                    {question.allowOther && (
                      <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <label className="flex items-start gap-3">
                          <input
                            type="radio"
                            name={question.id}
                            value="other"
                            checked={(formData[question.id as keyof FormData] as string) === 'other'}
                            onChange={(e) => handleInputChange(question.id as keyof FormData, 'other')}
                            className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1">
                            <span className="text-gray-700 font-medium">Other (specify)</span>
                            {(formData[question.id as keyof FormData] as string) === 'other' && (
                              <input
                                type="text"
                                placeholder={question.otherPlaceholder || 'Please specify...'}
                                value={(formData[`${question.id}_other` as keyof FormData] as string) || ''}
                                onChange={(e) => handleInputChange(`${question.id}_other` as keyof FormData, e.target.value)}
                                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                autoFocus
                              />
                            )}
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Multiselect Checkboxes */}
                {question.type === 'multiselect' && (
                  <div className="space-y-3">
                    {question.options?.map(opt => (
                      <label
                        key={opt.value}
                        className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition"
                      >
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={((formData[question.id as keyof FormData] as string[]) || []).includes(opt.value)}
                          onChange={() => handleMultiSelectChange(question.id as keyof FormData, opt.value)}
                          className="mt-1 w-5 h-5 text-emerald-600 focus:ring-emerald-500 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{opt.label}</div>
                          {opt.description && (
                            <div className="text-sm text-gray-600 mt-1">{opt.description}</div>
                          )}
                          {opt.qualityDescription && (
                            <div className="text-sm text-blue-600 font-medium mt-1 italic">ℹ️ {opt.qualityDescription}</div>
                          )}
                        </div>
                      </label>
                    ))}
                    {/* "Other" option for multiselect */}
                    {question.allowOther && (
                      <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <label className="block">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={!!formData[`${question.id}_other` as keyof FormData]}
                              onChange={(e) => {
                                if (!e.target.checked) {
                                  handleInputChange(`${question.id}_other` as keyof FormData, '');
                                } else {
                                  handleInputChange(`${question.id}_other` as keyof FormData, ' ');
                                }
                              }}
                              className="mt-1 w-5 h-5 text-emerald-600 focus:ring-emerald-500 rounded"
                            />
                            <div className="flex-1">
                              <span className="text-gray-700 font-medium">Other (specify)</span>
                              {!!formData[`${question.id}_other` as keyof FormData] && (
                                <input
                                  type="text"
                                  name={`${question.id}_other`}
                                  placeholder={question.otherPlaceholder || 'Please specify...'}
                                  value={(formData[`${question.id}_other` as keyof FormData] as string) || ''}
                                  onChange={(e) => handleInputChange(`${question.id}_other` as keyof FormData, e.target.value)}
                                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                  autoFocus
                                />
                              )}
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Number Input */}
                {question.type === 'number' && (
                  <div className="relative">
                    <input
                      type="number"
                      min={question.min}
                      max={question.max}
                      placeholder={question.placeholder}
                      value={formData[question.id as keyof FormData] || ''}
                      onChange={(e) => handleInputChange(question.id as keyof FormData, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    />
                    {question.unit && (
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {question.unit}
                      </span>
                    )}
                  </div>
                )}

                {/* Text Input */}
                {question.type === 'text' && (
                  <div>
                    <input
                      type="text"
                      placeholder={question.placeholder}
                      value={(formData[question.id as keyof FormData] as string) || ''}
                      onChange={(e) => handleInputChange(question.id as keyof FormData, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                )}

                {/* Description - Only show for non-multiselect questions */}
                {question.description && question.type !== 'multiselect' && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">{question.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
            {/* Back Button (only show on Step 2) */}
            {currentStep === 2 && (
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition"
              >
                ← Back to Area Selection
              </button>
            )}

            {/* Next Button (only show on Step 1) */}
            {currentStep === 1 && (
              <button
                onClick={handleNextStep}
                disabled={!formData.bathroomRenovationAreas || formData.bathroomRenovationAreas.length === 0}
                className={`ml-auto px-8 py-3 rounded-lg font-semibold transition ${
                  formData.bathroomRenovationAreas && formData.bathroomRenovationAreas.length > 0
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next: Enter Details →
              </button>
            )}

            {/* Spacer for Step 2 when back button is shown */}
            {currentStep === 2 && <div></div>}
          </div>
        </div>
      )}

      {/* Analyze Budget Button - Only show on Step 2 */}
      {formData.renovationType && currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-md p-8 mt-6">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              Ready to Get Your Financing Plan?
            </h2>
            <p className="text-gray-600 mb-6 text-center max-w-2xl">
              Click below to analyze your renovation project and get personalized cost estimates and financing recommendations.
            </p>

            {/* Error message */}
            {analysisError && (
              <div className="mb-4 p-6 bg-red-50 border-2 border-red-300 rounded-lg w-full max-w-3xl">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
                    <div className="text-sm text-red-700 whitespace-pre-line">
                      {analysisError}
                    </div>
                    {analysisError.includes('rate limit') && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                        <p className="text-sm text-yellow-800 font-medium">
                          💡 Tip: Try again in a few minutes, or check your Google AI Studio quota at{' '}
                          <a
                            href="https://aistudio.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-yellow-900"
                          >
                            aistudio.google.com
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyzeBudget}
              disabled={!canAnalyze() || isAnalyzing}
              className={`
                px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200
                ${canAnalyze() && !isAnalyzing
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Your Project...
                </span>
              ) : (
                'Analyze Budget & Get Financing Options'
              )}
            </button>

            {!canAnalyze() && !isAnalyzing && (
              <p className="text-sm text-gray-500 mt-3">
                Please complete all required fields above to continue
              </p>
            )}
          </div>
        </div>
      )}

      {/* Analysis Results Section */}
      {analysisResult && (
        <div id="analysis-results" className="mt-8">
          {/* Cost Estimate Section - ONLY THIS */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              Cost Estimation
            </h2>

            <div className="mb-6">
              <div className="text-3xl font-bold text-emerald-600">
                €{analysisResult.costEstimate.totalEstimatedCost.toLocaleString()}
              </div>
              <p className="text-gray-600 mt-2">
                {analysisResult.costEstimate.explanation}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Cost Breakdown</h3>
              {analysisResult.costEstimate.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{item.category}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <div className="text-lg font-semibold text-emerald-600">
                    €{item.cost.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Three Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">What would you like to do next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Financing Options Button */}
                <button
                  onClick={handleGetFinancingOptions}
                  disabled={isLoadingFinancing}
                  className="flex flex-col items-center p-6 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-4xl mb-3">💰</div>
                  <h4 className="font-semibold text-emerald-800 mb-2">Get Financing Options</h4>
                  <p className="text-sm text-gray-600 text-center">
                    {isLoadingFinancing ? 'Analyzing...' : 'Explore loans, grants, and subsidies'}
                  </p>
                </button>

                {/* Generate Image Button */}
                <button
                  onClick={handleGenerateImage}
                  disabled={isLoadingImage}
                  className="flex flex-col items-center p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-4xl mb-3">🖼️</div>
                  <h4 className="font-semibold text-blue-800 mb-2">Generate Image</h4>
                  <p className="text-sm text-gray-600 text-center">
                    {isLoadingImage ? 'Generating...' : 'Visualize your renovation'}
                  </p>
                </button>

                {/* Find Contractor Button */}
                <button
                  onClick={handleFindContractor}
                  className="flex flex-col items-center p-6 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition"
                >
                  <div className="text-4xl mb-3">👷</div>
                  <h4 className="font-semibold text-purple-800 mb-2">Find Contractors</h4>
                  <p className="text-sm text-gray-600 text-center">
                    Go to contractor matching
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financing Options Results */}
      {financingOptions && (
        <div id="financing-options-results" className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
            Financing Options & Recommendations
          </h2>

          {financingOptions.summary && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
              <p className="text-gray-700">{financingOptions.summary}</p>
            </div>
          )}

          {financingOptions.recommendations && financingOptions.recommendations.length > 0 && (
            <div className="space-y-6">
              {financingOptions.recommendations.map((rec: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{rec.optionName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rec.type === 'grant' ? 'bg-green-100 text-green-800' :
                      rec.type === 'subsidy' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rec.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div><span className="font-medium">Provider:</span> {rec.provider}</div>
                    <div><span className="font-medium">Amount:</span> {rec.estimatedAmount}</div>
                    {rec.interestRate && <div><span className="font-medium">Interest:</span> {rec.interestRate}</div>}
                    {rec.term && <div><span className="font-medium">Term:</span> {rec.term}</div>}
                  </div>

                  {rec.recommendationReason && (
                    <div className="mb-4 p-3 bg-blue-50 rounded">
                      <p className="text-sm text-gray-700"><strong>Why recommended:</strong> {rec.recommendationReason}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {rec.pros && rec.pros.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">Pros:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {rec.pros.map((pro: string, i: number) => (
                            <li key={i} className="text-gray-600">{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {rec.cons && rec.cons.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2">Cons:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {rec.cons.map((con: string, i: number) => (
                            <li key={i} className="text-gray-600">{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {rec.applicationSteps && rec.applicationSteps.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Application Steps:</h4>
                      <ol className="list-decimal list-inside text-sm space-y-1">
                        {rec.applicationSteps.map((step: string, i: number) => (
                          <li key={i} className="text-gray-600">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {financingOptions.nextSteps && financingOptions.nextSteps.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Next Steps:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {financingOptions.nextSteps.map((step: string, i: number) => (
                  <li key={i} className="text-gray-700">{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Image Description Results */}
      {imageDescription && (
        <div id="image-description-results" className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            Generated Renovation Visualization
          </h2>

          {/* Display Generated Image */}
          {imageDescription.image_base64 && (
            <div className="mb-6">
              <div className="relative rounded-lg overflow-hidden border-2 border-blue-200 shadow-lg">
                <img
                  src={`data:image/png;base64,${imageDescription.image_base64}`}
                  alt="Generated Renovation Visualization"
                  className="w-full h-auto"
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                  Generated by FLUX.1-schnell
                </div>
              </div>
            </div>
          )}

          {/* Show legacy image description data if exists */}
          {(imageDescription.imagePrompt || imageDescription.keyFeatures || imageDescription.style) && (
            <div className="grid md:grid-cols-2 gap-6">
              {imageDescription.keyFeatures && imageDescription.keyFeatures.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {imageDescription.keyFeatures.map((feature: string, i: number) => (
                      <li key={i} className="text-gray-600">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {imageDescription.materials && imageDescription.materials.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Materials:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {imageDescription.materials.map((material: string, i: number) => (
                      <li key={i} className="text-gray-600">{material}</li>
                    ))}
                  </ul>
                </div>
              )}

              {imageDescription.colorPalette && imageDescription.colorPalette.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Color Palette:</h4>
                  <div className="flex gap-2">
                    {imageDescription.colorPalette.map((color: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{color}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                {imageDescription.style && (
                  <div className="mb-3">
                    <span className="font-semibold text-gray-800">Style:</span> {imageDescription.style}
                  </div>
                )}
                {imageDescription.mood && (
                  <div className="mb-3">
                    <span className="font-semibold text-gray-800">Mood:</span> {imageDescription.mood}
                  </div>
                )}
                {imageDescription.lighting && (
                  <div>
                    <span className="font-semibold text-gray-800">Lighting:</span> {imageDescription.lighting}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Financing Assistant - Available on all pages */}
      <FinancingAssistant />
    </div>
  );
};

export default Financing;
