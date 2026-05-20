import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, Loader2, User, Stethoscope, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import Logo from '../../components/common/Logo';
import '../../styles/pages/auth.css';

const Login = () => {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, user, profile } = useAuth();

  useEffect(() => {
    supabase.auth.signOut();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await login(email, password);
      
      // Fetch user profile to verify role
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) throw profileError;
      
      const actualRole = userProfile?.role || 'user';
      
      if (actualRole !== role) {
        // Sign out immediately if roles don't match
        await supabase.auth.signOut();
        const expectedTab = actualRole === 'doctor' ? 'Veterinarian' : 'Pet Owner';
        throw new Error(`Please select the ${expectedTab} tab to log in to this account.`);
      }

      toast.success('Successfully logged in!');
      navigate(actualRole === 'doctor' ? '/doctor-dashboard' : '/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image-panel">
        <img 
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200" 
          alt="Happy pets" 
          className="auth-image"
        />
        <div className="auth-image-overlay">
          <h1 className="auth-quote animate-slide-up">"Providing the best care for your furry friends."</h1>
          <p className="text-light animate-slide-up" style={{ animationDelay: '0.1s' }}>Join Vetocare today and experience world-class veterinary service.</p>
        </div>
      </div>
      
      <div className="auth-form-panel">
        <div className="auth-card auth-panel-enter">
          <div className="auth-header">
            <Logo size={64} className="mx-auto mb-4" />
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your Vetocare account</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="role-selector" style={{ marginBottom: '1.5rem' }}>
              <button 
                type="button" 
                className={`role-btn ${role === 'user' ? 'selected' : ''}`}
                onClick={() => setRole('user')}
              >
                <User size={20} />
                Pet Owner
              </button>
              <button 
                type="button" 
                className={`role-btn ${role === 'doctor' ? 'selected' : ''}`}
                onClick={() => setRole('doctor')}
              >
                <Stethoscope size={20} />
                Veterinarian
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                required 
                className="form-input" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="form-input" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </Button>
          </form>

          <div className="auth-footer">
            Don't have an account? 
            <Link to="/register" className="auth-link">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
