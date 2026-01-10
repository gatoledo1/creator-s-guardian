export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      classifications: {
        Row: {
          classified_at: string
          confidence: number | null
          id: string
          intent: Database["public"]["Enums"]["message_intent"]
          message_id: string
          priority: Database["public"]["Enums"]["message_priority"]
          suggested_reply: string | null
        }
        Insert: {
          classified_at?: string
          confidence?: number | null
          id?: string
          intent: Database["public"]["Enums"]["message_intent"]
          message_id: string
          priority: Database["public"]["Enums"]["message_priority"]
          suggested_reply?: string | null
        }
        Update: {
          classified_at?: string
          confidence?: number | null
          id?: string
          intent?: Database["public"]["Enums"]["message_intent"]
          message_id?: string
          priority?: Database["public"]["Enums"]["message_priority"]
          suggested_reply?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classifications_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: true
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      data_access_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          classification_status: string
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          instagram_message_id: string | null
          is_read: boolean | null
          received_at: string
          sender_avatar_url: string | null
          sender_followers_count: number | null
          sender_instagram_id: string
          sender_name: string | null
          sender_username: string | null
          workspace_id: string
        }
        Insert: {
          classification_status?: string
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          instagram_message_id?: string | null
          is_read?: boolean | null
          received_at?: string
          sender_avatar_url?: string | null
          sender_followers_count?: number | null
          sender_instagram_id: string
          sender_name?: string | null
          sender_username?: string | null
          workspace_id: string
        }
        Update: {
          classification_status?: string
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          instagram_message_id?: string | null
          is_read?: boolean | null
          received_at?: string
          sender_avatar_url?: string | null
          sender_followers_count?: number | null
          sender_instagram_id?: string
          sender_name?: string | null
          sender_username?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          data_retention_days: number | null
          display_name: string | null
          id: string
          instagram_access_token: string | null
          instagram_id: string | null
          instagram_token_encrypted: boolean | null
          instagram_username: string | null
          lgpd_consent_at: string | null
          lgpd_consent_version: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          data_retention_days?: number | null
          display_name?: string | null
          id?: string
          instagram_access_token?: string | null
          instagram_id?: string | null
          instagram_token_encrypted?: boolean | null
          instagram_username?: string | null
          lgpd_consent_at?: string | null
          lgpd_consent_version?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          data_retention_days?: number | null
          display_name?: string | null
          id?: string
          instagram_access_token?: string | null
          instagram_id?: string | null
          instagram_token_encrypted?: boolean | null
          instagram_username?: string | null
          lgpd_consent_at?: string | null
          lgpd_consent_version?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          blocked_at: string | null
          created_at: string
          expires_at: string
          grace_period_until: string | null
          id: string
          marked_for_deletion_at: string | null
          mercadopago_subscription_id: string | null
          plan: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          created_at?: string
          expires_at: string
          grace_period_until?: string | null
          id?: string
          marked_for_deletion_at?: string | null
          mercadopago_subscription_id?: string | null
          plan?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          created_at?: string
          expires_at?: string
          grace_period_until?: string | null
          id?: string
          marked_for_deletion_at?: string | null
          mercadopago_subscription_id?: string | null
          plan?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          instagram_page_id: string | null
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instagram_page_id?: string | null
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instagram_page_id?: string | null
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_data_export: {
        Row: {
          data_retention_days: number | null
          display_name: string | null
          instagram_username: string | null
          lgpd_consent_at: string | null
          profile_created_at: string | null
          total_messages: number | null
          user_id: string | null
          workspace_created_at: string | null
          workspace_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_encryption_key: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      message_intent: "partnership" | "fan" | "question" | "hate" | "spam"
      message_priority: "respond_now" | "can_wait" | "ignore"
      subscription_status:
        | "active"
        | "grace_period"
        | "blocked"
        | "pending_deletion"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      message_intent: ["partnership", "fan", "question", "hate", "spam"],
      message_priority: ["respond_now", "can_wait", "ignore"],
      subscription_status: [
        "active",
        "grace_period",
        "blocked",
        "pending_deletion",
      ],
    },
  },
} as const
