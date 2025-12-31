import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const auth = {
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database operations
export const db = {
  // Cases
  getCases: async (userId) => {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("lawyer_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  getCase: async (caseId) => {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();
    return { data, error };
  },

  createCase: async (caseData) => {
    const { data, error } = await supabase
      .from("cases")
      .insert([caseData])
      .select()
      .single();
    return { data, error };
  },

  updateCase: async (caseId, updates) => {
    const { data, error } = await supabase
      .from("cases")
      .update(updates)
      .eq("id", caseId)
      .select()
      .single();
    return { data, error };
  },

  deleteCase: async (caseId) => {
    const { error } = await supabase.from("cases").delete().eq("id", caseId);
    return { error };
  },

  // Documents
  getDocuments: async (caseId) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  createDocument: async (documentData) => {
    const { data, error } = await supabase
      .from("documents")
      .insert([documentData])
      .select()
      .single();
    return { data, error };
  },

  deleteDocument: async (documentId) => {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);
    return { error };
  },

  // Notes
  getNotes: async (caseId) => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  createNote: async (noteData) => {
    const { data, error } = await supabase
      .from("notes")
      .insert([noteData])
      .select()
      .single();
    return { data, error };
  },

  updateNote: async (noteId, updates) => {
    const { data, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", noteId)
      .select()
      .single();
    return { data, error };
  },

  deleteNote: async (noteId) => {
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    return { error };
  },

  // Speeches
  getSpeeches: async (caseId) => {
    const { data, error } = await supabase
      .from("speeches")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  createSpeech: async (speechData) => {
    const { data, error } = await supabase
      .from("speeches")
      .insert([speechData])
      .select()
      .single();
    return { data, error };
  },

  updateSpeech: async (speechId, updates) => {
    const { data, error } = await supabase
      .from("speeches")
      .update(updates)
      .eq("id", speechId)
      .select()
      .single();
    return { data, error };
  },

  deleteSpeech: async (speechId) => {
    const { error } = await supabase
      .from("speeches")
      .delete()
      .eq("id", speechId);
    return { error };
  },
};

// Storage operations
export const storage = {
  uploadFile: async (userId, caseId, file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${userId}/${caseId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("case-documents")
      .upload(filePath, file);

    return { data, error, filePath };
  },

  getFileUrl: async (filePath) => {
    const { data, error } = await supabase.storage
      .from("case-documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return { url: data?.signedUrl, error };
  },

  deleteFile: async (filePath) => {
    const { error } = await supabase.storage
      .from("case-documents")
      .remove([filePath]);

    return { error };
  },
};
