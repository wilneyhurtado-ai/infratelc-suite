import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      work_orders: any;
      timesheets: any;
      expenses: any;
      sites: any;
      profiles: any;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/api', '');
    const method = req.method;

    console.log(`API Request: ${method} ${path}`);

    // Routes
    if (path.startsWith('/work-orders')) {
      return await handleWorkOrders(req, supabaseClient, path, method);
    } else if (path.startsWith('/timesheets')) {
      return await handleTimesheets(req, supabaseClient, path, method);
    } else if (path.startsWith('/expenses')) {
      return await handleExpenses(req, supabaseClient, path, method);
    } else if (path.startsWith('/sites')) {
      return await handleSites(req, supabaseClient, path, method);
    } else if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Work Orders API handlers
async function handleWorkOrders(req: Request, supabase: any, path: string, method: string) {
  const pathParts = path.split('/').filter(Boolean);
  
  switch (method) {
    case 'GET':
      if (pathParts.length === 1) {
        // GET /work-orders - List all work orders
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            sites(name, address),
            profiles:assigned_to(full_name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (pathParts.length === 2) {
        // GET /work-orders/:id - Get specific work order
        const id = pathParts[1];
        const { data, error } = await supabase
          .from('work_orders')
          .select(`
            *,
            sites(name, address),
            profiles:assigned_to(full_name)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      break;

    case 'POST':
      if (pathParts.length === 1) {
        // POST /work-orders - Create new work order
        const body = await req.json();
        const { data, error } = await supabase
          .from('work_orders')
          .insert(body)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      break;

    case 'PUT':
      if (pathParts.length === 2) {
        // PUT /work-orders/:id - Update work order
        const id = pathParts[1];
        const body = await req.json();
        const { data, error } = await supabase
          .from('work_orders')
          .update(body)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      break;
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Timesheets API handlers
async function handleTimesheets(req: Request, supabase: any, path: string, method: string) {
  const pathParts = path.split('/').filter(Boolean);
  
  switch (method) {
    case 'GET':
      if (pathParts.length === 1) {
        // GET /timesheets - List timesheets
        const url = new URL(req.url);
        const employeeId = url.searchParams.get('employee_id');
        const date = url.searchParams.get('date');
        
        let query = supabase
          .from('timesheets')
          .select(`
            *,
            profiles:employee_id(full_name),
            sites(name)
          `);

        if (employeeId) query = query.eq('employee_id', employeeId);
        if (date) query = query.eq('date', date);

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      break;

    case 'POST':
      if (pathParts.length === 1) {
        // POST /timesheets - Create timesheet entry
        const body = await req.json();
        const { data, error } = await supabase
          .from('timesheets')
          .insert(body)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      break;
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Expenses API handlers
async function handleExpenses(req: Request, supabase: any, path: string, method: string) {
  const pathParts = path.split('/').filter(Boolean);
  
  switch (method) {
    case 'GET':
      if (pathParts.length === 1) {
        // GET /expenses - List expenses
        const url = new URL(req.url);
        const userId = url.searchParams.get('user_id');
        const status = url.searchParams.get('status');
        
        let query = supabase
          .from('expenses')
          .select(`
            *,
            profiles:created_by(full_name),
            sites(name),
            expense_categories(name)
          `);

        if (userId) query = query.eq('created_by', userId);
        if (status) query = query.eq('approval_status', status);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      break;

    case 'POST':
      if (pathParts.length === 1) {
        // POST /expenses - Create expense
        const body = await req.json();
        const { data, error } = await supabase
          .from('expenses')
          .insert(body)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      break;
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Sites API handlers
async function handleSites(req: Request, supabase: any, path: string, method: string) {
  const pathParts = path.split('/').filter(Boolean);
  
  switch (method) {
    case 'GET':
      if (pathParts.length === 1) {
        // GET /sites - List sites
        const { data, error } = await supabase
          .from('sites')
          .select('*')
          .order('name');

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      break;
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}