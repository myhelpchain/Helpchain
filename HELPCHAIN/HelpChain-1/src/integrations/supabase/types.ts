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
      deposits: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          payment_method: string | null
          paystack_reference: string | null
          status: string
          user_id: string
          webhook_verified: boolean | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_method?: string | null
          paystack_reference?: string | null
          status?: string
          user_id: string
          webhook_verified?: boolean | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_method?: string | null
          paystack_reference?: string | null
          status?: string
          user_id?: string
          webhook_verified?: boolean | null
        }
        Relationships: []
      }
      escrow_records: {
        Row: {
          amount: number
          dispute_id: string | null
          helper_id: string | null
          id: string
          locked_at: string
          platform_fee: number
          released_at: string | null
          released_to: string | null
          requester_id: string
          status: string
          task_id: string
        }
        Insert: {
          amount: number
          dispute_id?: string | null
          helper_id?: string | null
          id?: string
          locked_at?: string
          platform_fee?: number
          released_at?: string | null
          released_to?: string | null
          requester_id: string
          status?: string
          task_id: string
        }
        Update: {
          amount?: number
          dispute_id?: string | null
          helper_id?: string | null
          id?: string
          locked_at?: string
          platform_fee?: number
          released_at?: string | null
          released_to?: string | null
          requester_id?: string
          status?: string
          task_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string
          helper_id: string
          id: string
          is_price_suggestion: boolean | null
          message: string
          offered_amount: number | null
          responded_at: string | null
          status: string
          task_id: string
        }
        Insert: {
          created_at?: string
          helper_id: string
          id?: string
          is_price_suggestion?: boolean | null
          message: string
          offered_amount?: number | null
          responded_at?: string | null
          status?: string
          task_id: string
        }
        Update: {
          created_at?: string
          helper_id?: string
          id?: string
          is_price_suggestion?: boolean | null
          message?: string
          offered_amount?: number | null
          responded_at?: string | null
          status?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          base_currency: string | null
          bio: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          helps_given: number | null
          helps_received: number | null
          id: string
          is_featured: boolean | null
          location: string | null
          on_time_rate: number | null
          rating: number | null
          rating_count: number | null
          reputation_score: number | null
          response_time: string | null
          skills: string[] | null
          success_rate: number | null
          updated_at: string
          user_id: string
          verification_tier: number | null
        }
        Insert: {
          avatar_url?: string | null
          base_currency?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          helps_given?: number | null
          helps_received?: number | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          on_time_rate?: number | null
          rating?: number | null
          rating_count?: number | null
          reputation_score?: number | null
          response_time?: string | null
          skills?: string[] | null
          success_rate?: number | null
          updated_at?: string
          user_id: string
          verification_tier?: number | null
        }
        Update: {
          avatar_url?: string | null
          base_currency?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          helps_given?: number | null
          helps_received?: number | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          on_time_rate?: number | null
          rating?: number | null
          rating_count?: number | null
          reputation_score?: number | null
          response_time?: string | null
          skills?: string[] | null
          success_rate?: number | null
          updated_at?: string
          user_id?: string
          verification_tier?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_at: string | null
          budget: number
          category: string
          completed_at: string | null
          created_at: string
          description: string
          funded_from: string | null
          helper_id: string | null
          id: string
          location: string | null
          platform_fee: number
          requester_id: string
          status: string
          title: string
          urgency: string
        }
        Insert: {
          assigned_at?: string | null
          budget: number
          category: string
          completed_at?: string | null
          created_at?: string
          description: string
          funded_from?: string | null
          helper_id?: string | null
          id?: string
          location?: string | null
          platform_fee: number
          requester_id: string
          status?: string
          title: string
          urgency?: string
        }
        Update: {
          assigned_at?: string | null
          budget?: number
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string
          funded_from?: string | null
          helper_id?: string | null
          id?: string
          location?: string | null
          platform_fee?: number
          requester_id?: string
          status?: string
          title?: string
          urgency?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          reference: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          available_balance: number
          created_at: string
          currency: string
          escrow_balance: number
          id: string
          updated_at: string
          user_id: string
          wallet_status: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          currency?: string
          escrow_balance?: number
          id?: string
          updated_at?: string
          user_id: string
          wallet_status?: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          currency?: string
          escrow_balance?: number
          id?: string
          updated_at?: string
          user_id?: string
          wallet_status?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          bank_account_id: string | null
          completed_at: string | null
          created_at: string
          failure_reason: string | null
          id: string
          paystack_reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          completed_at?: string | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          paystack_reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          completed_at?: string | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          paystack_reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
