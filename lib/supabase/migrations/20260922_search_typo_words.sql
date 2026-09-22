BEGIN;
CREATE OR REPLACE FUNCTION public.search_tokens_match(query_text text, document_text text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE SECURITY INVOKER
SET search_path=pg_catalog,extensions
AS $function$
DECLARE token text; hay text := lower(coalesce(document_text,'')); allowance integer; found boolean;
BEGIN
  FOR token IN SELECT regexp_split_to_table(lower(left(coalesce(query_text,''),120)), '[^[:alnum:]]+') LOOP
    IF token='' OR token IN ('a','an','the','of','and','for','in','to') THEN CONTINUE; END IF;
    IF token ~ '^[0-9]+$' THEN
      IF hay !~ ('\m'||token||'\M') THEN RETURN false; END IF;
      CONTINUE;
    END IF;
    IF position(token in hay)>0 THEN CONTINUE; END IF;
    IF length(token)<4 OR extensions.word_similarity(token,hay)<0.25 THEN RETURN false; END IF;
    allowance := CASE WHEN length(token)>=8 THEN 2 ELSE 1 END;
    SELECT EXISTS (
      SELECT 1 FROM regexp_split_to_table(hay,'[^[:alnum:]]+') AS word
      WHERE length(word) BETWEEN greatest(4,length(token)-allowance) AND least(255,length(token)+allowance)
      AND (extensions.levenshtein_less_equal(token,left(word,255),allowance)<=allowance
        OR (length(word)=length(token) AND EXISTS (
          SELECT 1 FROM generate_series(1,length(token)-1) AS pos
          WHERE word=left(token,pos-1)||substr(token,pos+1,1)||substr(token,pos,1)||substr(token,pos+2)
        )))
    ) INTO found;
    IF NOT found THEN RETURN false; END IF;
  END LOOP;
  RETURN true;
END $function$;
REVOKE ALL ON FUNCTION public.search_tokens_match(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_tokens_match(text,text) TO anon,authenticated,service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
