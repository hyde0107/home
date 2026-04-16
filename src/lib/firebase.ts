import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// @ts-ignore
import firebaseConfigRaw from '../../firebase-config.json';

const firebaseConfig = firebaseConfigRaw as Record<string, string>;
const isConfigured = Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);

// 設定が存在する場合のみ初期化
export const app = isConfigured && getApps().length === 0 ? initializeApp(firebaseConfig) : (getApps().length > 0 ? getApp() : null);
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  if (!auth) throw new Error("Firebaseが設定されていません。firebase-config.jsonを確認してください。");
  return signInWithPopup(auth, provider);
};

export const logout = async () => {
  if (!auth) throw new Error("Firebaseが設定されていません。");
  return signOut(auth);
};
