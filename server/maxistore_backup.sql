--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-12-15 19:36:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 234 (class 1259 OID 17154)
-- Name: attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attributes (
    id integer NOT NULL,
    "kategoryId" integer,
    name character varying(255),
    "buttonType" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    addition character varying(255),
    "attributeValues" character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[]
);


ALTER TABLE public.attributes OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17153)
-- Name: attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attributes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attributes_id_seq OWNER TO postgres;

--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 233
-- Name: attributes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attributes_id_seq OWNED BY public.attributes.id;


--
-- TOC entry 238 (class 1259 OID 24866)
-- Name: buskets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buskets (
    id integer NOT NULL,
    "userId" integer,
    "itemsJsonb" jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.buskets OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 24865)
-- Name: buskets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.buskets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buskets_id_seq OWNER TO postgres;

--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 237
-- Name: buskets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.buskets_id_seq OWNED BY public.buskets.id;


--
-- TOC entry 228 (class 1259 OID 17103)
-- Name: itemGroups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."itemGroups" (
    id integer NOT NULL,
    "itemIds" integer[] DEFAULT ARRAY[]::integer[],
    name character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "itemId" integer
);


ALTER TABLE public."itemGroups" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17102)
-- Name: itemGroups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."itemGroups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."itemGroups_id_seq" OWNER TO postgres;

--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 227
-- Name: itemGroups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."itemGroups_id_seq" OWNED BY public."itemGroups".id;


--
-- TOC entry 230 (class 1259 OID 17113)
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    "mainKategoryId" integer,
    "kategoryId" integer,
    "itemGroupId" integer,
    name character varying(255),
    images character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    video character varying(255),
    price character varying(255),
    description character varying(2000),
    rating character varying(255),
    "reviewNumber" character varying(255),
    "specificationsJSONB" jsonb,
    "isExist" boolean,
    "isShowed" boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "itemId" integer
);


ALTER TABLE public.items OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17112)
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 229
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- TOC entry 226 (class 1259 OID 17070)
-- Name: kategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kategories (
    id integer NOT NULL,
    "mainKategoryId" integer,
    name character varying(255),
    image character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.kategories OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17069)
-- Name: kategories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kategories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kategories_id_seq OWNER TO postgres;

--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 225
-- Name: kategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kategories_id_seq OWNED BY public.kategories.id;


--
-- TOC entry 224 (class 1259 OID 17059)
-- Name: mainKategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."mainKategories" (
    id integer NOT NULL,
    name character varying(255),
    image character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."mainKategories" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17058)
-- Name: mainKategories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."mainKategories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."mainKategories_id_seq" OWNER TO postgres;

--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 223
-- Name: mainKategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."mainKategories_id_seq" OWNED BY public."mainKategories".id;


--
-- TOC entry 222 (class 1259 OID 17041)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    "userId" integer,
    "itemsJsonb" jsonb,
    name character varying(255),
    adress character varying(255),
    comment character varying(255),
    phone character varying(255),
    payment character varying(255),
    price double precision,
    "orderStage" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17040)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 220 (class 1259 OID 17021)
-- Name: qwestions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qwestions (
    id integer NOT NULL,
    qwestion character varying(255),
    description character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.qwestions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17020)
-- Name: qwestions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qwestions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.qwestions_id_seq OWNER TO postgres;

--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 219
-- Name: qwestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qwestions_id_seq OWNED BY public.qwestions.id;


--
-- TOC entry 232 (class 1259 OID 17138)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    "userId" integer,
    "itemId" integer,
    mark integer,
    "userName" character varying(255),
    images character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    label character varying(255),
    description character varying(1000),
    "isShowed" boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17137)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 231
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 218 (class 1259 OID 17012)
-- Name: sliders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sliders (
    id integer NOT NULL,
    label character varying(255),
    description character varying(255),
    link character varying(255),
    image character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.sliders OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17011)
-- Name: sliders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sliders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sliders_id_seq OWNER TO postgres;

--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 217
-- Name: sliders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sliders_id_seq OWNED BY public.sliders.id;


--
-- TOC entry 236 (class 1259 OID 24855)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "busketId" integer,
    login character varying(255),
    mail character varying(255),
    password character varying(255),
    role character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 24854)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 235
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4756 (class 2604 OID 17157)
-- Name: attributes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes ALTER COLUMN id SET DEFAULT nextval('public.attributes_id_seq'::regclass);


--
-- TOC entry 4759 (class 2604 OID 24869)
-- Name: buskets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buskets ALTER COLUMN id SET DEFAULT nextval('public.buskets_id_seq'::regclass);


--
-- TOC entry 4750 (class 2604 OID 17106)
-- Name: itemGroups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."itemGroups" ALTER COLUMN id SET DEFAULT nextval('public."itemGroups_id_seq"'::regclass);


--
-- TOC entry 4752 (class 2604 OID 17116)
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- TOC entry 4749 (class 2604 OID 17073)
-- Name: kategories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategories ALTER COLUMN id SET DEFAULT nextval('public.kategories_id_seq'::regclass);


--
-- TOC entry 4748 (class 2604 OID 17062)
-- Name: mainKategories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mainKategories" ALTER COLUMN id SET DEFAULT nextval('public."mainKategories_id_seq"'::regclass);


--
-- TOC entry 4747 (class 2604 OID 17044)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4746 (class 2604 OID 17024)
-- Name: qwestions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qwestions ALTER COLUMN id SET DEFAULT nextval('public.qwestions_id_seq'::regclass);


--
-- TOC entry 4754 (class 2604 OID 17141)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 4745 (class 2604 OID 17015)
-- Name: sliders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sliders ALTER COLUMN id SET DEFAULT nextval('public.sliders_id_seq'::regclass);


--
-- TOC entry 4758 (class 2604 OID 24858)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4960 (class 0 OID 17154)
-- Dependencies: 234
-- Data for Name: attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attributes (id, "kategoryId", name, "buttonType", "createdAt", "updatedAt", addition, "attributeValues") FROM stdin;
8	6	Вес	number	2025-11-21 14:39:53.906+03	2025-11-22 12:50:26.18+03	кг	{20,10}
9	6	Гриф	select	2025-11-21 14:40:20.379+03	2025-11-22 12:50:26.185+03		{Прямой}
7	6	Тип	select	2025-11-21 14:39:15.682+03	2025-11-22 12:50:26.19+03		{Разборный}
6	6	 Материал	check	2025-11-21 14:38:10.123+03	2025-12-03 17:50:34.531+03		{Пластик,"Чугун (обрезиненный)"}
10	7	Вес	number	2025-11-21 14:51:13.194+03	2025-12-12 14:01:33.033+03	кг	{1.25,50}
11	7	Посадочный диаметр	number	2025-11-21 14:51:21.87+03	2025-12-12 14:01:33.039+03	мм	{26,50}
12	7	Материал	select	2025-12-09 18:09:52.103+03	2025-12-12 14:01:33.044+03		{Металл,Сталь}
13	7	Диаметр диска	number	2025-12-12 14:00:33.552+03	2025-12-12 14:01:33.05+03	см	{25,15}
\.


--
-- TOC entry 4964 (class 0 OID 24866)
-- Dependencies: 238
-- Data for Name: buskets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.buskets (id, "userId", "itemsJsonb", "createdAt", "updatedAt") FROM stdin;
2	3	[]	2025-12-02 00:00:00+03	2025-12-02 00:00:00+03
1	1	[]	2025-11-28 19:32:33.38+03	2025-12-14 23:35:22.778+03
\.


--
-- TOC entry 4954 (class 0 OID 17103)
-- Dependencies: 228
-- Data for Name: itemGroups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."itemGroups" (id, "itemIds", name, "createdAt", "updatedAt", "itemId") FROM stdin;
\.


--
-- TOC entry 4956 (class 0 OID 17113)
-- Dependencies: 230
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, "mainKategoryId", "kategoryId", "itemGroupId", name, images, video, price, description, rating, "reviewNumber", "specificationsJSONB", "isExist", "isShowed", "createdAt", "updatedAt", "itemId") FROM stdin;
10	6	7	\N	Олимпийский диск для штанги OnyxFit 10 кг с тремя прорезями и рифлёным хватом	{7582c996-d597-4e90-a2fb-2352cefdce81.jpg,2f466386-4464-4034-880a-fa6430188528.jpg,693a8447-4029-4f94-8680-1f48c7f1931c.jpg}	\N	120	Прочный металлический диск с резиновым покрытием и удобными встроенными ручками для комфортного хвата и перемещения	0	0	{"Вес": "50", "Материал": "Сталь", "Диаметр диска": "25", "Посадочный диаметр": "50"}	t	t	2025-11-21 14:50:55.195+03	2025-12-12 14:01:24.983+03	\N
11	6	7	\N	Диск металлический обрезиненный Alpin DR 1.25 кг	{a903e0c3-aae9-4428-8586-c3c01cbe3dd9.jpg,8fd94d61-b043-485c-a6a2-6c55d52111b3.jpg,e71a2f85-c50d-43bc-8acc-3ce0dfe52ae8.jpg,ea5c6a79-3da2-40bd-b0bf-0dc74d55ffca.jpg}	\N	142	Диск металлический обрезиненный Alpin DR-1.25 это высококачественный диск, изготовленный из металла и покрыт резиновой износостойкой оболочкой, которая не имеет химического запаха и не оставляет следов на полу.  Диск имеет металлическую втулку, что исключает деформирование оболочки диска при установке на гриф.\r\n\r\nДиск имеет современный дизайн и подходит для формирования гантелей и штанг с грифами диаметром 25мм.\r\n\r\nЛинейка дисков Alpin состоит из дисков весом: 1,25кг, 2,5кг, 5,0кг, 10кг, 15кг, 20кг, 25кг. Диски отдельно упакованы в полиэтиленовый пакет и картонную коробку для безопасной транспортировки.\r\n\r\nДиски весов от 1,25 до 10кг упакованы в одну коробку по 2 шт.	4	0	{"Вес": "1.25", "Материал": "Металл", "Диаметр диска": "15", "Посадочный диаметр": "26"}	t	t	2025-11-21 14:53:44.99+03	2025-12-12 14:01:33.021+03	\N
9	6	6	\N	Гантель гексагональная 20 кг (1 шт)	{60710271-71ae-4e14-a6e3-e552b01fc698.jpg}	\N	195	Гексагональная гантель весом 15 кг — это универсальный снаряд для домашних и профессиональных тренировок. Благодаря шестигранной форме она не катается по полу, обеспечивая безопасность и удобство при выполнении упражнений.\r\n\r\nРукоять выполнена из прочной стали с противоскользящим рифлением, что гарантирует надежный хват даже при интенсивных занятиях. Оболочка из высококачественной резины защищает пол и снижает уровень шума при касании поверхности.	0	0	{"Вес": "20", "Тип": "", "Гриф": "Прямой", " Материал": "Чугун (обрезиненный)"}	t	t	2025-11-21 14:48:39.108+03	2025-11-22 12:46:56.797+03	\N
8	6	6	\N	Набор гантелей со штангой и гирями 6 в 1 AMETIST 30 кг	{c87a95e8-b2af-482d-b23d-dbdb004ea67d.jpg,8f655d60-3ef7-44a8-b63c-7e976414c2e8.jpg,479cfb62-cb9b-4a01-a642-137fc10bd839.jpg,e3bb3433-447b-447d-8efd-65fedfe476ad.jpg}	\N	100	Набор гантелей со штангой и гирями 6 в 1 AMETIST 30 кг. - это идеальный выбор для домашних тренировок. Данный набор является многофункциональным и удобным в использовании. Конструкция гантелей состоит из нескольких элементов, которые позволяют регулировать нагрузку в зависимости от вашей тренировочной программы.\r\n\r\nВ набор гантелей входят два гантельных грифа с гайками и утяжеляющими дисками разного веса: 1,25 кг., 1,5 кг, 2 кг. Также в комплект входят соединительные грифы, которые позволяют превратить гантели в штангу с прямым или w-образным грифом. Кроме того, в комплекте есть гриф для ролика для пресса и набор для превращения гантелей в гирю. Ручки от гири могут быть использованы в качестве упоров для отжиманий.\r\n\r\nЭтот набор гантелей позволит Вам тренировать различные группы мышц и выбирать необходимый вес для достижения ваших фитнес-целей.	0	0	{"Вес": "10", "Тип": "Разборный", "Гриф": "Прямой", " Материал": "Пластик"}	t	t	2025-11-21 14:42:46.612+03	2025-11-22 12:50:26.169+03	\N
\.


--
-- TOC entry 4952 (class 0 OID 17070)
-- Dependencies: 226
-- Data for Name: kategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kategories (id, "mainKategoryId", name, image, "createdAt", "updatedAt") FROM stdin;
7	6	Диски	1fa69715-b7c1-4d42-93f0-b077f26d22b9.jpg	2025-11-21 14:32:04.932+03	2025-11-21 14:32:04.932+03
8	7	Беговые дорожки	3fc626cc-17a0-405b-b8ec-116e482dfa62.jpg	2025-11-21 14:33:29.899+03	2025-11-21 14:33:29.899+03
9	6	Грифы	d7806f55-98a0-4321-81df-2fd9a1235ee5.jpg	2025-11-21 14:35:01.804+03	2025-11-21 14:35:01.804+03
6	6	Гантели	81b60155-14e3-4ff8-a63d-e965c947cd50.jpg	2025-11-21 13:27:20.864+03	2025-11-21 14:35:42.887+03
\.


--
-- TOC entry 4950 (class 0 OID 17059)
-- Dependencies: 224
-- Data for Name: mainKategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."mainKategories" (id, name, image, "createdAt", "updatedAt") FROM stdin;
7	Тренажеры	7f8cfc5a-97f8-4d32-980f-b461147fbd0d.png	2025-11-21 13:24:49.47+03	2025-11-21 15:03:14.233+03
6	Спортивный инвентарь	b4cca09e-b536-44b6-877c-211d197d4f57.png	2025-11-21 13:14:06.587+03	2025-11-28 19:25:39.691+03
9	Батуты	1eb0cd01-b1d0-4285-9d53-01d53dc2add9.png	2025-12-03 19:13:54.123+03	2025-12-03 19:13:54.123+03
10	Оборудование для массажа и косметологии	961951a8-ff9b-41f9-a162-9b6c6a50c272.png	2025-12-03 19:14:19.368+03	2025-12-03 19:14:19.368+03
11	Теннисные столы	99a23139-f930-47ab-80d9-e7fef3dea073.png	2025-12-03 19:14:35.521+03	2025-12-03 19:14:35.521+03
\.


--
-- TOC entry 4948 (class 0 OID 17041)
-- Dependencies: 222
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "userId", "itemsJsonb", name, adress, comment, phone, payment, price, "orderStage", "createdAt", "updatedAt") FROM stdin;
7	1	[{"id": 11, "name": "Диск металлический обрезиненный Alpin DR 1.25 кг", "count": 1, "price": "14", "images": "a903e0c3-aae9-4428-8586-c3c01cbe3dd9.jpg"}, {"id": 8, "name": "Набор гантелей со штангой и гирями 6 в 1 AMETIST 30 кг", "count": 1, "price": "100", "images": "c87a95e8-b2af-482d-b23d-dbdb004ea67d.jpg"}]	fio	самовывоз		213421	Картой	114	start	2025-12-05 17:14:16.236+03	2025-12-05 17:14:16.236+03
8	1	[{"id": 10, "name": "Олимпийский диск для штанги OnyxFit 10 кг с тремя прорезями и рифлёным хватом", "count": 3, "price": "120", "images": "7582c996-d597-4e90-a2fb-2352cefdce81.jpg"}, {"id": 11, "name": "Диск металлический обрезиненный Alpin DR 1.25 кг", "count": 6, "price": "142", "images": "a903e0c3-aae9-4428-8586-c3c01cbe3dd9.jpg"}]	Тренажеры	855		5	Наличными common_reg	1212	start	2025-12-12 20:27:38.314+03	2025-12-12 20:27:38.314+03
9	1	[{"id": 11, "name": "Диск металлический обрезиненный Alpin DR 1.25 кг", "count": 4, "price": "142", "images": "a903e0c3-aae9-4428-8586-c3c01cbe3dd9.jpg"}]	asfqwf	das	da	dqdqdq	Картой common_reg	568	start	2025-12-14 13:19:43.102+03	2025-12-14 13:19:43.102+03
10	1	[{"id": 11, "name": "Диск металлический обрезиненный Alpin DR 1.25 кг", "count": 1, "price": "142", "images": "a903e0c3-aae9-4428-8586-c3c01cbe3dd9.jpg"}]	Тренажеры	авыа		+3866	Картой	142	start	2025-12-14 23:35:22.719+03	2025-12-14 23:35:22.719+03
\.


--
-- TOC entry 4946 (class 0 OID 17021)
-- Dependencies: 220
-- Data for Name: qwestions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qwestions (id, qwestion, description, "createdAt", "updatedAt") FROM stdin;
2	Можно ли забрать заказ самостоятельно из вашего офиса или со склада?	Можно, но перед этим необходимо позвонить нам для согласования времени вашего приезда. Информацию по адресу самомовывоза и наш телефон  вы можете найти в шапке сайта. 	2025-11-28 19:27:52.357+03	2025-12-04 12:28:32.624+03
1	Должен ли я оплачивать доставку в случае отказа?	нет	2025-11-21 15:19:08.486+03	2025-12-04 12:28:52.566+03
3	Существуют ли скидки на корпоративные покупки?	да	2025-12-04 12:29:01.418+03	2025-12-04 12:29:01.418+03
\.


--
-- TOC entry 4958 (class 0 OID 17138)
-- Dependencies: 232
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, "userId", "itemId", mark, "userName", images, label, description, "isShowed", "createdAt", "updatedAt") FROM stdin;
1	1	11	3	admin	{}	admin	qwd	f	2025-12-13 13:57:13.648+03	2025-12-13 13:57:13.648+03
2	1	11	4	admin	{}	admin	Не хера себе вот это жесть жесть	f	2025-12-13 14:45:33.023+03	2025-12-13 14:45:33.023+03
3	1	11	2	admin	{d54c95cf-92b2-45c6-919a-8ad91b4fee41.png,8ab0f200-1009-4617-868f-30123f54445a.png}	admin	течстиру	f	2025-12-13 14:55:49.194+03	2025-12-13 14:55:49.194+03
4	1	11	2	admin	{bface6c7-8d27-4db0-b4d4-118397cfd9b5.png}	admin	укп	f	2025-12-13 17:04:07.867+03	2025-12-13 17:04:07.867+03
5	1	11	4	admin	{001149fc-1319-42b6-805d-77b08d91de96.png}	admin	sqw	f	2025-12-13 17:05:08.741+03	2025-12-13 17:05:08.741+03
6	1	11	3	admin	{c29d0bd6-7bb0-42dd-984c-861f53de6310.png}	admin	Отлично	f	2025-12-13 18:28:31.816+03	2025-12-13 18:28:31.816+03
7	1	11	3	admin	{36e2c585-a2d3-4351-9466-9f393eb9b82b.png,10f63722-d0d5-4809-af4d-fd0596ba5679.png}	admin	Отлично	f	2025-12-13 18:28:52.875+03	2025-12-13 18:28:52.875+03
8	1	11	4	admin	{}	admin	заеб	f	2025-12-13 21:00:13.4+03	2025-12-13 21:00:13.4+03
\.


--
-- TOC entry 4944 (class 0 OID 17012)
-- Dependencies: 218
-- Data for Name: sliders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sliders (id, label, description, link, image, "createdAt", "updatedAt") FROM stdin;
1	Беговые дорожки Alpha	ошалеть какая быстрая		45dbdbc5-446f-4712-b40c-e544724658de.jpg	2025-11-21 15:40:21.925+03	2025-11-21 15:40:21.925+03
2	фывыфв	йцайц цйвйц йцв	http://188.243.108.89:8085/static/index.html	8c3e714c-b574-45b4-858e-1060e5bb1466.jpg	2025-11-28 19:28:57.788+03	2025-11-28 19:28:57.788+03
\.


--
-- TOC entry 4962 (class 0 OID 24855)
-- Dependencies: 236
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "busketId", login, mail, password, role, "createdAt", "updatedAt") FROM stdin;
1	1	admin	admin@mail.ru	19354345	admin	2025-11-26 12:50:21.489+03	2025-11-26 12:50:21.507+03
3	3	user	user@mail.ru	123456	user	2025-11-26 12:53:27.207+03	2025-11-26 12:53:27.21+03
\.


--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 233
-- Name: attributes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attributes_id_seq', 14, true);


--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 237
-- Name: buskets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.buskets_id_seq', 4, true);


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 227
-- Name: itemGroups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."itemGroups_id_seq"', 4, true);


--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 229
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 13, true);


--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 225
-- Name: kategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kategories_id_seq', 10, true);


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 223
-- Name: mainKategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."mainKategories_id_seq"', 12, true);


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 10, true);


--
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 219
-- Name: qwestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.qwestions_id_seq', 3, true);


--
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 231
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 8, true);


--
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 217
-- Name: sliders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sliders_id_seq', 2, true);


--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 235
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 4783 (class 2606 OID 17161)
-- Name: attributes attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT attributes_pkey PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 24873)
-- Name: buskets buskets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buskets
    ADD CONSTRAINT buskets_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 17111)
-- Name: itemGroups itemGroups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."itemGroups"
    ADD CONSTRAINT "itemGroups_pkey" PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 17121)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 17077)
-- Name: kategories kategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategories
    ADD CONSTRAINT kategories_pkey PRIMARY KEY (id);


--
-- TOC entry 4767 (class 2606 OID 24806)
-- Name: mainKategories mainKategories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mainKategories"
    ADD CONSTRAINT "mainKategories_name_key" UNIQUE (name);


--
-- TOC entry 4769 (class 2606 OID 24808)
-- Name: mainKategories mainKategories_name_key1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mainKategories"
    ADD CONSTRAINT "mainKategories_name_key1" UNIQUE (name);


--
-- TOC entry 4771 (class 2606 OID 24810)
-- Name: mainKategories mainKategories_name_key2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mainKategories"
    ADD CONSTRAINT "mainKategories_name_key2" UNIQUE (name);


--
-- TOC entry 4773 (class 2606 OID 17066)
-- Name: mainKategories mainKategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."mainKategories"
    ADD CONSTRAINT "mainKategories_pkey" PRIMARY KEY (id);


--
-- TOC entry 4765 (class 2606 OID 17048)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 17028)
-- Name: qwestions qwestions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qwestions
    ADD CONSTRAINT qwestions_pkey PRIMARY KEY (id);


--
-- TOC entry 4781 (class 2606 OID 17146)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4761 (class 2606 OID 17019)
-- Name: sliders sliders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sliders
    ADD CONSTRAINT sliders_pkey PRIMARY KEY (id);


--
-- TOC entry 4785 (class 2606 OID 24864)
-- Name: users users_mail_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_mail_key UNIQUE (mail);


--
-- TOC entry 4787 (class 2606 OID 24862)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4796 (class 2606 OID 24816)
-- Name: attributes attributes_kategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attributes
    ADD CONSTRAINT "attributes_kategoryId_fkey" FOREIGN KEY ("kategoryId") REFERENCES public.kategories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4797 (class 2606 OID 24874)
-- Name: buskets buskets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buskets
    ADD CONSTRAINT "buskets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4791 (class 2606 OID 24842)
-- Name: itemGroups itemGroups_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."itemGroups"
    ADD CONSTRAINT "itemGroups_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4792 (class 2606 OID 24835)
-- Name: items items_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public."itemGroups"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4793 (class 2606 OID 24828)
-- Name: items items_kategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "items_kategoryId_fkey" FOREIGN KEY ("kategoryId") REFERENCES public.kategories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4794 (class 2606 OID 24823)
-- Name: items items_mainKategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "items_mainKategoryId_fkey" FOREIGN KEY ("mainKategoryId") REFERENCES public."mainKategories"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4790 (class 2606 OID 24811)
-- Name: kategories kategories_mainKategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kategories
    ADD CONSTRAINT "kategories_mainKategoryId_fkey" FOREIGN KEY ("mainKategoryId") REFERENCES public."mainKategories"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4795 (class 2606 OID 24847)
-- Name: reviews reviews_itemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES public.items(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-12-15 19:36:36

--
-- PostgreSQL database dump complete
--

