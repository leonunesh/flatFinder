import { Injectable } from '@angular/core';

// Firebase app
import { initializeApp } from 'firebase/app';

// Auth
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Firestore
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

// Environment
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {

    private app = initializeApp(environment.firebase);
    private auth = getAuth(this.app);
    private db = getFirestore(this.app);

    async register(user: any) {
        const { email, password, firstName, lastName, birthDate } = user;

        const userCredential = await createUserWithEmailAndPassword(
            this.auth,
            email,
            password
        );

        const uid = userCredential.user.uid;

        await setDoc(doc(this.db, 'users', uid), {
            uid,
            firstName,
            lastName,
            email,
            birthDate,
            createdAt: new Date()
        });
    }
    async login(email: string, password: string) {
        return await signInWithEmailAndPassword(
            this.auth,
            email,
            password
        );
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
    async getCurrentUserData() {
        const user = this.auth.currentUser;

        if (!user) return null;

        const docRef = doc(this.db, 'users', user.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            return snapshot.data();
        }

        return null;
    }

}