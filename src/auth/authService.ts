
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User,
} from 'firebase/auth'

import { auth } from '../lib/firebase'

export async function registerUser(
    email: string,
    password: string
) {
    return createUserWithEmailAndPassword(auth, email, password)
}

export async function loginUser(
    email: string,
    password: string
) {
    return signInWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
    return signOut(auth)
}

export function observeAuthState(
    callback: (user: User | null) => void
) {
    return onAuthStateChanged(auth, callback)
}
