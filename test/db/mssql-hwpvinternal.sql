USE [master]
GO

IF DB_ID('hwpvinternal') IS NOT NULL
  DROP DATABASE [hwpvinternal];
  GO

CREATE DATABASE [hwpvinternal];
GO

USE [hwpvinternal]
GO
