import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore'

import { db } from '../lib/firebase'

export type Task = {
    id: string
    title: string
    completed: boolean
}

export async function addTask(
    userId: string,
    title: string
) {
    const tasksRef = collection(db, 'users', userId, 'tasks')

    return addDoc(tasksRef, {
        title,
        completed: false,
        createdAt: new Date(),
    })
}

export function getTasks(
    userId: string,
    callback: (tasks: Task[]) => void
) {
    const tasksRef = collection(db, 'users', userId, 'tasks')

    const tasksQuery = query(
        tasksRef,
        orderBy('createdAt', 'desc')
    )

    return onSnapshot(tasksQuery, (snapshot) => {
        const tasks = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
        })) as Task[]

        callback(tasks)
    })
}

export async function updateTask(
    userId: string,
    taskId: string,
    completed: boolean
) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId)

    return updateDoc(taskRef, {
        completed,
    })
}

export async function removeTask(
    userId: string,
    taskId: string
) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId)

    return deleteDoc(taskRef)
}