-- Adds machine-based exercises reported as missing from the catalog.

insert into public.exercises (id, name, muscle_group, is_custom) values
  ('peito-voador', 'Voador', 'peito', false),
  ('peito-supino-vertical-maquina-articulada', 'Supino vertical', 'peito', false),
  ('peito-supino-inclinado-maquina-articulada', 'Supino inclinado', 'peito', false),
  ('triceps-pulley', 'Tríceps pulley', 'triceps', false)
on conflict (id) do nothing;
