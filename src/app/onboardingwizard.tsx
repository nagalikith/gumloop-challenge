import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

const totalSteps = 3;
const pages = {};

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    birthdate: '',
    address: '',
    aboutMe: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchConfigFromBackend = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/get-config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      data.configuration.nodes.forEach((node) => {
        pages[node.id] = node.data.components;
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching configuration:', error);
      setIsLoading(false);
    }
  };

  const registerUser = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const responseData = await response.json();
      setUserId(responseData.user_id);

      setFormData(prev => ({
        ...prev,
        email: responseData.email || prev.email,
        birthdate: responseData.birthdate || prev.birthdate,
        address: responseData.address || prev.address,
        aboutMe: responseData.about || prev.aboutMe, // Note: backend uses 'about', frontend uses 'aboutMe'
      }));

      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      alert(`Registration failed: ${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/login/update-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          birthdate: formData.birthdate,
          address: formData.address,
          about: formData.aboutMe,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const responseData = await response.json();
      console.log('Profile updated successfully:', responseData);
      alert('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchConfigFromBackend();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNextStep = async () => {
    if (step === 1) {
      // Register user at email/password step
      const registrationSuccessful = await registerUser();
      if (registrationSuccessful) {
        setStep(step + 1);
      }
    } else if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Update profile on final step
      const updateSuccessful = await updateProfile();
      if (updateSuccessful) {
        console.log('Profile update successful');
      }
    }
  };

  const renderFields = () => {
    const currentPage = `page${step}`;
    return pages[currentPage].map((field) => {
      switch (field) {
        case 'email':
          return (
            <div key={field} className="space-y-4">
              <div>
                <label className="block mb-2">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Your email"
                  type="email"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>
            </div>
          );
        case 'birthdate':
          return (
            <div key={field}>
              <label className="block mb-2">Birthdate</label>
              <Input
                type="date"
                value={formData.birthdate}
                onChange={(e) => handleInputChange('birthdate', e.target.value)}
              />
            </div>
          );
        case 'address':
          return (
            <div key={field}>
              <label className="block mb-2">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Your address"
              />
            </div>
          );
        case 'aboutMe':
          return (
            <div key={field}>
              <label className="block mb-2">About Me</label>
              <Textarea
                value={formData.aboutMe}
                onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                placeholder="Tell us about yourself"
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  const progress = (step / totalSteps) * 100;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="max-w-2xl w-full mx-auto shadow-lg p-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Onboarding Wizard</CardTitle>
        <div className="mt-4">
          <Progress value={progress} className="w-full h-4 rounded-md bg-gray-200" />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-6 space-y-4">{renderFields()}</CardContent>
      <CardFooter className="flex justify-between mt-6">
        <Button 
          onClick={handleNextStep} 
          disabled={isSaving || step > totalSteps} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {isSaving ? 'Saving...' : step < totalSteps ? 'Next' : 'Finish'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingWizard;