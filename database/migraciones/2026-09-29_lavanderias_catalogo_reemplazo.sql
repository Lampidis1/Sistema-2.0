-- 2026-09-29 · Lavanderías — reemplazo del catálogo global de prendas
-- ─────────────────────────────────────────────────────────────────────────────
-- Se reemplaza el catálogo global anterior (8 prendas de muestra) por el listado
-- oficial entregado por RC: 50 prendas de "trabajo" y 23 de "cama".
--
-- Regla de carga: cada variante separada por "/" es una prenda INDEPENDIENTE,
-- conservando el sustantivo base para que se entienda por sí sola
-- (p. ej. "Pantalón Cargo / Dakota / Ignífugo" → "Pantalón Cargo",
-- "Pantalón Dakota", "Pantalón Ignífugo"). Excepción: "1/2" es una fracción
-- (plaza y media), NO un separador, así que "1 Plaza 1/2" no se divide. El "o"
-- de "Tela o Gabardina" / "King o más" tampoco se divide.
--
-- Solo se toca el catálogo GLOBAL (empresa_id IS NULL); las prendas que cada
-- lavandería haya agregado (empresa_id NOT NULL) se conservan. Los bolsa_items
-- guardan el nombre de la prenda como texto (no FK), por lo que el historial de
-- bolsas no se ve afectado.
--
-- Aplicado en Supabase el 2026-09-29 (migración
-- lavanderias_catalogo_2026_09_reemplazo); este archivo es el registro.
-- ─────────────────────────────────────────────────────────────────────────────

delete from lavanderias.prendas_catalogo where empresa_id is null;

insert into lavanderias.prendas_catalogo(prenda_id, empresa_id, categoria, nombre, orden) values
  -- ── ROPA DE TRABAJO ──
  ('g_trab_1',  null, 'trabajo', 'Pantalón Mezclilla', 1),
  ('g_trab_2',  null, 'trabajo', 'Pantalón Cargo', 2),
  ('g_trab_3',  null, 'trabajo', 'Pantalón Dakota', 3),
  ('g_trab_4',  null, 'trabajo', 'Pantalón Ignífugo', 4),
  ('g_trab_5',  null, 'trabajo', 'Pantalón Tela o Gabardina', 5),
  ('g_trab_6',  null, 'trabajo', 'Pantalón Fino', 6),
  ('g_trab_7',  null, 'trabajo', 'Pantalón Outdoor', 7),
  ('g_trab_8',  null, 'trabajo', 'Pantalón Tipo Short', 8),
  ('g_trab_9',  null, 'trabajo', 'Pantalón Mezclilla Tipo Short', 9),
  ('g_trab_10', null, 'trabajo', 'Geólogo Poplin', 10),
  ('g_trab_11', null, 'trabajo', 'Geólogo Reforzado', 11),
  ('g_trab_12', null, 'trabajo', 'Camisa Slack', 12),
  ('g_trab_13', null, 'trabajo', 'Camisa Corporativa', 13),
  ('g_trab_14', null, 'trabajo', 'Camisa Ignífuga', 14),
  ('g_trab_15', null, 'trabajo', 'Camisa Fino', 15),
  ('g_trab_16', null, 'trabajo', 'Camisa Outdoor', 16),
  ('g_trab_17', null, 'trabajo', 'Polera Piqué', 17),
  ('g_trab_18', null, 'trabajo', 'Polera Algodón', 18),
  ('g_trab_19', null, 'trabajo', 'Polera Ignífuga', 19),
  ('g_trab_20', null, 'trabajo', 'Polerón Algodón', 20),
  ('g_trab_21', null, 'trabajo', 'Polerón Canguro', 21),
  ('g_trab_22', null, 'trabajo', 'Pijama Primera Capa 2 piezas', 22),
  ('g_trab_23', null, 'trabajo', 'Pijama Polar 2 piezas', 23),
  ('g_trab_24', null, 'trabajo', 'Chaqueta Polar', 24),
  ('g_trab_25', null, 'trabajo', 'Chaqueta Soft', 25),
  ('g_trab_26', null, 'trabajo', 'Chaqueta Cortaviento', 26),
  ('g_trab_27', null, 'trabajo', 'Chaqueta Ignífuga', 27),
  ('g_trab_28', null, 'trabajo', 'Chaqueta Térmica', 28),
  ('g_trab_29', null, 'trabajo', 'Pijama Térmico', 29),
  ('g_trab_30', null, 'trabajo', 'Parka Térmica', 30),
  ('g_trab_31', null, 'trabajo', 'Parka Polar', 31),
  ('g_trab_32', null, 'trabajo', 'Pantalón Polar Grueso', 32),
  ('g_trab_33', null, 'trabajo', 'Pantalón Pijama Térmico', 33),
  ('g_trab_34', null, 'trabajo', 'Jardinera Térmica', 34),
  ('g_trab_35', null, 'trabajo', 'Legionarios', 35),
  ('g_trab_36', null, 'trabajo', 'Capuchas', 36),
  ('g_trab_37', null, 'trabajo', 'Gorros', 37),
  ('g_trab_38', null, 'trabajo', 'Bandanas', 38),
  ('g_trab_39', null, 'trabajo', 'Bolsa de Género', 39),
  ('g_trab_40', null, 'trabajo', 'Saco', 40),
  ('g_trab_41', null, 'trabajo', 'Ropa Interior Medias', 41),
  ('g_trab_42', null, 'trabajo', 'Ropa Interior Boxer', 42),
  ('g_trab_43', null, 'trabajo', 'Ropa Interior Slips', 43),
  ('g_trab_44', null, 'trabajo', 'Toalla Baño', 44),
  ('g_trab_45', null, 'trabajo', 'Toalla Mano', 45),
  ('g_trab_46', null, 'trabajo', 'Overol Poplin', 46),
  ('g_trab_47', null, 'trabajo', 'Overol Antiácido', 47),
  ('g_trab_48', null, 'trabajo', 'Overol Reforzado', 48),
  ('g_trab_49', null, 'trabajo', 'Overol Ignífugo', 49),
  ('g_trab_50', null, 'trabajo', 'Overol Térmico', 50),
  -- ── ROPA DE CAMA ──
  ('g_cama_1',  null, 'cama', 'Juego de Sábanas 1 Plaza', 1),
  ('g_cama_2',  null, 'cama', 'Juego de Sábanas 1 Plaza 1/2', 2),
  ('g_cama_3',  null, 'cama', 'Juego de Sábanas 2 Plaza', 3),
  ('g_cama_4',  null, 'cama', 'Juego de Sábanas King o más', 4),
  ('g_cama_5',  null, 'cama', 'Cobertor 1 Plaza', 5),
  ('g_cama_6',  null, 'cama', 'Cobertor 1 Plaza 1/2', 6),
  ('g_cama_7',  null, 'cama', 'Cobertor 2 Plaza', 7),
  ('g_cama_8',  null, 'cama', 'Cobertor King o más', 8),
  ('g_cama_9',  null, 'cama', 'Cubrecama 1 Plaza', 9),
  ('g_cama_10', null, 'cama', 'Cubrecama 1 Plaza 1/2', 10),
  ('g_cama_11', null, 'cama', 'Cubrecama 2 Plaza', 11),
  ('g_cama_12', null, 'cama', 'Cubrecama King o más', 12),
  ('g_cama_13', null, 'cama', 'Frazada 1 Plaza', 13),
  ('g_cama_14', null, 'cama', 'Frazada 1 Plaza 1/2', 14),
  ('g_cama_15', null, 'cama', 'Frazada 2 Plaza', 15),
  ('g_cama_16', null, 'cama', 'Frazada King o más', 16),
  ('g_cama_17', null, 'cama', 'Fundas Sábanas', 17),
  ('g_cama_18', null, 'cama', 'Fundas Cubrecamas', 18),
  ('g_cama_19', null, 'cama', 'Fundas Cobertor', 19),
  ('g_cama_20', null, 'cama', 'Almohadas', 20),
  ('g_cama_21', null, 'cama', 'Cojín', 21),
  ('g_cama_22', null, 'cama', 'Paños de Limpieza', 22),
  ('g_cama_23', null, 'cama', 'Cortinas', 23);
