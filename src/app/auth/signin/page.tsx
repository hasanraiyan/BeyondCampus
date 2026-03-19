'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Force dark theme and check setup status
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = 'hsl(0 0% 3%)';
    document.body.style.color = 'hsl(0 0% 95%)';

    async function checkSetup() {
      try {
        const res = await fetch('/api/system/status');
        const data = await res.json();
        if (data.needsSetup) {
          router.push('/admin/setup');
        }
      } catch (err) {
        console.error('Setup check failed:', err);
      }
    }
    checkSetup();

    return () => {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        // Get session to check onboarding status
        const session = await getSession();

        // Redirect based on onboarding status
        if (session?.user?.onboardingCompleted) {
          router.push('/');
        } else {
          router.push('/onboarding/welcome');
        }
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Welcome back
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#ffffff',
              fontFamily:
                'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
            }}
          >
            Sign in to your BeyondCampus account
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
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
              placeholder=""
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = 'hsl(27 96% 61%)')
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = 'hsl(0 0% 18%)')
              }
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
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
                placeholder=""
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = 'hsl(27 96% 61%)')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = 'hsl(0 0% 18%)')
                }
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
              marginTop: '8px',
            }}
            onMouseEnter={(e) => {
              if (!isLoading)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'hsl(27 96% 55%)';
            }}
            onMouseLeave={(e) => {
              if (!isLoading)
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'hsl(27 96% 61%)';
            }}
          >
            {isLoading ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p
            style={{
              fontSize: '14px',
              color: '#ffffff',
              fontFamily:
                'Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif',
            }}
          >
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              style={{
                color: 'hsl(27 96% 61%)',
                textDecoration: 'none',
                fontWeight: '500',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = 'underline')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = 'none')
              }
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
