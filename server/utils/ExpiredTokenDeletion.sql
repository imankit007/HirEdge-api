CREATE PROCEDURE `deleteExpiredTokens` ()
BEGIN
delete from auth
where expiryAt > GETDATE();
END
