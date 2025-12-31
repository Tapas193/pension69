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
      beneficiary_schemes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          beneficiary_id: string
          enrolled_at: string | null
          id: string
          remarks: string | null
          scheme_id: string
          status: Database["public"]["Enums"]["scheme_status"] | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_id: string
          enrolled_at?: string | null
          id?: string
          remarks?: string | null
          scheme_id: string
          status?: Database["public"]["Enums"]["scheme_status"] | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          beneficiary_id?: string
          enrolled_at?: string | null
          id?: string
          remarks?: string | null
          scheme_id?: string
          status?: Database["public"]["Enums"]["scheme_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_schemes_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_schemes_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "welfare_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_alerts: {
        Row: {
          action_taken: string | null
          alert_type: string
          beneficiary_id: string | null
          description: string
          detected_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string | null
          status: string | null
        }
        Insert: {
          action_taken?: string | null
          alert_type: string
          beneficiary_id?: string | null
          description: string
          detected_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
        }
        Update: {
          action_taken?: string | null
          alert_type?: string
          beneficiary_id?: string | null
          description?: string
          detected_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grievances: {
        Row: {
          admin_response: string | null
          assigned_to: string | null
          beneficiary_id: string
          category: string
          created_at: string | null
          description: string
          id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["grievance_status"] | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          admin_response?: string | null
          assigned_to?: string | null
          beneficiary_id: string
          category: string
          created_at?: string | null
          description: string
          id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["grievance_status"] | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          admin_response?: string | null
          assigned_to?: string | null
          beneficiary_id?: string
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["grievance_status"] | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grievances_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          message_hindi: string | null
          title: string
          title_hindi: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          message_hindi?: string | null
          title: string
          title_hindi?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          message_hindi?: string | null
          title?: string
          title_hindi?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          beneficiary_id: string
          created_at: string | null
          failure_reason: string | null
          id: string
          payment_date: string | null
          processed_at: string | null
          retry_count: number | null
          scheme_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          beneficiary_id: string
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          payment_date?: string | null
          processed_at?: string | null
          retry_count?: number | null
          scheme_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          beneficiary_id?: string
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          payment_date?: string | null
          processed_at?: string | null
          retry_count?: number | null
          scheme_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "welfare_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aadhaar_masked: string | null
          address: string | null
          annual_income: number | null
          avatar_url: string | null
          bank_account_masked: string | null
          created_at: string | null
          date_of_birth: string | null
          district: string | null
          email_verified: boolean | null
          employment_status: string | null
          full_name: string
          full_name_hindi: string | null
          gender: string | null
          id: string
          is_disabled: boolean | null
          phone: string
          phone_verified: boolean | null
          rejection_reason: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          aadhaar_masked?: string | null
          address?: string | null
          annual_income?: number | null
          avatar_url?: string | null
          bank_account_masked?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          district?: string | null
          email_verified?: boolean | null
          employment_status?: string | null
          full_name: string
          full_name_hindi?: string | null
          gender?: string | null
          id?: string
          is_disabled?: boolean | null
          phone: string
          phone_verified?: boolean | null
          rejection_reason?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          aadhaar_masked?: string | null
          address?: string | null
          annual_income?: number | null
          avatar_url?: string | null
          bank_account_masked?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          district?: string | null
          email_verified?: boolean | null
          employment_status?: string | null
          full_name?: string
          full_name_hindi?: string | null
          gender?: string | null
          id?: string
          is_disabled?: boolean | null
          phone?: string
          phone_verified?: boolean | null
          rejection_reason?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      welfare_schemes: {
        Row: {
          created_at: string | null
          description: string | null
          description_hindi: string | null
          eligibility_criteria: Json | null
          id: string
          is_active: boolean | null
          max_age: number | null
          max_income: number | null
          min_age: number | null
          monthly_amount: number
          name: string
          name_hindi: string | null
          requires_disability: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_hindi?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          max_age?: number | null
          max_income?: number | null
          min_age?: number | null
          monthly_amount: number
          name: string
          name_hindi?: string | null
          requires_disability?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_hindi?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          max_age?: number | null
          max_income?: number | null
          min_age?: number | null
          monthly_amount?: number
          name?: string
          name_hindi?: string | null
          requires_disability?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "scheme_officer"
        | "auditor"
        | "support_staff"
        | "beneficiary"
      beneficiary_status: "active" | "pending" | "suspended" | "rejected"
      grievance_status: "submitted" | "under_review" | "resolved" | "rejected"
      payment_status: "successful" | "pending" | "failed"
      scheme_status: "active" | "pending" | "suspended"
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
      app_role: [
        "super_admin",
        "scheme_officer",
        "auditor",
        "support_staff",
        "beneficiary",
      ],
      beneficiary_status: ["active", "pending", "suspended", "rejected"],
      grievance_status: ["submitted", "under_review", "resolved", "rejected"],
      payment_status: ["successful", "pending", "failed"],
      scheme_status: ["active", "pending", "suspended"],
    },
  },
} as const
