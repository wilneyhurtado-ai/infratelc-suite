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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          checklist_type: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          is_required: boolean | null
          item_text: string
          notes: string | null
          photo_evidence: string | null
          tenant_id: string
          work_order_id: string
        }
        Insert: {
          checklist_type: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          is_required?: boolean | null
          item_text: string
          notes?: string | null
          photo_evidence?: string | null
          tenant_id: string
          work_order_id: string
        }
        Update: {
          checklist_type?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          is_required?: boolean | null
          item_text?: string
          notes?: string | null
          photo_evidence?: string | null
          tenant_id?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          business_name: string | null
          city: string | null
          contact_person: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          region: string | null
          rut: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          region?: string | null
          rut?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_name?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          region?: string | null
          rut?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          budget: number | null
          client_name: string | null
          code: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          location: Json | null
          manager_id: string | null
          name: string
          spent: number | null
          start_date: string | null
          status: string
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_name?: string | null
          code: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: Json | null
          manager_id?: string | null
          name: string
          spent?: number | null
          start_date?: string | null
          status?: string
          tenant_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_name?: string | null
          code?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: Json | null
          manager_id?: string | null
          name?: string
          spent?: number | null
          start_date?: string | null
          status?: string
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          category_id: string
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          description: string
          document_number: string | null
          expense_date: string
          id: string
          notes: string | null
          rejection_reason: string | null
          site_id: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category_id: string
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          document_number?: string | null
          expense_date: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          site_id: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category_id?: string
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          document_number?: string | null
          expense_date?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          site_id?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          assigned_to: string | null
          corrective_actions: string | null
          created_at: string
          description: string
          id: string
          incident_number: string
          incident_type: string
          occurred_at: string
          photos: Json | null
          preventive_actions: string | null
          reported_by: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          site_id: string | null
          status: string
          tenant_id: string
          title: string
          updated_at: string
          witnesses: string[] | null
          work_order_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          corrective_actions?: string | null
          created_at?: string
          description: string
          id?: string
          incident_number: string
          incident_type: string
          occurred_at: string
          photos?: Json | null
          preventive_actions?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity: string
          site_id?: string | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          witnesses?: string[] | null
          work_order_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          corrective_actions?: string | null
          created_at?: string
          description?: string
          id?: string
          incident_number?: string
          incident_type?: string
          occurred_at?: string
          photos?: Json | null
          preventive_actions?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          site_id?: string | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          witnesses?: string[] | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_enhanced"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          assigned_to: string | null
          client_id: string
          created_at: string
          created_by: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          name: string
          notes: string | null
          probability: number | null
          stage: string
          tenant_id: string
          updated_at: string
          value_clp: number | null
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          name: string
          notes?: string | null
          probability?: number | null
          stage?: string
          tenant_id: string
          updated_at?: string
          value_clp?: number | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          probability?: number | null
          stage?: string
          tenant_id?: string
          updated_at?: string
          value_clp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_items: {
        Row: {
          afc_deduction: number | null
          afp_deduction: number | null
          base_salary: number | null
          bonus_amounts: Json | null
          created_at: string
          email_sent: boolean | null
          email_sent_at: string | null
          employee_id: string
          employee_name: string
          employee_rut: string | null
          gross_non_taxable: number | null
          gross_taxable: number | null
          health_deduction: number | null
          id: string
          net_pay: number | null
          normal_hours: number | null
          other_deductions: Json | null
          overtime_amount: number | null
          overtime_hours: number | null
          payroll_run_id: string
          pdf_url: string | null
          position: string | null
          tax_deduction: number | null
          tenant_id: string
          updated_at: string
          worked_days: number | null
        }
        Insert: {
          afc_deduction?: number | null
          afp_deduction?: number | null
          base_salary?: number | null
          bonus_amounts?: Json | null
          created_at?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_id: string
          employee_name: string
          employee_rut?: string | null
          gross_non_taxable?: number | null
          gross_taxable?: number | null
          health_deduction?: number | null
          id?: string
          net_pay?: number | null
          normal_hours?: number | null
          other_deductions?: Json | null
          overtime_amount?: number | null
          overtime_hours?: number | null
          payroll_run_id: string
          pdf_url?: string | null
          position?: string | null
          tax_deduction?: number | null
          tenant_id: string
          updated_at?: string
          worked_days?: number | null
        }
        Update: {
          afc_deduction?: number | null
          afp_deduction?: number | null
          base_salary?: number | null
          bonus_amounts?: Json | null
          created_at?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_id?: string
          employee_name?: string
          employee_rut?: string | null
          gross_non_taxable?: number | null
          gross_taxable?: number | null
          health_deduction?: number | null
          id?: string
          net_pay?: number | null
          normal_hours?: number | null
          other_deductions?: Json | null
          overtime_amount?: number | null
          overtime_hours?: number | null
          payroll_run_id?: string
          pdf_url?: string | null
          position?: string | null
          tax_deduction?: number | null
          tenant_id?: string
          updated_at?: string
          worked_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_items_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_rates: {
        Row: {
          accident_rate: number
          afc_employer_fixed_term: number
          afc_employer_indefinite: number
          afc_worker_fixed_term: number
          afc_worker_indefinite: number
          afp_employer_rate: number
          afp_taxable_cap: number
          afp_worker_rate: number
          created_at: string
          created_by: string | null
          family_allowance_amount: number
          fonasa_rate: number
          gratification_cap: number
          gratification_rate: number
          health_taxable_cap: number
          id: string
          minimum_wage: number
          period: string
          tenant_id: string
          uf_value: number
          updated_at: string
          utm_value: number
        }
        Insert: {
          accident_rate?: number
          afc_employer_fixed_term?: number
          afc_employer_indefinite?: number
          afc_worker_fixed_term?: number
          afc_worker_indefinite?: number
          afp_employer_rate?: number
          afp_taxable_cap?: number
          afp_worker_rate?: number
          created_at?: string
          created_by?: string | null
          family_allowance_amount?: number
          fonasa_rate?: number
          gratification_cap?: number
          gratification_rate?: number
          health_taxable_cap?: number
          id?: string
          minimum_wage?: number
          period: string
          tenant_id: string
          uf_value?: number
          updated_at?: string
          utm_value?: number
        }
        Update: {
          accident_rate?: number
          afc_employer_fixed_term?: number
          afc_employer_indefinite?: number
          afc_worker_fixed_term?: number
          afc_worker_indefinite?: number
          afp_employer_rate?: number
          afp_taxable_cap?: number
          afp_worker_rate?: number
          created_at?: string
          created_by?: string | null
          family_allowance_amount?: number
          fonasa_rate?: number
          gratification_cap?: number
          gratification_rate?: number
          health_taxable_cap?: number
          id?: string
          minimum_wage?: number
          period?: string
          tenant_id?: string
          uf_value?: number
          updated_at?: string
          utm_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_rates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          calculated_at: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          period: string
          rates_id: string
          status: string
          tenant_id: string
          total_deductions: number | null
          total_employees: number | null
          total_gross_pay: number | null
          total_net_pay: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          calculated_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          period: string
          rates_id: string
          status?: string
          tenant_id: string
          total_deductions?: number | null
          total_employees?: number | null
          total_gross_pay?: number | null
          total_net_pay?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          calculated_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          period?: string
          rates_id?: string
          status?: string
          tenant_id?: string
          total_deductions?: number | null
          total_employees?: number | null
          total_gross_pay?: number | null
          total_net_pay?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_rates_id_fkey"
            columns: ["rates_id"]
            isOneToOne: false
            referencedRelation: "payroll_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      personnel: {
        Row: {
          base_salary: number | null
          contract_type: string | null
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          employee_code: string | null
          full_name: string
          hire_date: string | null
          id: string
          phone: string | null
          position: string
          role: Database["public"]["Enums"]["user_role"] | null
          rut: string | null
          salary: number | null
          site_id: string | null
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          base_salary?: number | null
          contract_type?: string | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          employee_code?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          phone?: string | null
          position: string
          role?: Database["public"]["Enums"]["user_role"] | null
          rut?: string | null
          salary?: number | null
          site_id?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          base_salary?: number | null
          contract_type?: string | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          employee_code?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          phone?: string | null
          position?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          rut?: string | null
          salary?: number | null
          site_id?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personnel_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personnel_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_position: string | null
          cost_center_assignments: string[] | null
          created_at: string
          department: string | null
          employee_code: string | null
          full_name: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          permissions_override: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          settings: Json | null
          site_assignment: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_position?: string | null
          cost_center_assignments?: string[] | null
          created_at?: string
          department?: string | null
          employee_code?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions_override?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          settings?: Json | null
          site_assignment?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_position?: string | null
          cost_center_assignments?: string[] | null
          created_at?: string
          department?: string | null
          employee_code?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions_override?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          settings?: Json | null
          site_assignment?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          actual_amount: number | null
          approved_at: string | null
          approved_by: string | null
          attachments: Json | null
          cost_center_id: string | null
          created_at: string
          currency: string | null
          delivery_date: string | null
          description: string
          estimated_amount: number
          id: string
          items: Json | null
          justification: string | null
          purchase_order_number: string | null
          rejection_reason: string | null
          request_number: string
          requested_by: string
          site_id: string | null
          status: string
          supplier_suggested: string | null
          tenant_id: string
          updated_at: string
          urgency: string
        }
        Insert: {
          actual_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          cost_center_id?: string | null
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          description: string
          estimated_amount: number
          id?: string
          items?: Json | null
          justification?: string | null
          purchase_order_number?: string | null
          rejection_reason?: string | null
          request_number: string
          requested_by: string
          site_id?: string | null
          status?: string
          supplier_suggested?: string | null
          tenant_id: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          actual_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          cost_center_id?: string | null
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          description?: string
          estimated_amount?: number
          id?: string
          items?: Json | null
          justification?: string | null
          purchase_order_number?: string | null
          rejection_reason?: string | null
          request_number?: string
          requested_by?: string
          site_id?: string | null
          status?: string
          supplier_suggested?: string | null
          tenant_id?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_enhanced"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          budget: number
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          spent: number
          start_date: string | null
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          budget?: number
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          spent?: number
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          spent?: number
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sites_enhanced: {
        Row: {
          access_road: string | null
          address: string | null
          budget: number | null
          client_id: string | null
          comuna: string | null
          coordinates: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          fiber_available: boolean | null
          height_meters: number | null
          id: string
          land_owner: string | null
          name: string
          notes: string | null
          permits_status: string | null
          power_available: boolean | null
          priority: string | null
          project_manager_id: string | null
          region: string | null
          site_code: string
          site_type: string
          spent: number | null
          start_date: string | null
          status: string
          structure_type: string | null
          supervisor_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          access_road?: string | null
          address?: string | null
          budget?: number | null
          client_id?: string | null
          comuna?: string | null
          coordinates?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          fiber_available?: boolean | null
          height_meters?: number | null
          id?: string
          land_owner?: string | null
          name: string
          notes?: string | null
          permits_status?: string | null
          power_available?: boolean | null
          priority?: string | null
          project_manager_id?: string | null
          region?: string | null
          site_code: string
          site_type?: string
          spent?: number | null
          start_date?: string | null
          status?: string
          structure_type?: string | null
          supervisor_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          access_road?: string | null
          address?: string | null
          budget?: number | null
          client_id?: string | null
          comuna?: string | null
          coordinates?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          fiber_available?: boolean | null
          height_meters?: number | null
          id?: string
          land_owner?: string | null
          name?: string
          notes?: string | null
          permits_status?: string | null
          power_available?: boolean | null
          priority?: string | null
          project_manager_id?: string | null
          region?: string | null
          site_code?: string
          site_type?: string
          spent?: number | null
          start_date?: string | null
          status?: string
          structure_type?: string | null
          supervisor_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_enhanced_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_enhanced_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_end_time: string | null
          break_start_time: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          location_check_in: Json | null
          location_check_out: Json | null
          notes: string | null
          overtime_hours: number | null
          site_id: string | null
          status: string
          tenant_id: string
          total_hours: number | null
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_end_time?: string | null
          break_start_time?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date: string
          employee_id: string
          id?: string
          location_check_in?: Json | null
          location_check_out?: Json | null
          notes?: string | null
          overtime_hours?: number | null
          site_id?: string | null
          status?: string
          tenant_id: string
          total_hours?: number | null
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_end_time?: string | null
          break_start_time?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          location_check_in?: Json | null
          location_check_out?: Json | null
          notes?: string | null
          overtime_hours?: number | null
          site_id?: string | null
          status?: string
          tenant_id?: string
          total_hours?: number | null
          updated_at?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_enhanced"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cost_centers: {
        Row: {
          cost_center_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          cost_center_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          cost_center_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cost_centers_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cost_centers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          checklist_completed: boolean | null
          client_signature: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          materials_needed: string[] | null
          order_number: string
          photos: Json | null
          priority: string | null
          safety_requirements: string[] | null
          scheduled_date: string | null
          site_id: string
          started_at: string | null
          status: string
          technician_signature: string | null
          tenant_id: string
          title: string
          updated_at: string
          work_type: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          checklist_completed?: boolean | null
          client_signature?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          materials_needed?: string[] | null
          order_number: string
          photos?: Json | null
          priority?: string | null
          safety_requirements?: string[] | null
          scheduled_date?: string | null
          site_id: string
          started_at?: string | null
          status?: string
          technician_signature?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          work_type: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          checklist_completed?: boolean | null
          client_signature?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          materials_needed?: string[] | null
          order_number?: string
          photos?: Json | null
          priority?: string | null
          safety_requirements?: string[] | null
          scheduled_date?: string | null
          site_id?: string
          started_at?: string | null
          status?: string
          technician_signature?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites_enhanced"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant: {
        Args: { _user_id: string }
        Returns: string
      }
      update_site_spent: {
        Args: { site_id: string }
        Returns: undefined
      }
      user_has_permission: {
        Args: { _permission_name: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "owner"
        | "admin"
        | "rrhh"
        | "finanzas"
        | "jefe_obra"
        | "supervisor"
        | "tecnico"
        | "trabajador"
        | "auditor"
        | "cliente_invitado"
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
      user_role: [
        "owner",
        "admin",
        "rrhh",
        "finanzas",
        "jefe_obra",
        "supervisor",
        "tecnico",
        "trabajador",
        "auditor",
        "cliente_invitado",
      ],
    },
  },
} as const
