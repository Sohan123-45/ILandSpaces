import React, { useState, useEffect } from 'react';
import { CustomerRequirement, CaptchaChallenge } from '../types';
import { saveCustomer } from '../services/mockBackend';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CheckCircle, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';

const generateCaptcha = (): CaptchaChallenge => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { num1, num2, answer: num1 + num2 };
};

export const PublicForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<CustomerRequirement>>({
    direction: 'North',
    lookingFor: 'Gated',
    floorPreference: 1
  });
  
  const [captcha, setCaptcha] = useState<CaptchaChallenge>(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Name
    if (!formData.name || formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    // Mobile
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile || !mobileRegex.test(formData.mobile)) newErrors.mobile = 'Enter a valid 10-digit Indian mobile number';

    // Alt Mobile (Optional but needs validation if present)
    if (formData.altMobile && !mobileRegex.test(formData.altMobile)) newErrors.altMobile = 'Enter a valid 10-digit mobile number';

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = 'Enter a valid email address';

    // Budget
    if (!formData.budget || formData.budget <= 0) newErrors.budget = 'Please enter a valid positive budget amount';

    // Locations
    if (!formData.currentLocation) newErrors.currentLocation = 'Current location is required';
    if (!formData.preferredLocation) newErrors.preferredLocation = 'Preferred location is required';

    // Floor
    if (formData.floorPreference === undefined || formData.floorPreference < 0 || !Number.isInteger(Number(formData.floorPreference))) {
      newErrors.floorPreference = 'Enter a valid positive integer floor number';
    }

    // Flat Size
    if (!formData.flatSize || formData.flatSize <= 0) newErrors.flatSize = 'Enter a valid positive size';

    // Requirement
    if (!formData.requirement) newErrors.requirement = 'Please describe your requirement';

    // Captcha
    if (!captchaInput || parseInt(captchaInput) !== captcha.answer) newErrors.captcha = 'Incorrect calculation';

    setErrors(newErrors);
    
    // If there are errors, scroll to top of form
    if (Object.keys(newErrors).length > 0) {
        window.scrollTo({ top: 100, behavior: 'smooth' });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'number') {
        finalValue = value === '' ? '' : Number(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle'); // clear previous errors
    
    try {
      await saveCustomer(formData as CustomerRequirement);
      setSubmitStatus('success');
      setFormData({
        direction: 'North',
        lookingFor: 'Gated',
        floorPreference: 1
      });
      setCaptchaInput('');
      refreshCaptcha();
      setErrors({});
    } catch (error) {
      console.error("Submission failed", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Requirement Submitted!</h2>
        <p className="text-gray-600 mb-8">
          Thank you for sharing your requirements with iLandSpaces. Our team will review your preferences and contact you shortly with the best matching properties.
        </p>
        <Button onClick={() => setSubmitStatus('idle')} variant="outline">
          Submit Another Requirement
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-primary-700 py-6 px-8">
        <h2 className="text-2xl font-bold text-white">Share Your Housing Requirements</h2>
        <p className="text-primary-100 mt-2">Help us find your dream home by filling out the details below.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Global Error Message */}
        {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">Please correct the errors below</p>
                    <p className="text-sm mt-1">Some fields are missing or invalid.</p>
                </div>
            </div>
        )}
        
        {submitStatus === 'error' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">Submission Failed</p>
                    <p className="text-sm mt-1">There was a problem saving your requirement. Please try again.</p>
                </div>
            </div>
        )}

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Full Name" 
            name="name" 
            value={formData.name || ''} 
            onChange={handleChange} 
            error={errors.name} 
            required
            placeholder="e.g. John Doe"
          />
          <Input 
            label="Email Address" 
            type="email"
            name="email" 
            value={formData.email || ''} 
            onChange={handleChange} 
            error={errors.email} 
            required
            placeholder="john@example.com"
          />
          <Input 
            label="Mobile Number" 
            type="tel"
            name="mobile" 
            value={formData.mobile || ''} 
            onChange={handleChange} 
            error={errors.mobile} 
            required
            placeholder="10-digit number"
            maxLength={10}
          />
          <Input 
            label="Alternate Mobile" 
            type="tel"
            name="altMobile" 
            value={formData.altMobile || ''} 
            onChange={handleChange} 
            error={errors.altMobile} 
            placeholder="Optional"
            maxLength={10}
          />
        </div>

        {/* Requirements */}
        <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="Budget (₹)" 
                    type="number"
                    name="budget" 
                    value={formData.budget || ''} 
                    onChange={handleChange} 
                    error={errors.budget} 
                    required
                    placeholder="e.g. 7500000"
                />
                <Input 
                    label="Flat Size (Sq. Ft)" 
                    type="number"
                    name="flatSize" 
                    value={formData.flatSize || ''} 
                    onChange={handleChange} 
                    error={errors.flatSize} 
                    required
                    placeholder="e.g. 1200"
                />
                 <Input 
                    label="Current Location" 
                    name="currentLocation" 
                    value={formData.currentLocation || ''} 
                    onChange={handleChange} 
                    error={errors.currentLocation} 
                    required
                    placeholder="e.g. HSR Layout"
                />
                 <Input 
                    label="Preferred Location" 
                    name="preferredLocation" 
                    value={formData.preferredLocation || ''} 
                    onChange={handleChange} 
                    error={errors.preferredLocation} 
                    required
                    placeholder="e.g. Sarjapur"
                />
                 <Input 
                    label="Preferred Floor" 
                    type="number"
                    name="floorPreference" 
                    value={formData.floorPreference !== undefined ? formData.floorPreference : ''} 
                    onChange={handleChange} 
                    error={errors.floorPreference} 
                    required
                    min="0"
                    placeholder="e.g. 4"
                />
            </div>
            
            {/* Radio Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Direction Facing</label>
                    <div className="flex gap-4 flex-wrap">
                        {['North', 'South', 'East', 'West'].map(dir => (
                            <label key={dir} className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="direction" 
                                    value={dir}
                                    checked={formData.direction === dir}
                                    onChange={handleChange}
                                    className="text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">{dir}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Looking For</label>
                    <div className="flex gap-4 flex-wrap">
                        {['Gated', 'Semi-gated', 'Standalone'].map(type => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="lookingFor" 
                                    value={type}
                                    checked={formData.lookingFor === type}
                                    onChange={handleChange}
                                    className="text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-gray-700">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Requirement</label>
                <textarea
                    name="requirement"
                    rows={4}
                    value={formData.requirement || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.requirement ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'}`}
                    placeholder="Describe specific needs (e.g., balcony view, gym access, proximity to schools)..."
                />
                {errors.requirement && <p className="mt-1 text-xs text-red-600">{errors.requirement}</p>}
            </div>
        </div>

        {/* Captcha */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Security Check: What is {captcha.num1} + {captcha.num2}?</label>
                <button type="button" onClick={refreshCaptcha} className="text-primary-600 hover:text-primary-700" title="Refresh Captcha">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <input
                        type="number"
                        value={captchaInput}
                        onChange={(e) => {
                            setCaptchaInput(e.target.value);
                            if (errors.captcha) setErrors(prev => { const n = {...prev}; delete n.captcha; return n;});
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.captcha ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="Answer"
                    />
                    {errors.captcha && <p className="mt-1 text-xs text-red-600">{errors.captcha}</p>}
                </div>
                <div className="text-xs text-gray-500 w-1/2 pt-2">
                    This question is for testing whether you are a human visitor and to prevent automated spam submissions.
                </div>
            </div>
        </div>

        <div className="pt-4">
            <Button type="submit" className="w-full text-lg py-3" isLoading={isSubmitting}>
                Submit Requirement
            </Button>
            <p className="text-xs text-gray-500 text-center mt-4">
                By submitting this form, you agree to be contacted by our team regarding your property request.
            </p>
        </div>
      </form>
    </div>
  );
};