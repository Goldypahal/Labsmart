import zipfile
import xml.etree.ElementTree as ET
import sys

def get_docx_text(path):
    try:
        with zipfile.ZipFile(path) as document:
            xml_content = document.read('word/document.xml')
            tree = ET.XML(xml_content)
            
            # Using a wildcard namespace to capture all text
            all_text = []
            for elem in tree.iter():
                if elem.tag.endswith('}t'):
                    if elem.text:
                        all_text.append(elem.text)
            
            # Grouping into paragraphs loosely by checking for 'p' tags
            full_text = []
            current_para = []
            for elem in tree.iter():
                if elem.tag.endswith('}p'):
                    if current_para:
                        full_text.append(''.join(current_para))
                        current_para = []
                elif elem.tag.endswith('}t'):
                    if elem.text:
                        current_para.append(elem.text)
            if current_para:
                full_text.append(''.join(current_para))
            
            return '\n'.join(full_text)
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(get_docx_text(sys.argv[1]))
    else:
        print("Usage: python read_srs.py <path_to_docx>")
