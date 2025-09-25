-- Create function to update site spent amount based on expenses
CREATE OR REPLACE FUNCTION update_site_spent(site_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.sites 
  SET spent = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM public.expenses 
    WHERE expenses.site_id = update_site_spent.site_id
  )
  WHERE id = update_site_spent.site_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;