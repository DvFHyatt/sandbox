insert into properties(code, name) values
('JOHPJ','Park Hyatt Johannesburg'),
('JOHXS','Hyatt House Sandton'),
('JOHXR','Hyatt House Rosebank'),
('CPTRC','Hyatt Regency Cape Town'),
('NBODO','Millat Cluster Team')
on conflict (code) do nothing;

insert into job_titles(name) values
('Receptionist'),
('Chef de Partie'),
('Housekeeping Attendant'),
('Front Office Manager'),
('HR Administrator')
on conflict (name) do nothing;

insert into training_types(code, name) values
('OJT','On-the-Job Training'),
('IND','Induction'),
('HOH','Heart of Hospitality (EQ/CQ)'),
('ELA','Elevate Leadership Academy'),
('MKY','Michelin Key'),
('AI','AI'),
('SYS','Systems/Software'),
('COA','Coaching Session'),
('OTH','Other')
on conflict (code) do nothing;

insert into operational_divisions(property_id, name)
select p.id, d.name
from properties p
cross join (values
  ('Front Office'),
  ('Food and Beverage'),
  ('Housekeeping'),
  ('Finance'),
  ('People and Culture')
) as d(name)
on conflict (property_id, name) do nothing;
