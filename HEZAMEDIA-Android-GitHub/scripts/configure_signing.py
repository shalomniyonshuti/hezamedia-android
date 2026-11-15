"""Inject release signing only in CI when all four secrets are provided."""
import os, base64
from pathlib import Path
keys=['HEZA_KEYSTORE_BASE64','HEZA_KEYSTORE_PASSWORD','HEZA_KEY_ALIAS','HEZA_KEY_PASSWORD']
if not all(os.environ.get(k) for k in keys):
    print('No complete signing secrets: release bundle will be unsigned; NOT uploadable to Play Console.')
    raise SystemExit(0)
app=Path('android/app'); gradle=app/'build.gradle'
if not gradle.exists():
    raise SystemExit('Expected Capacitor-generated android/app/build.gradle')
(app/'heza-upload.jks').write_bytes(base64.b64decode(os.environ['HEZA_KEYSTORE_BASE64'],validate=True))
# Gradle props use environment variables: no credentials written to source.
s=gradle.read_text()
anchor='android {'
if anchor not in s: raise SystemExit('Gradle signing config insertion point not found')
s=s.replace(anchor,"""android {
    signingConfigs {
        hezaRelease {
            storeFile file('heza-upload.jks')
            storePassword System.getenv('HEZA_KEYSTORE_PASSWORD')
            keyAlias System.getenv('HEZA_KEY_ALIAS')
            keyPassword System.getenv('HEZA_KEY_PASSWORD')
        }
    }
""",1)
# Capacitor template has release { minifyEnabled ... }; add signing to release buildType.
if 'release {' not in s: raise SystemExit('Release buildType not found')
s=s.replace('release {','release {\n            signingConfig signingConfigs.hezaRelease',1)
gradle.write_text(s)
print('Release signing configured using GitHub encrypted secrets.')
