# Imported
import bcrypt
from cryptography.fernet import Fernet

# Variables
key = Fernet.generate_key()
fernet = Fernet(key)

# Classes
# CLASS: Handles password hashing and verification using bcrypt.  Hashes are one-way and cannot be decrypted - only verified.
class HASH:
    def __init__(self):
        pass
    # FUNCTION: Hash a password using bcrypt with a unique random salt.  The resulting hash can be stored securely (e.g., in a database).
    def createHash(self, password: str) -> bytes:
        #Hash a password using bcrypt
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed
    # FUNCTION: Verify a plaintext password against an existing bcrypt hash.  Returns True if the password matches the hash, otherwise False.
    def verifyHash(self, password: str, hashed: bytes) -> bool:
        #Verify a password against an existing hash
        return bcrypt.checkpw(password.encode('utf-8'), hashed)
        
# CLASS: Provides symmetric encryption and decryption of data using Fernet (AES).  Encrypted data can be safely decrypted later using the same key.
class DECRYPT:
    def __init__(self):
        pass
    # FUNCTION: Encrypt data using Fernet (AES symmetric encryption).  Returns an encrypted byte string safe for storage or transmission.
    def encryptData(self, data: str) -> bytes:
        #Encrypt data using Fernet (AES symmetric encryption)
        return fernet.encrypt(data.encode('utf-8'))
    # FUNCTION: Decrypt previously encrypted data using the same Fernet key.  Returns the original plaintext string.
    def decryptData(self, token: bytes) -> str:
        #Decrypt data using Fernet
        return fernet.decrypt(token).decode('utf-8')