-- Hong Kong Church PWA - Bible Content Schema
-- Comprehensive Bible text database with multilingual support
-- Part 6: Bible Content and Verses

-- ==================================================
-- BIBLE STRUCTURE TABLES
-- ==================================================

-- Bible books with metadata
CREATE TABLE bible_books (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  testament TEXT NOT NULL CHECK (testament IN ('old', 'new')),
  book_order INTEGER NOT NULL,
  chapter_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Bible books
INSERT INTO bible_books (name, name_zh, abbreviation, testament, book_order, chapter_count) VALUES
-- Old Testament
('Genesis', '創世記', 'Gen', 'old', 1, 50),
('Exodus', '出埃及記', 'Exo', 'old', 2, 40),
('Leviticus', '利未記', 'Lev', 'old', 3, 27),
('Numbers', '民數記', 'Num', 'old', 4, 36),
('Deuteronomy', '申命記', 'Deu', 'old', 5, 34),
('Joshua', '約書亞記', 'Jos', 'old', 6, 24),
('Judges', '士師記', 'Jdg', 'old', 7, 21),
('Ruth', '路得記', 'Rut', 'old', 8, 4),
('1 Samuel', '撒母耳記上', '1Sa', 'old', 9, 31),
('2 Samuel', '撒母耳記下', '2Sa', 'old', 10, 24),
('1 Kings', '列王紀上', '1Ki', 'old', 11, 22),
('2 Kings', '列王紀下', '2Ki', 'old', 12, 25),
('1 Chronicles', '歷代志上', '1Ch', 'old', 13, 29),
('2 Chronicles', '歷代志下', '2Ch', 'old', 14, 36),
('Ezra', '以斯拉記', 'Ezr', 'old', 15, 10),
('Nehemiah', '尼希米記', 'Neh', 'old', 16, 13),
('Esther', '以斯帖記', 'Est', 'old', 17, 10),
('Job', '約伯記', 'Job', 'old', 18, 42),
('Psalms', '詩篇', 'Psa', 'old', 19, 150),
('Proverbs', '箴言', 'Pro', 'old', 20, 31),
('Ecclesiastes', '傳道書', 'Ecc', 'old', 21, 12),
('Song of Songs', '雅歌', 'SoS', 'old', 22, 8),
('Isaiah', '以賽亞書', 'Isa', 'old', 23, 66),
('Jeremiah', '耶利米書', 'Jer', 'old', 24, 52),
('Lamentations', '耶利米哀歌', 'Lam', 'old', 25, 5),
('Ezekiel', '以西結書', 'Eze', 'old', 26, 48),
('Daniel', '但以理書', 'Dan', 'old', 27, 12),
('Hosea', '何西阿書', 'Hos', 'old', 28, 14),
('Joel', '約珥書', 'Joe', 'old', 29, 3),
('Amos', '阿摩司書', 'Amo', 'old', 30, 9),
('Obadiah', '俄巴底亞書', 'Oba', 'old', 31, 1),
('Jonah', '約拿書', 'Jon', 'old', 32, 4),
('Micah', '彌迦書', 'Mic', 'old', 33, 7),
('Nahum', '那鴻書', 'Nah', 'old', 34, 3),
('Habakkuk', '哈巴谷書', 'Hab', 'old', 35, 3),
('Zephaniah', '西番雅書', 'Zep', 'old', 36, 3),
('Haggai', '哈該書', 'Hag', 'old', 37, 2),
('Zechariah', '撒迦利亞書', 'Zec', 'old', 38, 14),
('Malachi', '瑪拉基書', 'Mal', 'old', 39, 4),

-- New Testament
('Matthew', '馬太福音', 'Mat', 'new', 40, 28),
('Mark', '馬可福音', 'Mar', 'new', 41, 16),
('Luke', '路加福音', 'Luk', 'new', 42, 24),
('John', '約翰福音', 'Joh', 'new', 43, 21),
('Acts', '使徒行傳', 'Act', 'new', 44, 28),
('Romans', '羅馬書', 'Rom', 'new', 45, 16),
('1 Corinthians', '哥林多前書', '1Co', 'new', 46, 16),
('2 Corinthians', '哥林多後書', '2Co', 'new', 47, 13),
('Galatians', '加拉太書', 'Gal', 'new', 48, 6),
('Ephesians', '以弗所書', 'Eph', 'new', 49, 6),
('Philippians', '腓立比書', 'Phi', 'new', 50, 4),
('Colossians', '歌羅西書', 'Col', 'new', 51, 4),
('1 Thessalonians', '帖撒羅尼迦前書', '1Th', 'new', 52, 5),
('2 Thessalonians', '帖撒羅尼迦後書', '2Th', 'new', 53, 3),
('1 Timothy', '提摩太前書', '1Ti', 'new', 54, 6),
('2 Timothy', '提摩太後書', '2Ti', 'new', 55, 4),
('Titus', '提多書', 'Tit', 'new', 56, 3),
('Philemon', '腓利門書', 'Phm', 'new', 57, 1),
('Hebrews', '希伯來書', 'Heb', 'new', 58, 13),
('James', '雅各書', 'Jam', 'new', 59, 5),
('1 Peter', '彼得前書', '1Pe', 'new', 60, 5),
('2 Peter', '彼得後書', '2Pe', 'new', 61, 3),
('1 John', '約翰壹書', '1Jo', 'new', 62, 5),
('2 John', '約翰貳書', '2Jo', 'new', 63, 1),
('3 John', '約翰參書', '3Jo', 'new', 64, 1),
('Jude', '猶大書', 'Jud', 'new', 65, 1),
('Revelation', '啟示錄', 'Rev', 'new', 66, 22);

-- Bible verses table
CREATE TABLE bible_verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id INTEGER REFERENCES bible_books(id) NOT NULL,
  book_name TEXT NOT NULL,
  chapter INTEGER NOT NULL CHECK (chapter > 0),
  verse INTEGER NOT NULL CHECK (verse > 0),
  text_en TEXT NOT NULL,
  text_zh TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_bible_verses_book_chapter_verse ON bible_verses(book_name, chapter, verse);
CREATE INDEX idx_bible_verses_book_id ON bible_verses(book_id);
CREATE INDEX idx_bible_verses_text_search_en ON bible_verses USING gin(to_tsvector('english', text_en));
CREATE INDEX idx_bible_verses_text_search_zh ON bible_verses USING gin(to_tsvector('simple', text_zh));

-- Insert sample Bible content (Psalm 23, John 3:16-17, and some other key verses)
INSERT INTO bible_verses (book_id, book_name, chapter, verse, text_en, text_zh) VALUES
-- Psalm 23 (complete)
(19, 'Psalms', 23, 1, 'The Lord is my shepherd, I lack nothing.', '耶和華是我的牧者，我必不致缺乏。'),
(19, 'Psalms', 23, 2, 'He makes me lie down in green pastures, he leads me beside quiet waters,', '他使我躺臥在青草地上，領我在可安歇的水邊。'),
(19, 'Psalms', 23, 3, 'he refreshes my soul. He guides me along the right paths for his name''s sake.', '他使我的靈魂甦醒，為自己的名引導我走義路。'),
(19, 'Psalms', 23, 4, 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.', '我雖然行過死蔭的幽谷，也不怕遭害，因為你與我同在；你的杖，你的竿，都安慰我。'),
(19, 'Psalms', 23, 5, 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.', '在我敵人面前，你為我擺設筵席；你用油膏了我的頭，使我的福杯滿溢。'),
(19, 'Psalms', 23, 6, 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.', '我一生一世必有恩惠慈愛隨著我；我且要住在耶和華的殿中，直到永遠。'),

-- John 3:16-17 (The Gospel in a nutshell)
(43, 'John', 3, 16, 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', '神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。'),
(43, 'John', 3, 17, 'For God did not send his Son into the world to condemn the world, but to save the world through him.', '因為神差他的兒子降世，不是要定世人的罪，乃是要叫世人因他得救。'),

-- Philippians 4:13 (Strength through Christ)
(50, 'Philippians', 4, 13, 'I can do all this through him who gives me strength.', '我靠著那加給我力量的，凡事都能做。'),

-- Romans 8:28 (God works for good)
(45, 'Romans', 8, 28, 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', '我們曉得萬事都互相效力，叫愛神的人得益處，就是按他旨意被召的人。'),

-- Matthew 11:28-30 (Come unto me)
(40, 'Matthew', 11, 28, 'Come to me, all you who are weary and burdened, and I will give you rest.', '凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。'),
(40, 'Matthew', 11, 29, 'Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.', '我心裡柔和謙卑，你們當負我的軛，學我的樣式；這樣，你們心裡就必得享安息。'),
(40, 'Matthew', 11, 30, 'For my yoke is easy and my burden is light.', '因為我的軛是容易的，我的擔子是輕省的。'),

-- Jeremiah 29:11 (Plans to prosper)
(24, 'Jeremiah', 29, 11, '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future."', '耶和華說：我知道我向你們所懷的意念是賜平安的意念，不是降災禍的意念，要叫你們末後有指望。'),

-- Proverbs 3:5-6 (Trust in the Lord)
(20, 'Proverbs', 3, 5, 'Trust in the Lord with all your heart and lean not on your own understanding;', '你要專心仰賴耶和華，不可倚靠自己的聰明，'),
(20, 'Proverbs', 3, 6, 'in all your ways submit to him, and he will make your paths straight.', '在你一切所行的事上都要認定他，他必指引你的路。'),

-- Joshua 1:9 (Be strong and courageous)
(6, 'Joshua', 1, 9, 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', '我豈沒有吩咐你嗎？你當剛強壯膽！不要懼怕，也不要驚惶，因為你無論往哪裡去，耶和華─你的神必與你同在。'),

-- 2 Corinthians 5:17 (New creation)
(47, '2 Corinthians', 5, 17, 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!', '若有人在基督裡，他就是新造的人，舊事已過，都變成新的了。'),

-- 1 Corinthians 13:4-7 (Love is patient)
(46, '1 Corinthians', 13, 4, 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.', '愛是恆久忍耐，又有恩慈；愛是不嫉妒；愛是不自誇，不張狂，'),
(46, '1 Corinthians', 13, 5, 'It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.', '不做害羞的事，不求自己的益處，不輕易發怒，不計算人的惡，'),
(46, '1 Corinthians', 13, 6, 'Love does not delight in evil but rejoices with the truth.', '不喜歡不義，只喜歡真理；'),
(46, '1 Corinthians', 13, 7, 'It always protects, always trusts, always hopes, always perseveres.', '凡事包容，凡事相信，凡事盼望，凡事忍耐。'),

-- Isaiah 40:31 (Those who hope in the Lord)
(23, 'Isaiah', 40, 31, 'but those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.', '但那等候耶和華的必從新得力。他們必如鷹展翅上騰；他們奔跑卻不困倦，行走卻不疲乏。'),

-- Ephesians 2:8-9 (Saved by grace)
(49, 'Ephesians', 2, 8, 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—', '你們得救是本乎恩，也因著信；這並不是出於自己，乃是神所賜的；'),
(49, 'Ephesians', 2, 9, 'not by works, so that no one can boast.', '也不是出於行為，免得有人自誇。'),

-- Matthew 6:33 (Seek first his kingdom)
(40, 'Matthew', 6, 33, 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.', '你們要先求他的國和他的義，這些東西都要加給你們了。');

-- ==================================================
-- BIBLE SEARCH AND REFERENCE FUNCTIONS
-- ==================================================

-- Function to search Bible text
CREATE OR REPLACE FUNCTION search_bible_verses(
  search_query TEXT,
  lang TEXT DEFAULT 'en',
  book_filter TEXT DEFAULT NULL,
  limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  book_name TEXT,
  chapter INTEGER,
  verse INTEGER,
  text TEXT,
  reference TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bv.id,
    bv.book_name,
    bv.chapter,
    bv.verse,
    CASE 
      WHEN lang = 'zh' THEN bv.text_zh
      ELSE bv.text_en
    END as text,
    bv.book_name || ' ' || bv.chapter || ':' || bv.verse as reference,
    ts_rank(
      CASE 
        WHEN lang = 'zh' THEN to_tsvector('simple', bv.text_zh)
        ELSE to_tsvector('english', bv.text_en)
      END,
      plainto_tsquery(CASE WHEN lang = 'zh' THEN 'simple' ELSE 'english' END, search_query)
    ) as rank
  FROM bible_verses bv
  WHERE 
    (book_filter IS NULL OR bv.book_name ILIKE '%' || book_filter || '%')
    AND (
      CASE 
        WHEN lang = 'zh' THEN to_tsvector('simple', bv.text_zh) @@ plainto_tsquery('simple', search_query)
        ELSE to_tsvector('english', bv.text_en) @@ plainto_tsquery('english', search_query)
      END
    )
  ORDER BY rank DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get verse by reference (e.g., "John 3:16")
CREATE OR REPLACE FUNCTION get_verse_by_reference(
  reference_text TEXT,
  lang TEXT DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  book_name TEXT,
  chapter INTEGER,
  verse INTEGER,
  text TEXT,
  reference TEXT
) AS $$
DECLARE
  book_part TEXT;
  chapter_verse_part TEXT;
  chapter_num INTEGER;
  verse_num INTEGER;
BEGIN
  -- Parse reference like "John 3:16" or "1 Corinthians 13:4"
  -- This is a simplified parser - in production, you'd want more robust parsing
  
  IF reference_text ~ '^\w+(\s+\w+)*\s+\d+:\d+$' THEN
    -- Extract book name
    book_part := regexp_replace(reference_text, '\s+\d+:\d+$', '');
    chapter_verse_part := regexp_replace(reference_text, '^\w+(\s+\w+)*\s+', '');
    
    chapter_num := split_part(chapter_verse_part, ':', 1)::INTEGER;
    verse_num := split_part(chapter_verse_part, ':', 2)::INTEGER;
    
    RETURN QUERY
    SELECT 
      bv.id,
      bv.book_name,
      bv.chapter,
      bv.verse,
      CASE 
        WHEN lang = 'zh' THEN bv.text_zh
        ELSE bv.text_en
      END as text,
      bv.book_name || ' ' || bv.chapter || ':' || bv.verse as reference
    FROM bible_verses bv
    WHERE 
      bv.book_name ILIKE book_part
      AND bv.chapter = chapter_num
      AND bv.verse = verse_num;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- BIBLE READING PLANS SYSTEM
-- ==================================================

-- Reading plans table
CREATE TABLE reading_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_zh TEXT,
  description TEXT NOT NULL,
  description_zh TEXT,
  duration_days INTEGER NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('chronological', 'canonical', 'thematic', 'devotional')),
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading plan daily readings
CREATE TABLE reading_plan_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  readings JSONB NOT NULL, -- Array of readings like [{"book": "Genesis", "chapters": [1,2]}]
  theme TEXT,
  theme_zh TEXT,
  notes TEXT,
  notes_zh TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User reading plan progress
CREATE TABLE user_reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE NOT NULL,
  current_day INTEGER DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- Insert sample reading plan
INSERT INTO reading_plans (name, name_zh, description, description_zh, duration_days, plan_type, difficulty_level) VALUES
('30-Day Psalm Journey', '30天詩篇之旅', 'Read through selected Psalms in 30 days, focusing on praise, worship, and finding comfort in God''s word.', '在30天內閱讀精選詩篇，專注於讚美、敬拜，並在神的話語中尋找安慰。', 30, 'devotional', 'beginner'),
('New Testament in 90 Days', '90天新約聖經', 'Read through the entire New Testament in 90 days with daily readings and reflections.', '在90天內閱讀整本新約聖經，包括每日讀經和反思。', 90, 'canonical', 'intermediate'),
('Life of Jesus', '耶穌生平', 'Follow the life and teachings of Jesus through the four Gospels in 40 days.', '在40天內透過四福音書跟隨耶穌的生平和教導。', 40, 'thematic', 'beginner');

-- Insert sample daily readings for 30-Day Psalm Journey
DO $$
DECLARE
  psalm_plan_id UUID;
  i INTEGER;
BEGIN
  SELECT id INTO psalm_plan_id FROM reading_plans WHERE name = '30-Day Psalm Journey';
  
  -- Create readings for first 10 days (sample)
  FOR i IN 1..10 LOOP
    INSERT INTO reading_plan_readings (plan_id, day_number, readings, theme, theme_zh) VALUES
    (psalm_plan_id, i, 
     '[{"book": "Psalms", "chapters": [' || (i * 2 - 1) || ',' || (i * 2) || ']}]',
     'Day ' || i || ': Trust and Praise',
     '第' || i || '天：信靠與讚美'
    );
  END LOOP;
END $$;

-- ==================================================
-- BIBLE STUDY NOTES SYSTEM  
-- ==================================================

-- Bible study notes
CREATE TABLE bible_study_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_name TEXT NOT NULL,
  chapter INTEGER,
  verse INTEGER,
  note_type TEXT DEFAULT 'personal' CHECK (note_type IN ('personal', 'study', 'sermon', 'commentary')),
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bible study notes
CREATE INDEX idx_bible_study_notes_user ON bible_study_notes(user_id);
CREATE INDEX idx_bible_study_notes_reference ON bible_study_notes(book_name, chapter, verse);
CREATE INDEX idx_bible_study_notes_tags ON bible_study_notes USING gin(tags);

-- ==================================================
-- COMPLETION NOTIFICATION
-- ==================================================

DO $$
DECLARE
  total_verses INTEGER;
  total_books INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_verses FROM bible_verses;
    SELECT COUNT(*) INTO total_books FROM bible_books;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Hong Kong Church PWA - Bible Content Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Bible Database Statistics:';
    RAISE NOTICE '  - Bible Books: % (66 books)', total_books;
    RAISE NOTICE '  - Bible Verses: % verses loaded', total_verses;
    RAISE NOTICE '  - Languages: English & Traditional Chinese';
    RAISE NOTICE '  - Search Functions: Full-text search enabled';
    RAISE NOTICE '  - Reading Plans: Sample plans created';
    RAISE NOTICE '  - Study Notes: Personal note system ready';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next: Execute this in your Supabase SQL Editor';
    RAISE NOTICE '========================================';
END $$;