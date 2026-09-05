-- Expands the shared exercise catalog with commonly missing exercises
-- (e.g. puxada aberta, puxada triângulo, remada triângulo, remada aberta).

insert into public.exercises (id, name, muscle_group, is_custom) values
  -- Peito
  ('peito-supino-reto-halteres', 'Supino reto halteres', 'peito', false),
  ('peito-supino-inclinado-barra', 'Supino inclinado barra', 'peito', false),
  ('peito-crucifixo-reto-halteres', 'Crucifixo reto halteres', 'peito', false),
  ('peito-peck-deck', 'Peck deck', 'peito', false),
  ('peito-pullover', 'Pullover', 'peito', false),
  ('peito-flexao-de-braco', 'Flexão de braço', 'peito', false),

  -- Costas
  ('costas-puxada-aberta', 'Puxada aberta', 'costas', false),
  ('costas-puxada-triangulo', 'Puxada triângulo', 'costas', false),
  ('costas-puxada-fechada', 'Puxada fechada', 'costas', false),
  ('costas-remada-triangulo', 'Remada triângulo', 'costas', false),
  ('costas-remada-aberta', 'Remada aberta', 'costas', false),
  ('costas-remada-unilateral', 'Remada unilateral (serrote)', 'costas', false),
  ('costas-remada-cavalinho', 'Remada cavalinho', 'costas', false),
  ('costas-barra-fixa', 'Barra fixa', 'costas', false),

  -- Perna
  ('perna-panturrilha-sentado', 'Panturrilha sentado', 'perna', false),
  ('perna-agachamento-smith', 'Agachamento smith', 'perna', false),
  ('perna-agachamento-bulgaro', 'Agachamento búlgaro', 'perna', false),
  ('perna-afundo', 'Afundo', 'perna', false),
  ('perna-passada', 'Passada', 'perna', false),
  ('perna-stiff', 'Stiff', 'perna', false),
  ('perna-cadeira-adutora', 'Cadeira adutora', 'perna', false),
  ('perna-cadeira-abdutora', 'Cadeira abdutora', 'perna', false),
  ('perna-hack', 'Hack machine', 'perna', false),

  -- Ombro
  ('ombro-desenvolvimento-maquina', 'Desenvolvimento máquina', 'ombro', false),
  ('ombro-desenvolvimento-arnold', 'Desenvolvimento Arnold', 'ombro', false),
  ('ombro-crucifixo-invertido', 'Crucifixo invertido', 'ombro', false),
  ('ombro-remada-alta', 'Remada alta', 'ombro', false),
  ('ombro-encolhimento', 'Encolhimento (trapézio)', 'ombro', false),

  -- Bíceps
  ('biceps-rosca-martelo', 'Rosca martelo', 'biceps', false),
  ('biceps-rosca-concentrada', 'Rosca concentrada', 'biceps', false),
  ('biceps-rosca-cabo', 'Rosca no cabo', 'biceps', false),

  -- Tríceps
  ('triceps-coice', 'Tríceps coice', 'triceps', false),
  ('triceps-mergulho', 'Mergulho (dips)', 'triceps', false),
  ('triceps-barra-reta', 'Tríceps barra reta', 'triceps', false),

  -- Core
  ('core-abdominal-infra', 'Abdominal infra', 'core', false),
  ('core-abdominal-obliquo', 'Abdominal oblíquo', 'core', false),
  ('core-elevacao-de-pernas', 'Elevação de pernas', 'core', false),
  ('core-roda-abdominal', 'Roda abdominal', 'core', false),

  -- Cardio
  ('cardio-eliptico', 'Elíptico', 'cardio', false),
  ('cardio-escada', 'Escada (stairmaster)', 'cardio', false),
  ('cardio-pular-corda', 'Pular corda', 'cardio', false)
on conflict (id) do nothing;
