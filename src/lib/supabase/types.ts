// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          complement: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          number: string | null
          phone: string | null
          pix_key: string | null
          pix_key_type: string | null
          state: string | null
          street: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'clients_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      documents: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          data: Json
          id: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          data?: Json
          id?: string
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          data?: Json
          id?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'documents_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          document: string | null
          email: string
          id: string
          is_admin: boolean
          logo_url: string | null
          name: string | null
          phone: string | null
          pix_key: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email: string
          id: string
          is_admin?: boolean
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          pix_key?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string
          id?: string
          is_admin?: boolean
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          pix_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recurring_documents: {
        Row: {
          active: boolean
          amount: number
          client_id: string
          created_at: string
          document_data: Json
          frequency: string
          id: string
          next_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount?: number
          client_id: string
          created_at?: string
          document_data?: Json
          frequency?: string
          id?: string
          next_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          client_id?: string
          created_at?: string
          document_data?: Json
          frequency?: string
          id?: string
          next_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recurring_documents_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recurring_documents_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: clients
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   name: text (not null)
//   document: text (nullable)
//   email: text (nullable)
//   phone: text (nullable)
//   address: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   pix_key_type: text (nullable)
//   pix_key: text (nullable)
//   cep: text (nullable)
//   street: text (nullable)
//   number: text (nullable)
//   complement: text (nullable)
//   neighborhood: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
// Table: documents
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   client_id: uuid (nullable)
//   type: text (not null, default: 'receipt'::text)
//   amount: numeric (not null, default: 0)
//   status: text (not null, default: 'issued'::text)
//   data: jsonb (not null, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   name: text (not null)
//   description: text (nullable)
//   price: numeric (not null, default: 0)
//   type: text (not null, default: 'product'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   category: text (nullable)
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (nullable)
//   document: text (nullable)
//   phone: text (nullable)
//   pix_key: text (nullable)
//   logo_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   is_admin: boolean (not null, default: false)
// Table: recurring_documents
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   client_id: uuid (not null)
//   title: text (not null)
//   amount: numeric (not null, default: 0)
//   frequency: text (not null, default: 'monthly'::text)
//   next_date: date (not null)
//   active: boolean (not null, default: true)
//   document_data: jsonb (not null, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: clients
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
//   FOREIGN KEY clients_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: documents
//   FOREIGN KEY documents_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
//   PRIMARY KEY documents_pkey: PRIMARY KEY (id)
//   FOREIGN KEY documents_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
//   FOREIGN KEY products_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: recurring_documents
//   FOREIGN KEY recurring_documents_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY recurring_documents_pkey: PRIMARY KEY (id)
//   FOREIGN KEY recurring_documents_user_id_fkey: FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: clients
//   Policy "Acesso Total Autenticado" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Users can manage their clients" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = user_id) OR is_admin())
//     WITH CHECK: ((auth.uid() = user_id) OR is_admin())
//   Policy "Users can manage their own clients" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: documents
//   Policy "Admins can view all documents" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_admin()
//   Policy "Users can manage their documents" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = user_id) OR is_admin())
//     WITH CHECK: ((auth.uid() = user_id) OR is_admin())
//   Policy "Users can manage their own documents" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: products
//   Policy "Users can manage their products" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = user_id) OR is_admin())
//     WITH CHECK: ((auth.uid() = user_id) OR is_admin())
// Table: profiles
//   Policy "Users can insert own profile" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can manage their own profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = id) OR is_admin())
//     WITH CHECK: ((auth.uid() = id) OR is_admin())
//   Policy "Users can view profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = id) OR is_admin())
// Table: recurring_documents
//   Policy "Users can manage their own recurring_documents" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = user_id) OR is_admin())
//     WITH CHECK: ((auth.uid() = user_id) OR is_admin())

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name)
//     VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name')
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_updated_at()
//   CREATE OR REPLACE FUNCTION public.handle_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION is_admin()
//   CREATE OR REPLACE FUNCTION public.is_admin()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   BEGIN
//     RETURN EXISTS (
//       SELECT 1
//       FROM public.profiles
//       WHERE id = auth.uid() AND is_admin = true
//     );
//   END;
//   $function$
//
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: clients
//   tr_clients_updated_at: CREATE TRIGGER tr_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION handle_updated_at()
// Table: documents
//   tr_documents_updated_at: CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at()
// Table: products
//   tr_products_updated_at: CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION handle_updated_at()
// Table: profiles
//   tr_profiles_updated_at: CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at()
// Table: recurring_documents
//   tr_recurring_documents_updated_at: CREATE TRIGGER tr_recurring_documents_updated_at BEFORE UPDATE ON public.recurring_documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at()

// --- INDEXES ---
// Table: clients
//   CREATE INDEX idx_clients_user_id ON public.clients USING btree (user_id)
// Table: documents
//   CREATE INDEX idx_documents_user_id ON public.documents USING btree (user_id)
// Table: products
//   CREATE INDEX idx_products_user_id ON public.products USING btree (user_id)
// Table: recurring_documents
//   CREATE INDEX idx_recurring_documents_user_id ON public.recurring_documents USING btree (user_id)
