import os
import json
import re

EXTENSION_DIR = "TeamFlow_Extension"
MANIFEST_FILE = "manifest.json"

def check_file_exists(path):
    if os.path.exists(path):
        print(f"✅ Found: {path}")
        return True
    else:
        print(f"❌ MISSING: {path}")
        return False

def check_syntax_balance(path):
    """Checks for balanced braces and parentheses as a proxy for syntax validity."""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        
        for char in content:
            if char in '({[':
                stack.append(char)
            elif char in ')}]':
                if not stack or stack[-1] != pairs[char]:
                    print(f"❌ SYNTAX ERROR in {path}: Unbalanced '{char}'")
                    return False
                stack.pop()
        
        if stack:
            print(f"❌ SYNTAX ERROR in {path}: Unclosed '{stack[-1]}'")
            return False
            
        print(f"✅ Syntax OK: {path}")
        return True
    except Exception as e:
        print(f"⚠️ Could not read {path}: {e}")
        return False

def verify_manifest():
    print("\n--- Verifying Manifest ---")
    if not check_file_exists(MANIFEST_FILE):
        return False

    try:
        with open(MANIFEST_FILE, 'r') as f:
            manifest = json.load(f)
        
        handlers = []
        
        # Collect all handler paths
        if "bot" in manifest:
            handlers.append(manifest["bot"]["handler"])
        
        if "commands" in manifest:
            for cmd in manifest["commands"]:
                handlers.append(cmd["handler"])
                
        if "widget" in manifest:
            handlers.append(manifest["widget"]["handler"])

        # Verify each handler file exists
        all_valid = True
        for handler in handlers:
            # Manifest paths are relative to root, e.g. "TeamFlow_Extension/..."
            # Adjust if necessary based on your folder structure
            # In our case, manifest paths seem to be relative to the zip root
            # Let's assume the manifest paths match the local file structure
            if not check_file_exists(handler):
                all_valid = False
            else:
                if handler.endswith(".dg"):
                    if not check_syntax_balance(handler):
                        all_valid = False
        
        return all_valid

    except json.JSONDecodeError:
        print(f"❌ INVALID JSON: {MANIFEST_FILE}")
        return False

def main():
    print("🚀 Starting Build Verification...\n")
    
    # Check Core Directories
    dirs = ["TeamFlow_Extension/Bots", "TeamFlow_Extension/Commands", "TeamFlow_Extension/Widgets", "TeamFlow_Extension/Functions"]
    for d in dirs:
        check_file_exists(d)

    # Verify Manifest and Handlers
    if verify_manifest():
        print("\n✅ BUILD VERIFICATION PASSED!")
        print("The extension structure is valid and ready for deployment.")
    else:
        print("\n❌ BUILD VERIFICATION FAILED.")
        print("Please fix the missing files or syntax errors before deploying.")

if __name__ == "__main__":
    main()
