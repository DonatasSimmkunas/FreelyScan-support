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
      auction_houses: {
        Row: {
          charges_enabled: boolean
          company_registration_number: string | null
          country_code: string | null
          created_at: string
          id: string
          legal_name: string | null
          location: string | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean
          owner_id: string | null
          payment_account_id: string | null
          payouts_enabled: boolean
          slug: string
          vat_number: string | null
          verification_status: string
          verified: boolean
        }
        Insert: {
          charges_enabled?: boolean
          company_registration_number?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          legal_name?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean
          owner_id?: string | null
          payment_account_id?: string | null
          payouts_enabled?: boolean
          slug: string
          vat_number?: string | null
          verification_status?: string
          verified?: boolean
        }
        Update: {
          charges_enabled?: boolean
          company_registration_number?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          legal_name?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean
          owner_id?: string | null
          payment_account_id?: string | null
          payouts_enabled?: boolean
          slug?: string
          vat_number?: string | null
          verification_status?: string
          verified?: boolean
        }
        Relationships: []
      }
      auction_pickup_clusters: {
        Row: {
          active_lot_count: number
          auction_id: string
          country_code: string | null
          created_at: string
          density_factor: number
          id: string
          label: string | null
          latitude: number
          location: unknown
          longitude: number
          total_estimated_value: number
        }
        Insert: {
          active_lot_count?: number
          auction_id: string
          country_code?: string | null
          created_at?: string
          density_factor?: number
          id?: string
          label?: string | null
          latitude: number
          location?: unknown
          longitude: number
          total_estimated_value?: number
        }
        Update: {
          active_lot_count?: number
          auction_id?: string
          country_code?: string | null
          created_at?: string
          density_factor?: number
          id?: string
          label?: string | null
          latitude?: number
          location?: unknown
          longitude?: number
          total_estimated_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "auction_pickup_clusters_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_registrations: {
        Row: {
          approved: boolean
          auction_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          auction_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          auction_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_registrations_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          buyer_premium: number
          buyer_protection_enabled: boolean
          cover_url: string | null
          created_at: string
          default_vat_rate: number | null
          ends_at: string
          house_id: string
          id: string
          location: string | null
          pickup_info: string | null
          platform: string | null
          public: boolean
          publication_status: string
          starts_at: string | null
          status: string
          terms_version: string | null
          title: string
          transaction_model: string
          vat_mode: string
        }
        Insert: {
          buyer_premium?: number
          buyer_protection_enabled?: boolean
          cover_url?: string | null
          created_at?: string
          default_vat_rate?: number | null
          ends_at: string
          house_id: string
          id?: string
          location?: string | null
          pickup_info?: string | null
          platform?: string | null
          public?: boolean
          publication_status?: string
          starts_at?: string | null
          status?: string
          terms_version?: string | null
          title: string
          transaction_model?: string
          vat_mode?: string
        }
        Update: {
          buyer_premium?: number
          buyer_protection_enabled?: boolean
          cover_url?: string | null
          created_at?: string
          default_vat_rate?: number | null
          ends_at?: string
          house_id?: string
          id?: string
          location?: string | null
          pickup_info?: string | null
          platform?: string | null
          public?: boolean
          publication_status?: string
          starts_at?: string | null
          status?: string
          terms_version?: string | null
          title?: string
          transaction_model?: string
          vat_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "auctions_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "auction_houses"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_audit_events: {
        Row: {
          bidder_id: string | null
          created_at: string
          displayed_amount_after: number | null
          displayed_amount_before: number | null
          ends_at_after: string | null
          ends_at_before: string | null
          event_type: string
          id: number
          lot_id: string
          metadata: Json
          reason_code: string | null
          request_id: string
          requested_amount: number | null
        }
        Insert: {
          bidder_id?: string | null
          created_at?: string
          displayed_amount_after?: number | null
          displayed_amount_before?: number | null
          ends_at_after?: string | null
          ends_at_before?: string | null
          event_type: string
          id?: never
          lot_id: string
          metadata?: Json
          reason_code?: string | null
          request_id?: string
          requested_amount?: number | null
        }
        Update: {
          bidder_id?: string | null
          created_at?: string
          displayed_amount_after?: number | null
          displayed_amount_before?: number | null
          ends_at_after?: string | null
          ends_at_before?: string | null
          event_type?: string
          id?: never
          lot_id?: string
          metadata?: Json
          reason_code?: string | null
          request_id?: string
          requested_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_audit_events_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          id: string
          lot_id: string
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          id?: string
          lot_id: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          id?: string
          lot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_geo_profile: {
        Row: {
          avg_bid_value: number | null
          avg_winning_value: number | null
          country_code: string | null
          home_latitude: number | null
          home_longitude: number | null
          location: unknown
          preferred_radius_km: number
          shipping_preference: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_bid_value?: number | null
          avg_winning_value?: number | null
          country_code?: string | null
          home_latitude?: number | null
          home_longitude?: number | null
          location?: unknown
          preferred_radius_km?: number
          shipping_preference?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_bid_value?: number | null
          avg_winning_value?: number | null
          country_code?: string | null
          home_latitude?: number | null
          home_longitude?: number | null
          location?: unknown
          preferred_radius_km?: number
          shipping_preference?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      buyer_preferences: {
        Row: {
          affinity_score: number
          id: number
          preference_key: string
          preference_type: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affinity_score?: number
          id?: never
          preference_key: string
          preference_type: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affinity_score?: number
          id?: never
          preference_key?: string
          preference_type?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      checkout_quotes: {
        Row: {
          buyer_premium_amount: number
          created_at: string
          currency: string
          expires_at: string
          hammer_price: number
          id: string
          lot_id: string
          protection_fee: number
          total_before_tax: number
          user_id: string | null
        }
        Insert: {
          buyer_premium_amount?: number
          created_at?: string
          currency?: string
          expires_at?: string
          hammer_price: number
          id?: string
          lot_id: string
          protection_fee?: number
          total_before_tax: number
          user_id?: string | null
        }
        Update: {
          buyer_premium_amount?: number
          created_at?: string
          currency?: string
          expires_at?: string
          hammer_price?: number
          id?: string
          lot_id?: string
          protection_fee?: number
          total_before_tax?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkout_quotes_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          description: string | null
          id: string
          opened_at: string
          opened_by: string
          order_id: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          description?: string | null
          id?: string
          opened_at?: string
          opened_by: string
          order_id: string
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          description?: string | null
          id?: string
          opened_at?: string
          opened_by?: string
          order_id?: string
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_rules: {
        Row: {
          active: boolean
          created_at: string
          fee_cap: number | null
          fixed_fee: number
          id: number
          max_hammer: number | null
          min_hammer: number
          percent_fee: number
          priority: number
          transaction_model: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          fee_cap?: number | null
          fixed_fee?: number
          id?: never
          max_hammer?: number | null
          min_hammer?: number
          percent_fee: number
          priority?: number
          transaction_model: string
        }
        Update: {
          active?: boolean
          created_at?: string
          fee_cap?: number | null
          fixed_fee?: number
          id?: never
          max_hammer?: number | null
          min_hammer?: number
          percent_fee?: number
          priority?: number
          transaction_model?: string
        }
        Relationships: []
      }
      handover_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string
          token_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id: string
          token_hash: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handover_tokens_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_items: {
        Row: {
          created_at: string
          extracted: Json
          file_name: string | null
          id: string
          image_url: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted?: Json
          file_name?: string | null
          id?: string
          image_url: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted?: Json
          file_name?: string | null
          id?: string
          image_url?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          body_markdown: string
          created_at: string
          effective_at: string | null
          slug: string
          status: string
          title: string
          version: string
        }
        Insert: {
          body_markdown: string
          created_at?: string
          effective_at?: string | null
          slug: string
          status?: string
          title: string
          version: string
        }
        Update: {
          body_markdown?: string
          created_at?: string
          effective_at?: string | null
          slug?: string
          status?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      liquidity_engine_config: {
        Row: {
          engine_version: string
          id: boolean
          updated_at: string
          weight_bid_activity: number
          weight_geo: number
          weight_personalization: number
          weight_relevance: number
          weight_seller_trust: number
          weight_shipping: number
          weight_urgency: number
          weight_value: number
        }
        Insert: {
          engine_version?: string
          id?: boolean
          updated_at?: string
          weight_bid_activity?: number
          weight_geo?: number
          weight_personalization?: number
          weight_relevance?: number
          weight_seller_trust?: number
          weight_shipping?: number
          weight_urgency?: number
          weight_value?: number
        }
        Update: {
          engine_version?: string
          id?: boolean
          updated_at?: string
          weight_bid_activity?: number
          weight_geo?: number
          weight_personalization?: number
          weight_relevance?: number
          weight_seller_trust?: number
          weight_shipping?: number
          weight_urgency?: number
          weight_value?: number
        }
        Relationships: []
      }
      lot_geo_performance: {
        Row: {
          bidders: number
          bids: number
          distance_band: string
          id: number
          impressions: number
          lot_id: string
          updated_at: string
          views: number
          watchers: number
        }
        Insert: {
          bidders?: number
          bids?: number
          distance_band: string
          id?: never
          impressions?: number
          lot_id: string
          updated_at?: string
          views?: number
          watchers?: number
        }
        Update: {
          bidders?: number
          bids?: number
          distance_band?: string
          id?: never
          impressions?: number
          lot_id?: string
          updated_at?: string
          views?: number
          watchers?: number
        }
        Relationships: [
          {
            foreignKeyName: "lot_geo_performance_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_liquidity_profile: {
        Row: {
          base_radius_km: number
          country_code: string | null
          created_at: string
          current_radius_km: number
          density_factor: number
          estimated_value: number | null
          geo_expansion_level: number
          intervention_state: string
          last_evaluated_at: string | null
          latitude: number | null
          liquidity_score: number
          longitude: number | null
          lot_id: string
          market_scope: string
          max_radius_km: number
          next_evaluation_at: string | null
          ranking_boost: number
          shipping_factor: number
          shipping_mode: string
          transport_class: string
          updated_at: string
          urgency_multiplier: number
          value_band: string
        }
        Insert: {
          base_radius_km?: number
          country_code?: string | null
          created_at?: string
          current_radius_km?: number
          density_factor?: number
          estimated_value?: number | null
          geo_expansion_level?: number
          intervention_state?: string
          last_evaluated_at?: string | null
          latitude?: number | null
          liquidity_score?: number
          longitude?: number | null
          lot_id: string
          market_scope?: string
          max_radius_km?: number
          next_evaluation_at?: string | null
          ranking_boost?: number
          shipping_factor?: number
          shipping_mode: string
          transport_class: string
          updated_at?: string
          urgency_multiplier?: number
          value_band: string
        }
        Update: {
          base_radius_km?: number
          country_code?: string | null
          created_at?: string
          current_radius_km?: number
          density_factor?: number
          estimated_value?: number | null
          geo_expansion_level?: number
          intervention_state?: string
          last_evaluated_at?: string | null
          latitude?: number | null
          liquidity_score?: number
          longitude?: number | null
          lot_id?: string
          market_scope?: string
          max_radius_km?: number
          next_evaluation_at?: string | null
          ranking_boost?: number
          shipping_factor?: number
          shipping_mode?: string
          transport_class?: string
          updated_at?: string
          urgency_multiplier?: number
          value_band?: string
        }
        Relationships: [
          {
            foreignKeyName: "lot_liquidity_profile_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: true
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_metrics: {
        Row: {
          bids: number
          bucket_minutes: number
          bucket_start: string
          created_at: string
          current_bid: number | null
          detail_views: number
          id: number
          impressions: number
          lot_id: string
          search_clicks: number
          shares: number
          unique_bidders: number
          unique_viewers: number
          visibility_radius_km: number | null
          watch_adds: number
          watch_removes: number
        }
        Insert: {
          bids?: number
          bucket_minutes?: number
          bucket_start: string
          created_at?: string
          current_bid?: number | null
          detail_views?: number
          id?: never
          impressions?: number
          lot_id: string
          search_clicks?: number
          shares?: number
          unique_bidders?: number
          unique_viewers?: number
          visibility_radius_km?: number | null
          watch_adds?: number
          watch_removes?: number
        }
        Update: {
          bids?: number
          bucket_minutes?: number
          bucket_start?: string
          created_at?: string
          current_bid?: number | null
          detail_views?: number
          id?: never
          impressions?: number
          lot_id?: string
          search_clicks?: number
          shares?: number
          unique_bidders?: number
          unique_viewers?: number
          visibility_radius_km?: number | null
          watch_adds?: number
          watch_removes?: number
        }
        Relationships: [
          {
            foreignKeyName: "lot_metrics_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_pickup_cluster: {
        Row: {
          cluster_id: string
          lot_id: string
        }
        Insert: {
          cluster_id: string
          lot_id: string
        }
        Update: {
          cluster_id?: string
          lot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lot_pickup_cluster_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "auction_pickup_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_pickup_cluster_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: true
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_visibility_decisions: {
        Row: {
          created_at: string
          decision_type: string
          engine_version: string
          id: number
          liquidity_score: number | null
          lot_id: string
          new_value: Json | null
          old_value: Json | null
          reason_code: string
        }
        Insert: {
          created_at?: string
          decision_type: string
          engine_version?: string
          id?: never
          liquidity_score?: number | null
          lot_id: string
          new_value?: Json | null
          old_value?: Json | null
          reason_code: string
        }
        Update: {
          created_at?: string
          decision_type?: string
          engine_version?: string
          id?: never
          liquidity_score?: number | null
          lot_id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "lot_visibility_decisions_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          auction_id: string
          bid_count: number
          brand: string | null
          catalog_status: string
          category: string | null
          closed_at: string | null
          condition: string | null
          country_code: string | null
          created_at: string
          current_bid: number
          description: string | null
          ends_at: string
          estimate_high: number | null
          estimate_low: number | null
          estimated_value: number | null
          extension_count: number
          extension_seconds: number
          height_cm: number | null
          id: string
          image_urls: string[]
          length_cm: number | null
          location: unknown
          lot_number: number
          min_increment: number
          model: string | null
          qa_status: string
          reserve_met: boolean
          reserve_price: number | null
          sale_status: string
          seller_latitude: number | null
          seller_longitude: number | null
          shipping_mode: string | null
          soft_close_seconds: number
          starting_bid: number | null
          status: string
          title: string
          transport_class: string | null
          warning_count: number
          weight_kg: number | null
          width_cm: number | null
          winner_id: string | null
          winning_bid_id: string | null
        }
        Insert: {
          auction_id: string
          bid_count?: number
          brand?: string | null
          catalog_status?: string
          category?: string | null
          closed_at?: string | null
          condition?: string | null
          country_code?: string | null
          created_at?: string
          current_bid?: number
          description?: string | null
          ends_at: string
          estimate_high?: number | null
          estimate_low?: number | null
          estimated_value?: number | null
          extension_count?: number
          extension_seconds?: number
          height_cm?: number | null
          id?: string
          image_urls?: string[]
          length_cm?: number | null
          location?: unknown
          lot_number: number
          min_increment?: number
          model?: string | null
          qa_status?: string
          reserve_met?: boolean
          reserve_price?: number | null
          sale_status?: string
          seller_latitude?: number | null
          seller_longitude?: number | null
          shipping_mode?: string | null
          soft_close_seconds?: number
          starting_bid?: number | null
          status?: string
          title: string
          transport_class?: string | null
          warning_count?: number
          weight_kg?: number | null
          width_cm?: number | null
          winner_id?: string | null
          winning_bid_id?: string | null
        }
        Update: {
          auction_id?: string
          bid_count?: number
          brand?: string | null
          catalog_status?: string
          category?: string | null
          closed_at?: string | null
          condition?: string | null
          country_code?: string | null
          created_at?: string
          current_bid?: number
          description?: string | null
          ends_at?: string
          estimate_high?: number | null
          estimate_low?: number | null
          estimated_value?: number | null
          extension_count?: number
          extension_seconds?: number
          height_cm?: number | null
          id?: string
          image_urls?: string[]
          length_cm?: number | null
          location?: unknown
          lot_number?: number
          min_increment?: number
          model?: string | null
          qa_status?: string
          reserve_met?: boolean
          reserve_price?: number | null
          sale_status?: string
          seller_latitude?: number | null
          seller_longitude?: number | null
          shipping_mode?: string | null
          soft_close_seconds?: number
          starting_bid?: number | null
          status?: string
          title?: string
          transport_class?: string | null
          warning_count?: number
          weight_kg?: number | null
          width_cm?: number | null
          winner_id?: string | null
          winning_bid_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_events: {
        Row: {
          created_at: string
          distance_km: number | null
          event_type: string
          id: number
          lot_id: string | null
          metadata: Json
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          distance_km?: number | null
          event_type: string
          id?: never
          lot_id?: string | null
          metadata?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          distance_km?: number | null
          event_type?: string
          id?: never
          lot_id?: string | null
          metadata?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_events_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_flags: {
        Row: {
          created_at: string
          flag_type: string
          id: string
          lot_id: string | null
          metadata: Json
          notes: string | null
          reporter_id: string | null
          resolved_at: string | null
          severity: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          flag_type: string
          id?: string
          lot_id?: string | null
          metadata?: Json
          notes?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          flag_type?: string
          id?: string
          lot_id?: string | null
          metadata?: Json
          notes?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_flags_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          lot_id: string | null
          order_id: string | null
          send_after: string
          sent_at: string | null
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          channel?: string
          created_at?: string
          id?: string
          lot_id?: string | null
          order_id?: string | null
          send_after?: string
          sent_at?: string | null
          status?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          lot_id?: string | null
          order_id?: string | null
          send_after?: string
          sent_at?: string | null
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          auction_house_id: string
          auction_id: string
          buyer_id: string
          buyer_premium_amount: number
          collected_at: string | null
          created_at: string
          currency: string
          dispute_window_ends_at: string | null
          hammer_price: number
          id: string
          lot_id: string
          paid_at: string | null
          payment_due_at: string
          payment_failure_reason: string | null
          payment_intent_id: string | null
          payment_provider: string | null
          payment_reference: string | null
          payout_hold_until: string | null
          pickup_confirmed_by_buyer: boolean
          pickup_confirmed_by_seller: boolean
          protection_fee: number
          settled_at: string | null
          shipping_amount: number
          status: string
          tax_amount: number
          total_amount: number
          updated_at: string
          vat_rate: number
        }
        Insert: {
          auction_house_id: string
          auction_id: string
          buyer_id: string
          buyer_premium_amount?: number
          collected_at?: string | null
          created_at?: string
          currency?: string
          dispute_window_ends_at?: string | null
          hammer_price: number
          id?: string
          lot_id: string
          paid_at?: string | null
          payment_due_at?: string
          payment_failure_reason?: string | null
          payment_intent_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payout_hold_until?: string | null
          pickup_confirmed_by_buyer?: boolean
          pickup_confirmed_by_seller?: boolean
          protection_fee?: number
          settled_at?: string | null
          shipping_amount?: number
          status?: string
          tax_amount?: number
          total_amount: number
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          auction_house_id?: string
          auction_id?: string
          buyer_id?: string
          buyer_premium_amount?: number
          collected_at?: string | null
          created_at?: string
          currency?: string
          dispute_window_ends_at?: string | null
          hammer_price?: number
          id?: string
          lot_id?: string
          paid_at?: string | null
          payment_due_at?: string
          payment_failure_reason?: string | null
          payment_intent_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payout_hold_until?: string | null
          pickup_confirmed_by_buyer?: boolean
          pickup_confirmed_by_seller?: boolean
          protection_fee?: number
          settled_at?: string | null
          shipping_amount?: number
          status?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_auction_house_id_fkey"
            columns: ["auction_house_id"]
            isOneToOne: false
            referencedRelation: "auction_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: true
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_provider_events: {
        Row: {
          event_type: string
          id: string
          order_id: string | null
          payload: Json
          processed_at: string
          provider: string
        }
        Insert: {
          event_type: string
          id: string
          order_id?: string | null
          payload: Json
          processed_at?: string
          provider?: string
        }
        Update: {
          event_type?: string
          id?: string
          order_id?: string | null
          payload?: Json
          processed_at?: string
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_provider_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          auction_house_id: string
          created_at: string
          currency: string
          eligible_at: string | null
          gross_amount: number
          id: string
          net_amount: number
          order_id: string
          paid_at: string | null
          platform_fee: number
          provider_reference: string | null
          status: string
        }
        Insert: {
          auction_house_id: string
          created_at?: string
          currency?: string
          eligible_at?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          order_id: string
          paid_at?: string | null
          platform_fee?: number
          provider_reference?: string | null
          status?: string
        }
        Update: {
          auction_house_id?: string
          created_at?: string
          currency?: string
          eligible_at?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string
          paid_at?: string | null
          platform_fee?: number
          provider_reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_auction_house_id_fkey"
            columns: ["auction_house_id"]
            isOneToOne: false
            referencedRelation: "auction_houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          bidding_enabled: boolean
          id: boolean
          maintenance_message: string | null
          maintenance_mode: boolean
          payments_enabled: boolean
          updated_at: string
        }
        Insert: {
          bidding_enabled?: boolean
          id?: boolean
          maintenance_message?: string | null
          maintenance_mode?: boolean
          payments_enabled?: boolean
          updated_at?: string
        }
        Update: {
          bidding_enabled?: boolean
          id?: boolean
          maintenance_message?: string | null
          maintenance_mode?: boolean
          payments_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      privacy_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          details: string | null
          id: string
          request_type: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          details?: string | null
          id?: string
          request_type: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          details?: string | null
          id?: string
          request_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          app_role: string
          country_code: string | null
          created_at: string
          display_name: string
          id: string
          locale: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string
          app_role?: string
          country_code?: string | null
          created_at?: string
          display_name?: string
          id: string
          locale?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          app_role?: string
          country_code?: string | null
          created_at?: string
          display_name?: string
          id?: string
          locale?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_recommendations: {
        Row: {
          channel: string
          created_at: string
          expected_incremental_bidders: number | null
          expected_incremental_views: number | null
          id: string
          lot_id: string
          roi_score: number | null
          status: string
          suggested_budget: number | null
          target_radius_km: number | null
        }
        Insert: {
          channel: string
          created_at?: string
          expected_incremental_bidders?: number | null
          expected_incremental_views?: number | null
          id?: string
          lot_id: string
          roi_score?: number | null
          status?: string
          suggested_budget?: number | null
          target_radius_km?: number | null
        }
        Update: {
          channel?: string
          created_at?: string
          expected_incremental_bidders?: number | null
          expected_incremental_views?: number | null
          id?: string
          lot_id?: string
          roi_score?: number | null
          status?: string
          suggested_budget?: number | null
          target_radius_km?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_recommendations_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      proxy_bids: {
        Row: {
          bidder_id: string
          created_at: string
          lot_id: string
          max_amount: number
          updated_at: string
        }
        Insert: {
          bidder_id: string
          created_at?: string
          lot_id: string
          max_amount: number
          updated_at?: string
        }
        Update: {
          bidder_id?: string
          created_at?: string
          lot_id?: string
          max_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proxy_bids_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          id: string
          label: string | null
          query: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          query?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          query?: Json
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          lot_id: string | null
          message: string
          order_id: string | null
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          lot_id?: string | null
          message: string
          order_id?: string | null
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          lot_id?: string | null
          message?: string
          order_id?: string | null
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      system_incidents: {
        Row: {
          component: string
          created_at: string
          id: string
          message: string
          metadata: Json
          resolved: boolean
          resolved_at: string | null
          severity: string
        }
        Insert: {
          component: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json
          resolved?: boolean
          resolved_at?: string | null
          severity: string
        }
        Update: {
          component?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          accepted_at: string
          document_slug: string
          document_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          document_slug: string
          document_version: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          document_slug?: string
          document_version?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          created_at: string
          lot_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          lot_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          lot_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_dashboard: { Args: never; Returns: Json }
      admin_extend_open_lots: {
        Args: { p_minutes: number; p_reason: string }
        Returns: number
      }
      admin_set_bidding: {
        Args: { p_enabled: boolean; p_message?: string }
        Returns: boolean
      }
      aggregate_recent_marketplace_events: { Args: never; Returns: number }
      attach_intake_to_lot: {
        Args: { p_intake_id: string; p_lot_id: string }
        Returns: {
          auction_id: string
          bid_count: number
          brand: string | null
          catalog_status: string
          category: string | null
          closed_at: string | null
          condition: string | null
          country_code: string | null
          created_at: string
          current_bid: number
          description: string | null
          ends_at: string
          estimate_high: number | null
          estimate_low: number | null
          estimated_value: number | null
          extension_count: number
          extension_seconds: number
          height_cm: number | null
          id: string
          image_urls: string[]
          length_cm: number | null
          location: unknown
          lot_number: number
          min_increment: number
          model: string | null
          qa_status: string
          reserve_met: boolean
          reserve_price: number | null
          sale_status: string
          seller_latitude: number | null
          seller_longitude: number | null
          shipping_mode: string | null
          soft_close_seconds: number
          starting_bid: number | null
          status: string
          title: string
          transport_class: string | null
          warning_count: number
          weight_kg: number | null
          width_cm: number | null
          winner_id: string | null
          winning_bid_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "lots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      base_radius_for: { Args: { p_value: number }; Returns: number }
      calculate_fee_quote: {
        Args: {
          p_buyer_premium_pct: number
          p_hammer_price: number
          p_protection_enabled?: boolean
          p_transaction_model?: string
        }
        Returns: {
          buyer_premium_amount: number
          buyer_premium_pct: number
          hammer_price: number
          protection_cap: number
          protection_fee: number
          protection_fixed_fee: number
          protection_rate_pct: number
          subtotal_before_tax: number
          total_before_tax: number
          transaction_model: string
        }[]
      }
      close_ended_lots: { Args: never; Returns: number }
      confirm_handover: {
        Args: { p_code: string; p_order_id: string }
        Returns: {
          auction_house_id: string
          auction_id: string
          buyer_id: string
          buyer_premium_amount: number
          collected_at: string | null
          created_at: string
          currency: string
          dispute_window_ends_at: string | null
          hammer_price: number
          id: string
          lot_id: string
          paid_at: string | null
          payment_due_at: string
          payment_failure_reason: string | null
          payment_intent_id: string | null
          payment_provider: string | null
          payment_reference: string | null
          payout_hold_until: string | null
          pickup_confirmed_by_buyer: boolean
          pickup_confirmed_by_seller: boolean
          protection_fee: number
          settled_at: string | null
          shipping_amount: number
          status: string
          tax_amount: number
          total_amount: number
          updated_at: string
          vat_rate: number
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_auction: {
        Args: {
          p_buyer_premium?: number
          p_ends_at: string
          p_house_id: string
          p_location: string
          p_pickup_info?: string
          p_title: string
        }
        Returns: {
          buyer_premium: number
          buyer_protection_enabled: boolean
          cover_url: string | null
          created_at: string
          default_vat_rate: number | null
          ends_at: string
          house_id: string
          id: string
          location: string | null
          pickup_info: string | null
          platform: string | null
          public: boolean
          publication_status: string
          starts_at: string | null
          status: string
          terms_version: string | null
          title: string
          transaction_model: string
          vat_mode: string
        }
        SetofOptions: {
          from: "*"
          to: "auctions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_auction_house: {
        Args: {
          p_country_code: string
          p_legal_name: string
          p_location: string
          p_name: string
          p_registration_number?: string
          p_vat_number?: string
        }
        Returns: {
          charges_enabled: boolean
          company_registration_number: string | null
          country_code: string | null
          created_at: string
          id: string
          legal_name: string | null
          location: string | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean
          owner_id: string | null
          payment_account_id: string | null
          payouts_enabled: boolean
          slug: string
          vat_number: string | null
          verification_status: string
          verified: boolean
        }
        SetofOptions: {
          from: "*"
          to: "auction_houses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_lot: {
        Args: {
          p_auction_id: string
          p_brand?: string
          p_category: string
          p_condition: string
          p_description?: string
          p_model?: string
          p_starting_bid: number
          p_title: string
        }
        Returns: {
          auction_id: string
          bid_count: number
          brand: string | null
          catalog_status: string
          category: string | null
          closed_at: string | null
          condition: string | null
          country_code: string | null
          created_at: string
          current_bid: number
          description: string | null
          ends_at: string
          estimate_high: number | null
          estimate_low: number | null
          estimated_value: number | null
          extension_count: number
          extension_seconds: number
          height_cm: number | null
          id: string
          image_urls: string[]
          length_cm: number | null
          location: unknown
          lot_number: number
          min_increment: number
          model: string | null
          qa_status: string
          reserve_met: boolean
          reserve_price: number | null
          sale_status: string
          seller_latitude: number | null
          seller_longitude: number | null
          shipping_mode: string | null
          soft_close_seconds: number
          starting_bid: number | null
          status: string
          title: string
          transport_class: string | null
          warning_count: number
          weight_kg: number | null
          width_cm: number | null
          winner_id: string | null
          winning_bid_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "lots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      evaluate_all_liquidity: { Args: never; Returns: number }
      evaluate_liquidity: {
        Args: { p_lot_id: string }
        Returns: {
          base_radius_km: number
          country_code: string | null
          created_at: string
          current_radius_km: number
          density_factor: number
          estimated_value: number | null
          geo_expansion_level: number
          intervention_state: string
          last_evaluated_at: string | null
          latitude: number | null
          liquidity_score: number
          longitude: number | null
          lot_id: string
          market_scope: string
          max_radius_km: number
          next_evaluation_at: string | null
          ranking_boost: number
          shipping_factor: number
          shipping_mode: string
          transport_class: string
          updated_at: string
          urgency_multiplier: number
          value_band: string
        }
        SetofOptions: {
          from: "*"
          to: "lot_liquidity_profile"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      initialize_liquidity_profile: {
        Args: { p_lot_id: string }
        Returns: {
          base_radius_km: number
          country_code: string | null
          created_at: string
          current_radius_km: number
          density_factor: number
          estimated_value: number | null
          geo_expansion_level: number
          intervention_state: string
          last_evaluated_at: string | null
          latitude: number | null
          liquidity_score: number
          longitude: number | null
          lot_id: string
          market_scope: string
          max_radius_km: number
          next_evaluation_at: string | null
          ranking_boost: number
          shipping_factor: number
          shipping_mode: string
          transport_class: string
          updated_at: string
          urgency_multiplier: number
          value_band: string
        }
        SetofOptions: {
          from: "*"
          to: "lot_liquidity_profile"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      issue_handover_code: { Args: { p_order_id: string }; Returns: string }
      lot_bid_history: {
        Args: { p_limit?: number; p_lot_id: string }
        Returns: {
          amount: number
          created_at: string
        }[]
      }
      lot_fee_quote: {
        Args: { p_hammer_price?: number; p_lot_id: string }
        Returns: {
          buyer_premium_amount: number
          buyer_premium_pct: number
          hammer_price: number
          lot_id: string
          protection_cap: number
          protection_fee: number
          protection_fixed_fee: number
          protection_rate_pct: number
          total_before_tax: number
          transaction_model: string
        }[]
      }
      monitor_system_health: { Args: never; Returns: number }
      place_bid: {
        Args: { p_amount: number; p_lot_id: string }
        Returns: {
          auction_id: string
          bid_count: number
          brand: string | null
          catalog_status: string
          category: string | null
          closed_at: string | null
          condition: string | null
          country_code: string | null
          created_at: string
          current_bid: number
          description: string | null
          ends_at: string
          estimate_high: number | null
          estimate_low: number | null
          estimated_value: number | null
          extension_count: number
          extension_seconds: number
          height_cm: number | null
          id: string
          image_urls: string[]
          length_cm: number | null
          location: unknown
          lot_number: number
          min_increment: number
          model: string | null
          qa_status: string
          reserve_met: boolean
          reserve_price: number | null
          sale_status: string
          seller_latitude: number | null
          seller_longitude: number | null
          shipping_mode: string | null
          soft_close_seconds: number
          starting_bid: number | null
          status: string
          title: string
          transport_class: string | null
          warning_count: number
          weight_kg: number | null
          width_cm: number | null
          winner_id: string | null
          winning_bid_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "lots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      publish_auction: {
        Args: { p_auction_id: string }
        Returns: {
          buyer_premium: number
          buyer_protection_enabled: boolean
          cover_url: string | null
          created_at: string
          default_vat_rate: number | null
          ends_at: string
          house_id: string
          id: string
          location: string | null
          pickup_info: string | null
          platform: string | null
          public: boolean
          publication_status: string
          starts_at: string | null
          status: string
          terms_version: string | null
          title: string
          transaction_model: string
          vat_mode: string
        }
        SetofOptions: {
          from: "*"
          to: "auctions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      publish_lot: {
        Args: { p_lot_id: string }
        Returns: {
          auction_id: string
          bid_count: number
          brand: string | null
          catalog_status: string
          category: string | null
          closed_at: string | null
          condition: string | null
          country_code: string | null
          created_at: string
          current_bid: number
          description: string | null
          ends_at: string
          estimate_high: number | null
          estimate_low: number | null
          estimated_value: number | null
          extension_count: number
          extension_seconds: number
          height_cm: number | null
          id: string
          image_urls: string[]
          length_cm: number | null
          location: unknown
          lot_number: number
          min_increment: number
          model: string | null
          qa_status: string
          reserve_met: boolean
          reserve_price: number | null
          sale_status: string
          seller_latitude: number | null
          seller_longitude: number | null
          shipping_mode: string | null
          soft_close_seconds: number
          starting_bid: number | null
          status: string
          title: string
          transport_class: string | null
          warning_count: number
          weight_kg: number | null
          width_cm: number | null
          winner_id: string | null
          winning_bid_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "lots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      queue_due_notifications: { Args: never; Returns: number }
      ranked_feed: {
        Args: {
          p_brand?: string
          p_category?: string
          p_lat?: number
          p_limit?: number
          p_lon?: number
          p_price_max?: number
          p_price_min?: number
          p_radius_km?: number
        }
        Returns: {
          auction_id: string
          bid_count: number
          brand: string
          category: string
          condition: string
          current_bid: number
          distance_km: number
          ends_at: string
          final_score: number
          image_urls: string[]
          liquidity_score: number
          lot_id: string
          model: string
          qa_status: string
          reason_codes: string[]
          title: string
          visibility_radius_km: number
        }[]
      }
      record_marketplace_event: {
        Args: {
          p_distance_km?: number
          p_event_type: string
          p_lot_id: string
          p_metadata?: Json
          p_session_id?: string
        }
        Returns: number
      }
      register_for_auction: {
        Args: { p_accept_rules: boolean; p_auction_id: string }
        Returns: {
          approved: boolean
          auction_id: string
          created_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "auction_registrations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      release_eligible_payouts: { Args: never; Returns: number }
      search_lots: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          brand: string
          category: string
          current_bid: number
          ends_at: string
          image_urls: string[]
          lot_id: string
          model: string
          similarity_score: number
          title: string
        }[]
      }
      server_time: { Args: never; Returns: string }
      shipping_factor_for: { Args: { p_mode: string }; Returns: number }
      system_health: { Args: never; Returns: Json }
      value_band_for: { Args: { p_value: number }; Returns: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
