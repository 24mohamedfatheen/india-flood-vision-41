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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      emergency_reports: {
        Row: {
          contact_number: string
          created_at: string
          has_disabled: boolean | null
          has_medical_needs: boolean | null
          has_water_food: boolean | null
          id: string
          location: string
          medical_details: string | null
          name: string
          num_people: number
          situation_description: string
          status: string
          updated_at: string
          urgency_level: string
          water_food_duration: string | null
        }
        Insert: {
          contact_number: string
          created_at?: string
          has_disabled?: boolean | null
          has_medical_needs?: boolean | null
          has_water_food?: boolean | null
          id?: string
          location: string
          medical_details?: string | null
          name: string
          num_people: number
          situation_description: string
          status?: string
          updated_at?: string
          urgency_level: string
          water_food_duration?: string | null
        }
        Update: {
          contact_number?: string
          created_at?: string
          has_disabled?: boolean | null
          has_medical_needs?: boolean | null
          has_water_food?: boolean | null
          id?: string
          location?: string
          medical_details?: string | null
          name?: string
          num_people?: number
          situation_description?: string
          status?: string
          updated_at?: string
          urgency_level?: string
          water_food_duration?: string | null
        }
        Relationships: []
      }
      indian_reservoir_levels: {
        Row: {
          agency_name: string | null
          basin: string | null
          capacity_mcm: number | null
          current_level_mcm: number | null
          date: string | null
          district: string | null
          full_reservoir_level: number | null
          id: number
          inflow_cusecs: number | null
          ingestion_timestamp: string | null
          last_updated: string
          lat: number | null
          level: number | null
          live_capacity_frl: number | null
          long: number | null
          month: string | null
          outflow_cusecs: number | null
          percentage_full: number | null
          reservoir_name: string
          state: string | null
          status: string | null
          storage: number | null
          subbasin: string | null
          year: number | null
        }
        Insert: {
          agency_name?: string | null
          basin?: string | null
          capacity_mcm?: number | null
          current_level_mcm?: number | null
          date?: string | null
          district?: string | null
          full_reservoir_level?: number | null
          id?: number
          inflow_cusecs?: number | null
          ingestion_timestamp?: string | null
          last_updated?: string
          lat?: number | null
          level?: number | null
          live_capacity_frl?: number | null
          long?: number | null
          month?: string | null
          outflow_cusecs?: number | null
          percentage_full?: number | null
          reservoir_name: string
          state?: string | null
          status?: string | null
          storage?: number | null
          subbasin?: string | null
          year?: number | null
        }
        Update: {
          agency_name?: string | null
          basin?: string | null
          capacity_mcm?: number | null
          current_level_mcm?: number | null
          date?: string | null
          district?: string | null
          full_reservoir_level?: number | null
          id?: number
          inflow_cusecs?: number | null
          ingestion_timestamp?: string | null
          last_updated?: string
          lat?: number | null
          level?: number | null
          live_capacity_frl?: number | null
          long?: number | null
          month?: string | null
          outflow_cusecs?: number | null
          percentage_full?: number | null
          reservoir_name?: string
          state?: string | null
          status?: string | null
          storage?: number | null
          subbasin?: string | null
          year?: number | null
        }
        Relationships: []
      }
      monthly_rainfall_data: {
        Row: {
          avg_daily_rainfall_mm: number | null
          created_at: string | null
          district: string | null
          id: string
          location: string
          max_daily_rainfall_mm: number | null
          month: number
          rainy_days_count: number | null
          state: string | null
          total_rainfall_mm: number
          updated_at: string | null
          year: number
        }
        Insert: {
          avg_daily_rainfall_mm?: number | null
          created_at?: string | null
          district?: string | null
          id?: string
          location: string
          max_daily_rainfall_mm?: number | null
          month: number
          rainy_days_count?: number | null
          state?: string | null
          total_rainfall_mm: number
          updated_at?: string | null
          year: number
        }
        Update: {
          avg_daily_rainfall_mm?: number | null
          created_at?: string | null
          district?: string | null
          id?: string
          location?: string
          max_daily_rainfall_mm?: number | null
          month?: number
          rainy_days_count?: number | null
          state?: string | null
          total_rainfall_mm?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      my_test_table: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: never
          name?: string | null
        }
        Update: {
          id?: never
          name?: string | null
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
