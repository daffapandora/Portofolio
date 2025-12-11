"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  QueryConstraint,
} from "firebase/firestore";
import { db, COLLECTIONS, Project } from "@/lib/firebase";

interface UseProjectsOptions {
  category?: string;
  status?: "draft" | "published";
  featured?: boolean;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  limit?: number;
}

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(() => {
    setLoading(true);
    setError(null);

    const constraints: QueryConstraint[] = [];

    if (options.category) {
      constraints.push(where("category", "==", options.category));
    }
    if (options.status) {
      constraints.push(where("status", "==", options.status));
    }
    if (options.featured !== undefined) {
      constraints.push(where("featured", "==", options.featured));
    }
    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || "desc"));
    } else {
      constraints.push(orderBy("createdAt", "desc"));
    }

    const q = query(collection(db, COLLECTIONS.PROJECTS), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Project[];
        setProjects(projectsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching projects:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [options.category, options.status, options.featured, options.orderByField, options.orderDirection]);

  useEffect(() => {
    const unsubscribe = fetchProjects();
    return () => unsubscribe();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}

export function useProject(id: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProject({
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as Project);
        } else {
          setProject(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching project:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return { project, loading, error };
}

// Static fetch function for server components
export async function getProjects(options: UseProjectsOptions = {}): Promise<Project[]> {
  const constraints: QueryConstraint[] = [];

  if (options.category) {
    constraints.push(where("category", "==", options.category));
  }
  if (options.status) {
    constraints.push(where("status", "==", options.status));
  }
  if (options.featured !== undefined) {
    constraints.push(where("featured", "==", options.featured));
  }
  if (options.orderByField) {
    constraints.push(orderBy(options.orderByField, options.orderDirection || "desc"));
  } else {
    constraints.push(orderBy("createdAt", "desc"));
  }

  const q = query(collection(db, COLLECTIONS.PROJECTS), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const docRef = doc(db, COLLECTIONS.PROJECTS, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as Project;
}
