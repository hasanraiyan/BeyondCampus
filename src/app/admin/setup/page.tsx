'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function AdminSetup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if setup is needed
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/system/status');
        const data = await res.json();
        if (!data.needsSetup) {
          router.push('/auth/signin');
        } else {
          setIsChecking(false);
        }
      } catch (err) {
        console.error('Failed to check system status:', err);
        setIsChecking(false);
      }
    };
    checkStatus();
  }, [router]);

  // Force dark theme for this page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = 'hsl(0 0% 3%)';
    document.body.style.color = 'hsl(0 0% 95%)';

    return () => {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message and redirect to signin
        router.push('/auth/signin');
      } else {
        setError(data.message || 'Failed to create admin account');
      }
    } catch (error) {
      console.error('Setup error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0d1117',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        Checking system status...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'hsl(0 0% 8%)',
          borderRadius: '8px',
          padding: '40px 32px',
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid hsl(0 0% 18%)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'hsl(27 96% 61%)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraduationCap
                style={{ width: '20px', height: '20px', color: 'black' }}
              />
            </div>
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '8px',
              fontFamily:
                'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
            }}
          >
            Setup Admin Account
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#a1a1aa',
              fontFamily:
                'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
            }}
          >
            Create the first user for the system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name Fields Row */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <label
                htmlFor="firstName"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '6px',
                  fontFamily:
                    'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
                }}
              >
                First name
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                style={{
                  width: '100%',
                  height: '52px',
                  padding: '0 16px',
                  fontSize: '16px',
                  border: '1px solid hsl(0 0% 18%)',
                  borderRadius: '6px',
                  backgroundColor: 'hsl(0 0% 11%)',
                  color: '#ffffff',
                  fontFamily:
                    'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
                  outline: 'none',
                  transition:
                    'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'hsl(27 96% 61%)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'hsl(0 0% 18%)')}
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '6px',
                  fontFamily:
                    'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
                }}
              >
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                style={{
                  width: '100%',
                  height: '52px',
                  padding: '0 16px',
                  fontSize: '16px',
                  border: '1px solid hsl(0 0% 18%)',
                  borderRadius: '6px',
                  backgroundColor: 'hsl(0 0% 11%)',
                  color: '#ffffff',
                  fontFamily:
                    'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
                  outline: 'none',
                  transition:
                    'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'hsl(27 96% 61%)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'hsl(0 0% 18%)')}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '6px',
                fontFamily:
                  'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
              }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={{
                width: '100%',
                height: '52px',
                padding: '0 16px',
                fontSize: '16px',
                border: '1px solid hsl(0 0% 18%)',
                borderRadius: '6px',
                backgroundColor: 'hsl(0 0% 11%)',
                color: '#ffffff',
                fontFamily:
                  'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
                outline: 'none',
                transition:
                  'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'hsl(27 96% 61%)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'hsl(0 0% 18%)')}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '6px',
                fontFamily:
                  'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                style={{
                  width: '100%',
                  height: '52px',
                  padding: '0 48px 0 16px',
                  fontSize: '16px',
                  border: '1px solid hsl(0 0% 18%)',
                  borderRadius: '6px',
                  backgroundColor: 'hsl(0 0% 11%)',
                  color: '#ffffff',
                  fontFamily:
                    'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
                  outline: 'none',
                  transition:
                    'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                  boxSizing: 'border-box',
                }}
                minLength={6}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'hsl(27 96% 61%)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'hsl(0 0% 18%)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ffffff',
                  padding: '4px',
                }}
              >
                {showPassword ? (
                  <EyeOff style={{ width: '20px', height: '20px' }} />
                ) : (
                  <Eye style={{ width: '20px', height: '20px' }} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'hsl(0 84% 60% / 0.1)',
                border: '1px solid hsl(0 84% 60% / 0.2)',
                borderRadius: '6px',
                color: 'hsl(0 84% 60%)',
                fontSize: '14px',
                fontFamily:
                  'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '52px',
              backgroundColor: isLoading ? '#9ca3af' : 'hsl(27 96% 61%)',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily:
                'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease-in-out',
              marginTop: '20px',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = 'hsl(27 96% 55%)';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = 'hsl(27 96% 61%)';
            }}
          >
            {isLoading ? 'Creating account...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}