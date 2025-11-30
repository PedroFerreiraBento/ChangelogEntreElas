CREATE TABLE decisions (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending', -- pending | decided | implemented
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by text
);

CREATE TABLE decision_options (
  id bigserial PRIMARY KEY,
  decision_id bigint NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  label text NOT NULL,            -- "Layout 1", "Layout 2"...
  image_url text,                 -- URL da imagem
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE decision_responses (
  id bigserial PRIMARY KEY,
  decision_id bigint NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  selected_option_id bigint NOT NULL REFERENCES decision_options(id),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  author text
);
