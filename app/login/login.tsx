import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useDocumentTitle from 'app/common/use-document-title';
import './login.css';
import axios from 'axios';
import SHA1 from 'crypto-js/sha1';
import isLoggedIn from 'app/utils/utils';

type FormValues = {
	username: string;
	password: string;
	remember?: boolean;
};

const schema = yup.object({
	username: yup.string().required('Username is required'),
	password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
}).required();

export default function Login() {
	const { t } = useTranslation();
	useDocumentTitle(t('login.title') || 'Login');
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
		resolver: yupResolver(schema),
		defaultValues: { username: '', password: '', remember: false }
	});

	useEffect(() => {
		// If already logged in, redirect to home
		if(isLoggedIn()) {
			navigate('/home');
		}
	}, []);
	

	const onSubmit = async (data: FormValues) => {
		console.log('onSubmit called with data:', data);
		setError(null);
		setLoading(true);
		try {
			// Hash the password using SHA1
			const hashedPassword = SHA1(data.password).toString();
			console.log('Password hashed');

			// Pass username and hashed password as query parameters
			const loginResponse = await axios.get('/api/auth/login', {
				params: {
					username: data.username,
					password: hashedPassword
				}
			});
			console.log('API response:', loginResponse.status);

			if (loginResponse && loginResponse.status === 200) {
				// Save username in session for later use
				try {
					sessionStorage.setItem('username', data.username);
					sessionStorage.setItem('access', JSON.stringify(loginResponse.data));
				} catch (err) {
					// ignore storage errors (e.g., safari private mode)
				}
				// On success navigate to home
				navigate('/home');
			} else {
				// No response body expected — use generic failure message
				setError(t('login.failed') || 'Login failed');
			}
		} catch (e: any) {
			// Try to extract a helpful message from axios error
			const msg = e?.response?.data?.message || e?.message || t('login.failed') || 'Login failed';
			console.error('Login error:', msg);
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
					<h2 className="mt-4 text-2xl font-semibold">{t('login.title') || 'Sign in to your account'}</h2>
					<p className="text-sm text-gray-500 mt-2">{t('login.subtitle') || 'Enter your credentials to continue'}</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">{t('login.username') || 'Username or email'}</label>
						<input {...register('username')} className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.username ? 'border-red-500' : 'border-gray-300'}`} />
						{errors.username && <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>}
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">{t('login.password') || 'Password'}</label>
						<input type="password" {...register('password')} className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
						{errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
					</div>

					<div className="flex items-center justify-between text-sm">
						<label className="flex items-center gap-2">
							<input type="checkbox" {...register('remember')} className="w-4 h-4" />
							<span>{t('login.remember') || 'Remember me'}</span>
						</label>
						<a className="text-indigo-600 hover:underline" href="#">{t('login.forgot') || 'Forgot password?'}</a>
					</div>

					{error && <div className="text-sm text-red-600">{error}</div>}

					<div>
						<button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60" disabled={loading}>
							{loading ? (t('login.signing') || 'Signing in...') : (t('login.signin') || 'Sign in')}
						</button>
					</div>
				</form>

				<div className="mt-6 text-center text-sm text-gray-600">
					<a className="text-indigo-600 hover:underline" href="register">{t('login.register') || 'Signup?'}</a>
				</div>
			</div>
		</div>
	);
}


