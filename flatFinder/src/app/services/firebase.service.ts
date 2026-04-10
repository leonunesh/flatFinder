import { Injectable } from '@angular/core';

// Firebase app
import { initializeApp } from 'firebase/app';

// Auth
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';

// Firestore
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, addDoc, query, where, deleteDoc, QueryDocumentSnapshot } from 'firebase/firestore';

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

        setPersistence(this.auth, browserLocalPersistence).catch(err => {
            console.warn('Could not set auth persistence:', err);
        });

        console.log('FirebaseService initialized');
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
        await setPersistence(this.auth, browserLocalPersistence);
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

        return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    }
    private waitForUser(): Promise<any | null> {
        const currentUser = this.auth.currentUser;
        if (currentUser) {
            return Promise.resolve(currentUser);
        }

        return new Promise(resolve => {
            let timeoutId: any;
            
            // Set timeout to resolve after 10 seconds
            timeoutId = setTimeout(() => {
                unsubscribe();
                resolve(null);
            }, 10000);

            const unsubscribe = onAuthStateChanged(this.auth, user => {
                clearTimeout(timeoutId);
                unsubscribe();
                resolve(user);
            }, (error) => {
                clearTimeout(timeoutId);
                unsubscribe();
                console.error('Auth state change error:', error);
                resolve(null);
            });
        });
    }

    async getCurrentUserData(): Promise<any | null> {
        const user = await this.waitForUser();

        if (!user) return null;

        const docRef = doc(this.db, 'users', user.uid);
        
        try {
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                return snapshot.data();
            }

            // If document doesn't exist, return user object with basic info
            // This prevents "userNotFound" if the document wasn't created yet
            return {
                uid: user.uid,
                email: user.email,
                firstName: '',
                lastName: '',
                birthDate: ''
            };
        } catch (error) {
            console.error('Error getting user data:', error);
            // Return user object even if Firestore fails
            return {
                uid: user.uid,
                email: user.email,
                firstName: '',
                lastName: '',
                birthDate: ''
            };
        }
    }

    async updateCurrentUserData(data: any) {
        const user = await this.waitForUser();

        if (!user) return false;

        const docRef = doc(this.db, 'users', user.uid);
        
        try {
            // Try to update first
            await updateDoc(docRef, data);
        } catch (error: any) {
            // If document doesn't exist, create it
            if (error.code === 'not-found') {
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    ...data,
                    createdAt: new Date()
                };
                await setDoc(docRef, userData);
            } else {
                throw error;
            }
        }
        
        return true;
    }

    async sendMessage(toUserId: string, message: string) {
        const user = await this.waitForUser();

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
        const user = await this.waitForUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const flatWithOwner = {
            ...flatData,
            ownerId: user.uid,
            userId: user.uid,
            createdAt: new Date()
        };

        const docRef = await addDoc(collection(this.db, 'flats'), flatWithOwner);
        return docRef.id;
    }

    async getUserFlats(): Promise<any[]> {
        const user = await this.waitForUser();

        if (!user) return [];

        const flatsRef = collection(this.db, 'flats');
        const snapshot = await getDocs(flatsRef);

        const flats = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data()
        }));

        return flats.filter((flat: any) => flat.ownerId === user.uid || flat.userId === user.uid);
    }

    async getAllFlats(): Promise<any[]> {
        await this.waitForUser();
        const flatsRef = collection(this.db, 'flats');
        const snapshot = await getDocs(flatsRef);

        return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getFlatById(flatId: string): Promise<any | null> {
        await this.waitForUser();
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

    async deleteFlat(flatId: string) {
        const docRef = doc(this.db, 'flats', flatId);
        await deleteDoc(docRef);
        return true;
    }

    async getCurrentUser() {
        return await this.waitForUser();
    }

    async getUserFavorites(): Promise<any[]> {
        const user = await this.waitForUser();
        if (!user) return [];

        const favoritesRef = collection(this.db, 'favorites');
        const q = query(favoritesRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    }

    async addToFavorites(flatId: string) {
        const user = await this.waitForUser();
        if (!user) return false;

        const favoriteData = {
            userId: user.uid,
            flatId,
            createdAt: new Date()
        };

        await addDoc(collection(this.db, 'favorites'), favoriteData);
        return true;
    }

    async removeFromFavorites(flatId: string) {
        const user = await this.waitForUser();
        if (!user) return false;

        const favoritesRef = collection(this.db, 'favorites');
        const q = query(favoritesRef, where('userId', '==', user.uid), where('flatId', '==', flatId));
        const snapshot = await getDocs(q);

        for (const doc of snapshot.docs) {
            await deleteDoc(doc.ref);
        }

        return true;
    }

}