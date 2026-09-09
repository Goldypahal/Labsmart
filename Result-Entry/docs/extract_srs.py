import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(path):
    all_text = []
    with zipfile.ZipFile(path) as document:
        for name in document.namelist():
            if name.endswith('.xml'):
                try:
                    xml_content = document.read(name)
                    tree = ET.XML(xml_content)
                    for elem in tree.iter():
                        if elem.tag.endswith('}t'):
                            if elem.text:
                                all_text.append(elem.text)
                except Exception:
                    continue
    return '\n'.join(all_text)

if __name__ == "__main__":
    text = get_docx_text('PathLab_LIMS_SRS_v1.0.docx')
    with open('srs_content.txt', 'w', encoding='utf-8') as f:
        f.write(text)
