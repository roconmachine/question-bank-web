import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useDocumentTitle from 'app/common/use-document-title';
import './register.css';
import axios from 'axios';
import SHA1 from 'crypto-js/sha1';

type FormValues = {
    username: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
};

const schema = yup.object({
    username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
    fullName: yup.string().required('Full name is required').min(2, 'Full name must be at least 2 characters'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup.string().required('Please confirm your password').oneOf([yup.ref('password')], 'Passwords must match'),
    agreeToTerms: yup.boolean().required().oneOf([true], 'You must agree to the terms and conditions'),
}).required();

export default function Register() {
    const { t } = useTranslation();
    useDocumentTitle(t('register.title') || 'Create Account');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: { username: '', fullName: '', email: '', password: '', confirmPassword: '', agreeToTerms: false }
    });

    const onSubmit = async (data: FormValues) => {
        setError(null);
        setLoading(true);
        try {
            // Hash the password using SHA1
            const passwordHash = SHA1(data.password).toString();
            console.log('Registering user:', data.username);

            const registerResponse = await axios.post('/api/auth/register', {
                username: data.username,
                fullName: data.fullName,
                email: data.email,
                passwordHash: passwordHash
            });
            console.log('API response:', registerResponse.status);
            // On success navigate to login
            navigate('/login');
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || t('register.failed') || 'Registration failed';
            console.error('Registration error:', msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-semibold">Q</div>
                    <h2 className="mt-4 text-2xl font-semibold">{t('register.title') || 'Create your account'}</h2>
                    <p className="text-sm text-gray-500 mt-2">{t('register.subtitle') || 'Join us and get started'}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('register.username') || 'Username'}</label>
                        <input {...register('username')} placeholder="roconmachine" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.username ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('register.fullName') || 'Full Name'}</label>
                        <input {...register('fullName')} placeholder="John Doe" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('register.email') || 'Email Address'}</label>
                        <input type="email" {...register('email')} placeholder="you@example.com" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('register.password') || 'Password'}</label>
                        <input type="password" {...register('password')} placeholder="Min. 6 characters" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t('register.confirmPassword') || 'Confirm Password'}</label>
                        <input type="password" {...register('confirmPassword')} placeholder="Re-enter password" className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    <div className="flex items-start gap-2">
                        <input type="checkbox" {...register('agreeToTerms')} className="w-4 h-4 mt-1" />
                        <label className="text-sm text-gray-700">
                            <Trans i18nKey="register.agreeToTerms" components={{ a: <a className="text-indigo-600 hover:underline" href="#" /> }} />
                        </label>
                    </div>
                    {errors.agreeToTerms && <p className="text-xs text-red-600">{errors.agreeToTerms.message}</p>}

                    {error && <div className="text-sm text-red-600">{error}</div>}

                    <div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60" disabled={loading}>
                            {loading ? (t('register.signing') || 'Creating account...') : (t('register.signup') || 'Create Account')}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {t('register.haveAccount') || 'Already have an account?'}{' '}
                    <a className="text-indigo-600 hover:underline" href="/login">{t('register.signin') || 'Sign in here'}</a>
                </div>
            </div>
        </div>
    );
}