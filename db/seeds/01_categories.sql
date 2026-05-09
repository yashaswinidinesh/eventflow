INSERT INTO categories (name, slug, icon) VALUES
  ('Technology','technology','laptop'),('Music','music','music'),
  ('Food & Drink','food-drink','utensils'),('Arts','arts','palette'),
  ('Sports','sports','trophy'),('Business','business','briefcase'),
  ('Health','health','heart'),('Education','education','book'),
  ('Networking','networking','users'),('Community','community','home')
ON CONFLICT (slug) DO NOTHING;
