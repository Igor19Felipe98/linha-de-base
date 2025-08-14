export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scenarios: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          project_data: Json
          calculation_result: Json
          created_at: string
          updated_at: string
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          project_data: Json
          calculation_result: Json
          created_at?: string
          updated_at?: string
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          project_data?: Json
          calculation_result?: Json
          created_at?: string
          updated_at?: string
          version?: number
        }
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