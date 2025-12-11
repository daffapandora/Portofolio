"use client";

import { useState, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
  DocumentData,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FirestoreHookReturn<T> {
  data: T | T[] | null;
  loading: boolean;
  error: string | null;
  add: (collectionName: string, data: Omit<T, "id">) => Promise<string>;
  update: (collectionName: string, id: string, data: Partial<T>) => Promise<void>;
  remove: (collectionName: string, id: string) => Promise<void>;
  getOne: (collectionName: string, id: string) => Promise<T | null>;
  getAll: (collectionName: string, constraints?: QueryConstraint[]) => Promise<T[]>;
}

export function useFirestore<T extends DocumentData>(): FirestoreHookReturn<T> {
  const [data, setData] = useState<T | T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(async (collectionName: string, docData: Omit<T, "id">): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...docData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add document";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (collectionName: string, id: string, docData: Partial<T>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...docData,
        updatedAt: serverTimestamp(),
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update document";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (collectionName: string, id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete document";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOne = useCallback(async (collectionName: string, id: string): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const result = { id: snapshot.id, ...snapshot.data() } as unknown as T;
        setData(result);
        return result;
      }
      setData(null);
      return null;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get document";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAll = useCallback(async (collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as T[];
      setData(results);
      return results;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get documents";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    add,
    update,
    remove,
    getOne,
    getAll,
  };
}

// Helper hook for messages
export function useMessages() {
  const firestore = useFirestore();
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await firestore.getAll("messages");
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  const markAsRead = useCallback(async (id: string) => {
    await firestore.update("messages", id, { read: true });
    await fetchMessages();
  }, [firestore, fetchMessages]);

  const deleteMessage = useCallback(async (id: string) => {
    await firestore.remove("messages", id);
    await fetchMessages();
  }, [firestore, fetchMessages]);

  return {
    messages,
    loading,
    fetchMessages,
    markAsRead,
    deleteMessage,
  };
}
