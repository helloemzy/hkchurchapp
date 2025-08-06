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
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          language: 'zh-HK' | 'zh-CN' | 'en'
          timezone: string
          is_active: boolean
          last_seen_at: string | null
          email_verified: boolean
          phone_verified: boolean
          data_deleted: boolean
          deleted_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          language?: 'zh-HK' | 'zh-CN' | 'en'
          timezone?: string
          is_active?: boolean
          last_seen_at?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          data_deleted?: boolean
          deleted_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          language?: 'zh-HK' | 'zh-CN' | 'en'
          timezone?: string
          is_active?: boolean
          last_seen_at?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          data_deleted?: boolean
          deleted_at?: string | null
        }
      }
      user_roles: {
        Row: {
          user_id: string
          role: 'member' | 'group_leader' | 'pastor' | 'admin' | 'super_admin'
          assigned_by: string | null
          assigned_at: string
          expires_at: string | null
        }
        Insert: {
          user_id: string
          role: 'member' | 'group_leader' | 'pastor' | 'admin' | 'super_admin'
          assigned_by?: string | null
          assigned_at?: string
          expires_at?: string | null
        }
        Update: {
          user_id?: string
          role?: 'member' | 'group_leader' | 'pastor' | 'admin' | 'super_admin'
          assigned_by?: string | null
          assigned_at?: string
          expires_at?: string | null
        }
      }
      security_events: {
        Row: {
          id: string
          event_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          user_id: string | null
          ip_address: string
          user_agent: string
          details: Json
          created_at: string
          investigated: boolean
          false_positive: boolean
        }
        Insert: {
          id?: string
          event_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          user_id?: string | null
          ip_address: string
          user_agent: string
          details: Json
          created_at?: string
          investigated?: boolean
          false_positive?: boolean
        }
        Update: {
          id?: string
          event_type?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          user_id?: string | null
          ip_address?: string
          user_agent?: string
          details?: Json
          created_at?: string
          investigated?: boolean
          false_positive?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          operation: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          user_id: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          table_name: string
          operation: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          table_name?: string
          operation?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data?: Json | null
          new_data?: Json | null
          user_id?: string | null
          timestamp?: string
        }
      }
      user_consent: {
        Row: {
          id: string
          user_id: string
          purpose: string
          granted: boolean
          consent_method: 'explicit' | 'implicit'
          recorded_at: string
          ip_address: string
          user_agent: string
        }
        Insert: {
          id?: string
          user_id: string
          purpose: string
          granted: boolean
          consent_method: 'explicit' | 'implicit'
          recorded_at?: string
          ip_address: string
          user_agent: string
        }
        Update: {
          id?: string
          user_id?: string
          purpose?: string
          granted?: boolean
          consent_method?: 'explicit' | 'implicit'
          recorded_at?: string
          ip_address?: string
          user_agent?: string
        }
      }
      devotions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          title_zh: string | null
          content: string
          content_zh: string | null
          scripture_reference: string
          scripture_text: string
          scripture_text_zh: string | null
          date: string
          author: string
          reflection_questions: string[]
          reflection_questions_zh: string[] | null
          tags: string[]
          is_published: boolean
          featured: boolean
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          title_zh?: string | null
          content: string
          content_zh?: string | null
          scripture_reference: string
          scripture_text: string
          scripture_text_zh?: string | null
          date: string
          author: string
          reflection_questions: string[]
          reflection_questions_zh?: string[] | null
          tags?: string[]
          is_published?: boolean
          featured?: boolean
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          title_zh?: string | null
          content?: string
          content_zh?: string | null
          scripture_reference?: string
          scripture_text?: string
          scripture_text_zh?: string | null
          date?: string
          author?: string
          reflection_questions?: string[]
          reflection_questions_zh?: string[] | null
          tags?: string[]
          is_published?: boolean
          featured?: boolean
          image_url?: string | null
        }
      }
      user_devotion_progress: {
        Row: {
          id: string
          user_id: string
          devotion_id: string
          completed_at: string
          reflection_notes: string | null
          shared: boolean
          bookmarked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          devotion_id: string
          completed_at?: string
          reflection_notes?: string | null
          shared?: boolean
          bookmarked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          devotion_id?: string
          completed_at?: string
          reflection_notes?: string | null
          shared?: boolean
          bookmarked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bible_bookmarks: {
        Row: {
          id: string
          user_id: string
          book: string
          chapter: number
          verse: number
          verse_text: string
          verse_text_zh: string | null
          notes: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book: string
          chapter: number
          verse: number
          verse_text: string
          verse_text_zh?: string | null
          notes?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book?: string
          chapter?: number
          verse?: number
          verse_text?: string
          verse_text_zh?: string | null
          notes?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      prayer_requests: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: 'personal' | 'family' | 'health' | 'work' | 'church' | 'community' | 'other'
          is_public: boolean
          is_answered: boolean
          answered_at: string | null
          answered_description: string | null
          prayer_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category?: 'personal' | 'family' | 'health' | 'work' | 'church' | 'community' | 'other'
          is_public?: boolean
          is_answered?: boolean
          answered_at?: string | null
          answered_description?: string | null
          prayer_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: 'personal' | 'family' | 'health' | 'work' | 'church' | 'community' | 'other'
          is_public?: boolean
          is_answered?: boolean
          answered_at?: string | null
          answered_description?: string | null
          prayer_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      prayer_interactions: {
        Row: {
          id: string
          prayer_request_id: string
          user_id: string
          action: 'prayed' | 'amen' | 'support'
          created_at: string
        }
        Insert: {
          id?: string
          prayer_request_id: string
          user_id: string
          action: 'prayed' | 'amen' | 'support'
          created_at?: string
        }
        Update: {
          id?: string
          prayer_request_id?: string
          user_id?: string
          action?: 'prayed' | 'amen' | 'support'
          created_at?: string
        }
      }
      reading_streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_read_date: string
          total_devotions_read: number
          total_verses_read: number
          achievements: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_read_date?: string
          total_devotions_read?: number
          total_verses_read?: number
          achievements?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_read_date?: string
          total_devotions_read?: number
          total_verses_read?: number
          achievements?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          title_zh: string | null
          description: string
          description_zh: string | null
          category: 'worship' | 'fellowship' | 'study' | 'service' | 'community' | 'outreach'
          start_datetime: string
          end_datetime: string
          timezone: string
          location: string | null
          location_zh: string | null
          location_address: string | null
          max_capacity: number | null
          current_registrations: number
          requires_registration: boolean
          registration_deadline: string | null
          image_url: string | null
          organizer_id: string
          is_public: boolean
          is_featured: boolean
          is_cancelled: boolean
          cancellation_reason: string | null
          cost: number | null
          cost_currency: string
          contact_email: string | null
          contact_phone: string | null
          recurring_pattern: string | null
          tags: string[]
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          title_zh?: string | null
          description: string
          description_zh?: string | null
          category: 'worship' | 'fellowship' | 'study' | 'service' | 'community' | 'outreach'
          start_datetime: string
          end_datetime: string
          timezone?: string
          location?: string | null
          location_zh?: string | null
          location_address?: string | null
          max_capacity?: number | null
          current_registrations?: number
          requires_registration?: boolean
          registration_deadline?: string | null
          image_url?: string | null
          organizer_id: string
          is_public?: boolean
          is_featured?: boolean
          is_cancelled?: boolean
          cancellation_reason?: string | null
          cost?: number | null
          cost_currency?: string
          contact_email?: string | null
          contact_phone?: string | null
          recurring_pattern?: string | null
          tags?: string[]
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          title_zh?: string | null
          description?: string
          description_zh?: string | null
          category?: 'worship' | 'fellowship' | 'study' | 'service' | 'community' | 'outreach'
          start_datetime?: string
          end_datetime?: string
          timezone?: string
          location?: string | null
          location_zh?: string | null
          location_address?: string | null
          max_capacity?: number | null
          current_registrations?: number
          requires_registration?: boolean
          registration_deadline?: string | null
          image_url?: string | null
          organizer_id?: string
          is_public?: boolean
          is_featured?: boolean
          is_cancelled?: boolean
          cancellation_reason?: string | null
          cost?: number | null
          cost_currency?: string
          contact_email?: string | null
          contact_phone?: string | null
          recurring_pattern?: string | null
          tags?: string[]
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: 'registered' | 'waitlisted' | 'cancelled'
          registered_at: string
          attendance_confirmed: boolean
          attended_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: 'registered' | 'waitlisted' | 'cancelled'
          registered_at?: string
          attendance_confirmed?: boolean
          attended_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: 'registered' | 'waitlisted' | 'cancelled'
          registered_at?: string
          attendance_confirmed?: boolean
          attended_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      small_groups: {
        Row: {
          id: string
          name: string
          name_zh: string | null
          description: string
          description_zh: string | null
          category: 'bible_study' | 'prayer' | 'fellowship' | 'discipleship' | 'service' | 'youth' | 'seniors' | 'couples' | 'singles'
          max_members: number | null
          current_members: number
          leader_id: string
          co_leaders: string[]
          meeting_schedule: string | null
          meeting_location: string | null
          meeting_location_zh: string | null
          is_open_to_join: boolean
          requires_approval: boolean
          is_public: boolean
          image_url: string | null
          contact_method: 'whatsapp' | 'email' | 'phone' | 'app_only'
          contact_details: string | null
          age_range: string | null
          gender_preference: 'mixed' | 'male_only' | 'female_only'
          language_primary: 'zh-HK' | 'zh-CN' | 'en' | 'mixed'
          tags: string[]
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_zh?: string | null
          description: string
          description_zh?: string | null
          category: 'bible_study' | 'prayer' | 'fellowship' | 'discipleship' | 'service' | 'youth' | 'seniors' | 'couples' | 'singles'
          max_members?: number | null
          current_members?: number
          leader_id: string
          co_leaders?: string[]
          meeting_schedule?: string | null
          meeting_location?: string | null
          meeting_location_zh?: string | null
          is_open_to_join?: boolean
          requires_approval?: boolean
          is_public?: boolean
          image_url?: string | null
          contact_method?: 'whatsapp' | 'email' | 'phone' | 'app_only'
          contact_details?: string | null
          age_range?: string | null
          gender_preference?: 'mixed' | 'male_only' | 'female_only'
          language_primary?: 'zh-HK' | 'zh-CN' | 'en' | 'mixed'
          tags?: string[]
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_zh?: string | null
          description?: string
          description_zh?: string | null
          category?: 'bible_study' | 'prayer' | 'fellowship' | 'discipleship' | 'service' | 'youth' | 'seniors' | 'couples' | 'singles'
          max_members?: number | null
          current_members?: number
          leader_id?: string
          co_leaders?: string[]
          meeting_schedule?: string | null
          meeting_location?: string | null
          meeting_location_zh?: string | null
          is_open_to_join?: boolean
          requires_approval?: boolean
          is_public?: boolean
          image_url?: string | null
          contact_method?: 'whatsapp' | 'email' | 'phone' | 'app_only'
          contact_details?: string | null
          age_range?: string | null
          gender_preference?: 'mixed' | 'male_only' | 'female_only'
          language_primary?: 'zh-HK' | 'zh-CN' | 'en' | 'mixed'
          tags?: string[]
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      group_memberships: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'member' | 'co_leader' | 'leader'
          status: 'active' | 'pending' | 'inactive' | 'removed'
          joined_at: string
          approved_by: string | null
          approved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'member' | 'co_leader' | 'leader'
          status?: 'active' | 'pending' | 'inactive' | 'removed'
          joined_at?: string
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'member' | 'co_leader' | 'leader'
          status?: 'active' | 'pending' | 'inactive' | 'removed'
          joined_at?: string
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      group_activities: {
        Row: {
          id: string
          group_id: string
          activity_type: 'meeting' | 'study' | 'prayer' | 'fellowship' | 'service' | 'announcement'
          title: string
          title_zh: string | null
          description: string | null
          description_zh: string | null
          scheduled_for: string | null
          created_by: string
          participants: string[]
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          activity_type: 'meeting' | 'study' | 'prayer' | 'fellowship' | 'service' | 'announcement'
          title: string
          title_zh?: string | null
          description?: string | null
          description_zh?: string | null
          scheduled_for?: string | null
          created_by: string
          participants?: string[]
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          activity_type?: 'meeting' | 'study' | 'prayer' | 'fellowship' | 'service' | 'announcement'
          title?: string
          title_zh?: string | null
          description?: string | null
          description_zh?: string | null
          scheduled_for?: string | null
          created_by?: string
          participants?: string[]
          metadata?: Json | null
          created_at?: string
          updated_at?: string
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
      user_role: 'member' | 'group_leader' | 'pastor' | 'admin' | 'super_admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}