"""
Database Factory Pattern Implementation

Even though there is only one type of database used currently (SQLite),
the system implements a factory pattern for the database so that it is 
easier to add another type of database such as MongoDB if there is a 
need for it in the future.
"""

from abc import ABC, abstractmethod
import sqlite3
from typing import Any


class DatabaseInterface(ABC):
    """Abstract base class for database implementations."""
    
    connection: Any
    
    @abstractmethod
    def connect(self, database_path: str):
        """Establish database connection."""
        pass
    
    @abstractmethod
    def get_connection(self) -> Any:
        """Get the database connection."""
        pass
    
    @abstractmethod
    def close(self):
        """Close the database connection."""
        pass


class SQLiteDatabase(DatabaseInterface):
    """SQLite database implementation."""
    
    def __init__(self):
        self.connection = None
    
    def connect(self, database_path: str):
        """
        Connect to SQLite database.
        
        Args:
            database_path: Path to SQLite database file
        """
        self.connection = sqlite3.connect(
            database_path,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        self.connection.row_factory = sqlite3.Row
    
    def get_connection(self) -> sqlite3.Connection:
        """Get SQLite connection."""
        return self.connection
    
    def close(self):
        """Close SQLite connection."""
        if self.connection:
            self.connection.close()
            self.connection = None


class MongoDatabase(DatabaseInterface):
    """
    MongoDB database implementation (future extension).
    
    To use: Install pymongo and implement the methods below.
    Example: pip install pymongo
    """
    
    def __init__(self):
        self.connection = None
        self.client = None
        self.db = None
    
    def connect(self, database_path: str):
        """
        Connect to MongoDB database.
        
        Args:
            database_path: MongoDB connection string (e.g., "mongodb://localhost:27017/dbname")
        """
        # Uncomment when pymongo is installed:
        # from pymongo import MongoClient
        # self.client = MongoClient(database_path)
        # db_name = database_path.split('/')[-1]  # Extract database name from URI
        # self.db = self.client[db_name]
        # self.connection = self.db
        
        raise NotImplementedError("MongoDB support not yet implemented. Install pymongo first.")
    
    def get_connection(self) -> Any:
        """Get MongoDB database instance."""
        if self.connection is None:
            raise NotImplementedError("MongoDB support not yet implemented.")
        return self.connection
    
    def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            self.connection = None


class PostgreSQLDatabase(DatabaseInterface):
    """
    PostgreSQL database implementation (future extension).
    
    To use: Install psycopg2 and implement the methods below.
    Example: pip install psycopg2-binary
    """
    
    def __init__(self):
        self.connection = None
    
    def connect(self, database_path: str):
        """
        Connect to PostgreSQL database.
        
        Args:
            database_path: PostgreSQL connection string 
                          (e.g., "postgresql://user:password@localhost/dbname")
        """
        # Uncomment when psycopg2 is installed:
        # import psycopg2
        # self.connection = psycopg2.connect(database_path)
        
        raise NotImplementedError("PostgreSQL support not yet implemented. Install psycopg2 first.")
    
    def get_connection(self) -> Any:
        """Get PostgreSQL connection."""
        if self.connection is None:
            raise NotImplementedError("PostgreSQL support not yet implemented.")
        return self.connection
    
    def close(self):
        """Close PostgreSQL connection."""
        if self.connection:
            self.connection.close()
            self.connection = None


class DatabaseFactory:
    """
    Factory class for creating database instances.
    
    Usage:
        # Get SQLite database (current)
        db = DatabaseFactory.getDatabase('sqlite')
        db.connect('./instance/localconnectusers.sqlite')
        
        # Future: Get MongoDB database
        db = DatabaseFactory.getDatabase('mongodb')
        db.connect('mongodb://localhost:27017/localconnect')
    """
    
    @staticmethod
    def getDatabase(type: str) -> DatabaseInterface:
        """
        Create and return appropriate database instance.
        
        Args:
            type: Database type - "sqlite", "mongodb", or "postgresql"
        
        Returns:
            DatabaseInterface implementation
        
        Examples:
            >>> db = DatabaseFactory.getDatabase('sqlite')
            >>> db = DatabaseFactory.getDatabase('mongodb')
            >>> db = DatabaseFactory.getDatabase('postgresql')
        """
        match type.lower():
            case 'sqlite':
                return SQLiteDatabase()
            case 'mongodb' | 'mongo':
                return MongoDatabase()
            case 'postgresql' | 'postgres':
                return PostgreSQLDatabase()
            case _:
                # Default to SQLite
                return SQLiteDatabase()
