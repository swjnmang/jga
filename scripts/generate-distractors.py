#!/usr/bin/env python3
"""
Automatically generate distractors for quiz cards using OpenAI API.
Reads card files, generates 3 logical distractors per question, and updates the files.
"""

import re
import os
import json
from pathlib import Path
from openai import OpenAI

# Initialize OpenAI client (set OPENAI_API_KEY environment variable)
client = OpenAI()

# Categories that need distractors (exclude music, countries, schaetzfragen)
CATEGORIES_TO_PROCESS = [
    'naturTechnikCards.ts',
    'filmSerienCards.ts',
    'triviaExtraCards.ts',
    # Add more as needed
]

def extract_cards_from_file(file_path):
    """Extract all card objects from a TypeScript file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all card objects using regex
    pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],.*?answer:\s*[\'"]([^\'"]+)[\'"].*?\}'
    matches = re.finditer(pattern, content, re.DOTALL)
    
    cards = []
    for match in matches:
        full_match = match.group(0)
        card_id = match.group(1)
        answer = match.group(2)
        
        # Check if it already has distractors
        if 'distractors:' not in full_match:
            # Extract question (cue)
            cue_match = re.search(r'cue:\s*[\'"]([^\'"]+)[\'"]', full_match)
            cue = cue_match.group(1) if cue_match else ""
            
            cards.append({
                'id': card_id,
                'cue': cue,
                'answer': answer,
                'full_text': full_match,
                'start_pos': match.start(),
                'end_pos': match.end()
            })
    
    return cards, content

def generate_distractors(cue, answer):
    """Generate 3 logical distractors using OpenAI API."""
    prompt = f"""Du bist ein Experte für Quiz-Fragen. Erstelle 3 falsche, aber plausible Antworten (Distraktoren) für diese Frage:

Frage: {cue}
Korrekte Antwort: {answer}

Anforderungen:
1. Die Distraktoren müssen thematisch zur Frage passen
2. Sie müssen die gleiche Form/Einheit wie die korrekte Antwort haben
3. Sie dürfen nicht offensichtlich falsch sein
4. Sie müssen auf Deutsch sein
5. Format: Genau wie die korrekte Antwort (mit/ohne Punkt am Ende, etc.)

Beispiele:
- Frage: "Welcher Stern ist der Erde am nächsten?" / Antwort: "Die Sonne." 
  → Distraktoren: ["Proxima Centauri.", "Sirius.", "Alpha Centauri."]
- Frage: "Wie viele Beine haben Insekten?" / Antwort: "Sechs."
  → Distraktoren: ["Acht.", "Vier.", "Zehn."]

Antworte NUR mit einem JSON-Array der 3 Distraktoren, nichts anderes:
["Distraktor 1", "Distraktor 2", "Distraktor 3"]"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Du bist ein Quiz-Experte. Antworte immer nur mit einem JSON-Array."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        result = response.choices[0].message.content.strip()
        # Parse JSON
        distractors = json.loads(result)
        
        if len(distractors) != 3:
            print(f"  ⚠️  Warning: Expected 3 distractors, got {len(distractors)}")
            return None
        
        return distractors
    
    except Exception as e:
        print(f"  ❌ Error generating distractors: {e}")
        return None

def add_distractors_to_card(card_text, distractors):
    """Add distractors field to a card object."""
    # Find the position before the closing brace
    # Look for the last property before }
    sources_match = re.search(r'(sources:\s*\{[^}]*\})', card_text)
    if sources_match:
        insert_pos = sources_match.end()
        distractors_str = f", distractors: {json.dumps(distractors, ensure_ascii=False)}"
        new_card = card_text[:insert_pos] + distractors_str + card_text[insert_pos:]
        return new_card
    
    return card_text

def process_file(file_path):
    """Process a single card file and add distractors."""
    print(f"\n📁 Processing: {file_path.name}")
    
    cards, original_content = extract_cards_from_file(file_path)
    print(f"   Found {len(cards)} cards without distractors")
    
    if not cards:
        print("   ✅ All cards already have distractors!")
        return
    
    # Process cards in reverse order to maintain positions
    new_content = original_content
    offset = 0
    
    for i, card in enumerate(cards, 1):
        print(f"   [{i}/{len(cards)}] {card['id'][:50]}...", end=" ")
        
        distractors = generate_distractors(card['cue'], card['answer'])
        
        if distractors:
            # Update the card text
            old_text = card['full_text']
            new_text = add_distractors_to_card(old_text, distractors)
            
            # Replace in content
            start = card['start_pos'] + offset
            end = card['end_pos'] + offset
            new_content = new_content[:start] + new_text + new_content[end:]
            offset += len(new_text) - len(old_text)
            
            print("✅")
        else:
            print("❌ Skipped")
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"   💾 File updated!")

def main():
    """Main entry point."""
    print("🚀 Distractor Generator")
    print("=" * 60)
    
    # Check for API key
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ Error: OPENAI_API_KEY environment variable not set!")
        print("   Set it with: $env:OPENAI_API_KEY='your-api-key'")
        return
    
    lib_dir = Path(__file__).parent.parent / 'lib'
    
    for filename in CATEGORIES_TO_PROCESS:
        file_path = lib_dir / filename
        
        if not file_path.exists():
            print(f"⚠️  Skipping {filename} (file not found)")
            continue
        
        try:
            process_file(file_path)
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("✅ Done! Run 'npm run build' to verify.")

if __name__ == '__main__':
    main()
