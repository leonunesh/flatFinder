import { Injectable } from '@angular/core';

// Firebase app
import { initializeApp } from 'firebase/app';

// Auth
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Firestore
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, addDoc, query, where } from 'firebase/firestore';

// Environment
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {

    private app: any;
    private auth: any;
    private db: any;

    constructor() {
        if (!environment.firebase || !environment.firebase.apiKey || !environment.firebase.projectId) {
            console.error('Firebase configuration is incomplete:', environment.firebase);
            throw new Error('Firebase configuration inválida. Verifique src/environments/environment.ts');
        }

        this.app = initializeApp(environment.firebase);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);

        console.log('FirebaseService inicializado');
        console.log('Firebase config:', environment.firebase);
        console.log('Firebase auth domain:', environment.firebase.authDomain);
    }

    async register(user: any) {
        console.log('FirebaseService.register chamado com:', user);
        const { email, password, firstName, lastName, birthDate } = user;

        try {
            console.log('Firebase Auth disponível:', !!this.auth);
            console.log('Firebase DB disponível:', !!this.db);

            console.log('Criando usuário no Auth...');
            const userCredential = await createUserWithEmailAndPassword(
                this.auth,
                email,
                password
            );
            console.log('Usuário criado no Auth:', userCredential.user.uid);

            const uid = userCredential.user.uid;

            console.log('Tentando salvar dados no Firestore...');
            const userDoc = {
                uid,
                firstName,
                lastName,
                email,
                birthDate,
                createdAt: new Date()
            };
            console.log('Dados a serem salvos:', userDoc);

            await setDoc(doc(this.db, 'users', uid), userDoc);
            console.log('Dados salvos no Firestore com sucesso');

            return userCredential;
        } catch (error: any) {
                if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
                console.error('Auth configuration error:', error.code, error.message);
            } else {
                console.error('Erro detalhado no registro:', {
                    code: error.code,
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
            }
            throw error;
        }
    }

    // Método de teste: apenas Auth
    async testAuthOnly(user: any) {
        const { email, password } = user;
        console.log('Testando apenas Auth com:', { email });
        return await createUserWithEmailAndPassword(this.auth, email, password);
    }

    // Método separado para salvar dados
    async saveUserData(uid: string, userData: any) {
        console.log('Salvando dados do usuário:', uid, userData);
        const userDoc = {
            uid,
            ...userData,
            createdAt: new Date()
        };
        await setDoc(doc(this.db, 'users', uid), userDoc);
        console.log('Dados salvos com sucesso');
    }
    async login(email: string, password: string) {
        return await signInWithEmailAndPassword(
            this.auth,
            email,
            password
        );
    }

    async logout() {
        await signOut(this.auth);
    }

    async isAdmin() {
        const user = this.auth.currentUser;

        if (!user) return false;

        const docRef = doc(this.db, 'users', user.uid);
        const snapshot = await getDoc(docRef);

        return snapshot.exists() && snapshot.data()['admin'] === true;
    }
    async getAllUsers() {
        const usersRef = collection(this.db, 'users');
        const snapshot = await getDocs(usersRef);

        return snapshot.docs.map(doc => doc.data());
    }
    async getCurrentUserData(): Promise<any | null> {
        const user = this.auth.currentUser;

        if (!user) return null;

        const docRef = doc(this.db, 'users', user.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            return snapshot.data();
        }

        return null;
    }

    async updateCurrentUserData(data: any) {
        const user = this.auth.currentUser;

        if (!user) return false;

        const docRef = doc(this.db, 'users', user.uid);
        await updateDoc(docRef, data);
        return true;
    }

    async sendMessage(toUserId: string, message: string) {
        const user = this.auth.currentUser;

        if (!user) return false;

        const messageData = {
            fromUserId: user.uid,
            toUserId,
            message,
            timestamp: new Date(),
            read: false
        };

        await addDoc(collection(this.db, 'messages'), messageData);
        return true;
    }

    async createFlat(flatData: any) {
        const user = this.auth.currentUser;

        if (!user) return null;

        const flatWithOwner = {
            ...flatData,
            ownerId: user.uid,
            createdAt: new Date()
        };

        const docRef = await addDoc(collection(this.db, 'flats'), flatWithOwner);
        return docRef.id;
    }

    async getUserFlats(): Promise<any[]> {
        const user = this.auth.currentUser;

        if (!user) return [];

        const flatsRef = collection(this.db, 'flats');
        const q = query(flatsRef, where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getAllFlats(): Promise<any[]> {
        const flatsRef = collection(this.db, 'flats');
        const snapshot = await getDocs(flatsRef);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getFlatById(flatId: string): Promise<any | null> {
        const docRef = doc(this.db, 'flats', flatId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            return {
                id: snapshot.id,
                ...snapshot.data()
            };
        }

        return null;
    }

    async updateFlat(flatId: string, flatData: any) {
        const docRef = doc(this.db, 'flats', flatId);
        await updateDoc(docRef, flatData);
        return true;
    }

}