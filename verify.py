import os
import re

files_to_check = [
    'content/articles/anak-krakatau-2018-runtuhan-tsunami.mdx',
    'content/articles/api-biru-kawah-ijen.mdx',
    'content/articles/badak-jawa-benteng-terakhir.mdx',
    'content/articles/dieng-kawah-gas-bahaya-senyap.mdx',
    'content/articles/kelud-danau-kawah-rekayasa-bahaya.mdx',
    'content/articles/komodo-predator-pulau-tekanan-konservasi.mdx',
    'content/articles/krakatau-1883-tsunami-arsip-global.mdx',
    'content/articles/merapi-awan-panas-pemantauan.mdx',
    'content/articles/samalas-1257-babad-geologi.mdx',
    'content/articles/tambora-1815-iklim-dunia.mdx',
    'content/articles/toba-supervolcano-perdebatan-dampak.mdx'
]

base_dir = '/Users/macintosh/Documents/NaLI'

def analyze_file(filepath):
    abs_path = os.path.join(base_dir, filepath)
    if not os.path.exists(abs_path):
        print(f"File not found: {filepath}")
        return
    
    with open(abs_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split frontmatter
    parts = content.split('---')
    if len(parts) >= 3:
        frontmatter = parts[1]
        body = '---'.join(parts[2:])
    else:
        frontmatter = ""
        body = content

    # Word count of body
    words = body.split()
    word_count = len(words)
    
    # Check em-dashes
    em_dashes = re.findall(r'—|\u2014', content)
    
    # Check forbidden starting words
    forbidden_starts = []
    pattern = r'(?:[\.\?\!]\s+|\n\n|^)(Tapi|Dan|Karena|Sehingga)\b'
    for match in re.finditer(pattern, body):
        forbidden_starts.append(match.group(1))

    # Check for pronouns "ia" or "dia"
    pronouns = re.findall(r'\b(ia|dia)\b', body, re.IGNORECASE)

    print(f"File: {filepath}")
    print(f"  Word count of body: {word_count}")
    print(f"  Em-dashes count: {len(em_dashes)}")
    print(f"  Forbidden sentence-starting conjunctions: {forbidden_starts}")
    print(f"  Pronouns (ia/dia): {len(pronouns)} times (check context to see if they refer to inanimate objects)")
    print("-" * 50)

if __name__ == '__main__':
    for f in files_to_check:
        analyze_file(f)
