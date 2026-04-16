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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          created_at: string
          id: string
          messages: Json
          site_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          site_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          site_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      albums: {
        Row: {
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          group_id: string | null
          id: string
          site_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          site_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          site_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "albums_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "albums_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reactions: {
        Row: {
          announcement_id: string | null
          created_at: string | null
          emoji: string
          id: string
          user_id: string | null
        }
        Insert: {
          announcement_id?: string | null
          created_at?: string | null
          emoji: string
          id?: string
          user_id?: string | null
        }
        Update: {
          announcement_id?: string | null
          created_at?: string | null
          emoji?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reactions_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_translations: {
        Row: {
          announcement_id: string | null
          content: string
          id: string
          language: string
          title: string | null
          translated_at: string | null
        }
        Insert: {
          announcement_id?: string | null
          content: string
          id?: string
          language: string
          title?: string | null
          translated_at?: string | null
        }
        Update: {
          announcement_id?: string | null
          content?: string
          id?: string
          language?: string
          title?: string | null
          translated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_translations_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          attachments: Json | null
          author_id: string | null
          auto_translate: boolean | null
          body: string
          created_at: string | null
          expires_at: string | null
          group_id: string | null
          id: string
          original_language: string | null
          pinned: boolean | null
          published_at: string | null
          site_id: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          auto_translate?: boolean | null
          body: string
          created_at?: string | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          original_language?: string | null
          pinned?: boolean | null
          published_at?: string | null
          site_id?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          auto_translate?: boolean | null
          body?: string
          created_at?: string | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          original_language?: string | null
          pinned?: boolean | null
          published_at?: string | null
          site_id?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      annual_events: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          day: number | null
          description: string | null
          event_date: string | null
          event_type: string | null
          id: string
          month: number | null
          notes: string | null
          recurs: boolean
          site_id: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          day?: number | null
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          month?: number | null
          notes?: string | null
          recurs?: boolean
          site_id: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          day?: number | null
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          id?: string
          month?: number | null
          notes?: string | null
          recurs?: boolean
          site_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "annual_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          absence_note: string | null
          absence_reason: string | null
          check_in_at: string | null
          check_out_at: string | null
          child_id: string | null
          created_at: string | null
          date: string
          id: string
          reported_by: string | null
          site_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          absence_note?: string | null
          absence_reason?: string | null
          check_in_at?: string | null
          check_out_at?: string | null
          child_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          reported_by?: string | null
          site_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          absence_note?: string | null
          absence_reason?: string | null
          check_in_at?: string | null
          check_out_at?: string | null
          child_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          reported_by?: string | null
          site_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          record_id: string | null
          site_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          site_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          site_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      bulletin_posts: {
        Row: {
          author_id: string
          category: string | null
          content: string | null
          created_at: string | null
          group_id: string | null
          id: string
          is_pinned: boolean
          photo_urls: string[] | null
          pinned: boolean
          site_id: string
          title: string
        }
        Insert: {
          author_id: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_pinned?: boolean
          photo_urls?: string[] | null
          pinned?: boolean
          site_id: string
          title: string
        }
        Update: {
          author_id?: string
          category?: string | null
          content?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          is_pinned?: boolean
          photo_urls?: string[] | null
          pinned?: boolean
          site_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulletin_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulletin_posts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      child_documents: {
        Row: {
          child_id: string
          created_at: string | null
          description: string | null
          doc_type: string | null
          document_type: string | null
          file_url: string | null
          id: string
          site_id: string | null
          title: string
          uploaded_by: string | null
          visible_to_parents: boolean
        }
        Insert: {
          child_id: string
          created_at?: string | null
          description?: string | null
          doc_type?: string | null
          document_type?: string | null
          file_url?: string | null
          id?: string
          site_id?: string | null
          title?: string
          uploaded_by?: string | null
          visible_to_parents?: boolean
        }
        Update: {
          child_id?: string
          created_at?: string | null
          description?: string | null
          doc_type?: string | null
          document_type?: string | null
          file_url?: string | null
          id?: string
          site_id?: string | null
          title?: string
          uploaded_by?: string | null
          visible_to_parents?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "child_documents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_documents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      child_handover_checks: {
        Row: {
          check_date: string
          child_id: string
          completed: boolean
          created_at: string | null
          date: string | null
          id: string
          items: Json | null
          notes: string | null
          staff_id: string | null
          status: string
          type: string | null
        }
        Insert: {
          check_date?: string
          child_id: string
          completed?: boolean
          created_at?: string | null
          date?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          staff_id?: string | null
          status?: string
          type?: string | null
        }
        Update: {
          check_date?: string
          child_id?: string
          completed?: boolean
          created_at?: string | null
          date?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          staff_id?: string | null
          status?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_handover_checks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          address: string | null
          allergies: string | null
          care_days: string[] | null
          care_end_time: string | null
          care_start_time: string | null
          care_type: string | null
          created_at: string | null
          date_of_birth: string | null
          desired_start_date: string | null
          doctor_name: string | null
          doctor_phone: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          end_date: string | null
          first_name: string
          gender: string | null
          group_id: string | null
          has_sibling: boolean | null
          id: string
          last_name: string
          medical_notes: string | null
          monthly_fee: number | null
          photo_url: string | null
          single_parent: boolean | null
          site_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          care_days?: string[] | null
          care_end_time?: string | null
          care_start_time?: string | null
          care_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          desired_start_date?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          end_date?: string | null
          first_name: string
          gender?: string | null
          group_id?: string | null
          has_sibling?: boolean | null
          id?: string
          last_name: string
          medical_notes?: string | null
          monthly_fee?: number | null
          photo_url?: string | null
          single_parent?: boolean | null
          site_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          care_days?: string[] | null
          care_end_time?: string | null
          care_start_time?: string | null
          care_type?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          desired_start_date?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          end_date?: string | null
          first_name?: string
          gender?: string | null
          group_id?: string | null
          has_sibling?: boolean | null
          id?: string
          last_name?: string
          medical_notes?: string | null
          monthly_fee?: number | null
          photo_url?: string | null
          single_parent?: boolean | null
          site_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          site_id: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          site_id: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          site_id?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      council_meetings: {
        Row: {
          agenda: string | null
          content: string | null
          created_at: string | null
          id: string
          location: string | null
          meeting_date: string
          minutes: string | null
          published: boolean
          site_id: string
          summary: string | null
          title: string
        }
        Insert: {
          agenda?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          minutes?: string | null
          published?: boolean
          site_id: string
          summary?: string | null
          title: string
        }
        Update: {
          agenda?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          minutes?: string | null
          published?: boolean
          site_id?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "council_meetings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      council_members: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          position: string | null
          position_order: number | null
          site_id: string
          term_until: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          position_order?: number | null
          site_id: string
          term_until?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          position_order?: number | null
          site_id?: string
          term_until?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "council_members_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          activities: string | null
          author_id: string | null
          child_id: string | null
          created_at: string | null
          id: string
          meals: Json | null
          mood: string | null
          notes: string | null
          photo_urls: string[] | null
          report_date: string
          shared_at: string | null
          sleep_minutes: number | null
          sleep_notes: string | null
          updated_at: string | null
        }
        Insert: {
          activities?: string | null
          author_id?: string | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          meals?: Json | null
          mood?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          report_date: string
          shared_at?: string | null
          sleep_minutes?: number | null
          sleep_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          activities?: string | null
          author_id?: string | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          meals?: Json | null
          mood?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          report_date?: string
          shared_at?: string | null
          sleep_minutes?: number | null
          sleep_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_schedule_items: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          day_of_week: number | null
          description: string | null
          end_time: string | null
          group_id: string | null
          id: string
          site_id: string
          sort_order: number | null
          start_time: string
          time_end: string | null
          time_start: string | null
          title: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          day_of_week?: number | null
          description?: string | null
          end_time?: string | null
          group_id?: string | null
          id?: string
          site_id: string
          sort_order?: number | null
          start_time: string
          time_end?: string | null
          time_start?: string | null
          title: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          day_of_week?: number | null
          description?: string | null
          end_time?: string | null
          group_id?: string | null
          id?: string
          site_id?: string
          sort_order?: number | null
          start_time?: string
          time_end?: string | null
          time_start?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_schedule_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_schedule_items_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_requests: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          reason: string | null
          rejection_reason: string | null
          scheduled_deletion_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          scheduled_deletion_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          scheduled_deletion_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dev_milestones: {
        Row: {
          age_months: number | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          age_months?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number | null
          title: string
        }
        Update: {
          age_months?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          site_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          site_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      document_integrations: {
        Row: {
          access_token: string
          connected_by: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          site_id: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          connected_by?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          site_id: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          connected_by?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          site_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_integrations_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_integrations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          mime_type: string | null
          modified_at: string | null
          provider: string
          provider_doc_id: string
          shared_with: string | null
          site_id: string
          thumbnail_url: string | null
          title: string
          web_url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          mime_type?: string | null
          modified_at?: string | null
          provider: string
          provider_doc_id: string
          shared_with?: string | null
          site_id: string
          thumbnail_url?: string | null
          title: string
          web_url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          mime_type?: string | null
          modified_at?: string | null
          provider?: string
          provider_doc_id?: string
          shared_with?: string | null
          site_id?: string
          thumbnail_url?: string | null
          title?: string
          web_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      eingewoehnung_processes: {
        Row: {
          child_id: string
          completed_at: string | null
          created_at: string | null
          educator_id: string | null
          id: string
          notes: string | null
          phase: number
          site_id: string | null
          started_at: string | null
          updated_at: string | null
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          created_at?: string | null
          educator_id?: string | null
          id?: string
          notes?: string | null
          phase?: number
          site_id?: string | null
          started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          created_at?: string | null
          educator_id?: string | null
          id?: string
          notes?: string | null
          phase?: number
          site_id?: string | null
          started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eingewoehnung_processes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eingewoehnung_processes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      elternbeitrags_bescheide: {
        Row: {
          betrag: number
          child_id: string | null
          erstellt_am: string
          erstellt_von: string | null
          guardian_id: string | null
          id: string
          jahr: number
          monat: number
          monat_label: string | null
          site_id: string | null
          status: string
          verschickt_am: string | null
        }
        Insert: {
          betrag?: number
          child_id?: string | null
          erstellt_am?: string
          erstellt_von?: string | null
          guardian_id?: string | null
          id?: string
          jahr: number
          monat: number
          monat_label?: string | null
          site_id?: string | null
          status?: string
          verschickt_am?: string | null
        }
        Update: {
          betrag?: number
          child_id?: string | null
          erstellt_am?: string
          erstellt_von?: string | null
          guardian_id?: string | null
          id?: string
          jahr?: number
          monat?: number
          monat_label?: string | null
          site_id?: string | null
          status?: string
          verschickt_am?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elternbeitrags_bescheide_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elternbeitrags_bescheide_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_alerts: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          message: string | null
          site_id: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          site_id: string
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          site_id?: string
          type?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          child_id: string
          created_at: string | null
          full_name: string
          id: string
          is_primary: boolean
          notes: string | null
          phone: string
          phone2: string | null
          relationship: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          phone: string
          phone2?: string | null
          relationship?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          phone?: string
          phone2?: string | null
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string
          note: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          note?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          note?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean | null
          author_id: string | null
          color: string | null
          created_at: string | null
          description: string | null
          ends_at: string | null
          group_id: string | null
          id: string
          location: string | null
          max_participants: number | null
          rsvp_required: boolean | null
          site_id: string | null
          starts_at: string
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          all_day?: boolean | null
          author_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          group_id?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          rsvp_required?: boolean | null
          site_id?: string | null
          starts_at: string
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          all_day?: boolean | null
          author_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          group_id?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          rsvp_required?: boolean | null
          site_id?: string | null
          starts_at?: string
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_children: {
        Row: {
          child_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_children_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_records: {
        Row: {
          amount: number
          child_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_url: string | null
          paid_at: string | null
          period: string
          site_id: string
          status: string
        }
        Insert: {
          amount?: number
          child_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          period: string
          site_id: string
          status?: string
        }
        Update: {
          amount?: number
          child_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          period?: string
          site_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_records_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          amount: number
          child_id: string
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          paid_at: string | null
          period: string
          period_month: string | null
          site_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          child_id: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          period: string
          period_month?: string | null
          site_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          child_id?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          period?: string
          period_month?: string | null
          site_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fees_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fees_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      foerder_goals: {
        Row: {
          achieved_at: string | null
          child_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          domain: string | null
          foerderplan_id: string
          id: string
          notes: string | null
          site_id: string | null
          sort_order: number | null
          status: string
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          achieved_at?: string | null
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          domain?: string | null
          foerderplan_id: string
          id?: string
          notes?: string | null
          site_id?: string | null
          sort_order?: number | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          achieved_at?: string | null
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          domain?: string | null
          foerderplan_id?: string
          id?: string
          notes?: string | null
          site_id?: string | null
          sort_order?: number | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "foerder_goals_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foerder_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foerder_goals_foerderplan_id_fkey"
            columns: ["foerderplan_id"]
            isOneToOne: false
            referencedRelation: "foerderplaene"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foerder_goals_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      foerderantraege: {
        Row: {
          antrag_typ: string
          betrag: number | null
          created_at: string
          created_by: string | null
          eingereicht_am: string | null
          id: string
          inhalt: string | null
          jahr: number
          kita_name: string | null
          site_id: string | null
          status: string
        }
        Insert: {
          antrag_typ?: string
          betrag?: number | null
          created_at?: string
          created_by?: string | null
          eingereicht_am?: string | null
          id?: string
          inhalt?: string | null
          jahr: number
          kita_name?: string | null
          site_id?: string | null
          status?: string
        }
        Update: {
          antrag_typ?: string
          betrag?: number | null
          created_at?: string
          created_by?: string | null
          eingereicht_am?: string | null
          id?: string
          inhalt?: string | null
          jahr?: number
          kita_name?: string | null
          site_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "foerderantraege_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      foerderplaene: {
        Row: {
          child_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          site_id: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          site_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          site_id?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "foerderplaene_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foerderplaene_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      foerderplan_goals: {
        Row: {
          created_at: string | null
          domain: string | null
          foerderplan_id: string
          id: string
          status: string
          target_date: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          foerderplan_id: string
          id?: string
          status?: string
          target_date?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          foerderplan_id?: string
          id?: string
          status?: string
          target_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "foerderplan_goals_foerderplan_id_fkey"
            columns: ["foerderplan_id"]
            isOneToOne: false
            referencedRelation: "foerderplaene"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          active: boolean
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          fields: Json | null
          id: string
          site_id: string
          title: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json | null
          id?: string
          site_id: string
          title: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json | null
          id?: string
          site_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_templates_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      group_handovers: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          from_staff: string | null
          group_id: string | null
          handover_date: string
          id: string
          incidents: string | null
          items: Json | null
          notes: string
          shift: string | null
          shift_date: string
          site_id: string
          to_staff: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          from_staff?: string | null
          group_id?: string | null
          handover_date?: string
          id?: string
          incidents?: string | null
          items?: Json | null
          notes?: string
          shift?: string | null
          shift_date?: string
          site_id: string
          to_staff?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          from_staff?: string | null
          group_id?: string | null
          handover_date?: string
          id?: string
          incidents?: string | null
          items?: Json | null
          notes?: string
          shift?: string | null
          shift_date?: string
          site_id?: string
          to_staff?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_handovers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_handovers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_handovers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          age_max_months: number | null
          age_min_months: number | null
          capacity: number | null
          color: string | null
          created_at: string | null
          id: string
          name: string
          site_id: string | null
          updated_at: string | null
        }
        Insert: {
          age_max_months?: number | null
          age_min_months?: number | null
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          site_id?: string | null
          updated_at?: string | null
        }
        Update: {
          age_max_months?: number | null
          age_min_months?: number | null
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          site_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          can_pickup: boolean | null
          child_id: string | null
          consent_photos: boolean | null
          consent_signed_at: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_primary: boolean | null
          phone: string | null
          relationship: string | null
          user_id: string | null
        }
        Insert: {
          can_pickup?: boolean | null
          child_id?: string | null
          consent_photos?: boolean | null
          consent_signed_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean | null
          phone?: string | null
          relationship?: string | null
          user_id?: string | null
        }
        Update: {
          can_pickup?: boolean | null
          child_id?: string | null
          consent_photos?: boolean | null
          consent_signed_at?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean | null
          phone?: string | null
          relationship?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardians_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      handbook_chapters: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          site_id: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          site_id: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          site_id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handbook_chapters_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          child_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_confidential: boolean
          notes: string | null
          record_date: string
          record_type: string
          site_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_confidential?: boolean
          notes?: string | null
          record_date?: string
          record_type: string
          site_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_confidential?: boolean
          notes?: string | null
          record_date?: string
          record_type?: string
          site_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      hygiene_checks: {
        Row: {
          check_date: string
          checked: boolean
          checked_by: string | null
          created_at: string | null
          id: string
          item_id: string | null
          items: Json | null
          notes: string | null
          room: string | null
          section: string | null
          site_id: string
          status: string | null
        }
        Insert: {
          check_date?: string
          checked?: boolean
          checked_by?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          items?: Json | null
          notes?: string | null
          room?: string | null
          section?: string | null
          site_id: string
          status?: string | null
        }
        Update: {
          check_date?: string
          checked?: boolean
          checked_by?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          items?: Json | null
          notes?: string | null
          room?: string | null
          section?: string | null
          site_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hygiene_checks_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      ical_tokens: {
        Row: {
          created_at: string | null
          id: string
          site_id: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          site_id: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          site_id?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ical_tokens_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          child_id: string
          created_at: string | null
          description: string
          first_aid: string | null
          follow_up: string | null
          id: string
          incident_at: string
          injury_type: string | null
          location: string | null
          parent_notified: boolean | null
          parent_notified_at: string | null
          reported_by: string | null
          severity: string | null
          site_id: string
          title: string | null
          updated_at: string | null
          witness: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          description: string
          first_aid?: string | null
          follow_up?: string | null
          id?: string
          incident_at?: string
          injury_type?: string | null
          location?: string | null
          parent_notified?: boolean | null
          parent_notified_at?: string | null
          reported_by?: string | null
          severity?: string | null
          site_id: string
          title?: string | null
          updated_at?: string | null
          witness?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          description?: string
          first_aid?: string | null
          follow_up?: string | null
          id?: string
          incident_at?: string
          injury_type?: string | null
          location?: string | null
          parent_notified?: boolean | null
          parent_notified_at?: string | null
          reported_by?: string | null
          severity?: string | null
          site_id?: string
          title?: string | null
          updated_at?: string | null
          witness?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          child_id: string | null
          created_at: string | null
          description: string | null
          first_aid: string | null
          id: string
          location: string | null
          occurred_at: string
          parent_notified: boolean
          reported_by: string | null
          severity: string | null
          site_id: string
          title: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          description?: string | null
          first_aid?: string | null
          id?: string
          location?: string | null
          occurred_at?: string
          parent_notified?: boolean
          reported_by?: string | null
          severity?: string | null
          site_id: string
          title: string
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          description?: string | null
          first_aid?: string | null
          id?: string
          location?: string | null
          occurred_at?: string
          parent_notified?: boolean
          reported_by?: string | null
          severity?: string | null
          site_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      kiosk_pins: {
        Row: {
          active: boolean | null
          child_id: string | null
          created_at: string | null
          id: string
          label: string
          pin_hash: string
          site_id: string
        }
        Insert: {
          active?: boolean | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          label?: string
          pin_hash: string
          site_id: string
        }
        Update: {
          active?: boolean | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          label?: string
          pin_hash?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kiosk_pins_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      kiosk_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          site_id: string
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          site_id: string
          token?: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          site_id?: string
          token?: string
        }
        Relationships: []
      }
      kita_documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          mime_type: string | null
          site_id: string
          title: string
          updated_at: string
          uploaded_by: string | null
          visible_to: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          mime_type?: string | null
          site_id: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
          visible_to?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          mime_type?: string | null
          site_id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          visible_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kita_documents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kita_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          leave_type: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          site_id: string
          staff_id: string
          start_date: string
          status: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          leave_type?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          site_id: string
          staff_id: string
          start_date: string
          status?: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          leave_type?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          site_id?: string
          staff_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      lexoffice_invoices: {
        Row: {
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          finalized: boolean | null
          id: string
          lexoffice_invoice_id: string
          payment_item_id: string | null
          site_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          finalized?: boolean | null
          id?: string
          lexoffice_invoice_id: string
          payment_item_id?: string | null
          site_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          finalized?: boolean | null
          id?: string
          lexoffice_invoice_id?: string
          payment_item_id?: string | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lexoffice_invoices_payment_item_id_fkey"
            columns: ["payment_item_id"]
            isOneToOne: false
            referencedRelation: "payment_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lexoffice_invoices_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      material_orders: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          id: string
          item_name: string
          notes: string | null
          quantity: number | null
          requested_by: string | null
          site_id: string
          status: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number | null
          requested_by?: string | null
          site_id: string
          status?: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number | null
          requested_by?: string | null
          site_id?: string
          status?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_orders_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_orders: {
        Row: {
          child_id: string
          created_at: string | null
          friday: boolean
          id: string
          monday: boolean
          ordered_by: string | null
          orders: Json
          site_id: string
          thursday: boolean
          tuesday: boolean
          updated_at: string | null
          wednesday: boolean
          week_start: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          friday?: boolean
          id?: string
          monday?: boolean
          ordered_by?: string | null
          orders?: Json
          site_id: string
          thursday?: boolean
          tuesday?: boolean
          updated_at?: string | null
          wednesday?: boolean
          week_start: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          friday?: boolean
          id?: string
          monday?: boolean
          ordered_by?: string | null
          orders?: Json
          site_id?: string
          thursday?: boolean
          tuesday?: boolean
          updated_at?: string | null
          wednesday?: boolean
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_orders_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          album_id: string | null
          caption: string | null
          child_ids: string[] | null
          consent_required: boolean | null
          created_at: string | null
          file_name: string | null
          file_size: number | null
          height: number | null
          id: string
          mime_type: string | null
          site_id: string | null
          thumbnail_url: string | null
          uploader_id: string | null
          url: string
          width: number | null
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          child_ids?: string[] | null
          consent_required?: boolean | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          site_id?: string | null
          thumbnail_url?: string | null
          uploader_id?: string | null
          url: string
          width?: number | null
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          child_ids?: string[] | null
          consent_required?: boolean | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          site_id?: string | null
          thumbnail_url?: string | null
          uploader_id?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          administered_at: string
          administered_by: string | null
          child_id: string
          created_at: string | null
          dosage: string
          id: string
          medication_name: string
          notes: string | null
          parent_consent: boolean | null
          site_id: string
        }
        Insert: {
          administered_at?: string
          administered_by?: string | null
          child_id: string
          created_at?: string | null
          dosage: string
          id?: string
          medication_name: string
          notes?: string | null
          parent_consent?: boolean | null
          site_id: string
        }
        Update: {
          administered_at?: string
          administered_by?: string | null
          child_id?: string
          created_at?: string | null
          dosage?: string
          id?: string
          medication_name?: string
          notes?: string | null
          parent_consent?: boolean | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reads: {
        Row: {
          id: string
          message_id: string | null
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          message_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          message_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          category: string
          created_at: string
          created_by: string | null
          id: string
          site_id: string
          title: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          site_id: string
          title: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          site_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          meta: Json
          sender_id: string
          type: string
          updated_at: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          meta?: Json
          sender_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          meta?: Json
          sender_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved_date: string | null
          category: string | null
          child_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          notes: string | null
          photo_url: string | null
          title: string
        }
        Insert: {
          achieved_date?: string | null
          category?: string | null
          child_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          title: string
        }
        Update: {
          achieved_date?: string | null
          category?: string | null
          child_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_reads: {
        Row: {
          id: string
          newsletter_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          newsletter_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          newsletter_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_reads_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          group_id: string | null
          id: string
          published_at: string | null
          recipient_count: number | null
          sent_at: string | null
          site_id: string
          summary: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          published_at?: string | null
          recipient_count?: number | null
          sent_at?: string | null
          site_id: string
          summary?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          published_at?: string | null
          recipient_count?: number | null
          sent_at?: string | null
          site_id?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletters_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletters_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          body: string | null
          id: string
          recipient_id: string | null
          sent_at: string | null
          site_id: string | null
          source_id: string | null
          source_type: string | null
          status: string | null
          title: string
          url: string | null
        }
        Insert: {
          body?: string | null
          id?: string
          recipient_id?: string | null
          sent_at?: string | null
          site_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          title: string
          url?: string | null
        }
        Update: {
          body?: string | null
          id?: string
          recipient_id?: string | null
          sent_at?: string | null
          site_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          id: string
          notify_abwesenheit: boolean | null
          notify_feed: boolean | null
          notify_kalender: boolean | null
          notify_nachrichten: boolean | null
          notify_protokolle: boolean | null
          notify_tagesbericht: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_abwesenheit?: boolean | null
          notify_feed?: boolean | null
          notify_kalender?: boolean | null
          notify_nachrichten?: boolean | null
          notify_protokolle?: boolean | null
          notify_tagesbericht?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_abwesenheit?: boolean | null
          notify_feed?: boolean | null
          notify_kalender?: boolean | null
          notify_nachrichten?: boolean | null
          notify_protokolle?: boolean | null
          notify_tagesbericht?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      observations: {
        Row: {
          author_id: string | null
          child_id: string
          content: string
          created_at: string | null
          domain: string
          id: string
          is_highlight: boolean | null
          observed_at: string
          shared_with_parents: boolean | null
          site_id: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          child_id: string
          content: string
          created_at?: string | null
          domain?: string
          id?: string
          is_highlight?: boolean | null
          observed_at?: string
          shared_with_parents?: boolean | null
          site_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          child_id?: string
          content?: string
          created_at?: string | null
          domain?: string
          id?: string
          is_highlight?: boolean | null
          observed_at?: string
          shared_with_parents?: boolean | null
          site_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      online_anmeldungen: {
        Row: {
          adresse: string | null
          anmerkungen: string | null
          bearbeitet_am: string | null
          bearbeitet_von: string | null
          betreuungsart: string | null
          betreuungszeit: string | null
          created_at: string
          eltern_name: string
          email: string
          geschwisterkind: boolean | null
          id: string
          kind_geburtsdatum: string | null
          kind_nachname: string
          kind_vorname: string
          site_id: string | null
          status: string
          telefon: string | null
          wunsch_datum: string | null
        }
        Insert: {
          adresse?: string | null
          anmerkungen?: string | null
          bearbeitet_am?: string | null
          bearbeitet_von?: string | null
          betreuungsart?: string | null
          betreuungszeit?: string | null
          created_at?: string
          eltern_name: string
          email: string
          geschwisterkind?: boolean | null
          id?: string
          kind_geburtsdatum?: string | null
          kind_nachname: string
          kind_vorname: string
          site_id?: string | null
          status?: string
          telefon?: string | null
          wunsch_datum?: string | null
        }
        Update: {
          adresse?: string | null
          anmerkungen?: string | null
          bearbeitet_am?: string | null
          bearbeitet_von?: string | null
          betreuungsart?: string | null
          betreuungszeit?: string | null
          created_at?: string
          eltern_name?: string
          email?: string
          geschwisterkind?: boolean | null
          id?: string
          kind_geburtsdatum?: string | null
          kind_nachname?: string
          kind_vorname?: string
          site_id?: string | null
          status?: string
          telefon?: string | null
          wunsch_datum?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "online_anmeldungen_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_meetings: {
        Row: {
          agreements: string | null
          attendees: string | null
          child_id: string
          conducted_by: string | null
          created_at: string | null
          id: string
          meeting_date: string
          next_meeting: string | null
          site_id: string
          topics: string
          updated_at: string | null
        }
        Insert: {
          agreements?: string | null
          attendees?: string | null
          child_id: string
          conducted_by?: string | null
          created_at?: string | null
          id?: string
          meeting_date: string
          next_meeting?: string | null
          site_id: string
          topics: string
          updated_at?: string | null
        }
        Update: {
          agreements?: string | null
          attendees?: string | null
          child_id?: string
          conducted_by?: string | null
          created_at?: string | null
          id?: string
          meeting_date?: string
          next_meeting?: string | null
          site_id?: string
          topics?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_meetings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_items: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string
          description: string | null
          due_date: string | null
          id: string
          site_id: string
          target_role: string | null
          title: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          site_id: string
          target_role?: string | null
          title: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          site_id?: string
          target_role?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_items_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          paid_at: string | null
          payment_item_id: string | null
          site_id: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          payment_item_id?: string | null
          site_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          paid_at?: string | null
          payment_item_id?: string | null
          site_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_payment_item_id_fkey"
            columns: ["payment_item_id"]
            isOneToOne: false
            referencedRelation: "payment_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_persons: {
        Row: {
          child_id: string | null
          created_at: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          photo_url: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pickup_persons_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_indexes: number[]
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_indexes: number[]
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_indexes?: number[]
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          anonymous: boolean | null
          author_id: string | null
          closes_at: string | null
          created_at: string | null
          description: string | null
          group_id: string | null
          id: string
          multiple_choice: boolean | null
          options: Json
          site_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          anonymous?: boolean | null
          author_id?: string | null
          closes_at?: string | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          multiple_choice?: boolean | null
          options?: Json
          site_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          anonymous?: boolean | null
          author_id?: string | null
          closes_at?: string | null
          created_at?: string | null
          description?: string | null
          group_id?: string | null
          id?: string
          multiple_choice?: boolean | null
          options?: Json
          site_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_entries: {
        Row: {
          author_id: string | null
          category: string
          child_id: string | null
          content: string | null
          created_at: string | null
          id: string
          is_shared_with_parents: boolean | null
          media_urls: string[] | null
          site_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string
          child_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_shared_with_parents?: boolean | null
          media_urls?: string[] | null
          site_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string
          child_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_shared_with_parents?: boolean | null
          media_urls?: string[] | null
          site_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_entries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_photos: {
        Row: {
          author_id: string | null
          caption: string | null
          child_id: string | null
          created_at: string | null
          entry_id: string | null
          id: string
          is_shared_with_parents: boolean | null
          site_id: string
          storage_path: string
          taken_at: string | null
        }
        Insert: {
          author_id?: string | null
          caption?: string | null
          child_id?: string | null
          created_at?: string | null
          entry_id?: string | null
          id?: string
          is_shared_with_parents?: boolean | null
          site_id: string
          storage_path: string
          taken_at?: string | null
        }
        Update: {
          author_id?: string | null
          caption?: string | null
          child_id?: string | null
          created_at?: string | null
          entry_id?: string | null
          id?: string
          is_shared_with_parents?: boolean | null
          site_id?: string
          storage_path?: string
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_photos_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_photos_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_photos_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "portfolio_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          language: string | null
          phone: string | null
          role: string
          site_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          phone?: string | null
          role?: string
          site_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          role?: string
          site_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          meeting_date: string
          published_at: string | null
          site_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          meeting_date: string
          published_at?: string | null
          site_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          meeting_date?: string
          published_at?: string | null
          site_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocols_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocols_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          site_id: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          site_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          site_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_notes: {
        Row: {
          author_id: string
          color: string
          content: string
          created_at: string
          id: string
          pinned: boolean
          site_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          color?: string
          content: string
          created_at?: string
          id?: string
          pinned?: boolean
          site_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          color?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quick_notes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          assigned_group_id: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          equipment: string[] | null
          floor: string | null
          id: string
          name: string
          notes: string | null
          site_id: string
        }
        Insert: {
          assigned_group_id?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          equipment?: string[] | null
          floor?: string | null
          id?: string
          name: string
          notes?: string | null
          site_id: string
        }
        Update: {
          assigned_group_id?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          equipment?: string[] | null
          floor?: string | null
          id?: string
          name?: string
          notes?: string | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_assigned_group_id_fkey"
            columns: ["assigned_group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      rulebook_entries: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          site_id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          site_id: string
          sort_order?: number | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          site_id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rulebook_entries_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_time: string
          id: string
          role_note: string | null
          shift_date: string
          site_id: string
          staff_id: string
          start_time: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_time: string
          id?: string
          role_note?: string | null
          shift_date: string
          site_id: string
          staff_id: string
          start_time: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_time?: string
          id?: string
          role_note?: string | null
          shift_date?: string
          site_id?: string
          staff_id?: string
          start_time?: string
        }
        Relationships: []
      }
      sick_reports: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          processed_by: string | null
          site_id: string
          staff_id: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          processed_by?: string | null
          site_id: string
          staff_id: string
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          processed_by?: string | null
          site_id?: string
          staff_id?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sick_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sismik_beobachtungen: {
        Row: {
          beobachter_id: string | null
          beobachter_name: string | null
          child_id: string | null
          created_at: string
          datum: string
          gesamtscore: number | null
          id: string
          notizen: Json
          site_id: string | null
          werte: Json
        }
        Insert: {
          beobachter_id?: string | null
          beobachter_name?: string | null
          child_id?: string | null
          created_at?: string
          datum: string
          gesamtscore?: number | null
          id?: string
          notizen?: Json
          site_id?: string | null
          werte?: Json
        }
        Update: {
          beobachter_id?: string | null
          beobachter_name?: string | null
          child_id?: string | null
          created_at?: string
          datum?: string
          gesamtscore?: number | null
          id?: string
          notizen?: Json
          site_id?: string | null
          werte?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sismik_beobachtungen_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sismik_beobachtungen_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string | null
          config: Json | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          config?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          config?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sleep_records: {
        Row: {
          child_id: string
          created_at: string | null
          created_by: string | null
          date: string
          duration_min: number | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          notes: string | null
          quality: number | null
          sleep_date: string | null
          sleep_end: string | null
          sleep_start: string | null
          start_time: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          duration_min?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          quality?: number | null
          sleep_date?: string | null
          sleep_end?: string | null
          sleep_start?: string | null
          start_time?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          duration_min?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          quality?: number | null
          sleep_date?: string | null
          sleep_end?: string | null
          sleep_start?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sleep_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      sozialstaffel_config: {
        Row: {
          bundesland: string | null
          id: string
          site_id: string | null
          staffel_tabelle: Json
          updated_at: string
        }
        Insert: {
          bundesland?: string | null
          id?: string
          site_id?: string | null
          staffel_tabelle?: Json
          updated_at?: string
        }
        Update: {
          bundesland?: string | null
          id?: string
          site_id?: string | null
          staffel_tabelle?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sozialstaffel_config_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          site_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          site_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          site_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          last_payment_at: string | null
          plan: string
          site_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          last_payment_at?: string | null
          plan?: string
          site_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          last_payment_at?: string | null
          plan?: string
          site_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      substitutions: {
        Row: {
          absent_staff_id: string | null
          created_at: string | null
          created_by: string | null
          date: string
          group_id: string | null
          id: string
          notes: string | null
          reason: string | null
          site_id: string
          substitute_id: string | null
          substitute_staff_id: string | null
        }
        Insert: {
          absent_staff_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          group_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          site_id: string
          substitute_id?: string | null
          substitute_staff_id?: string | null
        }
        Update: {
          absent_staff_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          group_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          site_id?: string
          substitute_id?: string | null
          substitute_staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substitutions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_substitute_staff_id_fkey"
            columns: ["substitute_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answers: Json
          id: string
          submitted_at: string | null
          survey_id: string
          user_id: string | null
        }
        Insert: {
          answers?: Json
          id?: string
          submitted_at?: string | null
          survey_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          id?: string
          submitted_at?: string | null
          survey_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          author_id: string | null
          closed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          published: boolean
          questions: Json
          site_id: string
          title: string
        }
        Insert: {
          author_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          published?: boolean
          questions?: Json
          site_id: string
          title: string
        }
        Update: {
          author_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          published?: boolean
          questions?: Json
          site_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          pinned: boolean
          site_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          pinned?: boolean
          site_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          pinned?: boolean
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_messages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          break_min: number | null
          clock_in: string | null
          clock_out: string | null
          created_at: string | null
          date: string | null
          end_time: string | null
          id: string
          notes: string | null
          site_id: string
          staff_id: string
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          break_min?: number | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          site_id: string
          staff_id: string
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          break_min?: number | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          site_id?: string
          staff_id?: string
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_hours: number | null
          hours: number | null
          id: string
          location: string | null
          max_participants: number | null
          notes: string | null
          provider: string | null
          site_id: string
          staff_id: string | null
          title: string
          training_date: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          hours?: number | null
          id?: string
          location?: string | null
          max_participants?: number | null
          notes?: string | null
          provider?: string | null
          site_id: string
          staff_id?: string | null
          title: string
          training_date?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          hours?: number | null
          id?: string
          location?: string | null
          max_participants?: number | null
          notes?: string | null
          provider?: string | null
          site_id?: string
          staff_id?: string | null
          title?: string
          training_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      translate_cache: {
        Row: {
          cache_key: string
          created_at: string
          id: string
          source_text: string
          target_lang: string
          translation: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          id?: string
          source_text: string
          target_lang: string
          translation: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          id?: string
          source_text?: string
          target_lang?: string
          translation?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          created_at: string
          endpoint_id: string | null
          event: string
          id: string
          status: string
          status_code: number | null
        }
        Insert: {
          created_at?: string
          endpoint_id?: string | null
          event: string
          id?: string
          status: string
          status_code?: number | null
        }
        Update: {
          created_at?: string
          endpoint_id?: string | null
          event?: string
          id?: string
          status?: string
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          active: boolean
          created_at: string
          events: string[] | null
          id: string
          secret: string | null
          site_id: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          events?: string[] | null
          id?: string
          secret?: string | null
          site_id: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          events?: string[] | null
          id?: string
          secret?: string | null
          site_id?: string
          url?: string
        }
        Relationships: []
      }
      weekly_menus: {
        Row: {
          allergens: string[] | null
          created_at: string
          created_by: string | null
          day: string
          description: string | null
          id: string
          is_vegan: boolean
          is_vegetarian: boolean
          meal_type: string
          site_id: string
          title: string
          updated_at: string
          week_start: string
        }
        Insert: {
          allergens?: string[] | null
          created_at?: string
          created_by?: string | null
          day: string
          description?: string | null
          id?: string
          is_vegan?: boolean
          is_vegetarian?: boolean
          meal_type: string
          site_id: string
          title: string
          updated_at?: string
          week_start: string
        }
        Update: {
          allergens?: string[] | null
          created_at?: string
          created_by?: string | null
          day?: string
          description?: string | null
          id?: string
          is_vegan?: boolean
          is_vegetarian?: boolean
          meal_type?: string
          site_id?: string
          title?: string
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_menus_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_menus_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      zoom_integrations: {
        Row: {
          access_token: string
          connected_by: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          refresh_token: string | null
          site_id: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          connected_by?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          site_id: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          connected_by?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          site_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zoom_integrations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      zoom_meetings: {
        Row: {
          child_id: string | null
          created_at: string | null
          created_by: string | null
          duration: number | null
          elterngespräch_id: string | null
          id: string
          join_url: string | null
          meeting_id: string
          password: string | null
          site_id: string
          start_time: string | null
          start_url: string | null
          topic: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration?: number | null
          elterngespräch_id?: string | null
          id?: string
          join_url?: string | null
          meeting_id: string
          password?: string | null
          site_id: string
          start_time?: string | null
          start_url?: string | null
          topic: string
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration?: number | null
          elterngespräch_id?: string | null
          id?: string
          join_url?: string | null
          meeting_id?: string
          password?: string | null
          site_id?: string
          start_time?: string | null
          start_url?: string | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "zoom_meetings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zoom_meetings_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_unread_conversation_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      my_role: { Args: never; Returns: string }
      my_site_id: { Args: never; Returns: string }
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

// ── Convenience type aliases ──────────────────────────────────────────────────
export type NotificationSettings = Database['public']['Tables']['notification_settings']['Row']
export type SickReport = Database['public']['Tables']['sick_reports']['Row']
export type PickupPerson = Database['public']['Tables']['pickup_persons']['Row']
export type HealthRecord = Database['public']['Tables']['health_records']['Row']
export type Observation = Database['public']['Tables']['observations']['Row']
export type Milestone = Database['public']['Tables']['milestones']['Row']
export type Protocol = Database['public']['Tables']['protocols']['Row']
export type Site = Database['public']['Tables']['sites']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Child = Database['public']['Tables']['children']['Row']
export type Guardian = Database['public']['Tables']['guardians']['Row']
export type Attendance = Database['public']['Tables']['attendance']['Row']
export type DailyReport = Database['public']['Tables']['daily_reports']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type KitaEvent = Database['public']['Tables']['events']['Row']
export type WeeklyMenu = Database['public']['Tables']['weekly_menus']['Row']
export type Album = Database['public']['Tables']['albums']['Row']
export type MediaAsset = Database['public']['Tables']['media_assets']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationParticipant = Database['public']['Tables']['conversation_participants']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
