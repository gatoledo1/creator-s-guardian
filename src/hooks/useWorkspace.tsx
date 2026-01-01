import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Workspace = Tables<"workspaces">;

export function useWorkspace() {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      setWorkspace(null);
      setLoading(false);
      setIsConnected(false);
      return;
    }

    fetchWorkspace();
  }, [user]);

  const fetchWorkspace = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setWorkspace(data);
      setIsConnected(!!data?.instagram_page_id);
    } catch (err) {
      console.error('Error fetching workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    workspace,
    loading,
    isConnected,
    refetch: fetchWorkspace,
  };
}
